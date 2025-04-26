// marketActions.js
const { errorLogger } = require('../utilities/logger');

/**
 * Updates market status in the database
 * @param {Object} market - The market to update
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<string|number>} - The market ID after update
 */
async function updateMarketStatusInDB(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market;
        console.log(`[DB] Update for ${marketValue.marketName || 'market'}:`, `(ID: ${marketValue.eventMarketId || 0}, Status: ${marketValue.status})`);

        // Get market ID and other values
        const marketId = marketValue.eventMarketId || marketValue.id || 0;
        const marketStatus = marketValue.status;
        const marketResult = marketValue.result || null;
        const settledTime = marketValue.settledTime || null;

        let newMarketId = marketId;

        // First check if the market already exists in DB even if ID is 0
        if (marketId === 0 || marketId === "0") {
            const existingId = await findExistingMarketId(market, fastify);
            if (existingId) {
                console.log(`[DB] Found existing market with ID ${existingId} instead of creating new`);
                newMarketId = existingId;

                // Update the market's ID for subsequent operations
                marketValue.eventMarketId = existingId;
            }
        }

        // If marketId is still 0, insert a new market
        if (newMarketId === 0 || newMarketId === "0") {
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
            const insertResult = await fastify.db.query(insertQuery, {
                type: fastify.db.QueryTypes.INSERT
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

                    const runnerResult = await fastify.db.query(runnerInsertQuery, {
                        type: fastify.db.QueryTypes.INSERT
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

                await fastify.db.query(dataUpdateQuery, {
                    type: fastify.db.QueryTypes.UPDATE
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
            updateQuery += ` WHERE "wrID" = ${newMarketId}`;

            // Execute the query
            await fastify.db.query(updateQuery, {
                type: fastify.db.QueryTypes.UPDATE
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
                            WHERE "wrRunnerId" = ${runnerId} AND "wrEventMarketId" = ${newMarketId}
                        `;

                        await fastify.db.query(runnerUpdateQuery, {
                            type: fastify.db.QueryTypes.UPDATE
                        });
                    }
                }
            }
        }

        // Update the market in global market data and ball-to-action map
        if (marketId !== newMarketId || marketId === 0 || marketId === "0") {
            updateGlobalMarketId(market, newMarketId);
        }

        // Update market status in global data regardless of ID change
        updateGlobalMarketStatus(market, newMarketId, marketStatus, marketResult, settledTime);

        // Emit socket updates
        if (global.socketIo) {
            const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
            if (clientInRoom?.size) {
                // Format the market for socket emission
                const socketData = formatMarketForSocket({ ...market, eventMarketId: newMarketId });
                // Send the update
                global.socketIo.to(commentaryId).emit("updateMarket", [socketData]);
            }
        }

        console.log(`[DB] Market ${newMarketId} updated successfully`);
        return newMarketId;
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

        // If not found by ID or ID is 0, try to find by other attributes
        let query = `
            SELECT "wrID" FROM "tblEventMarkets"
            WHERE "wrCommentaryId" = ${commentaryId}
        `;

        // For odd-even markets, use over and teamId for unique identification
        if (marketValue.marketTypeCategoryId === 28 || marketValue.marketTypeCategoryId === 35) {
            query += ` AND "wrMarketTypeCategoryId" = ${marketValue.marketTypeCategoryId}
                       AND "wrOver" = ${marketValue.over} 
                       AND "wrTeamID" = ${marketValue.teamId}`;
        } else {
            // For other markets, match by name + category
            query += ` AND "wrMarketName" = '${marketValue.marketName}'
                       AND "wrMarketTypeCategoryId" = ${marketValue.marketTypeCategoryId}`;
        }

        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            return result[0].wrID;
        }

        return null;
    } catch (error) {
        console.error(`Error finding existing market:`, error);
        return null;
    }
}

/**
 * Updates a market ID in the global state
 * @param {Object} market - The market object
 * @param {string|number} newId - The new market ID
 */
function updateGlobalMarketId(market, newId) {
    const { commentaryId, ...marketValue } = market;

    if (!global.marketData || !global.marketData[commentaryId]) {
        return;
    }

    // Find the market in global state
    const markets = global.marketData[commentaryId].markets;
    const marketIndex = markets.findIndex(m => {
        // First try to match by ID if it's not 0
        if (marketValue.eventMarketId && marketValue.eventMarketId !== 0 &&
            m.eventMarketId && m.eventMarketId.toString() === marketValue.eventMarketId.toString()) {
            return true;
        }

        // For odd-even markets, match by category, over and team
        if ((m.marketTypeCategoryId === 28 || m.marketTypeCategoryId === 35) &&
            marketValue.marketTypeCategoryId === m.marketTypeCategoryId) {
            return m.over === marketValue.over && m.teamId === marketValue.teamId;
        }

        // For other markets, try to match by name and category
        return m.marketName === marketValue.marketName &&
            m.marketTypeCategoryId === marketValue.marketTypeCategoryId;
    });

    if (marketIndex !== -1) {
        // Update the ID
        global.marketData[commentaryId].markets[marketIndex].eventMarketId = newId;
        console.log(`[GLOBAL] Updated market ID in global state: ${newId}`);

        // Update ball-to-action map for this market
        updateBallToActionMapReferences(commentaryId, market, newId);
    }
}

/**
 * Updates market status and other fields in global state
 * @param {Object} market - The market object
 * @param {string|number} marketId - The market ID
 * @param {number} status - The new status
 * @param {number|null} result - The result (winner ID)
 * @param {string|null} settledTime - The settled time
 */
function updateGlobalMarketStatus(market, marketId, status, result, settledTime) {
    const { commentaryId, ...marketValue } = market;

    if (!global.marketData || !global.marketData[commentaryId]) {
        return;
    }

    // Find the market in global state
    const markets = global.marketData[commentaryId].markets;
    const marketIndex = markets.findIndex(m =>
        m.eventMarketId && m.eventMarketId.toString() === marketId.toString()
    );

    if (marketIndex !== -1) {
        // Update status and related fields
        global.marketData[commentaryId].markets[marketIndex].status = status;

        if (result !== null) {
            global.marketData[commentaryId].markets[marketIndex].result = result;
        }

        if (settledTime !== null) {
            global.marketData[commentaryId].markets[marketIndex].settledTime = settledTime;
        }

        // Update runners if available
        if (marketValue.runners && marketValue.runners.length > 0) {
            global.marketData[commentaryId].markets[marketIndex].runners =
                marketValue.runners.map(runner => ({
                    ...runner,
                    selectionStatus: runner.selectionStatus || status
                }));
        }

        console.log(`[GLOBAL] Updated market status in global state: ${status}`);
    }
}

/**
 * Updates references to a market in the ball-to-action map
 * @param {number} commentaryId - Commentary ID
 * @param {Object} market - Market object
 * @param {string|number} newId - New market ID
 */
function updateBallToActionMapReferences(commentaryId, market, newId) {
    const { marketTypeCategoryId, over, eventMarketId } = market;

    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        return;
    }

    let updatedCount = 0;

    // Check each ball's actions
    for (const [ball, actions] of Object.entries(global.marketData[commentaryId].ballToActionMap)) {
        actions.forEach((action, index) => {
            // Match by existing ID if not 0
            if (eventMarketId && eventMarketId !== 0 && action.marketId === eventMarketId.toString()) {
                global.marketData[commentaryId].ballToActionMap[ball][index].marketId = newId.toString();
                updatedCount++;
            }
            // Match by attributes for markets with ID 0
            else if ((action.marketId === '0' || !action.marketId) &&
                action.marketTypeCategoryId === marketTypeCategoryId &&
                action.over === over) {
                global.marketData[commentaryId].ballToActionMap[ball][index].marketId = newId.toString();
                updatedCount++;
            }
        });
    }

    if (updatedCount > 0) {
        console.log(`[GLOBAL] Updated ${updatedCount} references in ball-to-action map for market ID ${newId}`);
    }
}

/**
 * Updates market status via socket
 * @param {Object} market - The market to update
 */
function updateMarketStatusInSocket(market) {
    try {
        const { commentaryId } = market;
        console.log(`[Socket] Sending market ${market.eventMarketId} status update: ${market.status}`);

        // Format market data for socket
        const socketData = formatMarketForSocket(market);

        // Check if Socket.IO is initialized and emit the update
        if (global.socketIo) {
            const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
            if (clientInRoom?.size) {
                global.socketIo.to(commentaryId).emit("updateMarket", [socketData]);
                console.log(`[Socket] Sent update to ${clientInRoom.size} clients in room ${commentaryId}`);
            }
        } else {
            console.log('[Socket] Socket.IO not initialized, skipping emission');
        }
    } catch (error) {
        console.error('[Socket] Error sending market update via socket:', error);
    }
}

/**
 * Formats market data for socket transmission
 * @param {Object} market - The market to format
 * @returns {Object} - Formatted market data
 */
function formatMarketForSocket(market) {
    // Create a sanitized copy of runners if available
    const formattedRunners = market.runners ? market.runners.map(runner => ({
        id: runner.runnerId,
        name: runner.runner,
        status: runner.selectionStatus,
        price: {
            back: runner.backPrice,
            lay: runner.layPrice
        },
        size: {
            back: runner.backSize,
            lay: runner.laySize
        }
    })) : [];

    // Create the socket payload
    return {
        eventMarketId: market.eventMarketId,
        marketName: market.marketName,
        status: market.status,
        result: market.result,
        runners: formattedRunners,
        updateTimestamp: new Date().toISOString(),
        over: market.over,
        marketTypeCategoryId: market.marketTypeCategoryId,
        teamId: market.teamId,
        commentaryId: market.commentaryId
    };
}

/**
 * Batch updates multiple markets at once
 * @param {Array} markets - Array of markets to update
 * @param {Object} fastify - Fastify instance
 */
function batchUpdateMarkets(markets, fastify) {
    if (!markets || markets.length === 0) {
        return;
    }

    console.log(`[DB] Batch updating ${markets.length} markets`);

    // Update each market in DB and socket
    markets.forEach(market => {
        updateMarketStatusInDB(market, fastify);
        updateMarketStatusInSocket(market);
    });
}

/**
 * Updates a specific field of a market
 * @param {Object} market - The market to update
 * @param {string} field - The field to update
 * @param {any} value - The new value
 * @param {Object} fastify - Fastify instance
 */
function updateMarketField(market, field, value, fastify) {
    if (!market) {
        console.error('[DB] Cannot update field, market is null');
        return;
    }

    console.log(`[DB] Updating field ${field} on market ${market.eventMarketId || 'unsaved'}`);

    // Update the field
    market[field] = value;

    // Update in DB and socket
    updateMarketStatusInDB(market, fastify);
    updateMarketStatusInSocket(market);
}

module.exports = {
    updateMarketStatusInDB,
    updateMarketStatusInSocket,
    formatMarketForSocket,
    batchUpdateMarkets,
    updateMarketField,
    findExistingMarketId,
    updateGlobalMarketId,
    updateGlobalMarketStatus,
    updateBallToActionMapReferences
};