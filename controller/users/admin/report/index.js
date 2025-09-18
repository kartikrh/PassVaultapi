const { allUndoLogsByCommentaryWiseQuery, allUndoLogsByUserWiseQuery } = require("../../../../repository/TableLogs");
const { success, error, ERROR_CODES, UndoReportType } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/report/index.js";

const getAllUndoReportByType = async (request, reply, fastify) => {
    try {
        const { type } = request.body;
        let result = null;
        if (type === UndoReportType.commentary) {
            result = await allUndoLogsByCommentaryWiseQuery(request.body, request, fastify);
        } else if (type === UndoReportType.user) {
            result = await allUndoLogsByUserWiseQuery(request.body, request, fastify);
        } else {
            throw new Error("Invalid type of undo report");
        }
        reply.status(200).send(success(result, 200));
    } catch (err) {
        errorLogger(fastify, err.message, commonPath + "/getAllUndoReportByType", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200))
    }
}

module.exports = {
    getAllUndoReportByType
};