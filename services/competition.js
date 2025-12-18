const {
  insertCompetitionQuery,
  deleteCompetitionQuery,
  updateCompititionQuery,
  getAllCompititionQuery,
  updateDisplayOrderQuery,
  isTrendingChangeStatusQuery,
  isEventSnapCompetitionQuery,
  isPointTableCompetitionQuery,
  isMenChangeStatusQuery,
  getTemplateByCompetitionIdQuery,
  saveCompMarketTemplateQuery,
  isVirtualCompetitionQuery,
  deleteCompMarketTemplateQuery,
  getAssignedTemplateByCompetitionIdQuery,
  upStatusQuery,
  getMatchTypeTemplateByCompetitionIdQuery,
  updateTpIdCompQuery,
  updateCompititionDateByCompetitionIdQuery,
  changeIsCompetitionStatisticsCalculationStatusQuery,
} = require("../repository/TableCompitition");
const {storeImageOnServer, removeImageFromServer, generateImageName, getImageFromUrl } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { APIEndpointModuleType, ServiceType, callClientAPI, compStatus, callCardCricket, callEntitySportAPI, EntityEnums, EventType, CompetitionType, checkEntitySportAPIEndpointIsActive, matchStatusEntity, error, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, parseUmpires, ScoringTypes, RefType } = require("../utilities");
const { getCommentariesResultQuery, getAllCommByCompIdQuery, insertCommentaryQuery, insertCommentaryTeams, getCommentaryTeamsQuery, insertCommentaryPlayers, deleteCommentaryPlayersByPlayerId, updateCommentaryPlayerById, isCountInPOintCommentaryChangeQuery, updateCommentaryDateByCommentaryIdQuery } = require("../repository/TableCommentary")
const { deleteTournamentTeamPlayersByCompIdQuery, deleteTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers");
const { deleteTournamentTeamPointsByCompIdQuery } = require("../repository/TableTournmentTeamPoints");
const { nullTeamtpIds, autoUpdateCommentaryDataStatus } = require("../utilities/entityConst");
const { insertTeamQuery, updateExchangeTeamQuery, getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { insertPlayerQuery, updateExchangePlayerQuery } = require("../repository/TablePlayer");
const { insertTeamPlayerQuery, updateTeamPlayerHomeTeamQuery } = require("../repository/TableTeamPlayer");
const { addDeleteTournamentTeamPlayersService } = require("./tournamentTeamPlayers");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { errorLogger, commActionLogger } = require("../utilities/logger");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { insertWeatherQuery, updateWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertAutoImportDataService } = require("./autoImportData");
const { insertAutoUpdateCommentaryDataQuery, getAllAutoUpdateCommentaryDataQuery } = require("../repository/TableAutoUpdateCommentaryData");

// const allCompetitionService = async (request) => {
//   const { isActive, isTrending, eventTypeId, matchTypeId, isMen, type } = request.body;

//   const filterObject = {
//     isActive: isActive,
//     isTrending: isTrending,
//     eventTypeId: eventTypeId === 0 ? null : eventTypeId,
//     matchTypeId: matchTypeId === 0 ? null : matchTypeId,
//     isMen: isMen,
//     type: type === 0 ? null : type,
//   };
//   // Additional checks for "0" and undefined
//   filterObject.eventTypeId =
//     eventTypeId === 0 || eventTypeId === undefined
//       ? null
//       : filterObject.eventTypeId;
//   filterObject.matchTypeId =
//     matchTypeId === 0 || matchTypeId === undefined
//       ? null
//       : filterObject.matchTypeId;
//   if (isActive === undefined || isTrending === undefined || isMen === undefined) {
//     const result = global.tblCompetitions.filter(
//       (item) => item.isActive === true
//     );
//     return result;
//   } else {
//     const result = global.tblCompetitions.filter((item) => {
//       return (
//         (filterObject.isActive === null ||
//           item.isActive === filterObject.isActive) &&
//         (filterObject.eventTypeId === null ||
//           item.eventTypeId === filterObject.eventTypeId) &&
//           (filterObject.isTrending === null ||
//             item.isTrending === filterObject.isTrending) &&
//             (filterObject.matchTypeId === null ||
//               item.matchTypeId === filterObject.matchTypeId) &&
//               (filterObject.isMen === null ||
//                 item.isMen === filterObject.isMen) &&
//                 (filterObject.type === null ||
//                   item.type === filterObject.type)
//       );
//     });
//     return result;
//   }
// };

const allCompetitionService = async (request) => {
  const { isActive, isTrending, eventTypeId, matchTypeId, isMen, type, isVirtual, pythonId, countryId, commStatus, isCompetitionStatisticsCalculation } = request.body;

  const filterObject = {};

  filterObject.isActive = isActive !== undefined ? isActive : true;
  if (isTrending !== undefined) filterObject.isTrending = isTrending;
  if (eventTypeId !== undefined && eventTypeId !== 0) filterObject.eventTypeId = eventTypeId;
  if (matchTypeId !== undefined && matchTypeId !== 0) filterObject.matchTypeId = matchTypeId;
  if (isMen !== undefined) filterObject.isMen = isMen;
  if (type !== undefined && type !== 0) filterObject.type = type;
  if (typeof isVirtual === 'boolean') filterObject.isVirtual = isVirtual;
  if (pythonId !== undefined && pythonId !== 0) filterObject.pythonId = pythonId;
  if (countryId !== undefined && countryId !== 0) filterObject.countryId = countryId;
  if (typeof isCompetitionStatisticsCalculation === 'boolean') filterObject.isCompetitionStatisticsCalculation = isCompetitionStatisticsCalculation;

  // if (isActive === undefined || isTrending === undefined) {
  //   return global.tblCompetitions.filter((item) => item.isActive === true);
  // }

  let result = global.tblCompetitions.filter((item) => {
    return Object.entries(filterObject).every(([key, value]) => item[key] === value);
  });

  if (commStatus === undefined) {
    result = result.filter(
      (item) => ![3].includes(item?.commStatus)
    );
  } else if (commStatus && commStatus != 0) {
    result = result.filter(
      (item) => item?.commStatus == commStatus
    );
  } else if (commStatus == 0) {
    result = result;
  }

  const compData = result.map(item => {
    const eventType = global.tblEventTypes.find(elem => elem.eventTypeId == item.eventTypeId)?.eventType || null;
    return {
      ...item,
      eventType
    }
  });

  return compData;
};

const competitionByIdService = async (request) => {
  const { competitionId } = request.body;
  const result = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );
  return result || null;
};

const competitionByeventTypeIdService = async (request) => {
  const { eventTypeId } = request.body;
  const result = global.tblCompetitions.filter(
    (item) => item.eventTypeId === eventTypeId
  );
  return result || null;
};

const createCompititionService = async (request, fastify) => {
  const findExists = global.tblCompetitions.find(
    (item) =>
      item.eventTypeId === request.body.eventTypeId &&
      item.refId === request.body.refId
  );

  if (findExists) {
    throw new Error(
      "Competition with this eventTypeId and refId already exists"
    );
  }

  const validateEventTypeId = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!validateEventTypeId) {
    throw new Error("EventType with this id not Found");
  }

  if (request.body.countryId) {
    const validateCountry = global.tblCountryCodes.find(
      (item) => item.id === request.body.countryId
    );
    if (!validateCountry) {
      throw new Error("Country with this id not Found");
    }
  }

  if (request.body.matchTypeId !== undefined 
    && request.body.matchTypeId != 0 
    && request.body.matchTypeId != null) {
    const validate = global.tblMatchTypes.find(
      (item) => item.matchTypeId == request.body.matchTypeId
    );
    if (!validate) {
      throw new Error('MatchTypeId does not exist');
    }
  }

  if (request.body?.tpId !== undefined) {
    const validate = global.tblCompetitions.find(
      (item) => item.tpId == request.body?.tpId && item.tpId !== null
    );
    if (validate) {
      throw new Error('TpId already exist');
    }
  }
  // if(request.body?.tpId == "") {
  //   request.body.tpId = null
  // }

  if (request.body.image && request.body.image.length) {
    let imgName = generateImageName({
      name: `${request.body.competition}-${validateEventTypeId.eventType}`,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase() 
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      name : imgName,
      project : projectName,
      ...ImgModuleConfig.Competitions,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }

  const result = await insertCompetitionQuery(request, fastify);


   if(result.isVirtual == true && (
    result.commStatus == compStatus.started || result.commStatus == compStatus.stopped
  )
  ){
    let isStop = result.commStatus == compStatus.stopped ? true : false;
    callCardCricket(
      {
        refId : result.competitionId.toString(),
        isStop : isStop,
      },
      request,
      fastify
    )
  }
  global.tblCompetitions.push(result);

  if(result.isActive && result.isTrending){
  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : "competition",
        type : "add",
        data : result
      }
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/competition.js/createCompititionService - callClientAPI",
      request
    )
  });
  }
  return result;
};

const updateCompititionService = async (request, fastify) => {
  const { competitionId } = request.body;
  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }
  if (request.body.countryId) {
    const validateCountry = global.tblCountryCodes.find(
      (item) => item.id === request.body.countryId
    );
    if (!validateCountry) {
      throw new Error("Country with this id not Found");
    }
  }
  if (request.body?.tpId !== undefined && request.body?.tpId !== null) {
    const validate = global.tblCompetitions.find(
      (item) => item.tpId == request.body?.tpId && item.competitionId != competitionId &&
      item.tpId !== null
    );
    if (validate) {
      throw new Error('TpId already exist');
    }
  }
  if (request.body.matchTypeId !== undefined &&
    request.body.matchTypeId !== null &&
    validateId.matchTypeId != request.body.matchTypeId &&
  request.body.matchTypeId !== 0) {
    const templates = await getAssignedTemplateByCompetitionIdQuery(competitionId, request, fastify);
    if (templates.length > 0) {
      const templateIds = templates.map(item => { return item.id });
      await deleteCompMarketTemplateQuery(templateIds, request, fastify);
    }
  }
  const data = {
    competitionId: request.body.competitionId,
    competition: request.body.competition || validateId.competition,
    eventTypeId: validateId.eventTypeId,
    refId: request.body.refId || validateId.refId,
    image: validateId.image,
    isActive: validateId.isActive,
    eventType: validateId.eventType,
    displayOrder: validateId.displayOrder,
    isTrending: validateId.isTrending,
    isEventSnap: validateId.isEventSnap,
    isPointTable: validateId.isPointTable,
    matchTypeId: request.body.matchTypeId || validateId.matchTypeId,
    winPoint: request.body.winPoint || validateId.winPoint,
    tiePoint: request.body.tiePoint || validateId.tiePoint,
    cancelPoint: request.body.cancelPoint || validateId.cancelPoint,
    lossPoint: request.body.lossPoint || validateId.lossPoint,
    drsCount : request.body.drsCount || validateId.drsCount,
    imagePath: validateId.imagePath,
    isMen: validateId.isMen,
    type: request.body.type || validateId.type,
    isVirtual: validateId.isVirtual,
    commStatus: request.body.commStatus || validateId.commStatus,
    startDate: request.body.startDate || validateId.startDate,
    endDate: request.body.endDate || validateId.endDate,
    // tpId: request.body.tpId || validateId.tpId,
    tpId: request.body.tpId === undefined ? validateId.tpId
      : [0, '', 'null'].includes(request.body.tpId) ? null
      : request.body.tpId,
    pythonId: request.body.pythonId || validateId.pythonId,
    countryId: request.body.countryId === undefined ? validateId.countryId : request.body.countryId,
    setOfRules: request.body?.setOfRules || validateId?.setOfRules,
  };
  const developerName = global.tblPythonAPI.find(item => item.id === data?.pythonId);
  data.developerName = developerName?.developerName ?? null
  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }
  if("isTrending" in request.body){
    data.isTrending = request.body.isTrending;
  }
  if("isEventSnap" in request.body){
    data.isEventSnap = request.body.isEventSnap === 'true';
  }
  if("isPointTable" in request.body){
    data.isPointTable = request.body.isPointTable === 'true';
  }
  if("isMen" in request.body){
    data.isMen = request.body.isMen === 'true';
  }
  if("isVirtual" in request.body){
    data.isVirtual = request.body.isVirtual === 'true';
  }
  if ("isCompetitionStatisticsCalculation" in request.body) {
    data.isCompetitionStatisticsCalculation = request.body.isCompetitionStatisticsCalculation
  }

  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    } else {
      data.eventTypeId = request.body.eventTypeId;
      data.eventType = validateEventTypeId.eventType;
    }
  }

  if (request.body.image && request.body.image.length) {
    let imgName = generateImageName({
      name: `${request.body.competition}-${data.eventType}`,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase() 
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      name : imgName,
      project : projectName,
      ...ImgModuleConfig.Competitions,
    });
    
    data.image = fullPath;
    data.imagePath = imagePath;
  }

  await updateCompititionQuery(data, fastify, request);

  if(validateId.commStatus != data.commStatus &&
    (data.commStatus == compStatus.started || data.commStatus == compStatus.stopped) &&
    data.isVirtual == true
  ){
    let isStop = data.commStatus == compStatus.stopped ? true : false;
    callCardCricket(
      {
        refId : data.competitionId.toString(),
        isStop : isStop,
      },
      request,
      fastify
    )
  }

  const index = global.tblCompetitions.findIndex(
    (item) => item.competitionId === competitionId
  );

  global.tblCompetitions[index] = data;

if(data.isActive && data.isTrending){
  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data : {
        module : "competition",
        type : "update",
        data : data
      }
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/competition.js/updateCompititionService - callClientAPI",
      request
    )
  });
}
  return data;
};

const saveCompetitionService = async (request, fastify) => {
  const { competitionId } = request.body;

  if (competitionId === 0) {
    return await createCompititionService(request, fastify);
  } else {
    return await updateCompititionService(request, fastify);
  }
};

const deleteCompetitionService = async (request, fastify) => {
  const { competitionId } = request.body;

  for (const id of competitionId) {
    //validate id here
    const validateId = global.tblCompetitions.find(
      (item) => item.competitionId === id
    );
    if(!validateId){
      throw new Error(`Competition with id ${id} not found`);
    }

    const commentaryExists = await getAllCommByCompIdQuery(id, request, fastify);
    if (commentaryExists) {
      throw new Error(`'${validateId?.competition}' competition has commentary and cannot be deleted at the moment`);
    }

    if (validateId?.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
  }

  await deleteCompetitionQuery(request, fastify);

  global.tblCompetitions = global.tblCompetitions.filter(
    (item) => !competitionId.includes(item.competitionId)
  );

  await deleteTournamentTeamPointsByCompIdQuery(competitionId, fastify, request);
  await deleteTournamentTeamPlayersByCompIdQuery(competitionId, request, fastify);
  
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => 
    !competitionId.includes(item.competitionId)
  )
  // global.tblCommentaries = global.tblCommentaries.filter(
  //   (item) => !competitionId.includes(item.competitionId)
  // );

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data : {
        module : "competition",
        type : "delete",
        data : { competitionId : competitionId }
      }
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/competition.js/deleteCompetitionService - callClientAPI",
      request
    )
  });

  return `Competition(s) deleted successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
  const competitionIds = [...request.body.map((item) => item.competitionId)];

  const allCompetitionsData = global.tblCompetitions.filter((item) =>
    competitionIds.includes(item.competitionId)
  );

  if (allCompetitionsData.length !== competitionIds.length) {
    throw new Error("Invalid competition id");
  }

  const checkALlEventTypeId = allCompetitionsData.every(
    (item) => item.eventTypeId === allCompetitionsData[0].eventTypeId
  );

  if (!checkALlEventTypeId) {
    throw new Error("All competitions should have same eventTypeId");
  }

  for (const item of request.body) {
    const dispalyOrderData = await updateDisplayOrderQuery(item, fastify, request);
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data : {
          module : "competition",
          type : "displayOrder",
          data : dispalyOrderData
        }
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/competition.js/updateDisplayOrderService - callClientAPI",
        request
      )
    });
  }

  global.tblCompetitions = await getAllCompititionQuery(fastify);

  return "Display order updated successfully";
};

const isTrendingChangeStatusService = async (request, fastify) => {
  const { competitionId, isTrending } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await isTrendingChangeStatusQuery(
    {
      competitionId,
      isTrending,
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isTrending = isTrending;
  }
  
  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : "competition",
        type : isTrending ? "isTrue" : "isFalse",
        data : global.tblCompetitions[index]
      }
    }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/competition.js/isTrendingChangeStatusService - callClientAPI",
      request
    );
  });
  
  return `Competition isTrending status updated successfully`;
};

const isEventSnapService = async (request, fastify) => {
  const { competitionId, isEventSnap } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await isEventSnapCompetitionQuery(
    {
      competitionId,
      isEventSnap,
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isEventSnap = isEventSnap;
  }
  
  callClientAPI(
    {
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : "competition",
        type : "update",
        data : global.tblCompetitions[index]
      }
    }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "API ERROR --> services/competition.js/isEventSnapService - callClientAPI",
      request
    );
  });
  
  return `Competition isEventSnap status updated successfully`;
};

const isPointTableService = async (request, fastify) => {
  const { competitionId, isPointTable } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  let winPoint = validateId.winPoint, tiePoint = validateId.tiePoint, lossPoint = validateId.cancelPoint, cancelPoint = validateId.lossPoint;
  if (isPointTable === true) {
    if (!validateId.winPoint) winPoint = 2;
    if (!validateId.tiePoint) tiePoint = 0;
    if (!validateId.lossPoint) lossPoint = 0;
    if (!validateId.cancelPoint) cancelPoint = 1;
  }

  const getCommentaryByCompetitionId = global.tblCommentaries.filter(tc => tc.competitionId === competitionId && [1, 2, 3, 5].includes(tc.commentaryStatus));
  for (const commentary of getCommentaryByCompetitionId) {
    const getCommentaryIndex = global.tblCommentaries.findIndex(tc => tc.commentaryId === commentary.commentaryId);
    const bodyData = {
      commentaryId: commentary.commentaryId,
      isCountInPoint: isPointTable
    };
    await isCountInPOintCommentaryChangeQuery(bodyData, fastify, request);
    global.tblCommentaries[getCommentaryIndex].isCountInPoint = isPointTable;

    commActionLogger(
      {
        commentaryId: commentary.commentaryId,
        requestBody: {
          ...request.body,
          ...bodyData
        },
        response: {
          message: "Commentary Updated successfully",
        },
        apiName: "/admin/commentary/isCountInPoint",
      },
      request,
      fastify
    ).catch((err) => {
      console.log("isCountInPoint commActionLogger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/competition.js/isPointTableService - commActionLogger",
        request
      );
    });
  }

  await isPointTableCompetitionQuery(
    {
      competitionId,
      isPointTable,
      winPoint,
      tiePoint,
      cancelPoint,
      lossPoint
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if (index != -1) {
    global.tblCompetitions[index].isPointTable = isPointTable;
    global.tblCompetitions[index] = {
      ...global.tblCompetitions[index],
      isPointTable: isPointTable,
      winPoint,
      tiePoint,
      cancelPoint,
      lossPoint
    }
  }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: "competition",
        type: "update",
        data: global.tblCompetitions[index]
      }
    }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/competition.js/isPointTableService - callClientAPI",
        request
      );
    });

  return `Competition isEventSnap status updated successfully`;
};

const getCompletedCommentaryResultService = async (request, fastify) => {
  const { page = 1, limit = 10, competitionId, teamId, startDate, endDate } = request.body;
  let result = await getCommentariesResultQuery(request, fastify);

  if(competitionId){
    result = result.filter((item) => item.competitionId === competitionId);
  }

  if(teamId) {
    result = result.filter((item) => item.team1Id === teamId || item.team2Id === teamId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    result = result.filter((item) => {
      const eventDate = new Date(item.eventDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Sort results by eventDate in descending order
  result = result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  const startIndex = (page - 1) * limit;
  const paginatedResult = result.slice(startIndex, startIndex + limit);
  
  return {
    totalRecords: result.length,
    currentPage: page,
    totalPages: Math.ceil(result.length / limit),
    data: paginatedResult,
  };
};

const getAllTeamListService = async (request, fastify) => {
  let result = global.tblTeams;
  result = result.map((item) => {
    return {
      teamId: item.teamId,
      teamName: item.teamName,
      teamShortName: item.teamShortName,
    };
  });
  return result;
}

const getAllCompetitionListService = async (request, fastify) => {
  let result = global.tblCompetitions.filter((elem) => elem.isActive === true);
  result = result.map((item) => {
    return {
      competitionId: item.competitionId,
      competition: item.competition,
      eventTypeId: item.eventTypeId,
      eventType: item.eventType,
      startDate: item.startDate ?? null,
      endDate: item.endDate ?? null
    };
  });
  return result;
}

const isMenChangeStatusService = async (request, fastify) => {
  const { competitionId, isMen } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await isMenChangeStatusQuery(
    {
      competitionId,
      isMen,
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isMen = isMen;
  }
  
  return `Competition isMen status updated successfully`;
};
const getTemplateByCompetitionIdService = async (request, fastify) => {
  let comp = global.tblCompetitions.find(
    (item) => item?.competitionId === request.body.competitionId
  );
  if (!comp) {
    throw new Error("Competition with this id not Found");
  }
  const result = await getTemplateByCompetitionIdQuery({
    competitionId: request.body.competitionId,
    matchTypeId: comp.matchTypeId
  }, request, fastify);
  return result;
}
const getMatchTypeTemplateByCompetitionIdService = async (request, fastify) => {
  let comp = global.tblCompetitions.find(
    (item) => item?.competitionId === request.body.competitionId
  );
  if (!comp) {
    throw new Error("Competition with this id not Found");
  }
  let validateMatchType = global.tblMatchTypes.find(
    (item) => item?.matchTypeId === comp?.matchTypeId
  );
  if (!validateMatchType) {
    throw new Error("Competitions matchTypeId not found");
  }
  
  const result = await getMatchTypeTemplateByCompetitionIdQuery({
    competitionId: request.body.competitionId,
    matchTypeId: comp.matchTypeId
  }, request, fastify);

  return result;
}
const saveCompTemplatesService = async (request, fastify) => {
  const { saveTemplates, dltTemplate } = request.body;
  await saveCompMarketTemplateQuery({ saveTemplates, dltTemplate }, request, fastify);
  return "Competition Market Template(s) saved successfully";

}

const isVirtualCompetitionService = async (request, fastify) => {
  const { isVirtual, competitionId } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await isVirtualCompetitionQuery(
    {
      isVirtual,
      competitionId
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isVirtual = isVirtual;
  }
  
  return `Competition isVirtual status updated successfully`;
};

const upCompStatusService = async (request, fastify) => {
  const { commStatus, competitionId } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await upStatusQuery(
    {
      commStatus,
      competitionId
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].commStatus = commStatus;
  }
  // call cardCricket
  if(validateId.isVirtual == true && (
    commStatus == compStatus.started || commStatus == compStatus.stopped
  )
  ){
    let isStop = commStatus == compStatus.stopped ? true : false;
    callCardCricket(
      {
        refId : validateId.competitionId.toString(),
        isStop : isStop,
      },
      request,
      fastify
    )
  }

  
  return `Competition status updated successfully`;
};

const upsertPlayers = async (entitySocketData, players, playerTpId, isMen, request, fastify) => {
  let checkPlayer = global.tblPlayers.find(item => item.tpId === playerTpId);
  const getPlayerFromEntity = players?.find(p => p.pid === playerTpId);
  if (!checkPlayer && getPlayerFromEntity) {
    checkPlayer = global.tblPlayers.find((item) => item.tpId == null
      && item.playerName.toLowerCase() === getPlayerFromEntity?.title.replace(/'/g, "''").toLowerCase() &&
      item.displayName.trim().replace(/'/g, "''").toLowerCase() == getPlayerFromEntity?.short_name.toLowerCase())
    if (!checkPlayer) {
      let getCountry = null;
      if (getPlayerFromEntity?.nationality) {
        getCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === getPlayerFromEntity?.nationality.toLowerCase());
        if (!getCountry) {
          const insertCountryData = {
            countryName: getPlayerFromEntity?.nationality || null,
            isActive: true,
          };
          const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
          global.tblCountryCodes.push(insertCountryCode);
          getCountry = insertCountryCode;
        }
      }

      let insertPlayerData = {
        eventTypeId: EventType['Cricket'],
        playerTypeId: EntityPlayerType[getPlayerFromEntity?.playing_role],
        playerName: getPlayerFromEntity?.title,
        displayName: getPlayerFromEntity?.short_name,
        countryId: getCountry?.id,
        isActive: true,
        isKipper: getPlayerFromEntity?.playing_role === 'wk' ? true : false,
        isLeftHandedBatting: getPlayerFromEntity.batting_style ? !getPlayerFromEntity.batting_style.includes('Right') : false,
        isLeftArmFielding: getPlayerFromEntity.bowling_style ? !getPlayerFromEntity.bowling_style.includes('Right') : false,
        userId: -2,
        batsmanAverage: 0.0,
        batsmanStrikeRate: 0.0,
        bowlerAverage: 0.0,
        bowlerEconomy: 0.0,
        tpId: getPlayerFromEntity?.pid || null,
        bowlingStyleId: getPlayerFromEntity.bowling_type ? EntityBowlingStyleType[getPlayerFromEntity.bowling_type.toLowerCase()] : null,
        bowlingTypeId: extractBowlingStyle(getPlayerFromEntity.bowling_type, getPlayerFromEntity.bowling_style),
        image: entitySocketData?.defaultPlayerImage || null,
        imagePath: entitySocketData?.defaultPlayerImagePath || null,
        isMen,
        birthDate: getPlayerFromEntity?.birthdate || null
      };
      const insertPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
      global.tblPlayers.push(insertPlayer);
      checkPlayer = insertPlayer;

      await insertAutoImportDataService({
        ...request,
        body: {
          refId: insertPlayer?.playerId,
          refType: RefType.PlayerUpdate,
          sourceId: 3
        },
        userTokenInfo: {
          WrUserId: request?.userTokenInfo?.WrUserId ?? -2
        }
      }, fastify);
    }
    else if (checkPlayer?.tpId === null || !checkPlayer?.tpId) {
      const data = {
        userId: -2,
        tpId: getPlayerFromEntity?.pid || null,
        playerId: checkPlayer.playerId,
      };
      const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
      let index = global.tblPlayers.findIndex((i) => i.playerId == checkPlayer.playerId)
      if (index != -1) {
        global.tblPlayers[index] = updatePlayer
      }
      checkPlayer = updatePlayer;
    }
  }
  return checkPlayer;
}

const insertTeamPlayersByTeamId = async (teamId, teamTpId, isMen, request, fastify) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getTeamDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    throw new Error(checkEntitySportAPIEndpoint.message);
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{tid}", teamTpId);
  const entitySportTeamPlayers = await callEntitySportAPI(url, request, fastify);

  let entitySportTeamPlayersResponse = entitySportTeamPlayers?.data?.result?.items?.players;
  if (!entitySportTeamPlayersResponse) {
    throw new Error("Invalid response from Entit-Sport API");
  }

  const entitySocketData = global.tblEntitySockets[0];

  const newPlayers = [];
  const entityTeamPlayers = Object.values(entitySportTeamPlayersResponse).flat();
  for (const player of entityTeamPlayers) {
    const upsertPlayer = await upsertPlayers(entitySocketData, entityTeamPlayers, player?.pid, isMen, request, fastify);
    newPlayers.push(upsertPlayer);
  }

  const uniquePlayers = [...new Map(newPlayers.map(player => [player.playerId, player])).values()];

  const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(teamId, fastify, request);
  if (uniquePlayers.length > 0) {
    for (const player of uniquePlayers) {
      if (teamId) {
        const checkPlayerExistsInTeam = teamPlayerByTeamId.find(item => item.playerId === player.playerId);
        if (!checkPlayerExistsInTeam) {
          await insertTeamPlayerQuery({
            teamId: teamId,
            refPlayerId: player?.playerId,
            tpId: player?.tpId || null,
            userId: -2,
            jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage || null,
            jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath || null,
          }, fastify, request);
          await updateTeamPlayerHomeTeamQuery({
            refPlayerId: player?.playerId,
            teamId: teamId
          }, fastify, request);
        }
      }
    }
  }

  return await getAllPlayersByTeamIdQuery(teamId, fastify, request);
}

const insertCommentaryPlayersByTeam = async (i, commentaryId, teamId, teamPlaying11Squad, players, matchTypeId, isMen, fastify, request) => {
  let commentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId && item.currentInnings === i);
  const playersInTeamsSet = new Set(commentaryPlayers.map(player => player.tpId));
  const filteredPlayerIds = [...new Set(teamPlaying11Squad?.filter(pid => !playersInTeamsSet.has(Number(pid.player_id)))?.map(item => Number(item.player_id)))];

  const entitySocketData = global.tblEntitySockets[0];
  const playersInTeams = await getAllPlayersByTeamIdQuery(
    teamId,
    fastify,
    request
  );

  const newPlayers = [];
  for (const playerId of filteredPlayerIds) {
    const teamPlayerData = playersInTeams.find(item => item.teamId === teamId && item.tpId === Number(playerId));
    if (!teamPlayerData) {
      const upsertPlayer = await upsertPlayers(entitySocketData, players, playerId, isMen, request, fastify);
      newPlayers.push(upsertPlayer);
    }
  }

  const uniquePlayers = [...new Map(newPlayers.map(player => [player.playerId, player])).values()];

  const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(teamId, fastify, request);
  if (teamId && uniquePlayers.length > 0) {
    for (const player of uniquePlayers) {
      const checkPlayerExistsInTeam = teamPlayerByTeamId.find(item => item.playerId === player.playerId);
      if (!checkPlayerExistsInTeam) {
        await insertTeamPlayerQuery({
          teamId,
          refPlayerId: player?.playerId,
          tpId: player?.tpId || null,
          userId: -2,
          jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage || null,
          jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath || null,
        }, fastify, request);
        await updateTeamPlayerHomeTeamQuery({
          refPlayerId: player?.playerId,
          teamId
        }, fastify, request);
      }
    }
  }

  const updatedPlayersInTeams = await getAllPlayersByTeamIdQuery(
    teamId,
    fastify,
    request
  );

  const isAllPlaying11 = teamPlaying11Squad?.find(item => item.playing11 === "true");
  for (const playerId of filteredPlayerIds) {
    const teamPlayerData = updatedPlayersInTeams.find(item => item.teamId === teamId && item.tpId === Number(playerId));
    if (!teamPlayerData) {
      errorLogger(
        fastify,
        `Team Id ${teamId} Player tpId ${playerId} not found in team players`,
        "ERROR --> services/commentary.js/matchImportService",
        request
      );
    } else {
      const insertCommentaryPlayerData = await insertCommentaryPlayers({
        commentaryId,
        teamId,
        playerId: teamPlayerData?.playerId,
        displayOrder: teamPlayerData?.playerOrder,
        matchTypeId,
        tpId: teamPlayerData?.tpId,
        jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage || null,
        jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath || null,
        isInPlaying11: isAllPlaying11 ? teamPlaying11Squad?.find(item => Number(item.player_id) === teamPlayerData?.tpId)?.playing11 === "true" : true
      }, i, fastify, request);
      global.tblCommentaryPlayers.push(insertCommentaryPlayerData[0]);
    }
  }

  const playerTpIds = teamPlaying11Squad?.map(item => Number(item.player_id));
  // let playersNotInTeam = commentaryPlayers.filter(player => !playerTpIds.includes(player.tpId));
  // if (playersNotInTeam && playersNotInTeam.length > 0) {
  //   playersNotInTeam = playersNotInTeam.map(item => item.playerId);
  //   await deleteCommentaryPlayersByPlayerId({
  //     commentaryId,
  //     playerIds: playersNotInTeam?.map(item => item.playerId)
  //   }, request, fastify);

  //   global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(item => !(item.commentaryId === commentaryId && playersNotInTeam.includes(item.playerId)));
  // }

  const removedCommentaryPlayers = commentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId && item.currentInnings === i && !playerTpIds.includes(item.tpId));
  for (const player of removedCommentaryPlayers) {
    const removedCommentaryPlayer = commentaryPlayers.find(item => item.tpId === player.tpId);
    if (removedCommentaryPlayer) {
      const updatedData = {
        ...removedCommentaryPlayer,
        isInPlayingEleven: false
      };
      await updateCommentaryPlayerById(updatedData, request, fastify);

      const index = global.tblCommentaryPlayers.findIndex(item => item.commentaryId === commentaryId && item.teamId === teamId && item.currentInnings === i && item.tpId === player.tpId);
      if (index !== -1) {
        global.tblCommentaryPlayers[index] = updatedData;
      }
    }
  }

  for (const pid of playerTpIds) {
    const commentaryPlayerData = global.tblCommentaryPlayers.find(item => item.commentaryId === commentaryId && item.teamId === teamId && item.currentInnings === i && item.tpId === pid);
    if (commentaryPlayerData) {
      const updatedData = {
        ...commentaryPlayerData,
        isInPlayingEleven: isAllPlaying11 ? teamPlaying11Squad?.find(item => Number(item.player_id) === pid)?.playing11 === "true" : true
      };
      await updateCommentaryPlayerById(updatedData, request, fastify);

      const index = global.tblCommentaryPlayers.findIndex(item => item.commentaryId === commentaryId && item.teamId === teamId && item.currentInnings === i && item.tpId === pid);
      if (index !== -1) {
        global.tblCommentaryPlayers[index] = updatedData;
      }
    }
  }

  return isAllPlaying11;
}

const competitionImportService = async (data, fastify, request) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{cid}", data.cid);
  const entitySportCompetition = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = {
      competition: entitySportCompetition?.data?.result
    }
  }

  let entitySportCompetitionResponse = entitySportCompetition?.data?.result;
  if (!entitySportCompetitionResponse) {
    errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/competition.js/competitionImportService - entitySportCompetitionResponse", {
      ...request,
      originalUrl: url
    }, entitySportCompetition?.data);
    return false;
  }

  if (entitySportCompetitionResponse?.status === "result") {
    return true;
  }

  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
  let matchType = global.tblMatchTypes.find(item => item.entityEnum === EntityEnums[entitySportCompetitionResponse?.game_format.toUpperCase()]);

  if (entitySportCompetitionResponse?.game_format.toUpperCase() == "MIXED") {
    matchType = null
  }
  const pythonIdData = global.tblPythonAPI.find(item => item.isDefault === true && item.isActive === true);
  if (!pythonIdData) {
    console.error("Default Python API not found");
  }

  const countryData = [], venueData = [];
  for (const venue of entitySportCompetitionResponse?.venue_list || []) {
    if (venue?.country) {
      let checkCountry = global.tblCountryCodes.find(item => item.countryName === venue?.country);
      if (!checkCountry) {
        const insertCountryData = {
          countryName: venue?.country || null,
          isActive: true,
        };
        const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
        global.tblCountryCodes.push(insertCountryCode);
        checkCountry = insertCountryCode;
      }
      countryData.push(checkCountry);

      if (venue.city && venue.name) {
        let checkVenue = global.tblVenues.find(item => item.countryId === checkCountry?.id && item.city === venue?.city && item.name === venue?.name);
        if (!checkVenue) {
          const insertVenueData = {
            countryId: checkCountry?.id,
            city: venue?.city || null,
            name: venue?.name || null,
            tpId: venue?.venue_id || null,
            isActive: true,
            capacity: venue?.capacity || null,
          };

          checkVenue = await insertVenueQuery(insertVenueData, fastify, request);
          global.tblVenues.push(checkVenue);
        } else if (checkVenue?.tpId === null || !checkVenue?.tpId) {
          const updateVenueData = {
            tpId: venue?.venue_id || null,
            venueId: checkVenue.id,
          };

          checkVenue = await updateVenueQuery(updateVenueData, fastify, request);
          const index = global.tblVenues.findIndex(item => item.id === checkVenue.id);
          global.tblVenues[index] = checkVenue;
        }
        venueData.push(checkVenue);
      }
    }
  }

  let allCompetitionMatch = [];
  const checkEntitySportAPIEndpoint2 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionMatchDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint2.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint2.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint2", request);
    return false;
  }

  let page = 1, totalPages = 1;
  while (page <= totalPages) {
    const params = new URLSearchParams();
    let url2 = checkEntitySportAPIEndpoint2.data.replace("{cid}", data.cid) + "?";
    params.append("paged", page);
    params.append("per_page", 50);
    url2 += `&${params.toString()}`;
    const entitySportCompetitionMatch = await callEntitySportAPI(url2, request, fastify);

    if (data?.autoImportId && data?.autoImportId === global.autoImportData?.id) {
      global.autoImportData.esApiResponseData = {
        ...global.autoImportData.esApiResponseData,
        match: [
          ...global.autoImportData.esApiResponseData?.match || [],
          ...(entitySportCompetitionMatch?.data?.result?.items || [])
        ]
      }
    }

    let entitySportCompetitionMatchResponse = entitySportCompetitionMatch?.data?.result;
    if (!entitySportCompetitionMatchResponse) {
      errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/competition.js/competitionImportService - entitySportCompetitionMatchResponse", {
        ...request,
        originalUrl: url2
      }, entitySportCompetitionMatch?.data);
    } else {
      if (page === 1) {
        totalPages = entitySportCompetitionMatchResponse?.total_pages || 1;
      }
      allCompetitionMatch.push(...entitySportCompetitionMatchResponse?.items)
    }
    page++;
  }

  if (allCompetitionMatch.length === 0) {
    return true;
  }

  allCompetitionMatch = allCompetitionMatch.filter(m => (m.status === matchStatusEntity.Live || m.status === matchStatusEntity.Scheduled) && nullTeamtpIds.includes(Number(m?.teama?.team_id)) === false && nullTeamtpIds.includes(Number(m?.teamb?.team_id)) === false);
  if (allCompetitionMatch.length === 0) {
    return true;
  }

  let checkCompetition = global.tblCompetitions.find(item => item.tpId === data.cid);
  if (!checkCompetition) {
    let competitionData = {
      competition: entitySportCompetitionResponse?.title,
      eventTypeId: eventType?.eventTypeId || EventType["Cricket"],
      refId: entitySportCompetitionResponse?.cid,
      isActive: true,
      isEventSnap: true,
      matchTypeId: matchType?.matchTypeId || null,
      drsCount: 2,
      isMen: entitySportCompetitionResponse?.teams?.[0]?.sex === "male",
      type: CompetitionType[entitySportCompetitionResponse?.category?.toUpperCase()],
      commStatus: compStatus[entitySportCompetitionResponse?.status],
      startDate: entitySportCompetitionResponse?.datestart,
      endDate: entitySportCompetitionResponse?.dateend,
      tpId: entitySportCompetitionResponse?.cid,
      pythonId: pythonIdData?.id || null,
      isPointTable: entitySportCompetitionResponse?.table === "1"
    };

    if (competitionData.isPointTable) {
      competitionData = {
        ...competitionData,
        winPoint: 2,
        tiePoint: 0,
        lossPoint: 0,
        cancelPoint: 1
      }
    }

    const insertCompetition = await insertCompetitionQuery({
      ...request,
      body: competitionData
    }, fastify);

    global.tblCompetitions.push(insertCompetition);
    checkCompetition = insertCompetition;
  } else {
    const esStart = entitySportCompetitionResponse?.datestart
      ? new Date(entitySportCompetitionResponse?.datestart)
      : null;

    const esEnd = entitySportCompetitionResponse?.dateend
      ? new Date(entitySportCompetitionResponse?.dateend)
      : null;

    const localStart = checkCompetition?.startDate
      ? new Date(checkCompetition.startDate)
      : null;

    const localEnd = checkCompetition?.endDate
      ? new Date(checkCompetition.endDate)
      : null;

    const isMen = checkCompetition?.isMen
      ? checkCompetition?.isMen
      : null;

    const esIsMen = entitySportCompetitionResponse?.teams?.[0]?.sex === "male";

    const isCountPointTable = checkCompetition?.isPointTable
      ? checkCompetition?.isPointTable
      : null;

    const esPointTable = entitySportCompetitionResponse?.table === "1";

    const competitionMatchType = checkCompetition?.matchTypeId
      ? checkCompetition?.matchTypeId
      : null;

    const esCompetitionMatchType = matchType?.matchTypeId;

    const competitionTitle = checkCompetition?.competition
      ? checkCompetition?.competition
      : null;

    const esCompetitionTitle = entitySportCompetitionResponse?.title;

    const competitionStatus = checkCompetition?.commStatus
      ? checkCompetition?.commStatus
      : null;

    const esCompetitionStatus = compStatus[entitySportCompetitionResponse?.status];

    const competitionType = checkCompetition?.type
      ? checkCompetition?.type
      : null;

    const esCompetitionType = CompetitionType[entitySportCompetitionResponse?.category?.toUpperCase()]

    const updateData = {};

    if (esStart && (!localStart || esStart.getTime() !== localStart.getTime())) {
      updateData.startDate = esStart;
    }

    if (esEnd && (!localEnd || esEnd.getTime() !== localEnd.getTime())) {
      updateData.endDate = esEnd;
    }

    if (esIsMen && (!isMen || esIsMen !== isMen)) {
      updateData.isMen = esIsMen;
    }

    if (esPointTable && (!isCountPointTable || esPointTable !== isCountPointTable)) {
      updateData.isPointTable = esPointTable;
    }

    if (esCompetitionMatchType && (!competitionMatchType || esCompetitionMatchType !== competitionMatchType)) {
      updateData.matchTypeId = esCompetitionMatchType;
    }

    if (esCompetitionTitle && (!competitionTitle || competitionTitle !== esCompetitionTitle)) {
      updateData.competition = esCompetitionTitle;
    }

    if (esCompetitionStatus && (!competitionStatus || esCompetitionStatus !== competitionStatus)) {
      updateData.commStatus = esCompetitionStatus;
    }

    if (esCompetitionType && (!competitionType || esCompetitionType !== competitionType)) {
      updateData.type = esCompetitionType;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.competitionId = checkCompetition.competitionId;

      const updated = await updateCompititionDateByCompetitionIdQuery(
        updateData,
        fastify,
        request
      );

      const index = global.tblCompetitions.findIndex(tc => tc.tpId === data.cid);
      if (index !== -1) {
        global.tblCompetitions[index] = {
          ...global.tblCompetitions[index],
          ...updated,
        };
        checkCompetition = global.tblCompetitions[index];
      }
    }
  }

  const entitySocketData = global.tblEntitySockets[0];
  let competitionTeamTpIds = [];
  for (const match of allCompetitionMatch) {
    const teamA = match?.teama?.team_id;
    const teamB = match?.teamb?.team_id;
    if (teamA && !competitionTeamTpIds.includes(teamA)) {
      competitionTeamTpIds.push(match?.teama.team_id);
    }
    if (teamB && !competitionTeamTpIds.includes(teamB)) {
      competitionTeamTpIds.push(match?.teamb.team_id);
    }
  }

  const checkEntitySportAPIEndpoint3 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionSquadDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint3.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint3.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint3", request);
    return false;
  }

  const url3 = checkEntitySportAPIEndpoint3.data.replace("{cid}", data.cid);
  const entitySportCompetitionSquad = await callEntitySportAPI(url3, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = {
      ...global.autoImportData.esApiResponseData,
      squad: entitySportCompetitionSquad?.data?.result?.squads
    }
  }

  let entitySportCompetitionSquadResponse = entitySportCompetitionSquad?.data?.result?.squads;

  const competitionTeams = [];
  for (const team of competitionTeamTpIds) {
    const entitySportTeamResponse = entitySportCompetitionResponse?.teams?.find(t => t.tid === team);
    if (entitySportTeamResponse) {
      let checkTeam = global.tblTeams.find(item => item.tpId === entitySportTeamResponse?.tid || item.teamName.toLowerCase() === entitySportTeamResponse.title.replace(/'/g, "''").toLowerCase());
      if (!checkTeam) {
        let imageUrl = entitySportTeamResponse?.logo_url;
        if (!imageUrl) {
          imageUrl = {
            fullPath: entitySocketData?.defaultTeamImage || null,
            imagePath: entitySocketData?.defaultTeamImagePath || null
          }
        } else {
          const getImageDataFromUrl = await getImageFromUrl({
            type: ImgModuleConfig.Teams.type,
            imageUrl
          });

          if (getImageDataFromUrl && getImageDataFromUrl.fullPath) {
            imageUrl = getImageDataFromUrl
          }
        }

        const teamData = {
          teamName: entitySportTeamResponse?.title,
          teamShortName: entitySportTeamResponse?.abbr,
          eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
          userId: -2,
          tpId: entitySportTeamResponse?.tid || null,
          image: imageUrl.fullPath,
          imagePath: imageUrl.imagePath,
          jersey: entitySocketData?.defaultJerseyImage || null,
          jerseyPath: entitySocketData?.defaultJerseyImagePath || null,
          isMen: entitySportTeamResponse?.sex === "male"
        }
        const insertTeam = await insertTeamQuery(teamData, fastify, request);
        global.tblTeams.push(insertTeam);
        checkTeam = insertTeam;
      }
      else if (checkTeam?.tpId === null || !checkTeam?.tpId) {
        const data = {
          userId: -2,
          tpId: entitySportTeamResponse?.tid || null,
          teamId: checkTeam.teamId
        }
        const updateTeam = await updateExchangeTeamQuery(data, fastify, request);
        let index = global.tblTeams.findIndex((i) => i.teamId == checkTeam.teamId)
        if (index != -1) {
          global.tblTeams[index] = updateTeam[0]
        }
        checkTeam = global.tblTeams[index];
      }

      const players = [];
      const entitySportCompetitionTeam = entitySportCompetitionSquadResponse?.filter(t => t.team_id === team);
      if (entitySportCompetitionTeam && entitySportCompetitionTeam.length > 0) {
        for (const squadPlayer of entitySportCompetitionTeam) {
          for (const player of squadPlayer.players) {
            const upsertPlayer = await upsertPlayers(entitySocketData, squadPlayer.players, player?.pid, checkCompetition.isMen, request, fastify);
            players.push(upsertPlayer);
          }
        }
      }

      const uniquePlayers = [...new Map(players.map(player => [player.playerId, player])).values()];

      const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(checkTeam.teamId, fastify, request);
      if (uniquePlayers.length > 0) {
        for (const player of uniquePlayers) {
          if (checkTeam) {
            const checkPlayerExistsInTeam = teamPlayerByTeamId.find(item => item.playerId === player.playerId);
            if (!checkPlayerExistsInTeam) {
              await insertTeamPlayerQuery({
                teamId: checkTeam.teamId,
                refPlayerId: player?.playerId,
                tpId: player?.tpId || null,
                userId: -2,
                jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage || null,
                jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath || null,
              }, fastify, request);
              await updateTeamPlayerHomeTeamQuery({
                refPlayerId: player?.playerId,
                teamId: checkTeam?.teamId
              }, fastify, request);
            }
          }
        }
      }

      competitionTeams.push(checkTeam);
    }
  }

  let commentaryTeamPlayers = [];
  for (const match of allCompetitionMatch) {
    const teamA = competitionTeams.find(t => t.tpId === match?.teama?.team_id);
    const teamB = competitionTeams.find(t => t.tpId === match?.teamb?.team_id);
    if (teamA && teamB) {
      let onfieldUmpires = null, thirdUmpire = null;
      if (match?.umpires) {
        onfieldUmpires = parseUmpires(match?.umpires).onFieldUmpires.join(', ') || null;
        thirdUmpire = parseUmpires(match?.umpires).thirdUmpire || null;
      }

      let checkCommentary = global.tblCommentaries.find(item => item.tpId === match.match_id);
      const getVenueData = venueData.find(v => v.tpId === Number(match?.venue?.venue_id));
      matchType = global.tblMatchTypes.find(item => item.entityEnum === match.format);
      let commentaryData = {
        eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
        matchTypeId: matchType?.matchTypeId,
        competitionId: checkCompetition?.competitionId,
        eventDate: match?.date_start,
        eventName: match?.title,
        team1Id: teamA?.teamId,
        team2Id: teamB?.teamId,
        location: getVenueData?.name && getVenueData?.city ? `${getVenueData.name}, ${getVenueData.city}` : null,
        displayStatus: match?.status_note,
        isClientShow: true,
        commentaryStatus: 1,
        tpId: match?.match_id,
        createdBy: -2,
        CurrentInnings: -1,
        isPlayersShow: false,
        isPredictMarket: false,
        delay: 0,
        isActive: true,
        isTeamPredictionOn: true,
        eventNo: match?.match_number,
        isVirtual: false,
        session: 1,
        pythonId: pythonIdData?.id,
        pythonURI: pythonIdData?.URI,
        isMatchDraw: false,
        isWheelShow: false,
        shotType: false,
        tossRmk: false,
        matchReferee: match?.referee,
        onfieldUmpires,
        thirdUmpire,
        isTest: match?.format_str.includes('test') ? true : false,
        isSignalROn: false,
        isEventStart: false,
        isCountInPoint: checkCompetition?.isPointTable,
        countryId: countryData.find(c => c.countryName?.toLowerCase() === match?.venue?.country?.toLowerCase())?.id || null,
        venueId: getVenueData?.id,
        scoringType: ScoringTypes.Entity
      }

      if (!checkCommentary) {
        const insertCommentary = await insertCommentaryQuery({
          ...request,
          body: commentaryData
        }, fastify);

        global.tblCommentaries.push(insertCommentary);
        checkCommentary = insertCommentary;
      }

      const esStart = match?.date_start
        ? new Date(match?.date_start)
        : null;

      const localStart = checkCommentary?.eventDate
        ? new Date(checkCommentary?.eventDate)
        : null;

      if (esStart && (!localStart || esStart.getTime() !== localStart.getTime())) {
        const updated = await updateCommentaryDateByCommentaryIdQuery({
          ...request,
          body: {
            eventDate: esStart,
            commentaryId: checkCommentary?.commentaryId
          }
        }, fastify)
        const index = global.tblCommentaries.findIndex(tc => tc.commentaryId === checkCommentary?.commentaryId);
        if (index !== -1) {
          global.tblCommentaries[index] = {
            ...global.tblCommentaries[index],
            ...updated
          };
          checkCommentary = global.tblCommentaries[index];
        }
      }

      const commentaryId = checkCommentary?.commentaryId;

      if (match?.weather && match?.weather.length > 0) {
        const checkWeather = global.tblWeather.find(item => item.commentaryId === commentaryId);
        if (checkWeather) {
          const matchWeather = match?.weather[0];
          const weatherData = {
            weatherCondition: matchWeather?.weather ?? checkWeather?.weatherCondition,
            description: matchWeather?.weather_desc ?? checkWeather?.description,
            commentaryId: commentaryId ?? checkWeather?.commentaryId,
            temp: matchWeather?.temp ?? checkWeather?.temp,
            humidity: matchWeather?.humidity ?? checkWeather?.humidity,
            visibility: matchWeather?.visibility ?? checkWeather?.visibility,
            windSpeed: matchWeather?.wind_speed ?? checkWeather?.clouds,
            clouds: matchWeather?.clouds ?? checkWeather?.clouds,
            id: checkWeather?.id
          };
          const updateWeather = await updateWeatherQuery(weatherData, fastify, request);
          const index = global.tblWeather.findIndex(item => item?.commentaryId === commentaryId);
          if (index !== -1) {
            global.tblWeather[index] = updateWeather[0]
          } else {
            global.tblWeather.push(updateWeather[0]);
          }
        } else {
          const matchWeather = match?.weather[0];
          const weatherData = {
            weatherCondition: matchWeather?.weather,
            description: matchWeather?.weather_desc,
            commentaryId: commentaryId,
            temp: matchWeather?.temp,
            humidity: matchWeather?.humidity,
            visibility: matchWeather?.visibility,
            windSpeed: matchWeather?.wind_speed,
            clouds: matchWeather?.clouds
          };
          const insertWeather = await insertWeatherQuery(weatherData, fastify, request);
          global.tblWeather.push(insertWeather);
        }
      }

      if (match?.pitch_details && (match?.pitch_details?.pitch_condition != "" || match?.pitch_details?.batting_condition != "" || match?.pitch_details?.pace_bowling_condition != "" || match?.pitch_details?.spine_bowling_condition != "")) {
        const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === commentaryId);
        if (checkPitchDetails) {
          const pitchConditionData = {
            pitchCondition: match?.pitch_details?.pitch_condition ?? checkPitchDetails?.pitchCondition,
            battingCondition: match?.pitch_details?.batting_condition ?? checkPitchDetails?.battingCondition,
            paceBowlingCondition: match?.pitch_details?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
            spineBowlingConniton: match?.pitch_details?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingConniton,
            commentaryId: commentaryId,
            id: checkPitchDetails?.id
          };
          const updatePitch = await updatePitchConditionQuery(pitchConditionData, fastify, request);
          const index = global.tblPitchConditions.findIndex(item => item?.commentaryId === request.body.commentaryId);
          if (index !== -1) {
            global.tblPitchConditions[index] = updatePitch[0]
          } else {
            global.tblPitchConditions.push(updatePitch[0]);
          }
        } else {
          const pitchConditionData = {
            pitchCondition: match?.pitch_details?.pitch_condition,
            battingCondition: match?.pitch_details?.batting_condition,
            paceBowlingCondition: match?.pitch_details?.pace_bowling_condition,
            spineBowlingConniton: match?.pitch_details?.spine_bowling_condition,
            commentaryId: commentaryId
          };

          const insertPitchDetails = await insertPitchConditionQuery(pitchConditionData, fastify, request);
          global.tblPitchConditions.push(insertPitchDetails);
        }
      }

      const noOfInning = matchType.noOfIningsPerSide;
      const maxOver = matchType.maxOversInFirstInings;

      const checkEntitySportAPIEndpoint4 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getMatchDataByIdFromEntity);
      if (!checkEntitySportAPIEndpoint4.data) {
        errorLogger(fastify, checkEntitySportAPIEndpoint4.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint4", request);
        return false;
      }

      const url4 = checkEntitySportAPIEndpoint4.data.replace("{mid}", match?.match_id);
      const entitySportMatch = await callEntitySportAPI(url4, request, fastify);

      let entitySportMatchResponse = entitySportMatch?.data?.result;
      if (!entitySportMatchResponse) {
        errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/competition.js/competitionImportService - entitySportMatchResponse", {
          ...request,
          originalUrl: url4
        }, entitySportMatch?.data);
        return false;
      }
      const getAutoUpdateCommentary = await getAllAutoUpdateCommentaryDataQuery(
        `"wrCommentaryId" = '${commentaryId}'`,
        fastify
      );
      const isExists = getAutoUpdateCommentary && getAutoUpdateCommentary.length > 0;
      const insertDataInCommentaryUpdate = {
        commentaryId,
        offsetHour: null,
        status: isExists ? autoUpdateCommentaryDataStatus.noupdate : autoUpdateCommentaryDataStatus.added,
        message: `Commentary ${isExists ? "updated" : "added"}`,
        responseData: entitySportMatch?.data?.result
      };

      await insertAutoUpdateCommentaryDataQuery(insertDataInCommentaryUpdate, fastify);

      const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
      let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
      let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

      if (teamASquad && teamASquad.length > 0) {
        commentaryTeamPlayers.push({
          commentaryId,
          teamId: teamA.teamId,
          players: teamASquad.map(item => Number(item.player_id))
        });
      }

      if (teamASquad.length === 0) {
        teamASquad = await getAllPlayersByTeamIdQuery(teamA.teamId, fastify, request);
        teamASquad = teamASquad.filter(item => item.tpId != null);
        if (teamASquad.length === 0) {
          teamASquad = await insertTeamPlayersByTeamId(teamA.teamId, teamA.tpId, checkCompetition?.isMen, request, fastify);
          teamASquad = teamASquad.filter(item => item.tpId != null);
        }
        teamASquad = teamASquad?.map(item => ({
          player_id: `${item.tpId}`,
          playing11: `${true}`
        }))
      }

      if (teamBSquad && teamBSquad.length > 0) {
        commentaryTeamPlayers.push({
          commentaryId,
          teamId: teamB.teamId,
          players: teamBSquad.map(item => Number(item.player_id))
        });
      }

      if (teamBSquad.length === 0) {
        teamBSquad = await getAllPlayersByTeamIdQuery(teamB.teamId, fastify, request);
        teamBSquad = teamBSquad.filter(item => item.tpId != null);
        if (teamBSquad.length === 0) {
          teamBSquad = await insertTeamPlayersByTeamId(teamB.teamId, teamB.tpId, checkCompetition?.isMen, request, fastify);
          teamBSquad = teamBSquad.filter(item => item.tpId != null);
        }
        teamBSquad = teamBSquad?.map(item => ({
          player_id: `${item.tpId}`,
          playing11: `${true}`
        }))
      }

      for (let i = 1; i <= noOfInning; i++) {
        let commentaryTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === commentaryId &&
            item.currentInnings === i
        );
        if (commentaryTeam === -1) {
          await insertCommentaryTeams({
            ...request,
            body: {
              commentaryId: commentaryId,
              team1Id: teamA?.teamId,
              team2Id: teamB?.teamId,
              currentInnings: i,
              teamMaxOver: maxOver,
              team1TpId: teamA?.tpId,
              team2TpId: teamB?.tpId,
              drsCount: checkCompetition?.drsCount || 2
            },
          }, fastify);
          const teamACommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: commentaryId,
            teamId: teamA?.teamId,
            currentInnings: i
          }, fastify, request);
          const teamBCommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: commentaryId,
            teamId: teamB?.teamId,
            currentInnings: i
          }, fastify, request);
          global.tblCommentaryTeams.push(teamACommentaryTeam, teamBCommentaryTeam);
        }

        await insertCommentaryPlayersByTeam(i, commentaryId, teamA.teamId, teamASquad, entitySportMatchResponse?.players, matchType?.matchTypeId, checkCompetition.isMen, fastify, request);
        await insertCommentaryPlayersByTeam(i, commentaryId, teamB.teamId, teamBSquad, entitySportMatchResponse?.players, matchType?.matchTypeId, checkCompetition.isMen, fastify, request);
      }
    }
  }

  for (const team of competitionTeamTpIds) {
    let checkTeam = global.tblTeams.find(item => item.tpId === team);
    if (checkTeam) {
      const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(checkTeam.teamId, fastify, request);
      await addDeleteTournamentTeamPlayersService({
        ...request,
        body: {
          teamPlayers: teamPlayerByTeamId,
          competitionId: checkCompetition?.competitionId,
          teamId: checkTeam.teamId
        }
      }, fastify);
    } else {
      errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/competition.js/competitionImportService - checkTeam", request, team);
    }
  }

  const { addEditTournamentTeamPointDataService } = require("./tournamentTeamPoints");
  await addEditTournamentTeamPointDataService(entitySportCompetitionResponse, checkCompetition?.competitionId, fastify, request);

  const upsertedTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => item.competitionId === checkCompetition?.competitionId);
  for (const teamPlayers of commentaryTeamPlayers) {
    const { commentaryId, teamId, players } = teamPlayers;
    const removedCommentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId && !players.includes(item.tpId));
    if (removedCommentaryPlayers && removedCommentaryPlayers.length > 0) {
      const playerIds = removedCommentaryPlayers?.map(item => item.playerId);
      await deleteCommentaryPlayersByPlayerId({
        playerIds,
        commentaryId
      }, request, fastify);
      global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(item => !(item.commentaryId === commentaryId && item.teamId === teamId && playerIds.includes(item.playerId)));
    }

    const removedTournamentTeamPlayers = upsertedTournamentTeamPlayers.filter(item => item.teamId === teamId && !players.includes(item.tpId));
    if (removedTournamentTeamPlayers && removedTournamentTeamPlayers.length > 0) {
      const playerIds = removedTournamentTeamPlayers?.map(item => item.id);
      await deleteTournamentTeamPlayersQuery(playerIds, request, fastify);
      global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => !playerIds.includes(item.id));
    }
  }

  await insertAutoImportDataService({
    ...request,
    body: {
      refId: checkCompetition?.tpId ?? data.cid,
      refType: RefType.CompetitionStatistics,
      sourceId: 3
    },
    userTokenInfo: {
      WrUserId: request?.userTokenInfo?.WrUserId ?? -2
    }
  }, fastify);

  return checkCompetition;
}

const changeIsCompetitionStatisticsCalculationStatusService = async (request, fastify) => {
  const { competitionId, isCompetitionStatisticsCalculation } = request.body;

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }

  await changeIsCompetitionStatisticsCalculationStatusQuery(
    {
      competitionId,
      isCompetitionStatisticsCalculation,
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isCompetitionStatisticsCalculation = isCompetitionStatisticsCalculation;
  }
  
  return `Competition isCompetitionStatisticsCalculation status updated successfully`;
};

module.exports = {
  allCompetitionService,
  competitionByIdService,
  saveCompetitionService,
  deleteCompetitionService,
  updateDisplayOrderService,
  competitionByeventTypeIdService,
  isTrendingChangeStatusService,
  isEventSnapService,
  isPointTableService,
  getCompletedCommentaryResultService,
  getAllTeamListService,
  getAllCompetitionListService,
  isMenChangeStatusService,
  getTemplateByCompetitionIdService,
  saveCompTemplatesService,
  isVirtualCompetitionService,
  upCompStatusService,
  getMatchTypeTemplateByCompetitionIdService,
  competitionImportService,
  insertTeamPlayersByTeamId,
  insertCommentaryPlayersByTeam,
  changeIsCompetitionStatisticsCalculationStatusService
};
