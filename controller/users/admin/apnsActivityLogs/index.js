const { insertAPNSActivityLogsService, getAllAPNSActivityLogsService, deleteAPNSActivityLogsByIdService } = require("../../../../services/apnsActivityLogs");
const { success, error, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/apnsActivityLogs/index.js";

const saveAPNSActivityLogs = async (request, reply, fastify) => {
  try {
    const result = await insertAPNSActivityLogsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveAPNSActivityLogs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const getAllAPNSActivityLogs = async (request, reply, fastify) => {
  try {
    const result = await getAllAPNSActivityLogsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllAPNSActivityLogs", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

const deleteAPNSActivityLogsById = async (request, reply, fastify) => {
  try {
    const result = await deleteAPNSActivityLogsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteAPNSActivityLogsById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}

module.exports = {
    saveAPNSActivityLogs,
    getAllAPNSActivityLogs,
    deleteAPNSActivityLogsById
}