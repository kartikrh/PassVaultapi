const {
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
  getAllPlayersByTeamIdQuery,
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
  // get all the player for the team
  const {teamPlayers , competitionId , teamId} = request.body
  let existingPlayers = global.tblTournamentTeamPlayers.filter(
    (elem) =>
      elem.competitionId === competitionId &&
      elem.teamId === teamId
  );

  // find the existingPlayer and request.body player 
  const existingPlayerIds = existingPlayers.map((item) => item.playerId);
  const newPlayerIds = teamPlayers.map((item) => item.playerId);

  // find the player which is not in request.body
  const newPlayers = existingPlayers.filter(
    (item) => !newPlayerIds.includes(item.playerId)
  );

  // delete this player from the existingPlayers
  await deleteTournamentTeamPlayersQuery(newPlayers.map((item) => item.id), request, fastify);
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => !newPlayers.map((elem) => elem.id).includes(item.id)
  );


  const insertPromises = teamPlayers?.map(async (item) => {
    const insertData = {
      competitionId: item.competitionId,
      teamId: item.teamId,
      playerId: item.playerId,
      playerName: item.playerName,
      userId: request.userTokenInfo.WrUserId,
    };

    const existingPlayers = global.tblTournamentTeamPlayers.filter(
      (elem) =>
        elem.competitionId === item.competitionId && 
        elem.teamId === item.teamId && 
        elem.playerId === item.playerId
    );
    if (existingPlayers.length > 0) {
      return;
    }

    const data = await insertTournamentTeamPlayersQuery(
      insertData,
      request,
      fastify
    );
    
    global.tblTournamentTeamPlayers.push(data[0]);
  });
  await Promise.all(insertPromises);

  return "Tournaments Team players added successfully";
};

const getPlayersByTeamIdService = async(request, fastify) => {
  const { teamId , competitionId } = request.body;
  const tournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => item.teamId === teamId  && item.competitionId === competitionId
  );
  const remainingPlayers = await getAllPlayersByTeamIdQuery({
    teamId : teamId,
    competitionId : competitionId
  }, request, fastify)
  return { tournamentTeamPlayers, remainingPlayers };
}

const deleteTournamentTeamPlayersService = async (request, fastify) => {
  const { id } = request.body;

  await deleteTournamentTeamPlayersQuery(id, request, fastify);
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => !id.includes(item.id)
  );

  return `TournamentTeamPlayer(s) deleted successfully`;
};

module.exports = {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
  getPlayersByTeamIdService,
  deleteTournamentTeamPlayersService,
};
