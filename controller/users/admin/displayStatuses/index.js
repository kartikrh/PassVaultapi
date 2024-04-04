const { model } = require("mongoose");
const {
  allDisplayStatusesService,
  displayStatusesIdService,
  savedisplayStatusesService,
  deletedisplayStatusesService,
} = require("../../../../services/displayStatus");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/displayStatuses/index";

const getAlldisplayStatuses = async (request, reply, fastify) => {
  try {
    const result = await allDisplayStatusesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAlldisplayStatuses",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getdisplayStatusesById = async (request, reply, fastify) => {
  try {
    const result = await displayStatusesIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getdisplayStatusesById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const savedisplayStatuses = async (request, reply, fastify) => {
  try {
    const result = await savedisplayStatusesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savedisplayStatuses",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deletedisplayStatuses = async (request, reply, fastify) => {
  try {
    const result = await deletedisplayStatusesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletedisplayStatusesService",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAlldisplayStatuses,
  getdisplayStatusesById,
  savedisplayStatuses,
  deletedisplayStatuses,
};
