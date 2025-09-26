const { getAutoImportDataByIdQuery, insertAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { createTeamPointLogQuery, getLogByComIdQuery } = require("../repository/TableTeamPointLogs");
const { deletePlayerByTeamQuery } = require("../repository/TableTournamentsTeamPlayers");
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
} = require("../repository/TableTournmentTeamPoints");
const { callClientAPI, ServiceType, APIEndpointModuleType, callEntitySportAPI, extractGroupDataFromArray, teamRemarkType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const { updateAutoImportDataService } = require("./autoImportData");

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

  if(request.body.groupId) {
    //validate team in same groupId
    let where = `"wrIsDeleted" = false AND "wrCompetitionId" = ${request.body.competitionId} AND "wrTeamId" = ${request.body.teamId} AND "wrGroupId" = ${request.body.groupId}`;
    const validateSameGroup = await getTournamentPointsByGroupNameQuery(where, request, fastify);
    if(validateSameGroup) {
      throw new Error(`Team already existed with this groupId`)
    }
  
    //validate team in other groupIds
    let whereCond = `"wrIsDeleted" = false AND "wrCompetitionId" = ${request.body.competitionId} AND "wrTeamId" = ${request.body.teamId} AND "wrGroupId" != ${request.body.groupId} AND "wrIsActive" = TRUE`;
    const validateOtherGroup = await getTournamentPointsByGroupNameQuery(whereCond, request, fastify);
    if(validateOtherGroup) {
      throw new Error(`Team already existed with another groupId`)
    }
  } else {
     const existedValues = await getTournamentPointsByTeamIdQuery(
        {competitionId: request.body.competitionId, teamId: request.body.teamId}, 
        request,
        fastify
      );  
      if(existedValues){
        throw new Error("TeamId existed with this competitionId");
      }
  }

  request.body.tpId = validateTeamId?.tpId ?? null;
    
  const saveData = await insertTournamentTeamPointsQuery(request.body, fastify, request);
  if (validateCompetitionId && validateCompetitionId.isActive == true) {
    const res = await responseChangeService(saveData?.teamId, saveData?.competitionId);
  
    callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "add",
          data: { ...saveData, ...res}
        }
     }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tournamentTeamPoints.js/createTblTournamentTeamPointsService - callClientAPI",
        request
      );
    });
  }
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
    tpId: request.body.tpId === undefined ? validateId.tpId : request.body.tpId,
    groupName: request.body.groupName === undefined ? validateId.groupName : request.body.groupName,
    position: request.body.position === undefined ? validateId.position : request.body.position,
  };

  await updateTournamentTeamPointsQuery(updateData, fastify, request);

  if (validateCompetitionId && validateCompetitionId.isActive == true) {
    const res = await responseChangeService(updateData?.teamId, updateData?.competitionId);
    callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "update",
          data: { ...updateData, ...res }
        }
     }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tournamentTeamPoints.js/updateTblTournamentTeamPointsService - callClientAPI",
        request
      );
    });
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
      callClientAPI(
       {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateSeoModule,
          data: {
            module: 'tournamentTeamPoints',
            type: "add",
            data: { ...saveData, ...res }
          }
       }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/tournamentTeamPoints.js/createTournamentTeamPointsService - callClientAPI",
          request
        );
      });
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
      callClientAPI(
       {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateSeoModule,
          data: {
            module: 'tournamentTeamPoints',
            type: "update",
            data: { ...updateData, ...res }
          }
       }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/tournamentTeamPoints.js/updateTournamentTeamPointsService - callClientAPI",
          request
        );
      });
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

  callClientAPI(
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
   request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/tournamentTeamPoints.js/deleteTournamentTeamPointsService - callClientAPI",
      request
    );
  });
  

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
    callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "activeData",
          data: updateData
        }
     },
     request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tournamentTeamPoints.js/activeInactiveTournamentTeamPointsService - callClientAPI",
        request
      );
    });
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
    callClientAPI(
     {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'tournamentTeamPoints',
          type: "update",
          data: { ...updatedData, ...res }
        }
     }, null, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tournamentTeamPoints.js/setTeamNetRunRateService - callClientAPI",
        null
      );
    });
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

const importTournamentTeamPointFromEntitySportService = async (request, fastify) => {
  const { refId, refType, sourceId } = request.body;

  const checkCompetition = global.tblCompetitions.find(item => item.tpId === refId);
  if (!checkCompetition) {
    throw new Error("Competition not found for this id");
  }

  const whereCondition = `"wrRefId" = ${refId} AND "wrRefType" = ${refType} AND "wrSourceId" = ${sourceId} AND "wrIsImported" = true`;
  const validateCompImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
  if (validateCompImportData) {
    return "Data Already added";
  }

  const insertAutoImportData = await insertAutoImportDataQuery({
    ...request.body,
    isImportStart: true,
    importStartTime: new Date()
  }, fastify, request);

  const response = await callEntitySportAPI(
    {
      serviceType: ServiceType.entitySport,
      moduleType: APIEndpointModuleType.getCompetitionInfo,
      data: {
        module: "competitionInfo",
        type: "get",
        cid: refId
      }
    },
    request,
    fastify
  );

  if (response && response.data && response.data.result) {
    const result = response.data.result.response;
    let alltournamentTeamPoints = await getAllTournamentTeamPointsQuery(fastify);
    alltournamentTeamPoints = alltournamentTeamPoints.filter(item => item.competitionId === checkCompetition?.competitionId);

    const checkTournamentTypeGroup = result?.rounds.every(item => item.type === "group") && result?.standing?.standings.length > 0;
    for (let team of result?.teams) {
      if (checkTournamentTypeGroup) {
        const highestOrder = Math.max(...result?.rounds.map(group => group.order));
        const checkTeam = global.tblTeams.find(item => item.tpId === team?.tid);
        if (checkTeam) {
          const getdata = {
            teamId: checkTeam?.teamId,
            competitionId: checkCompetition?.competitionId,
          }
          const groupData = extractGroupDataFromArray(result?.standing?.standings, team?.tid);
          for (let gd of groupData) {
            const checkTournamentTeamPoint = alltournamentTeamPoints.find(item => item.competitionId === checkCompetition?.competitionId && item.teamId === checkTeam?.teamId && item.groupId === gd.groupId);

            if (checkTournamentTeamPoint) {
              const updateTournamentTeamPointData = {
                ...checkTournamentTeamPoint,
                ...gd,
                isActive: highestOrder === gd.groupId ? true : (gd.position === teamRemarkType.Q ? false : true)
              }
              await updateTournamentTeamPointsQuery(updateTournamentTeamPointData, fastify, request);
            } else {
              const data = {
                groupId: 1,
                groupName: null,
                teamId: checkTeam?.teamId,
                competitionId: getdata?.competitionId,
                tpId: checkTeam?.tpId || null,
                isActive: highestOrder === gd.groupId ? true : (gd.position === teamRemarkType.Q ? false : true),
                ...gd
              }
              await insertTournamentTeamPointsQuery(data, fastify, request);
            }
          }
        }
      }
    }

    await updateAutoImportDataService({
      ...request,
      body: {
        ...request.body,
        isImported: false,
        importEndTime: new Date(),
        id: insertAutoImportData.id
      }
    }, fastify);

    return `Tournament team point data imported successfully`;

  } else {
    await updateAutoImportDataService({
      ...request,
      body: {
        ...request.body,
        isImported: false,
        importEndTime: new Date(),
        id: insertAutoImportData.id
      }
    }, fastify);
    throw new Error("Error fetching Competition info data from EntitySport API");
  }

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
  getAllTournamentTeamPointsService,
  importTournamentTeamPointFromEntitySportService
};
