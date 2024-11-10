const { errorLogger } = require("../utilities/logger");

const getAllCommentaryBattingHistory = async (fastify, whereCondition = null) => {
  try {
    return await fastify.db.query(
      `SELECT 
                tcpbh."wrId" as "id",
                tcpbh."wrMatchTypeId" as "matchTypeId",
                tmt."wrMatchType" as "matchTypeName",
                te."wrEventId" as "eventId",
                te."wrEventName" as "eventName",
                tcpbh."wrPlayerId" as "playerId",
                tcpbh."wrCommentaryId" as "commentaryId",
                tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
                tcpbh."wrMatchCount" as "matchCount",
                tcpbh."wrInningsCount" as "inningsCount",
                tcpbh."wrNotOut" as "notOut",
                tcpbh."wrTotalRuns" as "totalRuns",
                tcpbh."wrHighestScore" as "highestScore",
                tcpbh."wrAverage"::DOUBLE PRECISION as "average",
                tcpbh."wrBallsFacedCount" as "ballsFacedCount",
                tcpbh."wrStrikeRate"::DOUBLE PRECISION as "strikeRate",
                tcpbh."wr100Count" as "countOf100",
                tcpbh."wr50Count" as "countOf50",
                tcpbh."wr4Count" as "countOf4",
                tcpbh."wr6Count" as "countOf6",
                tcpbh."wrCatchCount" as "catchCount",
                tcpbh."wrStumpCount" as "stumpCount",
                tcpbh."wrCreatedBy" as "createdBy",
                tcpbh."wrCreatedAt" as "createdAt"
            FROM "tblCommPlayerBatHist" AS tcpbh
            LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
            LEFT JOIN "tblEvents" AS te ON te."wrEventId" = tc."wrEventId" AND te."wrIsDeleted" = false
            LEFT JOIN "tblMatchTypes" AS tmt ON tmt."wrMatchTypeId" = tcpbh."wrMatchTypeId" AND tmt."wrIsDeleted" = false
            ${whereCondition ? `WHERE ${whereCondition}` : ""};`,
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

const getAllCommentaryBowlingHistory = async (fastify, whereCondition = null) => {
  try {
    return await fastify.db.query(
      `SELECT 
            tcpbh."wrId" as "id",
            tcpbh."wrMatchTypeId" as "matchTypeId",
            tmt."wrMatchType" as "matchTypeName",
            te."wrEventId" as "eventId",
            te."wrEventName" as "eventName",
            tcpbh."wrPlayerId" as "playerId",
            tcpbh."wrCommentaryId" as "commentaryId",
            tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
            tcpbh."wrMatchCount" as "bowlerPlayedMatchCount",
            tcpbh."wrInningsCount" as "bowlerPlayedInningsCount",
            tcpbh."wrBallCount" as "ballCount",
            tcpbh."wrTotalRuns" as "runsFromBowler",
            tcpbh."wrWicketsCount" as "wicketsCount",
            tcpbh."wrAverage"::DOUBLE PRECISION as "bowlerAverage",
            tcpbh."wrBestBowlingInInnings" as "bestBowlingInInnings",
            tcpbh."wrBestBowlingInMatch" as "bestBowlingInMatch",
            tcpbh."wrEconomy"::DOUBLE PRECISION as "economy",
            tcpbh."wrStrikeRate"::DOUBLE PRECISION as "bowlerStrikeRate",
            tcpbh."wr4Wickets" as "wickets4",
            tcpbh."wr5Wickets" as "wickets5",
            tcpbh."wr10Wickets" as "wickets10",
            tcpbh."wrCreatedBy" as "createdBy",
            tcpbh."wrCreatedAt" as "createdAt"
            FROM "tblCommPlayerBowlHist" AS tcpbh
            LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
            LEFT JOIN "tblEvents" AS te ON te."wrEventId" = tc."wrEventId" AND te."wrIsDeleted" = false
            LEFT JOIN "tblMatchTypes" AS tmt ON tmt."wrMatchTypeId" = tcpbh."wrMatchTypeId" AND tmt."wrIsDeleted" = false
            ${whereCondition ? `WHERE ${whereCondition}` : ""};`,
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
                  tmt."wrMatchType" as "matchTypeName",
                  te."wrEventId" as "eventId",
                  te."wrEventName" as "eventName",
                  tcpbh."wrPlayerId" as "playerId",
                  tcpbh."wrCommentaryId" as "commentaryId",
                  tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
                  tcpbh."wrMatchCount" as "matchCount",
                  tcpbh."wrInningsCount" as "inningsCount",
                  tcpbh."wrNotOut" as "notOut",
                  tcpbh."wrTotalRuns" as "totalRuns",
                  tcpbh."wrHighestScore" as "highestScore",
                  tcpbh."wrAverage"::DOUBLE PRECISION as "average",
                  tcpbh."wrBallsFacedCount" as "ballsFacedCount",
                  tcpbh."wrStrikeRate"::DOUBLE PRECISION as "strikeRate",
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
            LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
            LEFT JOIN "tblEvents" AS te ON te."wrEventId" = tc."wrEventId"
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
              tmt."wrMatchType" as "matchTypeName",
              te."wrEventId" as "eventId",
              te."wrEventName" as "eventName",
              tcpbh."wrPlayerId" as "playerId",
              tcpbh."wrCommentaryId" as "commentaryId",
              tcpbh."wrCommentaryPlayerId" as "commentaryPlayerId",
              tcpbh."wrMatchCount" as "bowlerPlayedMatchCount",
              tcpbh."wrInningsCount" as "bowlerPlayedInningsCount",
              tcpbh."wrBallCount" as "ballCount",
              tcpbh."wrTotalRuns" as "runsFromBowler",
              tcpbh."wrWicketsCount" as "wicketsCount",
              tcpbh."wrAverage"::DOUBLE PRECISION as "bowlerAverage",
              tcpbh."wrBestBowlingInInnings" as "bestBowlingInInnings",
              tcpbh."wrBestBowlingInMatch" as "bestBowlingInMatch",
              tcpbh."wrEconomy"::DOUBLE PRECISION as "economy",
              tcpbh."wrStrikeRate"::DOUBLE PRECISION as "bowlerStrikeRate",
              tcpbh."wr4Wickets" as "wickets4",
              tcpbh."wr5Wickets" as "wickets5",
              tcpbh."wr10Wickets" as "wickets10",
              tcpbh."wrCreatedBy" as "createdBy",
              tcpbh."wrCreatedAt" as "createdAt"
              FROM "tblMatchTypes" AS tmt
              LEFT JOIN 
              "tblCommPlayerBowlHist" AS tcpbh ON tcpbh."wrMatchTypeId" = tmt."wrMatchTypeId"
	          AND tcpbh."wrPlayerId" = $1
            LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
            LEFT JOIN "tblEvents" AS te ON te."wrEventId" = tc."wrEventId"
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

const updateCommPlayerBattingHistoryQuery = async(data, fastify, request) => {
  try{
    return await fastify.db.query(
      `UPDATE "tblCommPlayerBatHist" SET
          "wrCommentaryId" = $1,
          "wrCommentaryPlayerId" = $2,
          "wrMatchCount" = $3,
          "wrInningsCount" = $4,
          "wrNotOut" = $5,
          "wrTotalRuns" = $6,
          "wrHighestScore" = $7,
          "wrAverage" = $8,
          "wrBallsFacedCount" = $9,
          "wrStrikeRate" = $10,
          "wr100Count" = $11,
          "wr50Count" = $12,
          "wr4Count" = $13,
          "wr6Count" = $14,
          "wrCatchCount" = $15,
          "wrStumpCount" = $16
        WHERE "wrId" = $17
        `,
      {
        bind: [
          data.commentaryId || 0,
          data.commentaryPlayerId || 0,
          data.matchCount,
          data.inningsCount,
          data.notOut,
          data.totalRuns,
          data.highestScore,
          data.average,
          data.ballsFacedCount,
          data.strikeRate,
          data.countOf100,
          data.countOf50,
          data.countOf4,
          data.countOf6,
          data.catchCount,
          data.stumpCount,
          data.id,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    )
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/updateCommPlayerBattingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
}

const updateCommPlayerBowlingHistoryQuery = async(data, fastify, request) => {
  try{
    return await fastify.db.query(
      `UPDATE "tblCommPlayerBowlHist" SET
          "wrCommentaryId" = $1,
          "wrCommentaryPlayerId" = $2,
          "wrMatchCount" = $3,
          "wrInningsCount" = $4,
          "wrBallCount" = $5,
          "wrTotalRuns" = $6,
          "wrWicketsCount" = $7,
          "wrAverage" = $8,
          "wrBestBowlingInInnings" = $9,
          "wrBestBowlingInMatch" = $10,
          "wrEconomy" = $11,
          "wrStrikeRate" = $12,
          "wr4Wickets" = $13,
          "wr5Wickets" = $14,
          "wr10Wickets" = $15
        WHERE "wrId" = $16
        `,
      {
        bind: [
          data.commentaryId || 0,
          data.commentaryPlayerId || 0,
          data.bowlerPlayedMatchCount,
          data.bowlerPlayedInningsCount,
          data.ballCount,
          data.runsFromBowler,
          data.wicketsCount,
          data.bowlerAverage,
          data.bestBowlingInInnings,
          data.bestBowlingInMatch,
          data.economy,
          data.bowlerStrikeRate,
          data.wickets4,
          data.wickets5,
          data.wickets10,
          data.id,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    )
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/updateCommPlayerBowlingHistoryQuery",
      request
    );
    throw new Error(err.message);
  }
}

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
  updateCommPlayerBattingHistoryQuery,
  updateCommPlayerBowlingHistoryQuery,
  deleteCommentaryPlayerBattingHistoryQuery,
  deleteCommentaryPlayerBowlingHistoryQuery,
};
