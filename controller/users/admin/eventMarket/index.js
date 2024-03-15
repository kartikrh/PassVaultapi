
const { getDetailsByCIdService, getAllEventMarketsService, createEventMarketsService, deleteEventMarketsService, activeInactiveMarketsService, updateAllowMarketsService, getEventListByCompetitionIdsService } = require("../../../../services/eventMarket");
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


module.exports = {
    getDetailsByCId,
    getAllEventMarket,
    createEventMarket,
    deleteEventMarket,
    activeInactiveMarket,
    updateAllowMarket,
    getEventListByCompetitionId
};
