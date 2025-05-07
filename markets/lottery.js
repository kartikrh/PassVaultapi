
function processMarketAndRunnersOfOE(market, teamId, keyPrefix, processedMarketsObj, commentary) {
    const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}_##_${market.over}`;

    if (!processedMarketsObj[baseKey]) {
        processedMarketsObj[baseKey] = [];
    }

    // If marketData for this commentary doesn't exist, create it
    if (!global.marketData[commentary.commentaryId]) {
        global.marketData[commentary.commentaryId] = { markets: [] };
    }

    // Check if this market already exists in the global state to avoid duplicates
    const existingMarketIndex = global.marketData[commentary.commentaryId].markets.findIndex(m =>
        m.marketTypeCategoryId === market.marketTypeCategoryId &&
        m.over.toString() === market.over.toString() &&
        m.teamId === teamId
    );

    // If market already exists, don't add a duplicate
    if (existingMarketIndex !== -1) {
        console.log(`Market already exists for over ${market.over} and category ${market.marketTypeCategoryId}, skipping`);
        return global.marketData[commentary.commentaryId].markets;
    }

    // Process runners based on market type
    let marketRunners = [];

    if (market.marketTypeCategoryId === 35) {
        // Odd/Even market - should always have exactly 2 runners: Odd and Even
        marketRunners = market.runners?.filter(r =>
            r.runner.toLowerCase() === "odd" || r.runner.toLowerCase() === "even"
        ).map(runner => ({
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
            backSize: runner.backSize,
            laySize: runner.laySize,
            predefinedValue: runner.predefinedValue,
            runnerId: runner.runnerId || 0
        })) || [];

        // Ensure we have exactly 2 runners for odd-even markets
        if (marketRunners.length !== 2) {
            console.warn(`Odd-Even market for over ${market.over} has ${marketRunners.length} runners, expected 2`);

            // If we don't have the right runners, add the default ones
            if (!marketRunners.find(r => r.runner.toLowerCase() === "odd")) {
                marketRunners.push({
                    runner: "ODD",
                    line: 1.9,
                    overRate: 1.9,
                    underRate: 1.9,
                    backPrice: 1.9,
                    layPrice: 1.9,
                    backSize: market.defaultBackSize || 10000,
                    laySize: market.defaultLaySize || 10000,
                    selectionId: "odd",
                    runnerId: 0
                });
            }

            if (!marketRunners.find(r => r.runner.toLowerCase() === "even")) {
                marketRunners.push({
                    runner: "EVEN",
                    line: 1.9,
                    overRate: 1.9,
                    underRate: 1.9,
                    backPrice: 1.9,
                    layPrice: 1.9,
                    backSize: market.defaultBackSize || 10000,
                    laySize: market.defaultLaySize || 10000,
                    selectionId: "even",
                    runnerId: 0
                });
            }
        }
    } else if (market.marketTypeCategoryId === 28) {
        // Lottery market - should have all numerical runners (usually 0-9)
        marketRunners = market.runners?.map(runner => ({
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
        })) || [];

        // Verify we have the expected number of runners for a lottery market
        if (marketRunners.length < 9) {
            console.warn(`Lottery market for over ${market.over} has only ${marketRunners.length} runners`);
        }
    }

    // Add market to global object with a properly structured object
    const marketObj = {
        ...market,
        teamId,
        eventMarketId: market.eventMarketId || 0,
        isCreate: market.isCreate !== undefined ? market.isCreate : true,
        status: parseInt(market.status) || 1,
        margin: parseFloat(market.margin) || 3,
        data: market.data || "",
        playerId: market.playerId || null,
        isActive: market.isActive !== undefined ? market.isActive : true,
        isAllow: market.isAllow !== undefined ? market.isAllow : false,
        inningsId: market.inningsId || 1,
        index: market.index || 0,
        commentaryId: commentary.commentaryId,
        eventRefId: market.eventRefId || commentary.eventRefId,
        isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
        runners: marketRunners,
        // Ensure these are set properly for the ball-to-action map
        over: market.over.toString(),
        createBalls: parseInt(market.createBalls) || 0,
        autoOpenBalls: parseInt(market.autoOpenBalls) || 0,
        beforeAutoSuspendBalls: parseInt(market.beforeAutoSuspendBalls) || 0,
        beforeAutoCloseBalls: parseInt(market.beforeAutoCloseBalls) || 0,
        overBalls: parseInt(market.overBalls) || 0,
        isAutoResultSet: market.isAutoResultSet === true || market.isAutoResultSet === "true",
        wrAutoResultafterBall: parseInt(market.wrAutoResultafterBall) || 0
    };

    global.marketData[commentary.commentaryId].markets.push(marketObj);
    console.log(`Added ${market.marketTypeCategoryId === 35 ? 'Odd-Even' : 'Lottery'} market for over ${market.over} with ${marketRunners.length} runners`);

    return global.marketData[commentary.commentaryId].markets;
}

function processLotteryMarkets(market, teams, processedMarketsObj, matchType, commentary) {
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
    const isOddEvenMarket = market.marketTypeCategoryId === 35;
    const isLotteryMarket = market.marketTypeCategoryId === 28;

    // Log what type of market we're processing
    console.log(`Processing ${isOddEvenMarket ? 'Odd-Even' : isLotteryMarket ? 'Lottery' : 'Other'} markets for ${teams.length} teams`);

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

            // Create market for current over - keep the original marketTypeCategoryId
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
                // Keep the original market category ID
                marketTypeCategoryId: market.marketTypeCategoryId,
                // Only include appropriate runners for the market type
                runners: isOddEvenMarket ?
                    market.runners?.filter(r =>
                        r.runner.toLowerCase() === "odd" || r.runner.toLowerCase() === "even"
                    ).map(runner => ({
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
                    })) : market.runners?.map(runner => ({
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

            processMarketAndRunnersOfOE(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentary);
        }
    });
}

module.exports = {
    processLotteryMarkets,
};