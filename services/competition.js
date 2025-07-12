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
} = require("../repository/TableCompitition");
const {storeImageOnServer, removeImageFromServer, generateImageName } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { APIEndpointModuleType, ServiceType, callClientAPI, compStatus, callCardCricket } = require("../utilities");
const { getCommentariesResultQuery, getAllCommByCompIdQuery } = require("../repository/TableCommentary")

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

  return result;
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
    tpId: request.body.tpId || validateId.tpId,
    pythonId: request.body.pythonId || validateId.pythonId,
    countryId: request.body.countryId || validateId.countryId,
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

    if (validateId?.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
    const commentaryExists = await getAllCommByCompIdQuery(id, request, fastify);
    if (commentaryExists) {
      throw new Error(`'${validateId?.competition}' competition has commentary and cannot be deleted at the moment`);
    }
  }

  await deleteCompetitionQuery(request, fastify);

  global.tblCompetitions = global.tblCompetitions.filter(
    (item) => !competitionId.includes(item.competitionId)
  );
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
  upCompStatusService
};
