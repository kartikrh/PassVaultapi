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
    const result = await allEventService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEvents", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getEventId = async (request, reply, fastify) => {
  try {
    const result = await eventByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventId", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getEventcompetitionId = async (request, reply, fastify) => {
  try {
    const result = await eventBycompetitionIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getEventcompetitionId", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const saveEvent = async (request, reply, fastify) => {
  try {
    const result = await saveEventService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveEvent", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deleteEvent = async (request, reply, fastify) => {
  try {
    const result = await deleteEventService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteEvent", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllEvents,
  getEventId,
  saveEvent,
  deleteEvent,
  getEventcompetitionId,
};
