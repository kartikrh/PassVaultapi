const { getAllICCRankingService, getICCRankingByIdService, deleteICCRankingByIdService, saveICCRankingService, updateICCRankingByIdService, activeInactiveICCRankingByIdService } = require("../../../../services/iccRanking");
const { ERROR_CODES, success, error } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/iccRanking/index.js";

const getAllICCRanking = async (request, reply, fastify) => {
    try {
        const result = await getAllICCRankingService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllICCRanking", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getICCRankingById = async (request, reply, fastify) => {
    try {
        const result = await getICCRankingByIdService(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getICCRankingById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveICCRanking = async (request, reply, fastify) => {
  try {
    const result = await saveICCRankingService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveICCRankingService", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateICCRankingById = async (request, reply, fastify) => {
  try {
    const result = await updateICCRankingByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/insertICCRanking", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteICCRankingById = async (request, reply, fastify) => {
    try {
        const result = await deleteICCRankingByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteICCRankingById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const activeInactiveICCRankingById = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveICCRankingByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveICCRankingById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getAllICCRanking,
    getICCRankingById,
    saveICCRanking,
    updateICCRankingById,
    deleteICCRankingById,
    activeInactiveICCRankingById
}