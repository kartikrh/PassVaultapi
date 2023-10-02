const { errorLogger } = require("../utilities/logger");

const getAllTeamPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        te."wrValue" as "teamPlayerId",
        te2."wrValue" as "teamId",
        te3."wrValue" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder"
         from "tblTeamPlayers" tp left join "tblEncryptedData" te on tp."wrTeamPlayerId" = te."wrKey"
         left join "tblEncryptedData" te2 on tp."wrTeamId" = te2."wrKey"
         left join "tblEncryptedData" te3 on tp."wrRefPlayerId" = te3."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertTeamPlayerQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with display_order as (
      select COALESCE(max("wrPlayerOrder"),0) as "playerOrder" from "tblTeamPlayers" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    ),
    insert_team_player as (
      insert into "tblTeamPlayers" ("wrTeamId", "wrRefPlayerId", "wrPlayerOrder","wrCreatedDate", "wrCreatedBy")
      values ((select "wrKey" from "tblEncryptedData" where "wrValue" = $1), (select "wrKey" from "tblEncryptedData" where "wrValue" = $2), (  select "playerOrder" from display_order) + 1, $3, $4)
      returning *
    )

    select 
        te."wrValue" as "teamPlayerId",
        te2."wrValue" as "teamId",
        te3."wrValue" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder"
         from "insert_team_player" tp left join "tblEncryptedData" te on tp."wrTeamPlayerId" = te."wrKey"
         left join "tblEncryptedData" te2 on tp."wrTeamId" = te2."wrKey"
         left join "tblEncryptedData" te3 on tp."wrRefPlayerId" = te3."wrKey"

    `,
      {
        bind: [data.teamId, data.refPlayerId, new Date(), data.userId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/insertTeamPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblTeamPlayers" where "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    `,
      {
        bind: [teamId],
        type: fastify.db.QueryTypes.DELETE,
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
      `delete from "tblTeamPlayers" where "wrRefPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)
    `,
      {
        bind: [playerId],
        type: fastify.db.QueryTypes.DELETE,
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

module.exports = {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
  deleteTeamPlayerByPlayerIdQuery,
};
