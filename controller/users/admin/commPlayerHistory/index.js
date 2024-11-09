const {
  getAllCommentaryPlayerHistoryService,
  getCommentaryPlayerHistoryService,
  updateCommPlayerBatHistoryService,
  updateCommPlayerBowlHistoryService,
  deleteCommentaryBattingHistoryService,
  deleteCommentaryBowlingHistoryService,
} = require("../../../../services/commPlayerHistory");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/commPlayerHistory/index.js";

const getCommPlayerHistory = async (request, reply, fastify) => {
  try {
    const result = await getAllCommentaryPlayerHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllCommPlayersHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllCommentaryPlayersHistory = async (request, reply, fastify) => {
  try {
    const result = await getCommentaryPlayerHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllCommentaryPlayersHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateCommPlayerBatHistory = async (request, reply, fastify) => {
  try {
    const result = await updateCommPlayerBatHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateCommPlayerBatHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateCommPlayerBowlHistory = async (request, reply, fastify) => {
  try {
    const result = await updateCommPlayerBowlHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateCommPlayerBowlHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteCommBattingHistory = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryBattingHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteCommBattingHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteCommBowlingHistory = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryBowlingHistoryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteCommBowlingHistory",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getCommPlayerHistory,
  getAllCommentaryPlayersHistory,
  updateCommPlayerBatHistory,
  updateCommPlayerBowlHistory,
  deleteCommBattingHistory,
  deleteCommBowlingHistory,
};
