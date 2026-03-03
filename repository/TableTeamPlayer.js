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

const AllTeamPlayersQuery = async (fastify, request) => {
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
      WHERE "wrIsDeleted" = FALSE`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/AllTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
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
        "wrPlayerOrder" as "playerOrder",
        "wrTpId" as "tpId",
        "wrMatchTypeId" as "matchTypeId"
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
      insert into "tblTeamPlayers" ("wrTeamId", "wrRefPlayerId", "wrPlayerOrder","wrCreatedDate", "wrCreatedBy", "wrTpId", "wrHomeTeam", "wrJerseyPlayerImage", "wrJerseyPlayerImagePath", "wrMatchTypeId")
      values ($1,$2, (  select "playerOrder" from display_order) + 1, $3, $4, $5, $6, $7, $8, $9)
      returning *
    )

    select 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder",
        "wrHomeTeam" as "homeTeam",
        "wrTpId" as "tpId",
        "wrMatchTypeId" as "matchtypeId"
         from "insert_team_player"

    `,
      {
        bind: [data.teamId, data.refPlayerId, new Date(), data.userId, data.tpId || null, data.homeTeam || false, data?.jerseyPlayerImage || null, data?.jerseyPlayerImagePath || null, data?.matchTypeId ?? -1],
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
        "wrTpId" as "tpId",
        "wrMatchTypeId" as "matchTypeId"
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
        "wrTpId" as "tpId",
        "wrMatchTypeId" AS "matchTypeId",
        "wrPlayerOrder" as "playerOrder"
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
          "wrTeamPlayerId" AS "teamPlayerId",
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
        "wrHomeTeam" AS "homeTeam",
        "wrMatchTypeId" AS "matchTypeId"`,
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
        ttp."wrTpId" as "tpId",
        ttp."wrMatchTypeId" as "matchTypeId",
        tmt."wrMatchType" AS "matchType"
      FROM "tblTeamPlayers" AS ttp
      LEFT JOIN "tblTeams" AS tt ON tt."wrTeamId" = ttp."wrTeamId"
      LEFT JOIN "tblPlayers" AS tp ON tp."wrPlayerId" = ttp."wrRefPlayerId"
      LEFT JOIN "tblMatchTypes" AS tmt ON tmt."wrMatchTypeId" = ttp."wrMatchTypeId"
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
        "wrHomeTeam" as "homeTeam",
        "wrMatchTypeId" as "matchTypeId"
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

const AllTeamPlayersNullImageQuery = async (fastify, request) => {
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
      WHERE "wrIsDeleted" = FALSE
      AND "wrJerseyPlayerImage" IS NULL;`,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/AllTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};


const getHomeTeamPlayerQuery = async (data, fastify, request) => {
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
      WHERE "wrIsDeleted" = FALSE 
      AND "wrRefPlayerId" = $1 
      AND "wrTeamId" = $2
      AND "wrHomeTeam" = TRUE`,
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
      "DB ERROR --> repository/TableTeamPlayer/getHomeTeamPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTeamPlayersByTeamMatchTypeIdQuery = async (request, fastify) => {
  try {
    const { teamId, matchTypeId } = request.body;
    const result = await fastify.db.query(
      `
        SELECT
          ttp."wrTeamPlayerId" AS "teamPlayerId",
          ttp."wrTeamId" AS "teamId",
          tt."wrTeamName" AS "teamName",
          ttp."wrRefPlayerId" AS "refPlayerId",
          tp."wrTpId" AS "tpId",
          tp."wrPlayerName" AS "playerName",
          ttp."wrMatchTypeId" AS "matchTypeId",
          ttp."wrPlayerOrder" AS "playerOrder",
          ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
          ttp."wrJerseyPlayerImagePath" AS "jerseyPlayerImagePath"
        FROM "tblTeamPlayers" ttp
        LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttp."wrTeamId"
        LEFT JOIN "tblPlayers" tp ON tp."wrPlayerId" = ttp."wrRefPlayerId"
        LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttp."wrMatchTypeId"
        WHERE ttp."wrTeamId" = $1 AND ttp."wrMatchTypeId" = $2 AND ttp."wrIsDeleted" = $3;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          teamId,
          matchTypeId,
          false
        ]
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableTeamPlayer/getTeamPlayersByTeamMatchTypeIdQuery",
      request
    );
    throw new Error(error.message);
  }
}

const updateTeamPlayerMatchTypeIdQuery = async (request, fastify) => {
  try {
    const { teamId, matchTypeId, refPlayerId, oldMatchTypeId, jerseyPlayerImage, jerseyPlayerImagePath } = request.body;
    const result = await fastify.db.query(
      `
      UPDATE "tblTeamPlayers" SET
        "wrMatchTypeId" = $1,
        "wrJerseyPlayerImage" = $2,
        "wrJerseyPlayerImagePath" = $3,
        "wrModifyBy" = $4,
        "wrModifyDate" = $5
      WHERE "wrTeamId" = $6 AND "wrRefPlayerId" = $7 AND "wrMatchTypeId" = $8;
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          matchTypeId,
          jerseyPlayerImage,
          jerseyPlayerImagePath,
          request?.userTokenInfo?.WrUserId ?? -5,
          new Date(),
          teamId,
          refPlayerId,
          oldMatchTypeId
        ]
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR --> repository/TableTeamPlayer.js/updateTeamPlayerMatchTypeIdQuery",
      request
    );
    throw new Error(error.message);
  }
}

const insertTeamPlayerWithHomeTeamQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      WITH display_order AS (
        SELECT COALESCE(MAX("wrPlayerOrder"), 0) AS "playerOrder"
        FROM "tblTeamPlayers"
        WHERE "wrTeamId" = $1
      ),
      insert_team_player AS (
        INSERT INTO "tblTeamPlayers" (
          "wrTeamId",
          "wrRefPlayerId",
          "wrPlayerOrder",
          "wrCreatedDate",
          "wrCreatedBy",
          "wrTpId",
          "wrHomeTeam",
          "wrJerseyPlayerImage",
          "wrJerseyPlayerImagePath",
          "wrMatchTypeId"
        )
        VALUES (
          $1,
          $2,
          (SELECT "playerOrder" FROM display_order) + 1,
          $3,
          $4,
          $5,
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM "tblTeamPlayers"
              WHERE "wrRefPlayerId" = $2
                AND "wrHomeTeam" = true AND "wrIsDeleted" = false
            )
            THEN false
            ELSE true
          END,
          $6,
          $7,
          $8
        )
        RETURNING *
      )
      SELECT
        ttp."wrTeamPlayerId" AS "teamPlayerId",
        ttp."wrTeamId" AS "teamId",
        tt."wrTeamName" AS "teamName",
        ttp."wrRefPlayerId" AS "refPlayerId",
        tp."wrTpId" AS "tpId",
        tp."wrPlayerName" AS "playerName",
        ttp."wrMatchTypeId" AS "matchTypeId",
        ttp."wrPlayerOrder" AS "playerOrder",
        ttp."wrJerseyPlayerImage" AS "jerseyPlayerImage",
        ttp."wrJerseyPlayerImagePath" AS "jerseyPlayerImagePath"
      FROM insert_team_player ttp
      LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttp."wrTeamId"
      LEFT JOIN "tblPlayers" tp ON tp."wrPlayerId" = ttp."wrRefPlayerId"
      LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttp."wrMatchTypeId"
      `,
      {
        bind: [
          data.teamId,
          data.refPlayerId,
          new Date(),
          request?.userTokenInfo?.WrUserId ?? -2,
          data.tpId ?? null,
          data?.jerseyPlayerImage ?? null,
          data?.jerseyPlayerImagePath ?? null,
          data?.matchTypeId ?? -1
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/insertTeamPlayerWithHomeTeamQuery",
      request,
      data
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerByTeamPlayerIdQuery = async (teamPlayerId, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrTeamPlayerId" = $3
    `,
      {
        bind: [true, request.userTokenInfo.WrUserId, teamPlayerId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/deleteTeamPlayerByTeamPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTeamPlayerHomeTeamByTeamPlayerIdQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrHomeTeam" = ("wrTeamPlayerId" = $1)
       WHERE "wrRefPlayerId" = $2
         AND "wrIsDeleted" = false
       RETURNING
          "wrTeamId" AS "teamId",
          "wrRefPlayerId" AS "refPlayerId",
          "wrTeamPlayerId" AS "teamPlayerId",
          "wrHomeTeam" AS "homeTeam"`,
      {
        bind: [data.teamPlayerId, data.playerId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/updateTeamPlayerHomeTeamByTeamPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTeamPlayersByTeamIdAndPlayerIdQuery = async (request, fastify) => {
  try {
    const { teamId, playerId } = request.body;
    const result = await fastify.db.query(
      `SELECT 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrJerseyPlayerImage" as "jerseyPlayerImage",
        "wrJerseyPlayerImagePath" as "jerseyPlayerImagePath",
        "wrHomeTeam" as "homeTeam",
        "wrPlayerOrder" as "playerOrder",
        "wrTpId" as "tpId",
        "wrMatchTypeId" as "matchTypeId"
      FROM "tblTeamPlayers"
      WHERE "wrRefPlayerId" = $1 AND "wrTeamId" = $2
      AND "wrIsDeleted" = FALSE`,
      {
        bind: [playerId, teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/getTeamPlayersByTeamIdAndPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerByTeamAndPlayerIdQuery = async (fastify, request) => {
  try {
    const { teamId, playerId } = request.body;
    return await fastify.db.query(
      `UPDATE "tblTeamPlayers" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrTeamId" = $3 AND "wrRefPlayerId" = $4
      RETURNING
          "wrJerseyPlayerImagePath" AS "jerseyPlayerImagePath"
    `,
      {
        bind: [true, request.userTokenInfo.WrUserId, teamId, playerId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/deleteTeamPlayerByTeamAndPlayerIdQuery",
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
  getHomeTeamPlayerByPlayerIdQuery,
  AllTeamPlayersQuery,
  AllTeamPlayersNullImageQuery,
  getHomeTeamPlayerQuery,
  getTeamPlayersByTeamMatchTypeIdQuery,
  updateTeamPlayerMatchTypeIdQuery,
  insertTeamPlayerWithHomeTeamQuery,
  deleteTeamPlayerByTeamPlayerIdQuery,
  updateTeamPlayerHomeTeamByTeamPlayerIdQuery,
  getTeamPlayersByTeamIdAndPlayerIdQuery,
  deleteTeamPlayerByTeamAndPlayerIdQuery
};
