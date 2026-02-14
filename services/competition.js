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
const { APIEndpointModuleType, ServiceType, callClientAPI, compStatus, callCardCricket, callEntitySportAPI, EntityEnums, EventType, CompetitionType, checkEntitySportAPIEndpointIsActive, matchStatusEntity, error, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, parseUmpires, ScoringTypes, RefType, lowerEntityMatchTypesEnums, EntityCommentaryStatus, getComDataByCId } = require("../utilities");
const { getCommentariesResultQuery, getAllCommByCompIdQuery, insertCommentaryQuery, insertCommentaryPlayers, updateCommentaryPlayerById, isCountInPOintCommentaryChangeQuery, updateCommentaryDateByCommentaryIdQuery, updateCommentaryQuery, insertCommentaryTeamQuery, deleteInningWiseCommentaryPlayersQuery } = require("../repository/TableCommentary")
const { deleteTournamentTeamPlayersByCompIdQuery, insertTournamentTeamPlayersQuery, deletePlayersByTeamAndPlayerIdQuery } = require("../repository/TableTournamentsTeamPlayers");
const { deleteTournamentTeamPointsByCompIdQuery } = require("../repository/TableTournmentTeamPoints");
const { nullTeamtpIds, autoUpdateCommentaryDataStatus } = require("../utilities/entityConst");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { insertPlayerQuery, updateExchangePlayerQuery } = require("../repository/TablePlayer");
const { insertTeamPlayerQuery, updateTeamPlayerHomeTeamQuery, getTeamPlayersByTeamMatchTypeIdQuery, insertTeamPlayerWithHomeTeamQuery } = require("../repository/TableTeamPlayer");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { errorLogger, commActionLogger } = require("../utilities/logger");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { insertWeatherQuery, updateWeatherQuery } = require("../repository/TableWeather");
const { updatePitchConditionQuery, insertPitchConditionQuery } = require("../repository/TablePitchCondition");
const { insertAutoImportDataService } = require("./autoImportData");
const { insertAutoUpdateCommentaryDataQuery, getAllAutoUpdateCommentaryDataQuery } = require("../repository/TableAutoUpdateCommentaryData");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { playerImageChangeOnClientAPIService, upsertPlayerOnImportService } = require("./player");
const { upsertTeamOnImportService, insertTeamAndPlayers } = require("./teams");
const { saveTeamMatchTypeByTeamService } = require("./teamMatchType");
const { getTeamMatchTypeByTeamQuery } = require("../repository/TableTeamMatchType");

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
    winPoint: request.body.winPoint ?? validateId.winPoint,
    tiePoint: request.body.tiePoint ?? validateId.tiePoint,
    cancelPoint: request.body.cancelPoint ?? validateId.cancelPoint,
    lossPoint: request.body.lossPoint ?? validateId.lossPoint,
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
    const compData = global.tblCompetitions.find(elem => elem.competitionId == item.competitionId);
    if (compData.isActive && compData.isTrending) {
      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateSeoModule,
          data: {
            module: "competition",
            type: "displayOrder",
            data: dispalyOrderData
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
  const compData = global.tblCompetitions[index]
  if (compData.isActive && compData.isTrending) {
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "competition",
          type: "update",
          data: compData
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
  }
  
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

  const compData = global.tblCompetitions[index];
  if (compData.isActive && compData.isTrending) {
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "competition",
          type: "update",
          data: compData
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
  }

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
        birthDate: getPlayerFromEntity?.birthdate || null,
        birthPlace: getPlayerFromEntity?.birthplace ?? null
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
    else if (checkPlayer?.tpId === null || !checkPlayer?.tpId || checkPlayer?.tpId !== getPlayerFromEntity?.pid) {
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
    throw new Error(`Invalid response from Entit-Sport API for url ${url}`);
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
    let checkTeam = null;
    if (teamId) {
      checkTeam = global.tblTeams.find(tt => tt.teamId === teamId);
    }
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
          const homeTeam = await updateTeamPlayerHomeTeamQuery({
            refPlayerId: player?.playerId,
            teamId: checkTeam?.teamId
          }, fastify, request);

          if (player?.image && checkTeam?.jersey && homeTeam?.[0]?.teamPlayerId) {
            try {
              await mergeAndSaveImage({
                playerImage: player.image,
                jersey: checkTeam.jersey,
                playerName: player.playerName,
                teamName: checkTeam.teamName,
                teamPlayerId: homeTeam?.[0]?.teamPlayerId,
                commentaryPlayerId: null,
                commentaryId: null,
              }, fastify);
              if (homeTeam?.[0]?.homeTeam == true) {
                await playerImageChangeOnClientAPIService(player, fastify);
              }
            } catch (error) {

            }
          }
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

  const addCommPlayer = []
  const updateCommPlayer = []
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
    let checkTeam = global.tblTeams.find(tt => tt.teamId === teamId);
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
        const homeTeam = await updateTeamPlayerHomeTeamQuery({
          refPlayerId: player?.playerId,
          teamId: checkTeam?.teamId
        }, fastify, request);

        if (player?.image && checkTeam?.jersey && homeTeam?.[0]?.teamPlayerId) {
          try {
            await mergeAndSaveImage({
              playerImage: player.image,
              jersey: checkTeam.jersey,
              playerName: player.playerName,
              teamName: checkTeam.teamName,
              teamPlayerId: homeTeam?.[0]?.teamPlayerId,
              commentaryPlayerId: null,
              commentaryId: null,
            }, fastify);
            if (homeTeam?.[0]?.homeTeam == true) {
              await playerImageChangeOnClientAPIService(player, fastify);
            }
          } catch (error) {

          }
        }
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
      addCommPlayer.push(insertCommentaryPlayerData[0])
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
        updateCommPlayer.push(global.tblCommentaryPlayers[index]);
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
        updateCommPlayer.push(global.tblCommentaryPlayers[index]);
      }
    }
  }
  const comm = global.tblCommentaries.find(item => item.commentaryId == commentaryId)

  const emitSocketUpdate = (type, data) => {
    const sendDataForSocketUpdate = {
      commentaryId: commentaryId,
      eventRefId: comm?.eventRefId,
      dataToUpdate: [{ module: "commentaryPlayers", type, data }],
    };
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
  };

  if (addCommPlayer.length > 0) emitSocketUpdate("create", addCommPlayer);
  if (updateCommPlayer.length > 0) emitSocketUpdate("update", updateCommPlayer);

  return isAllPlaying11;
}

const esGetMatchNumberFromCompetitionMatchAPI = async (competitionTpId, request, fastify) => {
  let allCompetitionMatch = [], page = 1, totalPages = 1, matchNumber = 1, lastESMatchType = null;
  while (page <= totalPages) {
    const params = new URLSearchParams();
    let url = `/competition/${competitionTpId}/matches` + "?";
    params.append("paged", page);
    params.append("per_page", 50);
    url += `&${params.toString()}`;
    const entitySportCompetitionMatch = await callEntitySportAPI(url, request, fastify);

    let entitySportCompetitionMatchResponse = entitySportCompetitionMatch?.data?.result;
    if (!entitySportCompetitionMatchResponse) {
      errorLogger(
        fastify,
        `Invalid response from Entit-Sport API for url ${url}`,
        "/services/commentary.js/esGetMatchNumberFromCompetitionMatchAPI - entitySportCompetitionMatchResponse", {
        ...request,
        originalUrl: url
      }, entitySportCompetitionMatch?.data);
    } else {
      if (page === 1) {
        totalPages = entitySportCompetitionMatchResponse?.total_pages || 1;
      }
      allCompetitionMatch.push(...entitySportCompetitionMatchResponse?.items?.map(item => {
        if (lastESMatchType !== item?.format) {
          lastESMatchType = item?.format;
          matchNumber = 1;
        } else {
          matchNumber++;
        }
        return {
          match_id: item.match_id,
          match_number: matchNumber,
          format: item.format
        }
      }));
    }
    page++;
  }
  return allCompetitionMatch;
}

const upsertCommentaryTeamsAndPlayersService = async (checkCompetition, tournamentTeamsPlayers, checkCommentary, maxOver, commentaryTeams, team, i, commentaryPlayers, teamSquad, entitySportMatchResponsePlayers, entitySocketData, request, fastify) => {
  const teamSquadHasPlaying11 = teamSquad.find(t => t.playing11 === "true");
  let commentaryTeam = commentaryTeams.find(ct => ct.teamId === team.teamId && ct.currentInnings === i);
  if (!commentaryTeam) {
    commentaryTeam = await insertCommentaryTeamQuery({
      ...request,
      body: {
        commentaryId: checkCommentary.commentaryId,
        teamId: team.teamId,
        teamShortName: team.teamShortName,
        teamName: team.teamName,
        currentInnings: i,
        teamColor: team.teamColor,
        backgroundColor: team.backgroundColor,
        teamTpId: team.tpId,
        teamMaxOver: maxOver,
        drsCount: checkCompetition?.drsCount || 2
      }
    }, fastify);
    global.tblCommentaryTeams.push(commentaryTeam);
  }
  if (teamSquad.length > 0) {
    const commentaryTeamPlayers = commentaryPlayers.filter(cp => cp.teamId === team.teamId && cp.currentInnings === i);
    const newTeamSquadTpIds = teamSquad.map(tas => Number(tas.player_id));
    const teamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
      ...request,
      body: {
        teamId: team.teamId,
        matchTypeId: -1
      }
    }, fastify);

    for (const pId of newTeamSquadTpIds) {
      const exists = commentaryTeamPlayers.find(ctp => ctp.tpId === pId);
      if (!exists) {
        let player = global.tblPlayers.find(tp => tp.tpId === pId);
        if (!player) {
          const esPlayer = entitySportMatchResponsePlayers?.find(p => p.pid === pId);
          if (esPlayer) {
            player = await upsertPlayerOnImportService(esPlayer, entitySocketData, checkCompetition.isMen, fastify, request);
          }
        }
        let teamPlayer = teamPlayers.find(tp => tp.refPlayerId === player.playerId || tp.tpId === player.tpId);
        if (!teamPlayer) {
          teamPlayer = await insertTeamPlayerWithHomeTeamQuery({
            teamId: team.teamId,
            refPlayerId: player.playerId,
            tpId: player?.tpId ?? null,
            jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage ?? null,
            jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath ?? null,
            matchTypeId: -1
          }, fastify, request);

          if (player?.image && team?.jersey && teamPlayer?.teamPlayerId) {
            try {
              await mergeAndSaveImage({
                playerImage: player.image,
                jersey: team.jersey,
                playerName: player.playerName,
                teamName: team.teamName,
                teamPlayerId: teamPlayer?.teamPlayerId,
                commentaryPlayerId: null,
                commentaryId: null,
              }, fastify);
              if (teamPlayer?.homeTeam == true) {
                await playerImageChangeOnClientAPIService(player, fastify);
              }
            } catch (error) {

            }
          }
        }

        let tournamentTeamPlayer = tournamentTeamsPlayers.find(ttp => ttp.teamId === team.teamId && (ttp.playerId === player.playerId || ttp.tpId === player?.tpId));
        if (!tournamentTeamPlayer) {
          tournamentTeamPlayer = await insertTournamentTeamPlayersQuery({
            competitionId: checkCompetition.competitionId,
            teamId: team.teamId,
            playerId: player.playerId,
            playerName: player.playerName,
            userId: request?.userTokenInfo?.WrUserId ?? -2,
            tpId: player?.tpId ?? null
          },
            request,
            fastify
          );
          global.tblTournamentTeamPlayers.push(tournamentTeamPlayer[0]);
          tournamentTeamsPlayers.push(tournamentTeamPlayer[0]);
        }
        if (player) {
          const newCommentaryPlayer = await insertCommentaryPlayers({
            commentaryId: checkCommentary.commentaryId,
            teamId: team.teamId,
            playerId: player.playerId,
            displayOrder: teamPlayer.playerOrder,
            matchTypeId: checkCommentary?.matchTypeId,
            tpId: player?.tpId ?? null,
            jerseyPlayerImage: teamPlayer?.jerseyPlayerImage ?? null,
            jerseyPlayerImagePath: teamPlayer?.jerseyPlayerImagePath ?? null,
            isInPlayingEleven: teamSquadHasPlaying11 ? teamSquad.find(ts => Number(ts.player_id) === player.tpId)?.playing11 === "true" : true
          }, i, fastify, request);
          global.tblCommentaryPlayers.push(newCommentaryPlayer[0]);
          commentaryTeamPlayers.push(newCommentaryPlayer[0]);
        }
      } else {
        const updatedData = {
          ...exists,
          isInPlayingEleven: teamSquadHasPlaying11 ? teamSquad?.find(item => Number(item.player_id) === pId)?.playing11 === "true" : true
        };
        await updateCommentaryPlayerById(updatedData, request, fastify);

        const index = global.tblCommentaryPlayers.findIndex(item => item.commentaryId === checkCommentary.commentaryId && item.teamId === team.teamId && item.currentInnings === i && item.tpId === pId);
        if (index !== -1) {
          global.tblCommentaryPlayers[index] = updatedData;
        }
      }
    }

    const removeCommentaryPlayerIds = [];
    for (const cp of commentaryTeamPlayers) {
      if (!newTeamSquadTpIds.includes(cp.tpId)) {
        removeCommentaryPlayerIds.push(cp.playerId);
      }
    }

    if (removeCommentaryPlayerIds.length > 0) {
      await deleteInningWiseCommentaryPlayersQuery({
        commentaryId: checkCommentary.commentaryId,
        teamId: team.teamId,
        playerIds: removeCommentaryPlayerIds,
        currentInnings: i
      }, request, fastify);
      global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(tcp => !(tcp.commentaryId === checkCommentary?.commentaryId && tcp.teamId === team.teamId && tcp.currentInnings === i && removeCommentaryPlayerIds.includes(tcp.playerId)));

      await deletePlayersByTeamAndPlayerIdQuery({
        competitionId: checkCompetition.competitionId,
        teamId: team.teamId,
        playerIds: removeCommentaryPlayerIds
      }, request, fastify);
      global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(ttp => !(ttp.competitionId === checkCompetition.competitionId && ttp.teamId === team.teamId && removeCommentaryPlayerIds.includes(ttp.playerId)));
    }
  } else {
    const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
    await insertTeamAndPlayers({
      tid: team.tpId,
    }, eventType, request, fastify);

    const teamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
      ...request,
      body: {
        teamId: team.teamId,
        matchTypeId: -1
      }
    }, fastify);

    for (const player of teamPlayers.filter(tp => tp.tpId)) {
      let tournamentTeamPlayer = tournamentTeamsPlayers.find(ttp => ttp.teamId === team.teamId && (ttp.playerId === player.refPlayerId || ttp.tpId === player?.tpId));
      if (!tournamentTeamPlayer) {
        tournamentTeamPlayer = await insertTournamentTeamPlayersQuery({
          competitionId: checkCompetition.competitionId,
          teamId: team.teamId,
          playerId: player.refPlayerId,
          playerName: player.playerName,
          userId: request?.userTokenInfo?.WrUserId ?? -2,
          tpId: player?.tpId ?? null
        },
          request,
          fastify
        );
        global.tblTournamentTeamPlayers.push(tournamentTeamPlayer[0]);
        tournamentTeamsPlayers.push(tournamentTeamPlayer[0]);
      }

      let commentaryTeamPlayer = commentaryPlayers.find(ctp => ctp.tpId === player.tpId);
      if (!commentaryTeamPlayer) {
        const newCommentaryPlayer = await insertCommentaryPlayers({
          commentaryId: checkCommentary.commentaryId,
          teamId: team.teamId,
          playerId: player.refPlayerId,
          displayOrder: player.playerOrder,
          matchTypeId: checkCommentary?.matchTypeId,
          tpId: player?.tpId ?? null,
          jerseyPlayerImage: player?.jerseyPlayerImage ?? null,
          jerseyPlayerImagePath: player?.jerseyPlayerImagePath ?? null,
          isInPlayingEleven: true
        }, i, fastify, request);
        global.tblCommentaryPlayers.push(newCommentaryPlayer[0]);
        commentaryPlayers.push(newCommentaryPlayer[0]);
      }
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

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = {
      competition: entitySportCompetition?.data?.result
    }
  }

  let entitySportCompetitionResponse = entitySportCompetition?.data?.result;
  if (!entitySportCompetitionResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/competition.js/competitionImportService - entitySportCompetitionResponse", {
      ...request,
      originalUrl: url
    }, entitySportCompetition?.data);
    return false;
  }

  if (entitySportCompetitionResponse?.status === "result") {
    const checkCompetitionResult = global.tblCompetitions.find(item => item.tpId === data.cid);
    if (checkCompetitionResult) {
      const competitionStatus = checkCompetitionResult?.commStatus
        ? checkCompetitionResult?.commStatus
        : null;

      const esCompetitionStatus = compStatus[entitySportCompetitionResponse?.status];
      if (esCompetitionStatus && (!competitionStatus || esCompetitionStatus !== competitionStatus)) {
        await insertAutoImportDataService({
          ...request,
          body: {
            refId: checkCompetitionResult?.tpId || data.cid,
            refType: RefType.tournamentTeamPointUpdate,
            sourceId: 3
          }
        }, fastify);
      }
    }
    return true;
  }

  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
  const entityMatchTypeEnums = lowerEntityMatchTypesEnums();
  let matchType = global.tblMatchTypes.find(item => item.entityEnum === entityMatchTypeEnums[entitySportCompetitionResponse?.game_format.toLowerCase()]);

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

  const entitySocketData = global.tblEntitySockets[0];

  const esCompetitionTeams = [
    ...new Map((entitySportCompetitionResponse?.teams || []).map(item => [item.tid, item])).values()
  ];
  for (const esTeam of esCompetitionTeams) {
    await upsertTeamOnImportService(esTeam, entitySocketData, eventType, fastify, request);
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
      errorLogger(
        fastify,
        `Invalid response from Entit-Sport API for url ${url2}`,
        "/services/competition.js/competitionImportService - entitySportCompetitionMatchResponse", {
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

  let entitySportCompetitionSquadResponse = entitySportCompetitionSquad?.data?.result?.squads?.filter(t => !nullTeamtpIds.includes(Number(t.team_id)));
  const tournamentTeamsPlayers = global.tblTournamentTeamPlayers.filter(tttp => tttp.competitionId === checkCompetition.competitionId);
  for (const squad of entitySportCompetitionSquadResponse) {
    const team = await upsertTeamOnImportService(squad.team, entitySocketData, eventType, fastify, request);
    const teamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
      ...request,
      body: {
        teamId: team.teamId,
        matchTypeId: -1
      }
    }, fastify);
    const tournamentTeamPlayers = tournamentTeamsPlayers.filter(ttp => ttp.teamId === team.teamId);

    for (const player of squad.players) {
      const upsertedPlayer = await upsertPlayerOnImportService(player, entitySocketData, checkCompetition?.isMen, fastify, request);
      const teamPlayer = teamPlayers.find(tp => tp.refPlayerId === upsertedPlayer.playerId || tp.tpId === upsertedPlayer.tpId);
      if (!teamPlayer) {
        const upsertedTeamPlayer = await insertTeamPlayerWithHomeTeamQuery(
          {
            teamId: team.teamId,
            refPlayerId: upsertedPlayer.playerId,
            tpId: upsertedPlayer?.tpId ?? null,
            jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage ?? null,
            jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath ?? null,
            matchTypeId: -1
          },
          fastify,
          request
        );

        if (upsertedPlayer?.image && team?.jersey && upsertedTeamPlayer?.teamPlayerId) {
          try {
            await mergeAndSaveImage({
              playerImage: upsertedPlayer.image,
              jersey: team.jersey,
              playerName: upsertedPlayer.playerName,
              teamName: team.teamName,
              teamPlayerId: upsertedTeamPlayer?.teamPlayerId,
              commentaryPlayerId: null,
              commentaryId: null,
            }, fastify);
            if (upsertedTeamPlayer?.homeTeam == true) {
              await playerImageChangeOnClientAPIService(upsertedPlayer, fastify);
            }
          } catch (error) {

          }
        }
      }

      let tournamentTeamPlayer = tournamentTeamPlayers.find(ttp => ttp.playerId === upsertedPlayer.playerId || ttp.tpId === upsertedPlayer.tpId);
      if (!tournamentTeamPlayer) {
        tournamentTeamPlayer = await insertTournamentTeamPlayersQuery({
          competitionId: checkCompetition.competitionId,
          teamId: team.teamId,
          playerId: upsertedPlayer.playerId,
          playerName: upsertedPlayer.playerName,
          userId: request?.userTokenInfo?.WrUserId ?? -2,
          tpId: upsertedPlayer?.tpId ?? null
        }, request, fastify);
        global.tblTournamentTeamPlayers.push(tournamentTeamPlayer[0]);
        tournamentTeamsPlayers.push(tournamentTeamPlayer[0]);
      }
    }
  }

  let newCommentaryImport = false;
  for (const match of allCompetitionMatch) {
    const teamA = global.tblTeams.find(t => t.tpId === match?.teama?.team_id);
    const teamB = global.tblTeams.find(t => t.tpId === match?.teamb?.team_id);
    if (teamA && teamB) {
      let onfieldUmpires = null, thirdUmpire = null;
      if (match?.umpires) {
        onfieldUmpires = parseUmpires(match?.umpires).onFieldUmpires.join(', ') || null;
        thirdUmpire = parseUmpires(match?.umpires).thirdUmpire || null;
      }

      let checkCommentary = global.tblCommentaries.find(item => item.tpId === match.match_id);

      const commentaryMatchType = global.tblMatchTypes.find(item => item.entityEnum === match.format);
      if (!checkCommentary) {
        const getVenueData = venueData.find(v => v.tpId === Number(match?.venue?.venue_id));
        let commentaryData = {
          eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
          matchTypeId: commentaryMatchType?.matchTypeId,
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
          scoringType: match?.game_state == EntityCommentaryStatus.INPROGRESS ? ScoringTypes.Panel : ScoringTypes.Entity,
        }

        if (!checkCompetition?.matchTypeId) {
          const esAllCompetitionMatches = await esGetMatchNumberFromCompetitionMatchAPI(checkCompetition.tpId);
          const getMatchNumber = esAllCompetitionMatches.find(m => m.match_id === match?.match_id);
          commentaryData.eventNo = getMatchNumber.match_number ?? match?.match_number;
        }

        const insertCommentary = await insertCommentaryQuery({
          ...request,
          body: commentaryData
        }, fastify);

        global.tblCommentaries.push(insertCommentary);
        checkCommentary = insertCommentary;
        newCommentaryImport = true;
      }

      const commentaryId = checkCommentary?.commentaryId;

      if (!checkCompetition?.matchTypeId) {
        const esAllCompetitionMatches = await esGetMatchNumberFromCompetitionMatchAPI(checkCompetition.tpId);
        const getMatchNumber = esAllCompetitionMatches.find(m => m.match_id === match?.match_id);
        if (checkCommentary?.eventNo !== getMatchNumber.match_number) {
          const updateCommentaryData = await updateCommentaryQuery({
            body: {
              ...checkCommentary,
              eventNo: getMatchNumber.match_number ?? match?.match_number
            }
          }, fastify);

          let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentaryId);
          if (index !== -1) {
            global.tblCommentaries[index] = updateCommentaryData[0][0];
            checkCommentary = global.tblCommentaries[index];
          }
        }
      }

      if (checkCommentary.team1Id !== teamA?.teamId) {
        const updateCommentaryData = await updateCommentaryQuery({
          body: {
            ...checkCommentary,
            team1Id: teamA?.teamId
          }
        }, fastify);

        let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentaryId);
        if (index !== -1) {
          global.tblCommentaries[index] = updateCommentaryData[0][0];
          checkCommentary = global.tblCommentaries[index];
        }
      }

      if (checkCommentary.team2Id !== teamB?.teamId) {
        const updateCommentaryData = await updateCommentaryQuery({
          body: {
            ...checkCommentary,
            team2Id: teamB?.teamId
          }
        }, fastify);

        let index = global.tblCommentaries.findIndex((i) => i.commentaryId == commentaryId);
        if (index !== -1) {
          global.tblCommentaries[index] = updateCommentaryData[0][0];
          checkCommentary = global.tblCommentaries[index];
        }
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
            commentaryId: commentaryId
          }
        }, fastify)
        const index = global.tblCommentaries.findIndex(tc => tc.commentaryId === commentaryId);
        if (index !== -1) {
          global.tblCommentaries[index] = {
            ...global.tblCommentaries[index],
            ...updated
          };
          checkCommentary = global.tblCommentaries[index];
        }
      }

      const matchWeather = match?.weather;
      if (matchWeather && typeof matchWeather === "object") {
        const checkWeather = global.tblWeather.find(item => item.commentaryId === commentaryId);
        if (checkWeather) {
          const weatherData = {
            weatherCondition: matchWeather?.weather || checkWeather?.weatherCondition,
            description: matchWeather?.weather_desc || checkWeather?.description,
            commentaryId: commentaryId || checkWeather?.commentaryId,
            temp: matchWeather?.temp || checkWeather?.temp,
            humidity: matchWeather?.humidity || checkWeather?.humidity,
            visibility: matchWeather?.visibility || checkWeather?.visibility,
            windSpeed: matchWeather?.wind_speed || checkWeather?.windSpeed,
            clouds: matchWeather?.clouds || checkWeather?.clouds,
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
          const weatherData = {
            weatherCondition: matchWeather?.weather || null,
            description: matchWeather?.weather_desc || null,
            commentaryId: commentaryId,
            temp: matchWeather?.temp || null,
            humidity: matchWeather?.humidity || null,
            visibility: matchWeather?.visibility || null,
            windSpeed: matchWeather?.wind_speed || null,
            clouds: matchWeather?.clouds || null
          };
          const insertWeather = await insertWeatherQuery(weatherData, fastify, request);
          global.tblWeather.push(insertWeather);
        }
      }

      const matchPitch = match?.pitch;
      if (matchPitch && (matchPitch?.pitch_condition != "" || matchPitch?.batting_condition != "" || matchPitch?.pace_bowling_condition != "" || matchPitch?.spine_bowling_condition != "")) {
        const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === commentaryId);
        if (checkPitchDetails) {
          const pitchConditionData = {
            pitchCondition: matchPitch?.pitch_condition ?? checkPitchDetails?.pitchCondition,
            battingCondition: matchPitch?.batting_condition ?? checkPitchDetails?.battingCondition,
            paceBowlingCondition: matchPitch?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
            spineBowlingConniton: matchPitch?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingConniton,
            commentaryId: commentaryId,
            id: checkPitchDetails?.id
          };
          const updatePitch = await updatePitchConditionQuery(pitchConditionData, fastify, request);
          const index = global.tblPitchConditions.findIndex(item => item?.commentaryId === commentaryId);
          if (index !== -1) {
            global.tblPitchConditions[index] = updatePitch[0]
          } else {
            global.tblPitchConditions.push(updatePitch[0]);
          }
        } else {
          const pitchConditionData = {
            pitchCondition: matchPitch?.pitch_condition,
            battingCondition: matchPitch?.batting_condition,
            paceBowlingCondition: matchPitch?.pace_bowling_condition,
            spineBowlingConniton: matchPitch?.spine_bowling_condition,
            commentaryId: commentaryId
          };

          const insertPitchDetails = await insertPitchConditionQuery(pitchConditionData, fastify, request);
          global.tblPitchConditions.push(insertPitchDetails);
        }
      }

      const noOfInning = commentaryMatchType.noOfIningsPerSide;
      const maxOver = commentaryMatchType.maxOversInFirstInings;

      const checkEntitySportAPIEndpoint4 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getMatchDataByIdFromEntity);
      if (!checkEntitySportAPIEndpoint4.data) {
        errorLogger(fastify, checkEntitySportAPIEndpoint4.message, "/services/competition.js/competitionImportService - checkEntitySportAPIEndpoint4", request);
        return false;
      }

      const url4 = checkEntitySportAPIEndpoint4.data.replace("{mid}", match?.match_id);
      const entitySportMatch = await callEntitySportAPI(url4, request, fastify);

      let entitySportMatchResponse = entitySportMatch?.data?.result;
      if (!entitySportMatchResponse) {
        errorLogger(
          fastify,
          `Invalid response from Entit-Sport API for url ${url4}`,
          "/services/competition.js/competitionImportService - entitySportMatchResponse", {
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

      const commentaryTeams = global.tblCommentaryTeams.filter(tct => tct.commentaryId === commentaryId && [teamA.teamId, teamB.teamId].includes(tct.teamId));
      const commentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && [teamA.teamId, teamB.teamId].includes(item.teamId));
      for (let i = 1; i <= noOfInning; i++) {
        // TeamA
        await upsertCommentaryTeamsAndPlayersService(checkCompetition, tournamentTeamsPlayers, checkCommentary, maxOver, commentaryTeams, teamA, i, commentaryPlayers, teamASquad, entitySportMatchResponse?.players, entitySocketData, request, fastify);

        // TeamB
        await upsertCommentaryTeamsAndPlayersService(checkCompetition, tournamentTeamsPlayers, checkCommentary, maxOver, commentaryTeams, teamB, i, commentaryPlayers, teamBSquad, entitySportMatchResponse?.players, entitySocketData, request, fastify);
      }
      await getComDataByCId({ commentaryId: commentaryId }, request, fastify)

      if (newCommentaryImport && match?.game_state == EntityCommentaryStatus.INPROGRESS) {
        const { storeInningWiseEntityDataService } = require("./entitySport")
        request.body = {
          matchId: match?.match_id,
        };
        await storeInningWiseEntityDataService(request, fastify);
      }
    }
  }

  const { addEditTournamentTeamPointDataService } = require("./tournamentTeamPoints");
  await addEditTournamentTeamPointDataService(entitySportCompetitionResponse, checkCompetition?.competitionId, fastify, request);

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

const getAllCompetitionsService = async (request) => {
  const { isActive, isTrending } = request.body;

  const filterObject = {
    isActive: isActive !== undefined ? isActive : true,
  };

  if (isTrending !== undefined) {
    filterObject.isTrending = isTrending;
  }

  let result = global.tblCompetitions.filter((item) => {
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

const insertCompletedCompetitionsInAutoImportService = async (fastify) => {
  try {
    const now = Date.now();
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    const completedCompetitions = global.tblCompetitions.filter((comp) => {
      if (comp.commStatus !== compStatus.completed || !comp.endDate) return false;

      const endDate = new Date(comp.endDate).getTime();
      return endDate <= now && endDate > twoDaysAgo;
    });

    await Promise.all(
      completedCompetitions.map((competition) =>
        insertAutoImportDataService(
          {
            body: {
              refId: competition.tpId,
              refType: RefType.CompetitionUpdate,
              sourceId: 3,
            },
            userTokenInfo: { WrUserId: -2 },
          },
          fastify
        )
      )
    );
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/competition.js/insertCompletedCompetitionsInAutoImportService",
      null
    );
  }
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
  changeIsCompetitionStatisticsCalculationStatusService,
  getAllCompetitionsService,
  esGetMatchNumberFromCompetitionMatchAPI,
  upsertCommentaryTeamsAndPlayersService,
  insertCompletedCompetitionsInAutoImportService
};
