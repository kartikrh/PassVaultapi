const { errorLogger } = require("../utilities/logger");

const getAllMatchTypeTemplatesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                tmtt."wrId" as "id",
                tmtt."wrMarketTemplateId" as "marketTemplateId",
                tmt."wrDevTemplateName" as "devTemplateName",
                tmtt."wrMatchTypeId" as "matchTypeId",
                tm."wrMatchType" as "matchType",
                tmtt."wrCreatedBy" as "createdBy",
                tmtt."wrCreatedAt" as "createdAt"
            FROM "tblMatchTypeTemplates" tmtt
            LEFT JOIN "tblMarketTemplates" tmt ON tmt."wrID" = tmtt."wrMarketTemplateId"
            LEFT JOIN "tblMatchTypes" tm ON tm."wrMatchTypeId" = tmtt."wrMatchTypeId"`,
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
                tmtt."wrId" as "id",
                tmtt."wrMarketTemplateId" as "marketTemplateId",
                tmt."wrDevTemplateName" as "devTemplateName",
                tmtt."wrMatchTypeId" as "matchTypeId",
                tm."wrMatchType" as "matchType",
                tmtt."wrCreatedBy" as "createdBy",
                tmtt."wrCreatedAt" as "createdAt"
            FROM insert_data tmtt
            LEFT JOIN "tblMarketTemplates" tmt ON tmt."wrID" = tmtt."wrMarketTemplateId"
            LEFT JOIN "tblMatchTypes" tm ON tm."wrMatchTypeId" = tmtt."wrMatchTypeId";`,
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

module.exports = {
    getAllMatchTypeTemplatesQuery,
    insertMatchTypeTemplatesQuery,
    deleteMatchTypeTemplatesQuery,
    deleteTemplatesByMatchTypeIdQuery,
    deleteMatchTypeTempByMarketTemplateIdQuery,
};