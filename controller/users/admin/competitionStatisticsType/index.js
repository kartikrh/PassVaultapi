const { getAllCompetitionStatisticsTypeService, getCompetitionStatisticsTypeByIdService, saveCompetitionStatisticsTypeService, deleteCompetitionStatisticsTypeService, updateCompetitionStatisticsTypeDisplayOrderService } = require("../../../../services/competitionStatisticsType");
const { success, ERROR_CODES, error } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/competitionStatisticsType";

const getAllCompetitionStatisticsType = async (request, reply, fastify) => {
    try {
        const result = await getAllCompetitionStatisticsTypeService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/getAllCompetitionStatisticsType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getCompetitionStatisticsTypeById = async (request, reply, fastify) => {
    try {
        const result = await getCompetitionStatisticsTypeByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/getCompetitionStatisticsTypeById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveCompetitionStatisticsType = async (request, reply, fastify) => {
    try {
        const result = await saveCompetitionStatisticsTypeService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/saveCompetitionStatisticsType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const deleteCompetitionStatisticsType = async (request, reply, fastify) => {
    try {
        const result = await deleteCompetitionStatisticsTypeService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/deleteCompetitionStatisticsType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const updateCompetitionStatisticsTypeDisplayOrder = async (request, reply, fastify) => {
    try {
        const result = await updateCompetitionStatisticsTypeDisplayOrderService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, path + "/updateCompetitionStatisticsTypeDisplayOrder", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllCompetitionStatisticsType,
    getCompetitionStatisticsTypeById,
    saveCompetitionStatisticsType,
    deleteCompetitionStatisticsType,
    updateCompetitionStatisticsTypeDisplayOrder
};