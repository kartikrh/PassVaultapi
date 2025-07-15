const { errorLogger } = require("../utilities/logger");

const getAllTournamentTeamPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
          ttp."wrId" as "id",
          ttp."wrCompetitionId" as "competitionId",
          ttp."wrTeamId" as "teamId",
          ttp."wrPlayerId" as "playerId",
          ttp."wrPlayerName" as "playerName",
          ttp."wrCreatedBy" as  "createdBy",
          ttp."wrCreatedAt" as "createdAt",
          tp."wrPlayerTypeId" as "playerTypeId",
          tpt."wrPlayerType" as "playerType",
          ttp."wrTpId" as "tpId"
      FROM "tblTournamentTeamPlayers" AS ttp
      LEFT JOIN "tblPlayers" AS tp ON ttp."wrPlayerId" = tp."wrPlayerId"
      LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      WHERE ttp."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertTournamentTeamPlayersQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                  with insert_data as (
                      insert into "tblTournamentTeamPlayers" (
                          "wrCompetitionId",
                          "wrTeamId",
                          "wrPlayerId",
                          "wrPlayerName",
                          "wrCreatedBy",
                          "wrCreatedAt",
                          "wrTpId"
                      )
                  values ($1, $2, $3, $4, $5, now(), $6) returning *
                  )
                  select 
                          "wrId" as "id",
                          "wrCompetitionId" as "competitionId",
                          "wrTeamId" as "teamId",
                          "wrPlayerId" as "playerId",
                          "wrPlayerName" as "playerName",
                          "wrCreatedBy" as  "createdBy",
                          "wrCreatedAt" as "createdAt",
                          "wrTpId" as "tpId"
                  from "insert_data"
              `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.competitionId,
          data.teamId,
          data.playerId,
          data.playerName,
          data.userId,
          data.tpId || null
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/insertTournamentTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTournamentTeamPlayersQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
        `
          update "tblTournamentTeamPlayers" set
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
      "DB ERROR --> repository/TableTournamentTeamPlayers/deleteTournamentTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayersByTeamIdQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
          ttp."wrTeamPlayerId" AS "id",
          tttp."wrCompetitionId" AS "competitionId",
          tttp."wrPlayerId" AS "playerId",
          tttp."wrPlayerName" AS "playerName",
          tp."wrPlayerId" AS "playerId",
          tp."wrPlayerName" AS "playerName",
          ttp."wrTeamId" AS "teamId",
          ttp."wrTpId" as "tpId"
        FROM "tblTeamPlayers" AS ttp
        LEFT JOIN "tblPlayers" AS tp 
            ON ttp."wrRefPlayerId" = tp."wrPlayerId" AND tp."wrIsDeleted" = false
        LEFT JOIN "tblTournamentTeamPlayers" AS tttp
            ON tttp."wrPlayerId" = tp."wrPlayerId" 
            AND tttp."wrTeamId" = ttp."wrTeamId"
            AND tttp."wrCompetitionId" = $2
        WHERE ttp."wrTeamId" = $1 AND ttp."wrIsDeleted" = false
        AND tttp."wrPlayerId" IS NULL;`,
        {
              type: fastify.db.QueryTypes.SELECT,
              bind: [data.teamId, data.competitionId],
        }
        
    )
    // return await fastify.db.query(
    //   `SELECT 
    //       ttp."wrId" AS "id",
    //       ttp."wrCompetitionId" AS "competitionId",
    //       ttp."wrPlayerId" AS "playerId",
    //       ttp."wrPlayerName" AS "playerName",
    //       ttp."wrCreatedBy" AS  "createdBy",
    //       ttp."wrCreatedAt" AS "createdAt",
    //       tp."wrPlayerTypeId" AS "playerTypeId",
    //       tpt."wrPlayerType" AS "playerType",
    //       tp."wrPlayerId" AS "playerId",
    //       tp."wrPlayerName" AS "playerName",
    //       ttp."wrTeamId" AS "teamId"
    //     FROM "tblTeamPlayers" AS ttp
    //     LEFT JOIN "tblPlayers" AS tp 
    //         ON ttp."wrRefPlayerId" = tp."wrPlayerId" AND tp."wrIsDeleted" = false
    //     LEFT JOIN "tblTournamentTeamPlayers" AS tttp
    //         ON tttp."wrPlayerId" = tp."wrPlayerId" 
    //         AND tttp."wrTeamId" = ttp."wrTeamId"
    //         AND tttp."wrCompetitionId" = $2
    //     WHERE ttp."wrTeamId" = $1 AND ttp."wrIsDeleted" = false
    //     AND tttp."wrPlayerId" IS NULL;`,
    //   {
    //     type: fastify.db.QueryTypes.SELECT,
    //     bind: [data.teamId, data.competitionId],
    //   }
    // );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/getAllPlayersByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deletePlayerByTeamQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
        `
          update "tblTournamentTeamPlayers" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
          where "wrTeamId" = ANY ($3) AND
          "wrCompetitionId" = $4
        `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, data.teamId, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/deleteTournamentTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTournamentPlayersByPlayerIdQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
        `
          update "tblTournamentTeamPlayers" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
          where "wrPlayerId" = ANY ($3);
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
      "DB ERROR --> repository/TableTournamentTeamPlayers/deleteTournamentPlayersByPlayerIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePlayersByTeamIdQuery = async (teamId, request, fastify) => {
  try {
    return await fastify.db.query(
        `
          update "tblTournamentTeamPlayers" set
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
      "DB ERROR --> repository/TableTournamentTeamPlayers/deletePlayersByTeamIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getAllPlayersByTeamAndCompetitionIdQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `SELECT 
          ttp."wrId" as "id",
          ttp."wrCompetitionId" as "competitionId",
          ttp."wrTeamId" as "teamId",
          ttp."wrPlayerId" as "playerId",
          ttp."wrPlayerName" as "playerName",
          ttp."wrCreatedBy" as  "createdBy",
          ttp."wrCreatedAt" as "createdAt",
          tp."wrPlayerTypeId" as "playerTypeId",
          tpt."wrPlayerType" as "playerType",
          ttp."wrTpId" as "tpId"
      FROM "tblTournamentTeamPlayers" AS ttp
      LEFT JOIN "tblPlayers" AS tp ON ttp."wrPlayerId" = tp."wrPlayerId"
      LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      WHERE ttp."wrIsDeleted" = false
      AND ttp."wrTeamId" = $1
      AND ttp."wrCompetitionId" = $2`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.teamId, data.competitionId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/getAllPlayersByTeamAndCompetitionIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getPlayerByIdsQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
          ttp."wrId" as "id",
          ttp."wrCompetitionId" as "competitionId",
          ttp."wrTeamId" as "teamId",
          ttp."wrPlayerId" as "playerId",
          ttp."wrPlayerName" as "playerName",
          ttp."wrCreatedBy" as  "createdBy",
          ttp."wrCreatedAt" as "createdAt",
          tp."wrPlayerTypeId" as "playerTypeId",
          tpt."wrPlayerType" as "playerType",
          ttp."wrTpId" as "tpId"
      FROM "tblTournamentTeamPlayers" AS ttp
      LEFT JOIN "tblPlayers" AS tp ON ttp."wrPlayerId" = tp."wrPlayerId"
      LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      WHERE ttp."wrIsDeleted" = false
      AND ttp."wrTeamId" = $1
      AND ttp."wrCompetitionId" = $2
      AND ttp."wrPlayerId" = $3`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.teamId, data.competitionId, data.playerId],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/getPlayerByIdsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertEntityImportLogsQuery = async (message, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                      insert into "tblEntityImportLogs" (
                          "wrMessage",
                          "wrCreatedBy",
                          "wrCreatedAT"
                      )
                  values ($1, $2, now())
              `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          message,
          request.userTokenInfo.WrUserId
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/insertTournamentTeamPlayersQuery",
      request
    );
    throw new Error(err.message);
  }
};
const getAllTournamentTeamPlayerByIdsQuery = async (data,request,fastify) => {
  try {
      return await fastify.db.query(
    `SELECT 
          ttp."wrId" as "id",
          ttp."wrCompetitionId" as "competitionId",
          ttp."wrTeamId" as "teamId",
          ttp."wrPlayerId" as "playerId",
          ttp."wrPlayerName" as "playerName",
          ttp."wrCreatedBy" as  "createdBy",
          ttp."wrCreatedAt" as "createdAt",
          tp."wrPlayerTypeId" as "playerTypeId",
          tpt."wrPlayerType" as "playerType",
          ttp."wrTpId" as "tpId"
      FROM "tblTournamentTeamPlayers" AS ttp
      LEFT JOIN "tblPlayers" AS tp ON ttp."wrPlayerId" = tp."wrPlayerId"
      LEFT JOIN "tblPlayerTypes" AS tpt ON tp."wrPlayerTypeId" = tpt."wrPlayerTypeId"
      WHERE ttp."wrIsDeleted" = false
      AND ttp."wrId" = ANY($1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind : [
        data.tournamentTeamPlayers
      ]
    }
  );
  } catch (err) {
     errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTournamentTeamPlayers/getAllTournamentTeamPlayerByIdsQuery",
      request
    );
    return true;
    // throw new Error(err.message);
  }
};
module.exports = {
  getAllTournamentTeamPlayersQuery,
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
  getAllPlayersByTeamIdQuery,
  deletePlayerByTeamQuery,
  deleteTournamentPlayersByPlayerIdQuery,
  deletePlayersByTeamIdQuery,
  getAllPlayersByTeamAndCompetitionIdQuery,
  getPlayerByIdsQuery,
  insertEntityImportLogsQuery,
  getAllTournamentTeamPlayerByIdsQuery
};
