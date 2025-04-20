const { errorLogger } = require("../utilities/logger");

const getAllFavCommentaryQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCommentaryId" as "wrCommentaryId",
                "wrCreatedAt" as "createdAt"
            FROM "tblClientFavCommentary";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientFavCommentary.js/getAllFavCommentaryQuery",
            null
        );
        throw new Error(err.message);
    }
};

const getFavCommentaryByIdQuery = async (whereCondition = null, request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCommentaryId" as "wrCommentaryId",
                "wrCreatedAt" as "createdAt"
            FROM "tblClientFavCommentary"
            ${whereCondition ? `WHERE ${whereCondition}` : ""};`,
            { type: fastify.db.QueryTypes.SELECT }
        );
        return result[0] || null;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/getFavCompetitionByIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const insertFavCommentaryQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblClientFavCommentary" (
            "wrClientId", "wrCommentaryId", "wrCreatedAt"
            ) 
            VALUES (
                $1, $2, now()
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCommentaryId" as "wrCommentaryId",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.clientId,
                    data.commentaryId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientFavCommentary.js/insertFavCommentaryQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteFavCommentaryQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblClientFavCommentary" 
            WHERE "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableClientFavCommentary.js/deleteFavCommentaryQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllFavCommentaryQuery,
    insertFavCommentaryQuery,
    deleteFavCommentaryQuery,
    getFavCommentaryByIdQuery,
};