const {
  insertMarketTemplateQuery,
  deleteMarketTemplateQuery,
  updateMarketTemplateQuery,
  updateStatusMarketTemplateQuery,
  changePredefineRunnerQuery,
  updateIsPerEventStatusQuery,
  insertMarketTemplateInCloneQuery,
  isShowInAdvanceMarketChangeStatusQuery,
  defaultIsSendDataChangeQuery,
  allMarketTypesAndCategoriesQuery
} = require("../repository/TableMarketTemplate");
const { callPredictorMarket } = require("../utilities");
const { createMarketTemplateRunnerQuery } = require("../repository/TableMarketTemplateRunner")

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
  if (result && result.rateDiff === 0) {
    result.rateDiff = result.rateDiff.toString();
  }
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
  // let _resFromPredictAPI;
  // let callPrediction = {};

  // _resFromPredictAPI = await callPredictorMarket(
  //   {
  //     match_type_id: matchTypeID,
  //     is_market_template: true,
  //   },
  //   "/api/v1/updatemarketpredictors",
  //   fastify,
  //   request
  // );
  // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
  //   callPrediction.predictioncallSuccess = false;
  //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
  //   callPrediction.endPoint = '/api/v1/updatemarketpredictors';
  // }else {
  //   callPrediction.predictioncallSuccess = true;
  //   callPrediction.predictionMessage = 'Prediction call successful';
  //   callPrediction.endPoint = '/api/v1/updatemarketpredictors';
  // }
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
    isDefaultBetAllowed: request.body.isDefaultBetAllowed || false,
    isDefaultMarketActive: request.body.isDefaultMarketActive || false,
    isPerEvent: request.body.isPerEvent !== undefined ? Boolean(request.body.isPerEvent) : marketTemplate.isPerEvent,
    isShowInAdvanceMarket: request.body.isShowInAdvanceMarket !== undefined ? request.body.isShowInAdvanceMarket : marketTemplate.isShowInAdvanceMarket,
    lineType: request.body.lineType || marketTemplate.lineType,
    defaultBackSize: request.body.defaultBackSize || marketTemplate.defaultBackSize,
    defaultLaySize: request.body.defaultLaySize || marketTemplate.defaultLaySize,
    beforeSuspendMin: request.body.beforeSuspendMin !== undefined ? parseInt(request.body.beforeSuspendMin) : marketTemplate.beforeSuspendMin,
    beforeCloseMin: request.body.beforeCloseMin !== undefined ? parseInt(request.body.beforeCloseMin) : marketTemplate.beforeCloseMin,
    defaultIsSendData: request.body.hasOwnProperty("defaultIsSendData") ? request.body.defaultIsSendData : marketTemplate.defaultIsSendData,
    howManyOpenMarkets: request.body.howManyOpenMarkets !== undefined ? request.body.howManyOpenMarkets : marketTemplate.howManyOpenMarkets,
    rateDiff: request.body.rateDiff !== undefined ? request.body.rateDiff : marketTemplate.rateDiff,
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
    //callPrediction,
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
  const { marketTemplateId, matchTypeID, templateName } = request.body;
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

  let data = await insertMarketTemplateInCloneQuery(
    {
      ...marketTemplate,
      matchTypeID: matchTypeID,
      templateName: templateName,
      createdBy: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );
  global.tblMarketTemplate.push({
    ...data,
    matchType: validateMatchType.matchType,
  });

const validateTemplateRunners = global.tblMarketTemplateRunners.filter(
  (item) => item.marketTemplateId === marketTemplateId
).sort((a, b) => a.marketTemplateRunnerId - b.marketTemplateRunnerId);

if (validateTemplateRunners && validateTemplateRunners.length > 0) {
  for (const elem of validateTemplateRunners) {
    
    const request = {
      body: {
        marketTemplateId: data.marketTemplateId,
        runner: elem.runner,
        line: elem.line,
        overRate: elem.overRate,
        underRate: elem.underRate,
        backPrice: elem.backPrice,
        layPrice: elem.layPrice,
        backSize: elem.backSize,
        laySize: elem.laySize,
        predefinedValue : elem.predefinedValue
      }
    };

    const result = await createMarketTemplateRunnerQuery(request, fastify);
    global.tblMarketTemplateRunners.push(result);
  }
}

  return {
    ...data,
    matchType: validateMatchType.matchType,
  };
};

const getMarketTypeAndCategoryByMarketTypeService = async (request, fastify) => {
  const { isActive } = request.body;
  let result;

  if (isActive !== undefined) {
    result = global.tblMarketTypes.filter((item) => item.isActive === isActive);
  } else {
    result = global.tblMarketTypes;
  }

  result = result.map((item) => {
    let categories = global.tblMarketTypeCategories.filter(
      (elem) => elem.marketTypeId === item.marketTypeId
    );
    if (isActive !== undefined) {
      categories = categories.filter((item) => item.isActive === isActive);
    }
    const mappedCategories = categories.map((category) => ({
      id: category.marketTypeCategoryId,
      marketTypeCategori: category.categoryName,
      displayOrder: category.displayOrder
    }));
    return {
      id: item.marketTypeId,
      marketType: item.marketTypeName,
      displayOrder: item.displayOrder,
      marketTypeCategories: mappedCategories,
    };
  });

  return result;
};

const isPerEventStatusService = async (request, fastify) => {
  const { marketTemplateId } = request.body;
  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );

  if (index === -1) {
    throw new Error("MarketTemplate with this id not found");
  }

  await updateIsPerEventStatusQuery(request, fastify);
  global.tblMarketTemplate[index].isPerEvent = request.body.isPerEvent;

  return `MarketTemplate updated successfully`;
};

const isShowInAdvanceMarketChangeStatusService = async (request, fastify) => {
  const { marketTemplateId } = request.body;
  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );

  if (index === -1) {
    throw new Error("MarketTemplate with this id not found");
  }

  await isShowInAdvanceMarketChangeStatusQuery(request, fastify);
  global.tblMarketTemplate[index].isShowInAdvanceMarket = request.body.isShowInAdvanceMarket;

  return `MarketTemplate isShowInAdvanceMarket status updated successfully`;
};

const cloneMultiMarketTemplateService  = async (request, fastify) => {
  // validate marketTemplateId
  // const { marketTemplateId, matchTypeID } = request.body;
  const {marketTemplates} = request.body;
  for (let mar of marketTemplates) {
    const { marketTemplateId, matchTypeID } = mar;
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

    let data = await insertMarketTemplateInCloneQuery(
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

  const validateTemplateRunners = global.tblMarketTemplateRunners.filter(
    (item) => item.marketTemplateId === marketTemplateId
  ).sort((a, b) => a.marketTemplateRunnerId - b.marketTemplateRunnerId);

  if (validateTemplateRunners && validateTemplateRunners.length > 0) {
    for (const elem of validateTemplateRunners) {
      
      const request = {
        body: {
          marketTemplateId: data.marketTemplateId,
          runner: elem.runner,
          line: elem.line,
          overRate: elem.overRate,
          underRate: elem.underRate,
          backPrice: elem.backPrice,
          layPrice: elem.layPrice,
          backSize: elem.backSize,
          laySize: elem.laySize,
        }
      };

      const result = await createMarketTemplateRunnerQuery(request, fastify);
      global.tblMarketTemplateRunners.push(result);
    }
  }
  }
  return "Market Template(s) cloned successfully";
};

const defaultIsSendDataChangeService = async (request, fastify) => {
  const { marketTemplateId } = request.body;
  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );

  if (index === -1) {
    throw new Error("MarketTemplate with this id not found");
  }

  await defaultIsSendDataChangeQuery(request, fastify);
  global.tblMarketTemplate[index].defaultIsSendData = request.body.defaultIsSendData;

  return `MarketTemplate defaultIsSendData status updated successfully`;
};

const allMarketTypesAndCategoriesService = async (request, fastify) => {
  const result = global.tblMarketTypes.map((item) => {
    const categoryTypes = global.tblMarketTypeCategories.filter(
      (elem) => elem.marketTypeId === item.marketTypeId
    );

    return {
      ...item,
      marketTypeCategories: categoryTypes
    };
  });

  return result;
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
  getMarketTypeAndCategoryByMarketTypeService,
  isPerEventStatusService,
  isShowInAdvanceMarketChangeStatusService,
  cloneMultiMarketTemplateService,
  defaultIsSendDataChangeService,
  allMarketTypesAndCategoriesService,
};
