const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allResponseLogsQuery = async (body,request, fastify) => {
    try {
        const { startDate, endDate, page, limit  } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN '${startDate}' AND '${endDate}'` : '';

        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrDomain" as "domain",
                logs."wrPath" as "path",
                logs."wrResponseTime" as "responseTime",
                logs."wrUserId" as "userId",
                logs."wrUserIp" as "userIp",
                logs."wrRequestBody" as "requestBody",
                logs."wrRequestStartTime" as "requestStartTime",
                logs."wrRequestEndTime" as "requestEndTime",
                users."WrName" as "createdBy"
            FROM 
                "tblResponseLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrUserId" = users."WrUserId"
            ${where} 
            ORDER BY logs."wrId" DESC
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
        const totalPages = Math.ceil(totalRecords / take);

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
        const where = startDate && endDate ? `WHERE "wrRequestStartTime" BETWEEN '${startDate}' AND '${endDate}'` : '';
        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrEndPoint" as "endPoint",
                logs."wrRequestBody" as "requestBody",
                logs."wrRequestStartTime" as "requestStartTime",
                logs."wrRequestEndTime" as "requestEndTime",
                logs."wrResponse" as "response",
                users."WrName" as "createdBy"
            FROM 
                "tblThirdPartyApiLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            ${where}
            ORDER BY logs."wrId" DESC
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
        const totalPages = Math.ceil(totalRecords / take);

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
        let where = startDate && endDate ? `WHERE logs."wrRequestStartTime" BETWEEN '${startDate}' AND '${endDate}'` : null;
        where = commentaryId ? (where ? `${where} AND logs."wrCommentaryId" = ${commentaryId}` : `WHERE logs."wrCommentaryId" = ${commentaryId}`) : where;
        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrEndpoint" as "endPoint",
                logs."wrRequestBody" as "requestBody",
                logs."wrRequestStartTime" as "requestStartTime",
                logs."wrRequestEndTime" as "requestEndTime",
                logs."wrResponse" as "response",
                logs."wrCommentaryId" as "commentaryId",
                users."WrName" as "createdBy",
                comp."wrCompetition" as "competition",
                com."wrEventName" as "eventName",
                com."wrEventRefId" as "eventRefId",
                com."wrEventDate" as "eventDate",
                com."wrCommentaryStatus" as "commentaryStatus"
            FROM 
                "tblPredictorAPILogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            LEFT JOIN
                "tblCommentaries" com ON logs."wrCommentaryId" = com."wrCommentaryId"
            LEFT JOIN
                "tblCompetitions" comp ON com."wrCompetitionId" = comp."wrCompetitionId"
            ${where ? where : ''}
            ORDER BY logs."wrId" DESC
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
            FROM "tblPredictorAPILogs" logs
            ${where ? where : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

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
        let where = commentaryId ? `WHERE logs."wrCommentaryId" = ${commentaryId}` :null;
        where = startDate && endDate ? (where ? `${where} AND logs."wrReqStartTime" BETWEEN '${startDate}' AND '${endDate}'` : `WHERE logs."wrReqStartTime" BETWEEN '${startDate}' AND '${endDate}'`) : where;
        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrGlobal" as "global",
                logs."wrExtraData" as "extraData",
                logs."wrCreatedDate" as "createdDate",
                users."WrName" as "createdBy",
                comp."wrCompetition" as "competition",
                com."wrEventName" as "eventName",
                com."wrEventRefId" as "eventRefId",
                com."wrEventDate" as "eventDate",
                com."wrCommentaryStatus" as "commentaryStatus",
                logs."wrReqStartTime" as "reqStartTime"
            FROM 
                "tblCommentaryLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            LEFT JOIN 
                "tblCommentaries" com ON logs."wrCommentaryId" = com."wrCommentaryId"
            LEFT JOIN
                "tblCompetitions" comp ON com."wrCompetitionId" = comp."wrCompetitionId"
            ${where ? where : ''}
            ORDER BY logs."wrId" DESC
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
            FROM "tblCommentaryLogs" logs
            ${where ? where : ''}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

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
        const where = startDate && endDate ? `WHERE "wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'` : '';
        const query = `
            SELECT 
                logs."wrErrId" as "errId",
                logs."wrErrMessage" as "errMessage",
                logs."wrErrStack" as "errStack",
                logs."wrDomain" as "domain",
                logs."wrUserId" as "userId",
                logs."wrUserIp" as "userIp",
                logs."wrApi" as "api",
                logs."wrCreatedDate" as "createdDate",
                logs."wrRequestBody" as "requestBody",
                users."WrName" as "createdBy"
            FROM
            "tblErrorLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrUserId" = users."WrUserId"
            ${where}
            ORDER BY logs."wrErrId" DESC
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
        const totalPages = Math.ceil(totalRecords / take);

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
const allUndoLogsQuery = async (data, request, fastify)=>{
    try {
        const { startDate, endDate, page = 1, limit = 20 , eventTypeId, competitionId, commentaryId, createdById } = data;
        const { skip, take } = getPagination(page, limit);

        const whereClauses = [`logs."wrComment" = 'delete'`];
        const filterBindValues = [];
        let bindIndex = 1;

        if (startDate && endDate) {
            whereClauses.push(`logs."wrCreatedDate" BETWEEN $${bindIndex} AND $${bindIndex + 1}`);
            filterBindValues.push(startDate, endDate);
            bindIndex += 2;
        }

        if (eventTypeId) {
            whereClauses.push(`com."wrEventTypeId" = $${bindIndex}`);
            filterBindValues.push(eventTypeId);
            bindIndex++;
        }

        if (competitionId) {
            whereClauses.push(`com."wrCompetitionId" = $${bindIndex}`);
            filterBindValues.push(competitionId);
            bindIndex++;
        }

        if (commentaryId) {
            whereClauses.push(`com."wrCommentaryId" = $${bindIndex}`);
            filterBindValues.push(commentaryId);
            bindIndex++;
        }

        if (createdById) {
            whereClauses.push(`logs."wrCreatedBy" = $${bindIndex}`);
            filterBindValues.push(createdById);
            bindIndex++;
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const baseQuery = `
            SELECT
                logs."wrId" as "id",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrCreatedDate" as "createdDate",
                logs."wrCommentaryId" as "commentaryId",
                users."WrUserId" as "createdById",
                users."WrName" as "createdBy",
                comp."wrCompetition" as "competition",
                com."wrEventName" as "eventName",
                com."wrEventRefId" as "eventRefId",
                com."wrEventDate" as "eventDate",
                com."wrCommentaryStatus" as "commentaryStatus"
            FROM
                "tblCommentaryLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            LEFT JOIN
                "tblCommentaries" com ON logs."wrCommentaryId" = com."wrCommentaryId"
            LEFT JOIN
                "tblCompetitions" comp ON com."wrCompetitionId" = comp."wrCompetitionId"
            ${where}
            ORDER BY logs."wrId" DESC
        `;

        const paginationBindValues = [...filterBindValues, take, skip];

        const result = await fastify.db.query(baseQuery + ` LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`, {
            type: fastify.db.QueryTypes.SELECT,
            bind: paginationBindValues
        });
    
        const totalRecordsQuery = `
            SELECT COUNT(*) as "count" FROM (
                ${baseQuery}
            ) AS subquery;
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            bind: filterBindValues
        });
   
        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: result,
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLogs.js/allUndoLogsQuery",
            request
        )
        throw new Error(error.message);
    }
}

const allResponseLogsWithoutFilertsQuery = async (fastify) => {

    try {
        return await fastify.db.query(
          `SELECT 
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrGlobal" as "global",
                logs."wrExtraData" as "extraData",
                logs."wrCreatedDate" as "createdDate",
                users."WrName" as "createdBy",
                comp."wrCompetition" as "competition",
                com."wrEventName" as "eventName",
                com."wrEventRefId" as "eventRefId",
                com."wrEventDate" as "eventDate",
                com."wrCommentaryStatus" as "commentaryStatus"
            FROM 
                "tblCommentaryLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            LEFT JOIN 
                "tblCommentaries" com ON logs."wrCommentaryId" = com."wrCommentaryId"
            LEFT JOIN
                "tblCompetitions" comp ON com."wrCompetitionId" = comp."wrCompetitionId"
                ORDER BY logs."wrId" DESC
                `,
          { type: fastify.db.QueryTypes.SELECT }
        );
      } catch (err) {
        errorLogger(
          fastify,
          err.message,
          "DB ERROR --> repository/TableThirdPartyApis.js/allThirdPartyApisQuery",
          null
        );
        throw new Error(err.message);
      }
};

const allResultLogsQuery = async (data, request, fastify)=>{
    try {
        const { startDate, endDate, page = 1, limit = 20, marketId, resultData } = data;
        let {skip , take} = getPagination(page, limit);
        let where = marketId ? `logs."wrMarketId" = ${marketId}` : null;
        where = startDate && endDate ? (where ? `${where} AND logs."wrCreatedAt" BETWEEN '${startDate}' AND '${endDate}'` : `logs."wrCreatedAt" BETWEEN '${startDate}' AND '${endDate}'`) : where;

        const query = `
            SELECT
                logs."wrId" as "id",
                logs."wrResult" as "result",
                logs."wrMarketId" as "marketId",
                users."WrName" as "createdBy",
                logs."wrCreatedAt" as "createdAt"
            FROM
                "tblResultLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            ${where ? `WHERE ${where}` : ''}
            ORDER BY logs."wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });
    
        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblResultLogs" logs
            ${where ? `WHERE ${where}` : ''}
        `;
        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT
        });
   
        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: result,
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLogs.js/allResultLogsQuery",
            request
        )
        throw new Error(error.message);
    }
}
const allEMLogsQuery = async (data, request, fastify)=>{
    try {
        const { startDate, endDate, page = 1, limit = 20, commentaryId ,cId} = data;
        let {skip , take} = getPagination(page, limit);
        let where = cId.length > 0  ? `logs."wrCommentaryId" IN (${cId})` : null;
        where = startDate && endDate ? (where ? `${where} AND logs."wrRequestTime" BETWEEN '${startDate}' AND '${endDate}'` : `logs."wrRequestTime" BETWEEN '${startDate}' AND '${endDate}'`) : where;

        const query = `
            SELECT
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrError" as "error",
                logs."wrCreatedAt" as "createdAt",
                logs."wrCreatedBy" as "createdBy",
                logs."wrRequestTime" as "requestTime",
                logs."wrResponseTime" as "responseTime",
                users."WrName" as "createdByName"
            FROM
                "tblEventMarketLogs" logs
            LEFT JOIN
                "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
            ${where ? `WHERE ${where}` : ''}
            ORDER BY logs."wrId" DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });
    
        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblEventMarketLogs" logs
            ${where ? `WHERE ${where}` : ''}
        `;
        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT
        });
   
        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages,
            data: result,
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLogs.js/allEMLogsQuery",
            request
        )
        throw new Error(error.message);
    }
}
const allAutoImportDataLogsQuery = async (body ,request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = body;
        const {skip , take} = getPagination(page, limit);
        const where = startDate && endDate ? `WHERE "wrCreateDate" BETWEEN '${startDate}' AND '${endDate}'` : '';
        const query = `
            SELECT 
                "wrId" as "id",
                "wrRefId" as "refId",
                "wrRefType" as "refType",
                "wrSourceId" as "sourceId",
                "wrIsImported" as "isImported",
                "wrIsImportStart" as "isImportStart",
                "wrImportStartTime" as "importStartTime",
                "wrImportEndTime" as "importEndTime",
                "wrCreatedBy" as "createdBy",
                "wrCreateDate" as "createdDate"
            FROM "tblAutoImportData"
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
            FROM "tblAutoImportData"
            ${where}
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

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
            "DB ERROR --> repository/TableLogs.js/allAutoImportDataLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const allUndoLogsByCommentaryWiseQuery = async (data, request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20, eventTypeId, competitionId, commentaryId } = data;
        const { skip, take } = getPagination(page, limit);

        const whereClauses = [`cl."wrComment" = 'delete'`];
        const filterBindValues = [];
        let bindIndex = 1;

        if (startDate && endDate) {
            whereClauses.push(`cl."wrCreatedDate" BETWEEN $${bindIndex} AND $${bindIndex + 1}`);
            filterBindValues.push(startDate, endDate);
            bindIndex += 2;
        }

        if (eventTypeId) {
            whereClauses.push(`c."wrEventTypeId" = $${bindIndex}`);
            filterBindValues.push(eventTypeId);
            bindIndex++;
        }

        if (competitionId) {
            whereClauses.push(`c."wrCompetitionId" = $${bindIndex}`);
            filterBindValues.push(competitionId);
            bindIndex++;
        }

        if (commentaryId) {
            whereClauses.push(`c."wrCommentaryId" = $${bindIndex}`);
            filterBindValues.push(commentaryId);
            bindIndex++;
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const baseQuery = `
            SELECT 
                MIN(c."wrEventDate") AS "date",
                c."wrEventTypeId" AS "eventTypeId",
                et."wrEventType" AS "eventType",
                c."wrCompetitionId" AS "competitionId",
                comp."wrCompetition" AS "competition",
                c."wrEventName" AS "eventName",
                c."wrCommentaryId" AS "commentaryId",
                COUNT(CASE WHEN cl."wrComment" = 'delete' THEN 1 END)::INT AS "totalUndo",
                COUNT(DISTINCT cl."wrCreatedBy")::INT AS "uniqueScorerCount"
            FROM "tblCommentaryLogs" cl
            JOIN "tblCommentaries" c ON cl."wrCommentaryId" = c."wrCommentaryId"
            LEFT JOIN "tblEventTypes" et ON et."wrEventTypeId" = c."wrEventTypeId"
            LEFT JOIN "tblCompetitions" comp ON comp."wrCompetitionId" = c."wrCompetitionId"
            ${where}
            GROUP BY 
                c."wrEventTypeId",
                et."wrEventType",
                c."wrCompetitionId",
                comp."wrCompetition",
                c."wrEventName",
                c."wrCommentaryId"
            ORDER BY "date" DESC
        `;

        const paginationBindValues = [...filterBindValues, take, skip];

        const result = await fastify.db.query(baseQuery + ` LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`, {
            type: fastify.db.QueryTypes.SELECT,
            bind: paginationBindValues
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count" FROM (
                ${baseQuery}
            ) AS subquery;
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            bind: filterBindValues
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords,
            currentPage: page,
            totalPages,
            data: result,
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLogs.js/allUndoLogsByCommentaryWiseQuery",
            request
        );
        throw new Error(error.message);
    }
};

const allUndoLogsByUserWiseQuery = async (data, request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20, createdById } = data;
        const { skip, take } = getPagination(page, limit);

        const whereClauses = [`cl."wrComment" = 'delete'`];
        const filterBindValues = [];
        let bindIndex = 1;

        if (startDate && endDate) {
            whereClauses.push(`cl."wrCreatedDate" BETWEEN $${bindIndex} AND $${bindIndex + 1}`);
            filterBindValues.push(startDate, endDate);
            bindIndex += 2;
        }

        if (createdById) {
            whereClauses.push(`u."WrUserId" = $${bindIndex}`);
            filterBindValues.push(createdById);
            bindIndex++;
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const baseQuery = `
            SELECT 
                u."WrUserId" AS "createdById",
                u."WrName" AS "createdBy",
                COUNT(CASE WHEN cl."wrComment" = 'delete' THEN 1 END)::INT AS "totalUndo",
                COUNT(DISTINCT cl."wrCommentaryId")::INT AS "uniqueCommentaryCount"
            FROM "tblCommentaryLogs" cl
            JOIN "tblUsers" u ON cl."wrCreatedBy" = u."WrUserId"
            ${where}
            GROUP BY 
                u."WrUserId", 
                u."WrName"
            ORDER BY "createdBy" ASC
        `;

        const paginationBindValues = [...filterBindValues, take, skip];

        const result = await fastify.db.query(baseQuery + ` LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`, {
            type: fastify.db.QueryTypes.SELECT,
            bind: paginationBindValues
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count" FROM (
                ${baseQuery}
            ) AS subquery;
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            bind: filterBindValues
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords,
            currentPage: page,
            totalPages,
            data: result,
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLogs.js/allUndoLogsByUserWiseQuery",
            request
        );
        throw new Error(error.message);
    }
};

// const allEntityUpdateLogsQuery = async (body ,request, fastify) => {
//     try {
//         const { startDate, endDate, page = 1, limit = 20, commentaryId } = body;
//         const {skip , take} = getPagination(page, limit);
//         let where = startDate && endDate ? `WHERE logs."wrCreateDate" BETWEEN '${startDate}' AND '${endDate}'` : '';
//         where = commentaryId ? (where ? `${where} AND logs."wrCommentaryId" = ${commentaryId}` : `WHERE logs."wrCommentaryId" = ${commentaryId}`) : where;
//         const query = `
//             SELECT 
//                 logs."wrId" as "id",
//                 logs."wrCommentaryId" as "commentaryId",
//                 logs."wrOffsetHour" as "offsetHour",
//                 logs."wrStatus" as "status",
//                 logs."wrMessage" as "message",
//                 logs."wrResponseData" as "responseData",
//                 logs."wrCreateDate" as "createDate"
//             FROM
//             "tblAutoUpdateCommentaryData" logs
//             ${where}
//             ORDER BY logs."wrId" DESC
//             LIMIT $1 OFFSET $2;
//         `;
//         const data = await fastify.db.query(query, {
//             type: fastify.db.QueryTypes.SELECT,
//             bind : [
//                 take,
//                 skip
//             ]
//         }); 

//         const totalRecordsQuery = `
//             SELECT COUNT(*) as "count"
//             FROM "tblAutoUpdateCommentaryData" logs
//             ${where}
//         `;

//         const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
//             type: fastify.db.QueryTypes.SELECT,
//         });

//         const totalRecords = parseInt(totalRecordsResult[0].count, 10);
//         const totalPages = Math.ceil(totalRecords / take);

//         return {
//             totalRecords: totalRecords,
//             currentPage: page,
//             totalPages: totalPages,
//             data: data,
//         };
//     } catch (err) {
//         errorLogger(
//             fastify,
//             err.message,
//             "DB ERROR --> repository/TableLogs.js/allEntityUpdateLogsQuery",
//             request
//         );
//         throw new Error(err.message);
//     }
// };

const allEntityUpdateLogsQuery = async (body, request, fastify) => {
    try {
        const { 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20, 
            commentaryId,
            eventTypeId,
            competitionId,
            createdById
        } = body;

        const { skip, take } = getPagination(page, limit);

        const whereClauses = [];
        const bindValues = [];
        let bindIndex = 1;

        // Date filter
        if (startDate && endDate) {
            whereClauses.push(`logs."wrCreateDate" BETWEEN $${bindIndex} AND $${bindIndex + 1}`);
            bindValues.push(startDate, endDate);
            bindIndex += 2;
        }

        // Commentary filter
        if (commentaryId) {
            whereClauses.push(`logs."wrCommentaryId" = $${bindIndex}`);
            bindValues.push(commentaryId);
            bindIndex++;
        }

        // Event type filter
        if (eventTypeId) {
            whereClauses.push(`com."wrEventTypeId" = $${bindIndex}`);
            bindValues.push(eventTypeId);
            bindIndex++;
        }

        // Competition filter
        if (competitionId) {
            whereClauses.push(`com."wrCompetitionId" = $${bindIndex}`);
            bindValues.push(competitionId);
            bindIndex++;
        }

        // CreatedBy filter
        if (createdById) {
            whereClauses.push(`logs."wrCreatedBy" = $${bindIndex}`);
            bindValues.push(createdById);
            bindIndex++;
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // Base Query with event & competition details
        const baseQuery = `
            SELECT 
                logs."wrId" AS "id",
                logs."wrCommentaryId" AS "commentaryId",
                logs."wrOffsetHour" AS "offsetHour",
                logs."wrStatus" AS "status",
                logs."wrMessage" AS "message",
                logs."wrResponseData" AS "responseData",
                logs."wrCreateDate" AS "createDate",
                logs."wrCreatedBy" AS "createdById",
                users."WrName" AS "createdBy",

                -- Commentary Details
                com."wrEventName" AS "eventName",
                com."wrEventRefId" AS "eventRefId",
                com."wrEventDate" AS "eventDate",
                com."wrCommentaryStatus" AS "commentaryStatus",

                -- Competition
                comp."wrCompetition" AS "competitionName",

                -- Event Type
                et."wrEventType" AS "eventTypeName"

            FROM "tblAutoUpdateCommentaryData" logs

            LEFT JOIN "tblUsers" users 
                ON logs."wrCreatedBy" = users."WrUserId"

            LEFT JOIN "tblCommentaries" com
                ON logs."wrCommentaryId" = com."wrCommentaryId"

            LEFT JOIN "tblCompetitions" comp
                ON com."wrCompetitionId" = comp."wrCompetitionId"

            LEFT JOIN "tblEventTypes" et
                ON com."wrEventTypeId" = et."wrEventTypeId"

            ${where}
            ORDER BY logs."wrId" DESC
        `;

        const paginationBindValues = [...bindValues, take, skip];

        const data = await fastify.db.query(
            baseQuery + ` LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: paginationBindValues
            }
        );

        const totalRecordsQuery = `
            SELECT COUNT(*) AS "count"
            FROM (${baseQuery}) AS subquery
        `;

        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            bind: bindValues
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);

        return {
            totalRecords,
            currentPage: page,
            totalPages,
            data
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/allEntityUpdateLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

// const actionLogsQuery = async (body ,request, fastify) => {
//     try {
//         const { startDate, endDate, page = 1, limit = 20, commentaryId } = body;
//         const {skip , take} = getPagination(page, limit);
//         let where = startDate && endDate ? `WHERE logs."wrCreatedAt" BETWEEN '${startDate}' AND '${endDate}'` : '';
//         where = commentaryId ? (where ? `${where} AND logs."wrCommentaryId" = ${commentaryId}` : `WHERE logs."wrCommentaryId" = ${commentaryId}`) : where;
//         const query = `
//             SELECT 
//                 logs."wrId" as "id",
//                 logs."wrCommentaryId" as "commentaryId",
//                 logs."wrRequestBody" as "requestBody",
//                 logs."wrResponse" as "response",
//                 logs."wrApiName" as "apiName",
//                 logs."wrCreatedAt" as "createdAt",
//                 logs."wrCreatedBy" as "createdBy",
//                 users."WrName" as "createdBy"
//             FROM
//             "tblCommActionLogs" logs
//             LEFT JOIN
//                 "tblUsers" users ON logs."wrCreatedBy" = users."WrUserId"
//             ${where}
//             ORDER BY logs."wrId" DESC
//             LIMIT $1 OFFSET $2;
//         `;
//         const data = await fastify.db.query(query, {
//             type: fastify.db.QueryTypes.SELECT,
//             bind : [
//                 take,
//                 skip
//             ]
//         }); 

//         const totalRecordsQuery = `
//             SELECT COUNT(*) as "count"
//             FROM "tblCommActionLogs" logs
//             ${where}
//         `;

//         const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
//             type: fastify.db.QueryTypes.SELECT,
//         });

//         const totalRecords = parseInt(totalRecordsResult[0].count, 10);
//         const totalPages = Math.ceil(totalRecords / take);
//         console.log("data", data);
//         return {
//             totalRecords: totalRecords,
//             currentPage: page,
//             totalPages: totalPages,
//             data: data,
//         };
//     } catch (err) {
//         errorLogger(
//             fastify,
//             err.message,
//             "DB ERROR --> repository/TableLogs.js/actionLogsQuery",
//             request
//         );
//         throw new Error(err.message);
//     }
// };

const actionLogsQuery = async (body, request, fastify) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 , eventTypeId, competitionId, commentaryId, createdById } = body;
        const { skip, take } = getPagination(page, limit);

        const whereClauses = [];
        const bindValues = [];
        let bindIndex = 1;

        // Date filter
        if (startDate && endDate) {
            whereClauses.push(`logs."wrCreatedAt" BETWEEN $${bindIndex} AND $${bindIndex + 1}`);
            bindValues.push(startDate, endDate);
            bindIndex += 2;
        }

        // Commentary filter
        if (commentaryId) {
            whereClauses.push(`logs."wrCommentaryId" = $${bindIndex}`);
            bindValues.push(commentaryId);
            bindIndex++;
        }

        // Event Type filter
        if (eventTypeId) {
            whereClauses.push(`com."wrEventTypeId" = $${bindIndex}`);
            bindValues.push(eventTypeId);
            bindIndex++;
        }

        // Competition filter
        if (competitionId) {
            whereClauses.push(`com."wrCompetitionId" = $${bindIndex}`);
            bindValues.push(competitionId);
            bindIndex++;
        }

        // Created By filter
        if (createdById) {
            whereClauses.push(`logs."wrCreatedBy" = $${bindIndex}`);
            bindValues.push(createdById);
            bindIndex++;
        }

        const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const baseQuery = `
            SELECT 
                logs."wrId" AS "id",
                logs."wrCommentaryId" AS "commentaryId",
                logs."wrRequestBody" AS "requestBody",
                logs."wrResponse" AS "response",
                logs."wrApiName" AS "apiName",
                logs."wrCreatedAt" AS "createdAt",
                logs."wrCreatedBy" AS "createdById",
                users."WrName" AS "createdBy",

                -- Commentary Details
                com."wrEventName" AS "eventName",
                com."wrEventRefId" AS "eventRefId",
                com."wrEventDate" AS "eventDate",
                com."wrCommentaryStatus" AS "commentaryStatus",

                -- Competition
                comp."wrCompetition" AS "competitionName",

                -- Event Type
                et."wrEventType" AS "eventTypeName"

            FROM "tblCommActionLogs" logs

            LEFT JOIN "tblUsers" users 
                ON logs."wrCreatedBy" = users."WrUserId"

            LEFT JOIN "tblCommentaries" com
                ON logs."wrCommentaryId" = com."wrCommentaryId"

            LEFT JOIN "tblCompetitions" comp
                ON com."wrCompetitionId" = comp."wrCompetitionId"

            LEFT JOIN "tblEventTypes" et
                ON com."wrEventTypeId" = et."wrEventTypeId"

            ${where}
            ORDER BY logs."wrId" DESC
        `;

        // Add pagination
        const paginationBind = [...bindValues, take, skip];
        const data = await fastify.db.query(
            baseQuery + ` LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: paginationBind
            }
        );

        // Count Query
        const totalRecordsQuery = `
            SELECT COUNT(*) AS "count" 
            FROM ( ${baseQuery} ) AS sub
        `;
        const totalRecordsResult = await fastify.db.query(totalRecordsQuery, {
            type: fastify.db.QueryTypes.SELECT,
            bind: bindValues
        });

        const totalRecords = parseInt(totalRecordsResult[0].count, 10);
        const totalPages = Math.ceil(totalRecords / take);
        return {
            totalRecords,
            currentPage: page,
            totalPages,
            data
        };
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLogs.js/actionLogsQuery",
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
    allErrorLogsQuery,
    allUndoLogsQuery,
    allResponseLogsWithoutFilertsQuery,
    allResultLogsQuery,
    allEMLogsQuery,
    allAutoImportDataLogsQuery,
    allUndoLogsByCommentaryWiseQuery,
    allUndoLogsByUserWiseQuery,
    allEntityUpdateLogsQuery,
    actionLogsQuery,
};
