const { errorLogger } = require("../utilities/logger");

const getAllTournamentTeamPlayersQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
          "wrId" as "id",
          "wrCompetitionId" as "competitionId",
          "wrTeamId" as "teamId",
          "wrPlayerId" as "playerId",
          "wrPlayerName" as "playerName",
          "wrCreatedBy" as  "createdBy",
          "wrCreatedAt" as "createdAt"
       FROM "tblTournamentTeamPlayers"`,
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
                          "wrCreatedAt"
                      )
                  values ($1, $2, $3, $4, $5, now()) returning *
                  )
                  select 
                          "wrId" as "id",
                          "wrCompetitionId" as "competitionId",
                          "wrTeamId" as "teamId",
                          "wrPlayerId" as "playerId",
                          "wrPlayerName" as "playerName",
                          "wrCreatedBy" as  "createdBy",
                          "wrCreatedAt" as "createdAt"
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
          delete from "tblTournamentTeamPlayers" where "wrId" = ANY ($1)
        `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [data],
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

module.exports = {
  getAllTournamentTeamPlayersQuery,
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
};
