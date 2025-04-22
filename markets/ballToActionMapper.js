// ballToActionMapper.js
const { EventMarketStatus } = require('../utilities');

// Global mapping of balls to actions
let ballToActionMap = {};

/**
 * Converts overs to balls
 * @param {number} overs - The over number (e.g., 5.3 = 5 overs and 3 balls)
 * @param {number} matchTypeId - The type of match
 * @returns {number} - Total balls
 */
function oversToBalls(overs, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over
    const fullOvers = Math.floor(overs);
    const balls = Math.round((overs - fullOvers) * 10);
    return fullOvers * BALLS_PER_OVER + balls;
}

/**
 * Converts balls to overs
 * @param {number} balls - Total balls
 * @param {number} matchTypeId - The type of match
 * @returns {number} - Overs in decimal format (e.g., 5.3 = 5 overs and 3 balls)
 */
function ballsToOvers(balls, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over
    if (parseInt(balls) === 0) return 0.0;

    const fullOvers = Math.floor(balls / BALLS_PER_OVER);
    const remainingBalls = balls % BALLS_PER_OVER;
    return parseFloat(fullOvers + remainingBalls / 10);
}

/**
 * Initializes ball to action map based on market templates
 * @param {Array} markets - Array of markets
 * @param {number} commentaryId - The commentary ID
 */
function initializeBallToActionMap(markets, commentaryId) {
    ballToActionMap[commentaryId] = {};

    markets.forEach(market => {
        const marketId = market.eventMarketId.toString();

        // Map when to open the market
        const openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);
        mapAction(commentaryId, openBall, "open", marketId);

        // Map when to close the market
        const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);
        mapAction(commentaryId, closeBall, "close", marketId);

        // Map when to settle the market (for odd-even markets)
        if (market.marketTypeCategoryId === 28 && market.isAutoResultSet) {
            // Calculate settlement ball based on the over and autoResultAfterBall
            const settleBall = getBallFromOver(
                parseFloat(market.over) + (parseFloat(market.autoResultAfterBall || 0) / 10),
                market.matchTypeID || 2
            );
            mapAction(commentaryId, settleBall, "settle", marketId);
        }
    });

    console.log(`[INIT] Ball-to-action map initialized for commentary ID: ${commentaryId}`);
}

/**
 * Gets ball number from over
 * @param {number} over - The over in decimal form (e.g. 5.3)
 * @param {number} matchTypeId - The match type ID
 * @returns {string} - Ball identifier (e.g. "5.3")
 */
function getBallFromOver(over, matchTypeId) {
    if (!over) return null;

    // For traditional format, just use the over value directly as it already represents the ball
    return over.toString();
}

/**
 * Maps an action to a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @param {string} action - Action to perform (open, close, settle)
 * @param {string} marketId - Market ID to act on
 */
function mapAction(commentaryId, ball, action, marketId) {
    if (!ball) return;

    if (!ballToActionMap[commentaryId]) {
        ballToActionMap[commentaryId] = {};
    }

    if (!ballToActionMap[commentaryId][ball]) {
        ballToActionMap[commentaryId][ball] = [];
    }

    ballToActionMap[commentaryId][ball].push({
        action,
        marketId
    });
}

/**
 * Looks up actions for a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @returns {Array} - List of actions to perform
 */
function getActionsForBall(commentaryId, ball) {
    if (!ballToActionMap[commentaryId] || !ballToActionMap[commentaryId][ball]) {
        return [];
    }

    return ballToActionMap[commentaryId][ball];
}

/**
 * Checks if market exists in global market data
 * @param {number} commentaryId - The commentary ID
 * @param {string} marketId - Market ID
 * @returns {Object|null} - Market object or null if not found
 */
function findMarket(commentaryId, marketId) {
    if (!global.marketData || !global.marketData[commentaryId]) {
        return null;
    }

    // Find market by ID
    const market = global.marketData[commentaryId].markets.find(
        m => m.eventMarketId.toString() === marketId
    );

    return market || null;
}

module.exports = {
    initializeBallToActionMap,
    getActionsForBall,
    findMarket,
    oversToBalls,
    ballsToOvers
};