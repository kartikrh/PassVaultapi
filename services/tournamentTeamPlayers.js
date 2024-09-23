const {
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
} = require("../repository/TableTournamentsTeamPlayers");

const allTournamentTeamPlayersService = async (request) => {
  const { competitionId, teamId } = request.body || {};
  if (competitionId !== undefined || teamId !== undefined) {
    const result = global.tblTournamentTeamPlayers.filter(
      (item) => item.competitionId === competitionId || item.teamId === teamId
    );
    return result;
  } else {
    const result = global.tblTournamentTeamPlayers;
    return result;
  }
};

const addTournamentTeamPlayersService = async (request, fastify) => {
  const insertPromises = request.body.map(async (item) => {
    const insertData = {
      competitionId: item.competitionId,
      teamId: item.teamId,
      playerId: item.playerId,
      playerName: item.playerName,
      userId: request.userTokenInfo.WrUserId,
    };

    const data = await insertTournamentTeamPlayersQuery(
      insertData,
      request,
      fastify
    );

    const existingPlayers = global.tblTournamentTeamPlayers.filter(
      (elem) =>
        elem.competitionId === item.competitionId && elem.teamId === item.teamId
    );

    const existingPlayerIds = existingPlayers.map((del) => del.id);
    
    if (existingPlayerIds.length > 0) {
      await deleteTournamentTeamPlayersQuery(
        existingPlayerIds,
        request,
        fastify
      );
      global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
        (el) => !existingPlayerIds.includes(el.id)
      );
    }
    
    global.tblTournamentTeamPlayers.push(data[0]);
  });
  await Promise.all(insertPromises);

  return "Tournaments Team players added successfully";
};

module.exports = {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
};
