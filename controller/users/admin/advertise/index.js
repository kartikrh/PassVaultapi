const {
  getAllAdvertiseService,
  advertiseByIdService,
  saveAdvertiseService,
  deleteAdvertiseService,
  activeInactiveAdvertiseService,
} = require("../../../../services/advertise");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/advertise/index.js";

const getAllAdvertise = async (request, reply, fastify) => {
  try {
    const result = await getAllAdvertiseService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllAdvertise", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAdvertiseById = async (request, reply, fastify) => {
  try {
    const result = await advertiseByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAdvertiseById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveAdvertise = async (request, reply, fastify) => {
  try {
    const result = await saveAdvertiseService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveAdvertise", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteAdvertise = async (request, reply, fastify) => {
  try {
    const result = await deleteAdvertiseService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteAdvertise",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveAdvertise = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveAdvertiseService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveAdvertise",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllAdvertise,
  getAdvertiseById,
  saveAdvertise,
  deleteAdvertise,
  activeInactiveAdvertise,
};