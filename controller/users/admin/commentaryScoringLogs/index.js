const { allCommentaryScoringLogs, saveCommentaryScoringLogs } = require("../../../../services/commentaryScoringLogs");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/commentaryScoringLogs/index.js";

const getallCommentaryScoringLogs = async (request, reply, fastify) => {
    try {
        const result = await allCommentaryScoringLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        console.log(err);
        
        errorLogger(fastify, err.message, commonPath + "/getallCommentaryScoringLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const createCommentaryScoringLogs = async (request, reply, fastify) => {
    try {
        const result = await saveCommentaryScoringLogs(request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/createCommentaryScoringLogs", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};


module.exports = {
    getallCommentaryScoringLogs,
    createCommentaryScoringLogs
};
