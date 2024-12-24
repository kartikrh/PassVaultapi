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
                tcpbh."wrCreatedAt" as "createdAt",
                tcpbh."wrOutCount" as "outCount"
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
                  tcpbh."wrCreatedAt" as "createdAt",
                  tcpbh."wrOutCount" as "outCount"
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
          "wrStumpCount" = $16,
          "wrOutCount" = $17
        WHERE "wrId" = $18
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
          data.outCount,
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
const getPlayerBatHistQuery = async (data, request , fastify) =>{
  try {
    const query = `
        SELECT 
                tcpbh."wrId" as "id",
                tcpbh."wrMatchTypeId" as "matchTypeId",
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
                tcpbh."wrCreatedAt" as "createdAt",
                tcpbh."wrOutCount" as "outCount",
                tc."wrEventName" as "eventName",
                tc."wrEventDate" as "eventDate"
        FROM "tblCommPlayerBatHist" AS tcpbh
        LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
        WHERE tcpbh."wrPlayerId" = $1 AND tcpbh."wrMatchTypeId" = $2`;
    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind : [data.playerId, data.matchTypeId]
    });
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getPlayerBatHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
const savePlayerBatHistQuery = async (data, request, fastify) =>{
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
      INSERT INTO "tblCommPlayerBatHist" (
              "wrMatchTypeId", "wrMatchCount", "wrInningsCount", "wrPlayerId", "wrNotOut", "wrTotalRuns", "wrHighestScore",
              "wrAverage", "wrBallsFacedCount", "wrStrikeRate", "wr100Count", "wr50Count", "wr4Count",
              "wr6Count", "wrCatchCount", "wrStumpCount", "wrOutCount", "wrCreatedBy", "wrCreatedAt"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, now()
              )
              RETURNING *
              )
              SELECT
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
                "wrAverage"::DOUBLE PRECISION as "average",
                "wrBallsFacedCount" as "ballsFacedCount",
                "wrStrikeRate"::DOUBLE PRECISION as "strikeRate",
                "wr100Count" as "countOf100",
                "wr50Count" as "countOf50",
                "wr4Count" as "countOf4",
                "wr6Count" as "countOf6",
                "wrCatchCount" as "catchCount",
                "wrStumpCount" as "stumpCount",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt",
                "wrOutCount" as "outCount"
              FROM insert_data;`,
      {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.matchTypeId,
        data.matchCount,
        data.inningsCount,
        data.playerId,
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
        data.outCount,
        request.userTokenInfo.WrUserId
      ],
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/upPlayerBatHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
const upPlayerBatHistQuery = async (data, request , fastify) =>{
  try {
    const query = `
      UPDATE "tblCommPlayerBatHist" SET
      "wrMatchCount" = $1,
      "wrInningsCount" = $2,
      "wrNotOut" = $3,
      "wrTotalRuns" = $4,
      "wrHighestScore" = $5,
      "wrAverage" = $6,
      "wrBallsFacedCount" = $7,
      "wrStrikeRate" = $8,
      "wr100Count" = $9,
      "wr50Count" = $10,
      "wr4Count" = $11,
      "wr6Count" = $12,
      "wrCatchCount" = $13,
      "wrStumpCount" = $14,
      "wrOutCount" = $15
      WHERE "wrId" = $16
      RETURNING
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
          "wrAverage"::DOUBLE PRECISION as "average",
          "wrBallsFacedCount" as "ballsFacedCount",
          "wrStrikeRate"::DOUBLE PRECISION as "strikeRate",
          "wr100Count" as "countOf100",
          "wr50Count" as "countOf50",
          "wr4Count" as "countOf4",
          "wr6Count" as "countOf6",
          "wrCatchCount" as "catchCount",
          "wrStumpCount" as "stumpCount",
          "wrCreatedBy" as "createdBy",
          "wrCreatedAt" as "createdAt",
          "wrOutCount" as "outCount"`
    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
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
        data.outCount,
        data.id,
      ],
    });
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/upPlayerBatHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
const savePlayerBallHistQuery = async (data, request , fastify) =>{
  try{
    const result = await fastify.db.query(
    `WITH insert_data AS (
      INSERT INTO "tblCommPlayerBowlHist" (
        "wrMatchTypeId", "wrMatchCount", "wrInningsCount", "wrPlayerId", "wrBallCount", "wrTotalRuns", 
        "wrWicketsCount", "wrAverage", "wrBestBowlingInInnings", "wrBestBowlingInMatch", 
        "wrEconomy", "wrStrikeRate", "wr4Wickets", "wr5Wickets", "wr10Wickets", "wrCreatedBy",
        "wrCreatedAt"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now())
      RETURNING *
      )        
        SELECT
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
          "wrAverage"::DOUBLE PRECISION as "bowlerAverage",
          "wrBestBowlingInInnings" as "bestBowlingInInnings",
          "wrBestBowlingInMatch" as "bestBowlingInMatch",
          "wrEconomy"::DOUBLE PRECISION as "economy",
          "wrStrikeRate"::DOUBLE PRECISION as "bowlerStrikeRate",
          "wr4Wickets" as "wickets4",
          "wr5Wickets" as "wickets5",
          "wr10Wickets" as "wickets10",
          "wrCreatedBy" as "createdBy",
          "wrCreatedAt" as "createdAt"
          FROM insert_data;`,
       {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        data.matchTypeId,
        data.bowlerPlayedMatchCount,
        data.bowlerPlayedInningsCount,
        data.playerId,
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
        request.userTokenInfo.WrUserId,
      ],
    });
    return result[0]
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/savePlayerBallHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
const upPlayerBallHistQuery = async (data, request , fastify) =>{
  try{
    const query = `
      UPDATE "tblCommPlayerBowlHist" SET
      "wrMatchCount" = $1,
      "wrInningsCount" = $2,
      "wrBallCount" = $3,
      "wrTotalRuns" = $4,
      "wrWicketsCount" = $5,
      "wrAverage" = $6,
      "wrBestBowlingInInnings" = $7,
      "wrBestBowlingInMatch" = $8,
      "wrEconomy" = $9,
      "wrStrikeRate" = $10,
      "wr4Wickets" = $11,
      "wr5Wickets" = $12,
      "wr10Wickets" = $13
      WHERE "wrId" = $14
      RETURNING
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
          "wrAverage"::DOUBLE PRECISION as "bowlerAverage",
          "wrBestBowlingInInnings" as "bestBowlingInInnings",
          "wrBestBowlingInMatch" as "bestBowlingInMatch",
          "wrEconomy"::DOUBLE PRECISION as "economy",
          "wrStrikeRate"::DOUBLE PRECISION as "bowlerStrikeRate",
          "wr4Wickets" as "wickets4",
          "wr5Wickets" as "wickets5",
          "wr10Wickets" as "wickets10",
          "wrCreatedBy" as "createdBy",
          "wrCreatedAt" as "createdAt"`;
    const result = await fastify.db.query(query, {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
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
    });
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/upPlayerBallHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
const getPlayeBallHistQuery = async (data , request , fastify)=>{
  try {
    const result = await fastify.db.query(
      `SELECT 
            tcpbh."wrId" as "id",
            tcpbh."wrMatchTypeId" as "matchTypeId",
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
            tcpbh."wrCreatedAt" as "createdAt",
            tc."wrEventName" as "eventName",
            tc."wrEventDate" as "eventDate"
            FROM "tblCommPlayerBowlHist" AS tcpbh
            LEFT JOIN "tblCommentaries" AS tc ON tc."wrCommentaryId" = tcpbh."wrCommentaryId" AND tc."wrIsDelete" = false
            WHERE tcpbh."wrMatchTypeId" = $2 AND tcpbh."wrPlayerId" = $1
      `,
      {
        type : fastify.db.QueryTypes.SELECT,
        bind : [data.playerId, data.matchTypeId]

      })
      return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommPlayerHistory.js/getPlayeBallHistQuery",
      request
    );
    throw new Error(err.message);
  }
}
module.exports = {
  getAllCommentaryBattingHistory,
  getAllCommentaryBowlingHistory,
  getCommentaryPlayerBattingHistory,
  getCommentaryPlayerBowlingHistory,
  updateCommPlayerBattingHistoryQuery,
  updateCommPlayerBowlingHistoryQuery,
  deleteCommentaryPlayerBattingHistoryQuery,
  deleteCommentaryPlayerBowlingHistoryQuery,
  getPlayerBatHistQuery,
  getPlayeBallHistQuery,
  upPlayerBatHistQuery,
  upPlayerBallHistQuery,
  savePlayerBatHistQuery,
  savePlayerBallHistQuery,
};
