const { ERROR_CODES, error, success, getGlobalMemoryDataService } = require("../../utilities/index");
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
  sendNotificationWebService,
  sendNotificationMobileService,
} = require("../../services/user");
const { errorLogger } = require("../../utilities/logger");
const { fetchAllDataFromDb, panelLoadDataByEnum, loadEnityDataOnGlobal, globalMemoryDatas } = require("../../utilities/fetchAllData");
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
  sendNotificationWeb,
  sendNotificationMobile,
  loadPanelDataInGlobal,
  loadEnityData,
  globalMemoryData,
  getGlobalMemoryData
};
