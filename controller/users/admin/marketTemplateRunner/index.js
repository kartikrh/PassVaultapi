const { saveMarketTemplateRunnerService, getAllMarketTemplateRunnerService, getRunnerByTemplateIdService, getRunnerByIdService, deleteMarketTemplateRunnerService } = require("../../../../services/marketTemplateRunner");
const { error, success, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/marketTemplate/index.js";
const getAllMarketTemplateRunner = async (request, reply, fastify) => {
    try {
        const result = await getAllMarketTemplateRunnerService(fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllMarketTemplateRunner", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getRunnerByTemplateId = async (request, reply, fastify) => {
    try {
        const result = await getRunnerByTemplateIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getRunnerByTemplateId", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const getRunnerById = async (request, reply, fastify) => {
    try {
        const result = await getRunnerByIdService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getRunnerById", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const saveMarketTemplateRunner = async (request, reply, fastify) => {
    try {
        const result = await saveMarketTemplateRunnerService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/saveMarketTemplateRunner", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}
const deleteMarketTemplateRunner = async (request, reply, fastify) => {
    try {
        const result = await deleteMarketTemplateRunnerService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/deleteMarketTemplateRunner", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
}

module.exports = {
    saveMarketTemplateRunner,
    getAllMarketTemplateRunner,
    getRunnerByTemplateId,
    getRunnerById,
    deleteMarketTemplateRunner
}