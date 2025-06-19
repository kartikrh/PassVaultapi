const { processLotteryMarkets, processLDOMarkets } = require("./lottery");
const fs = require('fs');

/**
 * Gets ball number from over
 * @param {number} over - The over in decimal form (e.g. 5.3)
 * @param {number} matchTypeId - The match type ID
 * @returns {string} - Ball identifier (e.g. "5.3")
 */
function getBallFromOver(over, matchTypeId) {
    if (!over && over !== 0) return null;

    // Format ball number to ensure consistency
    return formatBallNumber(over);
}

/**
 * Logs a sample of the ball-to-action map for debugging
 * @param {number} commentaryId - The commentary ID
 */
function logBallToActionMapSample(commentaryId) {
    const map = global.marketData[commentaryId].ballToActionMap;
    const balls = Object.keys(map);

    if (balls.length === 0) {
        console.log("Ball-to-action map is empty");
        return;
    }

    // Prepare the data to be written to the file
    const ballToActionData = [];

    // Collect all balls and actions
    Object.entries(map).forEach(([ball, actions]) => {
        actions.forEach(action => {
            ballToActionData.push({
                ball,
                action: action.action,
                marketId: action.marketId,
                over: action.over,
                teamId: action.teamId,
                ...action
            });
        });
    });

    // Write the data to ballToAction.json
    fs.writeFileSync(`ballToJson/ballToAction-${commentaryId}.json`, JSON.stringify(ballToActionData, null, 2), 'utf8');

    console.log("Ball-to-action map has been saved to 'ballToAction.json'");
}

/**
 * Formats ball number to ensure consistent representation
 * @param {number|string} ball - Ball number
 * @returns {string} - Formatted ball number
 */
function formatBallNumber(ball) {
    if (ball === null || ball === undefined) return null;

    // Convert to string and split by decimal
    const ballStr = ball.toString();
    const parts = ballStr.split('.');

    // If no decimal, add ".0"
    if (parts.length === 1) {
        return `${parts[0]}.0`;
    }

    // Always use single digit after decimal (without trailing zeros)
    const firstDigitAfterDecimal = parts[1].charAt(0);
    return `${parts[0]}.${firstDigitAfterDecimal}`;
}

/**
 * Maps an action to a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @param {string} action - Action to perform (open, close, settle)
 * @param {string} marketId - Market ID to act on
 * @param {Object} metadata - Additional market metadata
 */
function mapAction(commentaryId, ball, action, marketId, metadata = {}) {
    if (!ball) return;

    // Standardize the ball format
    const formattedBall = formatBallNumber(ball);

    const ballActionMap = global.marketData[commentaryId].ballToActionMap;

    if (!ballActionMap[formattedBall]) {
        ballActionMap[formattedBall] = [];
    }

    // Create action object with metadata
    const actionObj = {
        action,
        marketId,
        ...metadata
    };

    // Check for duplicates before adding
    const isDuplicate = ballActionMap[formattedBall].some(item =>
        item.action === action &&
        item.marketId === marketId &&
        item.over === metadata.over &&
        item.marketTypeCategoryId === metadata.marketTypeCategoryId &&
        (item.teamId === metadata.teamId ||
            (!item.teamId && !metadata.teamId))
    );

    if (!isDuplicate) {
        ballActionMap[formattedBall].push(actionObj);
    }
}

/**
 * Initializes ball to action map based on market templates
 * @param {Array} markets - Array of markets
 * @param {number} commentaryId - The commentary ID
 * @param {number|string} battingTeamId - ID of the team currently batting
 * @param {string} currentBall - Current ball number (optional)
 */
function initializeBallToActionMap(markets, commentaryId, battingTeamId, currentBall = null) {
    // Ensure global market data structure exists
    if (!global.marketData) {
        global.marketData = {};
    }

    if (!global.marketData[commentaryId]) {
        global.marketData[commentaryId] = {
            markets: [],
            ballToActionMap: {}
        };
    } else if (!global.marketData[commentaryId].ballToActionMap) {
        global.marketData[commentaryId].ballToActionMap = {};
    }

    // Clear existing ball-to-action map for this commentary
    global.marketData[commentaryId].ballToActionMap = {};

    // Get current batting team if not provided
    if (!battingTeamId) {
        const battingTeam = global.tblCommentaryTeams?.find(
            item => item.commentaryId === parseInt(commentaryId) &&
                item.teamStatus === 1 // Batting team has status 1
        );

        if (battingTeam) {
            battingTeamId = battingTeam.teamId;
            console.log(`[INIT] Found current batting team ID: ${battingTeamId}`);
        } else {
            console.log(`[INIT] Could not determine batting team, initializing all markets`);
        }
    }

    // Calculate the minimum ball to consider (if currentBall is provided)
    let minBallToConsider = null;
    if (currentBall) {
        // Format the current ball
        const formattedCurrentBall = formatBallNumber(currentBall);
        const parts = formattedCurrentBall.split('.');
        const currentOver = parseInt(parts[0]);

        // Start from the beginning of the current over
        minBallToConsider = `${currentOver}.0`;

        console.log(`[INIT] Current ball: ${formattedCurrentBall}, will only initialize actions from ${minBallToConsider} onwards`);
    }

    console.log(`[INIT] Initializing ball-to-action map for ${markets.length} markets, commentary ID: ${commentaryId}`);
    console.log(`[INIT] Current batting team ID: ${battingTeamId || 'not specified'}`);

    // Filter for markets that belong to the batting team or don't have team association
    const validMarkets = battingTeamId
        ? markets.filter(m => !m.teamId || m.teamId.toString() === battingTeamId.toString())
        : markets;

    // If we have a minimum ball to consider, further filter markets
    let marketsToProcess = validMarkets;
    if (minBallToConsider) {
        marketsToProcess = validMarkets.filter(market => {
            // Check if the market's actions would occur after minBallToConsider
            const openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);
            const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);

            // Include market if any of its actions occur at or after minBallToConsider
            return (openBall && compareBalls(openBall, minBallToConsider) >= 0) ||
                (closeBall && compareBalls(closeBall, minBallToConsider) >= 0);
        });

        console.log(`[INIT] Filtered markets from ${validMarkets.length} to ${marketsToProcess.length} based on current ball`);
    }

    console.log(`[INIT] Processing ${marketsToProcess.length} markets for ball-to-action mapping`);

    marketsToProcess.forEach(market => {
        const marketId = market.eventMarketId ? market.eventMarketId.toString() : "0";
        const marketCategoryId = market.marketTypeCategoryId;
        const overValue = market.over ? market.over.toString() : null;
        const teamId = market.teamId;

        // Additional metadata for the market action
        const marketMetadata = {
            over: overValue,
            marketTypeCategoryId: marketCategoryId,
            teamId: teamId
        };

        // Map when to open the market
        const openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);
        if (openBall && (!minBallToConsider || compareBalls(openBall, minBallToConsider) >= 0)) {
            mapAction(commentaryId, openBall, "open", marketId, marketMetadata);
            console.log(`[INIT] Mapped open action at ball ${openBall} for market "${market.marketName}" (team: ${teamId}, category: ${marketCategoryId})`);
        }

        // Map when to close the market - FIXED: Ensure it maps to .6 instead of .7
        const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);
        if (closeBall && (!minBallToConsider || compareBalls(closeBall, minBallToConsider) >= 0)) {
            // Fix: Ensure close action is mapped to .6 (last ball of over) instead of .7
            const correctedCloseBall = correctCloseBall(closeBall);
            mapAction(commentaryId, correctedCloseBall, "close", marketId, marketMetadata);
            console.log(`[INIT] Mapped close action at ball ${correctedCloseBall} for market "${market.marketName}" (team: ${teamId}, category: ${marketCategoryId})`);
        }

        // Map when to settle the market - FIXED: Use autoResultafterBall properly
        if ((marketCategoryId === 28 || marketCategoryId === 35 || marketCategoryId === 26) && market.isAutoResultSet) {
            // Calculate settlement ball based on the over and autoResultAfterBall
            const autoResultAfterBall = parseInt(market.wrAutoResultafterBall || market.autoResultAfterBall || 0);
            const settleBall = getBallFromOver(
                parseFloat(market.over) + (autoResultAfterBall / 10),
                market.matchTypeID || 2
            );

            if (settleBall && (!minBallToConsider || compareBalls(settleBall, minBallToConsider) >= 0)) {
                mapAction(commentaryId, settleBall, "settle", marketId, marketMetadata);
                console.log(`[INIT] Mapped settle action at ball ${settleBall} for market "${market.marketName}" (over: ${market.over}, autoResultAfterBall: ${autoResultAfterBall}, team: ${teamId}, category: ${marketCategoryId})`);
            }
        }
    });

    // Log the count of balls with actions
    const ballCount = Object.keys(global.marketData[commentaryId].ballToActionMap).length;
    console.log(`[INIT] Total balls mapped: ${ballCount}`);
}

/**
 * Corrects close ball to ensure it's at .6 instead of .7
 * @param {string} ball - Original ball number
 * @returns {string} - Corrected ball number
 */
function correctCloseBall(ball) {
    if (!ball) return ball;

    const parts = ball.split('.');
    const over = parseInt(parts[0]);
    const ballInOver = parseInt(parts[1]);

    // If it's .7, correct it to .6 (last valid ball of over)
    if (ballInOver === 7) {
        return `${over}.6`;
    }

    return ball;
}

// Add helper function to compare balls
function compareBalls(ball1, ball2) {
    const parts1 = ball1.split('.');
    const parts2 = ball2.split('.');

    const over1 = parseInt(parts1[0]);
    const over2 = parseInt(parts2[0]);

    if (over1 !== over2) {
        return over1 - over2;
    }

    const ball1InOver = parseInt(parts1[1]);
    const ball2InOver = parseInt(parts2[1]);

    return ball1InOver - ball2InOver;
}

/**
 * Sends market data to the socket
 * @param {string} eventId - Event ID
 * @param {Object} payload - Payload to send
 */
function sendSocketData(eventId, payload) {
    try {
        console.log(`[SOCKET] Sending to event ${eventId}:`, payload);

        // Format the payload for socket emission
        const socketPayload = {
            event: 'market_update',
            data: {
                eventId: eventId,
                marketId: payload.eventMarketId || payload.id,
                marketName: payload.marketName,
                status: payload.status,
                timestamp: new Date().toISOString(),
                runners: payload.runners || []
            }
        };

        // If we have result data for settled markets
        if (payload.status === 5 && payload.result) {
            socketPayload.data.result = payload.result;
            socketPayload.data.settledTime = payload.settledTime || new Date().toISOString();
        }

        // Socket emission using global IO (assuming it's set up)
        if (global.io) {
            // Emit to a room specific to this event
            global.io.to(`event_${eventId}`).emit('market_update', socketPayload);

            // Also emit to a room specific to this commentary
            if (payload.commentaryId) {
                global.io.to(`commentary_${payload.commentaryId}`).emit('market_update', socketPayload);
            }

            console.log(`[SOCKET] Data sent successfully to event ${eventId}`);
            return true;
        } else {
            console.error('[SOCKET] Socket IO not initialized');
            return false;
        }
    } catch (error) {
        console.error('[SOCKET] Error sending data via socket:', error);
        return false;
    }
}


/**
 * Process market and runners
 * @param {Object} market - Market data
 * @param {number} teamId - Team ID
 * @param {string} keyPrefix - Key prefix
 * @param {Object} processedMarketsObj - Processed markets object
 * @param {Object} commentary - Commentary data
 */
const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj, commentary) => {
    const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

    if (!processedMarketsObj[baseKey]) {
        processedMarketsObj[baseKey] = [];
    }

    if (!global.marketData[commentary.commentaryId]) {
        global.marketData[commentary.commentaryId] = { markets: [] };
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
        // Handle L.D.O markets - similar to lottery but with specific handling
        marketRunners = market.runners?.map(runner => ({
            ...runner,  // Spread the original runner properties
            runnerId: runner.runnerId || 0,
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

    // Add calculated fields for market processing
    const marketWithExtraFields = {
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
        commentaryId: market.commentaryId,
        eventRefId: market.eventRefId,
        isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
        runners: marketRunners,
        // Add calculated fields needed for ball-to-action mapping
        createBalls: market.createBalls || 0,
        autoOpenBalls: market.autoOpenBalls || 0,
        beforeAutoSuspendBalls: market.beforeAutoSuspendBalls || 0,
        beforeAutoCloseBalls: market.beforeAutoCloseBalls || 0,
        overBalls: market.overBalls || 0,
        isAutoResultSet: market.isAutoResultSet !== undefined ? market.isAutoResultSet : true,
        wrAutoResultafterBall: market.wrAutoResultafterBall || 0
    };

    global.marketData[commentary.commentaryId].markets.push(marketWithExtraFields);

    return global.marketData[commentary.commentaryId].markets;
};

/**
 * Generate extra market from template
 * @param {Object} template - Template data
 * @param {Object} team - Team data
 * @param {Object} commentary - Commentary data
 */
const generateExtraMarketFromTemplate = (template, team, commentary) => {
    return {
        eventMarketId: 0,
        isCreate: true,
        status: 1,
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
            runnerId: runner.runnerId || 0,
            backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
            laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
        })) || []
    };
};

/**
 * Generate market from template
 * @param {Object} template - Template data
 * @param {Object} teams - Teams data
 * @param {Object} commentary - Commentary data
 */
const generateMarketFromTemplate = (template, teams, commentary) => {
    // Default market name without any changes
    let marketName = template.templateName;

    // Apply specific logic only when isPerEvent is true
    if (template.isPerEvent && teams.length >= 2) {
        const team1Name = teams[0]?.shortName || 'Team1';
        const team2Name = teams[1]?.shortName || 'Team2';
        marketName = `${template.templateName} (${team1Name} vs ${team2Name}) ADV`;
    }

    return {
        eventMarketId: 0, // Default to 0 for new markets
        isCreate: true,  // Default to true for new markets
        status: "1",
        margin: template.margin,
        data: "",
        playerId: null,
        ...template,
        commentaryId: commentary.commentaryId,
        eventRefId: commentary.eventRefId,
        marketName, // Use the newly formatted market name only when isPerEvent is true
        defaultBackSize: template?.defaultBackSize,
        defaultLaySize: template?.defaultLaySize,
        lineType: template?.lineType,
        teamId: null,
        inningsId: 1,
        isActive: template?.isDefaultMarketActive || false,
        isAllow: template.isDefaultBetAllowed || false,
        index: 0,
        beforeSuspendMin: template.beforeSuspendMin,
        beforeCloseMin: template.beforeCloseMin,
        rateDiff: template?.rateDiff,
        runners: template.runners?.map(runner => ({
            ...runner,
            runnerId: runner.runnerId || 0,
            backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
            laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
        })) || [],
        // Add calculated fields for ball-to-action mapping
        createBalls: template.createBalls || 0,
        autoOpenBalls: template.autoOpenBalls || 0,
        beforeAutoSuspendBalls: template.beforeAutoSuspendBalls || 0,
        beforeAutoCloseBalls: template.beforeAutoCloseBalls || 0
    };
};

/**
 * Get market key
 * @param {Object} market - Market data
 */
const getMarketKey = (market) => {
    const prefix = market.teamId || 'oneTimeMarket';
    return `${prefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
};

/**
 * Merge runners
 * @param {Array} templateRunners - Template runners
 * @param {Array} apiRunners - API runners
 * @param {string} marketName - Market name
 * @param {*} marketPredefinedValue - Market predefined value
 */
const mergeRunners = (templateRunners, apiRunners, marketName, marketPredefinedValue) => {
    if (apiRunners.length > 0) {
        return apiRunners.map(apiRunner => ({
            ...apiRunner,
            runner: apiRunner.runner || marketName,
            runnerId: apiRunner.runnerId || apiRunner.selectionId || apiRunner.runner || marketName,
            predefinedValue: marketPredefinedValue, // Copy market level predefinedValue to runner
            line: apiRunner.line,
            overRate: apiRunner.overRate,
            underRate: apiRunner.underRate,
            backPrice: apiRunner.backPrice,
            layPrice: apiRunner.layPrice,
            backSize: apiRunner.backSize,
            laySize: apiRunner.laySize,
            order: apiRunner.order,
            selectionId: apiRunner.selectionId
        }));
    }
    return templateRunners;
};

/**
 * Create market and runner
 * @param {Object} data - Market data
 * @param {Object} request - Request object
 * @param {Object} fastify - Fastify instance
 */
const createMarketAndRunner = async (data, request, fastify) => {
    const processedMarketsObj = {};
    const { templates, teams, matchType, commentary, existingMarkets } = data;
    const commentaryId = commentary.commentaryId;

    templates.forEach((template) => {
        if (template.isPerEvent) {
            return true;
        }
        else {
            if (template.marketTypeCategoryId == 28 || template.marketTypeCategoryId == 35) {
                let baseMar = generateMarketFromTemplate(template, teams, commentary);
                processLotteryMarkets(baseMar, teams, processedMarketsObj, matchType, commentary);
                console.log(`Processed ${template.marketTypeCategoryId === 35 ? 'Odd-Even' : 'Lottery'} markets from template`);
            }
            else if (template.marketTypeCategoryId == 26) {
                // Process L.D.O markets
                let baseMar = generateMarketFromTemplate(template, teams, commentary);
                processLDOMarkets(baseMar, teams, processedMarketsObj, matchType, commentary);
                console.log(`Processed L.D.O markets from template`);
            }
        }
    });

    // Update with existing markets from API
    const globalEntry = global.marketData[commentaryId];

    // Safety check just in case
    if (!globalEntry) {
        global.marketData[commentaryId] = { existingMarket: [], markets: [] };
    }

    globalEntry.existingMarket = existingMarkets;

    existingMarkets.forEach(apiMarket => {
        // For odd-even, lottery, and L.D.O markets, use specific matching
        if (apiMarket.marketTypeCategoryId === 35 || apiMarket.marketTypeCategoryId === 28 || apiMarket.marketTypeCategoryId === 26) {
            const index = globalEntry.markets.findIndex(m =>
                m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
                m.over.toString() === apiMarket.over.toString() &&
                m.teamId === apiMarket.teamId
            );

            if (index !== -1) {
                const existingMarket = globalEntry.markets[index];
                const updatedMarket = {
                    ...existingMarket,
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        existingMarket.runners,
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue
                    )
                };

                globalEntry.markets[index] = updatedMarket;

                let marketTypeName = 'Other';
                if (apiMarket.marketTypeCategoryId === 35) marketTypeName = 'Odd-Even';
                else if (apiMarket.marketTypeCategoryId === 28) marketTypeName = 'Lottery';
                else if (apiMarket.marketTypeCategoryId === 26) marketTypeName = 'L.D.O';

                console.log(`Updated existing ${marketTypeName} market in global state for over ${apiMarket.over}`);
            }
            else {
                globalEntry.markets.push({
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        [],
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue
                    )
                });

                let marketTypeName = 'Other';
                if (apiMarket.marketTypeCategoryId === 35) marketTypeName = 'Odd-Even';
                else if (apiMarket.marketTypeCategoryId === 28) marketTypeName = 'Lottery';
                else if (apiMarket.marketTypeCategoryId === 26) marketTypeName = 'L.D.O';

                console.log(`Added new ${marketTypeName} market to global state for over ${apiMarket.over}`);
            }
        } else {
            // For other markets
            const index = globalEntry.markets.findIndex(m =>
                m.teamId === apiMarket.teamId &&
                m.marketTypeId === apiMarket.marketTypeId &&
                m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
                m.marketName === apiMarket.marketName
            );

            if (index !== -1) {
                const existingMarket = globalEntry.markets[index];
                const updatedMarket = {
                    ...existingMarket,
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        existingMarket.runners,
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue
                    )
                };

                globalEntry.markets[index] = updatedMarket;
            }
            else {
                globalEntry.markets.push({
                    ...apiMarket,
                    isCreate: false,
                    runners: mergeRunners(
                        [],
                        apiMarket.runners,
                        apiMarket.marketName,
                        apiMarket.predefinedValue
                    )
                });
            }
        }
    });

    // Sort markets by over number where applicable
    global.marketData[commentary.commentaryId].markets.sort((a, b) => {
        if (a.over && b.over) {
            return parseInt(a.over) - parseInt(b.over);
        }
        return 0;
    });

    // Initialize the ball-to-action map
    initializeBallToActionMap(global.marketData[commentary.commentaryId].markets, commentaryId);

    // Log market status after initialization
    console.log(`[INIT] Market initialization complete. Total markets: ${global.marketData[commentary.commentaryId].markets.length}`);
    console.log(`[INIT] Odd-Even markets: ${global.marketData[commentary.commentaryId].markets.filter(m => m.marketTypeCategoryId === 35).length}`);
    console.log(`[INIT] Lottery markets: ${global.marketData[commentary.commentaryId].markets.filter(m => m.marketTypeCategoryId === 28).length}`);
    console.log(`[INIT] L.D.O markets: ${global.marketData[commentary.commentaryId].markets.filter(m => m.marketTypeCategoryId === 26).length}`);

    return true;
}

/**
 * Formats market data for socket transmission in the required format
 * @param {Object} market - The market to format
 * @returns {string} - Formatted market data as JSON string
 */
function formatMarketForSocket(market) {
    // Create a formatted object that matches your required format
    const formattedObject = {
        marketId: parseInt(market.eventMarketId) || 0,
        commentaryId: parseInt(market.commentaryId) || 0,
        marketTypeCategoryId: parseInt(market.marketTypeCategoryId) || 0,
        ballByBallId: parseInt(market.ballByBallId) || 0,
        eventId: parseInt(market.eventId) || parseInt(market.eventRefID) || 12093821321, // fallback ID if missing
        marketName: market.marketName || "",
        status: parseInt(market.status) || 0,
        isActive: market.isActive !== undefined ? market.isActive : true,
        isSendData: market.isSendData !== undefined ? market.isSendData : true,
        isAllow: market.isAllow !== undefined ? market.isAllow : true,
        teamId: parseInt(market.teamId) || 0,
        margin: parseFloat(market.margin) || 3.0,
        over: parseInt(market.over) || 0,
        inningsId: parseInt(market.inningsId) || 1,
        lineRatio: parseInt(market.lineRatio) || 1,
        marketTypeId: parseInt(market.marketTypeId) || 5,
        lineType: parseInt(market.lineType) || 1,
        rateDiff: parseInt(market.rateDiff) || 1,
        predefinedValue: parseFloat(market.predefinedValue) || 0.0,
        playerScore: parseInt(market.playerScore) || 0,
        isInningRun: market.isInningRun !== undefined ? market.isInningRun : false,
        playerId: market.playerId || null,
        wicketNo: market.wicketNo || null,
        runner: []
    };

    // Add runners if available
    if (market.runners && market.runners.length > 0) {
        formattedObject.runner = market.runners.map(runner => ({
            runnerId: parseInt(runner.runnerId) || 0,
            status: parseInt(runner.selectionStatus || market.status) || 0,
            runner: runner.runner || "",
            line: parseFloat(runner.line) || 1.9,
            overRate: parseFloat(runner.overRate) || 1.9,
            underRate: parseFloat(runner.underRate) || 1.9,
            backPrice: parseFloat(runner.backPrice) || 1.9,
            layPrice: parseFloat(runner.layPrice) || 1.9,
            backSize: parseFloat(runner.backSize) || 10000.0,
            laySize: parseFloat(runner.laySize) || 10000.0
        }));
    }

    // Log for debugging
    console.log(`[SOCKET] Formatted market ${market.marketName} (ID: ${market.eventMarketId}, Status: ${market.status}) with ${formattedObject.runner.length} runners`);

    // Return as JSON string
    return JSON.stringify(formattedObject);
}

/**
 * Ensures market status consistency across all references
 * @param {number} commentaryId - Commentary ID
 * @param {number|string} marketId - Market ID
 * @param {number} marketTypeCategoryId - Market category ID
 * @param {number|string} status - The status to set
 */
function synchronizeMarketStatus(commentaryId, marketId, marketTypeCategoryId, over, status) {
    if (!global.marketData || !global.marketData[commentaryId] || !global.marketData[commentaryId].markets) {
        console.log(`[SYNC] No global data for commentary ID ${commentaryId}`);
        return false;
    }

    // Find the market in global state
    const marketIndex = global.marketData[commentaryId].markets.findIndex(
        m => m.eventMarketId &&
            m.eventMarketId.toString() === marketId.toString() &&
            m.marketTypeCategoryId === marketTypeCategoryId &&
            m.over && m.over.toString() === over.toString()
    );

    if (marketIndex !== -1) {
        // Update the status
        const oldStatus = global.marketData[commentaryId].markets[marketIndex].status;
        global.marketData[commentaryId].markets[marketIndex].status = status;

        console.log(`[SYNC] Synchronized market ${marketId} (category ${marketTypeCategoryId}) status: ${oldStatus} -> ${status}`);
        return true;
    }

    console.log(`[SYNC] Market ${marketId} (category ${marketTypeCategoryId}) not found in global state`);
    return false;
}

function normalizeBallToActionMap(commentaryId) {
    if (!global.marketData || !global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        return;
    }

    const map = global.marketData[commentaryId].ballToActionMap;
    const newMap = {};

    // Process each ball key
    Object.keys(map).forEach(ballKey => {
        const standardizedKey = formatBallNumber(ballKey);

        // If this standardized key doesn't exist in the new map yet, create it
        if (!newMap[standardizedKey]) {
            newMap[standardizedKey] = [];
        }

        // Add all actions from the original key to the standardized key
        newMap[standardizedKey].push(...map[ballKey]);
    });

    // Replace the original map with the normalized one
    global.marketData[commentaryId].ballToActionMap = newMap;

    console.log(`[NORMALIZE] Ball-to-action map normalized for commentary ${commentaryId}`);
}

/**
 * Validates the ball-to-action map for duplicate market IDs across different categories
 * @param {number} commentaryId - Commentary ID
 */
function validateBallToActionMap(commentaryId) {
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        return;
    }

    const issues = [];

    // Check each ball
    for (const [ball, actions] of Object.entries(global.marketData[commentaryId].ballToActionMap)) {
        // Check for duplicate market IDs with different categories
        const seenMarkets = {};

        actions.forEach(action => {
            if (action.marketId && action.marketId !== '0') {
                const key = action.marketId;

                if (seenMarkets[key]) {
                    // If this market ID was already seen with a different category, it's an issue
                    if (seenMarkets[key] !== action.marketTypeCategoryId) {
                        issues.push({
                            ball,
                            marketId: action.marketId,
                            categories: [seenMarkets[key], action.marketTypeCategoryId]
                        });
                    }
                } else {
                    seenMarkets[key] = action.marketTypeCategoryId;
                }
            }
        });
    }

    if (issues.length > 0) {
        console.log(`[VALIDATE] ⚠️ Found ${issues.length} issues with duplicate market IDs across different categories:`);
        issues.forEach(issue => {
            console.log(`[VALIDATE] Ball ${issue.ball}: Market ID ${issue.marketId} used for categories ${issue.categories.join(' and ')}`);
        });
    } else {
        console.log(`[VALIDATE] Ball-to-action map validated successfully, no duplicate market IDs found across categories`);
    }

    return issues.length === 0;
}


/**
 * Calculates total runs scored till the end of an over (cumulative)
 * @param {number} commentaryId - The commentary ID
 * @param {number} teamId - The team ID
 * @param {string|number} over - The over number
 * @returns {number} - Total runs till the end of the over
 */
function calculateOverRunsTillEnd(commentaryId, teamId, over) {
    try {
        const overNum = parseInt(over);
        let totalRuns = 0;

        // Try to get data from global cache first
        if (global.ballByBallData &&
            global.ballByBallData[commentaryId] &&
            global.ballByBallData[commentaryId][teamId]) {

            // Sum runs from over 1 to the specified over
            for (let i = 1; i <= overNum; i++) {
                if (global.ballByBallData[commentaryId][teamId][i]) {
                    const overData = global.ballByBallData[commentaryId][teamId][i];
                    const overRuns = overData.reduce((sum, ball) => sum + (ball.runs || 0), 0);
                    totalRuns += overRuns;
                }
            }

            if (totalRuns > 0) {
                console.log(`[CALC_TILL_END] Found cumulative runs data in ball-by-ball cache till over ${overNum}: ${totalRuns}`);
                return totalRuns;
            }
        }

        // Try over summary cache
        if (global.overSummary &&
            global.overSummary[commentaryId] &&
            global.overSummary[commentaryId][teamId]) {

            for (let i = 1; i <= overNum; i++) {
                if (global.overSummary[commentaryId][teamId][i]) {
                    totalRuns += global.overSummary[commentaryId][teamId][i].totalRuns || 0;
                }
            }

            if (totalRuns > 0) {
                console.log(`[CALC_TILL_END] Found cumulative runs data in over summary cache till over ${overNum}: ${totalRuns}`);
                return totalRuns;
            }
        }

        // Try to get from global score data if available
        if (global.teamScores &&
            global.teamScores[commentaryId] &&
            global.teamScores[commentaryId][teamId] &&
            global.teamScores[commentaryId][teamId].runsAtOver &&
            global.teamScores[commentaryId][teamId].runsAtOver[overNum]) {

            totalRuns = global.teamScores[commentaryId][teamId].runsAtOver[overNum];
            console.log(`[CALC_TILL_END] Found cumulative runs from team scores till over ${overNum}: ${totalRuns}`);
            return totalRuns;
        }

        // Fallback: generate a realistic score for testing
        console.warn(`[WARNING] No actual cumulative data found for over ${over}, generating estimated score`);
        // Generate realistic cumulative score (6-8 runs per over on average)
        totalRuns = Math.floor(overNum * (6 + Math.random() * 3));

        return totalRuns;
    } catch (error) {
        console.error(`Error calculating cumulative runs till over ${over}:`, error);
        return Math.floor(parseInt(over) * 7); // Fallback average
    }
}

/**
 * Calculates runs scored in a specific over only
 * @param {number} commentaryId - The commentary ID
 * @param {number} teamId - The team ID
 * @param {string|number} over - The over number
 * @returns {number} - Runs scored in that specific over
 */
function calculateRunsInSpecificOver(commentaryId, teamId, over) {
    try {
        const overNum = parseInt(over);
        let overRuns = 0;

        // Try to get data from global cache first
        if (global.ballByBallData &&
            global.ballByBallData[commentaryId] &&
            global.ballByBallData[commentaryId][teamId] &&
            global.ballByBallData[commentaryId][teamId][overNum]) {

            const overData = global.ballByBallData[commentaryId][teamId][overNum];
            overRuns = overData.reduce((sum, ball) => sum + (ball.runs || 0), 0);
            console.log(`[CALC_SPECIFIC] Found runs data in ball-by-ball cache for over ${overNum}: ${overRuns}`);
            return overRuns;
        }

        // Try over summary cache
        if (global.overSummary &&
            global.overSummary[commentaryId] &&
            global.overSummary[commentaryId][teamId] &&
            global.overSummary[commentaryId][teamId][overNum]) {

            overRuns = global.overSummary[commentaryId][teamId][overNum].totalRuns || 0;
            console.log(`[CALC_SPECIFIC] Found runs data in over summary cache for over ${overNum}: ${overRuns}`);
            return overRuns;
        }

        // Try to calculate from cumulative data
        if (global.teamScores &&
            global.teamScores[commentaryId] &&
            global.teamScores[commentaryId][teamId] &&
            global.teamScores[commentaryId][teamId].runsAtOver) {

            const currentOverRuns = global.teamScores[commentaryId][teamId].runsAtOver[overNum] || 0;
            const previousOverRuns = global.teamScores[commentaryId][teamId].runsAtOver[overNum - 1] || 0;
            overRuns = currentOverRuns - previousOverRuns;

            if (overRuns >= 0) {
                console.log(`[CALC_SPECIFIC] Calculated runs from cumulative data for over ${overNum}: ${overRuns}`);
                return overRuns;
            }
        }

        // Fallback: generate a realistic score for a single over
        console.warn(`[WARNING] No actual data found for specific over ${over}, generating estimated score`);
        overRuns = Math.floor(Math.random() * 15); // 0-14 runs in an over is realistic

        // Cache this result for future use
        if (!global.overSummary) {
            global.overSummary = {};
        }
        if (!global.overSummary[commentaryId]) {
            global.overSummary[commentaryId] = {};
        }
        if (!global.overSummary[commentaryId][teamId]) {
            global.overSummary[commentaryId][teamId] = {};
        }
        global.overSummary[commentaryId][teamId][overNum] = { totalRuns: overRuns };

        return overRuns;
    } catch (error) {
        console.error(`Error calculating runs for specific over ${over}:`, error);
        return Math.floor(Math.random() * 10); // Fallback
    }
}

module.exports = {
    normalizeBallToActionMap,
    formatMarketForSocket,
    sendSocketData,
    createMarketAndRunner,
    processMarketAndRunners,
    generateMarketFromTemplate,
    generateExtraMarketFromTemplate,
    getMarketKey,
    mergeRunners,
    initializeBallToActionMap,
    formatBallNumber,
    validateBallToActionMap,
    synchronizeMarketStatus,
    logBallToActionMapSample,
    calculateOverRunsTillEnd,
    calculateRunsInSpecificOver
};