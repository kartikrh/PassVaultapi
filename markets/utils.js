const { processLotteryMarkets, processMarketAndRunnersOfOE } = require("./oddEven.js");
const { initializeBallToActionMap } = require("./ballToActionMapper");



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
        // Handle LDO and Lottery markets
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
            if (template.marketTypeCategoryId == 35 || template.marketTypeCategoryId == 28) {
                let baseMar = generateMarketFromTemplate(template, teams, commentary);
                processLotteryMarkets(baseMar, teams, processedMarketsObj, matchType, commentary);
            }
            //  else {
            //     teams.forEach(team => {
            //         // processMarketAndRunners(generateExtraMarketFromTemplate(template, team, commentary), team.teamId, team.teamId.toString(), processedMarketsObj);
            //         let baseMar = generateExtraMarketFromTemplate(template, teams, commentary);
            //         processMarketAndRunners(baseMar, team.teamId, team.teamId.toString(), processedMarketsObj, commentary);
            //     });
            // }
        }
    })
    // return mar;
    // Now update with existing markets from API
    const globalEntry = global.marketData[commentaryId];
    // Safety check just in case
    if (!globalEntry) {
        global.marketData[commentaryId] = { existingMarket: [], markets: [] };
    }
    globalEntry.existingMarket = existingMarkets;
    existingMarkets.forEach(apiMarket => {
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
                    apiMarket.predefinedValue // Pass market level predefinedValue
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
                    apiMarket.predefinedValue // Pass market level predefinedValue
                )
            });
        }
    })

    // Sort markets by over number where applicable
    global.marketData[commentary.commentaryId].markets.sort((a, b) => {
        if (a.over && b.over) {
            return a.over - b.over;
        }
        return 0;
    });

    // Initialize the ball-to-action map
    initializeBallToActionMap(global.marketData[commentary.commentaryId].markets, commentaryId);

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

    // Return as JSON string
    return JSON.stringify([formattedObject]);
}

module.exports = {
    formatMarketForSocket,
    sendSocketData,
    createMarketAndRunner,
    processMarketAndRunners,
    generateMarketFromTemplate,
    generateExtraMarketFromTemplate,
    getMarketKey,
    mergeRunners
};