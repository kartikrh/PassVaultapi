const {
  allEventService,
  deleteEventService,
  eventByIdService,
  saveEventService,
  eventBycompetitionIdService,
} = require("../../../../services/event");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/event/index";

const getAllEvents = async (request, reply, fastify) => {
  try {
    const result = await allEventService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEvents", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventId = async (request, reply, fastify) => {
  try {
    const result = await eventByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventcompetitionId = async (request, reply, fastify) => {
  try {
    const result = await eventBycompetitionIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventcompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventListcompetitionId = async (request, reply, fastify) => {
  try {
    let result = await eventBycompetitionIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventListcompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveEvent = async (request, reply, fastify) => {
  try {
    const result = await saveEventService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveEvent", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteEvent = async (request, reply, fastify) => {
  try {
    const result = await deleteEventService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEvent", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllEvents,
  getEventId,
  saveEvent,
  deleteEvent,
  getEventcompetitionId,
  getEventListcompetitionId
};
