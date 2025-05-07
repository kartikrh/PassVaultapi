// marketActions.js
const { errorLogger } = require('../utilities/logger');
const { formatMarketForSocket } = require('./utils');


/**
 * Updates market status in the database
 * @param {Object} market - The market to update
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<string|number>} - The market ID after update
 */
async function updateMarketStatusInDB(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market;

        // Add detailed logging
        console.log(`[DB] Processing market: Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over}, Name=${marketValue.marketName}, ID=${marketValue.eventMarketId || 0}, Status=${marketValue.status}`);

        let marketId = marketValue.eventMarketId || marketValue.id || 0;
        let newMarketId = marketId;

        // First check if market already exists in DB when ID is 0
        if (marketId === 0 || marketId === "0") {
            // Use category ID and over to find existing market
            const existingId = await findExistingMarketId(market, fastify);

            if (existingId) {
                console.log(`[DB] Found existing market with ID ${existingId} for category ${marketValue.marketTypeCategoryId}, over ${marketValue.over}`);
                newMarketId = existingId;

                // Update existing market's status using all identifiers for precise targeting
                await updateExistingMarket({
                    ...market,
                    eventMarketId: existingId
                }, fastify);

                // Update global state with the correct ID
                updateGlobalMarketId(market, existingId);

                // Emit socket update AFTER database update is complete
                if (global.socketIo) {
                    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
                    if (clientInRoom?.size) {
                        // Get the updated market from global state that matches BOTH ID and category
                        const updatedMarket = global.marketData[commentaryId].markets.find(
                            m => m.eventMarketId &&
                                m.eventMarketId.toString() === existingId.toString() &&
                                m.marketTypeCategoryId === marketValue.marketTypeCategoryId &&
                                m.over && m.over.toString() === marketValue.over.toString()
                        ) || { ...market, eventMarketId: existingId };

                        global.socketIo.to(commentaryId).emit("updateMarketData", formatMarketForSocket(updatedMarket));
                        console.log(`[Socket] Sent update for category ${marketValue.marketTypeCategoryId}, over ${marketValue.over}, market ${existingId}`);
                    }
                }
                return existingId;
            }

            // If ID is 0 and market doesn't exist in DB, insert it now
            console.log(`[DB] Market doesn't exist in DB - inserting new for category ${marketValue.marketTypeCategoryId}, over ${marketValue.over}`);
            newMarketId = await insertMarketWithRunners({ commentaryId, ...marketValue }, fastify);

            if (newMarketId !== 0) {
                // Update global state with the new ID
                updateGlobalMarketId(market, newMarketId);

                // Emit socket update AFTER database insert is complete
                if (global.socketIo) {
                    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
                    if (clientInRoom?.size) {
                        // Get the updated market from global state that matches BOTH ID and category
                        const updatedMarket = global.marketData[commentaryId].markets.find(
                            m => m.eventMarketId &&
                                m.eventMarketId.toString() === newMarketId.toString() &&
                                m.marketTypeCategoryId === marketValue.marketTypeCategoryId &&
                                m.over && m.over.toString() === marketValue.over.toString()
                        ) || { ...market, eventMarketId: newMarketId };

                        global.socketIo.to(commentaryId).emit("updateMarketData", formatMarketForSocket(updatedMarket));
                        console.log(`[Socket] Sent update for new market: category ${marketValue.marketTypeCategoryId}, over ${marketValue.over}, ID ${newMarketId}`);
                    }
                }
            }
            return newMarketId;
        } else {
            // Market already has an ID, just update its status - use full identifier combo
            console.log(`[DB] Updating existing market: ID=${marketId}, Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over}`);
            await updateExistingMarket(market, fastify);

            // Emit socket update AFTER database update is complete
            if (global.socketIo) {
                const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
                if (clientInRoom?.size) {
                    // Get the updated market from global state with precise matching
                    const updatedMarket = global.marketData[commentaryId].markets.find(
                        m => m.eventMarketId &&
                            m.eventMarketId.toString() === marketId.toString() &&
                            m.marketTypeCategoryId === marketValue.marketTypeCategoryId &&
                            m.over && m.over.toString() === marketValue.over.toString()
                    ) || market;

                    global.socketIo.to(commentaryId).emit("updateMarketData", formatMarketForSocket(updatedMarket));
                    console.log(`[Socket] Sent update for market: ID=${marketId}, Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over}`);
                }
            }
            return marketId;
        }
    } catch (error) {
        console.error(`[DB] Error updating market in DB:`, error);
        return market.eventMarketId || 0;
    }
}

/**
 * Finds an existing market ID in the database by attributes
 * @param {Object} market - The market to find
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<string|number|null>} - The existing ID or null
 */
async function findExistingMarketId(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market;

        // Build a query to find market by attributes
        let query = `
            SELECT "wrID" FROM "tblEventMarkets"
            WHERE "wrCommentaryId" = ${commentaryId}
        `;

        // For odd-even and lottery markets, use category, over and teamId for unique identification
        if (marketValue.marketTypeCategoryId === 35 || marketValue.marketTypeCategoryId === 28) {
            query += ` AND "wrMarketTypeCategoryId" = ${marketValue.marketTypeCategoryId}
                       AND "wrOver" = ${marketValue.over} 
                       AND "wrTeamID" = ${marketValue.teamId}`;
        } else {
            // For other markets, match by name + category
            query += ` AND "wrMarketName" = '${marketValue.marketName}'
                       AND "wrMarketTypeCategoryId" = ${marketValue.marketTypeCategoryId}`;
        }

        console.log(`[DB] Looking for existing market with precise matching: Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over}, Team=${marketValue.teamId}`);

        // Execute the query
        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            console.log(`[DB] Found existing market with ID ${result[0].wrID} for ${marketValue.marketName} (Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over})`);
            return result[0].wrID;
        }

        console.log(`[DB] No existing market found for Category=${marketValue.marketTypeCategoryId}, Over=${marketValue.over}, Team=${marketValue.teamId}`);
        return null;
    } catch (error) {
        console.error(`[DB] Error finding existing market:`, error);
        return null;
    }
}

/**
 * Inserts a new market with appropriate runners into the database
 * @param {Object} market - The market to insert
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<string|number>} - The new market ID
 */
async function insertMarketWithRunners(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market;

        // Build the insert query for the market
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
                ${commentaryId}, 
                '${marketValue.eventRefId || ""}', 
                ${marketValue.teamId || 0}, 
                ${marketValue.inningsId || 1},
                '${marketValue.marketName}', 
                ${marketValue.status || 1}, 
                ${marketValue.isPredefineMarket || false}, 
                ${marketValue.templateType || 1},
                ${marketValue.isOver || false}, 
                ${marketValue.over || 0}, 
                ${marketValue.isPlayer || false}, 
                ${marketValue.isAutoCancel || false},
                ${marketValue.autoOpenType || 0}, 
                ${marketValue.autoOpen || 0}, 
                ${marketValue.autoCloseType || 0}, 
                ${marketValue.beforeAutoClose || 0},
                ${marketValue.autoSuspendType || 0}, 
                ${marketValue.beforeAutoSuspend || 0}, 
                ${marketValue.isBallStart || false}, 
                ${marketValue.isAutoResultSet || false},
                ${marketValue.autoResultAfterBall || 0}, 
                ${marketValue.afterWicketAutoSuspend || 0}, 
                ${marketValue.afterWicketNotCreated || 0},
                ${marketValue.isActive || false}, 
                ${marketValue.marketTemplateId || 0}, 
                ${marketValue.margin || 0}, 
                ${marketValue.createType || 1},
                ${marketValue.marketTypeCategoryId || 0}, 
                ${marketValue.marketTypeId || 0}, 
                ${marketValue.rateSource || 1}, 
                ${marketValue.predefinedValue || 0},
                ${marketValue.delay || 0}, 
                ${marketValue.create || 0}, 
                ${marketValue.createRefId || 0}, 
                ${marketValue.openRefId || 0}, 
                ${marketValue.actionType || 0},
                ${marketValue.autoResultType || 0}, 
                ${marketValue.isSendData || false}, 
                ${marketValue.isAllow || false}, 
                ${marketValue.lineType || 0},
                ${marketValue.defaultBackSize || 100}, 
                ${marketValue.defaultLaySize || 100}, 
                ${marketValue.defaultIsSendData || false}, 
                ${marketValue.rateDiff || 0}
            ) RETURNING "wrID"
        `;

        // Execute the market insert query
        const insertResult = await fastify.db.query(insertQuery, {
            type: fastify.db.QueryTypes.INSERT
        });

        // Get the new market ID
        const newMarketId = insertResult[0][0].wrID;
        console.log(`[DB] New market inserted with ID: ${newMarketId}`);

        // Create appropriate runners based on market type
        let runners = [];

        // For odd-even markets - only create Odd and Even runners
        if (marketValue.marketTypeCategoryId === 35) {
            runners = [
                {
                    runner: "Odd",
                    line: 0,
                    backPrice: marketValue.backPrice || 1.9,
                    layPrice: marketValue.layPrice || 1.9,
                    backSize: marketValue.backSize || 100,
                    laySize: marketValue.laySize || 100,
                    selectionStatus: marketValue.status || 1
                },
                {
                    runner: "Even",
                    line: 0,
                    backPrice: marketValue.backPrice || 1.9,
                    layPrice: marketValue.layPrice || 1.9,
                    backSize: marketValue.backSize || 100,
                    laySize: marketValue.laySize || 100,
                    selectionStatus: marketValue.status || 1
                }
            ];
        }
        // For other markets, create at least one runner with the market name
        else {
            runners = marketValue.runners;
        }

        // Insert runners
        const createdRunners = [];
        for (let i = 0; i < runners.length; i++) {
            const runner = runners[i];
            const runnerInsertQuery = `
                INSERT INTO "tblMarketRunners" (
                    "wrEventMarketId", "wrRunner", "wrLine", "wrOverRate", 
                    "wrUnderRate", "wrBackPrice", "wrBackSize", "wrLayPrice", 
                    "wrLaySize", "wrLastUpdate", "wrSelectionId", "wrSelectionStatus"
                ) VALUES (
                    ${newMarketId}, 
                    '${runner.runner}', 
                    ${runner.line || 0}, 
                    ${runner.overRate || 0},
                    ${runner.underRate || 0}, 
                    ${runner.backPrice || 0}, 
                    ${runner.backSize || 100}, 
                    ${runner.layPrice || 0},
                    ${runner.laySize || 100}, 
                    NOW(), 
                    '${newMarketId}${(i + 1).toString().padStart(2, '0')}', 
                    ${runner.selectionStatus || marketValue.status || 1}
                ) RETURNING "wrRunnerId"
            `;

            try {
                const runnerResult = await fastify.db.query(runnerInsertQuery, {
                    type: fastify.db.QueryTypes.INSERT
                });

                const runnerId = runnerResult[0][0].wrRunnerId;
                console.log(`[DB] Runner "${runner.runner}" inserted with ID: ${runnerId}`);

                createdRunners.push({
                    ...runner,
                    runnerId: runnerId
                });
            } catch (error) {
                console.error(`[DB] Error inserting runner "${runner.runner}":`, error);
            }
        }

        // Generate market data JSON
        const marketData = {
            id: newMarketId,
            name: marketValue.marketName,
            status: marketValue.status || 1,
            runners: createdRunners.map(r => ({
                id: r.runnerId,
                name: r.runner,
                status: r.selectionStatus || marketValue.status || 1,
                price: {
                    back: r.backPrice,
                    lay: r.layPrice
                },
                size: {
                    back: r.backSize,
                    lay: r.laySize
                }
            }))
        };

        // Update market data in DB
        const dataUpdateQuery = `
            UPDATE "tblEventMarkets"
            SET "wrData" = '${JSON.stringify(marketData)}'
            WHERE "wrID" = ${newMarketId}
        `;

        await fastify.db.query(dataUpdateQuery, {
            type: fastify.db.QueryTypes.UPDATE
        });

        // Add runners to the original market object for socket emissions
        market.runners = createdRunners;

        return newMarketId;
    } catch (error) {
        console.error(`[DB] Error inserting market with runners:`, error);
        return 0;
    }
}

/**
 * Updates an existing market in the database (only status, result, settled time)
 * @param {Object} market - The market to update
 * @param {Object} fastify - Fastify instance
 */
async function updateExistingMarket(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market;
        const marketId = marketValue.eventMarketId || marketValue.id || 0;

        if (marketId === 0 || marketId === "0") {
            console.error(`[DB] Cannot update market with ID 0`);
            return;
        }

        // Build the update query - only update status, result, settled time
        let updateQuery = `
            UPDATE "tblEventMarkets" 
            SET "wrStatus" = ${marketValue.status}
        `;

        // Add result if available
        if (marketValue.result !== null && marketValue.result !== undefined) {
            updateQuery += `, "wrResult" = ${marketValue.result}`;
        }

        // Add settled time if available
        if (marketValue.settledTime) {
            updateQuery += `, "wrSettledTime" = '${marketValue.settledTime}'`;
        }

        // Add where condition
        updateQuery += ` WHERE "wrID" = ${marketId}`;

        // Execute the query
        await fastify.db.query(updateQuery, {
            type: fastify.db.QueryTypes.UPDATE
        });

        // Update runners if available
        if (marketValue.runners && marketValue.runners.length > 0) {
            for (const runner of marketValue.runners) {
                const runnerStatus = runner.selectionStatus || marketValue.status;
                const runnerId = runner.runnerId || runner.id;

                if (runnerId) {
                    const runnerUpdateQuery = `
                        UPDATE "tblMarketRunners"
                        SET "wrSelectionStatus" = ${runnerStatus}
                        WHERE "wrRunnerId" = ${runnerId} AND "wrEventMarketId" = ${marketId}
                    `;

                    await fastify.db.query(runnerUpdateQuery, {
                        type: fastify.db.QueryTypes.UPDATE
                    });
                }
            }
        }

        console.log(`[DB] Market ${marketId} updated successfully`);
    } catch (error) {
        console.error(`[DB] Error updating existing market:`, error);
    }
}

/**
 * Updates references to a market in the ball-to-action map
 * @param {number} commentaryId - Commentary ID
 * @param {Object} market - Market object
 * @param {string|number} newId - New market ID
 */
function updateBallToActionMapReferences(commentaryId, market, newId) {
    const { marketTypeCategoryId, over, teamId, eventMarketId } = market;

    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        console.log(`[GLOBAL] No ball-to-action map found for commentary ID ${commentaryId}`);
        return;
    }

    console.log(`[UPDATE_MAP] Updating ball-to-action references for market: category=${marketTypeCategoryId}, over=${over}, team=${teamId}, newId=${newId}`);

    let updatedCount = 0;

    // Check each ball's actions
    for (const [ball, actions] of Object.entries(global.marketData[commentaryId].ballToActionMap)) {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            // Match by both ID AND category, or by attributes if ID is 0
            if (
                // Case 1: Match by existing ID AND category if not 0
                (eventMarketId && eventMarketId !== 0 &&
                    action.marketId === eventMarketId.toString() &&
                    action.marketTypeCategoryId === marketTypeCategoryId) ||

                // Case 2: Match by attributes for markets with ID 0
                ((!action.marketId || action.marketId === '0') &&
                    action.marketTypeCategoryId === marketTypeCategoryId &&
                    action.over && over && action.over.toString() === over.toString() &&
                    (!teamId || !action.teamId || action.teamId.toString() === teamId.toString()))
            ) {
                // Update the market ID reference
                const oldId = global.marketData[commentaryId].ballToActionMap[ball][i].marketId;
                global.marketData[commentaryId].ballToActionMap[ball][i].marketId = newId.toString();
                updatedCount++;

                console.log(`[UPDATE_MAP] Updated reference at ball ${ball}, action ${action.action}, category ${marketTypeCategoryId}: ${oldId} -> ${newId}`);
            }
        }
    }

    if (updatedCount > 0) {
        console.log(`[UPDATE_MAP] Updated ${updatedCount} references in ball-to-action map for market with category ${marketTypeCategoryId}, over ${over}`);
    } else {
        console.log(`[UPDATE_MAP] No references found in ball-to-action map for market with category ${marketTypeCategoryId}, over ${over}`);
    }
}


function updateGlobalMarketId(market, newId) {
    const { commentaryId, ...marketValue } = market;

    if (!global.marketData || !global.marketData[commentaryId]) {
        console.log(`[GLOBAL] No global data found for commentary ID ${commentaryId}`);
        return;
    }

    // Find the market in global state
    const markets = global.marketData[commentaryId].markets;

    // When updating the ID, make sure we find the right market by checking both name and category
    const marketIndex = markets.findIndex(m =>
        m.marketTypeCategoryId === marketValue.marketTypeCategoryId &&
        m.over && m.over.toString() === marketValue.over.toString() &&
        (!m.teamId || !marketValue.teamId || m.teamId.toString() === marketValue.teamId.toString())
    );

    if (marketIndex !== -1) {
        // Log if we're overwriting an existing ID to help identify issues
        if (markets[marketIndex].eventMarketId &&
            markets[marketIndex].eventMarketId !== 0 &&
            markets[marketIndex].eventMarketId.toString() !== newId.toString()) {
            console.log(`[GLOBAL] ⚠️ WARNING: Overwriting existing market ID ${markets[marketIndex].eventMarketId} with new ID ${newId} for market ${marketValue.marketName} (category: ${marketValue.marketTypeCategoryId})`);
        }

        // Update the ID
        global.marketData[commentaryId].markets[marketIndex].eventMarketId = newId;
        console.log(`[GLOBAL] Updated market ID in global state: ${marketValue.marketName} (category: ${marketValue.marketTypeCategoryId}) -> ${newId}`);

        // Update other properties
        if (marketValue.status !== undefined) {
            global.marketData[commentaryId].markets[marketIndex].status = marketValue.status;
        }

        // Update ball-to-action map references
        updateBallToActionMapReferences(commentaryId, {
            ...marketValue,
            marketTypeCategoryId: marketValue.marketTypeCategoryId
        }, newId);

        return true;
    }

    console.log(`[GLOBAL] Market not found in global state: ${marketValue.marketName} (category: ${marketValue.marketTypeCategoryId}, over: ${marketValue.over})`);
    return false;
}

/**
 * Updates market status via socket
 * @param {Object} market - The market to update
 */
function updateMarketStatusInSocket(market) {
    try {
        const { commentaryId } = market;
        console.log(`[Socket] Sending market ${market.eventMarketId} status update: ${market.status}`);

        let marketToSend = market;

        // Try to get the most up-to-date market from global state if available
        if (global.marketData && global.marketData[commentaryId] && global.marketData[commentaryId].markets && market.eventMarketId) {
            const globalMarket = global.marketData[commentaryId].markets.find(
                m => m.eventMarketId && m.eventMarketId.toString() === market.eventMarketId.toString()
            );

            if (globalMarket) {
                // Use the global state market to ensure it has all data including runners
                marketToSend = globalMarket;
                console.log(`[Socket] Using market data from global state for market ${market.eventMarketId}`);
            }
        }

        // Format market data for socket
        const socketData = formatMarketForSocket(marketToSend);

        // Check if Socket.IO is initialized and emit the update
        if (global.socketIo) {
            const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
            if (clientInRoom?.size) {
                global.socketIo.to(commentaryId).emit("updateMarketData", formatMarketForSocket(socketData));
                console.log(`[Socket] Sent update to ${clientInRoom.size} clients in room ${commentaryId}`);
            }
        } else {
            console.log('[Socket] Socket.IO not initialized, skipping emission');
        }
    } catch (error) {
        console.error('[Socket] Error sending market update via socket:', error);
    }
}


module.exports = {
    updateMarketStatusInDB,
    updateMarketStatusInSocket,
    findExistingMarketId,
    updateGlobalMarketId,
    updateBallToActionMapReferences
};