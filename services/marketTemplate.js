const {
  insertMarketTemplateQuery,
  deleteMarketTemplateQuery,
  updateMarketTemplateQuery,
  updateStatusMarketTemplateQuery,
  changePredefineRunnerQuery,
} = require("../repository/TableMarketTemplate");
const { callPredictorMarket } = require("../utilities");

const getAllMarketTemplateService = async (request) => {
  const { isActive, matchTypeId } = request.body;
  let result;
  if (isActive !== undefined) {
    result = global.tblMarketTemplate.filter(
      (item) => item.isActive === isActive
    );
  } else {
    result = global.tblMarketTemplate.filter((item) => item.isActive === true);
  }
  if (matchTypeId) {
    result = result.filter((item) => item.matchTypeID === matchTypeId);
  }
  return result;
};

const getMarketTemplateIdService = async (request) => {
  const { marketTemplateId } = request.body;
  const result = global.tblMarketTemplate.find(
    (item) => item.marketTemplateId === marketTemplateId
  );
  return result || null;
};

const createMarketTemplateService = async (request, fastify) => {
  // validate matchTypeID
  const { matchTypeID } = request.body;
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeID
  );
  if (!matchType) {
    throw new Error("MatchType with this id not found");
  }
  const data = await insertMarketTemplateQuery(
    {
      ...request.body,
      createdBy: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );

  global.tblMarketTemplate.push({
    ...data,
    matchType: matchType.matchType,
  });
  return {
    ...data,
    matchType: matchType.matchType,
  };
};

const updateMarketTemplateService = async (request, fastify) => {
  // validate marketTemplateId
  const { marketTemplateId, matchTypeID } = request.body;
  const marketTemplate = global.tblMarketTemplate.find(
    (item) => item.marketTemplateId === marketTemplateId
  );
  if (!marketTemplate) {
    throw new Error("MarketTemplate not found");
  }
  // validate matchTypeID and playerID
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeID
  );
  if (!matchType) {
    throw new Error("MatchType with this id not found");
  }
  callPredictorMarket(
    {
      match_type_id: matchTypeID,
      is_market_template: true,
    },
    "/api/v1/updatemarketpredictors",
    fastify,
    request
  );

  const body = {
    marketTemplateId,
    templateName: request.body.templateName || marketTemplate.templateName,
    matchTypeID: request.body.matchTypeID || marketTemplate.matchTypeID,
    isPredefineMarket: request.body.hasOwnProperty("isPredefineMarket")
      ? request.body.isPredefineMarket
      : marketTemplate.isPredefineMarket,
    // isPreMatchOnly: request.body.hasOwnProperty("isPreMatchOnly") ? request.body.isPreMatchOnly : marketTemplate.isPreMatchOnly,
    // isPreMatchMarket: request.body.hasOwnProperty("isPreMatchMarket") ? request.body.isPreMatchMarket : marketTemplate.isPreMatchMarket,
    isOver: request.body.hasOwnProperty("isOver")
      ? request.body.isOver
      : marketTemplate.isOver,
    over: request.body.over || marketTemplate.over,
    isPlayer: request.body.hasOwnProperty("isPlayer")
      ? request.body.isPlayer
      : marketTemplate.isPlayer,
    playerName: request.body.playerName || marketTemplate.playerName,
    isAutoCancel: request.body.hasOwnProperty("isAutoCancel")
      ? request.body.isAutoCancel
      : marketTemplate.isAutoCancel,
    createType: request.body.hasOwnProperty("createType")
      ? request.body.createType
      : marketTemplate.createType,
    create: request.body.hasOwnProperty("create")
      ? request.body.create
      : marketTemplate.create,
    autoOpenType: request.body.hasOwnProperty("autoOpenType")
      ? request.body.autoOpenType
      : marketTemplate.autoOpenType,
    autoOpen: request.body.hasOwnProperty("autoOpen")
      ? request.body.autoOpen
      : marketTemplate.autoOpen,
    autoCloseType: request.body.hasOwnProperty("autoCloseType")
      ? request.body.autoCloseType
      : marketTemplate.autoCloseType,
    beforeAutoClose: request.body.hasOwnProperty("beforeAutoClose")
      ? request.body.beforeAutoClose
      : marketTemplate.beforeAutoClose,
    autoSuspendType: request.body.hasOwnProperty("autoSuspendType")
      ? request.body.autoSuspendType
      : marketTemplate.autoSuspendType,
    beforeAutoSuspend: request.body.hasOwnProperty("beforeAutoSuspend")
      ? request.body.beforeAutoSuspend
      : marketTemplate.beforeAutoSuspend,
    isBallStart: request.body.hasOwnProperty("isBallStart")
      ? request.body.isBallStart
      : marketTemplate.isBallStart,
    isAutoResultSet: request.body.hasOwnProperty("isAutoResultSet")
      ? request.body.isAutoResultSet
      : marketTemplate.isAutoResultSet,
    autoResultType: request.body.hasOwnProperty("autoResultType")
      ? request.body.autoResultType
      : marketTemplate.autoResultType,
    autoResultafterBall: request.body.hasOwnProperty("autoResultafterBall")
      ? request.body.autoResultafterBall
      : marketTemplate.autoResultafterBall,
    afterWicketAutoSuspend: request.body.hasOwnProperty(
      "afterWicketAutoSuspend"
    )
      ? request.body.afterWicketAutoSuspend
      : marketTemplate.afterWicketAutoSuspend,
    afterWicketNotCreated: request.body.hasOwnProperty("afterWicketNotCreated")
      ? request.body.afterWicketNotCreated
      : marketTemplate.afterWicketNotCreated,
    isActive: request.body.hasOwnProperty("isActive")
      ? request.body.isActive
      : marketTemplate.isActive,
    actionType: request.body.actionType || marketTemplate.actionType,
    marketTypeId: request.body.marketTypeId || marketTemplate.marketTypeId,
    marketTypeCategoryId:
      request.body.marketTypeCategoryId || marketTemplate.marketTypeCategoryId,
    margin: request.body.margin || marketTemplate.margin,
    createRefId: request.body.createRefId || marketTemplate.createRefId,
    openRefId: request.body.openRefId || marketTemplate.openRefId,
    isPredefineRunnerValue: request.body.hasOwnProperty(
      "isPredefineRunnerValue"
    )
      ? request.body.isPredefineRunnerValue
      : marketTemplate.isPredefineRunnerValue,
    templateType: request.body.templateType || marketTemplate.templateType,
    delay: request.body.delay || marketTemplate.delay,
  };
  // update marketTemplate
  await updateMarketTemplateQuery(body, fastify, request);

  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );
  global.tblMarketTemplate[index] = {
    ...body,
    matchType: matchType.matchType,
  };

  return {
    ...body,
    matchType: matchType.matchType,
  };
};

const saveMarketTemplateService = async (request, fastify) => {
  const { marketTemplateId } = request.body;

  if (marketTemplateId === 0) {
    return await createMarketTemplateService(request, fastify);
  } else {
    return await updateMarketTemplateService(request, fastify);
  }
};

const deleteMarketTemplateService = async (request, fastify) => {
  const { marketTemplateId } = request.body;

  await deleteMarketTemplateQuery(marketTemplateId, fastify, request);

  global.tblMarketTemplate = global.tblMarketTemplate.filter(
    (item) => !marketTemplateId.includes(item.marketTemplateId)
  );

  return `Market Template(s) deleted successfully`;
};
const getMatchTypeListService = async (request, fastify) => {
  let result;

  result = global.tblMatchTypes.map((item) => ({
    matchTypeId: item.matchTypeId,
    matchType: item.matchType,
  }));

  return result;
};
const activeInactiveTemplateService = async (request, fastify) => {
  // validate marketTemplateId
  const { marketTemplateId } = request.body;
  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );

  if (index === -1) {
    throw new Error("MarketTemplate with this id not found");
  }

  await updateStatusMarketTemplateQuery(request, fastify);
  global.tblMarketTemplate[index].isActive = request.body.isActive;

  return `MarketTemplate updated successfully`;
};
const getByMatchTypeIdService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  let marketTemplate = global.tblMarketTemplate.filter(
    (item) => item.matchTypeID === matchTypeId
  );
  return marketTemplate;
};
const getMarketTypeListService = async (request, fastify) => {
  const { isActive } = request.body;
  let result;
  if (isActive !== undefined) {
    result = global.tblMarketTypes.filter((item) => item.isActive === isActive);
  } else {
    result = global.tblMarketTypes;
  }

  return result;
};
const getCategoryByMarketTypeService = async (request, fastify) => {
  const { marketTypeId, isActive } = request.body;
  let result = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeId === marketTypeId
  );
  if (isActive !== undefined) {
    result = result.filter((item) => item.isActive === isActive);
  }
  return result;
};
const changePredefineRunnerService = async (request, fastify) => {
  const { marketTemplateId, isPredefineRunnerValue } = request.body;
  // validate marketTemplateId
  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );
  if (index === -1) {
    throw new Error("MarketTemplate with this id not found");
  }
  await changePredefineRunnerQuery(request, fastify);
  global.tblMarketTemplate[index].isPredefineRunnerValue =
    isPredefineRunnerValue;
  return `MarketTemplate updated successfully`;
};

const cloneMarketTemplateService = async (request, fastify) => {
  // validate marketTemplateId
  const { marketTemplateId, matchTypeID } = request.body;
  const marketTemplate = global.tblMarketTemplate.find(
    (item) => item.marketTemplateId === marketTemplateId
  );
  if (!marketTemplate) {
    throw new Error("MarketTemplate not found");
  }
  const validateMatchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeID
  );
  if (!validateMatchType) {
    throw new Error("MatchType with this id not found");
  }

  let data = await insertMarketTemplateQuery(
    {
      ...marketTemplate,
      matchTypeID: matchTypeID,
      createdBy: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );
  global.tblMarketTemplate.push({
    ...data,
    matchType: validateMatchType.matchType,
  });
  return {
    ...data,
    matchType: validateMatchType.matchType,
  };
};
module.exports = {
  saveMarketTemplateService,
  getAllMarketTemplateService,
  getMarketTemplateIdService,
  deleteMarketTemplateService,
  getMatchTypeListService,
  activeInactiveTemplateService,
  getByMatchTypeIdService,
  getMarketTypeListService,
  getCategoryByMarketTypeService,
  changePredefineRunnerService,
  cloneMarketTemplateService,
};
