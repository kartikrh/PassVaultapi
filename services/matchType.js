const {
  insertMatchTypeQuery,
  deleteMatchTypeQuery,
  updateMatchTypeQuery,
  deleteMatchTypePredictorQuery,
  updateSumOfRunPerBallQuery,
  isHistoryChangeInMatchTypeQuery,
} = require("../repository/TableMatchType");
const { createMatchTypePredictorQuery } = require("../repository/TableMatchTypePredictor");
const { MarketTypeId } = require("../utilities");

const allMatchTypesService = async (request) => {
  if(request?.body?.entityEnum) {
    const result = global.tblMatchTypes.filter(item => item.entityEnum === request?.body?.entityEnum);
    return result || []
  } else {
    return global.tblMatchTypes;
  }
  // return global.tblMatchTypes;
};

const matchTypeByIdService = async (request) => {
  const { matchTypeId } = request.body;
  const result = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeId
  );
  return result || null;
};

const createMatchTypeService = async (request, fastify) => {
  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }
  if (request.body?.entityEnum) {
    const validate = global.tblMatchTypes.find(item => 
      item.entityEnum === request.body.entityEnum
    );
    if(validate) {
      throw new Error("This entity enum already exist");
    }
  }
  const data = await insertMatchTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblMatchTypes.push(data);
  return data;
};

const cloneMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }

  if (request.body?.entityEnum) {
    const validateTpId = global.tblMatchTypes.find(item =>
      item.entityEnum === request.body?.entityEnum
    );
    if (validateTpId) {
      throw new Error("Entity enum already existed");
    }
  }

  const data = await insertMatchTypeQuery(
    {
      ...checkId,
      entityEnum: request.body?.entityEnum ?? null,
      matchType: request.body.matchType,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );
  
  // clone the matchType predictor 
  const predictorData = global.tblMatchTypePredictor.filter(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if(!predictorData.length) return data;


  const predictorDataClone = predictorData.map((item) => ({
    ...item,
    matchTypeId: data.matchTypeId,
  }));

  const predictor = await createMatchTypePredictorQuery(
    {
      matchTypeId: data.matchTypeId,
      predictorData: predictorDataClone,
    },
    request,
    fastify
  )

  const validate = global.tblMatchTypePredictor.filter((item) => item.matchTypeId === request.body.matchTypeId);
  if(validate.length > 0 ){
     const sumOfRPB = await updateSumOfRunPerBallQuery(data.matchTypeId, fastify, request);
     data.sumOfRunPerBall = sumOfRPB
  }
  global.tblMatchTypes.push(data);

  global.tblMatchTypePredictor.push(...predictor);

  return data;
};

const updateMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  if (request.body.matchTypeName) {
    const validateMatchType = global.tblMatchTypes.find(
      (item) =>
        item.matchType.toLowerCase() === request.body.matchType.toLowerCase() &&
        item.matchTypeId !== request.body.matchTypeId
    );

    if (validateMatchType) {
      throw new Error("MatchType already exist");
    }
  }
  if (request.body?.entityEnum) {
    const validate = global.tblMatchTypes.find(item => 
      item.entityEnum === request.body.entityEnum && 
      item.matchTypeId !== request.body.matchTypeId
    );
    if(validate) {
      throw new Error("This entity enum already exist");
    }
  }
  const data = await updateMatchTypeQuery(
    {
      ...request.body,
      modifyBy: request.userTokenInfo.WrUserId,
      modifyDate: new Date(),
    },
    fastify,
    request
  );

  const index = global.tblMatchTypes.findIndex(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  global.tblMatchTypes[index] = {
    ...data,
    matchTypeId: request.body.matchTypeId,
  };

  const validate = global.tblMatchTypePredictor.filter((item) => item.matchTypeId === request.body.matchTypeId);
  if(validate.length > 0 ){
     const sumOfRPB = await updateSumOfRunPerBallQuery(request.body.matchTypeId, fastify, request);
     global.tblMatchTypes[index].sumOfRunPerBall = sumOfRPB
  }

  return { ...data, matchTypeId: request.body.matchTypeId };
};

const saveMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  if (matchTypeId === 0) {
    return await createMatchTypeService(request, fastify);
  } else {
    return await updateMatchTypeService(request, fastify);
  }
};

const deleteMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  // check if matchType is use in commentary
  for (let id of matchTypeId) {
    const checkMatchType = global.tblCommentaries.find(
      (item) => item.matchTypeId === id
    );

    if (checkMatchType) {
      throw new Error(`One of the MatchType cannot be deleted as it is used in Commentary.`);
    }

    const checkInMarketTemplate = global.tblMarketTemplate.find(
      (item) => item.matchTypeID === id
    );
    if(checkInMarketTemplate){
      throw new Error(`One of the MatchType cannot be deleted as it is used in Market Template.`);
    }
  }

  await deleteMatchTypePredictorQuery(matchTypeId, fastify, request);
  await deleteMatchTypeQuery(matchTypeId, fastify, request);

  global.tblMatchTypes = global.tblMatchTypes.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );
  global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );

  return `Match Type(s) deleted successfully`;
};

const isHistoryChangeInMatchTypeService = async (request, fastify) => {
  const { isHistory, matchTypeId } = request.body;
  await isHistoryChangeInMatchTypeQuery(
    {
      isHistory,
      matchTypeId,
    },
    request,
    fastify
  );
  const index = global.tblMatchTypes.findIndex((item) => item.matchTypeId == matchTypeId);
  
  if(index != -1){
    global.tblMatchTypes[index].isHistory = isHistory;
  }
  
  return `MatchType isHistory data updated successfully`;
}

const marketTypeService = async (request, fastify) => {
  return MarketTypeId;
}
module.exports = {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
  cloneMatchTypeService,
  isHistoryChangeInMatchTypeService,
  marketTypeService
};
