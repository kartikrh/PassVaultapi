const { 
  getPlayerBatHistQuery,
  getPlayeBallHistQuery, 
  upPlayerBatHistQuery, 
  upPlayerBallHistQuery,
  savePlayerBatHistQuery,
  savePlayerBallHistQuery,
  getCommPlayerBowlHistQuery
} = require("../repository/TableCommPlayerHistory");
const { 
  getAllPlayerBowlingHistory, 
  getAllPlayersBattingHistory,
  deletePlayerBattingHistoryQuery,
  deletePlayerBowlingHistoryQuery,
  exportPlayerHistoryQuery,
  getBattingHistoryByPlayerIdQuery,
  getBowlingHistoryByPlayerIdQuery,
  getBatterHistoryQuery,
  getBowlerHistorydQuery,
 } = require("../repository/TablePlayerHistory");
const { getLogByComIdQuery, createTeamPointLogQuery } = require("../repository/TableTeamPointLogs");
 const { exportExcelFile, importPlayersHistoryData } = require("../utilities/exportImportExcel");

const createPlayerBattingHistoryService = async (request, fastify) => {    
  await validatePlayerAndMatchType(request.body, request)
  const jsonPayload = JSON.stringify(request.body.payload);

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
  await saveCommPlayerBatHistoryService(jsonPayload, fastify, request);

  return "Player Batting history data added successfully";
};

const createPlayerBowlingHistoryService = async (request, fastify) => {
  await validatePlayerAndMatchType(request.body, request)
  const jsonPayload = JSON.stringify(request.body.payload);
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
  await saveCommPlayerBowlHistoryService(jsonPayload, fastify, request);
  
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
  await saveCommPlayerBatHistoryService(playerData, fastify, request);
  await saveCommPlayerBowlHistoryService(playerData, fastify, request);
  
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

const saveCommPlayerBatHistoryService = async(jsonPayload, fastify, request) => {
  const commPlayerbatHistory = await fastify.db.query(
    `CALL proc_save_commentary_player_bat_history($1, $2)`,
    {
      bind: [jsonPayload, request.userTokenInfo.WrUserId], 
      type: fastify.db.QueryTypes.RAW,
    }
  );
  const commHistoryData = commPlayerbatHistory[0] || [];
  const battingHistoryData = commHistoryData[0]._battinghistorydata;

  if(battingHistoryData.length > 0){
    battingHistoryData.forEach((playerData) => {
        global.tblCommPlayerBatHist.push(playerData);
    });
  }
}

const saveCommPlayerBowlHistoryService = async(jsonPayload, fastify, request) => {
  const commPlayerbowHistory = await fastify.db.query(
    `CALL proc_save_commentary_player_bowl_history($1, $2)`,
    {
      bind: [jsonPayload, request.userTokenInfo.WrUserId], 
      type: fastify.db.QueryTypes.RAW,
    }
  );
  const commBowlHistoryData = commPlayerbowHistory[0] || [];
  const bowlingHistoryData = commBowlHistoryData[0]._bowlinghistorydata;

  if(bowlingHistoryData.length > 0) {
    bowlingHistoryData.forEach((playerData) => {
        global.tblCommPlayerBowlHist.push(playerData);
    });
  }
}


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
// const setPlayerHistoryService = async (data,request, fastify) => {
//   const {commentaryId} = data;

//   for(let com of commentaryId){
//     let res = await getLogByComIdQuery(
//       {
//         commentaryId: com,
//         module : "history"
//       },
//       request,
//       fastify
//     );
//     if (res.length > 0) {
//       continue;
//     }
//     let comdetail = global.tblCommentaries.find((item) => item.commentaryId === com);
//     let matchType = global.tblMatchTypes.find((item) => item.matchTypeId === comdetail.historyMatchTypeId );
//     const comPlayer = global.tblCommentaryPlayers.filter((item) => item.commentaryId === com 
//       && (item.batBall > 0 || item.bowlerTotalBall > 0))
//     .filter((item, index, self) =>
//       index === self.findIndex((t) => t.playerId === item.playerId)
//     );
//     if(comPlayer.length <= 0){
//       continue;
//     }
//     let dataToUpdate = [];
//     let playerArr = [];
//     let playerArrball = [];
//     let playerBowlHist = [];
//     for (let p of comPlayer){
//       const matchTypeCommentaries = global.tblCommentaries.filter((elem) => 
//         elem.historyMatchTypeId === matchType.matchTypeId
//       ).map((item) => {
//         return item.commentaryId
//       });
//       await fastify.db.query(`CALL proc_player_bowl_summary_calculation($1)`,
//         {
//           bind: [{playerId:p.playerId, matchTypeId: [comdetail.historyMatchTypeId]}], 
//           type: fastify.db.QueryTypes.RAW,
//         }
//       );
//       await fastify.db.query(`CALL proc_player_bat_summary_calculation($1)`,
//         {
//           bind: [{playerId:p.playerId, matchTypeId: [comdetail.historyMatchTypeId]}], 
//           type: fastify.db.QueryTypes.RAW,
//         }
//       );
//       const plyOutCount = global.tblCommentaryPlayers.filter((item) => item.playerId === p.playerId && matchTypeCommentaries.includes(item.commentaryId));
//       const player = global.tblCommentaryPlayers.filter((item) => item.playerId === p.playerId && item.commentaryId === com );
//       const comPlayerId = player.map((item) => item.commentaryPlayerId);
//       const playerBattingHistory = await getBatterHistoryQuery({playerId: p.playerId, matchTypeId: comdetail.historyMatchTypeId}, request, fastify);
//       const playeBallHis = await getBowlerHistorydQuery({playerId: p.playerId, matchTypeId: comdetail.historyMatchTypeId}, request, fastify);
//       // const playerBattingHistory = global.tblPlayersBattingHistory.find((item) => item.playerId === p.playerId && item.matchTypeId === comdetail.historyMatchTypeId);
//       // const playeBallHis = global.tblPlayersBowlingHistory.find((item) => item.playerId === p.playerId && item.matchTypeId === comdetail.historyMatchTypeId);
//       const overs = global.tblOvers.filter(item => item.commentaryId === com 
//         && comPlayerId.includes(item.bowlerId));

//         const oversInnings = [1, 2].map(innings => {
//           const filteredOvers = global.tblOvers.filter(item => item.commentaryId === com && item.currentInnings === innings && comPlayerId.includes(item.bowlerId));
//           return {
//             totalWickets: filteredOvers.reduce((acc, item) => acc + item.totalWicket, 0),
//             totalRuns: filteredOvers.reduce((acc, item) => acc + item.totalRun, 0),
//           };
//         });
        
//         const [wicketInnings1, ballRunInnings1] = [oversInnings[0].totalWickets, oversInnings[0].totalRuns];
//         const [wicketInnings2, ballRunInnings2] = [oversInnings[1].totalWickets, oversInnings[1].totalRuns];
        
//         let BBIData;
        
//         if (wicketInnings1 === 0 && wicketInnings2 === 0) {
//           BBIData = 0;
//         } else if (wicketInnings1 === 0) {
//           BBIData = `${wicketInnings2}/${ballRunInnings2}`;
//         } else if (wicketInnings2 === 0) {
//           BBIData = `${wicketInnings1}/${ballRunInnings1}`;
//         } else {
//           BBIData = (wicketInnings1 > wicketInnings2 || (wicketInnings1 === wicketInnings2 && ballRunInnings1 < ballRunInnings2))
//             ? `${wicketInnings1}/${ballRunInnings1}`
//             : `${wicketInnings2}/${ballRunInnings2}`;
//         }

//       let wicketsCount = overs.reduce((sum, item) => sum + item.totalWicket, 0);
//       let phis = {};
//       let cPlayer = {};
//       let cPlayerBall = {};
//       let pbHis = {};
//       let inningCount = player.filter((item)=>item.isInPlayingEleven == true).length; 
//       let ballsFacedCount = player.reduce((acc, item) => acc + item.batBall, 0);
//       let batRun = player.reduce((acc, item) => acc + item.batRun, 0);
//       let notOut = player.filter((item) => item.isBatterOut == false).length;
//       let sr =  ballsFacedCount != 0 ? (batRun / ballsFacedCount) * 100 : 0;
//       let batFour = player.reduce((acc, item) => acc + item.batFour, 0);
//       let batSix = player.reduce((acc, item) => acc + item.batSix, 0);
//       let catchCount = player.filter((item) => item.wicketType == 2).length;
//       let stumpCount = player.filter((item) => item.wicketType == 3).length;
//       let ballCount = overs.reduce((acc, item) => acc + item.ballCount, 0);
//       let wicket = overs.reduce((acc, item) => acc + item.totalWicket, 0);
//       let ballRun = overs.reduce((acc, item) => acc + item.totalRun, 0);
//       let ballavg = wicket != 0 ? ballRun / wicket : 0;
//       let bbi = BBIData;
//       let bbm = wicket != 0 ? `${wicket}/${ballRun}` : 0;
//       let eco = player[0].bowlerEconomy;
//       let ballSr = player[0].batsmanStrikeRate;
//       let wicket4 = wicketsCount == 4 ? 4 : 0;
//       let wicket5 = wicketsCount == 5 ? 5 : 0;
//       let wicket10 = wicketsCount >= 10 ? wicketsCount : 0;
//       // let wicket4 = overs.filter((item) => item.totalWicket == 4).length;
//       // let wicket5 = overs.filter((item) => item.totalWicket == 5).length;
//       // let wicket10 = overs.filter((item) => item.totalWicket >= 10).length;
//       let batOutCount = plyOutCount.filter((item) => item.wicketType !== null).length;
//       let batAvg = inningCount !== 0 ? batRun / inningCount : 0

//       let commBatHist = {
//         matchTypeId: comdetail.historyMatchTypeId,
//         matchTypeName: matchType.matchType,
//         playerId : p.playerId,
//         commentaryId: com,
//         commentaryPlayerId : player[0].commentaryPlayerId,
//         matchCount : 1,
//         inningsCount : inningCount,
//         notOut : notOut,
//         totalRuns : batRun,
//         highestScore : notOut != 0 ? batRun + '*' : batRun,
//         average : batAvg,
//         ballsFacedCount : ballsFacedCount,
//         strikeRate : sr,
//         countOf100 : batRun >= 100 ? 1 : 0,
//         countOf50 : batRun >= 50 ? 1 : 0,
//         countOf4 : batFour,
//         countOf6 : batSix,
//         catchCount : catchCount,
//         stumpCount : stumpCount,
//         outCount: player[0].wicketType !== null ? 1 : 0,
//         createdBy : request.userTokenInfo.WrUserId,
//       };
//       let totalOvers = 0;
//       if (ballCount > 0) {
//           totalOvers = Math.floor(ballCount / 6) + (ballCount % 6) / 6;
//       }
      
//       let bowlerEconomy = 0;
//       if (totalOvers > 0 && ballRun) {
//           bowlerEconomy = ballRun / totalOvers;
//       }
//       let commBowlHist = {
//         matchTypeId: comdetail.historyMatchTypeId,
//         matchTypeName: matchType.matchType,
//         playerId : p.playerId,
//         commentaryId: com,
//         commentaryPlayerId : player[0].commentaryPlayerId,
//         matchCount : 1,
//         inningsCount : inningCount,
//         ballCount : ballCount,
//         runsFromBowler : ballRun,
//         wicketsCount : wicket,
//         bowlerAverage : ballavg,
//         bestBowlingInInnings : bbi,
//         bestBowlingInMatch : bbm,
//         economy : bowlerEconomy,
//         bowlerStrikeRate : wicket === 0 ? 0 : ballCount / wicket,
//         wickets4 : wicket4,
//         wickets5  : wicket5,
//         wickets10 : wicket10,
//         catchCount : catchCount,
//         createdBy : request.userTokenInfo.WrUserId,
//       };
//       if(!playerBattingHistory){
//         phis = {
//           battingHistoryId: 0,
//           matchTypeId: comdetail.historyMatchTypeId,
//           matchTypeName: matchType.matchType,
//           playerId : p.playerId,
//           matchCount : 1,
//           inningsCount : inningCount,
//           notOut : notOut,
//           totalRuns : batRun,
//           highestScore : notOut != 0 ? batRun + '*' : batRun,
//           average : batAvg,
//           ballsFacedCount : ballsFacedCount,
//           strikeRate : sr,
//           countOf100 : batRun >= 100 ? 1 : 0,
//           countOf50 : batRun >= 50 ? 1 : 0,
//           countOf4 : batFour,
//           countOf6 : batSix,
//           catchCount : catchCount,
//           stumpCount : stumpCount,
//           outCount: batOutCount,
//         }
//       }
//       else {
//         let sr1 = playerBattingHistory.ballsFacedCount != 0 ? 
//         (playerBattingHistory.totalRuns + batRun) / (playerBattingHistory.ballsFacedCount + ballsFacedCount) * 100 
//         : playerBattingHistory.strikeRate;
//         let playerTotalRuns = playerBattingHistory.totalRuns + batRun
//         let totalInnings = playerBattingHistory.inningsCount + inningCount
//         let batsmanAvg = playerTotalRuns === 0 ? 0 : playerTotalRuns / totalInnings;

//         let playerScore = String(playerBattingHistory.highestScore);
//         let commScore = String(commBatHist.highestScore);
        
//         let playerHighestScore = (playerScore.includes('*') && !commScore.includes('*')) 
//             ? playerScore 
//             : (commScore.includes('*') && !playerScore.includes('*')) 
//                 ? commScore 
//                 : (parseInt(playerScore.replace('*', ''), 10) > parseInt(commScore.replace('*', ''), 10) ? playerScore : commScore);
        
//         phis = {
//           battingHistoryId: playerBattingHistory.battingHistoryId,
//           matchTypeId: comdetail.historyMatchTypeId,
//           playerId : p.playerId,
//           matchTypeName: matchType.matchType,
//           matchCount : playerBattingHistory.matchCount + 1,
//           inningsCount : playerBattingHistory.inningsCount + inningCount,
//           notOut : playerBattingHistory.notOut + notOut,
//           totalRuns : playerBattingHistory.totalRuns + batRun,
//           // highestScore : playerBattingHistory.highestScore <batRun ?batRun : playerBattingHistory.highestScore,
//           highestScore : playerHighestScore,
//           average : batsmanAvg,
//           ballsFacedCount : playerBattingHistory.ballsFacedCount + ballsFacedCount,
//           strikeRate : sr1,
//           countOf100 : batRun >= 100 ?  playerBattingHistory.countOf100 + 1 : playerBattingHistory.countOf100,
//           countOf50 : batRun >= 50  ? playerBattingHistory.countOf50 + 1 : playerBattingHistory.countOf50,
//           countOf4 : playerBattingHistory.countOf4 + batFour,
//           countOf6 : playerBattingHistory.countOf6 + batSix,
//           catchCount : playerBattingHistory.catchCount + catchCount,
//           stumpCount : playerBattingHistory.stumpCount + stumpCount,
//           outCount: playerBattingHistory.outCount + batOutCount,
//         }
//       }
//       if(!playeBallHis){
//         pbHis = {
//           bowlingHistoryId: 0,
//           matchTypeId: comdetail.historyMatchTypeId,
//           matchTypeName: matchType.matchType,
//           playerId : p.playerId,
//           bowlerPlayedMatchCount : 1,
//           bowlerPlayedInningsCount : inningCount,
//           ballCount : ballCount,
//           runsFromBowler : ballRun,
//           wicketsCount : wicket,
//           bowlerAverage : ballavg,
//           bestBowlingInInnings : bbi,
//           bestBowlingInMatch : bbm,
//           economy : eco,
//           bowlerStrikeRate : ballSr,
//           wickets4 : wicket4,
//           wickets5  : wicket5,
//           wickets10 : wicket10,
//           catchCount : 0,
//         }
//       }
//       else {
//         let bowlerAvg = 0;
//         if (playeBallHis.wicketsCount > 0 && playeBallHis.runsFromBowler > 0) {
//             bowlerAvg = playeBallHis.runsFromBowler / playeBallHis.wicketsCount;
//         }
        
//         let totalOvers = 0;
//         if (playeBallHis.ballCount > 0) {
//             totalOvers = Math.floor(playeBallHis.ballCount / 6) + (playeBallHis.ballCount % 6) / 6;
//         }
        
//         let bowlerEconomy = 0;
//         if (totalOvers > 0 && playeBallHis.runsFromBowler) {
//             bowlerEconomy = playeBallHis.runsFromBowler / totalOvers;
//         }
//         let bowlerStrikeRate = playeBallHis.wicketsCount === 0 ? 0 : playeBallHis.ballCount / playeBallHis.wicketsCount;
//         const bestInnings = await getCommPlayerBowlHistQuery(
//           {playerId: p.playerId, matchTypeId: comdetail.historyMatchTypeId},
//           request,
//           fastify
//         )
//         function compareBBIandBBM(bbi1, bbm1, bbi2, bbm2) {
//           function parseBowlingStats(stats) {
//             if (typeof stats !== 'string' || !stats.includes('/')) {
//               return { wickets: 0, runs: 0 };
//             }
//             const [wickets, runs] = stats.split('/').map(Number);
//             return { wickets, runs };
//           }
        
//           const { wickets: wickets1, runs: runs1 } = parseBowlingStats(bbi1);
//           const { wickets: wickets2, runs: runs2 } = parseBowlingStats(bbi2);
//           const { wickets: wickets1BBM, runs: runs1BBM } = parseBowlingStats(bbm1);
//           const { wickets: wickets2BBM, runs: runs2BBM } = parseBowlingStats(bbm2);
        
//           function compareStats(wickets1, runs1, wickets2, runs2) {
//             if (wickets1 > wickets2) return `${wickets1}/${runs1}`;
//             if (wickets1 < wickets2) return `${wickets2}/${runs2}`;
        
//             return runs1 < runs2 ? `${wickets1}/${runs1}` : `${wickets2}/${runs2}`;
//           }
        
//           const bestBBI = compareStats(wickets1, runs1, wickets2, runs2);
//           const bestBBM = compareStats(wickets1BBM, runs1BBM, wickets2BBM, runs2BBM);
        
//           return { bestBBI, bestBBM };
//         }
//         const { bestBBI, bestBBM } = compareBBIandBBM(bestInnings.bbi, bestInnings.bbm, bbi, bbm);
        
//       //   const compareBBM = (playeBallHis, currentBBM) => {
//       //     const parseBBI = (bbi) => {
//       //       if (!bbi || bbi === "0/0" || bbi === "0" || bbi.startsWith("0/")) {
//       //           return 0;
//       //       }
            
//       //       const [wickets, runs] = bbi.split('/').map(Number);
            
//       //       return { wickets, runs };
//       //   };
      
//       //     const playerBBM = parseBBI(playeBallHis.bestBowlingInMatch);
//       //     const currentParsedBBM = parseBBI(currentBBM);
//       //     if (
//       //         currentParsedBBM.wickets > playerBBM.wickets ||
//       //         (currentParsedBBM.wickets === playerBBM.wickets && currentParsedBBM.runs < playerBBM.runs)
//       //     ) {
//       //         return currentBBM;
//       //     } else if (
//       //       playerBBM.wickets > currentParsedBBM.wickets ||
//       //         (playerBBM.wickets === currentParsedBBM.wickets && playerBBM.runs < currentParsedBBM.runs)
//       //     ) {
//       //         return playeBallHis.bestBowlingInMatch;
//       //     }
//       //     return currentBBM;
//       // };
      
//       // const updatedBBM = compareBBM(playeBallHis, bbm);

//       // const compareBBI = (playerBallHis, currentBBI) => {
//       //   const parseBBI = (bbi) => {
//       //     if (!bbi || bbi === "0/0" || bbi === "0" || bbi.startsWith("0/")) {
//       //       return 0;
//       //     }
//       //     const [wickets, runs] = bbi.split('/').map(Number);
//       //     return { wickets, runs };
//       //   };
      
//       //   const playerBBI = parseBBI(playerBallHis.bestBowlingInInnings);
//       //   const currentParsedBBI = parseBBI(currentBBI);
      
//       //   if (
//       //     currentParsedBBI.wickets > playerBBI.wickets ||
//       //     (currentParsedBBI.wickets === playerBBI.wickets && currentParsedBBI.runs < playerBBI.runs)
//       //   ) {
//       //     return currentBBI;
//       //   } else if (
//       //     playerBBI.wickets > currentParsedBBI.wickets ||
//       //     (playerBBI.wickets === currentParsedBBI.wickets && playerBBI.runs < currentParsedBBI.runs)
//       //   ) {
//       //     return playerBallHis.bestBowlingInInnings;
//       //   }
      
//       //   return currentBBI;
//       // };
      
//       // const updatedBBI = compareBBI(playeBallHis, bbi);
//         pbHis = {
//           bowlingHistoryId: playeBallHis.bowlingHistoryId,
//           matchTypeId: comdetail.historyMatchTypeId,
//           playerId : p.playerId,
//           matchTypeName: matchType.matchType,
//           bowlerPlayedMatchCount : playeBallHis.bowlerPlayedMatchCount + 1,
//           bowlerPlayedInningsCount : playeBallHis.bowlerPlayedInningsCount + inningCount,
//           ballCount : playeBallHis.ballCount + ballCount,
//           runsFromBowler : playeBallHis.runsFromBowler + ballRun,
//           wicketsCount : playeBallHis.wicketsCount + wicket,
//           bowlerAverage : bowlerAvg,
//           // bestBowlingInInnings: updatedBBI,
//           // bestBowlingInMatch: updatedBBM,
//           bestBowlingInInnings: bestBBI,
//           bestBowlingInMatch: bestBBM,
//           economy : bowlerEconomy,
//           bowlerStrikeRate : bowlerStrikeRate,
//           wickets4 : playeBallHis.wickets4 + wicket4,
//           wickets5  : playeBallHis.wickets5 + wicket5,
//           wickets10 : playeBallHis.wickets10 + wicket10,
//           catchCount : playeBallHis.catchCount
//         }
//       }
//       dataToUpdate.push(phis);
//       playerBowlHist.push(pbHis);
//       cPlayer = {
//         ...commBatHist
//       }
//       cPlayerBall = {
//         ...commBowlHist
//       }
//       playerArr.push(cPlayer);
//       playerArrball.push(cPlayerBall);
//     }
//     let result = await fastify.db.query(`CALL upsert_player_batting_history($1, $2)`, {
//       bind: [JSON.stringify(dataToUpdate), request.userTokenInfo.WrUserId],
//       type: fastify.db.QueryTypes.SELECT,
//     });
//     const updatedData = result[0] || [];
//     const HistoryIdData = updatedData._battinghistorydata;
//     HistoryIdData.forEach((playerData) => {
//       const battingHistoryId = playerData.battingHistoryId;
//       const index = global.tblPlayersBattingHistory.findIndex(
//         (item) => item.battingHistoryId === battingHistoryId
//       );
//       if (index !== -1) {
//         global.tblPlayersBattingHistory[index] = playerData;
//       } else {
//         global.tblPlayersBattingHistory.push(playerData);
//       }
//     })

//     await fastify.db.query(`CALL proc_set_comPlayerHist($1)`, {
//       bind: [playerArr],
//       type: fastify.db.QueryTypes.SELECT,
//     });


//     let result1 = await fastify.db.query(`CALL upsert_player_bowling_history($1, $2)`, {
//       bind: [JSON.stringify(playerBowlHist), request.userTokenInfo.WrUserId],
//       type: fastify.db.QueryTypes.SELECT,
//     });
//     const updatedData1 = result1[0] || [];
//     const bowlingHistory = updatedData1._bowlinghistorydata;
//     bowlingHistory.forEach((playerData) => {
//       const bowlingHistoryId = playerData.bowlingHistoryId;
//       const index = global.tblPlayersBowlingHistory.findIndex(
//         (item) => item.bowlingHistoryId === bowlingHistoryId
//       );
//       if (index !== -1) {
//         global.tblPlayersBowlingHistory[index] = playerData;
//       } else {
//         global.tblPlayersBowlingHistory.push(playerData);
//       }
//     })

//     await fastify.db.query(`CALL proc_set_complayerballhist($1)`, {
//       bind: [playerArrball],
//       type: fastify.db.QueryTypes.SELECT,
//     });
//     await createTeamPointLogQuery(
//       {
//         commentaryId: com,
//         module : "history"
//       },
//       request,
//       fastify
//     );

//     return true;
//   }
  
//   return true;
// }

const setPlayerHistoryService = async (data,request, fastify) => {
  const {commentaryId} = data;

  for(let com of commentaryId){
    let res = await getLogByComIdQuery(
      {
        commentaryId: com,
        module : "history"
      },
      request,
      fastify
    );
    if (res.length > 0) {
      continue;
    }
    let comdetail = global.tblCommentaries.find((item) => item.commentaryId === com);
    let matchType = global.tblMatchTypes.find((item) => item.matchTypeId === comdetail.historyMatchTypeId );
    const comPlayer = global.tblCommentaryPlayers.filter((item) => item.commentaryId === com 
      && (item.batBall > 0 || item.bowlerTotalBall > 0))
    .filter((item, index, self) =>
      index === self.findIndex((t) => t.playerId === item.playerId)
    );
    if(comPlayer.length <= 0){
      continue;
    }
    let playerIds = [];
    let matchTypeIds = []
    let playerArr = [];
    let playerArrball = [];
    let dataToUpdate = [];
    let playerBowlHist = [];
    for (let p of comPlayer){
      const matchTypeCommentaries = global.tblCommentaries.filter((elem) => 
        elem.historyMatchTypeId === matchType.matchTypeId
      ).map((item) => {
        return item.commentaryId
      });

      const plyOutCount = global.tblCommentaryPlayers.filter((item) => item.playerId === p.playerId && matchTypeCommentaries.includes(item.commentaryId));
      const player = global.tblCommentaryPlayers.filter((item) => item.playerId === p.playerId && item.commentaryId === com );
      const comPlayerId = player.map((item) => item.commentaryPlayerId);
      const playerBattingHistory = await getBatterHistoryQuery({playerId: p.playerId, matchTypeId: comdetail.historyMatchTypeId}, request, fastify);
      const playeBallHis = await getBowlerHistorydQuery({playerId: p.playerId, matchTypeId: comdetail.historyMatchTypeId}, request, fastify);
      // const playerBattingHistory = global.tblPlayersBattingHistory.find((item) => item.playerId === p.playerId && item.matchTypeId === comdetail.historyMatchTypeId);
      // const playeBallHis = global.tblPlayersBowlingHistory.find((item) => item.playerId === p.playerId && item.matchTypeId === comdetail.historyMatchTypeId);
      const overs = global.tblOvers.filter(item => item.commentaryId === com 
        && comPlayerId.includes(item.bowlerId));

        const oversInnings = [1, 2].map(innings => {
          const filteredOvers = global.tblOvers.filter(item => item.commentaryId === com && item.currentInnings === innings && comPlayerId.includes(item.bowlerId));
          return {
            totalWickets: filteredOvers.reduce((acc, item) => acc + item.totalWicket, 0),
            totalRuns: filteredOvers.reduce((acc, item) => acc + item.totalRun, 0),
          };
        });
        
        const [wicketInnings1, ballRunInnings1] = [oversInnings[0].totalWickets, oversInnings[0].totalRuns];
        const [wicketInnings2, ballRunInnings2] = [oversInnings[1].totalWickets, oversInnings[1].totalRuns];
        
        let BBIData;
        
        if (wicketInnings1 === 0 && wicketInnings2 === 0) {
          BBIData = 0;
        } else if (wicketInnings1 === 0) {
          BBIData = `${wicketInnings2}/${ballRunInnings2}`;
        } else if (wicketInnings2 === 0) {
          BBIData = `${wicketInnings1}/${ballRunInnings1}`;
        } else {
          BBIData = (wicketInnings1 > wicketInnings2 || (wicketInnings1 === wicketInnings2 && ballRunInnings1 < ballRunInnings2))
            ? `${wicketInnings1}/${ballRunInnings1}`
            : `${wicketInnings2}/${ballRunInnings2}`;
        }

      let wicketsCount = overs.reduce((sum, item) => sum + item.totalWicket, 0);
      let phis = {};
      let cPlayer = {};
      let cPlayerBall = {};
      let pbHis = {};
      let inningCount = player.filter((item)=>item.isInPlayingEleven == true).length; 
      let ballsFacedCount = player.reduce((acc, item) => acc + item.batBall, 0);
      let batRun = player.reduce((acc, item) => acc + item.batRun, 0);
      let notOut = player.filter((item) => item.isBatterOut == false).length;
      let sr =  ballsFacedCount != 0 ? (batRun / ballsFacedCount) * 100 : 0;
      let batFour = player.reduce((acc, item) => acc + item.batFour, 0);
      let batSix = player.reduce((acc, item) => acc + item.batSix, 0);
      let catchCount = player.filter((item) => item.wicketType == 2).length;
      let stumpCount = player.filter((item) => item.wicketType == 3).length;
      let ballCount = overs.reduce((acc, item) => acc + item.ballCount, 0);
      let wicket = overs.reduce((acc, item) => acc + item.totalWicket, 0);
      let ballRun = overs.reduce((acc, item) => acc + item.totalRun, 0);
      let ballavg = wicket != 0 ? ballRun / wicket : 0;
      let bbi = BBIData;
      let bbm = wicket != 0 ? `${wicket}/${ballRun}` : 0;
      let eco = player[0].bowlerEconomy;
      let ballSr = player[0].batsmanStrikeRate;
      let wicket4 = wicketsCount == 4 ? 4 : 0;
      let wicket5 = wicketsCount == 5 ? 5 : 0;
      let wicket10 = wicketsCount >= 10 ? wicketsCount : 0;
      // let wicket4 = overs.filter((item) => item.totalWicket == 4).length;
      // let wicket5 = overs.filter((item) => item.totalWicket == 5).length;
      // let wicket10 = overs.filter((item) => item.totalWicket >= 10).length;
      let batOutCount = plyOutCount.filter((item) => item.wicketType !== null).length;
      let batAvg = inningCount !== 0 ? batRun / inningCount : 0

      let commBatHist = {
        matchTypeId: comdetail.historyMatchTypeId,
        matchTypeName: matchType.matchType,
        playerId : p.playerId,
        commentaryId: com,
        commentaryPlayerId : player[0].commentaryPlayerId,
        matchCount : 1,
        inningsCount : inningCount,
        notOut : notOut,
        totalRuns : batRun,
        highestScore : notOut != 0 ? batRun + '*' : batRun,
        average : batAvg,
        ballsFacedCount : ballsFacedCount,
        strikeRate : sr,
        countOf100 : batRun >= 100 ? 1 : 0,
        countOf50 : batRun >= 50 ? 1 : 0,
        countOf4 : batFour,
        countOf6 : batSix,
        catchCount : catchCount,
        stumpCount : stumpCount,
        outCount: player[0].wicketType !== null ? 1 : 0,
        createdBy : request.userTokenInfo.WrUserId,
      };
      let totalOvers = 0;
      if (ballCount > 0) {
          totalOvers = Math.floor(ballCount / 6) + (ballCount % 6) / 6;
      }
      
      let bowlerEconomy = 0;
      if (totalOvers > 0 && ballRun) {
          bowlerEconomy = ballRun / totalOvers;
      }
      let commBowlHist = {
        matchTypeId: comdetail.historyMatchTypeId,
        matchTypeName: matchType.matchType,
        playerId : p.playerId,
        commentaryId: com,
        commentaryPlayerId : player[0].commentaryPlayerId,
        matchCount : 1,
        inningsCount : inningCount,
        ballCount : ballCount,
        runsFromBowler : ballRun,
        wicketsCount : wicket,
        bowlerAverage : ballavg,
        bestBowlingInInnings : bbi,
        bestBowlingInMatch : bbm,
        economy : bowlerEconomy,
        bowlerStrikeRate : wicket === 0 ? 0 : ballCount / wicket,
        wickets4 : wicket4,
        wickets5  : wicket5,
        wickets10 : wicket10,
        catchCount : catchCount,
        createdBy : request.userTokenInfo.WrUserId,
      };
      if(!playerBattingHistory){
        phis = {
          battingHistoryId: 0,
          matchTypeId: comdetail.historyMatchTypeId,
          matchTypeName: matchType.matchType,
          playerId : p.playerId,
          matchCount : 1,
          inningsCount : inningCount,
          notOut : notOut,
          totalRuns : batRun,
          highestScore : notOut != 0 ? batRun + '*' : batRun,
          average : batAvg,
          ballsFacedCount : ballsFacedCount,
          strikeRate : sr,
          countOf100 : batRun >= 100 ? 1 : 0,
          countOf50 : batRun >= 50 ? 1 : 0,
          countOf4 : batFour,
          countOf6 : batSix,
          catchCount : catchCount,
          stumpCount : stumpCount,
          outCount: batOutCount,
        }
      }

      if(!playeBallHis){
        pbHis = {
          bowlingHistoryId: 0,
          matchTypeId: comdetail.historyMatchTypeId,
          matchTypeName: matchType.matchType,
          playerId : p.playerId,
          bowlerPlayedMatchCount : 1,
          bowlerPlayedInningsCount : inningCount,
          ballCount : ballCount,
          runsFromBowler : ballRun,
          wicketsCount : wicket,
          bowlerAverage : ballavg,
          bestBowlingInInnings : bbi,
          bestBowlingInMatch : bbm,
          economy : eco,
          bowlerStrikeRate : ballSr,
          wickets4 : wicket4,
          wickets5  : wicket5,
          wickets10 : wicket10,
          catchCount : 0,
        }
      }

      cPlayer = {
        ...commBatHist
      }
      cPlayerBall = {
        ...commBowlHist
      }
      dataToUpdate.push(phis);
      playerBowlHist.push(pbHis);
      playerArr.push(cPlayer);
      playerArrball.push(cPlayerBall);

      playerIds.push(p.playerId);
      matchTypeIds.push(comdetail.historyMatchTypeId);
    }
    if(dataToUpdate.length >= 1) {
      await fastify.db.query(`CALL upsert_player_batting_history($1, $2)`, {
      bind: [JSON.stringify(dataToUpdate), request.userTokenInfo.WrUserId],
      type: fastify.db.QueryTypes.SELECT,
    });
    }

    if(playerBowlHist.length >= 1) {
    await fastify.db.query(`CALL upsert_player_bowling_history($1, $2)`, {
      bind: [JSON.stringify(playerBowlHist), request.userTokenInfo.WrUserId],
      type: fastify.db.QueryTypes.SELECT,
    });
    }
    
    await fastify.db.query(`CALL proc_set_comPlayerHist($1)`, {
      bind: [playerArr],
      type: fastify.db.QueryTypes.SELECT,
    });


    await fastify.db.query(`CALL proc_set_complayerballhist($1)`, {
      bind: [playerArrball],
      type: fastify.db.QueryTypes.SELECT,
    });
    playerIds.forEach(async (item) => {
      await fastify.db.query(`CALL proc_player_bowl_summary_calculation($1)`,
        {
          bind: [{playerId:item, matchTypeId: matchTypeIds}], 
          type: fastify.db.QueryTypes.RAW,
        }
      );
      await fastify.db.query(`CALL proc_player_bat_summary_calculation($1)`,
        {
          bind: [{playerId:item, matchTypeId: matchTypeIds}], 
          type: fastify.db.QueryTypes.RAW,
        }
      );
    })
    await createTeamPointLogQuery(
      {
        commentaryId: com,
        module : "history"
      },
      request,
      fastify
    );

    return true;
  }
  
  return true;
}

const getPlayerHistDataService = async (request, fastify) => {
  const result = await getPlayerBatHistQuery(request.body,request,fastify)
  return result;
}
const upPlayerHistDataService = async (request, fastify) => {
  if(request.body.id === 0) {
    await savePlayerBatHistQuery(request.body, request, fastify);
    return "Player Batting history inserted successfully";
  } else {
    await upPlayerBatHistQuery(request.body, request, fastify);
    return "Player Batting history updated successfully";
  }
}
const upPlayerBallHistDataService = async (request, fastify) => {
  if(request.body.id === 0){
    await savePlayerBallHistQuery(request.body, request, fastify);
    return "Player Bowling history inserted successfully";
  } else {
    await upPlayerBallHistQuery(request.body, request, fastify);
    return "Player Bowling history updated successfully";
  }
}
const getPlayerBallHistDataService = async (request, fastify) => {
  let result = await getPlayeBallHistQuery(request.body,request,fastify);
  return result;

}

const playerBattingHistSummarycalculationService = async (request, fastify) => {
  const result = await getBattingHistoryByPlayerIdQuery(
    request.body.playerId,
    request,
    fastify
  );
  for (const item of result) {
    item.average = item.inningsCount > 0 ? item.totalRuns / item.inningsCount : 0;
    item.strikeRate =
      item.ballsFacedCount > 0
        ? (item.totalRuns / item.ballsFacedCount) * 100
        : 0;

    const jsonPayload = JSON.stringify([item]);

    await fastify.db.query(
      `CALL upsert_player_batting_history($1, $2)`,
      {
        bind: [jsonPayload, request.userTokenInfo.WrUserId],
        type: fastify.db.QueryTypes.RAW,
      }
    );
  }

  return "Player batting history updated successfully";
};

const playerBowlHistSummaryCalculationService = async(request, fastify) => {
  const result = await getBowlingHistoryByPlayerIdQuery(request.body.playerId, request, fastify);

  for (const item of result) {
    item.bowlerAverage = item.wicketsCount > 0 ? item.runsFromBowler / item.wicketsCount : 0;
    let totalOvers = 0;
    if (item.ballCount > 0) {
        totalOvers = Math.floor(item.ballCount / 6) + (item.ballCount % 6) / 6;
    }
    
    let bowlerEconomy = 0;
    if (totalOvers > 0 && item.runsFromBowler) {
        bowlerEconomy = item.runsFromBowler / totalOvers;
    }
    item.economy = bowlerEconomy
    item.bowlerStrikeRate = item.wicketsCount > 0 
      ? item.ballCount / item.wicketsCount : 0

    const jsonPayload = JSON.stringify([item]);
    await fastify.db.query(`CALL upsert_player_bowling_history($1, $2)`,
    {
      bind: [jsonPayload, request.userTokenInfo.WrUserId], 
      type: fastify.db.QueryTypes.RAW,
    }
    );
  }

  return "Player bowling history updated successfully";
}

const calculationOfCommPlayerBatHistService = async(request, fastify) => {
  await fastify.db.query(`CALL proc_player_bat_summary_calculation($1)`,
    {
      bind: [request.body], 
      type: fastify.db.QueryTypes.RAW,
    }
    );

  return "Player batting history updated successfully";
}

const calculationOfCommPlayerBowlHistService = async(request, fastify) => {
  await fastify.db.query(`CALL proc_player_bowl_summary_calculation($1)`,
    {
      bind: [request.body], 
      type: fastify.db.QueryTypes.RAW,
    }
    );

  return "Player bowling history updated successfully";
}

module.exports = {
  createPlayerBattingHistoryService,
  createPlayerBowlingHistoryService,
  getAllPlayersHistoryService,
  deleteBattingHistoryService,
  deleteBowlingHistoryService,
  exportPlayerHistoryService,
  importPlayerHistoryService,
  setPlayerHistoryService,
  getPlayerHistDataService,
  getPlayerBallHistDataService,
  upPlayerHistDataService,
  upPlayerBallHistDataService,
  playerBattingHistSummarycalculationService,
  playerBowlHistSummaryCalculationService,
  calculationOfCommPlayerBatHistService,
  calculationOfCommPlayerBowlHistService,
};  
