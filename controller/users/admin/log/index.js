const { allResponseLogs, allThirdPartyApiLogs, allPredictorAPILogs, allCommentaryLogs, allErrorLogs, allEventByCompetition, getComByEventId, allUndoLogs, allResultLogsService } = require("../../../../services/logs");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/log/index.js";

const getAllResponseLogs = async (request, reply, fastify) => {
    try {
        const result = await allResponseLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllResponseLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllThirdPartyApiLogs = async (request, reply, fastify) => {
    try {
        const result = await allThirdPartyApiLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllThirdPartyApiLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllPredictorAPILogs = async (request, reply, fastify) => {
    try {
        const result = await allPredictorAPILogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllPredictorAPILogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllCommentaryLogs = async (request, reply, fastify) => {
    try {
        const result = await allCommentaryLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllCommentaryLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllErrorLogs = async (request, reply, fastify) => {
    try {
        const result = await allErrorLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllErrorLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getEventByCompetition = async (request, reply, fastify) => {
    try {
        const result = await allEventByCompetition(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllErrorLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getComByEvent = async (request, reply, fastify) => {
    try {
        const result = await getComByEventId(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllErrorLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const getUndoLogs = async(request , reply , fastify) =>{
    try {
        const result = await allUndoLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify , err.message, commonPath + "/getUndoLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR,200))
    }
}
const getAllResultLogs = async(request , reply , fastify) =>{
    try {
        const result = await allResultLogsService(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify , err.message, commonPath + "/getAllResultLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR,200))
    }
}
module.exports = {
    getAllResponseLogs,
    getAllThirdPartyApiLogs,
    getAllPredictorAPILogs,
    getAllCommentaryLogs,
    getAllErrorLogs,
    getEventByCompetition,
    getComByEvent,
    getUndoLogs,
    getAllResultLogs,
};
