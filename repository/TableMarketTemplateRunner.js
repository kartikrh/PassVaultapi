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
                "wrYesRate" as "yesRate",
                "wrYesPoint" as "yesPoint",
                "wrNoRate" as "noRate",
                "wrNoPoint" as "noPoint",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
            FROM "tblMarketTemplateRunners"
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
                    "wrYesRate",
                    "wrYesPoint",
                    "wrNoRate",
                    "wrNoPoint",
                    "wrLastUpdate",
                    "wrSelectionId",
                    "wrOrder",
                    "wrBackPrice",
                    "wrLayPrice",
                    "wrBackSize",
                    "wrLaySize"
                )
                select $1,$2,$3,$4,$5,$6,$7,$8,$9,now(),
                ($1 || '0' || ((SELECT count FROM count_parent) + 1)::TEXT),
                (select count from count_parent) + 1,
                $10,$11,$12,$13
                RETURNING 
                    "wrId" as "marketTemplateRunnerId",
                    "wrMarketTemplateId" as "marketTemplateId",
                    "wrRunner" as "runner",
                    "wrLine" as "line",
                    "wrOverRate" as "overRate",
                    "wrUnderRate" as "underRate",
                    "wrYesRate" as "yesRate",
                    "wrYesPoint" as "yesPoint",
                    "wrNoRate" as "noRate",
                    "wrNoPoint" as "noPoint",
                    "wrLastUpdate" as "lastUpdate",
                    "wrSelectionId" as "selectionId",
                    "wrOrder" as "order",
                    "wrBackPrice" as "backPrice",
                    "wrLayPrice" as "layPrice",
                    "wrBackSize" as "backSize",
                    "wrLaySize" as "laySize"
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
                    request.body.yesRate || 0,
                    request.body.yesPoint || 0,
                    request.body.noRate || 0,
                    request.body.noPoint || 0,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0,

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
                "wrYesRate" = $6,
                "wrYesPoint" = $7,
                "wrNoRate" = $8,
                "wrNoPoint" = $9,
                "wrLastUpdate" = now(),
                "wrBackPrice" = $10,
                "wrLayPrice" = $11,
                "wrBackSize" = $12,
                "wrLaySize" = $13
            WHERE "wrId" = $1
            RETURNING 
                "wrId" as "marketTemplateRunnerId",
                "wrMarketTemplateId" as "marketTemplateId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrYesRate" as "yesRate",
                "wrYesPoint" as "yesPoint",
                "wrNoRate" as "noRate",
                "wrNoPoint" as "noPoint",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize"
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
                    request.body.yesRate || 0,
                    request.body.yesPoint || 0,
                    request.body.noRate || 0,
                    request.body.noPoint || 0,
                    request.body.backPrice || 0,
                    request.body.layPrice || 0,
                    request.body.backSize || 0,
                    request.body.laySize || 0
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
            DELETE FROM "tblMarketTemplateRunners"
            WHERE "wrId" = ANY($1)
        `;

        await fastify.db.query(
            query,
            {
                bind: [request.body.marketTemplateRunnerId],
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

