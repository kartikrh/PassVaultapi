const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allResponseLogsQuery = async (body,request, fastify) => {
    try {
        const { startDate, endDate, page, limit  } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : '';

        const query = `
            SELECT 
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
                "tblResponseLogs"
            ${where} 
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblResponseLogs"
            ${where}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        console.log(err);
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allResponseLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const allThirdPartyApiLogsQuery = async (body, request, fastify) => {
    try {
        const { startDate, endDate, page , limit } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : '';
        const query = `
            SELECT 
                "wrId" as "id",
                "wrEndPoint" as "endPoint",
                "wrRequestBody" as "requestBody",
                "wrRequestStartTime" as "requestStartTime",
                "wrRequestEndTime" as "requestEndTime",
                "wrResponse" as "response"
            FROM 
                "tblThirdPartyApiLogs"
            ${where}
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblThirdPartyApiLogs"
            ${where}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allThirdPartyApiLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const allPredictorAPILogsQuery = async (body,request, fastify) => {
    try {
        const { startDate, endDate, page, limit, commentaryId } = body;
        const {skip , take} = getPagination(page, limit);
        let where = startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : null;
        where = commentaryId ? (where ? `${where} AND "wrCommentaryId" = ${commentaryId}` : `WHERE "wrCommentaryId" = ${commentaryId}`) : where;
        const query = `
            SELECT 
                "wrId" as "id",
                "wrEndpoint" as "endPoint",
                "wrRequestBody" as "requestBody",
                "wrRequestStartTime" as "requestStartTime",
                "wrRequestEndTime" as "requestEndTime",
                "wrResponse" as "response",
                "wrCommentaryId" as "commentaryId"
            FROM 
                "tblPredictorAPILogs"
            ${where ? where : ''}
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblPredictorAPILogs"
            ${where ? where : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allPredictorAPILogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const allCommentaryLogsQuery = async (body,request, fastify) => {
    try {
        const { commentaryId, startDate, endDate, page = 1, limit = 20 } = body;
        const {skip , take} = getPagination(page, limit);
        let where = commentaryId ? `WHERE "wrCommentaryId" = ${commentaryId}` :null;
        where = startDate && endDate ? (where ? `${where} AND "wrCreatedDate" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : `WHERE "wrCreatedDate" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}`) : where;
        const query = `
            SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrRequestBody" as "requestBody",
                "wrResponse" as "response",
                "wrGlobal" as "global",
                "wrExtraData" as "extraData",
                "wrCreatedDate" as "createdDate",
                "wrCreatedBy" as "createdBy"
            FROM 
                "tblCommentaryLogs"
            ${where ? where : ''}
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblCommentaryLogs"
            ${where ? where : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allCommentaryLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const allErrorLogsQuery = async (body ,request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrCreatedDate" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : '';
        const query = `
            SELECT 
                "wrErrId" as "errId",
                "wrErrMessage" as "errMessage",
                "wrErrStack" as "errStack",
                "wrDomain" as "domain",
                "wrUserId" as "userId",
                "wrUserIp" as "userIp",
                "wrApi" as "api",
                "wrCreatedDate" as "createdDate",
                "wrRequestBody" as "requestBody"
            FROM
                "tblErrorLogs"
            ${where}
            ORDER BY "wrErrId" DESC
            LIMIT $1 OFFSET $2;

        `;
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        }); 

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblErrorLogs"
            ${where}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: data,
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allErrorLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    allResponseLogsQuery,
    allThirdPartyApiLogsQuery,
    allPredictorAPILogsQuery,
    allCommentaryLogsQuery,
    allErrorLogsQuery
};
