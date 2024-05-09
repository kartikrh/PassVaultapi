const { saveApiEndpointsService, getAllApiEndpointsService, ApiEndpointsByIdService, deleteApiEndpointsService, activeInactiveApiEndpointsService } = require("../../../../services/apiEndpoints");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/ApiEndpoints/index.js";

const getAllApiEndpoints = async (request, reply, fastify) => {
  try {
    const result = await getAllApiEndpointsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllApiEndpoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getApiEndpointsById = async (request, reply, fastify) => {
  try {
    const result = await ApiEndpointsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getApiEndpointsById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveApiEndpoints = async (request, reply, fastify) => {
  try {
    const result = await saveApiEndpointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveApiEndpoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteApiEndpoints = async (request, reply, fastify) => {
  try {
    const result = await deleteApiEndpointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteApiEndpoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveApiEndpoints = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveApiEndpointsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveApiEndpoints", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllApiEndpoints,
  getApiEndpointsById,
  saveApiEndpoints,
  deleteApiEndpoints,
  activeInactiveApiEndpoints
};