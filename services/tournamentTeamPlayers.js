const {
  insertTournamentTeamPlayersQuery,
  deleteTournamentTeamPlayersQuery,
  getAllPlayersByTeamIdQuery,
  getAllPlayersByTeamAndCompetitionIdQuery,
  deletePlayersByTeamAndPlayerIdQuery,
  deleteTournamentTeamPlayersByPlayerIdQuery,
} = require("../repository/TableTournamentsTeamPlayers");
const { insertCommentaryPlayers, deleteCommentaryPlayersQuery, getCommentariesDataQuery, getAllCommentaryPlayerDataQuery, deleteCommentaryPlayerById } = require("../repository/TableCommentary");
const { getAllTeamPlayersByTeamIdAndPlayerIdQuery, getTeamPlayersByTeamMatchTypeIdQuery } = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery: newGetAllPlayersByTeamIdQuery} = require("../repository/TableTeams");
const { commentaryStatus } = require("../utilities");

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

  const competitionMatchTypeId = global.tblCompetitions.find(tc => tc.competitionId === competitionId)?.matchTypeId;

  if (removePlayers.length > 0) {
    const removeIds = removePlayers.map(item => item.playerId);
    await removeCommentaryPlayersFromTournamentTeamPlayerService({
      competitionId: competitionId,
      teamId: teamId,
      playerIds: removeIds,
      matchTypeId: competitionMatchTypeId ?? -1
    }, request, fastify);
    const tournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(tttp => tttp.competitionId === competitionId && tttp.teamId === teamId && tttp.matchTypeId === (competitionMatchTypeId ? competitionMatchTypeId : -1) && removeIds.includes(tttp.playerId))
    const removedTournamentTeamPlayerIds = tournamentTeamPlayers?.map(item => item.id);
    const data = {
      competitionId,
      teamId,
      playerIds: removedTournamentTeamPlayerIds
    };
    await deleteTournamentTeamPlayersByPlayerIdQuery(data, request, fastify);
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
      item =>
        !(
          removedTournamentTeamPlayerIds.includes(item.id) &&
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
          elem.playerId === item.playerId &&
          (!competitionMatchTypeId || elem.matchTypeId === competitionMatchTypeId)
      );

      if (exists) continue;

      const insertData = {
        competitionId,
        teamId,
        playerId: item.playerId,
        playerName: item.playerName,
        userId: request.userTokenInfo.WrUserId,
        tpId: playerTp?.tpId ?? null,
        matchTypeId: competitionMatchTypeId ?? -1
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

  const competitionMatchTypeId = global.tblCompetitions.find(tc => tc.competitionId === competitionId)?.matchTypeId;
  let remainingPlayers = await getAllPlayersByTeamIdQuery({
    teamId : teamId,
    competitionId : competitionId
  }, request, fastify)
  if (competitionMatchTypeId) {
    remainingPlayers = remainingPlayers.filter(tp => tp.matchTypeId === competitionMatchTypeId);
  }
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
  if (!competition) throw new Error(`Competition with this id ${competitionId} not found`);

  let tournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(tttp => tttp.competitionId === competitionId);
  if (tournamentTeamPlayers.find(ttp => ttp.matchTypeId == -1)) {
    const commentaries = await getCommentariesDataQuery(fastify, `tc."wrCompetitionId" = ${competitionId}`);
    if (!commentaries.length) return [];

    const matchTypeMap = new Map(global.tblMatchTypes.map(mt => [mt.matchTypeId, { matchTypeId: mt.matchTypeId, matchType: mt.matchType }]));
    const playersMap = new Map(global.tblPlayers.map(p => [p.playerId, { playerId: p.playerId, playerType: p.playerType, playerName: p.playerName, displayName: p.displayName }]));
    const teamsMap = new Map(global.tblTeams.map(t => [t.teamId, { teamId: t.teamId, teamName: t.teamName, teamShortName: t.teamShortName, image: t.image, imagePath: t.imagePath }]));

    const commentaryPlayersByCommentary = new Map();
    const commentaryIds = commentaries.map(c => c.commentaryId);
    const commentaryPlayers = await getAllCommentaryPlayerDataQuery(`tcp."wrCommentaryId" IN (${commentaryIds})`, fastify);
    for (const cp of commentaryPlayers) {
      const cid = cp.commentaryId;
      if (!commentaryPlayersByCommentary.has(cid)) commentaryPlayersByCommentary.set(cid, []);
      commentaryPlayersByCommentary.get(cid).push(cp);
    }

    const commentariesByMatchType = new Map();
    for (const c of commentaries) {
      const mtId = c.matchTypeId;
      if (!commentariesByMatchType.has(mtId)) commentariesByMatchType.set(mtId, []);
      commentariesByMatchType.get(mtId).push(c);
    }

    const teamPlayersCache = new Map();

    const result = [];

    for (const [matchTypeId, mtCommentaries] of commentariesByMatchType.entries()) {
      const teamsInMatch = new Map();

      for (const c of mtCommentaries) {
        const cps = commentaryPlayersByCommentary.get(c.commentaryId) || [];

        for (const cp of cps) {
          const teamId = cp.teamId;

          if (!teamsInMatch.has(teamId)) {
            const teamData = teamsMap.get(teamId) || {};
            teamsInMatch.set(teamId, { ...teamData, players: [] });

            if (!teamPlayersCache.has(teamId)) {
              const teamPlayers = await newGetAllPlayersByTeamIdQuery(teamId, fastify, request);
              teamPlayersCache.set(teamId, teamPlayers?.filter(tp => tp.matchTypeId === -1) || []);
            }
          }

          const teamPlayers = teamPlayersCache.get(teamId);
          const player = playersMap.get(cp.playerId);
          if (!player) continue;

          const fullPlayer = teamPlayers.find(tp => tp.playerId === player.playerId);
          if (fullPlayer) {
            teamsInMatch.get(teamId).players.push(fullPlayer);
          }
        }
      }

      for (const team of teamsInMatch.values()) {
        team.players = [
          ...new Map(team.players.map(p => [p.playerId, p])).values()
        ];
      }

      result.push({
        matchTypeData: matchTypeMap.get(matchTypeId) || null,
        teams: [...teamsInMatch.values()]
      });
    }

    return result;
  } else {
    const result = {};
    tournamentTeamPlayers = tournamentTeamPlayers.filter(ttp => ttp.matchTypeId !== -1);

    const tournamentTeamPlayerMatchType = [...new Set(tournamentTeamPlayers.map(ttp => ttp.matchTypeId))];
    const tournamentTeam = [...new Set(tournamentTeamPlayers.map(ttp => ttp.teamId))];
    const tournamentPlayers = [...new Set(tournamentTeamPlayers.map(ttp => ttp.playerId))];

    const matchTypeMap = new Map(global.tblMatchTypes?.filter(tmt => tournamentTeamPlayerMatchType.includes(tmt.matchTypeId))?.map(mt => [mt.matchTypeId, { matchTypeId: mt.matchTypeId, matchType: mt.matchType }]));
    const teamsMap = new Map(global.tblTeams?.filter(tt => tournamentTeam.includes(tt.teamId))?.map(t => [t.teamId, { teamId: t.teamId, teamName: t.teamName, teamShortName: t.teamShortName, image: t.image, imagePath: t.imagePath }]));
    const playersMap = new Map(global.tblPlayers?.filter(tp => tournamentPlayers.includes(tp.playerId))?.map(p => [p.playerId, { playerId: p.playerId, playerType: p.playerType, playerName: p.playerName, displayName: p.displayName }]));

    for (const p of tournamentTeamPlayers) {
      if (!result[p.matchTypeId]) {
        const matchTypeData = matchTypeMap.get(p.matchTypeId);

        result[p.matchTypeId] = {
          matchTypeData: matchTypeData || { matchTypeId: p.matchTypeId },
          teams: {}
        };
      }

      if (!result[p.matchTypeId].teams[p.teamId]) {
        const teamData = teamsMap.get(p.teamId);

        const teamMatchTypePlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
          ...request,
          body: {
            teamId: p.teamId,
            matchTypeId: p.matchTypeId
          }
        }, fastify);

        result[p.matchTypeId].teams[p.teamId] = {
          ...(teamData || { teamId: p.teamId }),
          players: [],
          teamMatchTypePlayers
        };
      }

      const playerData = playersMap.get(p.playerId);

      if (playerData) {
        const teamMatchPlayer = result[p.matchTypeId]
          .teams[p.teamId]
          .teamMatchTypePlayers?.find(
            tmtp =>
              tmtp.teamId === p.teamId &&
              tmtp.refPlayerId === p.playerId &&
              tmtp.matchTypeId === p.matchTypeId
          );

        result[p.matchTypeId].teams[p.teamId].players.push({
          ...playerData,
          matchTypeId: p.matchTypeId,
          jerseyPlayerImage: teamMatchPlayer?.jerseyPlayerImage,
          jerseyPlayerImagePath: teamMatchPlayer?.jerseyPlayerImagePath
        });
      }
    }

    const finalResult = Object.values(result).map(mt => ({
      ...mt,
      teams: Object.values(mt.teams).map(team => {
        const { teamMatchTypePlayers, ...rest } = team;
        return rest;
      })
    }));

    return finalResult;
  }
};

const removeCommentaryPlayersFromTournamentTeamPlayerService = async (data, request, fastify) => {
  const { competitionId, teamId, playerIds, matchTypeId } = data;
  const removeCommentaryPlayerIds = [];
  const commentaries = global.tblCommentaries.filter(tc => tc.competitionId === competitionId && tc.matchTypeId === matchTypeId && [commentaryStatus.OPEN, commentaryStatus.TOSSDONE].includes(tc.commentaryStatus));
  for (const com of commentaries) {
    const commentaryPlayers = global.tblCommentaryPlayers.filter(tcp => tcp.commentaryId === com.commentaryId && tcp.teamId === teamId && playerIds.includes(tcp.playerId));
    for (const cp of commentaryPlayers) {
      removeCommentaryPlayerIds.push(cp.commentaryPlayerId);
      await deleteCommentaryPlayerById({
        commentaryPlayerId: cp.commentaryPlayerId
      }, request, fastify);
    }
  }

  if (removeCommentaryPlayerIds.length > 0) {
    global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(tcp => !(tcp.teamId === teamId && removeCommentaryPlayerIds.includes(tcp.commentaryPlayerId)));
  }
}

module.exports = {
  allTournamentTeamPlayersService,
  addTournamentTeamPlayersService,
  getPlayersByTeamIdService,
  deleteTournamentTeamPlayersService,
  addDeleteTournamentTeamPlayersService,
  getTournamentTeamPlayersByCompetitionIdForClientService
};
