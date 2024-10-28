const { errorLogger } = require("../utilities/logger");

const getAllCommentaryBattingHistory = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
                "wrId" as "id",
                "wrMatchTypeId" as "matchTypeId",
                "wrPlayerId" as "playerId",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryPlayerId" as "commentaryPlayerId",
                "wrMatchCount" as "matchCount",
                "wrInningsCount" as "inningsCount",
                "wrNotOut" as "notOut",
                "wrTotalRuns" as "totalRuns",
                "wrHighestScore" as "highestScore",
                "wrAverage" as "average",
                "wrBallsFacedCount" as "ballsFacedCount",
                "wrStrikeRate" as "strikeRate",
                "wr100Count" as "countOf100",
                "wr50Count" as "countOf50",
                "wr4Count" as "countOf4",
                "wr6Count" as "countOf6",
                "wrCatchCount" as "catchCount",
                "wrStumpCount" as "stumpCount",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM "tblCommPlayerBatHist";`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getAllCommentaryBattingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getAllCommentaryBowlingHistory = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
            "wrId" as "id",
            "wrMatchTypeId" as "matchTypeId",
            "wrPlayerId" as "playerId",
            "wrCommentaryId" as "commentaryId",
            "wrCommentaryPlayerId" as "commentaryPlayerId",
            "wrMatchCount" as "bowlerPlayedMatchCount",
            "wrInningsCount" as "bowlerPlayedInningsCount",
            "wrBallCount" as "ballCount",
            "wrTotalRuns" as "runsFromBowler",
            "wrWicketsCount" as "wicketsCount",
            "wrAverage" as "bowlerAverage",
            "wrBestBowlingInInnings" as "bestBowlingInInnings",
            "wrBestBowlingInMatch" as "bestBowlingInMatch",
            "wrEconomy" as "economy",
            "wrStrikeRate" as "bowlerStrikeRate",
            "wr4Wickets" as "wickets4",
            "wr5Wickets" as "wickets5",
            "wr10Wickets" as "wickets10",
            "wrCreatedBy" as "createdBy",
            "wrCreatedAt" as "createdAt"
            FROM "tblCommPlayerBowlHist";`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getAllCommentaryBowlingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getCommentaryPlayerBattingHistory = async (playerId, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
                  tcpbh."wrId" as "id",
                  tmt."wrMatchTypeId" as "matchTypeId",
                  tcpbh."wrPlayerId" as "playerId",
                  tcpbh."wrCommentaryId" as "commentaryId",
                  tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
                  tcpbh."wrMatchCount" as "matchCount",
                  tcpbh."wrInningsCount" as "inningsCount",
                  tcpbh."wrNotOut" as "notOut",
                  tcpbh."wrTotalRuns" as "totalRuns",
                  tcpbh."wrHighestScore" as "highestScore",
                  tcpbh."wrAverage" as "average",
                  tcpbh."wrBallsFacedCount" as "ballsFacedCount",
                  tcpbh."wrStrikeRate" as "strikeRate",
                  tcpbh."wr100Count" as "countOf100",
                  tcpbh."wr50Count" as "countOf50",
                  tcpbh."wr4Count" as "countOf4",
                  tcpbh."wr6Count" as "countOf6",
                  tcpbh."wrCatchCount" as "catchCount",
                  tcpbh."wrStumpCount" as "stumpCount",
                  tcpbh."wrCreatedBy" as "createdBy",
                  tcpbh."wrCreatedAt" as "createdAt"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblCommPlayerBatHist" AS tcpbh ON tcpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tcpbh."wrPlayerId" = $1
            WHERE tmt."wrIsHistory" = true AND tmt."wrIsDeleted" = false;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getCommnetaryPlayerBattingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getCommentaryPlayerBowlingHistory = async (playerId, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
              tcpbh."wrId" as "id",
              tmt."wrMatchTypeId" as "matchTypeId",
              tcpbh."wrPlayerId" as "playerId",
              tcpbh."wrCommentaryId" as "commentaryId",
              tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
              tcpbh."wrMatchCount" as "bowlerPlayedMatchCount",
              tcpbh."wrInningsCount" as "bowlerPlayedInningsCount",
              tcpbh."wrBallCount" as "ballCount",
              tcpbh."wrTotalRuns" as "runsFromBowler",
              tcpbh."wrWicketsCount" as "wicketsCount",
              tcpbh."wrAverage" as "bowlerAverage",
              tcpbh."wrBestBowlingInInnings" as "bestBowlingInInnings",
              tcpbh."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tcpbh."wrEconomy" as "economy",
              tcpbh."wrStrikeRate" as "bowlerStrikeRate",
              tcpbh."wr4Wickets" as "wickets4",
              tcpbh."wr5Wickets" as "wickets5",
              tcpbh."wr10Wickets" as "wickets10",
              tcpbh."wrCreatedBy" as "createdBy",
              tcpbh."wrCreatedAt" as "createdAt"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblCommPlayerBowlHist" AS tcpbh ON tcpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tcpbh."wrPlayerId" = $1
            WHERE tmt."wrIsHistory" = true AND tmt."wrIsDeleted" = false;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getCommentaryPlayerBowlingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const deleteCommentaryPlayerBattingHistoryQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblCommPlayerBatHist" where "wrId" = ANY ($1)`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/deleteCommentaryPlayerBattingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteCommentaryPlayerBowlingHistoryQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblCommPlayerBowlHist" where "wrId" = ANY ($1)`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/deleteCommentaryPlayerBowlingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllCommentaryBattingHistory,
  getAllCommentaryBowlingHistory,
  getCommentaryPlayerBattingHistory,
  getCommentaryPlayerBowlingHistory,
  deleteCommentaryPlayerBattingHistoryQuery,
  deleteCommentaryPlayerBowlingHistoryQuery,
};
