const {
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
  getAllPlayersByTeamIdQuery,
  getAllPlayersByTeamAndCompetitionIdQuery,
  deletePlayersByTeamAndPlayerIdQuery,
} = require("../repository/TableTournamentsTeamPlayers");
const { insertCommentaryPlayers, deleteCommentaryPlayersQuery } = require("../repository/TableCommentary");
const { getAllTeamPlayersByTeamIdAndPlayerIdQuery } = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery: newGetAllPlayersByTeamIdQuery} = require("../repository/TableTeams");

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

const addDeleteTournamentTeamPlayersService = async (request, fastify) => {
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

const addTournamentTeamPlayersService = async (request, fastify) => {
  const { addPlayers, removePlayers, competitionId, teamId } = request.body;

  await addAndRemovePlayersFromTournamentTeams(request, fastify);

  if (removePlayers.length > 0) {
    const removeIds = removePlayers.map(item => item.playerId);
    const data = {
      competitionId,
      teamId,
      playerIds: removeIds
    };
    await deletePlayersByTeamAndPlayerIdQuery(data, request, fastify);
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
      item =>
        !(
          removeIds.includes(item.playerId) &&
          item.teamId === teamId &&
          item.competitionId === competitionId
        )
    );
  }

  if (addPlayers.length > 0) {
    for (const item of addPlayers) {
      const playerTp = global.tblPlayers.find(
        elem => elem.playerId === item.playerId
      );

      const exists = global.tblTournamentTeamPlayers.some(
        elem =>
          elem.competitionId === competitionId &&
          elem.teamId === teamId &&
          elem.playerId === item.playerId
      );

      if (exists) continue;

      const insertData = {
        competitionId,
        teamId,
        playerId: item.playerId,
        playerName: item.playerName,
        userId: request.userTokenInfo.WrUserId,
        tpId: playerTp?.tpId ?? null
      };

      const data = await insertTournamentTeamPlayersQuery(
        insertData,
        request,
        fastify
      );

      if (data?.[0]) {
        global.tblTournamentTeamPlayers.push(data[0]);
      }
    }
  }
  return "Tournament team players updated successfully";
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
  const { addPlayers, removePlayers, competitionId, teamId } = request.body;

  if (removePlayers.length > 0) {
    const playerIds = removePlayers.map(p => p.playerId);
    const comDetails = global.tblCommentaries.filter(
      item =>
        item.commentaryStatus === 1 &&
        item.competitionId === competitionId &&
        (item.team1Id == teamId || item.team2Id == teamId)
    );

    for (const com of comDetails) {
      await deleteCommentaryPlayersQuery(
        { playerIds, commentaryId: com.commentaryId, teamId },
        request,
        fastify
      );

      global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
        item =>
          !(
            playerIds.includes(item.playerId) &&
            item.commentaryId === com.commentaryId &&
            item.teamId === teamId
          )
      );
    }
  }

  if (addPlayers.length > 0) {
    const comDetails = global.tblCommentaries.filter(
      item =>
        [1, 2, 3].includes(item.commentaryStatus) &&
        item.competitionId === competitionId &&
        (item.team1Id == teamId || item.team2Id == teamId)
    );

    for (const ply of addPlayers) {
      const checkPlayer = global.tblPlayers.find(
        item => item.playerId === ply.playerId
      );
      if (!checkPlayer) continue;

      const teamPlayers = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
        { playerId: ply.playerId, teamId },
        fastify,
        request
      );

      for (const com of comDetails) {
        const matchType = global.tblMatchTypes.find(
          mt => mt.matchTypeId === com.matchTypeId
        );

        const inningsCount = matchType?.noOfIningsPerSide ?? 1;
        for (let i = 1; i <= inningsCount; i++) {
          const exists = global.tblCommentaryPlayers.some(
            item =>
              item.commentaryId === com.commentaryId &&
              item.teamId === teamId &&
              item.playerId === ply.playerId &&
              item.currentInnings === i
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
              jerseyPlayerImagePath: teamPlayers?.jerseyPlayerImagePath ?? null
            },
            i,
            fastify,
            request
          );

          if (newComm) {
            global.tblCommentaryPlayers.push(newComm);
          }
        }
      }
    }
  }
};

const getTournamentTeamPlayersByCompetitionIdForClientService = async (request, fastify) => {
  const { competitionId } = request.body;

  const competition = global.tblCompetitions.find(
    c => c.competitionId === competitionId
  );
  if (!competition) {
    throw new Error(`Competition with this id ${competitionId} not found`);
  }

  const commentaries = global.tblCommentaries.filter(
    c => c.competitionId === competitionId
  );
  if (!commentaries.length) return [];

  const matchTypeMap = new Map(
    global.tblMatchTypes.map(mt => [mt.matchTypeId, mt])
  );

  const playersMap = new Map(
    global.tblPlayers.map(p => [p.playerId, p])
  );

  const teamsMap = new Map(
    global.tblTeams.map(t => [t.teamId, t])
  );

  const commentaryPlayersByCommentary = new Map();
  for (const cp of global.tblCommentaryPlayers) {
    if (!commentaryPlayersByCommentary.has(cp.commentaryId)) {
      commentaryPlayersByCommentary.set(cp.commentaryId, []);
    }
    commentaryPlayersByCommentary.get(cp.commentaryId).push(cp);
  }

  const commentariesByMatchType = new Map();
  for (const c of commentaries) {
    if (!commentariesByMatchType.has(c.matchTypeId)) {
      commentariesByMatchType.set(c.matchTypeId, []);
    }
    commentariesByMatchType.get(c.matchTypeId).push(c);
  }

  const result = [];

  for (const [matchTypeId, mtCommentaries] of commentariesByMatchType.entries()) {
    const team1PlayersMap = new Map();
    const team2PlayersMap = new Map();

    let team1Data = null;
    let team2Data = null;

    for (const c of mtCommentaries) {
      team1Data ??= teamsMap.get(c.team1Id);
      team2Data ??= teamsMap.get(c.team2Id);

      const cps = commentaryPlayersByCommentary.get(c.commentaryId) || [];

      for (const cp of cps) {
        const player = playersMap.get(cp.playerId);
        if (!player) continue;

        if (cp.teamId === c.team1Id) {
          team1PlayersMap.set(player.playerId, player);
        } else if (cp.teamId === c.team2Id) {
          team2PlayersMap.set(player.playerId, player);
        }
      }
    }

    result.push({
      ...matchTypeMap.get(matchTypeId),
      team1: {
        ...team1Data,
        players: [...team1PlayersMap.values()]
      },
      team2: {
        ...team2Data,
        players: [...team2PlayersMap.values()]
      }
    });
  }

  return result;
};

module.exports = {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
  getPlayersByTeamIdService,
  deleteTournamentTeamPlayersService,
  addDeleteTournamentTeamPlayersService,
  getTournamentTeamPlayersByCompetitionIdForClientService
};
