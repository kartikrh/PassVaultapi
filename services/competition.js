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
} = require("../repository/TableCompitition");
const {storeImageOnServer, removeImageFromServer, generateImageName, getImageFromUrl } = require("../utilities/Images");
const { PROJECT_NAME, ENTITYDEFAULTTEAMIMG, ENTITYDEFAULTTEAMIMGPATH, ENTITYDEFAULTJERSEYIMG, ENTITYDEFAULTJERSEYIMGPATH } = require("../utilities/configConstants");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { APIEndpointModuleType, ServiceType, callClientAPI, compStatus, callCardCricket, callEntitySportAPI, EntityEnums, EventType, CompetitionType, checkEntitySportAPIEndpointIsActive, matchStatusEntity, error, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, parseUmpires, ScoringTypes } = require("../utilities");
const { getCommentariesResultQuery, getAllCommByCompIdQuery, insertCommentaryQuery, insertCommentaryTeams, getCommentaryTeamsQuery, insertCommentaryPlayers } = require("../repository/TableCommentary")
const { deleteTournamentTeamPlayersByCompIdQuery } = require("../repository/TableTournamentsTeamPlayers");
const { deleteTournamentTeamPointsByCompIdQuery } = require("../repository/TableTournmentTeamPoints");
const { addEditTournamentTeamPointDataService } = require("./tournamentTeamPoints");
const { nullTeamtpIds } = require("../utilities/entityConst");
const { insertTeamQuery, updateExchangeTeamQuery, getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { insertPlayerQuery, updateExchangePlayerQuery } = require("../repository/TablePlayer");
const { insertTeamPlayerQuery, updateTeamPlayerHomeTeamQuery } = require("../repository/TableTeamPlayer");
const { addTournamentTeamPlayersService } = require("./tournamentTeamPlayers");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { errorLogger } = require("../utilities/logger");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { insertWeatherQuery, updateWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");

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
  const { isActive, isTrending, eventTypeId, matchTypeId, isMen, type, isVirtual, pythonId, countryId } = request.body;

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

  // if (isActive === undefined || isTrending === undefined) {
  //   return global.tblCompetitions.filter((item) => item.isActive === true);
  // }

  const result = global.tblCompetitions.filter((item) => {
    return Object.entries(filterObject).every(([key, value]) => item[key] === value);
  });

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

  await isPointTableCompetitionQuery(
    {
      competitionId,
      isPointTable,
    },
    request,
    fastify
  );
  const index = global.tblCompetitions.findIndex((item) => item.competitionId == competitionId);
  if(index != -1){
    global.tblCompetitions[index].isPointTable = isPointTable;
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
  if (!checkPlayer) {
    const getPlayerFromEntity = players?.find(p => p.pid === playerTpId);
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
        isMen
      };
      const insertPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
      global.tblPlayers.push(insertPlayer);
      checkPlayer = insertPlayer;
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

  const updatedTeamPlayers = await getAllPlayersByTeamIdQuery(teamId, fastify, request);
  return updatedTeamPlayers?.map(item => item.tpId);
}

const insertCommentaryPlayersByTeam = async (i, commentaryId, teamId, teamPlaying11Squad, players, matchTypeId, isMen, fastify, request) => {
  let commentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId);
  const playersInTeamsSet = new Set(commentaryPlayers.map(player => player.tpId));
  const filteredPlayerIds = teamPlaying11Squad?.filter(pid => !playersInTeamsSet.has(pid));

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

  const updatedPlayersInTeams = await getAllPlayersByTeamIdQuery(
    teamId,
    fastify,
    request
  );

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
      }, i, fastify, request);
      global.tblCommentaryPlayers.push(insertCommentaryPlayerData[0]);
    }
  }
}

const competitionImportService = async (data, fastify, request) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{cid}", data.cid);
  const entitySportCompetition = await callEntitySportAPI(url, request, fastify);

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
          const venueData = {
            countryId: checkCountry?.id,
            city: venue?.city || null,
            name: venue?.name || null,
            tpId: venue?.venue_id || null,
            isActive: true,
            capacity: venue?.capacity || null,
          };

          checkVenue = await insertVenueQuery(venueData, fastify, request);
          global.tblVenues.push(checkVenue);
        } else if (checkVenue?.tpId === null || !checkVenue?.tpId) {
          const venueData = {
            tpId: venue?.venue_id || null,
            venueId: checkVenue.id,
          };

          checkVenue = await updateVenueQuery(venueData, fastify, request);
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
    const competitionData = {
      competition: entitySportCompetitionResponse?.title,
      eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
      refId: entitySportCompetitionResponse?.cid,
      isActive: true,
      isEventSnap: true,
      matchTypeId: matchType?.matchTypeId || null,
      drsCount: 2,
      isMen: entitySportCompetitionResponse?.teams[0]?.sex == 'male' ? true : false,
      type: CompetitionType[entitySportCompetitionResponse?.category.toUpperCase()],
      commStatus: compStatus[entitySportCompetitionResponse?.status], // 1: fixture, 2: live, 3: result
      startDate: entitySportCompetitionResponse?.datestart,
      endDate: entitySportCompetitionResponse?.dateend,
      tpId: entitySportCompetitionResponse?.cid,
      pythonId: pythonIdData?.id || null,
    }
    const insertCompetition = await insertCompetitionQuery({
      ...request,
      body: competitionData
    }, fastify);
    global.tblCompetitions.push(insertCompetition);
    checkCompetition = insertCompetition;
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
          country: entitySportTeamResponse?.country,
          eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
          userId: -2,
          tpId: entitySportTeamResponse?.tid || null,
          image: imageUrl.fullPath,
          imagePath: imageUrl.imagePath,
          jersey: entitySocketData?.defaultJerseyImage || null,
          jerseyPath: entitySocketData?.defaultJerseyImagePath || null
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
      const entitySportCompetitionTeam = entitySportCompetitionSquadResponse?.find(t => t.team_id === team);
      if (entitySportCompetitionTeam && entitySportCompetitionTeam.players && entitySportCompetitionTeam.players.length > 0) {
        for (const player of entitySportCompetitionTeam.players) {
          const upsertPlayer = await upsertPlayers(entitySocketData, entitySportCompetitionTeam.players, player?.pid, checkCompetition.isMen, request, fastify);
          players.push(upsertPlayer);
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
        location: getVenueData?.name && getVenueData?.countryName ? `${getVenueData.name}, ${getVenueData.countryName}` : null,
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

      if (match?.weather && match?.weather.length > 0) {
        const checkWeather = global.tblWeather.find(item => item.commentaryId === checkCommentary.commentaryId);
        if (checkWeather) {
          const matchWeather = match?.weather[0];
          const weatherData = {
            weatherCondition: matchWeather?.weather ?? checkWeather?.weatherCondition,
            description: matchWeather?.weather_desc ?? checkWeather?.description,
            commentaryId: checkCommentary.commentaryId ?? checkWeather?.commentaryId,
            temp: matchWeather?.temp ?? checkWeather?.temp,
            humidity: matchWeather?.humidity ?? checkWeather?.humidity,
            visibility: matchWeather?.visibility ?? checkWeather?.visibility,
            windSpeed: matchWeather?.wind_speed ?? checkWeather?.clouds,
            clouds: matchWeather?.clouds ?? checkWeather?.clouds,
            id: checkWeather?.id
          };
          const updateWeather = await updateWeatherQuery(weatherData, fastify, request);
          const index = global.tblWeather.findIndex(item => item?.commentaryId === checkCommentary.commentaryId);
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
            commentaryId: checkCommentary.commentaryId,
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
        const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === checkCommentary.commentaryId);
        if (checkPitchDetails) {
          const pitchConditionData = {
            pitchCondition: match?.pitch_details?.pitch_condition ?? checkPitchDetails?.pitchCondition,
            battingCondition: match?.pitch_details?.batting_condition ?? checkPitchDetails?.battingCondition,
            paceBowlingCondition: match?.pitch_details?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
            spineBowlingConniton: match?.pitch_details?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingConniton,
            commentaryId: checkCommentary.commentaryId,
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
            commentaryId: checkCommentary.commentaryId
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

      const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
      let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
      let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

      if (teamASquad.length > 0) {
        teamASquad = teamASquad.map(item => Number(item.player_id));
      } else {
        teamASquad = await getAllPlayersByTeamIdQuery(teamA.teamId, fastify, request);
        teamASquad = teamASquad.map(item => item.tpId);

        if (teamASquad.length === 0) {
          teamASquad = await insertTeamPlayersByTeamId(teamA.teamId, teamA.tpId, checkCompetition.isMen, request, fastify);
        }
      }

      if (teamBSquad.length > 0) {
        teamBSquad = teamBSquad.map(item => Number(item.player_id));
      } else {
        teamBSquad = await getAllPlayersByTeamIdQuery(teamB.teamId, fastify, request);
        teamBSquad = teamBSquad.map(item => item.tpId);

        if (teamBSquad.length === 0) {
          teamBSquad = await insertTeamPlayersByTeamId(teamB.teamId, teamB.tpId, checkCompetition.isMen, request, fastify);
        }
      }

      for (let i = 1; i <= noOfInning; i++) {
        let commentaryTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === checkCommentary.commentaryId &&
            item.currentInnings === i
        );
        if (commentaryTeam === -1) {
          await insertCommentaryTeams({
            ...request,
            body: {
              commentaryId: checkCommentary.commentaryId,
              team1Id: teamA?.teamId,
              team2Id: teamB?.teamId,
              currentInnings: i,
              teamMaxOver: maxOver
            },
          }, fastify);
          const teamACommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: checkCommentary.commentaryId,
            teamId: teamA?.teamId
          }, fastify, request);
          const teamBCommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: checkCommentary.commentaryId,
            teamId: teamB?.teamId
          }, fastify, request);
          global.tblCommentaryTeams.push(teamACommentaryTeam, teamBCommentaryTeam);
        }

        await insertCommentaryPlayersByTeam(i, checkCommentary.commentaryId, teamA.teamId, teamASquad, entitySportMatchResponse?.players, matchType?.matchTypeId, checkCompetition.isMen, fastify, request);
        await insertCommentaryPlayersByTeam(i, checkCommentary.commentaryId, teamB.teamId, teamBSquad, entitySportMatchResponse?.players, matchType?.matchTypeId, checkCompetition.isMen, fastify, request);
      }
    }
  }

  for (const team of competitionTeamTpIds) {
    let checkTeam = global.tblTeams.find(item => item.tpId === team);
    const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(checkTeam.teamId, fastify, request);
    await addTournamentTeamPlayersService({
      ...request,
      body: {
        teamPlayers: teamPlayerByTeamId,
        competitionId: checkCompetition?.competitionId,
        teamId: checkTeam.teamId
      }
    }, fastify);
  }

  await addEditTournamentTeamPointDataService(entitySportCompetitionResponse, checkCompetition?.competitionId, fastify, request);

  return checkCompetition;
}

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
  insertCommentaryPlayersByTeam
};
