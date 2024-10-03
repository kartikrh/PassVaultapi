const {
  insertCompetitionQuery,
  deleteCompetitionQuery,
  updateCompititionQuery,
  getAllCompititionQuery,
  updateDisplayOrderQuery,
  isTrendingChangeStatusQuery,
} = require("../repository/TableCompitition");
const {storeImageOnServer, removeImageFromServer, generateImageName } = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const { APIEndpointModuleType, ServiceType, callClientAPI } = require("../utilities");

const allCompetitionService = async (request) => {
  const { isActive, isTrending, eventTypeId } = request.body;
  const result = global.tblCompetitions;
 
  if(eventTypeId) {
    result = result.filter((item) => item.eventTypeId == eventTypeId);
  }
  if(isActive !== undefined){ 
    result = result.filter((item) => item.isActive == isActive);
  }
  if(isActive == undefined){
    result = result.filter((item) => item.isActive == true);
  }
  if(isTrending !== undefined) {
    result = result.filter((item) => item.isTrending == isTrending);
  }

  return result;


  // const filterObject = {
  //   isActive: isActive,
  //   isTrending: isTrending,
  //   eventTypeId: eventTypeId === 0 ? null : eventTypeId,
  // };
  // // Additional checks for "0" and undefined
  // filterObject.eventTypeId =
  //   eventTypeId === 0 || eventTypeId === undefined
  //     ? null
  //     : filterObject.eventTypeId;

  // if (isActive === undefined || isTrending === undefined) {
  //   const result = global.tblCompetitions.filter(
  //     (item) => item.isActive === true
  //   );
  //   return result;
  // } else {
  //   const result = global.tblCompetitions.filter((item) => {
  //     return (
  //       (filterObject.isActive === null ||
  //         item.isActive === filterObject.isActive) &&
  //       (filterObject.eventTypeId === null ||
  //         item.eventTypeId === filterObject.eventTypeId) &&
  //         (filterObject.isTrending === null ||
  //           item.isTrending === filterObject.isTrending)
  //     );
  //   });
  //   return result;
  // }
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

  if (request.body.image && request.body.image.length) {
    let imgName = generateImageName({
      name: `${request.body.competition}-${validateEventTypeId.eventType}`,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase() 
    ).value;
    const path = await storeImageOnServer({
      image: request.body.image[0],
      name : imgName,
      project : projectName,
      ...ImgModuleConfig.Competitions,
    });
    request.body.image = path;
  }

  const result = await insertCompetitionQuery(request, fastify);

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
  const data = {
    competitionId: request.body.competitionId,
    competition: request.body.competition || validateId.competition,
    eventTypeId: validateId.eventTypeId,
    refId: request.body.refId || validateId.refId,
    image: validateId.image,
    isActive: validateId.isActive,
    eventType: validateId.eventType,
    displayOrder: validateId.displayOrder,
    isTrending: request.body.isTrending || validateId.isTrending,
  };

  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
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
    const path = await storeImageOnServer({
      image: request.body.image[0],
      name : imgName,
      project : projectName,
      ...ImgModuleConfig.Competitions,
    });
    
    data.image = path;
  }

  await updateCompititionQuery(data, fastify, request);

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
  }

  await deleteCompetitionQuery(request, fastify);

  global.tblCompetitions = global.tblCompetitions.filter(
    (item) => !competitionId.includes(item.competitionId)
  );

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

module.exports = {
  allCompetitionService,
  competitionByIdService,
  saveCompetitionService,
  deleteCompetitionService,
  updateDisplayOrderService,
  competitionByeventTypeIdService,
  isTrendingChangeStatusService
};
