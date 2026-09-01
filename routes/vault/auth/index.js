const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const {
  googleSignIn,
  refresh,
  logout,
  vpnStatus,
  register,
  verifyEmail,
  setPassword,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  getFullProfile,
  updateProfile,
  changePassword,
  verifyOtp,
  verifyStepUpOtp,
  logPageView,
  beginTwoFactorSetup,
  resetTwoFactor,
  suspendAccount,
  deleteAccount,
} = require("../../../controller/vault/auth");
const { connectDrive, getDriveStatus } = require("../../../controller/vault/drive");
const { getActivity } = require("../../../controller/vault/activity");

// Real per-route limits for this plugin's public, credential-relevant
// endpoints -- app.js's app-wide @fastify/rate-limit registration is
// configured effectively unlimited (100,000,000/hour) for other consumers,
// but it DOES honor a route's own `config.rateLimit` override (that's the
// only mechanism that actually takes effect here: registering a second,
// separately-configured @fastify/rate-limit instance nested inside this
// plugin was tried and confirmed to do nothing for routes without their own
// override -- the outer instance's onRequest hook is what always runs).
const AUTH_ATTEMPT_RATE_LIMIT = { max: 8, timeWindow: "5 minutes" };

module.exports = async (fastify, opts) => {
  fastify.post("/google", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => googleSignIn(request, reply, fastify),
  });

  fastify.post("/register", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => register(request, reply, fastify),
  });

  fastify.post("/verifyEmail", {
    handler: (request, reply) => verifyEmail(request, reply, fastify),
  });

  fastify.post("/setPassword", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => setPassword(request, reply, fastify),
  });

  // The actual brute-force target -- backstops loginService's own
  // attempt-counting lockout at the network level, for distributed attempts
  // spread across many accounts from one source.
  fastify.post("/login", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => login(request, reply, fastify),
  });

  // No preHandler -- the pendingToken issued by /login, /google, or
  // /2fa/setup proves the client already passed step one (see
  // services/vaultAuth.js verifyOtpService). Same limit as /login, since
  // guessing the 6-digit code is the equivalent brute-force target.
  fastify.post("/verifyOtp", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => verifyOtp(request, reply, fastify),
  });

  fastify.post("/2fa/setup", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => beginTwoFactorSetup(request, reply, fastify),
  });

  fastify.post("/2fa/reset", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => resetTwoFactor(request, reply, fastify),
  });

  // On-demand step-up re-verification for an already-signed-in session
  // (e.g. revealing a saved account's password) -- distinct from
  // /verifyOtp, which only ever consumes a login/enrollment pendingToken.
  fastify.post("/2fa/verify", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => verifyStepUpOtp(request, reply, fastify),
  });

  // popupIntervalSeconds now rides along on GET /profile (and /profile/full)
  // instead of its own endpoint -- see getProfileService.

  fastify.post("/activity/pageView", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => logPageView(request, reply, fastify),
  });

  fastify.post("/forgotPassword", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => forgotPassword(request, reply, fastify),
  });

  fastify.post("/resetPassword", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    handler: (request, reply) => resetPassword(request, reply, fastify),
  });

  fastify.post("/refresh", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => refresh(request, reply, fastify),
  });

  fastify.post("/logout", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => logout(request, reply, fastify),
  });

  // Polled every few minutes by passvault-client's useVpnGuard while
  // signed in -- catches a client turning a VPN on mid-session.
  fastify.get("/vpnStatus", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => vpnStatus(request, reply, fastify),
  });

  fastify.post("/drive/connect", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => connectDrive(request, reply, fastify),
  });

  fastify.get("/drive/status", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getDriveStatus(request, reply, fastify),
  });

  fastify.get("/profile", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getProfile(request, reply, fastify),
  });

  // Wider field set (adds mobileNo/address) than GET /profile -- only
  // passvault-client's /profile page calls this, since it's the only
  // screen that displays those.
  fastify.get("/profile/full", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getFullProfile(request, reply, fastify),
  });

  fastify.put("/profile", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => updateProfile(request, reply, fastify),
  });

  fastify.post("/changePassword", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => changePassword(request, reply, fastify),
  });

  // Profile > danger zone. Both require a fresh TOTP code in the body
  // (verified inline by suspendAccountService/deleteAccountService) --
  // same rate limit as the other credential-sensitive endpoints, since a
  // wrong-code guess here is exactly that kind of attempt.
  fastify.post("/suspendAccount", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => suspendAccount(request, reply, fastify),
  });

  fastify.post("/deleteAccount", {
    config: { rateLimit: AUTH_ATTEMPT_RATE_LIMIT },
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => deleteAccount(request, reply, fastify),
  });

  fastify.get("/activity", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getActivity(request, reply, fastify),
  });
};
