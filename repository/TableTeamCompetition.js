const { errorLogger } = require("../utilities/logger");

const getAllTeamCompetitionQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        tp."wrTeamCompetitionId" as "teamCompetitionId",
        tp."wrTeamId" as "teamId",
        tp."wrRefCompetitionId" as "refCompetitionId",
        "wrCompetitionOrder" as "competitionOrder",
        tp."wrTpId" as "tpId"
         from "tblTeamCompetition" tp left join "tblEncryptedData" te on tp."wrTeamCompetitionId" = te."wrKey"
         left join "tblEncryptedData" te2 on tp."wrTeamId" = te2."wrKey"
         left join "tblEncryptedData" te3 on tp."wrRefCompetitionId" = te3."wrKey"
         where tp."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertTeamCompetitionQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `with display_order as (
      select COALESCE(max("wrCompetitionOrder"),0) as "competitionOrder" from "tblTeamCompetition" where "wrTeamId" =$1
    ),
    insert_team_competition as (
      insert into "tblTeamCompetition" ("wrTeamId", "wrRefCompetitionId", "wrCompetitionOrder","wrCreatedDate", "wrCreatedBy", "wrTpId")
      values ($1,$2, (  select "competitionOrder" from display_order) + 1, $3, $4, $5)
      returning *
    )

    select 
        "wrTeamCompetitionId" as "teamCompetitionId",
        "wrTeamId" as "teamId",
        "wrRefCompetitionId" as "refCompetitionId",
        "wrCompetitionOrder" as "competitionOrder",
        "wrTpId" as "tpId"
         from "insert_team_competition"

    `,
      {
        bind: [data.teamId, data.refCompetitionId, new Date(), data.userId, data.tpId || null],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamCompetition/insertTeamCompetitionQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamCompetitionByTeamIdQuery = async (teamId, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblTeamCompetition" set
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
      "DB ERROR --> repository/TableTeamCompetition/deleteTeamCompetitionByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamCompetitionByCompetitionIdQuery = async (competitionId, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblTeamCompetition" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
      where "wrRefCompetitionId" = $3
    `,
      {
        bind: [true, request.userTokenInfo.WrUserId, competitionId],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTeamCompetition/deleteTeamCompetitionByCompetitionIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllTeamCompetitionQuery,
  insertTeamCompetitionQuery,
  deleteTeamCompetitionByTeamIdQuery,
  deleteTeamCompetitionByCompetitionIdQuery,
};
