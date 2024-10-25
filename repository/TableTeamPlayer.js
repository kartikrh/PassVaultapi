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
      select COALESCE(max("wrPlayerOrder"),0) as "playerOrder" from "tblTeamPlayers" where "wrTeamId" =$1
    ),
    insert_team_player as (
      insert into "tblTeamPlayers" ("wrTeamId", "wrRefPlayerId", "wrPlayerOrder","wrCreatedDate", "wrCreatedBy")
      values ($1,$2, (  select "playerOrder" from display_order) + 1, $3, $4)
      returning *
    )

    select 
        "wrTeamPlayerId" as "teamPlayerId",
        "wrTeamId" as "teamId",
        "wrRefPlayerId" as "refPlayerId",
        "wrPlayerOrder" as "playerOrder"
         from "insert_team_player"

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

module.exports = {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
  deleteTeamPlayerByPlayerIdQuery,
};
