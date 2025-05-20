const { 
  saveEventervice,
  createVirtualEventService,
  virtualEventTossService,
  updateVirtualEventStatusService,
  ballByBallVirtualEventService,
  virtualMatchStartService,
  ballByBallChangeService,
  suffleCardAPIService,
} = require("../../../../services/virtual");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const commonPath = "controller/users/admin/virtual/index";

const saveEvent = async (request, reply, fastify) => {
    try {
      const result = await saveEventervice(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/saveEvent", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const createVirtualEvent = async (request, reply, fastify) => {
    try {
      const result = await createVirtualEventService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/createVirtualEvent", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const virtualEventToss = async (request, reply, fastify) => {
    try {
      const result = await virtualEventTossService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/virtualEventToss", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const ballByBallChange = async (request, reply, fastify) => {
  try {
    const result = await ballByBallChangeService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    console.log(err)
    errorLogger(fastify, err.message, commonPath + "/ballByBallChange", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateVirtualEventStatus = async (request, reply, fastify) => {
    try {
      const result = await updateVirtualEventStatusService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/updateVirtualEventStatus", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const ballByBallVirtualEvent = async (request, reply, fastify) => {
    try {
      const result = await ballByBallVirtualEventService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/ballByBallVirtualEvent", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const suffleCardAPI = async (request, reply, fastify) => {
    try {
      const result = await suffleCardAPIService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/suffleCardAPI", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
module.exports = {
    saveEvent,
    createVirtualEvent,
    virtualEventToss,
    updateVirtualEventStatus,
    ballByBallVirtualEvent,
    ballByBallChange,
    suffleCardAPI
};