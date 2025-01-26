const {
  allTipsService,
  tipsByIdService,
  createTipsService,
  deleteTipsService,
  activeInactiveTipsService,
  createTipsOnExternalService,
  activeInactiveTipsOnExternalService,
  getAllTipsClientAPIService,
} = require("../../../../services/tips");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/tips/index.js";

const getAllTips = async (request, reply, fastify) => {
  try {
    const result = await allTipsService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTips", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const tipsById = async (request, reply, fastify) => {
  try {
    const result = await tipsByIdService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/tipsById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTips = async (request, reply, fastify) => {
  try {
    const result = await createTipsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveTips", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteTips = async (request, reply, fastify) => {
  try {
    const result = await deleteTipsService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteTips", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveTips = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTipsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveTips",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveExternalCommentaryTips = async (request, reply, fastify) => {
  try {
    const result = await createTipsOnExternalService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveExternalCommentaryTips", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveExternalTips = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTipsOnExternalService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveExternalTips",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllTipsClientAPI = async (request, reply, fastify) => {
  try {
    const result = await getAllTipsClientAPIService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllTipsClientAPI",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllTips,
  tipsById,
  saveTips,
  deleteTips,
  activeInactiveTips,
  saveExternalCommentaryTips,
  activeInactiveExternalTips,
  getAllTipsClientAPI,
};
