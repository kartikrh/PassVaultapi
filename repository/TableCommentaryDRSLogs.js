const { getPagination } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allCommentaryDRSLogsQuery = async (body, request, fastify) => {
    try {
        const { page = 1, limit = 20, commentaryId, startDate, endDate } = body;
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
                tu1."WrName" as "createdBy",
                logs."wrCreatedAt" as "createdAt",
                tu2."WrName" as "updatedBy",
                logs."wrUpdatedAt" as "updatedAt",
                logs."wrIsCount" as "isCount"
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
            bind : [take, skip]
        });

        const totalRecordsQuery = `
            SELECT COUNT(*) as "count"
            FROM "tblCommentaryDRSLogs" logs
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
                tu1."WrName" as "createdBy",
                logs."wrCreatedAt" as "createdAt",
                tu2."WrName" as "updatedBy",
                logs."wrUpdatedAt" as "updatedAt",
                logs."wrIsCount" as "isCount"
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


const commentaryDRSLogByCommQuery = async (whereCondition = undefined, request, fastify) => {
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
                tu1."WrName" as "createdBy",
                logs."wrCreatedAt" as "createdAt",
                tu2."WrName" as "updatedBy",
                logs."wrUpdatedAt" as "updatedAt",
                logs."wrIsCount" as "isCount"
            FROM "tblCommentaryDRSLogs" logs
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = logs."wrTeamId"
            LEFT JOIN "tblUsers" tu1 ON logs."wrCreatedBy" = tu1."WrUserId"
            LEFT JOIN "tblUsers" tu2 ON logs."wrUpdatedBy" = tu2."WrUserId"
            ${whereCondition ? `WHERE ${whereCondition}` : ""}`,
            {
                type: fastify.db.QueryTypes.SELECT,
            }
        );

        return data;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/commentaryDRSLogByCommQuery",
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
                "wrCreatedBy", "wrCreatedAt", "wrIsCount"
            ) 
            SELECT 
                $1, $2, $3, max_order + 1, $4, $5, NOW(), $6
            FROM max_order
            RETURNING 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryTeamId" as "commentaryTeamId",
                "wrTeamId" as "teamId",
                "wrOrder" as "order",
                "wrResult" as "result",
                "wrIsCount" as "isCount";`,
            {
                type: fastify.db.QueryTypes.INSERT,
                bind: [
                    data.commentaryId,
                    data.commentaryTeamId,
                    data.teamId,
                    data.result ?? null,
                    request.userTokenInfo.WrUserId,
                    data.isCount ?? null
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
                "wrUpdatedAt" = NOW(),
                "wrIsCount" = &7
            WHERE "wrId" = $6
            RETURNING 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryTeamId" as "commentaryTeamId",
                "wrTeamId" as "teamId",
                "wrOrder" as "order",
                "wrResult" as "result",
                "wrIsCount" as "isCount";`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.commentaryId,
                    data.commentaryTeamId,
                    data.teamId,
                    data.result,
                    request.userTokenInfo.WrUserId,
                    data.id,
                    data.isCount == undefined ? null : data.isCount
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
const getDrsByIdQuery = async (data,request,fastify)=>{
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrCommentaryTeamId" as "commentaryTeamId",
                "wrOrder" as "order",
                "wrResult" as "result",
                "wrCreatedAt" as "createdAt",
                "wrUpdatedAt" as "updatedAt",
                "wrIsCount" as "isCount"
            FROM "tblCommentaryDRSLogs"
            WHERE "wrId" = ANY($1)
                `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind : [data.id]
            }
        );
        return result;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/getDrsByIdQuery",
            request
        );
        throw new Error(err.message);
    }
}
const upDrsLogQuery = async(data,request , fastify)=>{
    return await fastify.db.query(`
            UPDATE "tblCommentaryDRSLogs"
            SET
                "wrResult" =$1,
                "wrIsCount" = $2
            WHERE "wrId" =$3
        
        `,
        {
            bind : [
                data.result,
                data.isCount,
                data.id
            ]
        }
    )
}
const dltDrsQuery = async (data, request , fastify) =>{
    try {
       return await fastify.db.query(`
            DELETE FROM "tblCommentaryDRSLogs"
            WHERE "wrId" = ANY($1)
        `
        ,{
            type: fastify.db.QueryTypes.SELECT,
            bind : [data.id]
        }
       )
    } catch (error) {
         errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableCommentaryDRSLogs.js/dltDrsQuery",
            request
        );
        throw new Error(err.message);
    }
}
module.exports = {
    allCommentaryDRSLogsQuery,
    commentaryDRSLogByIdQuery,
    insertCommentaryDRSLogsQuery,
    updateCommentaryDRSLogsQuery,
    commentaryDRSLogByCommQuery,
    getDrsByIdQuery,
    upDrsLogQuery,
    dltDrsQuery
};
