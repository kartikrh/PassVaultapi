// ballToActionMapper.js
const { updateMarketStatusInDB } = require('./marketActions');
const { formatBallNumber } = require('./utils');

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

    console.log(`Found ${actions.length} actions for ball ${formattedBall} before team filtering`);

    const marketIds = {};
    actions.forEach(action => {
        const key = `${action.marketId}`;
        if (marketIds[key]) {
            // If this market ID was already seen with a different category, log a warning
            if (marketIds[key] !== action.marketTypeCategoryId) {
                console.log(`[WARNING] Same market ID (${action.marketId}) used for different categories: ${marketIds[key]} and ${action.marketTypeCategoryId} at ball ${formattedBall}`);
            }
        } else {
            marketIds[key] = action.marketTypeCategoryId;
        }
    });


    // If a batting team is specified, filter actions to only include those for that team
    if (battingTeamId) {
        const filteredActions = actions.filter(action => {
            // If action has no team ID, it applies to all teams
            if (!action.teamId) {
                return true;
            }
            // Otherwise, check if it matches the batting team
            const matches = action.teamId.toString() === battingTeamId.toString();
            if (!matches) {
                console.log(`Filtering out action ${action.action} for market with over ${action.over}, category ${action.marketTypeCategoryId}, team ${action.teamId} (not matching batting team ${battingTeamId})`);
            }
            return matches;
        });

        console.log(`After team filtering: ${filteredActions.length} of ${actions.length} actions apply to team ${battingTeamId}`);
        return filteredActions;
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
/**
 * Find market by ID and category for specific market categories
 * @param {number} commentaryId - The commentary ID
 * @param {string} marketId - Market ID
 * @param {Object} metadata - Additional market metadata
 * @returns {Object|null} - Market object or null if not found
 */
function findMarket(commentaryId, marketId, metadata = {}) {
    if (!global.marketData || !global.marketData[commentaryId]) {
        return null;
    }

    const markets = global.marketData[commentaryId].markets;

    // If marketId is valid (not 0), search by ID AND category to ensure uniqueness
    if (marketId && marketId !== "0") {
        // Look for market with matching ID AND category if category is provided
        if (metadata.marketTypeCategoryId) {
            const marketByIdAndCategory = markets.find(m =>
                m.eventMarketId &&
                m.eventMarketId.toString() === marketId.toString() &&
                m.marketTypeCategoryId === metadata.marketTypeCategoryId
            );

            if (marketByIdAndCategory) {
                return marketByIdAndCategory;
            }
        } else {
            // If no category specified, just match by ID (existing behavior)
            const marketById = markets.find(m =>
                m.eventMarketId && m.eventMarketId.toString() === marketId
            );

            if (marketById) {
                return marketById;
            }
        }
    }

    // If market not found by ID+category or ID is 0, search by over + category + team
    if (metadata.over && metadata.marketTypeCategoryId) {
        return markets.find(m =>
            m.marketTypeCategoryId === metadata.marketTypeCategoryId &&
            m.over && m.over.toString() === metadata.over.toString() &&
            (!metadata.teamId || m.teamId.toString() === metadata.teamId.toString())
        );
    }

    return null;
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

/**
 * Manually closes all markets for a specific over and team
 * @param {number} commentaryId - Commentary ID
 * @param {string|number} over - Over number to close
 * @param {string|number} teamId - Team ID
 * @param {Object} fastify - Fastify instance
 * @returns {number} - Number of markets closed
 */
function closeMarketsForOver(commentaryId, over, teamId, fastify) {
    console.log(`[MANUAL] Attempting to close all markets for over ${over}, team ${teamId}`);

    if (!global.marketData || !global.marketData[commentaryId]) {
        console.error(`[MANUAL] No market data found for commentary ID ${commentaryId}`);
        return 0;
    }

    // Find markets for this over and team
    const markets = global.marketData[commentaryId].markets.filter(m =>
        m.over && m.over.toString() === over.toString() &&
        m.teamId && m.teamId.toString() === teamId.toString() &&
        (m.status !== 4 && m.status !== 5) // Not already closed or settled
    );

    console.log(`[MANUAL] Found ${markets.length} active markets for over ${over}, team ${teamId}`);

    // Close each market
    let closedCount = 0;
    markets.forEach(market => {
        console.log(`[MANUAL] Closing market "${market.marketName}" (ID: ${market.eventMarketId || 'unsaved'}, Category: ${market.marketTypeCategoryId})`);

        // Set status to closed
        market.status = 4; // CLOSE status
        market.commentaryId = commentaryId;

        // Update runners if available
        if (market.runners && market.runners.length > 0) {
            market.runners.forEach(runner => {
                runner.selectionStatus = 4;
            });
        }

        // Update in DB
        updateMarketStatusInDB(market, fastify);
        closedCount++;
    });

    return closedCount;
}
module.exports = {
    getActionsForBall,
    findMarket,
    oversToBalls,
    ballsToOvers,
    logFullBallToActionMap,
    getAllMappedActions,
    countActionTypes,
    isBattingTeamMarket,
    closeMarketsForOver
};