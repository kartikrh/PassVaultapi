const {
  getCommentaryPlayerBattingHistory,
  getCommentaryPlayerBowlingHistory,
  deleteCommentaryPlayerBattingHistoryQuery,
  deleteCommentaryPlayerBowlingHistoryQuery,
} = require("../repository/TableCommPlayerHistory");

// const getAllCommentaryPlayersBattingHistoryService = async (request, fastify) => {
//   const result = global.tblCommPlayerBatHist;
//   return result;
// };

// const getAllCommentaryPlayersBowlingHistoryService = async (request, fastify) => {
//   const result = global.tblCommPlayerBowlHist;
//   return result;
// };

const getCommentaryPlayerHistoryService = async (request, fastify) => {
  const commPlayerBatHis = await getCommentaryPlayerBattingHistory(
    request.body.playerId,
    fastify
  );

  const commPlayerBowlHis = await getCommentaryPlayerBowlingHistory(
    request.body.playerId,
    fastify
  );

  return { commPlayerBatHis, commPlayerBowlHis };
};

const deleteCommentaryBattingHistoryService = async (request, fastify) => {
  const { id } = request.body;
  await deleteCommentaryPlayerBattingHistoryQuery(id, fastify, request);
  global.tblCommPlayerBatHist = global.tblCommPlayerBatHist.filter(
    (item) => !id.includes(item.id)
  );

  return `Commentary Player Batting Histroy data deleted successfully`;
};

const deleteCommentaryBowlingHistoryService = async (request, fastify) => {
  const { id } = request.body;
  await deleteCommentaryPlayerBowlingHistoryQuery(id, fastify, request);
  global.tblCommPlayerBowlHist = global.tblCommPlayerBowlHist.filter(
    (item) => !id.includes(item.id)
  );

  return `Commentary Player Bowling History data deleted successfully`;
};

module.exports = {
    // getAllCommentaryPlayersBattingHistoryService,
    // getAllCommentaryPlayersBowlingHistoryService,
    getCommentaryPlayerHistoryService,
    deleteCommentaryBattingHistoryService,
    deleteCommentaryBowlingHistoryService,
};
