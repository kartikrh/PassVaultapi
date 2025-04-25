// marketActions.js
const { errorLogger } = require('../utilities/logger');

/**
 * Updates market status in the database
 * @param {Object} market - The market to update
 * @returns {Promise} - Promise that resolves when update is complete
 */
async function updateMarketStatusInDB(market, fastify) {
    try {
        const { commentaryId, ...marketValue } = market
        // console.log(`[DB] Update for ${marketName}:`, marketValue, `(commentary_id: ${commentaryId})`);
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
            updateQuery += ` WHERE "wrID" = ${marketId}`;

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
                            WHERE "wrRunnerId" = ${runnerId} AND "wrEventMarketId" = ${marketId}
                        `;

                        await fastify.db.query(runnerUpdateQuery, {
                            type: fastify.db.QueryTypes.UPDATE
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
 * Updates market status via socket
 * @param {Object} market - The market to update
 */
function updateMarketStatusInSocket(market) {
    try {
        console.log(`[Socket] Sending market ${market.eventMarketId} status update: ${market.status}`);

        // Format market data for socket
        const socketData = formatMarketForSocket(market);

        // This would be replaced with actual socket emit code
        // Example:
        // io.to(`commentary_${market.commentaryId}`).emit('market_update', socketData);

        // For now, just log it
        console.log('[Socket] Formatted data:', JSON.stringify(socketData).substring(0, 100) + '...');
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
 */
function batchUpdateMarkets(markets) {
    if (!markets || markets.length === 0) {
        return;
    }

    console.log(`[DB] Batch updating ${markets.length} markets`);

    // Update each market in DB and socket
    markets.forEach(market => {
        updateMarketStatusInDB(market);
        updateMarketStatusInSocket(market);
    });
}

/**
 * Updates a specific field of a market
 * @param {Object} market - The market to update
 * @param {string} field - The field to update
 * @param {any} value - The new value
 */
function updateMarketField(market, field, value) {
    if (!market) {
        console.error('[DB] Cannot update field, market is null');
        return;
    }

    console.log(`[DB] Updating field ${field} on market ${market.eventMarketId || 'unsaved'}`);

    // Update the field
    market[field] = value;

    // Update in DB and socket
    updateMarketStatusInDB(market);
    updateMarketStatusInSocket(market);
}

module.exports = {
    updateMarketStatusInDB,
    updateMarketStatusInSocket,
    formatMarketForSocket,
    batchUpdateMarkets,
    updateMarketField
};