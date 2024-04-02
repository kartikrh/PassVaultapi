
const { getDetailsByCIdService, getAllEventMarketsService, createEventMarketsService, deleteEventMarketsService, activeInactiveMarketsService, updateAllowMarketsService, getEventListByCompetitionIdsService, marketListResultFalseService, changeResultOfMarketService, changeMarketCancelService, changeMarketResultService, marketListByCIdService, saveEventMarketService, updateMarketRateService, changeMarketCloseService, suspendMarketByCIdService, getEventMarketByIdService, marketTemplateTypeService, commentaryTypeService, setDelayEventMarketService } = require("../../../../services/eventMarket");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/eventMarket/index";
const getDetailsByCId = async (request, reply, fastify) => {
  try {
    const result = await getDetailsByCIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getDetailsByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllEventMarket = async (request, reply, fastify) => {
  try {
    const result = await getAllEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventMarketById = async (request, reply, fastify) => {
  try {
    const result = await getEventMarketByIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventMarketById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const createEventMarket = async (request, reply, fastify) => {
  try {
    const result = await createEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/createEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteEventMarket = async (request, reply, fastify) => {
  try {
    const result = await deleteEventMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveMarket = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/activeInactiveMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateAllowMarket = async (request, reply, fastify) => {
  try {
    const result = await updateAllowMarketsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateAllowMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventListByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getEventListByCompetitionIdsService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventListByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const marketListResultFalse = async (request, reply, fastify) => {
  try {
    const result = await marketListResultFalseService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListResultFalse", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeResultOfMarket = async (request, reply, fastify) => {
  try {
    const result = await changeResultOfMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeResultOfMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const marketListByCId = async (request, reply, fastify) => {
  try {
    const result = await marketListByCIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/marketListByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateMarketRate = async (request, reply, fastify) => {
  try {
    const result = await updateMarketRateService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateMarketRate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveEventMarket = async (request, reply, fastify) => {
  try {
    const result = await saveEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketCancel = async (request, reply, fastify) => {
  try {
    const result = await changeMarketCancelService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketCancel", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketResult = async (request, reply, fastify) => {
  try {
    const result = await changeMarketResultService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketResult", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeMarketClose = async (request, reply, fastify) => {
  try {
    const result = await changeMarketCloseService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/changeMarketClose", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const suspendMarketByCId = async (request, reply, fastify) => {
  try {
    const result = await suspendMarketByCIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/suspendMarketByCId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryTypeList  = async (request, reply, fastify) => {
  try {
    const result = await commentaryTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMarketTemplateTypeList  = async (request, reply, fastify) => {
  try {
    const result = await marketTemplateTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getMarketTemplateList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const setDelayEventMarket = async (request, reply, fastify) => {
  try {
    const result = await setDelayEventMarketService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/setDelayEventMarket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
    getDetailsByCId,
    getAllEventMarket,
    createEventMarket,
    deleteEventMarket,
    activeInactiveMarket,
    updateAllowMarket,
    getEventListByCompetitionId,
    marketListResultFalse,
    changeResultOfMarket,
    marketListByCId,
    updateMarketRate,
    saveEventMarket,
    changeMarketCancel,
    changeMarketResult,
    changeMarketClose,
    suspendMarketByCId,
    getEventMarketById,
    getCommentaryTypeList,
    getMarketTemplateTypeList,
    setDelayEventMarket
};
