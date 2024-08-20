const {
  allThirdPartyApisService,
  thirdPartyApiseByIdService,
  saveThirdPartyApisService,
  deleteThirdPartyApisService,
  activeInactiveThirdPartyApisService,
} = require("../../../../services/thirdPartyApis");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/thirdPartyApi/index.js";

const getAllThirdPartyApis = async (request, reply, fastify) => {
  try {
    const result = await allThirdPartyApisService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllThirdPartyApis",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const thirdPartyApiseById = async (request, reply, fastify) => {
  try {
    const result = await thirdPartyApiseByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/thirdPartyApiseById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveThirdPartyApis = async (request, reply, fastify) => {
  try {
    const result = await saveThirdPartyApisService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/saveThirdPartyApis",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteThirdPartApis = async (request, reply, fastify) => {
  try {
    const result = await deleteThirdPartyApisService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteThirdPartApis",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveThirdPartyApis = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveThirdPartyApisService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveThirdPartyApis",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllThirdPartyApis,
  thirdPartyApiseById,
  saveThirdPartyApis,
  deleteThirdPartApis,
  activeInactiveThirdPartyApis,
};
