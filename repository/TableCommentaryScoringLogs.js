const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allCommentaryScoringLogsQuery = async (body, request, fastify) => {
    try {
        const { page = 1, limit = 20, commentaryId , startDate , endDate } = body;
        const {skip , take} = getPagination(page, limit);
        let where = null;
        where = commentaryId ? `logs."wrCommentaryId" = ${commentaryId}` : where;
        where = startDate && endDate ? `${where ? where + ' AND ' : ''} logs."wrCreatedDate" BETWEEN '${startDate}' AND '${endDate}'` : where;

        const query = `
            SELECT 
                "wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                "wrUserId" as "userId",
                "wrUserName" as "userName",
                com."wrEventName" as "eventName",
                comp."wrCompetition" as "competition",
                com."wrCommentaryStatus" as "commentaryStatus",
                com."wrEventId" as "eventId",
                comp."wrCompetitionId" as "competitionId",
                com."wrEventDate" as "eventDate",
                logs."wrCreatedDate" as "createdDate"
            FROM 
                "tblComScoringLogs" logs
            LEFT JOIN "tblCommentaries" com ON com."wrCommentaryId" = logs."wrCommentaryId"
            LEFT JOIN "tblCompetitions" comp ON comp."wrCompetitionId" = com."wrCompetitionId"
            ${where ? `WHERE ${where}` : ''}
            ORDER BY "wrId" DESC
            LIMIT $1 OFFSET $2;
        `;

        console.log(query);
        const data = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind : [
                take,
                skip
            ]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblComScoringLogs" logs
            ${where ? `WHERE ${where}` : ''}
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
            "DB ERROR --> repository/TableCommentaryScoringLogs.js/allCommentaryScoringLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};


const insertCommentaryScoringLogsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblComScoringLogs" (
            "wrCommentaryId", "wrUserId", "wrUserName"
            ) 
            VALUES (
                $1, $2, $3
            ) 
            RETURNING *
            )        
            SELECT 
            "wrId" AS "id",
            "wrCommentaryId" AS "commentaryId",
            "wrUserId" AS "userId",
            "wrUserName" AS "userName"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.commentaryId,
                    request.userTokenInfo.WrUserId,
                    request.userTokenInfo.WrUserName
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryScoringLogs.js/insertCommentaryScoringLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};


module.exports = {
    allCommentaryScoringLogsQuery,
    insertCommentaryScoringLogsQuery
};
