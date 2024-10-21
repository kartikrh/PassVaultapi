const { errorLogger } = require("../utilities/logger");

const getAllBattingHistory = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
                "wrBattingHistoryId" as "battingHistoryId",
                "wrMatchTypeId" as "matchTypeId",
                "wrPlayerId" as "playerId",
                "wrMatchTypeName" as "matchTypeName",
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
                "wrIsOutInHS" as "isOutInHS"
            FROM "tblPlayerBattingHistory";`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getAllBattingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getAllBowlingHistory = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
            "wrBowlingHistoryId" as "bowlingHistoryId",
            "wrMatchTypeId" as "matchTypeId",
            "wrPlayerId" as "playerId",
            "wrMatchTypeName" as "matchTypeName",
            "wrMatchCount" as "bowlerPlayedMatchCount",
            "wrInningsCount" as "bowlerPlayedInningsCount",
            "wrBallCount" as "ballCount",
            "wrTotalRuns" as "runsFromBowler",
            "wrWicketsCount" as "wicketsCount",
            "wrAverage" as "bowlerAverage",
            "wrBestBowlingInInnings" as "bestBowlingInInnigs",
            "wrBestBowlingInMatch" as "bestBowlingInMatch",
            "wrEconomy" as "economy",
            "wrStrikeRate" as "bowlerStrikeRate",
            "wr4Wickets" as "wickets4",
            "wr5Wickets" as "wickets5",
            "wr10Wickets" as "wickets10"
            FROM "tblPlayerBowlingHistory";`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getAllBowlingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getAllPlayersBattingHistory = async (playerId, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
                  tpbh."wrBattingHistoryId" as "battingHistoryId",
                  tmt."wrMatchTypeId" as "matchTypeId",
                  tpbh."wrPlayerId" as "playerId",
                  COALESCE(tpbh."wrMatchTypeName", tmt."wrMatchType") AS "matchTypeName",
                  tpbh."wrMatchCount" as "matchCount",
                  tpbh."wrInningsCount" as "inningsCount",
                  tpbh."wrNotOut" as "notOut",
                  tpbh."wrTotalRuns" as "totalRuns",
                  tpbh."wrHighestScore" as "highestScore",
                  tpbh."wrAverage" as "average",
                  tpbh."wrBallsFacedCount" as "ballsFacedCount",
                  tpbh."wrStrikeRate" as "strikeRate",
                  tpbh."wr100Count" as "countOf100",
                  tpbh."wr50Count" as "countOf50",
                  tpbh."wr4Count" as "countOf4",
                  tpbh."wr6Count" as "countOf6",
                  tpbh."wrCatchCount" as "catchCount",
                  tpbh."wrStumpCount" as "stumpCount",
                  tpbh."wrIsOutInHS" as "isOutInHS"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblPlayerBattingHistory" AS tpbh ON tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tpbh."wrPlayerId" = $1;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getAllPlayersBattingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const getAllPlayerBowlingHistory = async (playerId, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
              tpbh."wrBowlingHistoryId" as "bowlingHistoryId",
              tmt."wrMatchTypeId" as "matchTypeId",
              tpbh."wrPlayerId" as "playerId",
              COALESCE(tpbh."wrMatchTypeName", tmt."wrMatchType") AS "matchTypeName",
              tpbh."wrMatchCount" as "bowlerPlayedMatchCount",
              tpbh."wrInningsCount" as "bowlerPlayedInningsCount",
              tpbh."wrBallCount" as "ballCount",
              tpbh."wrTotalRuns" as "runsFromBowler",
              tpbh."wrWicketsCount" as "wicketsCount",
              tpbh."wrAverage" as "bowlerAverage",
              tpbh."wrBestBowlingInInnings" as "bestBowlingInInnigs",
              tpbh."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tpbh."wrEconomy" as "economy",
              tpbh."wrStrikeRate" as "bowlerStrikeRate",
              tpbh."wr4Wickets" as "wickets4",
              tpbh."wr5Wickets" as "wickets5",
              tpbh."wr10Wickets" as "wickets10"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblPlayerBowlingHistory" AS tpbh ON tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tpbh."wrPlayerId" = $1;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getAllPlayerBowlingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const exportPlayerHistoryQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
              tp."wrPlayerId" AS "playerId",
              tp."wrPlayerName" AS "playerName",
              tmt."wrMatchTypeId" AS "matchTypeId",
              tmt."wrMatchType" AS "matchTypeName",
              tmt."wrIsHistory" AS "isHistory",
              tpbh."wrBattingHistoryId" as "battingHistoryId",
              tpbh."wrMatchCount" as "matchCount",
              tpbh."wrInningsCount" as "inningsCount",
              tpbh."wrNotOut" as "notOut",
              tpbh."wrTotalRuns" as "totalRuns",
              tpbh."wrHighestScore" as "highestScore",
              tpbh."wrAverage" as "average",
              tpbh."wrBallsFacedCount" as "ballsFacedCount",
              tpbh."wrStrikeRate" as "strikeRate",
              tpbh."wr100Count" as "countOf100",
              tpbh."wr50Count" as "countOf50",
              tpbh."wr4Count" as "countOf4",
              tpbh."wr6Count" as "countOf6",
              tpbh."wrCatchCount" as "catchCount",
              tpbh."wrStumpCount" as "stumpCount",
              tpbh."wrIsOutInHS" as "isOutInHS",
              tph."wrBowlingHistoryId" as "bowlingHistoryId",
              tph."wrMatchCount" as "bowlerPlayedMatchCount",
              tph."wrInningsCount" as "bowlerPlayedInningsCount",
              tph."wrBallCount" as "ballCount",
              tph."wrTotalRuns" as "runsFromBowler",
              tph."wrWicketsCount" as "wicketsCount",
              tph."wrAverage" as "bowlerAverage",
              tph."wrBestBowlingInInnings" as "bestBowlingInInnigs",
              tph."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tph."wrEconomy" as "economy",
              tph."wrStrikeRate" as "bowlerStrikeRate",
              tph."wr4Wickets" as "wickets4",
              tph."wr5Wickets" as "wickets5",
              tph."wr10Wickets" as "wickets10"
            FROM "tblPlayers" AS tp
            CROSS JOIN "tblMatchTypes" AS tmt
            LEFT JOIN 
              "tblPlayerBattingHistory" AS tpbh 
              ON tpbh."wrPlayerId" = tp."wrPlayerId" 
              AND tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
            LEFT JOIN 
              "tblPlayerBowlingHistory" AS tph 
              ON tph."wrPlayerId" = tp."wrPlayerId" 
              AND tph."wrMatchTypeId" = tmt."wrMatchTypeId"
            WHERE tmt."wrIsHistory" = true
            ORDER BY tp."wrPlayerId" ASC;`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TablePlayerHistory.js/exportPlayerHistoryQuery",
      null
    );
    throw new Error(error.message);
  }
}

const deletePlayerBattingHistoryQuery = async (battingHistoryId, fastify, request) => {
  try {
      return await fastify.db.query(
          `delete from "tblPlayerBattingHistory" where "wrBattingHistoryId" = ANY ($1)`,
          {
              type: fastify.db.QueryTypes.DELETE,
              bind: [battingHistoryId],
          }
      );
  } catch (err) {
      errorLogger(
          fastify,
          err.message,
          "DB ERROR --> repository/TablePlayerHistory.js/deletePlayerBattingHistoryQuery",
          request
      );
      throw new Error(err.message);
  }
};

const deletePlayerBowlingHistoryQuery = async (bowlingHistoryId, fastify, request) => {
  try {
      return await fastify.db.query(
          `delete from "tblPlayerBowlingHistory" where "wrBowlingHistoryId" = ANY ($1)`,
          {
              type: fastify.db.QueryTypes.DELETE,
              bind: [bowlingHistoryId],
          }
      );
  } catch (err) {
      errorLogger(
          fastify,
          err.message,
          "DB ERROR --> repository/TablePlayerHistory.js/deletePlayerBowlingHistoryQuery",
          request
      );
      throw new Error(err.message);
  }
};

module.exports = {
  getAllPlayersBattingHistory,
  getAllPlayerBowlingHistory,
  getAllBattingHistory,
  getAllBowlingHistory,
  deletePlayerBattingHistoryQuery,
  deletePlayerBowlingHistoryQuery,
  exportPlayerHistoryQuery
};
