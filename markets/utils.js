const { errorLogger } = require("../utilities/logger");
const { processLotteryMarkets, processMarketAndRunnersOfOE } = require("./oddEven.js");
const { initializeBallToActionMap } = require("./ballToActionMapper");

/**
 * Updates market status in the database
 * @param {number} commentaryId - The commentary ID
 * @param {string} marketName - Market name
 * @param {Object} marketValue - Market value/data
 */
async function updateMarketToDB(commentaryId, marketName, marketValue) {
    try {
        console.log(`[DB] Update for ${marketName}:`, marketValue, `(commentary_id: ${commentaryId})`);

        // Get market ID and other values
        const marketId = marketValue.eventMarketId || marketValue.id || 0;
        const marketStatus = marketValue.status;
        const marketResult = marketValue.result || null;
        const settledTime = marketValue.settledTime || null;

        let newMarketId = marketId;

        // If marketId is 0, insert a new market
        if (marketId === 0 || marketId === "0") {
            const insertQuery = `
                INSERT INTO "tblEventMarkets" (
                    "wrCommentaryId", "wrEventRefID", "wrTeamID", "wrInningsID", 
                    "wrMarketName", "wrStatus", "wrIsPredefineMarket", "wrTemplateType", 
                    "wrIsOver", "wrOver", "wrIsPlayer", "wrIsAutoCancel", 
                    "wrAutoOpenType", "wrAutoOpen", "wrAutoCloseType", "wrBeforeAutoClose", 
                    "wrAutoSuspendType", "wrBeforeAutoSuspend", "wrIsBallStart", "wrIsAutoResultSet", 
                    "wrAutoResultafterBall", "wrAfterWicketAutoSuspend", "wrAfterWicketNotCreated", 
                    "wrIsActive", "wrMarketTemplateId", "wrMargin", "wrCreateType", 
                    "wrMarketTypeCategoryId", "wrMarketTypeId", "wrRateSource", "wrPredefinedValue", 
                    "wrDelay", "wrCreate", "wrCreateRefId", "wrOpenRefId", "wrActionType", 
                    "wrAutoResultType", "wrIsSendData", "wrIsAllow", "wrLineType", 
                    "wrDefaultBackSize", "wrDefaultLaySize", "wrDefaultIsSendData", "wrRateDiff"
                ) VALUES (
                    ${commentaryId}, '${marketValue.eventRefId || ""}', ${marketValue.teamId || 0}, ${marketValue.inningsId || 1},
                    '${marketValue.marketName}', ${marketStatus}, ${marketValue.isPredefineMarket || false}, ${marketValue.templateType || 1},
                    ${marketValue.isOver || false}, ${marketValue.over || 0}, ${marketValue.isPlayer || false}, ${marketValue.isAutoCancel || false},
                    ${marketValue.autoOpenType || 0}, ${marketValue.autoOpen || 0}, ${marketValue.autoCloseType || 0}, ${marketValue.beforeAutoClose || 0},
                    ${marketValue.autoSuspendType || 0}, ${marketValue.beforeAutoSuspend || 0}, ${marketValue.isBallStart || false}, ${marketValue.isAutoResultSet || false},
                    ${marketValue.autoResultAfterBall || 0}, ${marketValue.afterWicketAutoSuspend || 0}, ${marketValue.afterWicketNotCreated || 0},
                    ${marketValue.isActive || false}, ${marketValue.marketTemplateId || 0}, ${marketValue.margin || 0}, ${marketValue.createType || 1},
                    ${marketValue.marketTypeCategoryId || 0}, ${marketValue.marketTypeId || 0}, ${marketValue.rateSource || 1}, ${marketValue.predefinedValue || 0},
                    ${marketValue.delay || 0}, ${marketValue.create || 0}, ${marketValue.createRefId || 0}, ${marketValue.openRefId || 0}, ${marketValue.actionType || 0},
                    ${marketValue.autoResultType || 0}, ${marketValue.isSendData || false}, ${marketValue.isAllow || false}, ${marketValue.lineType || 0},
                    ${marketValue.defaultBackSize || 100}, ${marketValue.defaultLaySize || 100}, ${marketValue.defaultIsSendData || false}, ${marketValue.rateDiff || 0}
                ) RETURNING "wrID"
            `;

            // Execute the insert query
            const insertResult = await global.fastify.db.query(insertQuery, {
                type: global.fastify.db.QueryTypes.INSERT
            });

            // Get the new market ID
            newMarketId = insertResult[0][0].wrID;
            console.log(`[DB] New market inserted with ID: ${newMarketId}`);

            // Insert runners if available
            if (marketValue.runners && marketValue.runners.length > 0) {
                for (const runner of marketValue.runners) {
                    const runnerInsertQuery = `
                        INSERT INTO "tblMarketRunners" (
                            "wrEventMarketId", "wrRunner", "wrLine", "wrOverRate", 
                            "wrUnderRate", "wrBackPrice", "wrBackSize", "wrLayPrice", 
                            "wrLaySize", "wrLastUpdate", "wrSelectionId", "wrSelectionStatus"
                        ) VALUES (
                            ${newMarketId}, '${runner.runner}', ${runner.line || 0}, ${runner.overRate || 0},
                            ${runner.underRate || 0}, ${runner.backPrice || 0}, ${runner.backSize || 100}, ${runner.layPrice || 0},
                            ${runner.laySize || 100}, NOW(), '${runner.selectionId || newMarketId + "01"}', ${marketStatus}
                        ) RETURNING "wrRunnerId"
                    `;

                    const runnerResult = await global.fastify.db.query(runnerInsertQuery, {
                        type: global.fastify.db.QueryTypes.INSERT
                    });

                    const newRunnerId = runnerResult[0][0].wrRunnerId;
                    runner.runnerId = newRunnerId;
                    console.log(`[DB] New runner inserted with ID: ${newRunnerId}`);
                }
            }

            // Update the market data JSON if needed
            if (marketValue.runners && marketValue.runners.length > 0) {
                const marketData = {
                    id: newMarketId,
                    name: marketValue.marketName,
                    status: marketStatus,
                    runners: marketValue.runners.map(r => ({
                        id: r.runnerId,
                        name: r.runner,
                        status: r.selectionStatus || marketStatus
                    }))
                };

                const dataUpdateQuery = `
                    UPDATE "tblEventMarkets"
                    SET "wrData" = '${JSON.stringify(marketData)}'
                    WHERE "wrID" = ${newMarketId}
                `;

                await global.fastify.db.query(dataUpdateQuery, {
                    type: global.fastify.db.QueryTypes.UPDATE
                });
            }
        } else {
            // Create update query for existing market
            let updateQuery = `
                UPDATE "tblEventMarkets" 
                SET "wrStatus" = ${marketStatus}
            `;

            // Add result if available
            if (marketResult !== null) {
                updateQuery += `, "wrResult" = ${marketResult}`;
            }

            // Add settled time if available
            if (settledTime !== null) {
                updateQuery += `, "wrSettledTime" = '${settledTime}'`;
            }

            // Add predefined value if available
            if (marketValue.predefinedValue !== undefined) {
                updateQuery += `, "wrPredefinedValue" = ${marketValue.predefinedValue}`;
            }

            // Add data if available
            if (marketValue.data) {
                const jsonData = JSON.stringify(marketValue.data);
                updateQuery += `, "wrData" = '${jsonData}'`;
            }

            // Add where condition
            updateQuery += ` WHERE "wrID" = ${marketId}`;

            // Execute the query
            await global.fastify.db.query(updateQuery, {
                type: global.fastify.db.QueryTypes.UPDATE
            });

            // Update runners if available
            if (marketValue.runners && marketValue.runners.length > 0) {
                for (const runner of marketValue.runners) {
                    const runnerStatus = runner.selectionStatus || marketStatus;
                    const runnerId = runner.runnerId || runner.id;

                    if (runnerId) {
                        const runnerUpdateQuery = `
                            UPDATE "tblMarketRunners"
                            SET "wrSelectionStatus" = ${runnerStatus}
                            WHERE "wrRunnerId" = ${runnerId} AND "wrEventMarketId" = ${marketId}
                        `;

                        await global.fastify.db.query(runnerUpdateQuery, {
                            type: global.fastify.db.QueryTypes.UPDATE
                        });
                    }
                }
            }
        }

        // Update the market in global market data
        if (global.marketData && global.marketData[commentaryId] && global.marketData[commentaryId].markets) {
            const markets = global.marketData[commentaryId].markets;
            const marketIndex = markets.findIndex(m =>
                (m.eventMarketId && m.eventMarketId.toString() === marketId.toString()) ||
                (m.over === marketValue.over && m.marketTypeCategoryId === marketValue.marketTypeCategoryId && m.teamId === marketValue.teamId)
            );

            if (marketIndex !== -1) {
                // Update existing market
                const updatedMarket = { ...markets[marketIndex] };
                updatedMarket.eventMarketId = newMarketId;
                updatedMarket.status = marketStatus;

                if (marketResult !== null) {
                    updatedMarket.result = marketResult;
                }

                if (settledTime !== null) {
                    updatedMarket.settledTime = settledTime;
                }

                // Update runners if available
                if (marketValue.runners && marketValue.runners.length > 0) {
                    updatedMarket.runners = marketValue.runners.map(runner => {
                        return {
                            ...runner,
                            selectionStatus: runner.selectionStatus || marketStatus
                        };
                    });
                }

                // Replace the market in the array
                global.marketData[commentaryId].markets[marketIndex] = updatedMarket;
            }
        }

        console.log(`[DB] Market ${newMarketId} updated successfully`);
        return newMarketId;
    } catch (error) {
        console.error(`[DB] Error updating market in DB:`, error);
        return marketValue.eventMarketId || 0;
    }
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

module.exports = {
    updateMarketToDB,
    sendSocketData,
    createMarketAndRunner,
    processMarketAndRunners,
    generateMarketFromTemplate,
    generateExtraMarketFromTemplate,
    getMarketKey,
    mergeRunners
};