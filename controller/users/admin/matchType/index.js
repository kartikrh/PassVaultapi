const {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
  cloneMatchTypeService,
  isHistoryChangeInMatchTypeService,
  marketTypeService,
  activeInactiveMatchTypeService,
  isMenChangeMatchTypeService,
} = require("../../../../services/matchType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/matchType/index.js";

const getAllMatchTypes = async (request, reply, fastify) => {
  try {
    const result = await allMatchTypesService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllMatchTypes",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMatchTypeList = async (request, reply, fastify) => {
  try{
    let result = await allMatchTypesService();
    result = result.map((item) => ({
      matchTypeId: item.matchTypeId,
      matchType: item.matchType,
    }));
    reply.status(200).send(success(result, 200));
  }catch{
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getMatchTypeList",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
const getMatchTypeId = async (request, reply, fastify) => {
  try {
    const result = await matchTypeByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMatchTypeId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveMatchType = async (request, reply, fastify) => {
  try {
    const result = await saveMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const cloneMatchType = async (request, reply, fastify) => {
  try {
    const result = await cloneMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/cloneMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteMatchType = async (request, reply, fastify) => {
  try {
    const result = await deleteMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isHistoryChangeInMatchType = async (request, reply, fastify) => {
  try {
    const result = await isHistoryChangeInMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/isHistoryChangeInMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const marketType = async (request, reply, fastify) => {
  try {
    const result = await marketTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/marketType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveMatchType = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isMenChangeMatchType = async (request, reply, fastify) => {
  try {
    const result = await isMenChangeMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/isMenChangeMatchType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllMatchTypes,
  getMatchTypeId,
  saveMatchType,
  deleteMatchType,
  cloneMatchType,
  getMatchTypeList,
  isHistoryChangeInMatchType,
  marketType,
  activeInactiveMatchType,
  isMenChangeMatchType,
};
