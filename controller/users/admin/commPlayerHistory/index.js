const {
  getAllCommentaryPlayersBattingHistoryService,
  getAllCommentaryPlayersBowlingHistoryService,
  getCommentaryPlayerHistoryService,
  deleteCommentaryBattingHistoryService,
  deleteCommentaryBowlingHistoryService,
} = require("../../../../services/commPlayerHistory");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/commPlayerHistory/index.js";

// const getAllCommPlayersBatHis = async (request, reply, fastify) => {
//   try {
//     const result = await getAllCommentaryPlayersBattingHistoryService(request, fastify);
//     reply.status(200).send(success(result, 200));
//   } catch (err) {
//     errorLogger(
//       fastify,
//       err.message,
//       commonPath + "/getAllCommPlayersBatHis",
//       request
//     );
//     reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
//   }
// };

// const getAllCommPlayersBowHis = async (request, reply, fastify) => {
//   try {
//     const result = await getAllCommentaryPlayersBowlingHistoryService(request, fastify);
//     reply.status(200).send(success(result, 200));
//   } catch (err) {
//     errorLogger(
//       fastify,
//       err.message,
//       commonPath + "/getAllCommPlayersBowHis",
//       request
//     );
//     reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
//   }
// };

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
//   getAllCommPlayersBatHis,
//   getAllCommPlayersBowHis,
  getAllCommentaryPlayersHistory,
  deleteCommBattingHistory,
  deleteCommBowlingHistory,
};
