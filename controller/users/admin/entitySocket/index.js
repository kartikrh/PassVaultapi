const {
  getAllEntitySocketService,
  getEntitySocketByIdService,
  saveEntitySocketService,
  deleteEntitySocketService,
  activeInactiveEntitySocketService,
  changeEntityActionTypeService,
  isAutoScoreUpdateEntitySocketService,
  isAutoUpdateCommentaryEntitySocketService,
} = require("../../../../services/entitySocket");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let path = "controller/users/admin/entitySocket/index";

const getAllEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await getAllEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEntitySocketById = async (request, reply, fastify) => {
  try {
    const result = await getEntitySocketByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEntitySocketById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await saveEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await deleteEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/activeInactiveEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeEntityActionType = async (request, reply, fastify) => {
  try {
    const result = await changeEntityActionTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeEntityActionType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const isAutoScoreUpdateEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await isAutoScoreUpdateEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isAutoScoreUpdateEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const isAutoUpdateCommentaryEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await isAutoUpdateCommentaryEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/isAutoUpdateCommentaryEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllEntitySocket,
  getEntitySocketById,
  saveEntitySocket,
  deleteEntitySocket,
  activeInactiveEntitySocket,
  changeEntityActionType,
  isAutoScoreUpdateEntitySocket,
  isAutoUpdateCommentaryEntitySocket,
};
