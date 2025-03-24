const { errorLogger } = require("../utilities/logger");

const getAllTournamentTeamPointsQuery = async (fastify) => {
  return await fastify.db.query(
    `
        select
        "wrId" as "id",
        "wrGroupId" as "groupId",
        "wrTeamId" as "teamId",
        "wrCompetitionId" as "competitionId",
        "wrTotalMatches" as "totalMatches",
        "wrTotalWin" as "totalWin",
        "wrTotalLose" as "totalLose",
        "wrTotalTie" as "totalTie",
        "wrNoResult" as "noResult",
        "wrTotalPoint" as "totalPoint",
        "wrNetRunRate" as "netRunRate",
        "wrIsActive" as "isActive",
        "wrCreatedAt" as "createdAt"
        from "tblTournamentTeamPoint"
        where "wrIsDeleted" = false
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertTournamentTeamPointsQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_data as (
          insert into "tblTournamentTeamPoint" (
            "wrGroupId",
            "wrTeamId",
            "wrCompetitionId",
            "wrTotalMatches",
            "wrTotalWin",
            "wrTotalLose",
            "wrTotalTie",
            "wrNoResult",
            "wrTotalPoint",
            "wrNetRunRate",
            "wrIsActive",
            "wrCreatedAt"
          ) values (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              now()
          ) returning *
      )
      select 
        "wrId" as "id",
        "wrGroupId" as "groupId",
        "wrTeamId" as "teamId",
        "wrCompetitionId" as "competitionId",
        "wrTotalMatches" as "totalMatches",
        "wrTotalWin" as "totalWin",
        "wrTotalLose" as "totalLose",
        "wrTotalTie" as "totalTie",
        "wrNoResult" as "noResult",
        "wrTotalPoint" as "totalPoint",
        "wrNetRunRate" as "netRunRate",
        "wrIsActive" as "isActive",
        "wrCreatedAt" as "createdAt"
      from "insert_data"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.groupId === undefined ? null : data.groupId,
          data.teamId,
          data.competitionId,
          data.totalMatches === undefined ? 0 : data.totalMatches,
          data.totalWin === undefined ? 0 : data.totalWin,
          data.totalLose === undefined ? 0 : data.totalLose,
          data.totalTie === undefined ? 0 : data.totalTie,
          data.noResult === undefined ? 0 : data.noResult,
          data.totalPoint === undefined ? 0 : data.totalPoint,
          data.netRunRate === undefined ? 0 : data.netRunRate,
          data.isActive === undefined ? false : data.isActive,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/insertTournamentTeamPointsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTournamentTeamPointsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTournamentTeamPoint" 
       SET 
          "wrGroupId" = $1,
          "wrTeamId" = $2,
          "wrCompetitionId" = $3,
          "wrTotalMatches" = $4,
          "wrTotalWin" = $5,
          "wrTotalLose" = $6,
          "wrTotalTie" = $7,
          "wrNoResult" = $8,
          "wrTotalPoint" = $9,
          "wrNetRunRate" = $10,
          "wrIsActive" = $11
       WHERE "wrId" = $12`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.groupId,
          data.teamId,
          data.competitionId,
          data.totalMatches,
          data.totalWin,
          data.totalLose,
          data.totalTie,
          data.noResult,
          data.totalPoint,
          data.netRunRate,
          data.isActive,
          data.id,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/updateTournamentTeamPointsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTournamentTeamPointsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `
        update "tblTournamentTeamPoint" set
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        where "wrId" = ANY ($3)
      `,
    {
      type: fastify.db.QueryTypes.UPDATE,
      bind: [true, request.userTokenInfo.WrUserId, data],
    }
  );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/deleteTournamentTeamPointsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveTournamentTeamPointsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblTournamentTeamPoint" set
                "wrIsActive" = $1
                where "wrId" = $2
            `,
      {
        bind: [data.isActive, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/activeInactiveTournamentTeamPointsQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateTeamPointsQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTournamentTeamPoint" 
       SET 
          "wrTotalMatches" = $1,
          "wrTotalWin" = $2,
          "wrTotalLose" = $3,
          "wrTotalPoint" = $5,
          "wrNetRunRate" = $6
      WHERE "wrId" = $4
      RETURNING
        "wrId" as "id",
        "wrGroupId" as "groupId",
        "wrTeamId" as "teamId",
        "wrCompetitionId" as "competitionId",
        "wrTotalMatches" as "totalMatches",
        "wrTotalWin" as "totalWin",
        "wrTotalLose" as "totalLose",
        "wrTotalTie" as "totalTie",
        "wrNoResult" as "noResult",
        "wrTotalPoint" as "totalPoint",
        "wrNetRunRate" as "netRunRate",
        "wrIsActive" as "isActive",
        "wrCreatedAt" as "createdAt"
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.totalMatches,
          data.totalWin,
          data.totalLose,
          data.id,
          data.totalPoint,
          data.netRunRate,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/updateTournamentTeamPointsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePointsByTeamIdQuery = async (teamId, request, fastify) => {
  try {
    return await fastify.db.query(
        `
        update "tblTournamentTeamPoint" set
            "wrIsDeleted" = $1,
            "wrDeletedBy" = $2,
            "wrDeletedAt" = now()
        where "wrTeamId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, teamId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/deletePointsByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getTournamentPointsByTeamIdQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
         `
          select
           "wrId" as "id",
           "wrGroupId" as "groupId",
           "wrTeamId" as "teamId",
           "wrCompetitionId" as "competitionId",
           "wrTotalMatches" as "totalMatches",
           "wrTotalWin" as "totalWin",
           "wrTotalLose" as "totalLose",
           "wrTotalTie" as "totalTie",
           "wrNoResult" as "noResult",
           "wrTotalPoint" as "totalPoint",
           "wrNetRunRate" as "netRunRate",
           "wrIsActive" as "isActive",
           "wrCreatedAt" as "createdAt"
          from "tblTournamentTeamPoint"
          where "wrIsDeleted" = false
          and "wrCompetitionId" = $1
          and "wrTeamId" = $2
          and "wrIsActive" = true;`,
       {
         type: fastify.db.QueryTypes.SELECT,
         bind: [data.competitionId, data.teamId]
       }
    );
    return result[0]
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPoints.js/getTournamentPointsByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllTournamentTeamPointsQuery,
  insertTournamentTeamPointsQuery,
  updateTournamentTeamPointsQuery,
  deleteTournamentTeamPointsQuery,
  activeInactiveTournamentTeamPointsQuery,
  updateTeamPointsQuery,
  deletePointsByTeamIdQuery,
  getTournamentPointsByTeamIdQuery,
};
