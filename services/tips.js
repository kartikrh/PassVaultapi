const {
  allCommentaryTipsQuery,
  commentaryTipsByIdQuery,
  insertTipsQuery,
  updateTipsQuery,
  activeInactiveTipsQuery,
  deleteTipsQuery,
  getAllTipsQuery,
  getCommentaryStatusQuery,
} = require("../repository/TableTips");
const {
  callClientAPI,
  ServiceType,
  APIEndpointModuleType,
} = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const saveTipsService = async (request, fastify) => {
  let validateRefId = await allCommentaryTipsQuery(fastify, request);
  validateRefId = validateRefId.find(
    (item) => item.tipsRefId == request.body.tipsRefId
  );
  if (validateRefId) {
    throw new Error(`TipsRefId already existed`);
  }
  const saveData = await insertTipsQuery(request.body, fastify, request);
  let whereCondition = `"wrIsDelete" = FALSE`;
  if (request.body.commentaryId) {
    whereCondition += ` AND "wrCommentaryId" = ${request.body.commentaryId}`;
  }
  if (request.body.eventRefId) {
    whereCondition += ` AND "wrEventRefId" = '${request.body.eventRefId}'`;
  }
  const validateCommentaryId = await getCommentaryStatusQuery(
    whereCondition,
    fastify,
    request
  );
  if(!validateCommentaryId){
    throw new Error(`Commmentary with this Id not found`);
  }
  if (
    saveData.isActive &&
    validateCommentaryId &&
    validateCommentaryId.commentaryStatus !== 4
  ) {
    global.tblTips.push(saveData);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "tips",
          type: "add",
          data: saveData,
        },
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tips.js/saveTipsService - callClientAPI",
        request
      );
    });
  }

  return `Tips data successfully created`;
};

const editTipsService = async (request, fastify) => {
  let validateId = await commentaryTipsByIdQuery(
    request.body.id,
    fastify,
    request
  );
  if (!validateId) {
    throw new Error(`Tips with this Id not found`);
  }
  let validateRefId = await allCommentaryTipsQuery(fastify, request);
  validateRefId = validateRefId.find(
    (item) =>
      item.id !== request.body.id && item.tipsRefId == request.body.tipsRefId
  );
  if (validateRefId) {
    throw new Error(`TipsRefId already existed`);
  }

  const updateData = {
    commentaryId: request.body.commentaryId ?? validateId.commentaryId,
    eventRefId: request.body.eventRefId ?? validateId.eventRefId,
    tipsRefId: request.body.tipsRefId ?? validateId.tipsRefId,
    tips: request.body.tips ?? validateId.tips,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    startDate: request.body.startDate ?? validateId.startDate,
    endDate: request.body.endDate ?? validateId.endDate,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateTipsQuery(updateData, fastify, request);

  const index = global.tblTips.findIndex((item) => item.id === updateData.id);
  if (index !== -1) {
    global.tblTips[index] = updateData;
    if (updateData.isActive === false) {
      global.tblTips.splice(index, 1);
    }
  }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: "tips",
        type: "update",
        data: modifiedData[0],
      },
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/tips.js/editTipsService - callClientAPI",
      request
    );
  });

  return modifiedData[0];
};

const allTipsService = async (fastify, request) => {
  let result = await allCommentaryTipsQuery(fastify, request);
  
  if(request.body.isActive !== undefined){
    result = result.filter((item) => item.isActive === request.body.isActive);
  }
  return result;
};

const tipsByIdService = async (fastify, request) => {
  let result = await commentaryTipsByIdQuery(request.body.id, fastify, request);
  return result || null;
};

const createTipsService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveTipsService(request, fastify);
  } else {
    return await editTipsService(request, fastify);
  }
};

const deleteTipsService = async (fastify, request) => {
  const { id } = request.body;
  await deleteTipsQuery(id, fastify, request);

  global.tblTips = global.tblTips.filter((item) => !id.includes(item.id));

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: "tips",
        type: "delete",
        data: {
          id: id,
        },
      },
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/tips.js/deleteTipsService - callClientAPI",
      request
    );
  });

  return `Tip(s) data deleted successfully`;
};

const activeInactiveTipsService = async (request, fastify) => {
  const { id, isActive } = request.body;
  let validateId = await commentaryTipsByIdQuery(id, fastify, request);
  if (!validateId) {
    throw new Error(`Tips with this Id not found`);
  }
  const result = await activeInactiveTipsQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblTips.findIndex((item) => item.id === id);
  if (index !== -1) {
    if (isActive === false) {
      global.tblTips.splice(index, 1);
    }
  }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: "tips",
        type: isActive ? "active" : "inactive",
        data: result[0],
      },
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/tips.js/activeInactiveTipsService - callClientAPI",
      request
    );
  });

  return `Tips data updated successfully`;
};

const createTipsOnExternalService = async (request, fastify) => {
  let validateRefId = await allCommentaryTipsQuery(fastify, request);
  validateRefId = validateRefId.find(
    (item) => item.tipsRefId == request.body.tipsRefId
  );

  let whereCondition = `"wrIsDelete" = FALSE`;
  if (request.body.eventRefId) {
    whereCondition += ` AND "wrEventRefId" = '${request.body.eventRefId}'`;
  }
  const validateCommentaryId = await getCommentaryStatusQuery(
    whereCondition,
    fastify,
    request
  );
  if(!validateCommentaryId || validateRefId){    
    return `Tips data successfully created`;
  }
  request.body.commentaryId = validateCommentaryId.commentaryId || null;
  const saveData = await insertTipsQuery(request.body, fastify, request);

  if (
    saveData.isActive &&
    validateCommentaryId &&
    validateCommentaryId.commentaryStatus !== 4
  ) {
    global.tblTips.push(saveData);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "tips",
          type: "add",
          data: saveData,
        },
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/tips.js/createTipsOnExternalService - callClientAPI",
        request
      );
    });
  }
  return `Tips data successfully created`;
};

const activeInactiveTipsOnExternalService = async (request, fastify) => {
  const { id, isActive } = request.body;
  let validateId = await commentaryTipsByIdQuery(id, fastify, request);
  if (!validateId) {
    return `Tips data updated successfully`;
  }

  const result = await activeInactiveTipsQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblTips.findIndex((item) => item.id === id);
  if (index !== -1) {
    if (isActive === false) {
      global.tblTips.splice(index, 1);
    }
  }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: "tips",
        type: isActive ? "active" : "inactive",
        data: result[0],
      },
    },
    request,
    fastify
  ).catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/tips.js/activeInactiveTipsOnExternalService - callClientAPI",
      request
    );
  });

  return `Tips data updated successfully`;
};

const getAllTipsClientAPIService = async (request, fastify) => {
  const result = await getAllTipsQuery(fastify, request);
  return result;
};

module.exports = {
  allTipsService,
  tipsByIdService,
  createTipsService,
  deleteTipsService,
  activeInactiveTipsService,
  createTipsOnExternalService,
  activeInactiveTipsOnExternalService,
  getAllTipsClientAPIService,
};
