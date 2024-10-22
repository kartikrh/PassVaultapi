const { 
  getAllPlayerBowlingHistory, 
  getAllPlayersBattingHistory,
  deletePlayerBattingHistoryQuery,
  deletePlayerBowlingHistoryQuery,
  exportPlayerHistoryQuery,
 } = require("../repository/TablePlayerHistory");
 const { exportExcelFile, importPlayersHistoryData } = require("../utilities/exportImportExcel");

const createPlayerBattingHistoryService = async (request, fastify) => {    
  await validatePlayerAndMatchType(request.body, request)
  const jsonPayload = JSON.stringify(request.body);

  const result = await fastify.db.query(
    `CALL upsert_player_batting_history($1, $2)`, 
    {
      bind: [jsonPayload, request.userTokenInfo.WrUserId], 
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
  await validatePlayerAndMatchType(request.body, request)
  const jsonPayload = JSON.stringify(request.body);

  const result = await fastify.db.query(`CALL upsert_player_bowling_history($1, $2)`,
    {
      bind: [jsonPayload, request.userTokenInfo.WrUserId], 
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

const exportPlayerHistoryService = async (fastify, request, reply) => {
  const playerHistory = await exportPlayerHistoryQuery(request.body || {}, fastify);
  if(playerHistory.length === 0){
    return `Players data not available`
  }
  const exportFile = await exportExcelFile(playerHistory, reply);
  return exportFile;
};

const importPlayerHistoryService = async (fastify, request) => {
  const playerHistoryData = await importPlayersHistoryData(request.file.buffer);
  await validatePlayerAndMatchType(playerHistoryData, request)
  const playerData = JSON.stringify(playerHistoryData);

  // Inset and upate player batting history data in db and global
  const battingHistory = await fastify.db.query(`CALL upsert_player_batting_history($1, $2)`, {
    bind: [playerData, request.userTokenInfo.WrUserId],
    type: fastify.db.QueryTypes.RAW,
  });
  const updatedData = battingHistory[0] || [];
  const battingHistoryData = updatedData[0]._battinghistorydata;

  battingHistoryData.forEach((playerBattingData) => {
    const battingHistoryId = playerBattingData.battingHistoryId;

    const index = global.tblPlayersBattingHistory.findIndex(
      (item) => item.battingHistoryId === battingHistoryId
    );
    if (index !== -1) {
      global.tblPlayersBattingHistory[index] = playerBattingData;
    } else {
      global.tblPlayersBattingHistory.push(playerBattingData);
    }
  });
  
  // Inset and upate player bowling history data in db and global
  const bowlingHistory = await fastify.db.query(`CALL upsert_player_bowling_history($1, $2)`, {
    bind: [playerData, request.userTokenInfo.WrUserId],
    type: fastify.db.QueryTypes.RAW,
  });
  const updatedDatas = bowlingHistory[0] || [];
  const bowlingHistoryData = updatedDatas[0]._bowlinghistorydata;

  bowlingHistoryData.forEach((playerBowlingData) => {
    const bowlingHistoryId = playerBowlingData.bowlingHistoryId;

    const index = global.tblPlayersBowlingHistory.findIndex(
      (item) => item.bowlingHistoryId === bowlingHistoryId
    );
    if (index !== -1) {
      global.tblPlayersBowlingHistory[index] = playerBowlingData;
    } else {
      global.tblPlayersBowlingHistory.push(playerBowlingData);
    }
  });
  
  return `Player History data saved successfully`;
};

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

const validatePlayerAndMatchType = async(payload, request) => {
  payload.forEach((requestData) => {
    request.body = {payload}
    const playerValidation = global.tblPlayers.find((item) => item.playerId === requestData.playerId);
    if (!playerValidation) {
      throw new Error(`PlayerId ${requestData.playerId} not existed`)
    }

    const matchTypeValidation = global.tblMatchTypes.find((elem) => elem.matchTypeId === requestData.matchTypeId);
    if (!matchTypeValidation) {
      throw new Error(`MatchTypeId ${requestData.matchTypeId} not existed`);
    }
  });
};

module.exports = {
  createPlayerBattingHistoryService,
  createPlayerBowlingHistoryService,
  getAllPlayersHistoryService,
  deleteBattingHistoryService,
  deleteBowlingHistoryService,
  exportPlayerHistoryService,
  importPlayerHistoryService,
};
