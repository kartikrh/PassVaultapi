// marketActions.js
const { EventMarketStatus } = require('../utilities');

/**
 * Updates market status in the database
 * @param {Object} market - The market object to update
 */
function updateMarketStatusInDB(market) {
    console.log(`[DB] Updating market ${market.eventMarketId} to status: ${market.status}`);
    // DB update logic would be implemented here
    // This is a placeholder for the actual DB update functionality
}

/**
 * Updates market status in the socket
 * @param {Object} market - The market object to update
 */
function updateMarketStatusInSocket(market) {
    console.log(`[SOCKET] Sending market ${market.eventMarketId} with status: ${market.status}`);
    // Socket emit logic would be implemented here
    // This is a placeholder for the actual socket.emit functionality
}

/**
 * Opens a market
 * @param {Object} market - The market to open
 */
function openMarket(market) {
    if (!market) return;

    // Set status to OPEN
    market.status = EventMarketStatus.Open;
    market.wrStatus = EventMarketStatus.Open;

    // Update runners status if needed
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            runner.wrSelectionStatus = EventMarketStatus.Open;
        });
    }

    // Call update methods
    updateMarketStatusInDB(market);
    updateMarketStatusInSocket(market);

    console.log(`Market ${market.eventMarketId} opened`);
}

/**
 * Closes a market
 * @param {Object} market - The market to close
 */
function closeMarket(market) {
    if (!market) return;

    // Set status to CLOSED
    market.status = EventMarketStatus.Close;
    market.wrStatus = EventMarketStatus.Close;

    // Update runners status if needed
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            runner.wrSelectionStatus = EventMarketStatus.Close;
        });
    }

    // Call update methods
    updateMarketStatusInDB(market);
    updateMarketStatusInSocket(market);

    console.log(`Market ${market.eventMarketId} closed`);
}

/**
 * Settles a market
 * @param {Object} market - The market to settle
 * @param {number} totalScore - The current total score to determine result
 */
function settleMarket(market, totalScore) {
    if (!market) return;

    // Set status to SETTLED
    market.status = EventMarketStatus.Settled;
    market.wrStatus = EventMarketStatus.Settled;

    // For Odd/Even markets, determine the winner
    if (market.marketTypeCategoryId === 28) {
        const isEven = totalScore % 2 === 0;

        // Set result based on the odd/even outcome
        if (market.runners && market.runners.length > 0) {
            market.runners.forEach(runner => {
                // For EVEN runner
                if (runner.runner.toLowerCase().includes("even")) {
                    runner.wrSelectionStatus = isEven ? 7 : 8; // WIN : LOSE
                    if (isEven) {
                        market.wrResult = runner.runnerId;
                        market.result = runner.runnerId;
                    }
                }
                // For ODD runner
                else if (runner.runner.toLowerCase().includes("odd")) {
                    runner.wrSelectionStatus = isEven ? 8 : 7; // LOSE : WIN
                    if (!isEven) {
                        market.wrResult = runner.runnerId;
                        market.result = runner.runnerId;
                    }
                }
            });
        }
    }

    // Set settlement time
    market.wrSettledTime = new Date().toISOString();

    // Call update methods
    updateMarketStatusInDB(market);
    updateMarketStatusInSocket(market);

    console.log(`Market ${market.eventMarketId} settled with result: ${market.result}`);
}

module.exports = {
    openMarket,
    closeMarket,
    settleMarket,
    updateMarketStatusInDB,
    updateMarketStatusInSocket
};