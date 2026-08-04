const { errorLogger } = require("../utilities/logger");

const getAllLiveActivityTokensQuery = async (request, fastify) => {
    const { startDate, endDate, envType, clientSocketId, commentaryId, page = 1, limit = 50 } = request.body;

    const whereConditions = [`tlat."wrIsDeleted" = FALSE`];
    const bind = [];
    let index = 1;

    if (startDate && endDate) {
        whereConditions.push(`tlat."wrCreatedAt" BETWEEN $${index} AND $${index + 1}`);
        bind.push(startDate, endDate);
        index += 2;
    }

    if (envType) {
        whereConditions.push(`tlat."wrEnvType" = $${index}`);
        bind.push(envType);
        index += 1;
    }

    if (clientSocketId) {
        whereConditions.push(`tlat."wrClientSocketId" = $${index}`);
        bind.push(clientSocketId);
        index += 1;
    }

    if (commentaryId) {
        whereConditions.push(`tlat."wrCommentaryId" = $${index}`);
        bind.push(commentaryId);
        index += 1;
    }

    const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const [{ total }] = await fastify.db.query(
        `
        SELECT COUNT(*)::int AS total
        FROM "tblLiveActivityTokens" tlat
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
            tlat."wrId" AS "id",
            tlat."wrUserId" AS "userId",
            tu."wrUserName" AS "userName",
            tlat."wrCommentaryId" AS "commentaryId",
            tc."wrEventName" AS "eventName",
            tlat."wrApnsToken" AS "apnsToken",
            tlat."wrBundleId" AS "bundleId",
            tlat."wrEnvType" AS "envType",
            tlat."wrExpiresAt" AS "expiresAt",
            tlat."wrCreatedAt" AS "createdAt",
            tlat."wrClientSocketId" AS "clientSocketId",
            tcs."wrServerName" AS "serverName",
            tlat."wrIsDeleted" AS "isDeleted",
            tlat."wrDeletedAt" AS "deletedAt"
        FROM "tblLiveActivityTokens" tlat
        LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tlat."wrCommentaryId" AND tc."wrIsDelete" = FALSE
        LEFT JOIN "tblClient" tu ON tu."wrClientID" = tlat."wrUserId"
        LEFT JOIN "tblClientSockets" tcs ON tcs."wrId" = tlat."wrClientSocketId"
        ${whereClause}
        ORDER BY tlat."wrCreatedAt" DESC
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
};

const getAllLiveActivityTokensByCommentaryQuery = async (request, fastify) => {
    try {
        const { commentaryId, clientSocketId } = request.body;
        return await fastify.db.query(
            `
        SELECT
            tlat."wrId" AS "id",
            tlat."wrUserId" AS "userId",
            tu."wrUserName" AS "userName",
            tlat."wrCommentaryId" AS "commentaryId",
            tc."wrEventName" AS "eventName",
            tlat."wrApnsToken" AS "apnsToken",
            tlat."wrBundleId" AS "bundleId",
            tlat."wrEnvType" AS "envType",
            tlat."wrExpiresAt" AS "expiresAt",
            tlat."wrCreatedAt" AS "createdAt",
            tlat."wrClientSocketId" AS "clientSocketId"
        FROM "tblLiveActivityTokens" tlat
        LEFT JOIN "tblCommentaries" tc
            ON tc."wrCommentaryId" = tlat."wrCommentaryId"
            AND tc."wrIsDelete" = FALSE
        LEFT JOIN "tblClient" tu
            ON tu."wrClientID" = tlat."wrUserId"
        WHERE tlat."wrCommentaryId" = $1 AND tlat."wrExpiresAt" > NOW() AND tlat."wrClientSocketId" = $2 AND tlat."wrIsDeleted" = FALSE;
        `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [commentaryId, clientSocketId]
            }
        );
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableLiveActivityToken.js/getAllLiveActivityTokensByCommentaryQuery",
            request
        );
        throw err;
    }
};

// const insertLiveActivityTokensQuery = async (request, fastify) => {
//     try {
//         const data = request.body;
//         const result = await fastify.db.query(
//             `
//             WITH inserted AS (
//                 INSERT INTO "tblLiveActivityTokens"
//                 (
//                     "wrUserId",
//                     "wrCommentaryId",
//                     "wrApnsToken",
//                     "wrBundleId",
//                     "wrEnv",
//                     "wrCreatedAt"
//                 )
//                 VALUES
//                 (
//                     $1,$2,$3,$4,$5,NOW()
//                 )
//                 RETURNING *
//             )

//             SELECT
//                 i."wrId" AS "id",
//                 i."wrUserId" AS "userId",
//                 tu."WrName" AS "userName",
//                 i."wrCommentaryId" AS "commentaryId",
//                 tc."wrEventName" AS "eventName",
//                 i."wrApnsToken" AS "apnsToken",
//                 i."wrBundleId" AS "bundleId",
//                 i."wrEnv" AS "env",
//                 i."wrExpiresAt" AS "expiresAt",
//                 i."wrCreatedAt" AS "createdAt"
//             FROM inserted i
//             LEFT JOIN "tblClient" tu
//                 ON tu."WrUserId" = i."wrUserId"
//             LEFT JOIN "tblCommentaries" tc
//                 ON tc."wrCommentaryId" = i."wrCommentaryId"
//                 AND tc."wrIsDelete" = FALSE;
//             `,
//             {
//                 type: fastify.db.QueryTypes.SELECT,
//                 bind: [
//                     data.userId || null,
//                     data.commentaryId || null,
//                     data.apnsToken,
//                     data.bundleId,
//                     data.env || null,
//                 ],
//             }
//         );

//         return result[0];
//     } catch (err) {
//         errorLogger(
//             fastify,
//             err.message,
//             "DB ERROR --> repository/TableLiveActivityToken.js/insertLiveActivityTokensQuery",
//             request
//         );
//         throw err;
//     }
// };

// const updateLiveActivityTokensQuery = async (data, fastify, request) => {
//     try {
//         const result = await fastify.db.query(
//             `
//             WITH updated AS (
//                 UPDATE "tblLiveActivityTokens"
//                 SET
//                     "wrUserId" = $1,
//                     "wrCommentaryId" = $2,
//                     "wrApnsToken" = $3,
//                     "wrBundleId" = $4,
//                     "wrEnv" = $5,
//                     "wrExpiresAt" = $6
//                 WHERE
//                     "wrId" = $7
//                 RETURNING *
//             )

//             SELECT
//                 u."wrId" AS "id",
//                 u."wrUserId" AS "userId",
//                 tu."WrName" AS "userName",
//                 u."wrCommentaryId" AS "commentaryId",
//                 tc."wrEventName" AS "eventName",
//                 u."wrApnsToken" AS "apnsToken",
//                 u."wrBundleId" AS "bundleId",
//                 u."wrEnv" AS "env",
//                 u."wrExpiresAt" AS "expiresAt",
//                 u."wrCreatedAt" AS "createdAt"
//             FROM updated u
//             LEFT JOIN "tblClient" tu
//                 ON tu."WrUserId" = u."wrUserId"
//             LEFT JOIN "tblCommentaries" tc
//                 ON tc."wrCommentaryId" = u."wrCommentaryId"
//                 AND tc."wrIsDelete" = FALSE;
//             `,
//             {
//                 type: fastify.db.QueryTypes.SELECT,
//                 bind: [
//                     data.userId,
//                     data.commentaryId,
//                     data.apnsToken,
//                     data.bundleId,
//                     data.env,
//                     data.expiresAt,
//                     data.id,
//                 ],
//             }
//         );

//         return result[0];
//     } catch (err) {
//         errorLogger(
//             fastify,
//             err.message,
//             "DB ERROR --> repository/TableLiveActivityToken.js/updateLiveActivityTokensQuery",
//             request
//         );
//         throw err;
//     }
// };

const upsertLiveActivityTokenQuery = async (request, fastify) => {
    try {
        const data = request.body;

        const result = await fastify.db.query(
            `
            WITH upserted AS (
                INSERT INTO "tblLiveActivityTokens"
                (
                    "wrUserId",
                    "wrCommentaryId",
                    "wrApnsToken",
                    "wrBundleId",
                    "wrEnvType",
                    "wrExpiresAt",
                    "wrCreatedAt",
                    "wrClientSocketId"
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    NOW() + INTERVAL '8 hours',
                    NOW(),
                    $6
                )

                ON CONFLICT ("wrUserId", "wrCommentaryId", "wrClientSocketId")
                DO UPDATE
                SET
                    "wrApnsToken" = EXCLUDED."wrApnsToken",
                    "wrBundleId" = EXCLUDED."wrBundleId",
                    "wrEnvType" = EXCLUDED."wrEnvType",
                    "wrExpiresAt" = NOW() + INTERVAL '8 hours'

                RETURNING *
            )

            SELECT
                u."wrId" AS "id",
                u."wrUserId" AS "userId",
                tu."wrUserName" AS "userName",
                u."wrCommentaryId" AS "commentaryId",
                tc."wrEventName" AS "eventName",
                u."wrApnsToken" AS "apnsToken",
                u."wrBundleId" AS "bundleId",
                u."wrEnvType" AS "envType",
                u."wrExpiresAt" AS "expiresAt",
                u."wrCreatedAt" AS "createdAt",
                u."wrClientSocketId" AS "clientSocketId"
            FROM upserted u
            LEFT JOIN "tblClient" tu
                ON tu."wrClientID" = u."wrUserId"
            LEFT JOIN "tblCommentaries" tc
                ON tc."wrCommentaryId" = u."wrCommentaryId"
               AND tc."wrIsDelete" = FALSE;
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.userId || null,
                    data.commentaryId || null,
                    data.apnsToken,
                    data.bundleId,
                    data.envType || null,
                    data.clientSocketId,
                ],
            }
        );

        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLiveActivityToken.js/upsertLiveActivityTokenQuery",
            request
        );
        throw err;
    }
};

const deleteLiveActivityTokensQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            'UPDATE "tblLiveActivityTokens" SET "wrIsDeleted" = TRUE AND "wrDeletedAt" = NOW() WHERE "wrUserId" = $1 AND "wrCommentaryId" = $2 AND "wrClientSocketId" = $3',
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [data.userId, data.commentaryId, data.clientSocketId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLiveActivityToken.js/deleteLiveActivityTokensQuery",
            request
        );
        throw err;
    }
};

const deleteLiveActivityTokenByIdQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            'UPDATE "tblLiveActivityTokens" SET "wrIsDeleted" = TRUE AND "wrDeletedAt" = NOW() WHERE "wrId" = $1',
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLiveActivityToken.js/deleteLiveActivityTokenByIdQuery",
            request
        );
        throw err;
    }
};

const deleteExpiredLiveActivityTokensQuery = async (fastify, request) => {
    try {
        return await fastify.db.query(
            'UPDATE "tblLiveActivityTokens" SET "wrIsDeleted" = TRUE, "wrDeletedAt" = NOW() WHERE "wrExpiresAt" < NOW()',
            {
                type: fastify.db.QueryTypes.UPDATE,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableLiveActivityToken.js/deleteExpiredLiveActivityTokensQuery",
            request
        );
        throw err;
    }
};

module.exports = {
    getAllLiveActivityTokensQuery,
    getAllLiveActivityTokensByCommentaryQuery,
    upsertLiveActivityTokenQuery,
    deleteLiveActivityTokensQuery,
    deleteLiveActivityTokenByIdQuery,
    deleteExpiredLiveActivityTokensQuery,
};
