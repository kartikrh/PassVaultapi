const { errorLogger } = require("../utilities/logger");

const getAllFavCompetitionsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCompetitionId" as "competitionId",
                "wrIsDefault" as "isDefault",
                "wrDisplayOrder" as "displayOrder"
            FROM "tblFavCompetitions";`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/getAllFavCompetitionsQuery",
            null
        );
        throw new Error(err.message);
    }
};
const getFavCompetitionByIdQuery = async (whereCondition = null, request, fastify) => {
    try {
        const result = await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCompetitionId" as "competitionId",
                "wrIsDefault" as "isDefault",
                "wrDisplayOrder" as "displayOrder"
            FROM "tblFavCompetitions"
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
const insertFavCompetitionsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblFavCompetitions" (
            "wrClientId", "wrCompetitionId", "wrIsDefault", "wrDisplayOrder"
            ) 
            VALUES (
                $1, $2, $3,
                (
                SELECT 
                    COALESCE((SELECT MAX("wrDisplayOrder") 
                    FROM "tblFavCompetitions"
                    WHERE "wrClientId" = $1
                ), 0) + 1)
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCompetitionId" as "competitionId",
                "wrIsDefault" as "isDefault",
                "wrDisplayOrder" as "displayOrder"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.clientId,
                    data.competitionId,
                    data.isDefault || false,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/insertFavCompetitionsQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateFavCompetitionsQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `UPDATE "tblFavCompetitions" SET 
                "wrClientId" = $1,
                "wrCompetitionId" = $2,
                "wrIsDefault" = $3
            WHERE "wrId" = $4
            RETURNING 
                "wrId" as "id",
                "wrClientId" as "clientId",
                "wrCompetitionId" as "competitionId",
                "wrIsDefault" as "isDefault",
                "wrDisplayOrder" as "displayOrder";`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.clientId,
                    data.competitionId,
                    data.isDefault,
                    data.id,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/updateFavCompetitionsQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteFavCompetitionsQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblFavCompetitions" 
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
            "DB ERROR --> repository/TableFavCompetitions.js/deleteFavCompetitionsQuery",
            request
        );
        throw new Error(err.message);
    }
};

const updateDisplayOrderQuery = async (body,request, fastify) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblFavCompetitions" SET
                "wrDisplayOrder" = $1
            WHERE "wrId" in ($2) `,
            {
                bind: [body.displayOrder, body.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/updateDisplayOrderQuery",
            request
        );
        throw new Error(err.message);
    }
}

const isDefaultFalseQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblFavCompetitions" SET "wrIsDefault" = $1 
            WHERE "wrId" != $2
            AND "wrClientId" = $3`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [false, data.id, data.clientId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableFavCompetitions.js/isDefaultFalseQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllFavCompetitionsQuery,
    getFavCompetitionByIdQuery,
    insertFavCompetitionsQuery,
    updateFavCompetitionsQuery,
    deleteFavCompetitionsQuery,
    updateDisplayOrderQuery,
    isDefaultFalseQuery,
};