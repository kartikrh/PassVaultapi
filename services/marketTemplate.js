const { insertMarketTemplateQuery, deleteMarketTemplateQuery, updateMarketTemplateQuery } = require("../repository/TableMarketTemplate");

const getAllMarketTemplateService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblMarketTemplate.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblMarketTemplate.filter(
      (item) => item.isActive === true
    );
    return result;
  }
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
  const { matchTypeID} = request.body;
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeID
  );
  if (!matchType) {
    throw new Error("MatchType with this id not found");
  }
  const data = await insertMarketTemplateQuery(
    {
      ...request.body,
      createdBy : request.userTokenInfo.WrUserId
    },
    fastify,
    request
  );

  global.tblMarketTemplate.push(data);
  return data;
};

const updateMarketTemplateService = async (request, fastify) => {
  // validate marketTemplateId
  const { marketTemplateId,matchTypeID } = request.body;
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
 
  const body = {
    marketTemplateId,
    templateName: request.body.templateName || marketTemplate.templateName,
    matchTypeID: request.body.matchTypeID || marketTemplate.matchTypeID,
    isPredefineMarket: request.body.hasOwnProperty("isPredefineMarket") ? request.body.isPredefineMarket : marketTemplate.isPredefineMarket,
    isPreMatchOnly: request.body.hasOwnProperty("isPreMatchOnly") ? request.body.isPreMatchOnly : marketTemplate.isPreMatchOnly,
    isPreMatchMarket: request.body.hasOwnProperty("isPreMatchMarket") ? request.body.isPreMatchMarket : marketTemplate.isPreMatchMarket,
    isOver: request.body.hasOwnProperty("isOver") ? request.body.isOver : marketTemplate.isOver,
    over: request.body.over || marketTemplate.over,
    isPlayer: request.body.hasOwnProperty("isPlayer") ? request.body.isPlayer : marketTemplate.isPlayer,
    playerName: request.body.playerName || marketTemplate.playerName,
    isAutoCancel: request.body.hasOwnProperty("isAutoCancel") ? request.body.isAutoCancel : marketTemplate.isAutoCancel,
    autoOpenType: request.body.hasOwnProperty("autoOpenType") ? request.body.autoOpenType : marketTemplate.autoOpenType,
    autoOpen: request.body.hasOwnProperty("autoOpen") ? request.body.autoOpen : marketTemplate.autoOpen,
    autoCloseType: request.body.hasOwnProperty("autoCloseType") ? request.body.autoCloseType : marketTemplate.autoCloseType,
    beforeAutoClose: request.body.hasOwnProperty("beforeAutoClose") ? request.body.beforeAutoClose : marketTemplate.beforeAutoClose,
    autoSuspendType: request.body.hasOwnProperty("autoSuspendType") ? request.body.autoSuspendType : marketTemplate.autoSuspendType,
    beforeAutoSuspend: request.body.hasOwnProperty("beforeAutoSuspend") ? request.body.beforeAutoSuspend : marketTemplate.beforeAutoSuspend,
    isBallStart: request.body.hasOwnProperty("isBallStart") ? request.body.isBallStart : marketTemplate.isBallStart,
    isAutoResultSet: request.body.hasOwnProperty("isAutoResultSet") ? request.body.isAutoResultSet : marketTemplate.isAutoResultSet,
    autoResultType: request.body.hasOwnProperty("autoResultType") ? request.body.autoResultType : marketTemplate.autoResultType,
    autoResultafterBall: request.body.hasOwnProperty("autoResultafterBall") ? request.body.autoResultafterBall : marketTemplate.autoResultafterBall,
    afterWicketAutoSuspend: request.body.hasOwnProperty("afterWicketAutoSuspend") ? request.body.afterWicketAutoSuspend : marketTemplate.afterWicketAutoSuspend,
    afterWicketNotCreated: request.body.hasOwnProperty("afterWicketNotCreated") ? request.body.afterWicketNotCreated : marketTemplate.afterWicketNotCreated,
    isActive: request.body.hasOwnProperty("isActive") ? request.body.isActive : marketTemplate.isActive,
  }
  // update marketTemplate
  await updateMarketTemplateQuery(body, fastify ,request);

  const index = global.tblMarketTemplate.findIndex(
    (item) => item.marketTemplateId === marketTemplateId
  );
  global.tblMarketTemplate[index] = {
    ...body
  };

  return body;
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

  return `Event(s) deleted successfully`;
};

module.exports = {
  saveMarketTemplateService,
  getAllMarketTemplateService,
  getMarketTemplateIdService,
  deleteMarketTemplateService
};