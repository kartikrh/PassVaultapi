const { createTeamPointLogQuery, getLogByComIdQuery } = require("../repository/TableTeamPointLogs");
const { deletePlayerByTeamQuery } = require("../repository/TableTournamentsTeamPlayers");
const {
  getAllTournamentTeamPointsQuery,
  insertTournamentTeamPointsQuery,
  updateTournamentTeamPointsQuery,
  deleteTournamentTeamPointsQuery,
  activeInactiveTournamentTeamPointsQuery,
  getTournamentPointsByTeamIdQuery,
  updateTeamPointsQuery
} = require("../repository/TableTournmentTeamPoints");

const allTournamentTeamPointsService = async (request, fastify) => {
  const { competitionId, teamId, groupId, isActive } = request.body;
  let result = await getAllTournamentTeamPointsQuery(fastify);
  result = result.filter((item) => {
    const competitionMatch = competitionId !== undefined ? item.competitionId === competitionId : true;
    const teamMatch = teamId !== undefined ? item.teamId === teamId : true;
    const groupMatch = groupId !== undefined ? item.groupId === groupId : true;
    const isActiveMatch = isActive !== undefined ? item.isActive === isActive : true;

    return competitionMatch && teamMatch && groupMatch && isActiveMatch;
  }).sort((a, b) => b.totalWin - a.totalWin);

  return result;
};

const createTblTournamentTeamPointsService = async (request, fastify) => {
  const validateCompetitionId = global.tblCompetitions.find(
    (item) => item.competitionId === request.body.competitionId);
    if(!validateCompetitionId){
      throw new Error('CompetitionId does not existed');
  }

  const validateTeamId = global.tblTeams.find(
      (elem) => elem.teamId === request.body.teamId
    );
    if(!validateTeamId){
      throw new Error('TeamId does not existed');
  }
  const existedValues = await getTournamentPointsByTeamIdQuery(
    {competitionId: request.body.competitionId, teamId: request.body.teamId}, 
    request,
    fastify
  );  
  if(existedValues){
    throw new Error("TeamId existed with this competitionId");
  }
    
  const saveData = await insertTournamentTeamPointsQuery(request.body, fastify, request);

  return saveData
}

const updateTblTournamentTeamPointsService = async (request, fastify) => {
  let validateId = await getAllTournamentTeamPointsQuery(fastify);
  validateId = validateId.find(
    (elem) => elem.id === request.body.id
  );
  if (!validateId) {
    throw new Error("TournamentTeamPoints Id not Found");
  }

  const validateCompetitionId = global.tblCompetitions.find(
    (item) => item.competitionId === request.body.competitionId);
    if(!validateCompetitionId){
      throw new Error('CompetitionId does not existed');
  }

  const validateTeamId = global.tblTeams.find(
      (elem) => elem.teamId === request.body.teamId
    );
    if(!validateTeamId){
      throw new Error('TeamId does not existed');
  }

  const updateData = {
    groupId: request.body.groupId === undefined ? validateId.groupId : request.body.groupId,
    teamId: request.body.teamId === undefined ? validateId.teamId : request.body.teamId,
    competitionId: request.body.competitionId === undefined ? validateId.competitionId : request.body.competitionId,
    totalMatches: request.body.totalMatches === undefined ? validateId.totalMatches : request.body.totalMatches,
    totalWin: request.body.totalWin === undefined ? validateId.totalWin : request.body.totalWin,
    totalLose: request.body.totalLose === undefined ? validateId.totalLose : request.body.totalLose,
    totalTie: request.body.totalTie === undefined ? validateId.totalTie : request.body.totalTie,
    noResult: request.body.noResult === undefined ? validateId.noResult : request.body.noResult,
    totalPoint: request.body.totalPoint === undefined ? validateId.totalPoint : request.body.totalPoint,
    netRunRate: request.body.netRunRate === undefined ? validateId.netRunRate : request.body.netRunRate,
    isActive: request.body.isActive === undefined ? validateId.isActive : request.body.isActive,
    id: request.body.id,
  };

  await updateTournamentTeamPointsQuery(updateData, fastify, request);


  return updateData
}

const saveTblTournamentTeamPointsService = async (request, fastify) => {
  if (request.body.id === 0) {
    return await createTblTournamentTeamPointsService(request, fastify);
  } else {
    return await updateTblTournamentTeamPointsService(request, fastify);
  }
}

const createTournamentTeamPointsService = async (newItems, fastify, request) => {
  const insertData = newItems.map(async (item) => {
    const saveData = await insertTournamentTeamPointsQuery(item, fastify, request);
  });
  await Promise.all(insertData);
  return `TournamentTeamPoints added successfully`;
};

const updateTournamentTeamPointsService = async (existingItems, fastify, request) => {    
  const editData = existingItems.map(async (item) => {
    let validateId = await getAllTournamentTeamPointsQuery(fastify);
    validateId = validateId.find(
      (elem) => elem.id === item.id
    );
    if (!validateId) {
      throw new Error("TournamentTeamPoints Id not Found");
    }

    const updateData = {
      groupId: item.groupId || validateId.groupId,
      teamId: item.teamId || validateId.teamId,
      competitionId: item.competitionId || validateId.competitionId,
      totalMatches: item.totalMatches || validateId.totalMatches,
      totalWin: item.totalWin || validateId.totalWin,
      totalLose: item.totalLose || validateId.totalLose,
      totalTie: item.totalTie || validateId.totalTie,
      noResult: item.noResult || validateId.noResult,
      totalPoint: item.totalPoint || validateId.totalPoint,
      netRunRate: item.netRunRate || validateId.netRunRate,
      isActive: item.isActive || validateId.isActive,
      id: item.id,
    };

    await updateTournamentTeamPointsQuery(updateData, fastify, request);

  });

  await Promise.all(editData);
  return `TournamentTeamPoints added successfully`;
};

const saveTournamentTeamPointsService = async (request, fastify) => {
  const newItems = request.body.filter((item) => item.id === 0);
  const existingItems = request.body.filter((item) => item.id !== 0);

  if (newItems.length > 0) {
    await createTournamentTeamPointsService(newItems, fastify, request);
  }

  if (existingItems.length > 0) {
    await updateTournamentTeamPointsService(existingItems, fastify, request);
  }

  return `TournamentTeamPoints added successfully`;
};

const deleteTournamentTeamPointsService = async (request, fastify) => {
  const { id  , teamId, competitionId} = request.body;

  await deleteTournamentTeamPointsQuery(id, fastify, request);
  await deletePlayerByTeamQuery({
    teamId  : teamId,
    competitionId : competitionId
  }, request , fastify)

  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => !(teamId.includes(item.teamId) && item.competitionId === competitionId)
  );
  

  return `TournamentTeamPoint(s) deleted successfully`;
};

const activeInactiveTournamentTeamPointsService = async (request, fastify) => {
  const { id, isActive } = request.body;

  await activeInactiveTournamentTeamPointsQuery({ id, isActive }, request, fastify);

  return `TournamentTeamPoint isActive stage updated successfully`;
};

const setTeamPointService = async (data, request, fastify) => {
  for (let m of data) {
    // let dataToUpdate = [];
    
    let res = await getLogByComIdQuery(
      {
        // competitionId: m.competitionId,
        commentaryId: m.commentaryId,
        module : "teamPoint"
      },
      request,
      fastify
    );
    if (res.length > 0) {
      continue;
    }

    // Team1 points data updating
    await setTeamNetRunRateService(m.team1Id, m.competitionId, fastify);
    // Team2 points data updating
    await setTeamNetRunRateService(m.team2Id, m.competitionId, fastify);

    await setTeamPointLogService([m], request, fastify , "teamPoint");
  
    // let comp = global.tblCompetitions.find(
    //   (c) => c.competitionId == m.competitionId
    // );
    
    // if (tp1) {
    //   let ttlPoint = tp1.totalPoint;
    //   if (m.winnerId != null && m.winnerId == m.team1Id) {
    //     ttlPoint += comp.winPoint;
    //   }
    //   // else if(m.winnerId != null && m.winnerId != m.team1Id){
    //   //   ttlPoint = ttlPoint + comp.lossPoint;
    //   // }
    //   const team1netRunRate = await setTeamNetRunRateService(m.team1Id, m.competitionId, fastify);
    //   dataToUpdate.push({
    //     ...tp1,
    //     totalMatches: tp1.totalMatches + 1,
    //     totalWin: m.winnerId != null && m.winnerId == m.team1Id ? tp1.totalWin + 1 : tp1.totalWin,
    //     totalLose: m.winnerId != null && m.winnerId != m.team1Id ? tp1.totalLose + 1 : tp1.totalLose,
    //     totalPoint: ttlPoint,
    //     netRunRate: team1netRunRate.netRunRate,
    //   });
    // }

    // let tp2Data = {
    //   competitionId: m.competitionId,
    //   teamId: m.team2Id
    // };
    // let tp2 = await getTournamentPointsByTeamIdQuery(tp2Data, request, fastify);
    // if (tp2) {
    //   let ttlPoint = tp2.totalPoint;
    //   if (m.winnerId != null && m.winnerId == m.team2Id) {
    //     ttlPoint += comp.winPoint;
    //   }
    //   // else if(m.winnerId != null && m.winnerId != m.team2Id){
    //   //   ttlPoint = ttlPoint + comp.lossPoint;
    //   // }
    //   const team2NetRunRate = await setTeamNetRunRateService(m.team2Id, m.competitionId, fastify);
    //   dataToUpdate.push({
    //     ...tp2,
    //     totalMatches: tp2.totalMatches + 1,
    //     totalWin: m.winnerId != null && m.winnerId == m.team2Id ? tp2.totalWin + 1 : tp2.totalWin,
    //     totalLose: m.winnerId != null && m.winnerId != m.team2Id ? tp2.totalLose + 1 : tp2.totalLose,
    //     totalPoint: ttlPoint,
    //     netRunRate: team2NetRunRate.netRunRate,
    //   });
    // }

    // for (let d of dataToUpdate) {
    //   await updateTeamPointsQuery(d, fastify, request);
    // }
    // await setTeamPointLogService([m], request, fastify , "teamPoint");
  }
  return `Team point updated successfully`;
};

const teamsListService = async (request, fastify) => {
  let result = global.tblTeams;
  if(request.body.competitionId != undefined && request.body.competitionId != 0) {
    const competitionResult = global.tblTeamCompetition.filter(
      (item) => item.refCompetitionId === request.body.competitionId
    );
    const competitionTeamIds = new Set(competitionResult.map(item => item.teamId));
    result = result.filter(
      (item) => competitionTeamIds.has(item.teamId)
    );
    result = result.filter((item) => competitionTeamIds.has(item.teamId));
  }

  return result.map((elem) => {
    return {
      teamId: elem.teamId,
      teamName: elem.teamName,
    };
  });
};
const setTeamPointLogService = async (data, request, fastify, module) => {
  for (let d of data) {
    await createTeamPointLogQuery(
      {
        teamId: d.team1Id,
        competitionId: d.competitionId,
        commentaryId: d.commentaryId,
        module : module
      },
      request,
      fastify
    );
    await createTeamPointLogQuery(
      {
        teamId: d.team2Id,
        competitionId: d.competitionId,
        commentaryId: d.commentaryId,
        module : module
      },
      request,
      fastify
    );
  }

  return true;
};

const setTeamNetRunRateService = async (teamId, competitionId, fastify) => {
  const result = await fastify.db.query(
    `CALL proc_net_run_rate_calculation($1, $2, $3)`,
    {
      bind: [teamId, competitionId, null], 
      type: fastify.db.QueryTypes.RAW,
    }
  )
  return result[0]?.[0].updated_row;
};

const netRunRateRe_calculationService = async (request, fastify) => {
  const { competitionId, teamId } = request.body;

  let comp = global.tblCompetitions.find(
    (c) => c.competitionId == competitionId && c.isPointTable == true
  );
  if(!comp) {
    if(request.body.status === 1){
      return;
    }
    throw new Error(`IsPointTable set as Inactive`);
  }
  for (const tId of teamId) {
    await setTeamNetRunRateService(
      tId,
      competitionId,
      fastify
    );
  }

  return "Net run rate calculation successful";
};

module.exports = {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService,
  setTeamPointService,
  saveTblTournamentTeamPointsService,
  teamsListService,
  netRunRateRe_calculationService,
};
