const { errorLogger } = require("../utilities/logger");

const getAllMarketTemplateRunnerQuery = async (fastify) => {
    return await fastify.db.query(
        `
            SELECT  
                "wrId" as "marketTemplateRunnerId",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize",
                "wrPredefinedValue" as "predefinedValue"
            FROM "tblMarketTemplateRunners"
            WHERE "wrIsDeleted" = false;
        `,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    )
};
const createMarketTemplateRunnerQuery = async (request, fastify) => {
    try {
        const query = `
            with count_parent as (
                select count(*) as count from "tblMarketTemplateRunners" where "wrMarketTemplateId" = $1
            ),
            insert_data as (
                INSERT INTO "tblMarketTemplateRunners"
                (
                    "wrMarketTemplateId",
                    "wrRunner",
                    "wrLine",
                    "wrOverRate",
                    "wrUnderRate",
                    "wrLastUpdate",
                    "wrSelectionId",
                    "wrOrder",
                    "wrBackPrice",
                    "wrLayPrice",
                    "wrBackSize",
                    "wrLaySize",
                    "wrPredefinedValue"
                )
                select $1,$2,$3,$4,$5,now(),
                ($1 || '0' || ((SELECT count FROM count_parent) + 1)::TEXT),
                (select count from count_parent) + 1,
                $6,$7,$8,$9,$10
                RETURNING 
                    "wrId" as "marketTemplateRunnerId",
                    "wrMarketTemplateId" as "marketTemplateId",
                    "wrRunner" as "runner",
                    "wrLine" as "line",
                    "wrOverRate" as "overRate",
                    "wrUnderRate" as "underRate",
                    "wrLastUpdate" as "lastUpdate",
                    "wrSelectionId" as "selectionId",
                    "wrOrder" as "order",
                    "wrBackPrice" as "backPrice",
                    "wrLayPrice" as "layPrice",
                    "wrBackSize" as "backSize",
                    "wrLaySize" as "laySize",
                    "wrPredefinedValue" as "predefinedValue"
            )
            select * from insert_data  
        `;
        const result = await fastify.db.query(
            query,
            {
                bind: [
                    request.body.marketTemplateId,
                    request.body.runner,
                    request.body.line,
                    request.body.overRate,
                    request.body.underRate,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0,
                    request.body.predefinedValue,

                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/createMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
};
const updateMarketTemplateRunnerQuery   = async (request, fastify) => {
    try {
        const query = `
            UPDATE "tblMarketTemplateRunners"	
            SET 
                "wrRunner" = $2,
                "wrLine" = $3,
                "wrOverRate" = $4,
                "wrUnderRate" = $5,
                "wrLastUpdate" = now(),
                "wrBackPrice" = $6,
                "wrLayPrice" = $7,
                "wrBackSize" = $8,
                "wrLaySize" = $9,
                "wrPredefinedValue" = $10
            WHERE "wrId" = $1
            RETURNING 
                "wrId" as "marketTemplateRunnerId",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize",
                "wrPredefinedValue" as "predefinedValue"
        `;

        const result = await fastify.db.query(
            query,
            {
                bind: [
                    request.body.marketTemplateRunnerId,
                    request.body.runner,
                    request.body.line,
                    request.body.overRate,
                    request.body.underRate,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0,
                    request.body.predefinedValue,
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/createMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
};
const deleteMarketTemplateRunnerQuery = async (request, fastify) => {
    try {
        const query = `
            UPDATE "tblMarketTemplateRunners" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrId" = ANY($3)
        `;

        await fastify.db.query(
            query,
            {
                bind: [true, request.userTokenInfo.WrUserId, request.body.marketTemplateRunnerId],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TablemarketTemplateRunner/deleteMarketTemplateRunnerQuery",
            request
        );
        throw new Error(err.message);
    }
}

module.exports = {
    getAllMarketTemplateRunnerQuery,
    createMarketTemplateRunnerQuery,
    updateMarketTemplateRunnerQuery,
    deleteMarketTemplateRunnerQuery
};

