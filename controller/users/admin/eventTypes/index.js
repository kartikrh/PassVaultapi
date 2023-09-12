const {
  allEventTypesService,
  eventTypeByIdService,
  saveEventTypeService,
  deleteEventTypeService,
} = require("../../../../services/eventTypes");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllEventTypes = async (request, reply, fastify) => {
  try {
    const result = await allEventTypesService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getEventTypeId = async (request, reply, fastify) => {
  try {
    const result = await eventTypeByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const saveEventType = async (request, reply, fastify) => {
  try {
    const result = await saveEventTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deleteEventType = async (request, reply, fastify) => {
  try {
    const result = await deleteEventTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllEventTypes,
  getEventTypeId,
  saveEventType,
  deleteEventType,
};
