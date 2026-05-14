const { createTeamPointLogQuery, getLogByComIdQuery } = require("../repository/TableTeamPointLogs");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { deletePlayerByTeamQuery, deleteTournamentTeamPlayersQuery, insertTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers");
const {
  getAllTournamentTeamPointsQuery,
  insertTournamentTeamPointsQuery,
  updateTournamentTeamPointsQuery,
  deleteTournamentTeamPointsQuery,
  activeInactiveTournamentTeamPointsQuery,
  getTournamentPointsByTeamIdQuery,
  updateTeamPointsQuery,
  getClientTournamentTeamPointsQuery,
  getTournamentTeamsByCompIdQuery,
  getTournamentPointsByGroupNameQuery,
  getTournamentTeamPointsQuery,
  changeDisplayOrderQuery,
  updateTournamentTeamPointGroupVisibleStatusQuery,
  getTournamentTeamPointsByCompetitionIdQuery,
} = require("../repository/TableTournmentTeamPoints");
const { callClientAPI, ServiceType, APIEndpointModuleType, callEntitySportAPI, extractGroupDataFromArray, teamRemarkType, compStatus, RefType } = require("../utilities");
const { nullTeamtpIds, entitySportAPIEndPoint } = require("../utilities/entityConst");
const { errorLogger } = require("../utilities/logger");
const { insertAutoImportDataService } = require("./autoImportData");
const { upsertTeamOnImportService } = require("./teams");
const { saveCompetitionService } = require("./competition");

const allTournamentTeamPointsService = async (request, fastify) => {
  const { competitionId, teamId, groupId, isActive } = request.body;
  let result = await getAllTournamentTeamPointsQuery(fastify);
  result = result.filter((item) => {
    const competitionMatch = competitionId !== undefined ? item.competitionId === competitionId : true;
    const teamMatch = teamId !== undefined ? item.teamId === teamId : true;
    const groupMatch = groupId !== undefined ? item.groupId === groupId : true;
    const isActiveMatch = isActive !== undefined ? item.isActive === isActive : true;

    return competitionMatch && teamMatch && groupMatch && isActiveMatch;
  }).sort((a, b) => {
    if (b.totalPoint !== a.totalPoint) {
      return b.totalPoint - a.totalPoint;
    }
  
    return b.netRunRate - a.netRunRate;
  });

  return result;
};

const createTblTournamentTeamPointsService = async (request, fastify) => {
  const { competitionId, groupId, groupName, teamId, prevGroupId } = request.body;
  const validateCompetitionId = global.tblCompetitions.find(tc => tc.competitionId === competitionId);
  if (!validateCompetitionId) {
    throw new Error('CompetitionId does not existed');
  }

  let checkTeamExists = null;
  if (teamId) {
    checkTeamExists = global.tblTeams.find(tt => tt.teamId === teamId);
    if (!checkTeamExists) {
      throw new Error('TeamId does not existed');
    }
    request.body.tpId = checkTeamExists.tpId;
  }

  const getTournamentTeamPointData = await getTournamentTeamPointsByCompetitionIdQuery({
    ...request,
    body: {
      competitionId
    }
  }, fastify);

  if (teamId) {
    const checkTeamExistsInGroup = getTournamentTeamPointData.find(item => item.teamId === teamId && item.groupId === groupId);
    if (checkTeamExistsInGroup) {
      throw new Error(`Team already existed with this groupId`);
    }
  }

  const getGroupData = getTournamentTeamPointData.find(item => item.groupId === groupId);

  if (prevGroupId) {
    if (prevGroupId === groupId) {
      throw new Error(`Previous group id and current group id are the same`);
    }

    const checkPreviousGroupExists = getTournamentTeamPointData.find(item => item.groupId === prevGroupId);
    if (!checkPreviousGroupExists) {
      throw new Error(`Previous group id ${prevGroupId} is not available in this competition id ${competitionId}`);
    }

    if (teamId) {
      const checkTeamExistsInPrevGroup = getTournamentTeamPointData.find(item => item.teamId === teamId && item.groupId === prevGroupId);
      if (!checkTeamExistsInPrevGroup) {
        throw new Error(`Team id ${teamId} is not available in the previous group id ${prevGroupId}`);
      }
    }
  }

  if (getGroupData) {
    request.body.groupName = getGroupData.groupName;
    request.body.groupDisplayOrder = getGroupData.groupDisplayOrder;
    request.body.isPlayOffGroup = getGroupData.isPlayOffGroup;
  }

  const saveData = await insertTournamentTeamPointsQuery(request.body, fastify, request);
  if (validateCompetitionId && validateCompetitionId.isActive == true) {
    const res = await responseChangeService(saveData?.teamId, saveData?.competitionId);

    await callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "add",
          data: { ...saveData, ...res }
        }
      }, request, fastify,
      "services/tournamentTeamPoints.js/createTblTournamentTeamPointsService"
    );
  }
  return saveData
}

const updateTblTournamentTeamPointsService = async (request, fastify) => {
  const { competitionId, id, groupId, teamId, prevGroupId } = request.body;
  const validateCompetitionId = global.tblCompetitions.find(tc => tc.competitionId === competitionId);
  if (!validateCompetitionId) {
    throw new Error('CompetitionId does not existed');
  }

  const getTournamentTeamPointData = await getTournamentTeamPointsByCompetitionIdQuery({
    ...request,
    body: {
      competitionId
    }
  }, fastify);

  const checkTournamentTeamPointExists = getTournamentTeamPointData.find(item => item.id === id);
  if (!checkTournamentTeamPointExists) {
    throw new Error(`TournamentTeamPoints with this id ${id} not Found`);
  }

  if (prevGroupId && checkTournamentTeamPointExists.prevGroupId !== prevGroupId) {
    if (prevGroupId === groupId) {
      throw new Error(`Previous group id and current group id are the same`);
    }

    const checkPreviousGroupExists = getTournamentTeamPointData.find(item => item.groupId === prevGroupId);
    if (!checkPreviousGroupExists) {
      throw new Error(`Previous group id ${prevGroupId} is not available in this competition id ${competitionId}`);
    }

    if (teamId) {
      const checkTeamExistsInPrevGroup = getTournamentTeamPointData.find(item => item.teamId === teamId && item.groupId === prevGroupId);
      if (!checkTeamExistsInPrevGroup) {
        throw new Error(`Team id ${teamId} is not available in the previous group id ${prevGroupId}`);
      }
    }
  }

  if (prevGroupId && teamId && checkTournamentTeamPointExists.teamId !== teamId) {
    const checkTeamExistsInPrevGroup = getTournamentTeamPointData.find(item => item.teamId === teamId && item.groupId === prevGroupId);
    if (!checkTeamExistsInPrevGroup) {
      throw new Error(`Team id ${teamId} is not available in the previous group id ${prevGroupId}`);
    }
  }

  const getGroupData = getTournamentTeamPointData.find(item => item.groupId === groupId);
  if (!getGroupData) {
    throw new Error(`Group id ${groupId} is not available in this competition id ${competitionId}`);
  }

  if (getGroupData) {
    request.body.groupName = getGroupData.groupName;
    request.body.groupDisplayOrder = getGroupData.groupDisplayOrder;
    request.body.isPlayOffGroup = getGroupData.isPlayOffGroup;
  }

  const updateData = {
    groupId: groupId === undefined ? checkTournamentTeamPointExists.groupId : groupId,
    teamId: request.body.teamId === undefined ? checkTournamentTeamPointExists.teamId : request.body.teamId,
    competitionId: competitionId === undefined ? checkTournamentTeamPointExists.competitionId : competitionId,
    totalMatches: request.body.totalMatches === undefined ? checkTournamentTeamPointExists.totalMatches : request.body.totalMatches,
    totalWin: request.body.totalWin === undefined ? checkTournamentTeamPointExists.totalWin : request.body.totalWin,
    totalLose: request.body.totalLose === undefined ? checkTournamentTeamPointExists.totalLose : request.body.totalLose,
    totalTie: request.body.totalTie === undefined ? checkTournamentTeamPointExists.totalTie : request.body.totalTie,
    noResult: request.body.noResult === undefined ? checkTournamentTeamPointExists.noResult : request.body.noResult,
    totalPoint: request.body.totalPoint === undefined ? checkTournamentTeamPointExists.totalPoint : request.body.totalPoint,
    netRunRate: request.body.netRunRate === undefined ? checkTournamentTeamPointExists.netRunRate : request.body.netRunRate,
    isActive: request.body.isActive === undefined ? checkTournamentTeamPointExists.isActive : request.body.isActive,
    id: request.body.id,
    tpId: request.body.tpId === undefined ? checkTournamentTeamPointExists.tpId : request.body.tpId,
    groupName: request.body.groupName === undefined ? checkTournamentTeamPointExists.groupName : request.body.groupName,
    position: request.body.position === undefined ? checkTournamentTeamPointExists.position : request.body.position,
    prevGroupId: request.body.prevGroupId === undefined ? checkTournamentTeamPointExists.prevGroupId : request.body.prevGroupId,
    groupDisplayOrder: request.body.groupDisplayOrder === undefined ? checkTournamentTeamPointExists.groupDisplayOrder : request.body.groupDisplayOrder
  };

  await updateTournamentTeamPointsQuery(updateData, fastify, request);

  if (validateCompetitionId && validateCompetitionId.isActive == true) {
    const res = await responseChangeService(updateData?.teamId, updateData?.competitionId);
    await callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "update",
          data: { ...updateData, ...res }
        }
      }, request, fastify,
      "services/tournamentTeamPoints.js/updateTblTournamentTeamPointsService"
    );
  }
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
    const competitionData = global.tblCompetitions.find(
      item => item.competitionId === item.competitionId
    );
    if(!competitionData){
      throw new Error('CompetitionId does not existed');
    }

    const validateTeamId = global.tblTeams.find(
      (elem) => elem.teamId === item.teamId
    );
    if(!validateTeamId){
      throw new Error('TeamId does not existed');
    }
    const saveData = await insertTournamentTeamPointsQuery(item, fastify, request);

    if (competitionData && competitionData.isActive == true) {
      const res = await responseChangeService(saveData?.teamId, saveData?.competitionId);
      await callClientAPI(
       {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateSeoModule,
          data: {
            module: 'tournamentTeamPoints',
            type: "add",
            data: { ...saveData, ...res }
          }
       }, request, fastify,
        "services/tournamentTeamPoints.js/createTournamentTeamPointsService"
      );
    }
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
    const competitionData = global.tblCompetitions.find(
      item => item.competitionId === item.competitionId
    );
    if(!competitionData){
      throw new Error('CompetitionId does not existed');
    }

    const validateTeamId = global.tblTeams.find(
      (elem) => elem.teamId === item.teamId
    );
    if(!validateTeamId){
      throw new Error('TeamId does not existed');
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
      tpId: item.tpId || validateId.tpId,
      groupName: item.groupName || validateId.groupName,
      position: item.position || validateId.position,
    };

    await updateTournamentTeamPointsQuery(updateData, fastify, request);

    if (competitionData && competitionData.isActive == true) {
      const res = await responseChangeService(updateData?.teamId, updateData?.competitionId);
      await callClientAPI(
       {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateSeoModule,
          data: {
            module: 'tournamentTeamPoints',
            type: "update",
            data: { ...updateData, ...res }
          }
       }, request, fastify,
        "services/tournamentTeamPoints.js/updateTournamentTeamPointsService"
      );
    }

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
  const whereCond = `"wrIsDeleted" = FALSE AND "wrTeamId" = ${teamId} AND "wrCompetitionId" = ${competitionId}`
  const validate = await getTournamentTeamPointsQuery(whereCond, request, fastify);
  if (validate.length <= 0) {
    await deletePlayerByTeamQuery({ teamId, competitionId }, request , fastify);
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
      (item) => !(teamId.includes(item.teamId) && item.competitionId === competitionId)
    );
  }

  await callClientAPI(
   {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: 'tournamentTeamPoints',
        type: "delete",
        data: {
          id: id
        }
      }
   },
   request, fastify,
    "services/tournamentTeamPoints.js/deleteTournamentTeamPointsService"
  );
  

  return `TournamentTeamPoint(s) deleted successfully`;
};

const activeInactiveTournamentTeamPointsService = async (request, fastify) => {
  const { id, isActive } = request.body;
  let validationResult = null;
  
  let where = `"wrIsDeleted" = false AND "wrId" = ${id}`
  const validate = await getTournamentPointsByGroupNameQuery(where, request, fastify);
  if(!validate) {
    throw new Error(`tournamentTeam with this Id not found`)
  }

  if (isActive) {
    let whereCond = `"wrIsDeleted" = false 
      AND "wrId" != ${id} AND "wrCompetitionId" = ${validate?.competitionId} 
      AND "wrTeamId" = ${validate?.teamId} AND "wrGroupId" != ${validate?.groupId}
      AND "wrIsActive" = TRUE`;
    const validation = await getTournamentPointsByGroupNameQuery(whereCond, request, fastify);
    if(validation) {
      const updated = await activeInactiveTournamentTeamPointsQuery({ id: validation?.id, isActive: false }, request, fastify);
      validationResult = updated[0];
    }
  }

  const result = await activeInactiveTournamentTeamPointsQuery({ id, isActive }, request, fastify);
  const competitionData = global.tblCompetitions.find(
    item => item.competitionId === result[0].competitionId
  );
  if (competitionData && competitionData.isActive == true) {
    const res = await responseChangeService(result[0]?.teamId, result[0]?.competitionId);
    let updateData = [];

    if(validationResult != null) {
      updateData.push({ ...validationResult, ...res });
    }
    updateData.push({ ...result[0], ...res })
    await callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "activeData",
          data: updateData
        }
     },
     request, fastify,
      "services/tournamentTeamPoints.js/activeInactiveTournamentTeamPointsService"
    );
  }

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
    // const competitionResult = global.tblTeamCompetition.filter(
    //   (item) => item.refCompetitionId === request.body.competitionId
    // );
    const competitionResult = await getTournamentTeamsByCompIdQuery(request.body.competitionId, request, fastify);
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
  const updatedData = result[0]?.[0].updated_row
  const competitionData = global.tblCompetitions.find(
    item => item.competitionId === updatedData.competitionId
  );
  if (competitionData && competitionData.isActive == true) {
    const res = await responseChangeService(updatedData?.teamId, updatedData?.competitionId);
    await callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "update",
          data: { ...updatedData, ...res }
        }
     }, null, fastify,
      "services/tournamentTeamPoints.js/setTeamNetRunRateService"
    );
  }
  return updatedData;
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

const responseChangeService = async (teamId, compeitionId) => {
  const competition = global.tblCompetitions.find(item => item.competitionId === compeitionId);
  const team = global.tblTeams.find(item => item.teamId === teamId);
  return {
    teamName: team?.teamName ?? null,
    teamShortName: team?.teamShortName ?? null,
    competition: competition?.competition ?? null
  }
}

const getAllTournamentTeamPointsService = async (request, fastify) => {
  let result = await getClientTournamentTeamPointsQuery(request, fastify);
  return result;
};

const addEditTournamentTeamPointDataService = async (result, competitionId, fastify = null, request = null) => {
  const entitySocketData = global.tblEntitySockets[0];
  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());

  const filterTeams = (result?.teams || []).filter(team => !nullTeamtpIds.includes(team.tid));
  const teams = [];
  for (let team of filterTeams) {
    team = await upsertTeamOnImportService(team, entitySocketData, eventType, fastify, request);
    teams.push(team);
  }

  let alltournamentTeamPoints = await getAllTournamentTeamPointsQuery(fastify);
  alltournamentTeamPoints = alltournamentTeamPoints.filter(item => item.competitionId === competitionId);

  const getPointTable = global.tblCompetitions.find(item => item.competitionId === competitionId)?.isPointTable;
  let standings = result?.standing?.standings || [];
  if (standings.length === 0) {
    if (getPointTable !== false) {
      await saveCompetitionService({
        ...request,
        body: {
          competitionId: competitionId,
          isPointTable: false
        }
      }, fastify);
    }
    standings = [{
      round: {
        order: 1,
        name: result?.abbr
      },
      standings: result?.teams?.map(team => {
          return {
            team_id: team.tid,
            played: 0,
            win: 0,
            loss: 0,
            draw: 0,
            nr: 0,
            netrr: 0,
            points: 0,
            quality: "false",
            eliminate: "false",
            team
          }
        })
    }];
  } else {
    if (getPointTable !== true) {
      await saveCompetitionService({
        ...request,
        body: {
          competitionId: competitionId,
          isPointTable: true
        }
      }, fastify);
    }
  }

  const groupData = extractGroupDataFromArray(standings);

  for (let gd of groupData) {
    for (let s of gd?.standings || []) {
      const team = teams.find(team => team.tpId === s.teamTpId);
      if (team) {
        const checkTournamentTeamPoint = alltournamentTeamPoints.find(item => item.competitionId === competitionId && item.teamId === team?.teamId && item.groupId === gd.groupId);
        if (checkTournamentTeamPoint) {
          const updateTournamentTeamPointData = {
            ...checkTournamentTeamPoint,
            ...gd,
            ...s,
            isActive: !s?.position ? true : (s?.position === teamRemarkType.Q ? false : true)
          }
          let updateData = await updateTournamentTeamPointsQuery(updateTournamentTeamPointData, fastify, request);
          updateData = updateData[0];
          let validateComp = global.tblCompetitions.find(item => item.competitionId == competitionId)
          if (validateComp && validateComp?.isActive == true) {
            const res = await responseChangeService(updateData?.teamId, updateData?.competitionId);
            await callClientAPI(
              {
                serviceType: ServiceType.clientAPI,
                moduleType: APIEndpointModuleType.updateSeoModule,
                data: {
                  module: 'tournamentTeamPoints',
                  type: "update",
                  data: { ...updateData, ...res }
                }
              }, null, fastify,
              "services/tournamentTeamPoints.js/addEditTournamentTeamPointDataService"
            );
          }
        } else {
          const data = {
            groupId: gd.groupId,
            groupName: gd.groupName || (competitionRoundType === "series" ? result?.title : "Group A"),
            teamId: team.teamId,
            competitionId,
            tpId: team.tpId || null,
            ...gd,
            ...s,
            isActive: !s?.position ? true : (s?.position === teamRemarkType.Q ? false : true)
          }
          const pointData = await insertTournamentTeamPointsQuery(data, fastify, request);
          if (pointData) {
            let validateComp = global.tblCompetitions.find(item => item.competitionId == competitionId)
            if (validateComp && validateComp?.isActive == true) {
              const res = await responseChangeService(pointData?.teamId, pointData?.competitionId);
              await callClientAPI(
                {
                  serviceType: ServiceType.clientAPI,
                  moduleType: APIEndpointModuleType.updateSeoModule,
                  data: {
                    module: 'tournamentTeamPoints',
                    type: "add",
                    data: { ...pointData, ...res }
                  }
                }, null, fastify,
                "services/tournamentTeamPoints.js/addEditTournamentTeamPointDataService"
              );
            }
          }
        }
      } else {
        errorLogger(
          fastify,
          `Missing team tpId ${s.teamTpId} in competition id ${competitionId}`,
          "services/tournamentTeamPoints.js/addEditTournamentTeamPointDataService - team",
          null
        );
      }
    }
  }
}

const importUpdateTournamentTeamPointFromEntitySportService = async (data, fastify, request) => {
  const competitionTpId = data.cid;

  const checkCompetition = global.tblCompetitions.find(item => item.tpId === competitionTpId);
  if (!checkCompetition) {
    throw new Error(`Competition not found for tpid: ${competitionTpId}`);
  }

  const url = entitySportAPIEndPoint.getCompetitionData.replace('{cid}', competitionTpId);
  const entitySportCompetitionInfo = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportCompetitionInfo?.data?.result;
  }

  let entitySportCompetitionInfoResponse = entitySportCompetitionInfo?.data?.result;
  if (!entitySportCompetitionInfoResponse) {
    throw new Error(`Invalid response from Entit-Sport API for url ${url}`);
  }

  await addEditTournamentTeamPointDataService(entitySportCompetitionInfoResponse, checkCompetition?.competitionId, fastify, request);
  const entityCompetitionStatus = compStatus[entitySportCompetitionInfoResponse?.status]
  if (entityCompetitionStatus !== checkCompetition?.commStatus) {
    await saveCompetitionService({
      ...request,
      body: {
        competitionId: checkCompetition?.competitionId,
        commStatus: entityCompetitionStatus
      }
    }, fastify);
  }
  return entitySportCompetitionInfoResponse;
};

const insertTournamentTeamPointInAutoImportService = async (fastify) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 2);

    const competitionList = global.tblCompetitions.filter(cp => cp.tpId);
    for (const competition of competitionList) {
      const start = new Date(competition.startDate);
      const end = new Date(competition.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const isActiveToday = today >= start && today <= end;

      const endedYesterday = end.getTime() === yesterday.getTime();

      if (isActiveToday || endedYesterday) {
        await insertAutoImportDataService({
          body: {
            refId: competition.tpId,
            refType: RefType.tournamentTeamPointUpdate,
            sourceId: 3
          },
          userTokenInfo: {
            WrUserId: -2
          }
        }, fastify);
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/tournamentTeamPoints.js/insertTournamentTeamPointInAutoImportService",
      null
    );
  }
}

const changeDisplayOrderService = async (request, fastify) => {
  const competitionId = request.body.competitionId;
  const validateCompetition = global.tblCompetitions.find(item => item.competitionId === competitionId);
  if (!validateCompetition) {
    throw new Error(`Competition not found for id: ${competitionId}`);
  }
  for (const item of request.body.displayOrderData) {
    const queryData = {
      groupId: item.groupId,
      groupDisplayOrder: item.displayOrder,
      competitionId: request.body.competitionId
    }
    await changeDisplayOrderQuery(queryData, request, fastify);
  }
  return "Display order updated successfully";
}

const updateTournamentTeamPointGroupVisibleStatusService = async (request, fastify) => {
  const { competitionId, groupId } = request.body;
  const validateCompetition = global.tblCompetitions.find(item => item.competitionId === competitionId);
  if (!validateCompetition) {
    throw new Error(`Competition not found for id: ${competitionId}`);
  }

  let where = `"wrIsDeleted" = false AND "wrCompetitionId" = ${competitionId} AND "wrGroupId" = ${groupId}`;
  const validateGroup = await getTournamentPointsByGroupNameQuery(where, request, fastify);
  if (!validateGroup) {
    throw new Error(`Group not found for id: ${groupId} in competition id: ${competitionId}`);
  }

  await updateTournamentTeamPointGroupVisibleStatusQuery(request, fastify);
  return "Client visibility status updated successfully";
}

module.exports = {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService,
  setTeamPointService,
  saveTblTournamentTeamPointsService,
  teamsListService,
  netRunRateRe_calculationService,
  getAllTournamentTeamPointsService,
  addEditTournamentTeamPointDataService,
  importUpdateTournamentTeamPointFromEntitySportService,
  insertTournamentTeamPointInAutoImportService,
  changeDisplayOrderService,
  updateTournamentTeamPointGroupVisibleStatusService
};
