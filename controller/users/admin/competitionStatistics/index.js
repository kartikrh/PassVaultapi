const { getAllCompetitionStatisticsService, getCompetitionStatisticsByIdService, saveCompetitionStatisticsService, deleteCompetitionStatisticsService, updateCompetitionStatisticsDisplayOrderService, getCompetitionStatisticsByCompetitionIdService } = require("../../../../services/competitionStatistics");
const { success, ERROR_CODES, error } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/competitionStatistics";

const getAllCompetitionStatistics = async (request, reply, fastify) => {
    try {
        const result = await getAllCompetitionStatisticsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/getAllCompetitionStatistics", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getCompetitionStatisticsById = async (request, reply, fastify) => {
    try {
        const result = await getCompetitionStatisticsByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/getCompetitionStatisticsById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveCompetitionStatistics = async (request, reply, fastify) => {
    try {
        const result = await saveCompetitionStatisticsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveCompetitionStatistics", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteCompetitionStatistics = async (request, reply, fastify) => {
    try {
        const result = await deleteCompetitionStatisticsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/deleteCompetitionStatistics", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const updateCompetitionStatisticsDisplayOrder = async (request, reply, fastify) => {
    try {
        const result = await updateCompetitionStatisticsDisplayOrderService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/updateCompetitionStatisticsDisplayOrder", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getCompetitionStatisticsByCompetitionId = async (request, reply, fastify) => {
  try {
    const result = await getCompetitionStatisticsByCompetitionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCompetitionStatisticsByCompetitionId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getAllCompetitionStatistics,
    getCompetitionStatisticsById,
    saveCompetitionStatistics,
    deleteCompetitionStatistics,
    updateCompetitionStatisticsDisplayOrder,
    getCompetitionStatisticsByCompetitionId
};