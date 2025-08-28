const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const { allEventTypesService, allCommentaryService, changeShowClientService, activeInactiveCommentaryService, getTeamAndPlayerListServiceV1 } = require("../../../../services/agent");

let commonPath = "controller/users/admin/eventTypes/index.js";

const getAllCommentaries = async (request, reply, fastify) => {
  try {
    const result = await allCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentaries", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getEventTypeList = async (request, reply, fastify) => {
  try {
    let result = await allEventTypesService(request);
    result = result.map((item) => ({
      eventTypeId: item.eventTypeId,
      eventType: item.eventType,
    }));
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getEventTypeList",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateShowClientOfCommentary = async (request, reply, fastify) => {
  try {
    const result = await changeShowClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateShowClientOfCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveCommentary = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/activeInactiveCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTeamAndPlayerListV1 = async (request, reply, fastify) => {
  try {
    const result = await getTeamAndPlayerListServiceV1(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getTeamAndPlayerListV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getEventTypeList,
  getAllCommentaries,
  updateShowClientOfCommentary,
  activeInactiveCommentary,
  getTeamAndPlayerListV1,
};