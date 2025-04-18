function processOddEven(data) {
    const { total_score } = data?.predictscore || {};
    if (typeof total_score !== 'number') return { error: 'Invalid score data' };

    const result = total_score % 2 === 0 ? 'Even' : 'Odd';
    return {
        market: 'odd-even',
        value: result,
        total_score,
    };
}
// Else scenario
const generateExtraMarketFromTemplate = (template, team, commentary) => {
    return {
        eventMarketId: 0,
        isCreate: true,
        status: "1",
        margin: template.margin,
        data: "",
        playerId: null,
        ...template,
        commentaryId: commentary.commentaryId,
        eventRefId: commentary.eventRefId,
        marketName: `${template.templateName} - ${team.shortName}`,
        defaultBackSize: template?.defaultBackSize,
        defaultLaySize: template?.defaultLaySize,
        lineType: template?.lineType,
        teamId: null,
        inningsId: 1,
        isActive: template?.isDefaultMarketActive || false,
        isAllow: template.isDefaultBetAllowed || false,
        index: 0,
        rateDiff: template?.rateDiff,
        runners: template.runners?.map(runner => ({
            ...runner,
            runnerId: runner.runnerId || "0",
            backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
            laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
        })) || []
    };
};

module.exports = { processOddEven };