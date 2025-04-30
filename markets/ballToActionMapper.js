// ballToActionMapper.js
const { EventMarketStatus } = require('../utilities');
const fs = require('fs');

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

    // Handle negative values for match start
    if (parseFloat(ball) < 0) {
        return "0.0"; // Convert to first ball
    }

    // Convert to string
    const ballStr = ball.toString().trim();

    // If empty after trimming, return null
    if (!ballStr) return null;

    // If not a valid number, return null
    if (isNaN(parseFloat(ballStr))) return null;

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
    if (over === null || over === undefined) return null;

    // Handle negative values for match start (before ball 0.0)
    if (parseFloat(over) < 0) {
        return "0.0"; // Map to the first ball for match start
    }

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
 * Checks if the market belongs to the batting team
 * @param {Object} market - Market object
 * @param {number|string} battingTeamId - ID of the team currently batting
 * @returns {boolean} - True if market belongs to batting team or is team-independent
 */
function isBattingTeamMarket(market, battingTeamId) {
    // If no batting team is specified, assume all markets are valid
    if (!battingTeamId) return true;

    // If market has no team association, it's valid for both teams
    if (!market.teamId) return true;

    // Check if market belongs to the batting team
    return market.teamId.toString() === battingTeamId.toString();
}

/**
 * Initializes ball to action map based on market templates
 * @param {Array} markets - Array of markets
 * @param {number} commentaryId - The commentary ID
 * @param {number|string} battingTeamId - ID of the team currently batting
 */
function initializeBallToActionMap(markets, commentaryId, battingTeamId) {
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

    // Log the batting team for debugging
    console.log(`[INIT] Initializing ball-to-action map for batting team ID: ${battingTeamId || 'not specified'}`);

    // Filter markets for the batting team if specified
    const validMarkets = battingTeamId
        ? markets.filter(market => isBattingTeamMarket(market, battingTeamId))
        : markets;

    console.log(`[INIT] ${validMarkets.length} of ${markets.length} markets are valid for the batting team`);

    // Count market types to ensure both odd-even and lottery markets are included
    let marketTypeCounts = {};
    validMarkets.forEach(market => {
        const categoryId = market.marketTypeCategoryId;
        if (!marketTypeCounts[categoryId]) {
            marketTypeCounts[categoryId] = 0;
        }
        marketTypeCounts[categoryId]++;
    });

    console.log(`[INIT] Market type counts:`, marketTypeCounts);

    // Check for specific market types of interest
    if (marketTypeCounts[28]) {
        console.log(`[INIT] Found ${marketTypeCounts[28]} odd-even markets (type 28)`);
    } else {
        console.log(`[INIT] WARNING: No odd-even markets (type 28) found`);
    }

    if (marketTypeCounts[35]) {
        console.log(`[INIT] Found ${marketTypeCounts[35]} lottery markets (type 35)`);
    } else {
        console.log(`[INIT] WARNING: No lottery markets (type 35) found`);
    }

    // Process each valid market
    validMarkets.forEach(market => {
        const marketId = market.eventMarketId ? market.eventMarketId.toString() : "0";
        const marketCategoryId = market.marketTypeCategoryId;
        const overValue = market.over ? market.over.toString() : null;

        // Log specific market details for debugging
        if (marketCategoryId === 28 || marketCategoryId === 35) {
            const marketType = marketCategoryId === 28 ? 'odd-even' : 'lottery';
            console.log(`[INIT] Processing ${marketType} market for over ${overValue}:`);
            console.log(`  - Market name: ${market.marketName}`);
            console.log(`  - Market ID: ${marketId}`);
            console.log(`  - Status: ${market.status}`);
            console.log(`  - autoOpen: ${market.autoOpen}`);
            console.log(`  - beforeAutoClose: ${market.beforeAutoClose}`);
            console.log(`  - isAutoResultSet: ${market.isAutoResultSet}`);
            console.log(`  - autoResultAfterBall: ${market.autoResultAfterBall}`);
        }

        // Additional metadata for the market action
        const marketMetadata = {
            over: overValue,
            marketTypeCategoryId: marketCategoryId,
            teamId: market.teamId
        };

        // Map when to open the market
        let openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);

        // For match start, ensure market open is mapped to ball 0.0
        if (market.status === 2) { // If market is already OPEN
            openBall = "0.0"; // Force to first ball for already open markets
            console.log(`[INIT] Market ${market.marketName} is already OPEN, mapping open action to ball 0.0`);
        }

        if (openBall) {
            mapAction(commentaryId, openBall, "open", marketId, marketMetadata);
            console.log(`[INIT] Mapped 'open' action at ball ${openBall} for market ${market.marketName}`);
        } else {
            console.log(`[INIT] WARNING: Could not map 'open' action - invalid ball from autoOpen=${market.autoOpen}`);
        }

        // Map when to close the market - ensure the ball is properly formatted
        const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);

        // Skip mapping close action if market is already closed
        if (market.status === 4) { // Already CLOSED
            console.log(`[INIT] Market ${market.marketName} is already CLOSED, not mapping close action`);
        } else if (closeBall) {
            mapAction(commentaryId, closeBall, "close", marketId, marketMetadata);
            console.log(`[INIT] Mapped 'close' action at ball ${closeBall} for market ${market.marketName}`);
        } else {
            console.log(`[INIT] WARNING: Could not map 'close' action - invalid ball from beforeAutoClose=${market.beforeAutoClose}`);
        }

        // Map when to settle the market - for odd-even and lottery markets
        if ((marketCategoryId === 28 || marketCategoryId === 35) && market.isAutoResultSet) {
            // Skip settle mapping if market is already settled
            if (market.status === 5) { // Already SETTLED
                console.log(`[INIT] Market ${market.marketName} is already SETTLED, not mapping settle action`);
            } else {
                // Calculate settlement ball based on the over and autoResultAfterBall
                const autoResultAfterBall = parseFloat(market.autoResultAfterBall || 0);
                const overNumber = parseFloat(market.over || 0);
                const settleBallValue = overNumber + (autoResultAfterBall / 10);

                const settleBall = getBallFromOver(settleBallValue, market.matchTypeID || 2);

                if (settleBall) {
                    mapAction(commentaryId, settleBall, "settle", marketId, marketMetadata);
                    console.log(`[INIT] Mapped 'settle' action at ball ${settleBall} for market ${market.marketName}`);
                } else {
                    console.log(`[INIT] WARNING: Could not map 'settle' action - invalid ball from settle calculation=${settleBallValue}`);
                }
            }
        } else if (marketCategoryId === 28 || marketCategoryId === 35) {
            console.log(`[INIT] WARNING: Not mapping 'settle' action for ${marketCategoryId === 28 ? 'odd-even' : 'lottery'} market - isAutoResultSet=${market.isAutoResultSet}`);
        }
    });

    // Properly log the ball-to-action map structure
    console.log(`[INIT] Ball-to-action map initialized for commentary ID: ${commentaryId}`);

    // Log the count of balls with actions
    const ballCount = Object.keys(global.marketData[commentaryId].ballToActionMap).length;
    console.log(`Total balls mapped: ${ballCount}`);

    // Count actions by type
    const actionCounts = {
        open: 0,
        close: 0,
        settle: 0
    };

    // Count actions by market type
    marketTypeCounts = {
        28: { open: 0, close: 0, settle: 0 }, // odd-even
        35: { open: 0, close: 0, settle: 0 }  // lottery
    };

    // Process all balls to get action counts
    Object.values(global.marketData[commentaryId].ballToActionMap).forEach(actions => {
        actions.forEach(action => {
            // Count by action type
            if (actionCounts[action.action] !== undefined) {
                actionCounts[action.action]++;
            }

            // Count by market type
            if (marketTypeCounts[action.marketTypeCategoryId] &&
                marketTypeCounts[action.marketTypeCategoryId][action.action] !== undefined) {
                marketTypeCounts[action.marketTypeCategoryId][action.action]++;
            }
        });
    });

    console.log(`[INIT] Action counts:`, actionCounts);
    console.log(`[INIT] Market type action counts:`, marketTypeCounts);

    // Log sample of the map structure (first 3 entries)
    logBallToActionMapSample(commentaryId);
}

/**
 * Looks up actions for a specific ball
 * @param {number} commentaryId - The commentary ID
 * @param {string} ball - Ball identifier (e.g. "5.3")
 * @param {number|string} battingTeamId - Optional, ID of the team currently batting
 * @returns {Array} - List of actions to perform
 */
function getActionsForBall(commentaryId, ball, battingTeamId) {
    const formattedBall = formatBallNumber(ball);

    if (!global.marketData[commentaryId] ||
        !global.marketData[commentaryId].ballToActionMap ||
        !global.marketData[commentaryId].ballToActionMap[formattedBall]) {
        return [];
    }

    const actions = global.marketData[commentaryId].ballToActionMap[formattedBall];

    // If a batting team is specified, filter actions to only include those for that team
    if (battingTeamId) {
        return actions.filter(action => {
            // If action has no team ID, it applies to all teams
            if (!action.teamId) return true;
            // Otherwise, check if it matches the batting team
            return action.teamId.toString() === battingTeamId.toString();
        });
    }

    return actions;
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
                teamId: action.teamId
            });
        });
    });

    // Write the data to ballToAction.json
    fs.writeFileSync(`ballToAction-${commentaryId}.json`, JSON.stringify(ballToActionData, null, 2), 'utf8');

    console.log("Ball-to-action map has been saved to 'ballToAction.json'");
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
                over: action.over,
                teamId: action.teamId
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
                marketTypeCategoryId: action.marketTypeCategoryId,
                teamId: action.teamId
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
    countActionTypes,
    isBattingTeamMarket
};