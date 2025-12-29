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
                "wrOutCount" as "outCount",
                "wrFastest50Balls" as "fastest50Balls",
                "wrFastest100Balls" as "fastest100Balls"
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
            "wrCreatedAt" as "createdAt",
            "wrOverCount" as "overCount",
            "wrHattrickCount" as "hattrickCount",
            "wrExpensiveOverRuns" as "expensiveOverRuns"
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
                  tpbh."wrOutCount" as "outCount",
                  tpbh."wrFastest50Balls" as "fastest50Balls",
                  tpbh."wrFastest100Balls" as "fastest100Balls"
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
              tpbh."wrCreatedAt" as "createdAt",
              tpbh."wrOverCount" as "overCount",
              tpbh."wrHattrickCount" as "hattrickCount",
              tpbh."wrExpensiveOverRuns" as "expensiveOverRuns"
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
                "wrOutCount" as "outCount",
                "wrFastest50Balls" as "fastest50Balls",
                "wrFastest100Balls" as "fastest100Balls"
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
            "wrCreatedAt" as "createdAt",
            "wrOverCount" as "overCount",
            "wrHattrickCount" as "hattrickCount",
            "wrExpensiveOverRuns" as "expensiveOverRuns"
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


const getBatterHistoryQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
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
                "wrOutCount" as "outCount",
                "wrFastest50Balls" as "fastest50Balls",
                "wrFastest100Balls" as "fastest100Balls"
            FROM "tblPlayerBattingHistory"
            WHERE "wrPlayerId" = $1 AND "wrMatchTypeId" = $2;`,
      { 
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.playerId, data.matchTypeId],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getBatterHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getBowlerHistorydQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
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
            "wrCreatedAt" as "createdAt",
            "wrOverCount" as "overCount",
            "wrHattrickCount" as "hattrickCount",
            "wrExpensiveOverRuns" as "expensiveOverRuns"
            FROM "tblPlayerBowlingHistory"
            WHERE "wrPlayerId" = $1 AND "wrMatchTypeId" = $2;`,
      { 
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.playerId, data.matchTypeId],
      }
    );
    return result[0]
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getBowlerHistorydQuery",
      request
    );
    throw new Error(err.message);
  }
};


const getPlayersBattingHistoryByIdQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `SELECT 
                  "wrBattingHistoryId" as "battingHistoryId",
                  "wrMatchTypeId" as "matchTypeId",
                  "wrPlayerId" as "playerId",
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
                  "wrOutCount" as "outCount",
                "wrFastest50Balls" as "fastest50Balls",
                "wrFastest100Balls" as "fastest100Balls"
              FROM "tblPlayerBattingHistory"
              WHERE "wrPlayerId" = $1
              AND "wrMatchTypeId" = $2;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.playerId, data.matchTypeId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/getPlayersBattingHistoryByIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertPlayerBattingHistoryQuery = async (data, fastify, request) => {
  try {
    const queryResult = await fastify.db.query(
      `
      WITH insert_data AS (
        INSERT INTO "tblPlayerBattingHistory"
          ("wrMatchTypeId", "wrMatchTypeName", "wrPlayerId", "wrMatchCount", "wrInningsCount", "wrNotOut",
          "wrTotalRuns", "wrHighestScore", "wrAverage", "wrBallsFacedCount", "wrStrikeRate", "wr100Count",
          "wr50Count", "wr4Count", "wr6Count", "wrCatchCount", "wrStumpCount", "wrCreatedBy", "wrCreatedAt",
          "wrOutCount", "wrFastest50Balls", "wrFastest100Balls")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22)
        RETURNING *
      )
      SELECT
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
        "wrOutCount" as "outCount",
        "wrFastest50Balls" as "fastest50Balls",
        "wrFastest100Balls" as "fastest100Balls"
      FROM "insert_data";
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data?.matchTypeId ?? null,
          data?.matchTypeName ?? null,
          data?.playerId ?? null,
          data?.matchCount ?? null,
          data?.inningsCount ?? null,
          data?.notOut ?? null,
          data?.totalRuns ?? null,
          data?.highestScore ?? null,
          data?.average ?? null,
          data?.ballsFacedCount ?? null,
          data?.strikeRate ?? null,
          data?.countOf100 ?? null,
          data?.countOf50 ?? null,
          data?.countOf4 ?? null,
          data?.countOf6 ?? null,
          data?.catchCount ?? null,
          data?.stumpCount ?? null,
          request?.userTokenInfo?.WrUserId ?? -5,
          new Date(),
          data?.outCount ?? null,
          data?.fastest50Balls ?? null,
          data?.fastest100Balls ?? null
        ]
      }
    );

    return queryResult[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/insertPlayerBattingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
}

const updatePlayerBattingHistoryQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
            update "tblPlayerBattingHistory" set
              "wrMatchTypeId" = $1, "wrMatchTypeName" = $2, "wrPlayerId" = $3, "wrMatchCount" = $4, "wrInningsCount" = $5, "wrNotOut" = $6,
              "wrTotalRuns" = $7, "wrHighestScore" = $8, "wrAverage" = $9, "wrBallsFacedCount" = $10, "wrStrikeRate" = $11, "wr100Count" = $12,
              "wr50Count" = $13, "wr4Count" = $14, "wr6Count" = $15, "wrCatchCount" = $16, "wrStumpCount" = $17,
              "wrOutCount" = $18, "wrFastest50Balls" = $19, "wrFastest100Balls" = $20
            where "wrBattingHistoryId" = $21
            RETURNING *
            `,
      {
        bind: [
          data?.matchTypeId ?? null,
          data?.matchTypeName ?? null,
          data?.playerId ?? null,
          data?.matchCount ?? null,
          data?.inningsCount ?? null,
          data?.notOut ?? null,
          data?.totalRuns ?? null,
          data?.highestScore ?? null,
          data?.average ?? null,
          data?.ballsFacedCount ?? null,
          data?.strikeRate ?? null,
          data?.countOf100 ?? null,
          data?.countOf50 ?? null,
          data?.countOf4 ?? null,
          data?.countOf6 ?? null,
          data?.catchCount ?? null,
          data?.stumpCount ?? null,
          data?.outCount ?? null,
          data?.fastest50Balls ?? null,
          data?.fastest100Balls ?? null,
          data.battingHistoryId
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/updatePlayerBattingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertPlayerBowlingHistoryQuery = async (data, fastify, request) => {
  try {
    const queryResult = await fastify.db.query(
      `
      WITH insert_data AS (
        INSERT INTO "tblPlayerBowlingHistory"
          ("wrMatchTypeId", "wrMatchTypeName", "wrPlayerId", "wrMatchCount", "wrInningsCount", "wrBallCount",
          "wrTotalRuns", "wrWicketsCount", "wrAverage", "wrBestBowlingInInnings", "wrBestBowlingInMatch",
          "wrEconomy", "wrStrikeRate", "wr4Wickets", "wr5Wickets", "wr10Wickets", "wrCreatedBy", "wrCreatedAt",
          "wrOverCount", "wrHattrickCount", "wrExpensiveOverRuns")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      )
      SELECT 
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
        "wrCreatedAt" as "createdAt",
        "wrOverCount" as "overCount",
        "wrHattrickCount" as "hattrickCount",
        "wrExpensiveOverRuns" as "expensiveOverRuns"
      FROM "insert_data";
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data?.matchTypeId ?? null,
          data?.matchTypeName ?? null,
          data?.playerId ?? null,
          data?.bowlerPlayedMatchCount ?? null,
          data?.bowlerPlayedInningsCount ?? null,
          data?.ballCount ?? null,
          data?.runsFromBowler ?? null,
          data?.wicketsCount ?? null,
          data?.average ?? null,
          data?.bestBowlingInInnings ?? null,
          data?.bestBowlingInMatch ?? null,
          data?.economy ?? null,
          data?.strikeRate ?? null,
          data?.wickets4 ?? null,
          data?.wickets5 ?? null,
          data?.wickets10 ?? null,
          request?.userTokenInfo?.WrUserId ?? -5,
          new Date(),
          data?.overCount ?? null,
          data?.hattrickCount ?? null,
          data?.expensiveOverRuns ?? null
        ]
      }
    );

    return queryResult[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/insertPlayerBowlingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
}

const updatePlayerBowlingHistoryQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
            update "tblPlayerBowlingHistory" set
              "wrMatchTypeId" = $1, "wrMatchTypeName" = $2, "wrPlayerId" = $3, "wrMatchCount" = $4, "wrInningsCount" = $5, "wrBallCount" = $6,
              "wrTotalRuns" = $7, "wrWicketsCount" = $8, "wrAverage" = $9, "wrBestBowlingInInnings" = $10, "wrBestBowlingInMatch" = $11,
              "wrEconomy" = $12, "wrStrikeRate" = $13, "wr4Wickets" = $14, "wr5Wickets" = $15, "wr10Wickets" = $16,
              "wrOverCount" = $17, "wrHattrickCount" = $18, "wrExpensiveOverRuns" = $19
            where "wrBowlingHistoryId" = $20
            RETURNING *
            `,
      {
        bind: [
          data?.matchTypeId ?? null,
          data?.matchTypeName ?? null,
          data?.playerId ?? null,
          data?.bowlerPlayedMatchCount ?? null,
          data?.bowlerPlayedInningsCount ?? null,
          data?.ballCount ?? null,
          data?.runsFromBowler ?? null,
          data?.wicketsCount ?? null,
          data?.bowlerAverage ?? null,
          data?.bestBowlingInInnings ?? null,
          data?.bestBowlingInMatch ?? null,
          data?.economy ?? null,
          data?.bowlerStrikeRate ?? null,
          data?.wickets4 ?? null,
          data?.wickets5 ?? null,
          data?.wickets10 ?? null,
          data?.overCount ?? null,
          data?.hattrickCount ?? null,
          data?.expensiveOverRuns ?? null,
          data.bowlingHistoryId
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePlayerHistory.js/updatePlayerBowlingHistoryQuery",
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
  getBatterHistoryQuery,
  getBowlerHistorydQuery,
  getPlayersBattingHistoryByIdQuery,
  insertPlayerBattingHistoryQuery,
  updatePlayerBattingHistoryQuery,
  insertPlayerBowlingHistoryQuery,
  updatePlayerBowlingHistoryQuery
};
