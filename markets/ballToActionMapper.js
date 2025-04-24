// ballToActionMapper.js
const { EventMarketStatus } = require('../utilities');

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
 * Formats ball number to ensure consistent representation
 * @param {number|string} ball - Ball number
 * @returns {string} - Formatted ball number
 */
function formatBallNumber(ball) {
    if (ball === null || ball === undefined) return null;

    const ballStr = ball.toString();
    // If no decimal, add ".0" to the end
    if (!ballStr.includes('.')) {
        return `${ballStr}.0`;
    }

    // For decimal numbers, ensure we have at least one digit after decimal
    const parts = ballStr.split('.');
    if (parts[1].length === 0) {
        return `${parts[0]}.0`;
    }

    return ballStr;
}

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
 * Maps an action to a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @param {string} action - Action to perform (open, close, settle)
 * @param {string} marketId - Market ID to act on
 * @param {Object} metadata - Additional market metadata
 */
function mapAction(commentaryId, ball, action, marketId, metadata = {}) {
    if (!ball) return;

    const ballActionMap = global.marketData[commentaryId].ballToActionMap;

    if (!ballActionMap[ball]) {
        ballActionMap[ball] = [];
    }

    // Create action object with metadata
    const actionObj = {
        action,
        marketId,
        ...metadata
    };

    // Check for duplicates before adding
    const isDuplicate = ballActionMap[ball].some(item =>
        item.action === action &&
        item.marketId === marketId &&
        item.over === metadata.over &&
        item.marketTypeCategoryId === metadata.marketTypeCategoryId
    );

    if (!isDuplicate) {
        ballActionMap[ball].push(actionObj);
    }
}

/**
 * Initializes ball to action map based on market templates
 * @param {Array} markets - Array of markets
 * @param {number} commentaryId - The commentary ID
 */
function initializeBallToActionMap(markets, commentaryId) {
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

    markets.forEach(market => {
        const marketId = market.eventMarketId ? market.eventMarketId.toString() : "0";
        const marketCategoryId = market.marketTypeCategoryId;
        const overValue = market.over ? market.over.toString() : null;

        // Additional metadata for the market action
        const marketMetadata = {
            over: overValue,
            marketTypeCategoryId: marketCategoryId
        };

        // Map when to open the market
        const openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);
        mapAction(commentaryId, openBall, "open", marketId, marketMetadata);

        // Map when to close the market
        const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);
        mapAction(commentaryId, closeBall, "close", marketId, marketMetadata);

        // Map when to settle the market (for odd-even and similar markets)
        if ((marketCategoryId === 28 || marketCategoryId === 35) && market.isAutoResultSet) {
            // Calculate settlement ball based on the over and autoResultAfterBall
            const settleBall = getBallFromOver(
                parseFloat(market.over) + (parseFloat(market.autoResultAfterBall || 0) / 10),
                market.matchTypeID || 2
            );
            mapAction(commentaryId, settleBall, "settle", marketId, marketMetadata);
        }
    });

    // Properly log the ball-to-action map structure
    console.log(`[INIT] Ball-to-action map initialized for commentary ID: ${commentaryId}`);

    // Log the count of balls with actions
    const ballCount = Object.keys(global.marketData[commentaryId].ballToActionMap).length;
    console.log(`Total balls mapped: ${ballCount}`);

    // Log sample of the map structure (first 3 entries)
    logBallToActionMapSample(commentaryId);
}

/**
 * Looks up actions for a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @returns {Array} - List of actions to perform
 */
function getActionsForBall(commentaryId, ball) {
    const formattedBall = formatBallNumber(ball);

    if (!global.marketData[commentaryId] ||
        !global.marketData[commentaryId].ballToActionMap ||
        !global.marketData[commentaryId].ballToActionMap[formattedBall]) {
        return [];
    }

    return global.marketData[commentaryId].ballToActionMap[formattedBall];
}

/**
 * Finds market by ID or by over value for specific market categories
 * @param {number} commentaryId - The commentary ID
 * @param {string} marketId - Market ID
 * @param {Object} metadata - Additional market metadata for fallback search
 * @returns {Object|null} - Market object or null if not found
 */
function findMarket(commentaryId, marketId, metadata = {}) {
    if (!global.marketData || !global.marketData[commentaryId]) {
        return null;
    }

    const markets = global.marketData[commentaryId].markets;

    // If marketId is valid (not 0), search by ID first
    if (marketId && marketId !== "0") {
        const marketById = markets.find(m =>
            m.eventMarketId && m.eventMarketId.toString() === marketId
        );

        if (marketById) {
            return marketById;
        }
    }

    // If market not found by ID or ID is 0, and we have over and market category,
    // search by those parameters (for odd-even markets)
    if (metadata.over &&
        (metadata.marketTypeCategoryId === 28 || metadata.marketTypeCategoryId === 35)) {

        return markets.find(m =>
            m.marketTypeCategoryId === metadata.marketTypeCategoryId &&
            m.over && m.over.toString() === metadata.over
        );
    }

    return null;
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

    // Log the first 3 balls (or fewer if less exist)
    const sampleCount = Math.min(3, balls.length);
    console.log(`Sample of ball-to-action map (showing ${sampleCount} of ${balls.length} balls):`);

    for (let i = 0; i < sampleCount; i++) {
        const ball = balls[i];
        const actions = map[ball];
        console.log(`Ball ${ball}:`, JSON.stringify(actions, null, 2));
    }

    // Create a summary of action types by counting
    const actionSummary = countActionTypes(map);
    console.log("Action summary:", actionSummary);
}

/**
 * Counts the types of actions in the ball-to-action map
 * @param {Object} map - The ball-to-action map
 * @returns {Object} - Summary of action counts
 */
function countActionTypes(map) {
    const summary = {
        open: 0,
        close: 0,
        settle: 0,
        total: 0
    };

    Object.values(map).forEach(actions => {
        actions.forEach(action => {
            if (action.action === 'open') summary.open++;
            else if (action.action === 'close') summary.close++;
            else if (action.action === 'settle') summary.settle++;
            summary.total++;
        });
    });

    return summary;
}

/**
 * Helper function to log the complete ball-to-action map
 * @param {number} commentaryId - The commentary ID
 */
function logFullBallToActionMap(commentaryId) {
    const map = global.marketData[commentaryId].ballToActionMap;
    const formattedActions = [];

    // Convert to a flat array format that's easier to review
    Object.entries(map).forEach(([ball, actions]) => {
        actions.forEach(action => {
            formattedActions.push({
                ball,
                action: action.action,
                marketId: action.marketId,
                over: action.over
            });
        });
    });

    console.log("Ball-to-action map (full):");
    console.log(JSON.stringify(formattedActions, null, 2));

    return formattedActions;
}

/**
 * Gets all mapped actions in a flat array format
 * @param {number} commentaryId - The commentary ID
 * @returns {Array} - Flat array of all actions with ball information
 */
function getAllMappedActions(commentaryId) {
    if (!global.marketData || !global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        return [];
    }

    const map = global.marketData[commentaryId].ballToActionMap;
    const allActions = [];

    Object.entries(map).forEach(([ball, actions]) => {
        actions.forEach(action => {
            allActions.push({
                ball,
                action: action.action,
                marketId: action.marketId,
                over: action.over,
                marketTypeCategoryId: action.marketTypeCategoryId
            });
        });
    });

    return allActions;
}

module.exports = {
    initializeBallToActionMap,
    getActionsForBall,
    findMarket,
    oversToBalls,
    ballsToOvers,
    formatBallNumber,
    logBallToActionMapSample,
    logFullBallToActionMap,
    getAllMappedActions,
    countActionTypes
};