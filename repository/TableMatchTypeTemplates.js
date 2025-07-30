const { errorLogger } = require("../utilities/logger");

const getAllMatchTypeTemplatesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrMatchTypeId" as "matchTypeId",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM "tblMatchTypeTemplates"`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/getAllMatchTypeTemplatesQuery",
            null
        );
        throw new Error(err.message);
    }
};

const insertMatchTypeTemplatesQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblMatchTypeTemplates" (
            "wrMarketTemplateId", "wrMatchTypeId", "wrCreatedBy", "wrCreatedAt"
            ) 
            VALUES (
                $1, $2, $3, NOW()
            ) 
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrMatchTypeId" as "matchTypeId",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.marketTemplateId,
                    data.matchTypeId,
                    request.userTokenInfo.WrUserId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/insertMatchTypeTemplatesQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteMatchTypeTemplatesQuery = async (id, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblMatchTypeTemplates" 
            WHERE "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/deleteMatchTypeTemplatesQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteTemplatesByMatchTypeIdQuery = async (matchTypeId, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblMatchTypeTemplates" 
            WHERE "wrMatchTypeId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [matchTypeId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/deleteTemplatesByMatchTypeIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

const deleteTemplatesByMatchTypeIdAndTempIdQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblMatchTypeTemplates" 
            WHERE "wrMatchTypeId" = ANY ($1)
            AND "wrMarketTemplateId" = $2`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [data.matchTypeId, data.marketTemplateId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/deleteTemplatesByMatchTypeIdAndTempIdQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteMatchTypeTempByMarketTemplateIdQuery = async (marketTemplateId, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblMatchTypeTemplates" 
            WHERE "wrMarketTemplateId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [marketTemplateId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/deleteMatchTypeTempByMarketTemplateIdQuery",
            request
        );
        throw new Error(err.message);
    }
};
const saveTemplateQuery = async (data, fastify, request) => {
    try {
        let values = [];
        if (data.templateIds && data.templateIds.length > 0) {
            values = data.templateIds.map((templateId) => ({
                marketTemplateId: templateId,
                matchTypeId: data.matchTypeId,
                createdBy: request.userTokenInfo.WrUserId,
            }));
        }
        if (values.length === 0) {
            return [];
        }
        const result = await fastify.db.query(
            `WITH insert_data AS (
                INSERT INTO "tblMatchTypeTemplates" (
                    "wrMarketTemplateId", "wrMatchTypeId", "wrCreatedBy", "wrCreatedAt"
                ) 
                VALUES
                ${
                    values.map((a)=> `(${a.marketTemplateId}, ${a.matchTypeId}, ${a.createdBy}, NOW())`).join(", "  )
                }
                RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrMatchTypeId" as "matchTypeId",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind : []
            }
        );
        return result;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/saveTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
};
const dltTemplateQuery = async (data, fastify, request) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblMatchTypeTemplates" 
            WHERE "wrId" = ANY ($1)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [data.ids],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableMatchTypeTemplates.js/dltTemplateQuery",
            request
        );
        throw new Error(err.message);
    }
};
module.exports = {
    getAllMatchTypeTemplatesQuery,
    insertMatchTypeTemplatesQuery,
    deleteMatchTypeTemplatesQuery,
    deleteTemplatesByMatchTypeIdQuery,
    deleteMatchTypeTempByMarketTemplateIdQuery,
    deleteTemplatesByMatchTypeIdAndTempIdQuery,
    saveTemplateQuery,
    dltTemplateQuery
};