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
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrOutCount" as "outCount"
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
            "wrBestBowlingInInnings" as "bestBowlingInInnings",
            "wrBestBowlingInMatch" as "bestBowlingInMatch",
            "wrEconomy" as "economy",
            "wrStrikeRate" as "bowlerStrikeRate",
            "wr4Wickets" as "wickets4",
            "wr5Wickets" as "wickets5",
            "wr10Wickets" as "wickets10",
            "wrCreatedBy" as "createdBy",
            "wrCreatedAt" as "createdAt"
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
                  tpbh."wrCreatedBy" as "createdBy",
                  tpbh."wrCreatedAt" as "createdAt",
                  tpbh."wrOutCount" as "outCount"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblPlayerBattingHistory" AS tpbh ON tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tpbh."wrPlayerId" = $1
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
              tpbh."wrBestBowlingInInnings" as "bestBowlingInInnings",
              tpbh."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tpbh."wrEconomy" as "economy",
              tpbh."wrStrikeRate" as "bowlerStrikeRate",
              tpbh."wr4Wickets" as "wickets4",
              tpbh."wr5Wickets" as "wickets5",
              tpbh."wr10Wickets" as "wickets10",
              tpbh."wrCreatedBy" as "createdBy",
              tpbh."wrCreatedAt" as "createdAt"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblPlayerBowlingHistory" AS tpbh ON tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tpbh."wrPlayerId" = $1
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
      "DB ERROR --> repository/TablePlayerHistory.js/getAllPlayerBowlingHistory",
      null
    );
    throw new Error(err.message);
  }
};

const exportPlayerHistoryQuery = async (data, fastify) => {
  try {
    let query = `
      SELECT DISTINCT
              tp."wrPlayerId" AS "playerId",
              tmt."wrMatchTypeId" AS "matchTypeId",
              tp."wrPlayerName" AS "playerName",
              tmt."wrMatchType" AS "matchTypeName",
              tmt."wrIsHistory" AS "isHistory",
              tpbh."wrBattingHistoryId" as "battingHistoryId",
              tph."wrBowlingHistoryId" as "bowlingHistoryId",
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
              tpbh."wrOutCount" as "outCount",
              tph."wrMatchCount" as "bowlerPlayedMatchCount",
              tph."wrInningsCount" as "bowlerPlayedInningsCount",
              tph."wrBallCount" as "ballCount",
              tph."wrTotalRuns" as "runsFromBowler",
              tph."wrWicketsCount" as "wicketsCount",
              tph."wrAverage" as "bowlerAverage",
              tph."wrBestBowlingInInnings" as "bestBowlingInInnings",
              tph."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tph."wrEconomy" as "economy",
              tph."wrStrikeRate" as "bowlerStrikeRate",
              tph."wr4Wickets" as "wickets4",
              tph."wr5Wickets" as "wickets5",
              tph."wr10Wickets" as "wickets10"
      FROM "tblPlayers" AS tp
      CROSS JOIN "tblMatchTypes" AS tmt
      LEFT JOIN "tblPlayerBattingHistory" AS tpbh 
        ON tpbh."wrPlayerId" = tp."wrPlayerId" 
        AND tpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
      LEFT JOIN "tblPlayerBowlingHistory" AS tph 
        ON tph."wrPlayerId" = tp."wrPlayerId" 
        AND tph."wrMatchTypeId" = tmt."wrMatchTypeId"
    `;

    const bindParams = [];
    if (data.teamId) {
      query += `
        LEFT JOIN "tblTeamPlayers" as ttp 
        ON ttp."wrRefPlayerId" = tp."wrPlayerId"
      `;
    }

    query += `WHERE tmt."wrIsHistory" = true AND tp."wrIsDeleted" = false AND tmt."wrIsDeleted" = false`

    if (data.eventTypeId) {
      query += ` AND tp."wrEventTypeId" = $${bindParams.length + 1}`;
      bindParams.push(data.eventTypeId);
    }

    if (data.teamId) {
      query += ` AND ttp."wrTeamId" = $${bindParams.length + 1}`;
      bindParams.push(data.teamId);
    }


    query += ` ORDER BY tp."wrPlayerId" ASC`;

    return await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: bindParams,
    });

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TablePlayerHistory.js/exportPlayerHistoryQuery",
      null
    );
    throw new Error(error.message);
  }
};

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

const getBattingHistoryByPlayerIdQuery = async (playerId, request, fastify) => {
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
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrOutCount" as "outCount"
            FROM "tblPlayerBattingHistory"
            WHERE "wrPlayerId" = $1;`,
      { 
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getBattingHistoryByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getBowlingHistoryByPlayerIdQuery = async (playerId, request, fastify) => {
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
            "wrBestBowlingInInnings" as "bestBowlingInInnings",
            "wrBestBowlingInMatch" as "bestBowlingInMatch",
            "wrEconomy" as "economy",
            "wrStrikeRate" as "bowlerStrikeRate",
            "wr4Wickets" as "wickets4",
            "wr5Wickets" as "wickets5",
            "wr10Wickets" as "wickets10",
            "wrCreatedBy" as "createdBy",
            "wrCreatedAt" as "createdAt"
            FROM "tblPlayerBowlingHistory"
            WHERE "wrPlayerId" = $1;`,
      { 
        type: fastify.db.QueryTypes.SELECT,
        bind: [playerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getBowlingHistoryByPlayerIdQuery",
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
  exportPlayerHistoryQuery,
  getBattingHistoryByPlayerIdQuery,
  getBowlingHistoryByPlayerIdQuery,
};
