const { errorLogger } = require("../utilities/logger");

const allResponseLogsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrDomain" as "domain",
            "wrPath" as "path",
            "wrResponseTime" as "responseTime",
            "wrUserId" as "userId",
            "wrUserIp" as "userIp",
            "wrRequestBody" as "requestBody",
            "wrRequestStartTime" as "requestStartTime",
            "wrRequestEndTime" as "requestEndTime"
            FROM 
            "tblResponseLogs";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allResponseLogsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const allThirdPartyApiLogsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrEndPoint" as "endPoint",
            "wrRequestBody" as "requestBody",
            "wrRequestStartTime" as "requestStartTime",
            "wrRequestEndTime" as "requestEndTime",
            "wrResponse" as "response"
            FROM "tblThirdPartyApiLogs";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allThirdPartyApiLogsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const allPredictorAPILogsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
            "wrId" as "id",
            "wrEndpoint" as "endPoint",
            "wrRequestBody" as "requestBody",
            "wrRequestStartTime" as "requestStartTime",
            "wrRequestEndTime" as "requestEndTime",
            "wrResponse" as "response",
            "wrCommentaryId" as "commentaryId"
            FROM "tblPredictorAPILogs";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allPredictorAPILogsQuery",
            null
        );
        throw new Error(err.message);
    }
};

module.exports = {
    allResponseLogsQuery,
    allThirdPartyApiLogsQuery,
    allPredictorAPILogsQuery,
};
