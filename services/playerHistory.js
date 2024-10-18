const { 
  getAllPlayerBowlingHistory, 
  getAllPlayersBattingHistory,
  deletePlayerBattingHistoryQuery,
  deletePlayerBowlingHistoryQuery,
 } = require("../repository/TablePlayerHistory");

const createPlayerBattingHistoryService = async (request, fastify) => {
  const jsonPayload = JSON.stringify(request.body);

  const result = await fastify.db.query(`CALL upsert_player_batting_history($1)`,
    {
      bind: [jsonPayload],
      type: fastify.db.QueryTypes.RAW,
    }
  );

  const updatedData = result[0] || [];
  const HistoryIdData = updatedData[0]._battinghistorydata;

  HistoryIdData.forEach((playerData) => {
    const battingHistoryId = playerData.battingHistoryId;

    const index = global.tblPlayersBattingHistory.findIndex(
      (item) => item.battingHistoryId === battingHistoryId
    );
    if (index !== -1) {
      global.tblPlayersBattingHistory[index] = playerData;
    } else {
      global.tblPlayersBattingHistory.push(playerData);
    }
  });

  return "Player Batting history data added successfully";
};

const createPlayerBowlingHistoryService = async (request, fastify) => {
  const jsonPayload = JSON.stringify(request.body);

  const result = await fastify.db.query(`CALL upsert_player_bowling_history($1)`,
    {
      bind: [jsonPayload],
      type: fastify.db.QueryTypes.RAW,
    }
  );
  const updatedData = result[0] || [];

  const bowlingHistory = updatedData[0]._bowlinghistorydata;

  bowlingHistory.forEach((playerData) => {
    const bowlingHistoryId = playerData.bowlingHistoryId;

    const index = global.tblPlayersBowlingHistory.findIndex(
      (item) => item.bowlingHistoryId === bowlingHistoryId
    );
    if (index !== -1) {
      global.tblPlayersBowlingHistory[index] = playerData;
    } else {
      global.tblPlayersBowlingHistory.push(playerData);
    }
  });
  
  return "Player Bowling history data added successfully";
};

const getAllPlayersHistoryService = async (request, fastify) => {
  const battingHistory = await getAllPlayersBattingHistory(request.body.playerId, fastify)

  const bowlingHistory = await getAllPlayerBowlingHistory(request.body.playerId, fastify)

  return {battingHistory, bowlingHistory}
}

const deleteBattingHistoryService = async (request, fastify) => {
  const { battingHistoryId } = request.body;
  await deletePlayerBattingHistoryQuery(battingHistoryId, fastify, request);
  global.tblPlayersBattingHistory = global.tblPlayersBattingHistory.filter(
    (item) => !battingHistoryId.includes(item.battingHistoryId)
  );

  return `Batting Histroy data deleted successfully`;
};

const deleteBowlingHistoryService = async (request, fastify) => {
  const { bowlingHistoryId } = request.body;
  await deletePlayerBowlingHistoryQuery(bowlingHistoryId, fastify, request);
  global.tblPlayersBowlingHistory = global.tblPlayersBowlingHistory.filter(
    (item) => !bowlingHistoryId.includes(item.bowlingHistoryId)
  );

  return `Bowling History data deleted successfully`;
};

module.exports = {
  createPlayerBattingHistoryService,
  createPlayerBowlingHistoryService,
  getAllPlayersHistoryService,
  deleteBattingHistoryService,
  deleteBowlingHistoryService
};
