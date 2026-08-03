const { errorLogger } = require("../utilities/logger");

const insertAPNSActivityLogsQuery = async (request, fastify) => {
    try {
        const { liveActivityTokenId, host, header, body, response } = request.body;
        const result = await fastify.db.query(
            `WITH insert_data AS (
                INSERT INTO "tblAPNSActivityLogs" (
                    "wrLiveActivityTokenId", "wrHost", "wrHeader", "wrBody", "wrResponse"
                ) 
                VALUES (
                    $1, $2, $3, $4, $5
                )
                RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrLiveActivityTokenId" as "liveActivityTokenId",
                "wrHost" as "host",
                "wrHeader" as "header",
                "wrBody" as "body",
                "wrResponse" as "response",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    liveActivityTokenId,
                    host,
                    header,
                    body,
                    response
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAPNSActivityLogs.js/insertAPNSActivityLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const getAllAPNSActivityLogsQuery = async (request, fastify) => {
    try {
        const { startDate, endDate, envType, clientSocketId, page = 1, limit = 50 } = request.body;

        const whereConditions = [];
        const bind = [];
        let index = 1;

        if (startDate && endDate) {
            whereConditions.push(`aal."wrCreatedAt" BETWEEN $${index} AND $${index + 1}`);
            bind.push(startDate, endDate);
            index += 2;
        }

        if (envType) {
            whereConditions.push(`lat."wrEnvType" = $${index}`);
            bind.push(envType);
            index += 1;
        }

        if (clientSocketId) {
            whereConditions.push(`cs."wrId" = $${index}`);
            bind.push(clientSocketId);
            index += 1;
        }

        const whereClause = whereConditions.length
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

        const [{ total }] = await fastify.db.query(
            `
                SELECT COUNT(*)::int AS total
                FROM "tblAPNSActivityLogs" aal
                LEFT JOIN "tblLiveActivityTokens" lat ON aal."wrLiveActivityTokenId" = lat."wrId" AND lat."wrIsDeleted" = FALSE
                LEFT JOIN "tblCommentaries" c ON lat."wrCommentaryId" = c."wrCommentaryId"
                LEFT JOIN "tblClientSockets" cs ON lat."wrClientSocketId" = cs."wrId"
                ${whereClause};
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind,
            }
        );

        const result = await fastify.db.query(
            `
                SELECT
                    aal."wrId" AS "id",
                    aal."wrLiveActivityTokenId" AS "liveActivityTokenId",
                    aal."wrHost" AS "host",
                    aal."wrHeader" AS "header",
                    aal."wrBody" AS "body",
                    aal."wrResponse" AS "response",
                    aal."wrCreatedAt" AS "createdAt",
                    lat."wrCommentaryId" AS "commentaryId",
                    c."wrEventName" AS "eventName",
                    lat."wrEnvType" AS "envType",
                    lat."wrClientSocketId" AS "clientSocketId",
                    cs."wrServerName" AS "clientServerName"
                FROM "tblAPNSActivityLogs" aal
                LEFT JOIN "tblLiveActivityTokens" lat ON aal."wrLiveActivityTokenId" = lat."wrId" AND lat."wrIsDeleted" = FALSE
                LEFT JOIN "tblCommentaries" c ON lat."wrCommentaryId" = c."wrCommentaryId"
                LEFT JOIN "tblClientSockets" cs ON lat."wrClientSocketId" = cs."wrId"
                ${whereClause}
                ORDER BY aal."wrCreatedAt" DESC
                LIMIT $${index} OFFSET $${index + 1};
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    ...bind,
                    Number(limit),
                    (Number(page) - 1) * Number(limit),
                ],
            }
        );

        return {
            data: result,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        };
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAPNSActivityLogs.js/getAllAPNSActivityLogsQuery",
            request
        );
        throw error;
    }
};

module.exports = {
    insertAPNSActivityLogsQuery,
    getAllAPNSActivityLogsQuery
};