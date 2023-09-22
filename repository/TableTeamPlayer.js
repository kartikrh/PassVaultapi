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

const updateTeamPlayerQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
      update "tblTeamPlayers" set "wrTeamId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $1), "wrRefPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $2), "wrPlayerOrder" = $3, "wrModifyDate" = $4, "wrModifyBy" = $5
      where "wrTeamPlayerId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $6)
      
    `,
      {
        bind: [
          data.teamId,
          data.refPlayerId,
          data.playerOrder,
          new Date(),
          data.userId,
          data.teamPlayerId,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/updateTeamPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamPlayerQuery = async (teamPlayerId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblTeamPlayers" where "wrTeamPlayerId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))
    `,
      {
        bind: [teamPlayerId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamPlayer/deleteTeamPlayerQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllTeamPlayersQuery,
  insertTeamPlayerQuery,
  updateTeamPlayerQuery,
  deleteTeamPlayerQuery,
};
