const { errorLogger } = require("../utilities/logger");

const getAllTeamPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        te."wrValue" as "teamPlayerId",
        te2."wrValue" as "teamId",
        te3."wrValue" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder",
        "wrHomeTeam" as "homeTeam",
        tp."wrTpId" as "tpId"
         from "tblTeamPlayers" tp left join "tblEncryptedData" te on tp."wrTeamPlayerId" = te."wrKey"
         left join "tblEncryptedData" te2 on tp."wrTeamId" = te2."wrKey"
         left join "tblEncryptedData" te3 on tp."wrRefPlayerId" = te3."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const getAllTeamPlayersByTeamIdAndPlayerIdQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrJerseyPlayerImage" as "jerseyPlayerImage",
        "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
        "wrHomeTeam" as "homeTeam",
        "wrTpId" as "tpId"
      FROM "tblTeamPlayers"
      WHERE "wrRefPlayerId" = $1 AND "wrTeamId" = $2
      AND "wrIsDeleted" = FALSE`,
      {
        bind: [data.playerId, data.teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getAllTeamPlayersByTeamIdAndPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertTeamPlayerQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with display_order as (
      select COALESCE(max("wrPlayerOrder"),0) as "playerOrder" from "tblTeamPlayers" where "wrTeamId" =$1
    ),
    insert_team_player as (
      insert into "tblTeamPlayers" ("wrTeamId", "wrRefPlayerId", "wrPlayerOrder","wrCreatedDate", "wrCreatedBy", "wrTpId", "wrHomeTeam", "wrJerseyPlayerImage", "wrJerseyPlayerImagePath")
      values ($1,$2, (  select "playerOrder" from display_order) + 1, $3, $4, $5, $6, $7, $8)
      returning *
    )

    select 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder",
        "wrHomeTeam" as "homeTeam",
        "wrTpId" as "tpId"
         from "insert_team_player"

    `,
      {
        bind: [data.teamId, data.refPlayerId, new Date(), data.userId, data.tpId || null, data.homeTeam || false, data?.jerseyPlayerImage || null, data?.jerseyPlayerImagePath || null],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/insertTeamPlayerQuery",
      request,
      data
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      where "wrTeamId" = $3
    `,
      {
        bind: [true, request.userTokenInfo.WrUserId, teamId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/deleteTeamPlayerByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerByPlayerIdQuery = async (playerId, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrRefPlayerId" = $3
    `,
      {
        bind: [true, request.userTokenInfo.WrUserId, playerId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/deleteTeamPlayerByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTeamPlayerByPlayerIdQuery = async (refPlayerId, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrJerseyPlayerImage" as "jerseyPlayerImage",
        "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
        "wrHomeTeam" as "homeTeam",
        "wrTpId" as "tpId"
      FROM "tblTeamPlayers"
      WHERE "wrRefPlayerId" = $1 AND "wrIsDeleted" = FALSE`,
      {
        bind: [refPlayerId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getTeamPlayerByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTeamPlayerByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrJerseyPlayerImage" as "jerseyPlayerImage",
        "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
        "wrHomeTeam" as "homeTeam",
        "wrTpId" as "tpId"
      FROM "tblTeamPlayers"
      WHERE "wrTeamId" = $1 AND "wrIsDeleted" = FALSE`,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getTeamPlayerByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTeamPlayerHomeTeamQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrHomeTeam" = CASE 
            WHEN "wrTeamId" = $2 THEN true
            ELSE false
          END
       WHERE "wrRefPlayerId" = $1
         AND "wrIsDeleted" = false
       RETURNING
          "wrTeamId" AS "teamId",
          "wrRefPlayerId" AS "refPlayerId",
          "wrHomeTeam" AS "homeTeam"`,
      {
        bind: [data.refPlayerId, data.teamId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/updateTeamPlayerHomeTeamQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTeamPlayerImageQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
        "wrJerseyPlayerImage" = $2,
        "wrJerseyPlayerImagePath" = $3
      WHERE "wrTeamPlayerId" = $1
      RETURNING
        "wrTeamId" AS "teamId",
        "wrRefPlayerId" AS "refPlayerId",
        "wrHomeTeam" AS "homeTeam"`,
      {
        bind: [data.teamPlayerId, data.jerseyPlayerImage, data.jerseyPlayerImagePath],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return result[0]
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/updateTeamPlayerImageQuery",
      null
    );
    throw new Error(err.message);
  }
};
const getTeamListByPlayerIdQuery = async (refPlayerId, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        ttp."wrTeamPlayerId" AS "teamPlayerId",
        ttp."wrTeamId" AS "teamId",
        tt."wrTeamName" AS "teamName",
        ttp."wrRefPlayerId" AS "refPlayerId",
        tp."wrPlayerName" AS "playerName",
        ttp."wrHomeTeam" as "homeTeam",
        ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
        ttp."wrJerseyPlayerImagePath" AS "jerseyPlayerImagePath",
        ttp."wrTpId" as "tpId"
      FROM "tblTeamPlayers" AS ttp
      LEFT JOIN "tblTeams" AS tt ON tt."wrTeamId" = ttp."wrTeamId"
      LEFT JOIN "tblPlayers" AS tp ON tp."wrPlayerId" = ttp."wrRefPlayerId"
      WHERE ttp."wrRefPlayerId" = $1 AND ttp."wrIsDeleted" = FALSE`,
      {
        bind: [refPlayerId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getTeamListByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getHomeTeamPlayerByPlayerIdQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrJerseyPlayerImage" as "jerseyPlayerImage",
        "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
        "wrTpId" as "tpId",
        "wrHomeTeam" as "homeTeam"
      FROM "tblTeamPlayers"
      WHERE "wrIsDeleted" = FALSE AND "wrRefPlayerId" = $1 AND "wrHomeTeam" = TRUE`,
      {
        bind: [data.refPlayerId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getHomeTeamPlayerByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  insertTeamPlayerQuery,
  getAllTeamPlayersByTeamIdAndPlayerIdQuery,
  deleteTeamPlayerByTeamIdQuery,
  deleteTeamPlayerByPlayerIdQuery,
  getTeamPlayerByPlayerIdQuery,
  getTeamPlayerByTeamIdQuery,
  updateTeamPlayerImageQuery,
  getTeamListByPlayerIdQuery,
  updateTeamPlayerHomeTeamQuery,
  getHomeTeamPlayerByPlayerIdQuery
};
