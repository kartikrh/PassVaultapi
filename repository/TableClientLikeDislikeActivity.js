const { errorLogger } = require("../utilities/logger");

const errorStack = "DB ERROR --> repository/TableClientLikedislikeActivity.js/";

const getAllClientLikeDislikeActivityQuery = async (fastify) => {
    try {
        const result = await fastify.db.query(
            `
                SELECT
                    tclda."wrId" as "id",
	                tclda."wrType" as "type",
	                tclda."wrRefId" as "refId",
                    tclda."wrClientId" as "clientId",
                    tc."wrClientName" as "clientName",
                    tc."wrUserName" as "clientUserName",
                    tclda."wrIsLike" as "isLike",
                    tclda."wrCreatedAt" as "createdAt",
                    tclda."wrUpdatedAt" as "updatedAt",
                    tclda."wrWhitelabelId" as "whitelabelId"
                FROM "tblClientLikeDislikeActivity" tclda
                LEFT JOIN "tblClient" tc ON tc."wrClientID" = tclda."wrClientId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "getAllClientLikeDislikeActivityQuery",
            request
        );
        throw new Error(error.message);
    }
}

const getByClientTypeRefIdQuery = async (request, fastify) => {
    try {
        const { type, refId, clientId, whitelabelId } = request.body;
        const result = await fastify.db.query(
            `
                SELECT
                    tclda."wrId" as "id",
	                tclda."wrType" as "type",
	                tclda."wrRefId" as "refId",
                    tclda."wrClientId" as "clientId",
                    tc."wrClientName" as "clientName",
                    tc."wrUserName" as "clientUserName",
                    tclda."wrIsLike" as "isLike",
                    tclda."wrCreatedAt" as "createdAt",
                    tclda."wrUpdatedAt" as "updatedAt",
                    tclda."wrWhitelabelId" as "whitelabelId"
                FROM "tblClientLikeDislikeActivity" tclda
                LEFT JOIN "tblClient" tc ON tc."wrClientID" = tclda."wrClientId"
                WHERE
                    tclda."wrType" = $1 AND
                    tclda."wrRefId" = $2 AND
                    tclda."wrClientId" = $3 AND
                    tclda."wrWhitelabelId" = $4;
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    type,
                    refId,
                    clientId,
                    whitelabelId
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "getByClientTypeRefId",
            request
        );
        throw new Error(error.message);
    }
}

const insertClientLikeDislikeActivityQuery = async (request, fastify) => {
    try {
        const { type, refId, clientId, isLike, whitelabelId } = request.body;
        const result = await fastify.db.query(
            `
                WITH insert_data AS (
                    INSERT INTO "tblClientLikeDislikeActivity"
                        ("wrType", "wrRefId", "wrClientId", "wrIsLike", "wrCreatedAt", "wrWhitelabelId") 
                    VALUES
                        ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                )
                SELECT
                    tclda."wrId" as "id",
	                tclda."wrType" as "type",
	                tclda."wrRefId" as "refId",
                    tclda."wrClientId" as "clientId",
                    tc."wrClientName" as "clientName",
                    tc."wrUserName" as "clientUserName",
                    tclda."wrIsLike" as "isLike",
                    tclda."wrCreatedAt" as "createdAt",
                    tclda."wrUpdatedAt" as "updatedAt",
                    tclda."wrWhitelabelId" as "whitelabelId"
                FROM insert_data tclda
                LEFT JOIN "tblClient" tc ON tc."wrClientID" = tclda."wrClientId"
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    type,
                    refId,
                    clientId,
                    isLike,
                    new Date(),
                    whitelabelId
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "insertClientLikeDislikeActivityQuery",
            request
        );
        throw new Error(error.message);
    }
}

const updateClientLikeDislikeActivityQuery = async (request, fastify) => {
    try {
        const { id, isLike } = request.body;
        const result = await fastify.db.query(
            `
                WITH updated_data AS (
                    UPDATE "tblClientLikeDislikeActivity"
                    SET
                        "wrIsLike" = $1,
                        "wrUpdatedAt" = $2
                    WHERE
                        "wrId" = $3
                    RETURNING *
                )
                SELECT
                    tclda."wrId" as "id",
	                tclda."wrType" as "type",
	                tclda."wrRefId" as "refId",
                    tclda."wrClientId" as "clientId",
                    tc."wrClientName" as "clientName",
                    tc."wrUserName" as "clientUserName",
                    tclda."wrIsLike" as "isLike",
                    tclda."wrCreatedAt" as "createdAt",
                    tclda."wrUpdatedAt" as "updatedAt",
                    tclda."wrWhitelabelId" as "whitelabelId"
                FROM updated_data tclda
                LEFT JOIN "tblClient" tc ON tc."wrClientID" = tclda."wrClientId"
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    isLike,
                    new Date(),
                    id
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "insertClientLikeDislikeActivityQuery",
            request
        );
        throw new Error(error.message);
    }
}

const getlikeDislikeByTypeRefIdQuery = async (request, fastify) => {
    try {
        const { type, refId, whitelabelId } = request.body;
        const result = await fastify.db.query(
            `
                SELECT
                    "wrWhitelabelId" AS "whitelabelId",
                    COUNT(*) FILTER (WHERE "wrIsLike" = true)::int AS "likeCount",
                    COUNT(*) FILTER (WHERE "wrIsLike" = false)::int AS "dislikeCount"
                FROM "tblClientLikeDislikeActivity"
                WHERE "wrType" = $1
                    AND "wrRefId" = $2
                    AND "wrWhitelabelId" = ANY($3)
                GROUP BY "wrWhitelabelId"
                ORDER BY "wrWhitelabelId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    type,
                    refId,
                    whitelabelId
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "getlikeDislikeByTypeRefIdQuery",
            request
        );
        throw new Error(error.message);
    }
}

module.exports = {
    getAllClientLikeDislikeActivityQuery,
    getByClientTypeRefIdQuery,
    insertClientLikeDislikeActivityQuery,
    updateClientLikeDislikeActivityQuery,
    getlikeDislikeByTypeRefIdQuery
}