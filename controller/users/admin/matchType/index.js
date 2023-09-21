const {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
} = require("../../../../services/matchType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/matchType/index.js";

const getAllMatchTypes = async (request, reply, fastify) => {
  try {
    const result = await allMatchTypesService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllMatchTypes",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getMatchTypeId = async (request, reply, fastify) => {
  try {
    const result = await matchTypeByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMatchTypeId", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const saveMatchType = async (request, reply, fastify) => {
  try {
    const result = await saveMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMatchType", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deleteMatchType = async (request, reply, fastify) => {
  try {
    const result = await deleteMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteMatchType", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllMatchTypes,
  getMatchTypeId,
  saveMatchType,
  deleteMatchType,
};
