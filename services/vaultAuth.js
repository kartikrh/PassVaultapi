const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const {
  findClientByGoogleIdQuery,
  findClientByEmailQuery,
  findClientByUsernameQuery,
  findClientByIdQuery,
  getClientAuthByEmailQuery,
  getClientAuthByUsernameQuery,
  getDefaultPackageIdQuery,
  getClientPackageQuery,
  insertClientQuery,
  touchClientUpdatedAtQuery,
  updateClientPasswordHashQuery,
  updateClientProfileQuery,
  updateClientEmailVerifiedQuery,
  getClientOtpSecretQuery,
  updateClientOtpSecretQuery,
  resetClientOtpQuery,
  incrementFailedLoginAttemptsQuery,
  resetFailedLoginAttemptsQuery,
  reactivateClientQuery,
} = require("../repository/TableClient");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const { listClientActivityLogsQuery } = require("../repository/TableClientHistory");
const { VaultActivityCodes, VaultClientProvider } = require("../utilities/vaultConstants");
const { sendMail } = require("../utilities/mailer");
const { sendTemplateMail, buildLogoHtml } = require("../utilities/templateMailer");
const { OTPType } = require("../utilities/otpConstants");
const { generateTotpSecret, buildTotpKeyUri, generateQrCodeDataUrl, verifyTotpCode } = require("../utilities/totp");
const { encrypt, decrypt, deviceInfo, templateType, getConfigValue, computePackageExpiryDate } = require("../utilities/index");
const configConstants = require("../utilities/configConstants");
const { checkVpn } = require("../utilities/vpnCheck");
const { errorLogger } = require("../utilities/logger");

// Wrong-password lockout (loginService): after this many consecutive failed
// attempts, the account can't try again until the lockout window passes.
const MAX_FAILED_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCKOUT_HOURS = 24;

// Every login-completing request (login, google, register) must carry the
// browser's GPS coordinates -- passvault-client's useGeolocation hook
// gates the whole form behind a LocationRequiredModal until
// navigator.geolocation.getCurrentPosition() succeeds, so a request that
// reaches here without them is either a stale/hand-crafted client or a
// direct API call, not the real login flow. Range-checked so a client bug
// (or malicious caller) can't slip in garbage that later reads back as a
// bogus point on a map.
const requireGeolocation = (body) => {
  const { latitude, longitude } = body || {};
  if (typeof latitude !== "number" || typeof longitude !== "number" || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Location access is required to continue -- please enable location and try again");
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Invalid location coordinates");
  }
  return { latitude, longitude };
};

// Blocks login/signup while a VPN/proxy is detected on request.ip (see
// utilities/vpnCheck.js -- fails open on any check failure, so a
// proxycheck.io outage or missing config never locks out real clients).
const requireNoVpn = async (request) => {
  const { isVpn } = await checkVpn(request.ip);
  if (isVpn) {
    throw new Error("A VPN or proxy was detected. Please disable it and try again.");
  }
};

// Server-side half of the login form's reCAPTCHA (LoginForm.js only renders
// the widget -- and only requires a token -- once White Label's
// isRecatchEnable + recatchKey are both set for this domain; see its
// recaptchaRequired). Mirrors that same gate here so a caller can't just
// skip the widget and hit /vault/auth/login directly. Verified against
// Google's siteverify with the *secret* key (recatchSecret, encrypted at
// rest, never sent to the browser) -- not recatchKey, which is public.
// Unlike requireNoVpn, this fails CLOSED on a verification error: the
// operator explicitly turned reCAPTCHA on for this domain, so a
// Google-side outage should block login, not silently bypass the check.
const requireRecaptcha = async (request, whitelabel) => {
  if (!whitelabel?.isRecatchEnable || !whitelabel?.recatchSecret) return;

  const { recaptchaToken } = request.body || {};
  if (!recaptchaToken) {
    throw new Error("Please complete the reCAPTCHA challenge");
  }

  try {
    const secret = await decrypt(whitelabel.recatchSecret);
    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret, response: recaptchaToken, remoteip: request.ip }, timeout: 5000 }
    );
    if (!data?.success) {
      throw new Error("reCAPTCHA verification failed, please try again");
    }
  } catch (err) {
    throw new Error("reCAPTCHA verification failed, please try again");
  }
};

// Called right where each login-completing path (loginService,
// googleSignInService, verifyOtpService) logs CLIENT_LOGGED_IN -- a
// self-suspended account (Profile > danger zone's Suspend Account, wholly
// separate from wrIsActive) is otherwise still allowed to authenticate;
// successfully doing so is exactly what lifts the suspension.
const reactivateIfSuspended = async (client, fastify, request) => {
  if (!client.isSelfSuspended) return;
  await reactivateClientQuery(client.clientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_REACTIVATED,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
      deviceInfo: deviceInfo(request),
    },
    fastify
  );
};

const TWO_FACTOR_PURPOSE = "two-factor";
const TWO_FACTOR_TOKEN_EXPIRY = "10m";
const MAIL_OTP_LENGTH = 6;

const generateNumericCode = (length = MAIL_OTP_LENGTH) => {
  let code = "";
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10);
  return code;
};

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
  const secretKey = getConfigValue(configConstants.VAULT_CLIENT_SECRET_KEY_TOKEN);
  if (!secretKey) {
    throw new Error("VAULT_CLIENT_SECRET_KEY_TOKEN config is not configured");
  }
  return jwt.sign(
    { WrClientId: client.clientId, WrEmail: client.email },
    secretKey,
    { expiresIn: getConfigValue(configConstants.VAULT_CLIENT_TOKEN_EXPIRY_TIME) || "7d" }
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
  const { latitude, longitude } = requireGeolocation(request.body);
  await requireNoVpn(request);

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
    const defaultPackage = global.tblPackages.find((item) => item.id === defaultPackageId);
    client = await insertClientQuery(
      {
        name: payload.name || null,
        email: payload.email,
        googleId: payload.sub,
        provider: VaultClientProvider.GOOGLE,
        isEmailVerified: !!payload.email_verified,
        packageId: defaultPackageId,
        whitelabelId: whitelabel?.id || null,
        packageExpiryDate: defaultPackage
          ? computePackageExpiryDate(defaultPackage.intervalType, defaultPackage.intervalCount)
          : null,
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

  if (isNewClient) {
    await insertClientActivityLogQuery(
      {
        activityType: VaultActivityCodes.CLIENT_REGISTERED,
        refId: String(client.clientId),
        ipAddress: request.ip,
        clientId: client.clientId,
        deviceInfo: deviceInfo(request),
        latitude,
        longitude,
      },
      fastify
    );
  }

  // Google sign-in is also a full authentication event, so it's gated by
  // 2FA the same way password login is (see loginService) -- the
  // CLIENT_LOGGED_IN log for a returning client is deferred to
  // verifyOtpService, same as the password flow.
  if (client.otpEnabled) {
    return beginTwoFactorChallenge(client, fastify, request, { latitude, longitude });
  }

  if (!isNewClient) {
    await reactivateIfSuspended(client, fastify, request);
    await insertClientActivityLogQuery(
      {
        activityType: VaultActivityCodes.CLIENT_LOGGED_IN,
        refId: String(client.clientId),
        ipAddress: request.ip,
        clientId: client.clientId,
        deviceInfo: deviceInfo(request),
        latitude,
        longitude,
      },
      fastify
    );
    // Fire-and-forget: a slow/unreachable SMTP server must not hold up the
    // login response for a best-effort notification email whose own
    // failures are already swallowed internally (see its try/catch above).
    sendSignInAlertEmail(client, request, latitude, longitude, fastify);
  }

  const token = generateClientToken(client);
  return { token, client };
};

// Email-verification and password-reset links carry a short-lived, single-
// purpose JWT (same secret as session tokens -- no new env var) rather than
// a stored token: the vault client design is already fully stateless
// (see refreshTokenService/logoutService below), and a `purpose` claim keeps
// this kind of token from being replayed as a session token or vice versa.
const generatePurposeToken = (clientId, purpose, expiresIn, extra = {}) => {
  const secretKey = getConfigValue(configConstants.VAULT_CLIENT_SECRET_KEY_TOKEN);
  if (!secretKey) {
    throw new Error("VAULT_CLIENT_SECRET_KEY_TOKEN config is not configured");
  }
  return jwt.sign({ WrClientId: clientId, purpose, ...extra }, secretKey, { expiresIn });
};

const verifyPurposeToken = (token, purpose) => {
  const secretKey = getConfigValue(configConstants.VAULT_CLIENT_SECRET_KEY_TOKEN);
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

const clientAppUrl = () => getConfigValue(configConstants.VAULT_CLIENT_APP_URL) || "";

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

// Shared by sendSignInAlertEmail and registerService's Welcome mail -- both
// fill a template's {{location}} from the same lat/long the client posted
// (requireGeolocation), so the formatting stays identical. Renders as a
// Google Maps link (opens in a new tab) rather than bare coordinates --
// {{location}} is in templateMailer.js's RAW_HTML_VARS so this markup
// survives HTML-escaping instead of showing up as literal tags.
const formatLocation = (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") return "Unknown";
  const lat = latitude.toFixed(4);
  const lng = longitude.toFixed(4);
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  return `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${lat}, ${lng}</a>`;
};

// Flat {{device}}/{{browser}} strings for a template, parsed out of the
// same deviceInfo(request) JSON already computed for the activity log --
// avoids re-running ua-parser-js a second time per request.
const describeDevice = (deviceInfoJson) => {
  const { browser, device } = JSON.parse(deviceInfoJson).browserInfo;
  return {
    browser: browser.name ? `${browser.name}${browser.version ? " " + browser.version : ""}` : "Unknown",
    device: (device.vendor || device.model)
      ? `${device.vendor || ""} ${device.model || ""}`.trim()
      : device.type || "Desktop",
  };
};

// Best-effort "new sign-in" alert (Template screen's Email > Sign In type)
// -- called everywhere CLIENT_LOGGED_IN is actually logged (loginService,
// googleSignInService's returning-client branch, verifyOtpService's
// non-enrollment branch). Wrapped in try/catch: unlike registerService's
// verification email, a broken mail setting or missing template here must
// never block a real login.
const sendSignInAlertEmail = async (client, request, latitude, longitude, fastify) => {
  try {
    const location = formatLocation(latitude, longitude);
    const { device, browser } = describeDevice(deviceInfo(request));
    await sendTemplateMail({
      type: templateType.SignIn,
      to: client.email,
      mailSettingId: getWhitelabelMailSettingId(client.whitelabelId),
      vars: {
        name: client.name || "there",
        ip: request.ip,
        location,
        device,
        browser,
        date: new Date().toUTCString(),
        logoHtml: buildLogoHtml(client.whitelabelId),
      },
    });
  } catch (err) {
    errorLogger(fastify, err.message, "sendSignInAlertEmail -> services/vaultAuth.js", request);
  }
};

// Builds the "otpRequired" response for a client whose WrOTPEnable is true
// -- called from loginService/googleSignInService right where the real
// session token would otherwise be issued, and again by
// beginTwoFactorSetupService for the post-setPassword enrollment screen.
// Deliberately never returns a `token` field: the client frontend's axios
// interceptor auto-persists any result.token as a finished session (see
// passvault-client's src/lib/api.js), so a half-authenticated response must
// only carry pendingToken until verifyOtpService confirms the code.
// geo: { latitude, longitude } captured at the initial login/signup POST
// (loginService/googleSignInService's own requireGeolocation call) --
// carried inside the pending token itself since nothing is persisted to the
// DB until verifyOtpService actually confirms the code, and it's that
// confirmation, not this challenge, that logs CLIENT_LOGGED_IN/TWO_FA_ENABLED
// with the location. beginTwoFactorSetupService (Settings, not a login) has
// no geolocation to give, so its calls just omit `geo` -- undefined
// latitude/longitude are fine, insertClientActivityLogQuery already
// defaults missing coords to null.
const beginTwoFactorChallenge = async (client, fastify, request, geo = {}) => {
  const { latitude, longitude } = geo;
  if (client.otpType === OTPType.MAIL) {
    const code = generateNumericCode();
    const codeHash = await bcrypt.hash(code, 10);
    await sendMail({
      to: client.email,
      subject: "Your PassVault sign-in code",
      text: `Your PassVault sign-in code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      mailSettingId: getWhitelabelMailSettingId(client.whitelabelId),
    });
    const pendingToken = generatePurposeToken(client.clientId, TWO_FACTOR_PURPOSE, TWO_FACTOR_TOKEN_EXPIRY, {
      otpType: OTPType.MAIL,
      codeHash,
      latitude,
      longitude,
    });
    return { otpRequired: true, otpType: OTPType.MAIL, pendingToken };
  }

  // GOOGLE_AUTHENTICATOR -- first time (no secret saved yet): the secret
  // travels inside the pending token itself, not the DB, so an abandoned
  // QR-scan never leaves a half-enrolled secret behind (see
  // verifyOtpService, which is what actually persists it).
  if (!client.hasOtpSecret) {
    const secret = generateTotpSecret();
    const keyUri = buildTotpKeyUri(client.email, secret);
    const qrCode = await generateQrCodeDataUrl(keyUri);
    const pendingToken = generatePurposeToken(client.clientId, TWO_FACTOR_PURPOSE, TWO_FACTOR_TOKEN_EXPIRY, {
      otpType: OTPType.GOOGLE_AUTHENTICATOR,
      secret: encrypt(secret),
      isNewSecret: true,
      latitude,
      longitude,
    });
    return { otpRequired: true, otpType: OTPType.GOOGLE_AUTHENTICATOR, qrCode, pendingToken };
  }

  const pendingToken = generatePurposeToken(client.clientId, TWO_FACTOR_PURPOSE, TWO_FACTOR_TOKEN_EXPIRY, {
    otpType: OTPType.GOOGLE_AUTHENTICATOR,
    isNewSecret: false,
    latitude,
    longitude,
  });
  return { otpRequired: true, otpType: OTPType.GOOGLE_AUTHENTICATOR, pendingToken };
};

// POST /vault/auth/verifyOtp -- the second step of every 2FA-gated sign-in
// (password login, Google sign-in, or the post-setPassword enrollment
// screen). No auth header is required: the pendingToken itself proves the
// client already passed step one. Only on success does a real session token
// get issued, matching loginService/googleSignInService's deferred
// CLIENT_LOGGED_IN logging.
const verifyOtpService = async (request, fastify) => {
  const { pendingToken, code } = request.body || {};
  if (!pendingToken || !code) {
    throw new Error("pendingToken and code are required");
  }

  const decoded = verifyPurposeToken(pendingToken, TWO_FACTOR_PURPOSE);
  const client = await findClientByIdQuery(decoded.WrClientId, fastify);
  if (!client || !client.isActive) {
    throw new Error("Account not found");
  }

  let verified = false;
  let justEnrolled = false;

  if (decoded.otpType === OTPType.MAIL) {
    verified = await bcrypt.compare(String(code), decoded.codeHash);
  } else {
    const encryptedSecret = decoded.isNewSecret
      ? decoded.secret
      : await getClientOtpSecretQuery(client.clientId, fastify);
    const secret = encryptedSecret ? decrypt(encryptedSecret) : null;
    verified = secret ? verifyTotpCode(code, secret) : false;
    if (verified && decoded.isNewSecret) {
      await updateClientOtpSecretQuery(client.clientId, decoded.secret, fastify);
      justEnrolled = true;
    }
  }

  if (!verified) {
    throw new Error("Invalid or expired code");
  }

  if (!justEnrolled) {
    await reactivateIfSuspended(client, fastify, request);
  }
  await touchClientUpdatedAtQuery(client.clientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: justEnrolled ? VaultActivityCodes.TWO_FA_ENABLED : VaultActivityCodes.CLIENT_LOGGED_IN,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
      deviceInfo: deviceInfo(request),
      // Carried inside pendingToken from the original login/signup POST --
      // see beginTwoFactorChallenge's own comment. undefined for a
      // Settings-initiated /2fa/setup (no login in progress there), which
      // insertClientActivityLogQuery already treats as no location.
      latitude: decoded.latitude,
      longitude: decoded.longitude,
    },
    fastify
  );
  if (!justEnrolled) {
    // Fire-and-forget -- see loginService's identical call for why.
    sendSignInAlertEmail(client, request, decoded.latitude, decoded.longitude, fastify);
  }

  const token = generateClientToken(client);
  return { token, client: { ...client, hasOtpSecret: true } };
};

// Shared step-up gate: verifies a fresh TOTP code against client's own
// enrolled Google Authenticator secret. Exported so services outside this
// file (services/vaultAccountLifecycle.js's Suspend/Delete Account) can
// require the same proof without duplicating the lookup/decrypt/compare --
// there's no proof token issued by a prior /2fa/verify call to reuse
// instead (see verifyStepUpOtpService below, which just returns a boolean),
// so each of those endpoints re-verifies its own fresh code this way.
const verifyOwnTotpCode = async (client, code, fastify) => {
  // 2FA turned off for this client (WrOTPEnable false) -- nothing to check
  // a code against, so this step-up is satisfied automatically. Checked
  // first, before requiring `code` at all, so a client with 2FA off can
  // still reveal a password / edit / delete / suspend / delete their
  // account without ever needing a code they don't have.
  if (!client.otpEnabled) {
    return;
  }
  if (!code) {
    throw new Error("A verification code is required for this action");
  }
  if (client.otpType !== OTPType.GOOGLE_AUTHENTICATOR || !client.hasOtpSecret) {
    throw new Error("Two-factor authentication is not set up for this account");
  }
  const encryptedSecret = await getClientOtpSecretQuery(client.clientId, fastify);
  const secret = encryptedSecret ? decrypt(encryptedSecret) : null;
  const verified = secret ? verifyTotpCode(code, secret) : false;
  if (!verified) {
    throw new Error("Invalid or expired code");
  }
};

// POST /vault/auth/2fa/verify -- authenticated, on-demand re-verification
// for an already-signed-in session. Distinct from verifyOtpService, which
// only ever consumes a login/enrollment pendingToken and issues a session
// token -- this proves "it's still you" right now, against the already-
// enrolled Google Authenticator secret, without touching the session at
// all. Used to gate revealing a saved account's password (see
// passvault-client's RevealAccountModal). Mail-OTP step-up would need its
// own "send a fresh code" step first, so it's out of scope here for now --
// this only supports Google Authenticator, which is also the system default.
// entryId is optional -- present when this step-up is gating a specific
// account's password reveal (see passvault-client's RevealAccountModal).
// When it's there, the successful verification is itself logged as
// ACCOUNT_PASSWORD_VIEWED (refId = entryId), and the response includes
// whenever this same entry was last viewed *before* now, so the client can
// show it without a separate lookup.
const verifyStepUpOtpService = async (request, fastify) => {
  const { code, entryId, latitude, longitude, entryName } = request.body || {};

  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client || !client.isActive) {
    throw new Error("Account not found");
  }
  await verifyOwnTotpCode(client, code, fastify);

  let lastViewedAt = null;
  if (entryId) {
    const [previousView] = await listClientActivityLogsQuery(
      { clientId: WrClientId, activityType: VaultActivityCodes.ACCOUNT_PASSWORD_VIEWED, refId: entryId, limit: 1 },
      fastify
    );
    lastViewedAt = previousView?.createdDate || null;

    await insertClientActivityLogQuery(
      {
        activityType: VaultActivityCodes.ACCOUNT_PASSWORD_VIEWED,
        refId: entryId,
        ipAddress: request.ip,
        clientId: WrClientId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        // See sql/vault/012_activity_log_entry_name.sql -- same plaintext-
        // title-only trust level as putVaultDataService's entryName.
        entryName: entryName || null,
      },
      fastify
    );
  }

  return { verified: true, lastViewedAt };
};

// POST /vault/auth/2fa/setup -- authenticated. Used right after
// setPasswordService (first-time enrollment, before the client ever reaches
// the dashboard) and again from Settings after a self-service reset. Reuses
// beginTwoFactorChallenge's "no secret yet" branch so the QR/pendingToken
// shape and the confirming call (verifyOtpService) are identical to the
// login-time challenge.
const beginTwoFactorSetupService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  if (client.otpType !== OTPType.GOOGLE_AUTHENTICATOR) {
    throw new Error("Google Authenticator is not enabled for this account");
  }
  if (client.hasOtpSecret) {
    throw new Error("Two-factor authentication is already set up -- reset it first to generate a new QR code");
  }
  return beginTwoFactorChallenge(client, fastify, request);
};

// POST /vault/auth/2fa/reset -- authenticated self-service action for a
// lost/reset authenticator device. Clears WrUuid so the next sign-in (or a
// fresh call to /2fa/setup) issues a brand-new QR code.
const resetTwoFactorService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  await resetClientOtpQuery(WrClientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.TWO_FA_RESET,
      refId: String(WrClientId),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  // Best-effort notification (Template screen, Email > Reset 2FA) -- a
  // missing/broken template or mail setting must never fail the reset
  // itself, which has already been applied above.
  try {
    const client = await findClientByIdQuery(WrClientId, fastify);
    if (client?.email) {
      await sendTemplateMail({
        type: templateType.Reset2FA,
        to: client.email,
        mailSettingId: getWhitelabelMailSettingId(client.whitelabelId),
        vars: {
          name: client.name || "there",
          ip: request.ip,
          date: new Date().toUTCString(),
          logoHtml: buildLogoHtml(client.whitelabelId),
        },
      });
    }
  } catch (err) {
    errorLogger(fastify, err.message, "resetTwoFactorService -> services/vaultAuth.js", request);
  }

  return { reset: true };
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
  const { latitude, longitude } = requireGeolocation(request.body);
  await requireNoVpn(request);

  const existing = await findClientByEmailQuery(email, fastify);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const whitelabel = resolveWhitelabelFromRequest(request);
  const defaultPackageId = await getDefaultPackageIdQuery(fastify);
  const defaultPackage = global.tblPackages.find((item) => item.id === defaultPackageId);
  const client = await insertClientQuery(
    {
      name: name || null,
      email,
      googleId: null,
      provider: VaultClientProvider.EMAIL,
      isEmailVerified: false,
      packageId: defaultPackageId,
      whitelabelId: whitelabel?.id || null,
      packageExpiryDate: defaultPackage
        ? computePackageExpiryDate(defaultPackage.intervalType, defaultPackage.intervalCount)
        : null,
    },
    fastify
  );

  const deviceInfoJson = deviceInfo(request);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_REGISTERED,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
      deviceInfo: deviceInfoJson,
      latitude,
      longitude,
    },
    fastify
  );

  const verifyToken = generatePurposeToken(client.clientId, "verify-email", "1d");
  const verifyUrl = `${clientAppUrl()}/verify-email?token=${verifyToken}`;
  const { browser, device } = describeDevice(deviceInfoJson);

  // Prefers the admin-configured Welcome template (Template screen, Email >
  // Welcome) so its subject/body -- with {{name}}/{{email}}/{{verifyUrl}}/
  // {{ip}}/{{location}}/{{device}}/{{browser}}/{{date}}/{{securityUrl}}
  // filled in -- goes out instead. Falls back to this hardcoded copy when no
  // active Welcome template exists yet, since the verify-email link is
  // required to finish signup and must go out either way. securityUrl is
  // this whitelabel's own site (falling back to the generic client app URL
  // for a request that didn't resolve one), not a specific settings page --
  // there's no dedicated "security" route in passvault-client today.
  const templateSent = await sendTemplateMail({
    type: templateType.Welcome,
    to: email,
    mailSettingId: whitelabel?.mailSettingId,
    vars: {
      name: name || "there",
      email,
      verifyUrl,
      logoHtml: buildLogoHtml(whitelabel?.id),
      ip: request.ip,
      location: formatLocation(latitude, longitude),
      device,
      browser,
      date: new Date().toUTCString(),
      securityUrl: whitelabel?.domain || clientAppUrl(),
    },
  });
  if (!templateSent) {
    await sendMail({
      to: email,
      subject: "Welcome to PassVault -- verify your email",
      text: `Hi ${name || "there"},\n\nWelcome to PassVault! Verify your email to finish creating your account:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`,
      mailSettingId: whitelabel?.mailSettingId,
    });
  }

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

  // Tells the frontend whether to route straight to /dashboard or into the
  // QR-enrollment step first (see verify-email/page.js) -- every client
  // defaults to WrOTPEnable=true/otpType=GOOGLE_AUTHENTICATOR, so this is
  // the normal path for a brand-new signup.
  return {
    passwordSet: true,
    otpEnabled: client.otpEnabled,
    otpType: client.otpType,
    hasOtpSecret: client.hasOtpSecret,
  };
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
  const { latitude, longitude } = requireGeolocation(request.body);
  await requireNoVpn(request);
  await requireRecaptcha(request, resolveWhitelabelFromRequest(request));

  const fingerprint = deviceInfo(request);

  const client = loginIdentifier.includes("@")
    ? await getClientAuthByEmailQuery(loginIdentifier, fastify)
    : await getClientAuthByUsernameQuery(loginIdentifier, fastify);
  if (!client) {
    throw new Error("Invalid email/username or password");
  }
  if (!client.isActive) {
    throw new Error("This account has been suspended");
  }

  // Locked out from too many recent wrong passwords -- checked before the
  // email-verified/password-hash branches below, so a locked account can't
  // be used to keep probing those responses either.
  if (client.lockedUntil && new Date(client.lockedUntil) > new Date()) {
    const minutesLeft = Math.max(1, Math.ceil((new Date(client.lockedUntil) - new Date()) / 60000));
    throw new Error(`Too many failed login attempts. Try again in ${minutesLeft} minute(s).`);
  }

  if (!client.isEmailVerified) {
    throw new Error("Please verify your email before logging in");
  }
  if (!client.passwordHash) {
    throw new Error('This account signs in with Google -- use "Continue with Google" instead');
  }

  const passwordMatches = await bcrypt.compare(password, client.passwordHash);
  if (!passwordMatches) {
    const { failedLoginAttempts } = await incrementFailedLoginAttemptsQuery(
      client.clientId,
      MAX_FAILED_LOGIN_ATTEMPTS,
      LOGIN_LOCKOUT_HOURS,
      fastify
    );
    const justLocked = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
    await insertClientActivityLogQuery(
      {
        activityType: justLocked ? VaultActivityCodes.ACCOUNT_LOCKED : VaultActivityCodes.LOGIN_FAILED,
        refId: String(client.clientId),
        ipAddress: request.ip,
        clientId: client.clientId,
        deviceInfo: fingerprint,
        latitude,
        longitude,
      },
      fastify
    );
    if (justLocked) {
      throw new Error(`Too many failed login attempts. Your account is locked for ${LOGIN_LOCKOUT_HOURS} hours.`);
    }
    throw new Error("Invalid email/username or password");
  }

  await resetFailedLoginAttemptsQuery(client.clientId, fastify);

  const { passwordHash, failedLoginAttempts, lockedUntil, ...clientWithoutHash } = client;

  // Password verified -- if 2FA is on, don't touch "logged in" bookkeeping
  // or issue a session token yet, that only happens once verifyOtpService
  // confirms the code.
  if (clientWithoutHash.otpEnabled) {
    return beginTwoFactorChallenge(clientWithoutHash, fastify, request, { latitude, longitude });
  }

  await reactivateIfSuspended(clientWithoutHash, fastify, request);
  await touchClientUpdatedAtQuery(client.clientId, fastify);
  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.CLIENT_LOGGED_IN,
      refId: String(client.clientId),
      ipAddress: request.ip,
      clientId: client.clientId,
      deviceInfo: fingerprint,
      latitude,
      longitude,
    },
    fastify
  );
  // Fire-and-forget -- see loginService's identical call for why.
  sendSignInAlertEmail(clientWithoutHash, request, latitude, longitude, fastify);

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

// findClientByIdQuery's row carries plenty this codebase's own services need
// internally (isActive, isDeleted, packageId, whitelabelId, googleId,
// createdAt/updatedAt, ...) that the frontend never actually reads -- see
// passvault-client's DashboardHeader/useOnboardingStatus/ProfileForm/
// TwoFactorSettings/ChangePasswordForm, the only consumers of this
// response. Trimming happens here, at the service layer, rather than in
// the repository query itself, since every other caller of
// findClientByIdQuery (verifyStepUpOtpService, getDriveAccessTokenForClient,
// etc.) still needs the full row.
const MINIMAL_PROFILE_FIELDS = [
  "name",
  "username",
  "email",
  "hasPassword",
  "otpEnabled",
  "otpType",
  "hasOtpSecret",
  "driveConnected",
];
const FULL_PROFILE_FIELDS = [...MINIMAL_PROFILE_FIELDS, "mobileNo", "address"];

const pickFields = (obj, fields) => fields.reduce((acc, field) => ({ ...acc, [field]: obj[field] }), {});

const DEFAULT_ACCOUNT_MODAL_POPUP_INTERVAL_SECONDS = 10;

// Reveal-account-modal auto-close timeout, from the existing generic
// tblConfigs key/value table (same one PassVaultpanel's Config admin
// screen already manages -- see repository/TableConfig.js), key
// CLIENTACCOUNTMODELPOPUPINTERVAL. Folded straight into the profile
// response (below) rather than its own GET /vault/auth/config endpoint --
// every page already fetches the profile once, so there's nothing to
// re-fetch separately every time the reveal modal opens.
const getPopupIntervalSeconds = () => {
  const configRow = (global.tblConfigs || []).find(
    (item) => item.key?.toLowerCase() === configConstants.CLIENTACCOUNTMODELPOPUPINTERVAL.toLowerCase()
  );
  return configRow?.isActive
    ? parseInt(configRow.value, 10) || DEFAULT_ACCOUNT_MODAL_POPUP_INTERVAL_SECONDS
    : DEFAULT_ACCOUNT_MODAL_POPUP_INTERVAL_SECONDS;
};

// GET /vault/auth/profile -- called on every protected page (DashboardHeader's
// name/username display, useOnboardingStatus's username/password/2FA
// checks) so it only returns the minimal fields those need. GET
// /vault/auth/profile/full (getFullProfileService below) is the one the
// Profile screen itself calls, for the fields only it displays
// (mobileNo/address via ProfileForm). popupIntervalSeconds isn't a
// tblClient column -- it's merged in from tblConfigs on every response
// here rather than picked via pickFields.
const getProfileService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  return { client: { ...pickFields(client, MINIMAL_PROFILE_FIELDS), popupIntervalSeconds: getPopupIntervalSeconds() } };
};

// GET /vault/auth/profile/full -- same auth/lookup as getProfileService,
// just a wider field set. Only passvault-client's /profile page calls this.
const getFullProfileService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }
  return { client: { ...pickFields(client, FULL_PROFILE_FIELDS), popupIntervalSeconds: getPopupIntervalSeconds() } };
};

// GET /vault/auth/profile/package -- the client's subscribed package, for
// the /profile page's "Subscription" card. Returns { package: null } rather
// than throwing when wrPackageId isn't set (e.g. an older client created
// before packages existed), so the frontend can render a
// "no active plan" state instead of an error.
const getClientPackageService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const pkg = await getClientPackageQuery(WrClientId, fastify);
  if (pkg && pkg.expiryDate) {
    const msRemaining = new Date(pkg.expiryDate).getTime() - Date.now();
    pkg.daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
    pkg.isExpired = msRemaining <= 0;
  }
  return { package: pkg };
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
  // ProfileForm (the only caller) merges this straight into the Profile
  // page's state, which needs mobileNo/address to keep displaying
  // correctly after a save -- same shape as getFullProfileService.
  return { client: { ...pickFields(client, FULL_PROFILE_FIELDS), popupIntervalSeconds: getPopupIntervalSeconds() } };
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

const MAX_PAGE_PATH_LENGTH = 200; // matches tblActivityLogs.wrRefID's varchar(200)

// POST /vault/auth/activity/pageView -- authenticated, fire-and-forget from
// the frontend's own route changes (see passvault-client's
// usePageViewLogging, mounted once in DashboardHeader). There's no
// server-side action to hang this off of the way ACCOUNT_CREATED etc. ride
// along on putVaultDataService -- navigating between pages is a client-only
// event, so the client has to report it itself.
const logPageViewService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { page } = request.body || {};
  if (!page) {
    throw new Error("page is required");
  }

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PAGE_VIEWED,
      refId: String(page).slice(0, MAX_PAGE_PATH_LENGTH),
      ipAddress: request.ip,
      clientId: WrClientId,
    },
    fastify
  );

  return { logged: true };
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

// GET /vault/auth/vpnStatus -- authenticated. Polled every few minutes by
// passvault-client's useVpnGuard (mounted in DashboardHeader, so it runs on
// every signed-in page) to catch a client turning a VPN on mid-session --
// login/register/google only check once, at the moment of signing in.
// Sessions are stateless JWTs (see logoutService above), so this can't
// revoke anything server-side; it just answers the question, and the
// frontend is the one that clears its own token and redirects to /login
// once it sees vpnDetected: true.
const vpnStatusService = async (request) => {
  const { isVpn } = await checkVpn(request.ip);
  return { vpnDetected: isVpn };
};

module.exports = {
  googleSignInService,
  refreshTokenService,
  logoutService,
  vpnStatusService,
  generateClientToken,
  registerService,
  verifyEmailService,
  setPasswordService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getProfileService,
  getFullProfileService,
  getClientPackageService,
  updateProfileService,
  changePasswordService,
  resolveWhitelabelFromRequest,
  verifyOwnTotpCode,
  verifyOtpService,
  verifyStepUpOtpService,
  logPageViewService,
  beginTwoFactorSetupService,
  resetTwoFactorService,
};
