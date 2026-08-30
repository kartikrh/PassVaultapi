const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  findClientByGoogleIdQuery,
  findClientByEmailQuery,
  findClientByUsernameQuery,
  findClientByIdQuery,
  getClientAuthByEmailQuery,
  getClientAuthByUsernameQuery,
  getDefaultPackageIdQuery,
  insertClientQuery,
  touchClientUpdatedAtQuery,
  updateClientPasswordHashQuery,
  updateClientProfileQuery,
  updateClientEmailVerifiedQuery,
} = require("../repository/TableClient");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const { VaultActivityCodes, VaultClientProvider } = require("../utilities/vaultConstants");
const { sendMail } = require("../utilities/mailer");

const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const USERNAME_UNIQUE_INDEX = "idxClientUsernameUnique";
const MOBILE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;
const MAX_ADDRESS_LENGTH = 500;

const validateUsername = (username) => {
  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    throw new Error(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`);
  }
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error("Username can only contain letters, numbers, underscores, and periods");
  }
};

// No fixed clientId here -- sign-in tokens are verified per-whitelabel below
// (each domain can configure its own Google Client ID). Drive's OAuth flow
// (utilities/googleDrive.js) reuses this same per-whitelabel client.
const googleClient = new OAuth2Client();

const generateClientToken = (client) => {
  const secretKey = process.env.VAULT_CLIENT_SECRET_KEY_TOKEN;
  if (!secretKey) {
    throw new Error("VAULT_CLIENT_SECRET_KEY_TOKEN is not configured");
  }
  return jwt.sign(
    { WrClientId: client.clientId, WrEmail: client.email },
    secretKey,
    { expiresIn: process.env.VAULT_CLIENT_TOKEN_EXPIRY_TIME || "7d" }
  );
};

const verifyGoogleIdToken = async (idToken, audience) => {
  if (!audience) {
    throw new Error("Google Sign-In is not configured for this domain");
  }
  const ticket = await googleClient.verifyIdToken({ idToken, audience });
  return ticket.getPayload();
};

// Registers or logs in a client via a Google ID token (POST /vault/auth/google).
// Creates tblClient on first sign-in, matching the spec's onboarding flow.
const googleSignInService = async (request, fastify) => {
  const { idToken } = request.body || {};
  if (!idToken) {
    throw new Error("idToken is required");
  }

  // Verified against this domain's own configured Google Client ID (White
  // Label > Google Client ID), not a single global env var -- each domain
  // can use a different Google OAuth client.
  const whitelabel = resolveWhitelabelFromRequest(request);
  const payload = await verifyGoogleIdToken(idToken, whitelabel?.googleKey);
  if (!payload?.sub || !payload?.email) {
    throw new Error("Invalid Google token");
  }

  let client = await findClientByGoogleIdQuery(payload.sub, fastify);
  let isNewClient = false;

  if (!client) {
    client = await findClientByEmailQuery(payload.email, fastify);
  }

  if (!client) {
    const defaultPackageId = await getDefaultPackageIdQuery(fastify);
    client = await insertClientQuery(
      {
        name: payload.name || null,
        email: payload.email,
        googleId: payload.sub,
        provider: VaultClientProvider.GOOGLE,
        isEmailVerified: !!payload.email_verified,
        packageId: defaultPackageId,
        whitelabelId: whitelabel?.id || null,
      },
      fastify
    );
    isNewClient = true;
  } else {
    await touchClientUpdatedAtQuery(client.clientId, fastify);
  }

  if (!client.isActive) {
    throw new Error("This account has been suspended");
  }

  await insertClientActivityLogQuery(
    {
      activityType: isNewClient ? VaultActivityCodes.CLIENT_REGISTERED : VaultActivityCodes.CLIENT_LOGGED_IN,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
    },
    fastify
  );

  const token = generateClientToken(client);
  return { token, client };
};

// Email-verification and password-reset links carry a short-lived, single-
// purpose JWT (same secret as session tokens -- no new env var) rather than
// a stored token: the vault client design is already fully stateless
// (see refreshTokenService/logoutService below), and a `purpose` claim keeps
// this kind of token from being replayed as a session token or vice versa.
const generatePurposeToken = (clientId, purpose, expiresIn) => {
  const secretKey = process.env.VAULT_CLIENT_SECRET_KEY_TOKEN;
  if (!secretKey) {
    throw new Error("VAULT_CLIENT_SECRET_KEY_TOKEN is not configured");
  }
  return jwt.sign({ WrClientId: clientId, purpose }, secretKey, { expiresIn });
};

const verifyPurposeToken = (token, purpose) => {
  const secretKey = process.env.VAULT_CLIENT_SECRET_KEY_TOKEN;
  let decoded;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error("This link has expired or is invalid");
  }
  if (decoded.purpose !== purpose) {
    throw new Error("This link is invalid");
  }
  return decoded;
};

const clientAppUrl = () => process.env.VAULT_CLIENT_APP_URL || "";

// Matches the client's own domain-matching logic (see passvault-client's
// pickWhitelabel) so a client is tagged with the same White Label their
// frontend resolved -- without requiring the frontend to pass an id.
const resolveWhitelabelFromRequest = (request) => {
  let origin = request.headers?.origin || null;
  if (!origin && request.headers?.referer) {
    try {
      origin = new URL(request.headers.referer).origin;
    } catch (err) {
      origin = null;
    }
  }
  const list = global.tblWhitelabels || [];
  return (
    (origin && list.find((item) => item.domain === origin && item.isActive)) ||
    list.find((item) => item.isDefault && item.isActive) ||
    null
  );
};

const getWhitelabelMailSettingId = (whitelabelId) => {
  if (!whitelabelId) return null;
  const whitelabel = (global.tblWhitelabels || []).find((item) => item.id == whitelabelId);
  return whitelabel?.mailSettingId || null;
};

// POST /vault/auth/register -- collects name+email only. No password yet:
// the client sets one after verifying their email (setPasswordService),
// which also doubles as the self-service "add a password" action a
// Google-only account can use later.
const registerService = async (request, fastify) => {
  const { name, email } = request.body || {};
  if (!email) {
    throw new Error("email is required");
  }

  const existing = await findClientByEmailQuery(email, fastify);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const whitelabel = resolveWhitelabelFromRequest(request);
  const defaultPackageId = await getDefaultPackageIdQuery(fastify);
  const client = await insertClientQuery(
    {
      name: name || null,
      email,
      googleId: null,
      provider: VaultClientProvider.EMAIL,
      isEmailVerified: false,
      packageId: defaultPackageId,
      whitelabelId: whitelabel?.id || null,
    },
    fastify
  );

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_REGISTERED,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
    },
    fastify
  );

  const verifyToken = generatePurposeToken(client.clientId, "verify-email", "1d");
  const verifyUrl = `${clientAppUrl()}/verify-email?token=${verifyToken}`;

  await sendMail({
    to: email,
    subject: "Welcome to PassVault -- verify your email",
    text: `Hi ${name || "there"},\n\nWelcome to PassVault! Verify your email to finish creating your account:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`,
    mailSettingId: whitelabel?.mailSettingId,
  });

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.EMAIL_VERIFICATION_SENT,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
    },
    fastify
  );

  return { registered: true, email };
};

// POST /vault/auth/verifyEmail -- confirms the token, marks the email
// verified, and signs the client in (they still have no password at this
// point; the frontend routes straight to "Set Password").
const verifyEmailService = async (request, fastify) => {
  const { token } = request.body || {};
  if (!token) {
    throw new Error("token is required");
  }

  const decoded = verifyPurposeToken(token, "verify-email");
  await updateClientEmailVerifiedQuery(decoded.WrClientId, fastify);

  const client = await findClientByIdQuery(decoded.WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.EMAIL_VERIFIED,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
    },
    fastify
  );

  const authToken = generateClientToken(client);
  return { token: authToken, client: { ...client, isEmailVerified: true } };
};

// POST /vault/auth/setPassword -- authenticated. Completes an email-verified
// signup, and separately doubles as the "add a password" action a
// Google-only client can trigger later from Settings.
const setPasswordService = async (request, fastify) => {
  const { newPassword } = request.body || {};
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  if (!client.isEmailVerified) {
    throw new Error("Please verify your email first");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateClientPasswordHashQuery(WrClientId, passwordHash, fastify);

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PASSWORD_SET,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  return { passwordSet: true };
};

// POST /vault/auth/login -- identifier (email OR username) + password.
// identifier is routed by shape (contains "@" -> email lookup, otherwise
// username lookup) rather than trying both queries, so a username that
// happens to collide with someone else's email string can't cross-match.
// Rejects unverified accounts and Google-only accounts (null password
// hash) with a message telling the client what to do instead, rather than
// a generic failure.
const loginService = async (request, fastify) => {
  const { identifier, email, password } = request.body || {};
  const loginIdentifier = identifier || email;
  if (!loginIdentifier || !password) {
    throw new Error("email/username and password are required");
  }

  const client = loginIdentifier.includes("@")
    ? await getClientAuthByEmailQuery(loginIdentifier, fastify)
    : await getClientAuthByUsernameQuery(loginIdentifier, fastify);
  if (!client) {
    throw new Error("Invalid email/username or password");
  }
  if (!client.isActive) {
    throw new Error("This account has been suspended");
  }
  if (!client.isEmailVerified) {
    throw new Error("Please verify your email before logging in");
  }
  if (!client.passwordHash) {
    throw new Error('This account signs in with Google -- use "Continue with Google" instead');
  }

  const passwordMatches = await bcrypt.compare(password, client.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid email/username or password");
  }

  await touchClientUpdatedAtQuery(client.clientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_LOGGED_IN,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
    },
    fastify
  );

  const { passwordHash, ...clientWithoutHash } = client;
  const token = generateClientToken(clientWithoutHash);
  return { token, client: clientWithoutHash };
};

// POST /vault/auth/forgotPassword -- always responds the same way whether or
// not the email exists, so the endpoint can't be used to enumerate accounts.
const forgotPasswordService = async (request, fastify) => {
  const { email } = request.body || {};
  if (!email) {
    throw new Error("email is required");
  }

  const client = await findClientByEmailQuery(email, fastify);
  if (client) {
    const resetToken = generatePurposeToken(client.clientId, "reset-password", "1h");
    const resetUrl = `${clientAppUrl()}/reset-password?token=${resetToken}`;

    await sendMail({
      to: email,
      subject: "Reset your PassVault password",
      text: `We received a request to reset your PassVault password. Reset it here:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      mailSettingId: getWhitelabelMailSettingId(client.whitelabelId),
    });

    await insertClientActivityLogQuery(
      {
        activityType: VaultActivityCodes.PASSWORD_RESET_REQUESTED,
        refId: String(client.clientId),
        ipAddress: request.ip,
        clientId: client.clientId,
      },
      fastify
    );
  }

  return { sent: true };
};

// POST /vault/auth/resetPassword -- for a client who already has a password
// and forgot it (setPasswordService covers first-time and add-a-password).
const resetPasswordService = async (request, fastify) => {
  const { token, newPassword } = request.body || {};
  if (!token || !newPassword) {
    throw new Error("token and newPassword are required");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const decoded = verifyPurposeToken(token, "reset-password");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateClientPasswordHashQuery(decoded.WrClientId, passwordHash, fastify);

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PASSWORD_RESET_COMPLETED,
      refId: String(decoded.WrClientId),
      ipAddress: request.ip,
      clientId: decoded.WrClientId,
    },
    fastify
  );

  return { reset: true };
};

// GET /vault/auth/profile -- the signed-in client's own profile, for the
// Profile screen (name/username/email/provider/verification/hasPassword).
// Google Drive connection status is deliberately not folded in here --
// that's its own concern with its own endpoint (GET /vault/auth/drive/status).
const getProfileService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  return { client };
};

// PUT /vault/auth/profile -- update name, username, mobile number and/or
// address. Name/mobileNo/address can change any time; username can only
// ever be SET ONCE -- once currentClient.username is non-null, any further
// attempt to change it (to a different value) is rejected, even though the
// request itself still succeeds for the other fields. Username must be
// unique (case-insensitively) among active clients while it's still
// settable -- checked here for a friendly error message, but the DB's
// unique index (sql/vault/003_client_username.sql) is what actually
// guarantees it under a race between two concurrent requests. mobileNo/
// address carry no uniqueness constraint (sql/vault/004_client_contact_info.sql).
const updateProfileService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { name, username, mobileNo, address } = request.body || {};

  if (mobileNo && !MOBILE_PATTERN.test(mobileNo)) {
    throw new Error("Please enter a valid mobile number");
  }
  if (address && address.length > MAX_ADDRESS_LENGTH) {
    throw new Error(`Address must be ${MAX_ADDRESS_LENGTH} characters or fewer`);
  }

  const currentClient = await findClientByIdQuery(WrClientId, fastify);
  if (!currentClient) {
    throw new Error("Account not found");
  }

  let usernameToSave;
  if (currentClient.username) {
    if (username && username !== currentClient.username) {
      throw new Error("Your username has already been set and cannot be changed");
    }
    // Already set and either omitted or resubmitted unchanged -- leave
    // wrUsername untouched (usernameToSave stays undefined -> COALESCE
    // no-op in updateClientProfileQuery).
  } else if (username) {
    validateUsername(username);
    const existing = await findClientByUsernameQuery(username, fastify, WrClientId);
    if (existing) {
      throw new Error("This username is already taken");
    }
    usernameToSave = username;
  }

  try {
    await updateClientProfileQuery(
      WrClientId,
      { name, username: usernameToSave, mobileNo, address },
      fastify
    );
  } catch (err) {
    if (err.message?.includes(USERNAME_UNIQUE_INDEX)) {
      throw new Error("This username is already taken");
    }
    throw err;
  }

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PROFILE_UPDATED,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  const client = await findClientByIdQuery(WrClientId, fastify);
  return { client };
};

// POST /vault/auth/changePassword -- authenticated, requires the current
// password. Distinct from setPasswordService, which covers the no-password-
// yet cases (first-time signup, adding a password to a Google-only account)
// and so has nothing to verify against.
const changePasswordService = async (request, fastify) => {
  const { currentPassword, newPassword } = request.body || {};
  if (!currentPassword || !newPassword) {
    throw new Error("currentPassword and newPassword are required");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const { WrClientId, WrEmail } = request.clientTokenInfo;
  const client = await getClientAuthByEmailQuery(WrEmail, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  if (!client.passwordHash) {
    throw new Error('This account has no password yet -- use "Set Password" instead');
  }

  const currentPasswordMatches = await bcrypt.compare(currentPassword, client.passwordHash);
  if (!currentPasswordMatches) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateClientPasswordHashQuery(WrClientId, passwordHash, fastify);

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PASSWORD_CHANGED,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  return { changed: true };
};

const refreshTokenService = async (request) => {
  const { WrClientId, WrEmail } = request.clientTokenInfo;
  return { token: generateClientToken({ clientId: WrClientId, email: WrEmail }) };
};

// Vault client sessions are stateless JWTs -- the spec's schema has no
// session table for clients (unlike tblUserLoginInfos for staff), so there
// is nothing server-side to revoke yet; the client discards its token.
const logoutService = async () => {
  return { loggedOut: true };
};

module.exports = {
  googleSignInService,
  refreshTokenService,
  logoutService,
  generateClientToken,
  registerService,
  verifyEmailService,
  setPasswordService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  resolveWhitelabelFromRequest,
};
