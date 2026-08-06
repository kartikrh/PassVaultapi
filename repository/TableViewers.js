const { errorLogger } = require("../utilities/logger");

const getAllViewersQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" AS "id",
                "wrType" AS "type",
                "wrTypeId" AS "typeId",
                "wrWhitelabelId" AS "whitelabelId",
                "wrViewerCount" AS "viewerCount",
                "wrCreatedAt" AS "createdAt"
            FROM "tblViewers";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableViewers.js/getAllViewersQuery",
            request
        );
        return true;
    }
};

const insertViewersQuery = async (request, fastify) => {
    try {
        const { type, typeId, whitelabelId, viewerCount } = request.body;
        const result = await fastify.db.query(
            `WITH insert_data AS (
                INSERT INTO "tblViewers" (
                    "wrType", "wrTypeId", "wrWhitelabelId", "wrViewerCount"
                ) 
                VALUES (
                    $1, $2, $3, $4
                )
                RETURNING *
            )
            SELECT 
                "wrId" AS "id",
                "wrType" AS "type",
                "wrTypeId" AS "typeId",
                "wrWhitelabelId" AS "whitelabelId",
                "wrViewerCount" AS "viewerCount",
                "wrCreatedAt" AS "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    type,
                    typeId,
                    whitelabelId,
                    1
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableViewers.js/insertViewersQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateViewersQuery = async (request, fastify) => {
    try {
        const { id } = request.body;
        const result = await fastify.db.query(
            `WITH updated_data AS (
                UPDATE "tblViewers" SET 
                    "wrViewerCount" = COALESCE("wrViewerCount", 0) + 1,
                    "wrUpdatedAt" = NOW()
                WHERE "wrId" = $1
                RETURNING *
            )
            SELECT 
                "wrId" AS "id",
                "wrType" AS "type",
                "wrTypeId" AS "typeId",
                "wrWhitelabelId" AS "whitelabelId",
                "wrViewerCount" AS "viewerCount",
                "wrCreatedAt" AS "createdAt"
            FROM updated_data;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [id]
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableViewers.js/updateViewersQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllViewersQuery,
    insertViewersQuery,
    updateViewersQuery
}