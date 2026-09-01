const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const {
  listClientsAdminService,
  getClientDetailAdminService,
  updateClientStatusAdminService,
  deleteClientsAdminService,
  getClientUsageAdminService,
  listDeletedClientsAdminService,
} = require("../../services/adminVaultClients");

const commonPath = "controller/vault/adminClients";

const getAllClients = async (request, reply, fastify) => {
  try {
    const result = await listClientsAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllClients", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getClientDetail = async (request, reply, fastify) => {
  try {
    const result = await getClientDetailAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getClientDetail", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const updateClientStatus = async (request, reply, fastify) => {
  try {
    const result = await updateClientStatusAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateClientStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const deleteClients = async (request, reply, fastify) => {
  try {
    const result = await deleteClientsAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteClients", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const getClientUsage = async (request, reply, fastify) => {
  try {
    const result = await getClientUsageAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getClientUsage", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const getDeletedClients = async (request, reply, fastify) => {
  try {
    const result = await listDeletedClientsAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getDeletedClients", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllClients,
  getClientDetail,
  updateClientStatus,
  deleteClients,
  getClientUsage,
  getDeletedClients,
};
