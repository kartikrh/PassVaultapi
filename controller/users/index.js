const { ERROR_CODES, error, success } = require("../../utilities/index");
const {
  signUpUserService,
  signInUserServices,
  generateEncryptionService,
  validateUserServices,
  getAllUsersService,
  getUserByIdService,
  saveUserService,
} = require("../../services/user");
const { errorLogger } = require("../../utilities/logger");

let commonPath = "controller/users";

async function signUpUser(request, reply, fastify) {
  try {
    const result = await signUpUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signUpUser", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
}
async function signInUser(request, reply, fastify) {
  try {
    const result = await signInUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/signInUser", request);
    reply.status(401).send(error(err.message, ERROR_CODES.AUTH_ERROR, 401));
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
    reply.status(401).send(error(err.message, ERROR_CODES.AUTH_ERROR, 401));
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

const getAllUsers = async (request, reply, fastify) => {
  try {
    const result = await getAllUsersService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllUsers", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getUserById = async (request, reply, fastify) => {
  try {
    const result = await getUserByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getUserById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const saveUser = async (request, reply, fastify) => {
  try {
    const result = await saveUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getUserById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  signUpUser,
  signInUser,
  generateEncryption,
  validateUser,
  getAllUsers,
  getUserById,
  saveUser,
};
