const {
  allEventTypesService,
  eventTypeByIdService,
  saveEventTypeService,
  deleteEventTypeService,
  updateDisplayOrderService,
} = require("../../../../services/eventTypes");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/eventTypes/index.js";

const getAllEventTypes = async (request, reply, fastify) => {
  try {
    const result = await allEventTypesService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllEventTypes",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getEventTypeId = async (request, reply, fastify) => {
  try {
    const result = await eventTypeByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getEventTypeId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveEventType = async (request, reply, fastify) => {
  try {
    const result = await saveEventTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveEventType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteEventType = async (request, reply, fastify) => {
  try {
    const result = await deleteEventTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteEventType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const updateDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await updateDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateDisplayOrder",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllEventTypes,
  getEventTypeId,
  saveEventType,
  deleteEventType,
  updateDisplayOrder,
};
