const { allErrorLogs } = require("../../../../services/logs");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/log/index.js";

const getAllErrorLogs = async (request, reply, fastify) => {
    try {
        const result = await allErrorLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllErrorLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

module.exports = {
    getAllErrorLogs,
};
