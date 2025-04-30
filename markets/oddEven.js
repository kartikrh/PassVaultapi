// oddEven.js
const { EventMarketStatus } = require('../utilities');
const { ballsToOvers } = require('./ballToActionMapper');

/**
 * Process Odd/Even markets
 * @param {Object} data - The prediction score data
 */
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

/**
 * Helper function to determine if a market should be opened or closed based on total balls
 * @param {Object} market - The market to check
 * @param {number} totalBalls - The total balls played
 * @param {number} totalWicket - The total wickets fallen
 * @returns {Object} - Updated market and update flag
 */
function openCloseMarket(market, totalBalls, totalWicket) {
    let isUpdate = false;

    // Create/Open/Suspend/Close based on ball count
    const createBalls = market.createBalls || 0;
    const autoOpenBalls = market.autoOpenBalls || 0;
    const beforeAutoSuspendBalls = market.beforeAutoSuspendBalls || 0;
    const beforeAutoCloseBalls = market.beforeAutoCloseBalls || 0;

    // If market should be created
    if (totalBalls >= createBalls && market.status === EventMarketStatus.NotCreated) {
        market.status = EventMarketStatus.Inactive;
        isUpdate = true;
    }

    // If market should be opened
    if (totalBalls >= autoOpenBalls &&
        market.status === EventMarketStatus.Inactive) {
        market.status = EventMarketStatus.Open;
        isUpdate = true;
    }

    // If market should be suspended
    if (totalBalls >= beforeAutoSuspendBalls &&
        market.status === EventMarketStatus.Open) {
        market.status = EventMarketStatus.Suspend;
        isUpdate = true;
    }

    // If market should be closed
    if (totalBalls >= beforeAutoCloseBalls &&
        (market.status === EventMarketStatus.Open ||
            market.status === EventMarketStatus.Suspend)) {
        market.status = EventMarketStatus.Close;
        isUpdate = true;
    }

    return { updatedMarket: market, isUpdate };
}

/**
 * Process all odd-even markets for the current ball
 * @param {Object} data - The prediction score data
 */
function processOddEvenMarkets(
    currentBall,
    run,
    commentaryId,
    currentScore,
    strikeTeamId,
    matchTypeId,
    isWicket,
    totalWicket,
    ballByBallId) {

    // Convert to total balls
    const totalBalls = oversToBalls(parseFloat(currentBall), matchTypeId);

    // Get markets for this commentary
    if (!global.marketData || !global.marketData[commentaryId]) {
        console.log(`No market data found for commentary ID: ${commentaryId}`);
        return;
    }

    // Find odd-even markets
    const allMarkets = global.marketData[commentaryId].markets;
    const oddEvenMarkets = allMarkets.filter(
        market => market.marketTypeCategoryId === 28
    );

    if (!oddEvenMarkets || oddEvenMarkets.length === 0) {
        console.log(`No odd-even markets found for commentary ID: ${commentaryId}`);
        return;
    }

    // Process each odd-even market
    const runnerData = [];
    const eventData = [];
    const marketDatalog = [];
    const socketData = [];
    const wicketDeduction = 1;

    for (const market of oddEvenMarkets) {
        // Skip already settled markets or markets not yet created
        if (market.status === EventMarketStatus.Settled || totalBalls < market.createBalls) {
            continue;
        }

        // Check if market needs status update
        let selectionStatus = EventMarketStatus.NotCreated;
        let isUpdate = false;
        let isSendData = true;

        // Reset from suspend if needed
        if (market.status === EventMarketStatus.Suspend) {
            market.status = EventMarketStatus.Open;
        }

        // Check for market status changes
        const { updatedMarket, isUpdate: statusChanged } = openCloseMarket(
            market, totalBalls, totalWicket
        );

        // Apply any wicket deduction if needed
        if (isWicket === 1) {
            updatedMarket.wrPredefinedValue -= wicketDeduction;
        }

        // Update the market
        Object.assign(market, updatedMarket);
        isUpdate = statusChanged;

        // Process auto-settlement if needed
        if (market.isOver &&
            ((market.status === EventMarketStatus.Open ||
                market.status === EventMarketStatus.Inactive ||
                market.status === EventMarketStatus.Suspend) ||
                (market.status === EventMarketStatus.Close &&
                    totalBalls >= market.beforeAutoCloseBalls &&
                    totalBalls <= market.overBalls) ||
                (market.status === EventMarketStatus.Close &&
                    totalBalls === market.overBalls + market.wrAutoResultafterBall))) {

            // If status has changed
            if (isUpdate) {
                if (market.status === EventMarketStatus.Close) {
                    selectionStatus = EventMarketStatus.Close;
                } else if (market.status === EventMarketStatus.Open) {
                    selectionStatus = EventMarketStatus.Open;
                    isSendData = market.wrDefaultIsSendData;
                }

                // Check if it's time to settle
                if (totalBalls >= market.overBalls + market.wrAutoResultafterBall &&
                    market.isAutoResultSet &&
                    market.status === EventMarketStatus.Close &&
                    market.status !== EventMarketStatus.Settled) {

                    // Get runs for this over
                    const runs = currentScore; // Simplification - in real code would get specific over runs

                    // Determine winner (odd or even)
                    market.runners.forEach(runner => {
                        runner.wrSelectionStatus = ((runs % 2 === 0 && runner.runner.toLowerCase().includes("even")) ||
                            (runs % 2 !== 0 && runner.runner.toLowerCase().includes("odd")))
                            ? EventMarketStatus.Win : EventMarketStatus.Lose;

                        if (runner.wrSelectionStatus === EventMarketStatus.Win) {
                            market.wrResult = runner.runnerId;
                        }
                    });

                    selectionStatus = EventMarketStatus.Settled;
                    market.status = EventMarketStatus.Settled;
                    market.wrSettledTime = new Date().toISOString();
                }

                // Update data for socket/DB
                market.wrIsSendData = isSendData;

                // Prepare data for updates (simplified for this implementation)
                marketDatalog.push({
                    wrCommentaryId: commentaryId,
                    wrEventMarketId: market.eventMarketId,
                    wrData: JSON.stringify(market),
                    wrUpdateType: 1,
                    wrIsSendData: isSendData
                });

                socketData.push({
                    market: market.eventMarketId,
                    status: market.status,
                    runners: market.runners
                });
            }
        } else if (market.status === EventMarketStatus.Close &&
            parseFloat(currentBall) !== parseFloat(market.over) +
            (parseFloat(market.wrAutoResultafterBall) / 10)) {
            selectionStatus = EventMarketStatus.Close;
        } else if (market.status === EventMarketStatus.Suspend) {
            selectionStatus = EventMarketStatus.Suspend;
        }
    }

    // Send updates if needed
    if (marketDatalog.length > 0 && socketData.length > 0) {
        // In real implementation, would batch send to DB and socket
        console.log(`[ODD-EVEN] Updated ${marketDatalog.length} markets`);
    }

    return {
        updated: marketDatalog.length > 0,
        markets: oddEvenMarkets
    };
}

/**
 * Process lottery markets from template
 * @param {Object} market - The market template
 * @param {Array} teams - The teams array
 * @param {Object} processedMarketsObj - Object to store processed markets
 * @param {Object} matchType - Match type information
 * @param {Object} commentary - Commentary information
 */
function processLotteryMarkets(market, teams, processedMarketsObj, matchType, commentary) {
    const ballsToOvers = (value, matchTypeId) => {
        const LD_OVER_BALLS = { "2": 6 };
        const ballsPerOver = LD_OVER_BALLS[`${matchTypeId}`];
        if (parseInt(value) === 0) return 0.0;
        const over = ((value - ballsPerOver) / ballsPerOver) + ballsPerOver / 10;
        return parseFloat(over.toFixed(2));
    };

    // Get the configuration values with defaults to ensure proper market creation
    const maxOvers = market.maxOvers || matchType?.maxOversInFirstInings || 5;
    const startOver = parseInt(market.over) || 2;
    const diff = startOver;

    // For match start, set autoclose and autosuspend to be after the relevant over
    const autoclose = parseFloat(market.beforeAutoClose) || 6;
    const autosuspend = parseFloat(market.beforeAutoSuspend) || 6;

    // For match start, set autocreate and autoopen to be BEFORE the game starts (negative value)
    // This ensures markets are created at match start rather than waiting for first ball
    const autocreate = parseFloat(market.create) || -6; // Set to negative to ensure it happens at match start
    const autoopen = parseFloat(market.autoOpen) || -6; // Set to negative to ensure it happens at match start

    const howManyOpenMarkets = parseInt(market.howManyOpenMarkets) || 1;
    const notincludedover = market.notIncludedOver ?
        market.notIncludedOver.split(',').map(x => parseInt(x)) : [];
    const matchTypeId = market.matchTypeID || 2;

    // Log diagnostic info
    console.log(`[LOTTERY] Processing lottery markets: maxOvers=${maxOvers}, startOver=${startOver}`);
    console.log(`[LOTTERY] Market category: ${market.marketTypeCategoryId}`);
    console.log(`[LOTTERY] Using autoopen=${autoopen}, autoclose=${autoclose}`);

    teams.forEach(team => {
        let nextopen = -1.0; // Set to negative to ensure it happens at match start
        let nextcreate = -1.0; // Set to negative to ensure it happens at match start
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
                // Set to negative values for the first few overs to ensure they open at match start
                if (currentOver <= startOver + 2) { // First few overs
                    updatedValues.create = -1.0; // Before match starts
                    updatedValues.autoOpen = -1.0; // Before match starts
                } else {
                    updatedValues.create = ballsToOvers(((currentOver - diff) * 6 + autocreate - 6), matchTypeId);
                    updatedValues.autoOpen = ballsToOvers(((currentOver - diff) * 6 + autoopen - 6), matchTypeId);
                }
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
                // Critical fix: Set status to 2 (OPEN) for lottery markets, not 1 (INACTIVE)
                // This prevents them from being immediately closed
                status: 2, // OPEN
                // Fix: Ensure these properties are explicitly set for lottery markets
                isAutoResultSet: true,
                autoResultAfterBall: market.autoResultAfterBall || "0",
                // Set matchTypeID to ensure consistent ball calculations
                matchTypeID: matchTypeId,
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
                    runnerId: runner.runnerId || 0,
                    // Also set runner status to 2 (OPEN) to match market status
                    selectionStatus: 2 // OPEN
                })) || []
            };

            // Debug log created markets
            console.log(`[LOTTERY] Created ${specialMarket.marketTypeCategoryId} market for over ${currentOver}:`);
            console.log(`[LOTTERY] - marketName: ${specialMarket.marketName}`);
            console.log(`[LOTTERY] - status: ${specialMarket.status}`);
            console.log(`[LOTTERY] - autoOpen: ${specialMarket.autoOpen}`);
            console.log(`[LOTTERY] - beforeAutoClose: ${specialMarket.beforeAutoClose}`);
            console.log(`[LOTTERY] - isAutoResultSet: ${specialMarket.isAutoResultSet}`);
            console.log(`[LOTTERY] - autoResultAfterBall: ${specialMarket.autoResultAfterBall}`);

            processMarketAndRunnersOfOE(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj, commentary);
        }
    });
}

/**
 * Process market and runners for odd-even and lottery markets
 * @param {Object} market - The market template
 * @param {number} teamId - Team ID
 * @param {string} keyPrefix - Key prefix for processed markets
 * @param {Object} processedMarketsObj - Object to store processed markets
 * @param {Object} commentary - Commentary information
 */
function processMarketAndRunnersOfOE(market, teamId, keyPrefix, processedMarketsObj, commentary) {
    const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

    if (!processedMarketsObj[baseKey]) {
        processedMarketsObj[baseKey] = [];
    }

    // If marketData for this commentary doesn't exist, create it
    if (!global.marketData[commentary.commentaryId]) {
        global.marketData[commentary.commentaryId] = { markets: [] };
    }

    let marketArrObj = global.marketData[commentary.commentaryId].markets;

    // Handle runners based on market type
    let marketRunners = [];

    // Get appropriate status for runners based on market status
    const runnerStatus = market.status || 1;

    if (market.marketTypeCategoryId === 28 || market.marketTypeCategoryId === 35) {
        // Odd/Even or Lottery market
        marketRunners = market.runners?.map(runner => ({
            marketTemplateRunnerId: runner.marketTemplateRunnerId,
            marketTemplateId: runner.marketTemplateId || market.marketTemplateId,
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
            runnerId: runner.runnerId || 0,
            // Important: Use the market's status for the runner status
            selectionStatus: runner.selectionStatus || runnerStatus
        })) || [];
    } else if (market.marketTypeCategoryId === 26) {
        // LDO market
        marketRunners = market.runners?.map(runner => ({
            ...runner,
            runnerId: runner.runnerId || "0",
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
            predefinedValue: runner.predefinedValue,
            // Important: Use the market's status for the runner status
            selectionStatus: runner.selectionStatus || runnerStatus
        })) || [];
    }

    // Log the market being added
    console.log(`[PROCESS] Adding market ${market.marketName} with status ${market.status}`);

    // Add market to global object with critical fields for ball-to-action mapping
    const marketToAdd = {
        ...market,
        teamId,
        eventMarketId: market.eventMarketId || 0,
        isCreate: market.isCreate !== undefined ? market.isCreate : true,
        status: market.status || 1, // Preserve the status passed from market
        margin: parseFloat(market.margin) || 3,
        data: market.data || "",
        playerId: market.playerId || null,
        isActive: market.isActive !== undefined ? market.isActive : true,
        isAllow: market.isAllow !== undefined ? market.isAllow : false,
        inningsId: market.inningsId || 1,
        index: market.index || 0,
        commentaryId: market.commentaryId || commentary.commentaryId,
        eventRefId: market.eventRefId || commentary.eventRefId,
        isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
        // Fix: Ensure these properties are set properly for ball-to-action mapping
        isAutoResultSet: market.isAutoResultSet !== undefined ? market.isAutoResultSet : true,
        autoResultAfterBall: market.autoResultAfterBall || "0",
        runners: marketRunners
    };

    // Verify the status again before adding
    console.log(`[PROCESS] Final market status for ${marketToAdd.marketName}: ${marketToAdd.status}`);

    global.marketData[commentary.commentaryId].markets.push(marketToAdd);

    return global.marketData[commentary.commentaryId].markets;
}

// Helper function to convert overs to balls
function oversToBalls(overs, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over
    const fullOvers = Math.floor(overs);
    const balls = Math.round((overs - fullOvers) * 10);
    return fullOvers * BALLS_PER_OVER + balls;
}

module.exports = {
    processOddEven,
    processOddEvenMarkets,
    processLotteryMarkets,
    processMarketAndRunnersOfOE,
    openCloseMarket
};