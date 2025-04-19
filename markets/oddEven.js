
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
const processLotteryMarkets = (market, teams, processedMarketsObj, matchType ,commentary) => {
    const ballsToOvers = (value, matchTypeId) => {
        const LD_OVER_BALLS = { "2": 6 };
        const ballsPerOver = LD_OVER_BALLS[`${matchTypeId}`];
        if (parseInt(value) === 0) return 0.0;
        const over = ((value - ballsPerOver) / ballsPerOver) + ballsPerOver / 10;
        return parseFloat(over.toFixed(2));
    };

    const maxOvers = market.maxOvers || matchType?.maxOversInFirstInings || 5;
    const startOver = parseInt(market.over) || 2;
    const diff = startOver;
    const autoclose = parseFloat(market.beforeAutoClose) || 6;
    const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;
    const autocreate = parseFloat(market.create) || 6;
    const autoopen = parseFloat(market.autoOpen) || 6;
    const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
    const notincludedover = market.notIncludedOver ?
        market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
    const matchTypeId = market.matchTypeID || 2;

    teams.forEach(team => {
        let nextopen = 0.0;
        let nextcreate = 0.0;
        let noOfMarketsCreated = 0;
        let nextaddmarket = 0;

        for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
            if (notincludedover.includes(currentOver)) continue;

            // Calculate updated values based on current over
            const updatedValues = {
                beforeAutoClose: ballsToOvers((currentOver * 6 - autoclose), matchTypeId),
                beforeAutoSuspend: ballsToOvers((currentOver * 6 - autosuspend), matchTypeId)
            };

            // Determine create and autoOpen values based on howManyOpenMarkets
            if (howManyOpenMarkets === 1) {
                updatedValues.create = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId);
                updatedValues.autoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId);
            } else {
                updatedValues.create = nextcreate;
                updatedValues.autoOpen = nextopen;
                noOfMarketsCreated++;

                if (noOfMarketsCreated === howManyOpenMarkets) {
                    noOfMarketsCreated--;
                    nextcreate = Math.floor(nextaddmarket) + (autocreate / 10);
                    nextopen = Math.floor(nextaddmarket) + (autoopen / 10);
                    nextaddmarket++;
                }
            }

            // Create market for current over
            const marketName = market.templateName.replace("{x}", currentOver) + " - " + team.shortName;
            const specialMarket = {
                ...market,
                over: currentOver.toString(),
                marketName,
                teamId: team.teamId,
                beforeAutoClose: updatedValues.beforeAutoClose.toString(),
                beforeAutoSuspend: updatedValues.beforeAutoSuspend.toString(),
                create: updatedValues.create.toString(),
                autoOpen: updatedValues.autoOpen.toString(),
                runners: market.runners?.map(runner => ({
                    marketTemplateRunnerId: runner.marketTemplateRunnerId,
                    marketTemplateId: market.marketTemplateId,
                    runner: runner.runner,
                    line: runner.line,
                    overRate: runner.overRate,
                    underRate: runner.underRate,
                    lastUpdate: new Date().toISOString(),
                    selectionId: runner.selectionId,
                    order: runner.order,
                    backPrice: runner.backPrice,
                    layPrice: runner.layPrice,
                    backSize: market.isPredefineRunnerValue ? runner.backSize : market.defaultBackSize,
                    laySize: market.isPredefineRunnerValue ? runner.laySize : market.defaultLaySize,
                    predefinedValue: runner.predefinedValue,
                    runnerId: runner.runnerId || 0
                })) || []
            };

            processMarketAndRunnersOfOE(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj , commentary);
        }
    });
};
const processMarketAndRunnersOfOE = (market, teamId, keyPrefix, processedMarketsObj , commentary) => {
    const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

    if (!processedMarketsObj[baseKey]) {
        processedMarketsObj[baseKey] = [];
    }
    let marketArrObj = global.marketData[commentary.commentaryId].markets;
    // Special handling for marketTypeId=5 and marketTypeCategoryId=6
    let marketRunners = [];
    if (market.marketTypeId === 5 && market.marketTypeCategoryId === 6) {
        // Get team names from commentary object instead of marketData
        const team1Name = commentary?.team1Name || 'Team1';
        const team2Name = commentary?.team2Name || 'Team2';

        // For each template runner, create two runners (one for each team)
        if (market.runners && market.runners.length > 0) {
            market.runners.forEach(templateRunner => {
                // Create runner for team 1
                const team1Runner = {
                    ...templateRunner,
                    marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                    runnerId: templateRunner.runnerId || 0,
                    marketTemplateId: market.marketTemplateId,
                    runner: templateRunner.runner.replace("{team}", team1Name),
                    line: templateRunner.line,
                    overRate: templateRunner.overRate,
                    underRate: templateRunner.underRate,
                    lastUpdate: new Date().toISOString(),
                    selectionId: `${templateRunner.selectionId}_1`,
                    order: templateRunner.order * 2 - 1,
                    backPrice: templateRunner.backPrice,
                    layPrice: templateRunner.layPrice,
                    backSize: templateRunner.backSize || market.defaultBackSize,
                    laySize: templateRunner.laySize || market.defaultLaySize,
                };

                // Create runner for team 2
                const team2Runner = {
                    ...templateRunner,
                    marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                    runnerId: templateRunner.runnerId || 0,
                    marketTemplateId: market.marketTemplateId,
                    runner: templateRunner.runner.replace("{team}", team2Name),
                    line: templateRunner.line,
                    overRate: templateRunner.overRate,
                    underRate: templateRunner.underRate,
                    lastUpdate: new Date().toISOString(),
                    selectionId: `${templateRunner.selectionId}_2`,
                    order: templateRunner.order * 2,
                    backPrice: templateRunner.backPrice,
                    layPrice: templateRunner.layPrice,
                    backSize: templateRunner.backSize || market.defaultBackSize,
                    laySize: templateRunner.laySize || market.defaultLaySize,
                };

                marketRunners.push(team1Runner, team2Runner);
            });
        }
    }
    else if (market.marketTypeCategoryId === 28) {
        marketRunners = market.runners?.map(runner => ({
            marketTemplateRunnerId: runner.marketTemplateRunnerId,
            marketTemplateId: runner.marketTemplateId,
            runner: runner.runner,
            line: runner.line,
            overRate: runner.overRate,
            underRate: runner.underRate,
            lastUpdate: new Date().toISOString(),
            selectionId: runner.selectionId,
            order: runner.order,
            backPrice: runner.backPrice,
            layPrice: runner.layPrice,
            backSize: runner.backSize,
            laySize: runner.laySize,
            predefinedValue: runner.predefinedValue,
            runnerId: runner.runnerId || 0
        })) || [];
    }
    else if (market.marketTypeCategoryId === 26) {
        // Handle LDO and Lottery markets
        marketRunners = market.runners?.map(runner => ({
            ...runner,  // Spread the original runner properties
            runnerId: runner.runnerId || "0",
            // Make sure each property is explicitly copied
            marketTemplateRunnerId: runner.marketTemplateRunnerId,
            marketTemplateId: market.marketTemplateId,
            runner: runner.runner,
            line: runner.line,
            overRate: runner.overRate,
            underRate: runner.underRate,
            lastUpdate: new Date().toISOString(),
            selectionId: runner.selectionId,
            order: runner.order,
            backPrice: runner.backPrice,
            layPrice: runner.layPrice,
            backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
            laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
            predefinedValue: runner.predefinedValue
        })) || [];
    } else {
        // Default runner handling for other market types
        if (!market.runners || market.runners.length === 0) {
            marketRunners = [{
                marketTemplateRunnerId: 0,
                runnerId: 0,
                marketTemplateId: market.marketTemplateId,
                runner: market?.marketName,
                line: market.defaultLine || null,
                overRate: null,
                underRate: null,
                lastUpdate: new Date().toISOString(),
                selectionId: `${market.marketTemplateId}01`,
                order: 1,
                backPrice: null,
                layPrice: null,
                backSize: market?.defaultBackSize,
                laySize: market?.defaultLaySize,
            }];
        } else {
            marketRunners = market.runners;
        }
    }

    global.marketData[commentary.commentaryId].markets.push({
        ...market,
        teamId,
        eventMarketId: market.eventMarketId || 0,
        isCreate: market.isCreate !== undefined ? market.isCreate : true,
        status: market.status || 1,
        margin: parseFloat(market.margin) || 3,
        data: market.data || "",
        playerId: market.playerId || null,
        isActive: market.isActive !== undefined ? market.isActive : true,
        isAllow: market.isAllow !== undefined ? market.isAllow : false,
        inningsId: market.inningsId || 1,
        index: market.index || 0,
        commentaryId: market.commentaryId,
        eventRefId: market.eventRefId,
        isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
        runners: marketRunners
    });
    // processedMarketsObj[baseKey].push({
    //     ...market,
    //     teamId,
    //     eventMarketId: market.eventMarketId || 0,
    //     isCreate: market.isCreate !== undefined ? market.isCreate : true,
    //     status: market.status || "1",
    //     margin: parseFloat(market.margin) || 3,
    //     data: market.data || "",
    //     playerId: market.playerId || null,
    //     isActive: market.isActive !== undefined ? market.isActive : true,
    //     isAllow: market.isAllow !== undefined ? market.isAllow : false,
    //     inningsId: market.inningsId || 1,
    //     index: market.index || 0,
    //     commentaryId: market.commentaryId,
    //     eventRefId: market.eventRefId,
    //     isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
    //     runners: marketRunners
    // });

    return global.marketData[commentary.commentaryId].markets;
};

module.exports = { processOddEven ,processLotteryMarkets,processMarketAndRunnersOfOE };