const {
  getAllShotTypesService,
  shotTypeByIdService,
  createShotTypeService,
  deleteShotTypeService,
  updateDisplayOrderService,
  activeInactiveShotTypeService,
} = require("../../../../services/shotType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/shotType/index.js";

const getAllShotTypes = async (request, reply, fastify) => {
  try {
    const result = await getAllShotTypesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllShotTypes", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getShotTypeById = async (request, reply, fastify) => {
  try {
    const result = await shotTypeByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getShotTypeById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveShotType = async (request, reply, fastify) => {
  try {
    const result = await createShotTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveShotType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteShotType = async (request, reply, fastify) => {
  try {
    const result = await deleteShotTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteShotType", request);
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

const activeInactiveShotType = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveShotTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactiveShotType",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllShotTypes,
  getShotTypeById,
  saveShotType,
  deleteShotType,
  updateDisplayOrder,
  activeInactiveShotType,
};
