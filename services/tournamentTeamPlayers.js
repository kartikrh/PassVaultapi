const {
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
  getAllPlayersByTeamIdQuery,
  getAllPlayersByTeamAndCompetitionIdQuery,
} = require("../repository/TableTournamentsTeamPlayers");
const { insertCommentaryPlayers, deleteCommentaryPlayersByPlayerId } = require("../repository/TableCommentary");
const { getAllTeamPlayersByTeamIdAndPlayerIdQuery } = require("../repository/TableTeamPlayer");

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

  await addAndRemovePlayersFromTournamentTeams(request, fastify);

  // delete this player from the existingPlayers
  await deleteTournamentTeamPlayersQuery(newPlayers.map((item) => item.id), request, fastify);
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => !newPlayers.map((elem) => elem.id).includes(item.id)
  );


  const insertPromises = teamPlayers?.map(async (item) => {
    const playerTpId = global.tblPlayers.find(elem => elem.playerId === item.playerId);
    const insertData = {
      competitionId,
      teamId,
      playerId: item.playerId,
      playerName: item.playerName,
      userId: request.userTokenInfo.WrUserId,
      tpId: playerTpId?.tpId ?? null
    };

    const existingPlayers = global.tblTournamentTeamPlayers.filter(
      (elem) =>
        elem.competitionId === competitionId && 
        elem.teamId === teamId && 
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
    return data[0];
  });

  let data = await Promise.all(insertPromises);
  data = data.filter(Boolean).map(item => item.playerId);
  const tournamentTeamPlayerIds = global.tblTournamentTeamPlayers.filter(item => item.competitionId === competitionId && data.includes(item.playerId) && item.teamId !== teamId);
  if (tournamentTeamPlayerIds && tournamentTeamPlayerIds.length > 0) {
    const idsToDelete = tournamentTeamPlayerIds.map((item) => item.id)
    await deleteTournamentTeamPlayersQuery(idsToDelete, request, fastify);
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
      (item) => !idsToDelete.includes(item.id)
    )
  }

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

const addAndRemovePlayersFromTournamentTeams = async (request, fastify) => {
  const { teamPlayers, competitionId, teamId } = request.body;

  if (teamPlayers.length == 0) {
    return;
  }
  const getTeamPlayersData =
    await getAllPlayersByTeamAndCompetitionIdQuery(
      { competitionId, teamId },
      request,
      fastify
    );

  const inputPlayerIdSet = new Set(teamPlayers.map(p => p.playerId));
  const existingPlayerIdSet = new Set(getTeamPlayersData.map(p => p.playerId));

  const playersToAdd = teamPlayers.filter(p =>
    !existingPlayerIdSet.has(p.playerId)
  );

  const playersToRemove = getTeamPlayersData.filter(p =>
    !inputPlayerIdSet.has(p.playerId)
  );

  if (playersToAdd.length > 0) {
    const comDetails = global.tblCommentaries.filter(item =>
      [1, 2, 3].includes(item.commentaryStatus) &&
      item.competitionId === competitionId
    );

    for (const ply of playersToAdd) {
      const checkPlayer = global.tblPlayers.find(
        item => item.playerId === ply.playerId
      );
      if (!checkPlayer) continue;

      const teamPlayers = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
        { playerId: ply.playerId, teamId }, fastify, request
      );

      for (const com of comDetails) {
        const exists = global.tblCommentaryPlayers.find(item =>
          item.commentaryId === com.commentaryId &&
          item.teamId === teamId &&
          item.playerId === ply.playerId
        );
        if (exists) continue;
        const [newComm] = await insertCommentaryPlayers(
          {
            commentaryId: com.commentaryId,
            teamId,
            playerId: ply.playerId,
            displayOrder: teamPlayers?.playerOrder ?? 0,
            matchTypeId: com.matchTypeId,
            tpId: checkPlayer.tpId,
            jerseyPlayerImage: teamPlayers?.jerseyPlayerImage ?? null,
            jerseyPlayerImagePath: teamPlayers?.jerseyPlayerImagePath ?? null,
          },
          com.currentInnings ?? 1,
          fastify,
          request
        );
        global.tblCommentaryPlayers.push(newComm);

      }
    }
  }

  if (playersToRemove.length > 0) {
    const playerIds = playersToRemove.map(p => p.playerId);

    const comDetails = global.tblCommentaries.filter(item =>
      [1].includes(item.commentaryStatus) &&
      item.competitionId === competitionId
    );

    for (const com of comDetails) {
      await deleteCommentaryPlayersByPlayerId(
        { playerIds, commentaryId: com.commentaryId },
        request,
        fastify
      );
      global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(item =>
        !(
          playerIds.includes(item.playerId) &&
          item.commentaryId === com.commentaryId &&
          item.teamId === teamId
        )
      );
    }
  }

  return
};

module.exports = {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
  getPlayersByTeamIdService,
  deleteTournamentTeamPlayersService,
};
