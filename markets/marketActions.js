// marketActions.js
const { errorLogger } = require('../utilities/logger');

/**
 * Updates market status in the database
 * @param {Object} market - The market to update
 * @returns {Promise} - Promise that resolves when update is complete
 */
function updateMarketStatusInDB(market) {
    try {
        console.log(`[DB] Updating market ${market.eventMarketId} status to ${market.status}`);

        // This would be replaced with actual DB update code
        // Example:
        // return db.query(
        //     'UPDATE tblEventMarkets SET "wrStatus" = $1, "wrResult" = $2, "wrSettledTime" = $3 WHERE "wrID" = $4',
        //     [market.status, market.result, market.settledTime, market.eventMarketId]
        // );

        // For now, just log it
        if (!market.eventMarketId || market.eventMarketId === "0") {
            console.log('[DB] Market has no ID yet, cannot update in DB');
        }

        return Promise.resolve();
    } catch (error) {
        console.error('[DB] Error updating market in DB:', error);
        return Promise.reject(error);
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