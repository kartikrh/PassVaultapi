const {
  allCongifService,
  configByIdService,
  saveConfigService,
  deleteConfigService,
  allConfigDetails
} = require("../../../../services/config");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/page/congig";

const getAllCongig = async (request, reply, fastify) => {
  try {
    const result = await allCongifService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllCongig", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getConfigById = async (request, reply, fastify) => {
  try {
    const result = await configByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getConfigById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveConfig = async (request, reply, fastify) => {
  try {
    const result = await saveConfigService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveConfig", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteConfig = async (request, reply, fastify) => {
  try {
    const result = await deleteConfigService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteConfigService",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllConfigData = async (request, reply, fastify) => {
  try {
    const result = await allConfigDetails(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllConfigData", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllCongig,
  getConfigById,
  saveConfig,
  deleteConfig,
  getAllConfigData
};
