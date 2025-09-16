const { allUndoLogsByCommentaryWiseQuery, allUndoLogsByUserWiseQuery } = require("../../../../repository/TableLogs");
const { success, error, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/report/index.js";

const allUndoLogsByCommentaryWise = async (request, reply, fastify) => {
    try {
        const result = await allUndoLogsByCommentaryWiseQuery(request.body, request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allUndoLogsByCommentaryWise", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200))
    }
}

const allUndoLogsByUserWise = async (request, reply, fastify) => {
    try {
        const result = await allUndoLogsByUserWiseQuery(request.body, request, fastify);
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/allUndoLogsByUserWise", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200))
    }
}

module.exports = {
    allUndoLogsByCommentaryWise,
    allUndoLogsByUserWise
};