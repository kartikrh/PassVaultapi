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
                users."WrUserName" as "createdBy"
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
                users."WrUserName" as "createdBy"
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
                users."WrUserName" as "createdBy",
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
        where = startDate && endDate ? (where ? `${where} AND logs."wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'` : `WHERE logs."wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'`) : where;
        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrGlobal" as "global",
                logs."wrExtraData" as "extraData",
                logs."wrCreatedDate" as "createdDate",
                users."WrUserName" as "createdBy",
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
                users."WrUserName" as "createdBy"
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
        const { startDate, endDate, page = 1, limit = 20 , commentaryId } = data;
        let {skip , take} = getPagination(page, limit);
        // let where = `where "wrRequestBody" ->> 'deleteCommentaryBallByBallId' is not null`;
        let where = commentaryId ? `logs."wrCommentaryId" = ${commentaryId}` : null;
        // where = where ? `${where} AND logs."wrRequestBody" ->> 'deleteCommentaryBallByBallId' is not null` : `logs."wrRequestBody" ->> 'deleteCommentaryBallByBallId' is not null`;
        where = where ? `${where} AND logs."wrComment" = 'delete' ` : `logs."wrComment" = 'delete'`;
        where = startDate && endDate ? (where ? `${where} AND logs."wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'` : `logs."wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'`) : where;


        // console.log('where', where);

        const query = `
            SELECT
                logs."wrId" as "id",
                logs."wrRequestBody" as "requestBody",
                logs."wrResponse" as "response",
                logs."wrCreatedDate" as "createdDate",
                logs."wrCommentaryId" as "commentaryId",
                users."WrUserName" as "createdBy",
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
            FROM "tblCommentaryLogs" logs
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
                users."WrUserName" as "createdBy",
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
        console.log('where', where);

        const query = `
            SELECT
                logs."wrId" as "id",
                logs."wrResult" as "result",
                logs."wrMarketId" as "marketId",
                users."WrUserName" as "createdBy",
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

module.exports = {
    allResponseLogsQuery,
    allThirdPartyApiLogsQuery,
    allPredictorAPILogsQuery,
    allCommentaryLogsQuery,
    allErrorLogsQuery,
    allUndoLogsQuery,
    allResponseLogsWithoutFilertsQuery,
    allResultLogsQuery,
};
