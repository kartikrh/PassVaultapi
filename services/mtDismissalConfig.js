const { getAllMTDismissalConfigQuery } = require("../repository/TableMTDismissalConfig");

const getAllMTDismissalConfigService = async (request, fastify) => {
    const { marketTemplateId } = request.body;
    const overType = global.tblOverTypes || [];
    const bowlingStyle = global.tblBowlingTypes || [];
    const eventMarkets = (global.tblEventMarketsV2 || [])
      .filter(item => item.marketTemplateId === marketTemplateId)
      .map(elem => elem.eventMarketId);
    const runners = (global.tblMarketRunnerV2 || [])
      .filter(item => eventMarkets.includes(item.eventMarketId));
    const dismissal = await getAllMTDismissalConfigQuery(fastify);
    const dismissalData = (dismissal || [])
      .filter(item => item.marketTemplateId === marketTemplateId);

    return {
        overType,
        bowlingStyle,
        runners,
        dismissalData,
    };
};

module.exports = {
    getAllMTDismissalConfigService
}