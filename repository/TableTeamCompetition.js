const { errorLogger } = require("../utilities/logger");

const getAllTeamCompetitionQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
        te."wrValue" as "teamCompetitionId",
        te2."wrValue" as "teamId",
        te3."wrValue" as "refCompetitionId",
        "wrCompetitionOrder" as "competitionOrder"
         from "tblTeamCompetition" tp left join "tblEncryptedData" te on tp."wrTeamCompetitionId" = te."wrKey"
         left join "tblEncryptedData" te2 on tp."wrTeamId" = te2."wrKey"
         left join "tblEncryptedData" te3 on tp."wrRefCompetitionId" = te3."wrKey"`,
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
      insert into "tblTeamCompetition" ("wrTeamId", "wrRefCompetitionId", "wrCompetitionOrder","wrCreatedDate", "wrCreatedBy")
      values ($1,$2, (  select "competitionOrder" from display_order) + 1, $3, $4)
      returning *
    )

    select 
        "wrTeamCompetitionId" as "teamCompetitionId",
        "wrTeamId" as "teamId",
        "wrRefCompetitionId" as "refCompetitionId",
        "wrCompetitionOrder" as "competitionOrder"
         from "insert_team_competition"

    `,
      {
        bind: [data.teamId, data.refCompetitionId, new Date(), data.userId],
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
      `delete from "tblTeamCompetition" where "wrTeamId" = $1
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
      "DB ERROR --> repository/TableTeamCompetition/deleteTeamCompetitionByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTeamCompetitionByCompetitionIdQuery = async (competitionId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblTeamCompetition" where "wrRefCompetitionId" = $1
    `,
      {
        bind: [competitionId],
        type: fastify.db.QueryTypes.DELETE,
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
  insertTeamCompetitionQuery,
  deleteTeamCompetitionByTeamIdQuery,
  deleteTeamCompetitionByCompetitionIdQuery,
};
