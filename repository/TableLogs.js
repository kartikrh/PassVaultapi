const { errorLogger } = require("../utilities/logger");

const allResponseLogsQuery = async (filters,request, fastify) => {
    const { startDate, endDate, page = 1, limit = 20 } = filters;

    try {
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
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
            ORDER BY "wrId" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const offset = (page - 1) * limit;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                limit: limit,
                offset: offset,
            },
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblResponseLogs"
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
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
            "DB ERROR --> repository/TableLogs.js/allResponseLogsQuery",
            null
        );
        throw new Error(err.message);
    }
};

const allThirdPartyApiLogsQuery = async (filters,request, fastify) => {
    const { startDate, endDate, page = 1, limit = 20 } = filters;

    try {
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
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
            ORDER BY "wrId" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const offset = (page - 1) * limit;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                limit: limit,
                offset: offset,
            },
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblThirdPartyApiLogs"
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
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
            null
        );
        throw new Error(err.message);
    }
};

const allPredictorAPILogsQuery = async (filters,request, fastify) => {
    const { startDate, endDate, page = 1, limit = 20, commentaryId } = filters;

    try {
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
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
            ${commentaryId ? (startDate && endDate ? ' AND ' : ' WHERE ') + '"wrCommentaryId" = :commentaryId' : ''}
            ORDER BY "wrId" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const offset = (page - 1) * limit;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                commentaryId: commentaryId || null,
                limit: limit,
                offset: offset,
            },
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblPredictorAPILogs"
            ${startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN :startDate AND :endDate` : ''}
            ${commentaryId ? (startDate && endDate ? ' AND ' : ' WHERE ') + '"wrCommentaryId" = :commentaryId' : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                commentaryId: commentaryId || null,
            },
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
            null
        );
        throw new Error(err.message);
    }
};

const allCommentaryLogsQuery = async (filters,request, fastify) => {
    const { commentaryId, startDate, endDate, page = 1, limit = 20 } = filters;

    try {
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
            ${commentaryId ? `WHERE "wrCommentaryId" = :commentaryId` : ''}
            ${startDate && endDate ? `${commentaryId ? ' AND ' : ' WHERE '} "wrCreatedDate" BETWEEN :startDate AND :endDate` : ''}
            ORDER BY "wrId" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const offset = (page - 1) * limit;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                commentaryId: commentaryId || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                limit: limit,
                offset: offset,
            },
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblCommentaryLogs"
            ${commentaryId ? `WHERE "wrCommentaryId" = :commentaryId` : ''}
            ${startDate && endDate ? `${commentaryId ? ' AND ' : ' WHERE '} "wrCreatedDate" BETWEEN :startDate AND :endDate` : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                commentaryId: commentaryId || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
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
            null
        );
        throw new Error(err.message);
    }
};

const allErrorLogsQuery = async (filters,request, fastify) => {
    const { startDate, endDate, page = 1, limit = 20 } = filters;

    try {
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
            ${startDate && endDate ? `WHERE "wrCreatedDate" BETWEEN :startDate AND :endDate` : ''}
            ORDER BY "wrErrId" DESC
            LIMIT :limit OFFSET :offset;
        `;

        const offset = (page - 1) * limit;

        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                limit: limit,
                offset: offset,
            },
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblErrorLogs"
            ${startDate && endDate ? `WHERE "wrCreatedDate" BETWEEN :startDate AND :endDate` : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            replacements: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
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
            null
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
