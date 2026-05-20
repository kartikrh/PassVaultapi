const {
  getAllClientSocketService,
  getClientSocketByIdService,
  saveClientSocketService,
  deleteClientSocketService,
  changeActionTypeService,
  activeInactiveClientSocketService,
  socketCountService,
  changeIsUpdateViewClientSocketService,
} = require("../../../../services/clientSocket");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let path = "controller/users/admin/clientSocket/index";

const getAllClientSocket = async (request, reply, fastify) => {
  try {
    const result = await getAllClientSocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllClientSocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getClientSocketById = async (request, reply, fastify) => {
  try {
    const result = await getClientSocketByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getClientSocketById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveClientSocket = async (request, reply, fastify) => {
  try {
    const result = await saveClientSocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveClientSocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteClientSocket = async (request, reply, fastify) => {
  try {
    const result = await deleteClientSocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteClientSocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeActionType = async (request, reply, fastify) => {
  try {
    const result = await changeActionTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeActionType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveClientSocket = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveClientSocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/activeInactiveClientSocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const socketCount = async (request, reply, fastify) => {
  try {
    const result = await socketCountService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/socketCount", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changeIsUpdateViewClientSocket = async (request, reply, fastify) => {
  try {
    const result = await changeIsUpdateViewClientSocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeIsUpdateViewClientSocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllClientSocket,
  getClientSocketById,
  saveClientSocket,
  deleteClientSocket,
  changeActionType,
  activeInactiveClientSocket,
  socketCount,
  changeIsUpdateViewClientSocket,
};
