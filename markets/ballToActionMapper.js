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
    if (!ball) {
        console.log(`[MAP] Skipping action mapping - no ball specified`);
        return;
    }

    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        console.log(`[MAP] No ballToActionMap found for commentary ${commentaryId}`);
        return;
    }

    const ballActionMap = global.marketData[commentaryId].ballToActionMap;

    if (!ballActionMap[ball]) {
        ballActionMap[ball] = [];
    }

    // Create a unique key for this action to avoid confusion
    const actionKey = `${metadata.marketTypeCategoryId}_${metadata.over}_${metadata.teamId || '0'}`;

    // Create action object with metadata
    const actionObj = {
        action,
        marketId,
        ...metadata,
        // Store the action key for easier identification
        actionKey
    };

    // Check for duplicates before adding
    const isDuplicate = ballActionMap[ball].some(item =>
        item.action === action &&
        item.marketId === marketId &&
        item.over === metadata.over &&
        item.marketTypeCategoryId === metadata.marketTypeCategoryId &&
        item.teamId === metadata.teamId
    );

    if (!isDuplicate) {
        ballActionMap[ball].push(actionObj);
        const marketType = metadata.marketTypeCategoryId === 35 ? 'Odd-Even' :
            metadata.marketTypeCategoryId === 28 ? 'Lottery' : 'Other';
        console.log(`[MAP] Added ${action} action for ${marketType} market (ID: ${marketId}, over: ${metadata.over || 'N/A'}, team: ${metadata.teamId || 'N/A'}) to ball ${ball}`);
    } else {
        console.log(`[MAP] Skipping duplicate action mapping for ball ${ball}`);
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

    // Group markets by type to verify we're not mixing them up
    const oddEvenMarkets = validMarkets.filter(m => m.marketTypeCategoryId === 35);
    const lotteryMarkets = validMarkets.filter(m => m.marketTypeCategoryId === 28);
    const otherMarkets = validMarkets.filter(m => m.marketTypeCategoryId !== 35 && m.marketTypeCategoryId !== 28);

    console.log(`[INIT] Mapping ${oddEvenMarkets.length} Odd-Even markets, ${lotteryMarkets.length} Lottery markets, ${otherMarkets.length} other markets`);

    // Make sure markets of the same type with the same over value have distinct IDs
    const verifyDistinctIds = (markets, category) => {
        const overToIds = {};
        markets.forEach(market => {
            if (!market.over) return;

            if (!overToIds[market.over]) {
                overToIds[market.over] = [];
            }

            overToIds[market.over].push(market.eventMarketId);
        });

        // Log any issues
        Object.entries(overToIds).forEach(([over, ids]) => {
            if (ids.length > 1) {
                console.warn(`[INIT] Warning: Multiple ${category} markets for over ${over} with different IDs: ${ids.join(', ')}`);
            }
        });
    };

    verifyDistinctIds(oddEvenMarkets, 'Odd-Even');
    verifyDistinctIds(lotteryMarkets, 'Lottery');

    // Now map each market
    validMarkets.forEach(market => {
        const marketId = market.eventMarketId ? market.eventMarketId.toString() : "0";
        const marketCategoryId = market.marketTypeCategoryId;
        const overValue = market.over ? market.over.toString() : null;

        // Additional metadata for the market action
        const marketMetadata = {
            over: overValue,
            marketTypeCategoryId: marketCategoryId,
            teamId: market.teamId,
            // Identify market type explicitly
            marketType: marketCategoryId === 35 ? 'odd-even' :
                marketCategoryId === 28 ? 'lottery' : 'other'
        };

        // Map when to open the market
        const openBall = getBallFromOver(market.autoOpen, market.matchTypeID || 2);
        mapAction(commentaryId, openBall, "open", marketId, marketMetadata);

        // Map when to close the market
        const closeBall = getBallFromOver(market.beforeAutoClose, market.matchTypeID || 2);
        mapAction(commentaryId, closeBall, "close", marketId, marketMetadata);

        // Map when to settle the market (for odd-even and lottery markets)
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
 * @param {number|string} battingTeamId - Optional, ID of the team currently batting
 * @returns {Array} - List of actions to perform
 */
function getActionsForBall(commentaryId, ball, battingTeamId) {
    const formattedBall = formatBallNumber(ball);
    console.log(`[GET] Looking for actions for ball ${formattedBall} in commentary ${commentaryId}`);

    if (!global.marketData[commentaryId] ||
        !global.marketData[commentaryId].ballToActionMap ||
        !global.marketData[commentaryId].ballToActionMap[formattedBall]) {
        console.log(`[GET] No actions found for ball ${formattedBall}`);
        return [];
    }

    const actions = global.marketData[commentaryId].ballToActionMap[formattedBall];
    console.log(`[GET] Found ${actions.length} actions for ball ${formattedBall}`);

    // Log all actions for debugging
    actions.forEach((action, i) => {
        const marketType = action.marketTypeCategoryId === 35 ? 'Odd-Even' :
            action.marketTypeCategoryId === 28 ? 'Lottery' : 'Other';
        console.log(`[GET] Action #${i + 1}: ${action.action} for ${marketType} market (ID: ${action.marketId}, over: ${action.over || 'N/A'})`);
    });

    // If a batting team is specified, filter actions to only include those for that team
    if (battingTeamId) {
        console.log(`[GET] Filtering actions for batting team ID: ${battingTeamId}`);
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
        console.log(`[FIND] No market data found for commentary ID: ${commentaryId}`);
        return null;
    }

    const markets = global.marketData[commentaryId].markets;

    // If marketId is valid (not 0), search by ID first
    if (marketId && marketId !== "0") {
        const marketById = markets.find(m =>
            m.eventMarketId && m.eventMarketId.toString() === marketId
        );

        if (marketById) {
            console.log(`[FIND] Found market by ID ${marketId}: ${marketById.marketName} (type: ${marketById.marketTypeCategoryId}, runners: ${marketById.runners?.length || 0})`);
            return marketById;
        }
    }

    // If market not found by ID or ID is 0, and we have over and market category,
    // search by those parameters (for odd-even and lottery markets)
    if (metadata.over !== undefined &&
        metadata.marketTypeCategoryId !== undefined &&
        (metadata.marketTypeCategoryId === 28 || metadata.marketTypeCategoryId === 35)) {

        console.log(`[FIND] Looking for ${metadata.marketTypeCategoryId === 35 ? 'Odd-Even' : 'Lottery'} market with over=${metadata.over}, category=${metadata.marketTypeCategoryId}, teamId=${metadata.teamId || 'any'}`);

        // Find all matching markets first to debug
        const matchingMarkets = markets.filter(m =>
            m.marketTypeCategoryId === metadata.marketTypeCategoryId &&
            m.over && m.over.toString() === metadata.over.toString()
        );

        if (matchingMarkets.length > 1) {
            console.log(`[FIND] Found ${matchingMarkets.length} markets matching criteria. Filtering by teamId.`);

            // Log all matching markets
            matchingMarkets.forEach((m, i) => {
                console.log(`[FIND] Match #${i + 1}: ID=${m.eventMarketId}, Name=${m.marketName}, TeamID=${m.teamId}, Runners=${m.runners?.length || 0}`);
            });
        }

        // Add teamId to search if available
        const marketByAttributes = markets.find(m =>
            m.marketTypeCategoryId === metadata.marketTypeCategoryId &&
            m.over && m.over.toString() === metadata.over.toString() &&
            (!metadata.teamId || m.teamId === metadata.teamId)
        );

        if (marketByAttributes) {
            console.log(`[FIND] Found ${metadata.marketTypeCategoryId === 35 ? 'Odd-Even' : 'Lottery'} market by attributes: ${marketByAttributes.marketName} (ID: ${marketByAttributes.eventMarketId}, runners: ${marketByAttributes.runners?.length || 0})`);
            return marketByAttributes;
        } else {
            console.log(`[FIND] No market found matching criteria (over=${metadata.over}, category=${metadata.marketTypeCategoryId}, teamId=${metadata.teamId || 'any'})`);

            // Log all markets for debugging
            console.log(`[FIND] Available markets (total ${markets.length}):`);
            markets.forEach((m, i) => {
                if (i < 10) { // Only log first 10 to avoid too much noise
                    console.log(`[FIND] Market #${i + 1}: ID=${m.eventMarketId}, Name=${m.marketName}, Type=${m.marketTypeCategoryId}, Over=${m.over}, TeamID=${m.teamId}, Runners=${m.runners?.length || 0}`);
                }
            });
        }
    }

    console.log(`[FIND] No market found for ID ${marketId} or attributes: ${JSON.stringify(metadata)}`);
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
                teamId: action.teamId,
                ...action
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