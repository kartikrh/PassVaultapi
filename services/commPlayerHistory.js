const {
  getCommentaryPlayerBattingHistory,
  getCommentaryPlayerBowlingHistory,
  deleteCommentaryPlayerBattingHistoryQuery,
  deleteCommentaryPlayerBowlingHistoryQuery,
  updateCommPlayerBattingHistoryQuery,
  updateCommPlayerBowlingHistoryQuery,
  getAllCommentaryBattingHistory,
  getAllCommentaryBowlingHistory,
} = require("../repository/TableCommPlayerHistory");

const getAllCommentaryPlayerHistoryService = async (request, fastify) => {
  const whereCondition = `"wrPlayerId" = ${request.body.playerId}`

  const battingHistory = await getAllCommentaryBattingHistory(fastify, whereCondition);
  const bowlingHistory = await getAllCommentaryBowlingHistory(fastify, whereCondition);

  return { battingHistory, bowlingHistory };
};


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

const updateCommPlayerBatHistoryService = async (request, fastify) => {
  const { payload } = request.body;

  for (const batHist of payload) {
    const existingData = global.tblCommPlayerBatHist.find((elem) => elem.id === batHist.id);
    if(!existingData){
      continue;
    }
    const updateData = {
      id: batHist.id,
      commentaryId: batHist.commentaryId !== undefined ? parseInt(batHist.commentaryId) : existingData.commentaryId,
      commentaryPlayerId: batHist.commentaryPlayerId !== undefined ? parseInt(batHist.commentaryPlayerId) : existingData.commentaryPlayerId,
      matchCount: batHist.matchCount !== undefined ? parseInt(batHist.matchCount) : existingData.matchCount,
      inningsCount: batHist.inningsCount !== undefined ? parseInt(batHist.inningsCount) : existingData.inningsCount,
      notOut: batHist.notOut !== undefined ? parseInt(batHist.notOut) : existingData.notOut,
      totalRuns: batHist.totalRuns !== undefined ? parseInt(batHist.totalRuns) : existingData.totalRuns,
      highestScore: batHist.highestScore !== undefined ? batHist.highestScore : existingData.highestScore,
      average: batHist.average !== undefined ? parseFloat(batHist.average) : existingData.average,
      ballsFacedCount: batHist.ballsFacedCount !== undefined ? parseInt(batHist.ballsFacedCount) : existingData.ballsFacedCount,
      strikeRate: batHist.strikeRate !== undefined ? parseFloat(batHist.strikeRate) : existingData.strikeRate,
      countOf100: batHist.countOf100 !== undefined ? parseInt(batHist.countOf100) : existingData.countOf100,
      countOf50: batHist.countOf50 !== undefined ? parseInt(batHist.countOf50) : existingData.countOf50,
      countOf4: batHist.countOf4 !== undefined ? parseInt(batHist.countOf4) : existingData.countOf4,
      countOf6: batHist.countOf6 !== undefined ? parseInt(batHist.countOf6) : existingData.countOf6,
      catchCount: batHist.catchCount !== undefined ? parseInt(batHist.catchCount) : existingData.catchCount,
      stumpCount: batHist.stumpCount !== undefined ? parseInt(batHist.stumpCount) : existingData.stumpCount,
      outCount: batHist.outCount !== undefined ? parseInt(batHist.outCount) : existingData.outCount,
    }
    await updateCommPlayerBattingHistoryQuery(updateData, fastify, request);

    const index = global.tblCommPlayerBatHist.findIndex((item) => item.id === batHist.id);
    if (index !== -1) {
      global.tblCommPlayerBatHist[index] = updateData;
    }
  }

  return `Commentary Player Batting history updated successfully`;
};

const updateCommPlayerBowlHistoryService = async (request, fastify) => {
  const { payload } = request.body;

  for (const bowlHist of payload) {
    const existingData = global.tblCommPlayerBowlHist.find((elem) => elem.id === bowlHist.id);
    if(!existingData){
      continue;
    }
    
    const updateData = {
      id: bowlHist.id,
      commentaryId: bowlHist.commentaryId !== undefined ? parseInt(bowlHist.commentaryId) : existingData.commentaryId,
      commentaryPlayerId: bowlHist.commentaryPlayerId !== undefined ? parseInt(bowlHist.commentaryPlayerId) : existingData.commentaryPlayerId,
      bowlerPlayedMatchCount: bowlHist.bowlerPlayedMatchCount !== undefined ? parseInt(bowlHist.bowlerPlayedMatchCount) : existingData.bowlerPlayedMatchCount,
      bowlerPlayedInningsCount: bowlHist.bowlerPlayedInningsCount !== undefined ? parseInt(bowlHist.bowlerPlayedInningsCount) : existingData.bowlerPlayedInningsCount,
      ballCount: bowlHist.ballCount !== undefined ? parseInt(bowlHist.ballCount) : existingData.ballCount,
      runsFromBowler: bowlHist.runsFromBowler !== undefined ? parseInt(bowlHist.runsFromBowler) : existingData.runsFromBowler,
      wicketsCount: bowlHist.wicketsCount !== undefined ? parseInt(bowlHist.wicketsCount) : existingData.wicketsCount,
      bestBowlingInInnings: bowlHist.bestBowlingInInnings !== undefined ? bowlHist.bestBowlingInInnings : existingData.bestBowlingInInnings,
      bestBowlingInMatch: bowlHist.bestBowlingInMatch !== undefined ? bowlHist.bestBowlingInMatch : existingData.bestBowlingInMatch,
      bowlerAverage: bowlHist.bowlerAverage !== undefined ? parseFloat(bowlHist.bowlerAverage) : existingData.bowlerAverage,
      economy: bowlHist.economy !== undefined ? parseFloat(bowlHist.economy) : existingData.economy,
      bowlerStrikeRate: bowlHist.bowlerStrikeRate !== undefined ? parseFloat(bowlHist.bowlerStrikeRate) : existingData.bowlerStrikeRate,
      wickets4: bowlHist.wickets4 !== undefined ? parseInt(bowlHist.wickets4) : existingData.wickets4,
      wickets5: bowlHist.wickets5 !== undefined ? parseInt(bowlHist.wickets5) : existingData.wickets5,
      wickets10: bowlHist.wickets10 !== undefined ? parseInt(bowlHist.wickets10) : existingData.wickets10,
    }
    await updateCommPlayerBowlingHistoryQuery(updateData, fastify, request);

    const index = global.tblCommPlayerBowlHist.findIndex((item) => item.id == bowlHist.id);
    if(index !== -1){
      global.tblCommPlayerBowlHist[index] = updateData
    }
  };

  return `Commentary Player Bowling history updated successfully`;
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
    getAllCommentaryPlayerHistoryService,
    getCommentaryPlayerHistoryService,
    updateCommPlayerBatHistoryService,
    updateCommPlayerBowlHistoryService,
    deleteCommentaryBattingHistoryService,
    deleteCommentaryBowlingHistoryService,
};
