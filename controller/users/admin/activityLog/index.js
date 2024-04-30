const { saveActivityLogService, getAllActivityLogService, activityLogByIdService, deleteActivityLogService } = require("../../../../services/activityLog");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/activityLog/index.js";

const getAllActivityLog = async (request, reply, fastify) => {
  try {
    const result = await getAllActivityLogService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllActivityLog", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getActivityLogById = async (request, reply, fastify) => {
  try {
    const result = await activityLogByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getActivityLogById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveActivityLog = async (request, reply, fastify) => {
  try {
    const result = await saveActivityLogService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveActivityLog", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteActivityLog = async (request, reply, fastify) => {
  try {
    const result = await deleteActivityLogService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteActivityLog", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllActivityLog,
  getActivityLogById,
  saveActivityLog,
  deleteActivityLog
};