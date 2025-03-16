const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allCommentaryDRSLogsQuery = async (body, request, fastify) => {
    try {
        const { page = 1, limit = 20, commentaryId , startDate , endDate } = body;
        const {skip , take} = getPagination(page, limit);
        let where = null;
        where = commentaryId ? `logs."wrCommentaryId" = ${commentaryId}` : where;
        where = startDate && endDate ? `${where ? where + ' AND ' : ''} logs."wrCreatedAt" BETWEEN '${startDate}' AND '${endDate}'` : where;

        const query = `
            SELECT 
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrCommentaryTeamId" as "commentaryTeamId",
                logs."wrTeamId" as "teamId",
                tt."wrTeamName" as "teamName",
                logs."wrOrder" as "order",
                logs."wrResult" as "result",
                tu1."WrUserName" as "createdBy",
                logs."wrCreatedAt" as "createdAt",
                tu2."WrUserName" as "updatedBy",
                logs."wrUpdatedAt" as "updatedAt"
            FROM "tblCommentaryDRSLogs" logs
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = logs."wrTeamId"
            LEFT JOIN "tblUsers" tu1 ON logs."wrCreatedBy" = tu1."WrUserId"
            LEFT JOIN "tblUsers" tu2 ON logs."wrUpdatedBy" = tu2."WrUserId"
            ${where ? `WHERE ${where}` : ''}
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
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/allCommentaryDRSLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const commentaryDRSLogByIdQuery = async (id, request, fastify) => {
    try {
        const data = await fastify.db.query(
            `SELECT 
                logs."wrId" as "id",
                logs."wrCommentaryId" as "commentaryId",
                logs."wrCommentaryTeamId" as "commentaryTeamId",
                logs."wrTeamId" as "teamId",
                tt."wrTeamName" as "teamName",
                logs."wrOrder" as "order",
                logs."wrResult" as "result",
                tu1."WrUserName" as "createdBy",
                logs."wrCreatedAt" as "createdAt",
                tu2."WrUserName" as "updatedBy",
                logs."wrUpdatedAt" as "updatedAt"
            FROM "tblCommentaryDRSLogs" logs
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = logs."wrTeamId"
            LEFT JOIN "tblUsers" tu1 ON logs."wrCreatedBy" = tu1."WrUserId"
            LEFT JOIN "tblUsers" tu2 ON logs."wrUpdatedBy" = tu2."WrUserId"
            WHERE "wrId" = $1`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [id]
            }
        );

        return data[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/allCommentaryDRSLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const insertCommentaryDRSLogsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH max_order AS (
                SELECT COALESCE(MAX("wrOrder"), 0) AS max_order
                FROM "tblCommentaryDRSLogs"
                WHERE "wrCommentaryId" = $1 
                AND "wrCommentaryTeamId" = $2 
                AND "wrTeamId" = $3
            )
            INSERT INTO "tblCommentaryDRSLogs" (
                "wrCommentaryId", "wrCommentaryTeamId", "wrTeamId", "wrOrder", "wrResult",
                "wrCreatedBy", "wrCreatedAt"
            ) 
            SELECT 
                $1, $2, $3, max_order + 1, $4, $5, NOW()
            FROM max_order
            RETURNING 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryTeamId" as "commentaryTeamId",
                "wrTeamId" as "teamId",
                "wrOrder" as "order",
                "wrResult" as "result"`,
            {
                type: fastify.db.QueryTypes.INSERT,
                bind: [
                    data.commentaryId,
                    data.commentaryTeamId,
                    data.teamId,
                    data.result,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/insertCommentaryDRSLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateCommentaryDRSLogsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblCommentaryDRSLogs" SET
                "wrCommentaryId" = $1,
                "wrCommentaryTeamId" = $2,
                "wrTeamId" = $3,
                "wrResult" = $4,
                "wrUpdatedBy" = $5,
                "wrUpdatedAt" = NOW()
            WHERE "wrId" = $6
            RETURNING 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryTeamId" as "commentaryTeamId",
                "wrTeamId" as "teamId",
                "wrOrder" as "order",
                "wrResult" as "result";`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.commentaryId,
                    data.commentaryTeamId,
                    data.teamId,
                    data.result,
                    request.userTokenInfo.WrUserId,
                    data.id,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/updateCommentaryDRSLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    allCommentaryDRSLogsQuery,
    commentaryDRSLogByIdQuery,
    insertCommentaryDRSLogsQuery,
    updateCommentaryDRSLogsQuery,
};
