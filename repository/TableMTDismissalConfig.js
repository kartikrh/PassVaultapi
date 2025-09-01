const { errorLogger } = require("../utilities/logger");

const getAllMTDismissalConfigQuery = async (fastify) => {
    return await fastify.db.query(
        `select 
            "wrId" as "id",
            "wrMarketTemplateId" as "marketTemplateId",
            "wrMarketTemplateRunnerId" as "marketTemplateRunnerId",
            "wrRunnerName" as "runnerName",
            "wrOverTypeId" as "overType",
            "wrBowlingStyle" as "bowlingStyle",
            "wrPredefinedValue" as "predefinedValue",
            "wrImpactProb" as "impactProb"
        from "tblMTDismissalConfig"
        `,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

module.exports = {
    getAllMTDismissalConfigQuery,
}