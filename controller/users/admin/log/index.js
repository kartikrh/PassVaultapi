const { allResponseLogs, allThirdPartyApiLogs, allPredictorAPILogs } = require("../../../../services/logs");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/log/index.js";

const getAllResponseLogs = async (request, reply, fastify) => {
    try {
        const result = await allResponseLogs(request);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllResponseLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const getAllThirdPartyApiLogs = async (request, reply, fastify) => {
    try {
        const result = await allThirdPartyApiLogs(request);
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

module.exports = {
    getAllResponseLogs,
    getAllThirdPartyApiLogs,
    getAllPredictorAPILogs,
};
