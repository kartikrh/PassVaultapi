const { ERROR_CODES, error, success, fetchDataForClient, getGlobalMemoryDataService } = require("../../utilities/index");
const {
  signUpUserService,
  signInUserServices,
  generateEncryptionService,
  validateUserServices,
  getAllUsersService,
  getUserByIdService,
  saveUserService,
  deleteUserService,
  changeUserPasswordService,
  signOutUserServices,
  verifyTokenUserServices,
  getUserDecryptedPassword,
  changeUserPasswordByUSerIDService,
  getAllUsersWithCurrentService,
  //loginRegistrationClientService,
  loginClientService,
  registrationClientService,
  updateClientService,
  sendNotificationWebService,
  sendNotificationMobileService,
  signOutClientService,
  registerDetailsService,
  registerMobileService,
  validateOtpService,
  setPasswordService,
  clientDetailsByIdService,
  resendOtpService,
  updateClientPasswordService,
  forgetPasswordService,
  verifyEmailService,
  verifyEmailTokenService,
  verifyMobileService,
  verifyMobileOtpService,
  registerClientAppService,
  verifyMobileNoAppService,
  signinClientAppService,
  updateClientProfileService,
  changePasswordService,
  otpResendService,
  forgotPasswordService,
  verifyForgotPasswordOTPService,
  updatePasswordInForgotPasswordService,
  clientDataByIdService,
  verifySeamlessOTPService,
} = require("../../services/user");
const { errorLogger,updateWebRequestLogs } = require("../../utilities/logger");
// const fetchAllDataFromDb = require("../../utilities/fetchAllData");
const { fetchAllDataFromDb, panelLoadDataByEnum, loadEnityDataOnGlobal, globalMemoryDatas } = require("../../utilities/fetchAllData");
const { ckImageUploadService, imgUploadService } = require("../../services/ckImage");
const configConstants = require("../../utilities/configConstants");

let commonPath = "controller/users";

async function signUpUser(request, reply, fastify) {
  try {
    const result = await signUpUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signUpUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function signInUser(request, reply, fastify) {
  try {
    const result = await signInUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signInUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
}

async function signOutUser(request, reply, fastify) {
  try {
    const result = await signOutUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signOutUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
}

async function verifyTokenUser(request, reply, fastify) {
  try {
    const result = await verifyTokenUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyTokenUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 401));
  }
}

async function generateEncryption(request, reply, fastify) {
  try {
    const result = await generateEncryptionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/generateEncryption",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 401));
  }
}

async function validateUser(request, reply, fastify) {
  try {
    const result = await validateUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/validateUser", request);
    reply.status(200).send(success(false, 200));
  }
}

const loadDataInMemory = async (request, reply, fastify) => {
  try {
    // if (!request.userTokenInfo.WrIsSuperAdmin) {
    //   throw new Error("You are not authorized to perform this action");
    // }
    await fetchAllDataFromDb(fastify, reply);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const loadPanelDataInGlobal = async (request, reply, fastify) => {
  try {
    // if (!request.userTokenInfo.WrIsSuperAdmin) {
    //   throw new Error("You are not authorized to perform this action");
    // }
    // check the pass
  
    await panelLoadDataByEnum(request, fastify, reply);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const loadClientDataInMemory = async (request, reply, fastify) => {
  try {
    // if (!request.userTokenInfo.WrIsSuperAdmin) {
    //   throw new Error("You are not authorized to perform this action");
    // }
    return await fetchDataForClient(fastify, reply);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const ckImageUpload = async (request, reply, fastify) => {
  try {
    const result = await ckImageUploadService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllUsers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const generalImageUpload = async (request, reply, fastify) => {
  try {
    const result = await imgUploadService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/generalImageUpload", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getAllUsers = async (request, reply, fastify) => {
  try {
    const result = await getAllUsersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllUsers", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllUsersWithCurrent = async (request, reply, fastify) => {
  try {
    const result = await getAllUsersWithCurrentService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllUsersWithCurrent",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const decryptPasswordUser = async (request, reply, fastify) => {
  try {
    const result = await getUserDecryptedPassword(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/decryptPasswordUser",
      request
    );
    if (err.message == 403) {
      return reply
        .status(403)
        .send(
          error(
            "You don't have permission to decrypt this user's password",
            ERROR_CODES.INVALID_TOKEN,
            403
          )
        );
    }
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getUserById = async (request, reply, fastify) => {
  try {
    const result = await getUserByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getUserById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveUser = async (request, reply, fastify) => {
  try {
    const result = await saveUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteUser = async (request, reply, fastify) => {
  try {
    const result = await deleteUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteUser", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateUserPassword = async (request, reply, fastify) => {
  try {
    const result = await changeUserPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateUserPassword",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeUserPassword = async (request, reply, fastify) => {
  try {
    const result = await changeUserPasswordByUSerIDService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/changeUserPassword",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
// async function loginRegistrationClient(request, reply, fastify) {
//   try {
//     const result = await loginRegistrationClientService(request, fastify);
//     reply.status(200).send(success(result, 200));
//   } catch (err) {
//     errorLogger(fastify, err.message, commonPath + "/loginRegistrationClient", request);
//     reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
//   }
// }

async function registrationClient(request, reply, fastify) {
  try {
    const result = await registrationClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/registrationClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const registerClientApp = async (request, reply, fastify) => {
  try {
    const result = await registerClientAppService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/registerClientApp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const verifyMobileNoApp = async (request, reply, fastify) => {
  try {
    const result = await verifyMobileNoAppService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyMobileNoApp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const signinClientApp = async (request, reply, fastify) => {
  try {
    const result = await signinClientAppService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signinClientApp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
async function registerDetails(request, reply, fastify) {
  try {
    const result = await registerDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/registerDetails", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function resendOtp(request, reply, fastify) {
  try {
    const result = await resendOtpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/resendOtp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function verifyMobile(request, reply, fastify) {
  try {
    const result = await verifyMobileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyMobile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function verifyMobileOtp(request, reply, fastify) {
  try {
    const result = await verifyMobileOtpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyMobileOtp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function verifyEmail(request, reply, fastify) {
  try {
    const result = await verifyEmailService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyEmail", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function verifyEmailToken(request, reply, fastify) {
  try {
    const result = await verifyEmailTokenService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyEmailToken", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function clientDetailsById(request, reply, fastify) {
  try {
    const result = await clientDetailsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/clientDetailsById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function validateOtp(request, reply, fastify) {
  try {
    const result = await validateOtpService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/validateOtp", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function setPassword(request, reply, fastify) {
  try {
    const result = await setPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/setPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function updateClientPassword(request, reply, fastify) {
  try {
    const result = await updateClientPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateClientPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function forgetPassword(request, reply, fastify) {
  try {
    const result = await forgetPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/forgetPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function loginClient(request, reply, fastify) {
  try {
    const result = await loginClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/loginClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

async function updateClient(request, reply, fastify) {
  try {
    const result = await updateClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

async function sendNotificationWeb(request, reply, fastify) {
  try {
    const result = await sendNotificationWebService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/sendNotificationWeb", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

async function sendNotificationMobile(request, reply, fastify) {
  try {
    const result = await sendNotificationMobileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/sendNotificationMobile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

async function signOutClient(request, reply, fastify) {
  try {
    const result = await signOutClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signOutClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
}

async function AddUpdateWebLogs(request, reply, fastify) {
  try {
    const result = await updateWebRequestLogs(request, fastify);
    reply.status(200).send(result);
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/", request);
    reply.status(200).send(error(err.message, ERROR_CODES.AUTH_ERROR, 200));
  }
}
async function updateClientProfile(request, reply, fastify) {
  try {
    const result = await updateClientProfileService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateClientProfile", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
async function changePassword(request, reply, fastify) {
  try {
    const result = await changePasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/changePassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const otpResend = async (request, reply, fastify) => {
  try {
    const result = await otpResendService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/otpResend", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const forgotPassword = async (request, reply, fastify) => {
  try {
    const result = await forgotPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/forgotPassword", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const verifyForgotPasswordOTP = async (request, reply, fastify) => {
  try {
    const result = await verifyForgotPasswordOTPService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifyForgotPasswordOTP", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updatePasswordInForgot = async (request, reply, fastify) => {
  try {
    const result = await updatePasswordInForgotPasswordService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updatePasswordInForgot", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const clientDataById = async (request, reply, fastify) => {
  try {
    const result = await clientDataByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/clientDataById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const verifySeamlessOTP = async (request, reply, fastify) => {
  try {
    const result = await verifySeamlessOTPService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/verifySeamlessOTP", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const loadEnityData = async (request, fastify, reply) => {
  try {
    const result = await loadEnityDataOnGlobal(request, fastify, reply);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/loadEnityData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const globalMemoryData = async (request, reply, fastify) => {
  try {
    const result = await globalMemoryDatas(request, fastify, reply);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/globalMemoryData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getGlobalMemoryData = async (request, reply, fastify) => {
  try {
    const result = await getGlobalMemoryDataService(request, fastify, reply);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getGlobalMemoryData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  signUpUser,
  signInUser,
  signOutUser,
  verifyTokenUser,
  generateEncryption,
  validateUser,
  loadDataInMemory,
  ckImageUpload,
  getAllUsers,
  getAllUsersWithCurrent,
  decryptPasswordUser,
  getUserById,
  saveUser,
  deleteUser,
  updateUserPassword,
  changeUserPassword,
  generalImageUpload,
  loadClientDataInMemory,
  //loginRegistrationClient,
  registrationClient,
  loginClient,
  updateClient,
  sendNotificationWeb,
  sendNotificationMobile,
  signOutClient,
  registerDetails,
  validateOtp,
  setPassword,
  clientDetailsById,
  resendOtp,
  updateClientPassword,
  forgetPassword,
  AddUpdateWebLogs,
  verifyEmail,
  verifyEmailToken,
  verifyMobile,
  verifyMobileOtp,
  loadPanelDataInGlobal,
  registerClientApp,
  verifyMobileNoApp,
  signinClientApp,
  updateClientProfile,
  changePassword,
  otpResend,
  forgotPassword,
  verifyForgotPasswordOTP,
  updatePasswordInForgot,
  clientDataById,
  verifySeamlessOTP,
  loadEnityData,
  globalMemoryData,
  getGlobalMemoryData
};
