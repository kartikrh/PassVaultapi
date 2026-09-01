const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const {
  googleSignInService,
  refreshTokenService,
  logoutService,
  vpnStatusService,
  registerService,
  verifyEmailService,
  setPasswordService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  getProfileService,
  getFullProfileService,
  updateProfileService,
  changePasswordService,
  verifyOtpService,
  verifyStepUpOtpService,
  logPageViewService,
  beginTwoFactorSetupService,
  resetTwoFactorService,
} = require("../../services/vaultAuth");
const { suspendAccountService, deleteAccountService } = require("../../services/vaultAccountLifecycle");

const commonPath = "controller/vault/auth";

const googleSignIn = async (request, reply, fastify) => {
  try {
    const result = await googleSignInService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/googleSignIn", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const refresh = async (request, reply, fastify) => {
  try {
    const result = await refreshTokenService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/refresh", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const logout = async (request, reply, fastify) => {
  try {
    const result = await logoutService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/logout", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const suspendAccount = async (request, reply, fastify) => {
  try {
    const result = await suspendAccountService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/suspendAccount", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const deleteAccount = async (request, reply, fastify) => {
  try {
    const result = await deleteAccountService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteAccount", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const vpnStatus = async (request, reply, fastify) => {
  try {
    const result = await vpnStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/vpnStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const register = async (request, reply, fastify) => {
  try {
    const result = await registerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/register", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const verifyEmail = async (request, reply, fastify) => {
  try {
    const result = await verifyEmailService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyEmail", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const setPassword = async (request, reply, fastify) => {
  try {
    const result = await setPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/setPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const login = async (request, reply, fastify) => {
  try {
    const result = await loginService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/login", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const forgotPassword = async (request, reply, fastify) => {
  try {
    const result = await forgotPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/forgotPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const resetPassword = async (request, reply, fastify) => {
  try {
    const result = await resetPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/resetPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const getProfile = async (request, reply, fastify) => {
  try {
    const result = await getProfileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getProfile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const getFullProfile = async (request, reply, fastify) => {
  try {
    const result = await getFullProfileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getFullProfile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const updateProfile = async (request, reply, fastify) => {
  try {
    const result = await updateProfileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateProfile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const changePassword = async (request, reply, fastify) => {
  try {
    const result = await changePasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/changePassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const verifyOtp = async (request, reply, fastify) => {
  try {
    const result = await verifyOtpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyOtp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const beginTwoFactorSetup = async (request, reply, fastify) => {
  try {
    const result = await beginTwoFactorSetupService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/beginTwoFactorSetup", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const resetTwoFactor = async (request, reply, fastify) => {
  try {
    const result = await resetTwoFactorService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/resetTwoFactor", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const verifyStepUpOtp = async (request, reply, fastify) => {
  try {
    const result = await verifyStepUpOtpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyStepUpOtp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
};

const logPageView = async (request, reply, fastify) => {
  try {
    const result = await logPageViewService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/logPageView", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

module.exports = {
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
};
