// playerModule.js
const { EventMarketStatus } = require('../utilities');
const { updateMarketStatusInDB } = require('./marketActions');
const { formatBallNumber } = require('./utils');
const PLAYER_CONFIG = require('./playerConfig'); // Import configuration

// Constants for player module (now using config)
const PLAYER_MODULE_CONSTANTS = {
    RUN_LINE_BUFFER: PLAYER_CONFIG.LINE_BUFFERS.RUN_BUFFER,
    BOUNDARY_LINE_BUFFER: PLAYER_CONFIG.LINE_BUFFERS.BOUNDARY_BUFFER,
    BALLS_FACED_LINE_BUFFER: PLAYER_CONFIG.LINE_BUFFERS.BALLS_FACED_BUFFER,
    DEFAULT_BALL_TYPE: PLAYER_CONFIG.BALL_TYPES.DEFAULT,
    EXCLUDED_BALL_TYPES: PLAYER_CONFIG.BALL_TYPES.EXCLUDED,

    // Market categories for player markets
    PLAYER_RUN_CATEGORY: PLAYER_CONFIG.MARKET_CATEGORIES.PLAYER_RUN,
    PLAYER_BOUNDARY_CATEGORY: PLAYER_CONFIG.MARKET_CATEGORIES.PLAYER_BOUNDARY,
    PLAYER_BALL_FACED_CATEGORY: PLAYER_CONFIG.MARKET_CATEGORIES.PLAYER_BALL_FACED
};

// Global player tracking object
if (!global.playerTracking) {
    global.playerTracking = {};
}

/**
 * Processes dynamic player markets
 * @param {Object} payload - The incoming payload with player data
 * @param {Object} fastify - Fastify instance
 */
function processDynamicPlayerMarkets(payload, fastify) {
    try {
        const playerPredictScore = payload.playerpredictscore || {};
        const predictScore = payload.predictscore || {};

        const commentaryId = playerPredictScore.commentary_id || payload.commentary_id;
        const currentBall = playerPredictScore.current_ball || predictScore.ball;
        const playerDetails = playerPredictScore.player_details || [];
        const ballByBallId = playerPredictScore.ball_by_ball_id;
        const currentTeamId = playerPredictScore.current_team_id || predictScore.strike_team_id;

        // Get ball type (default to 1 if not found)
        const ballType = payload.ball_by_ball_details?.ballTypeId || PLAYER_MODULE_CONSTANTS.DEFAULT_BALL_TYPE;

        console.log(`[PLAYER_MODULE] Processing dynamic player markets for commentary ${commentaryId}, ball ${currentBall}`);
        console.log(`[PLAYER_MODULE] Ball type: ${ballType}, Players in payload: ${playerDetails.length}`);

        // Check if commentary has player market templates
        if (!global.marketData || !global.marketData[commentaryId] || !global.marketData[commentaryId].template) {
            console.log(`[PLAYER_MODULE] No market data or templates found for commentary ${commentaryId}`);
            return { success: false, error: 'No market data found' };
        }

        const templates = global.marketData[commentaryId].template;
        const playerTemplates = templates.filter(template =>
            template.marketTypeCategoryId === PLAYER_MODULE_CONSTANTS.PLAYER_RUN_CATEGORY ||
            template.marketTypeCategoryId === PLAYER_MODULE_CONSTANTS.PLAYER_BOUNDARY_CATEGORY ||
            template.marketTypeCategoryId === PLAYER_MODULE_CONSTANTS.PLAYER_BALL_FACED_CATEGORY
        );

        if (playerTemplates.length === 0) {
            console.log(`[PLAYER_MODULE] No player market templates found for commentary ${commentaryId}`);
            return { success: false, error: 'No player templates found' };
        }

        console.log(`[PLAYER_MODULE] Found ${playerTemplates.length} player templates:`,
            playerTemplates.map(t => `Category ${t.marketTypeCategoryId}`));

        // Step 1: Check assigned categories and close unassigned ones
        const assignedCategories = playerTemplates.map(t => t.marketTypeCategoryId);
        closeUnassignedPlayerMarkets(commentaryId, assignedCategories, fastify);

        // Initialize player tracking for this commentary if not exists
        if (!global.playerTracking[commentaryId]) {
            global.playerTracking[commentaryId] = {};
        }

        // Step 2: Process current players
        const currentPlayerIds = playerDetails.map(p => p.player_id);

        // Handle players that are no longer in the list (gone players)
        handleGonePlayers(commentaryId, currentPlayerIds, currentBall, ballType, fastify);

        // Step 3: Process current players
        playerDetails.forEach(player => {
            processPlayerMarkets(commentaryId, player, playerTemplates, currentBall, ballType, fastify);
        });

        // Step 4: Update ball counters for active players (only for valid ball types)
        if (!PLAYER_MODULE_CONSTANTS.EXCLUDED_BALL_TYPES.includes(ballType)) {
            updatePlayerBallCounters(commentaryId, currentPlayerIds, currentBall);
        }

        console.log(`[PLAYER_MODULE] Completed processing for ${playerDetails.length} players`);

        return { success: true, message: `Processed ${playerDetails.length} players` };

    } catch (error) {
        console.error(`[PLAYER_MODULE] Error processing dynamic player markets:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Closes markets for unassigned player categories
 * @param {number} commentaryId - Commentary ID
 * @param {Array} assignedCategories - Array of assigned category IDs
 * @param {Object} fastify - Fastify instance
 */
function closeUnassignedPlayerMarkets(commentaryId, assignedCategories, fastify) {
    const allPlayerCategories = [
        PLAYER_MODULE_CONSTANTS.PLAYER_RUN_CATEGORY,
        PLAYER_MODULE_CONSTANTS.PLAYER_BOUNDARY_CATEGORY,
        PLAYER_MODULE_CONSTANTS.PLAYER_BALL_FACED_CATEGORY
    ];

    const unassignedCategories = allPlayerCategories.filter(cat => !assignedCategories.includes(cat));

    if (unassignedCategories.length === 0) {
        console.log(`[PLAYER_MODULE] All player categories are assigned`);
        return;
    }

    console.log(`[PLAYER_MODULE] Closing markets for unassigned categories:`, unassignedCategories);

    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].markets) {
        return;
    }

    const markets = global.marketData[commentaryId].markets;

    unassignedCategories.forEach(categoryId => {
        const marketsToClose = markets.filter(market =>
            market.marketTypeCategoryId === categoryId &&
            (market.status === EventMarketStatus.Open || market.status === EventMarketStatus.Inactive)
        );

        marketsToClose.forEach(market => {
            console.log(`[PLAYER_MODULE] Cancelling unassigned market: ${market.marketName} (Category: ${categoryId})`);

            market.status = EventMarketStatus.Cancel;
            market.commentaryId = commentaryId;

            // Update runners
            if (market.runners) {
                market.runners.forEach(runner => {
                    runner.selectionStatus = EventMarketStatus.Cancel;
                });
            }

            updateMarketStatusInDB(market, fastify);
        });

        console.log(`[PLAYER_MODULE] Cancelled ${marketsToClose.length} markets for category ${categoryId}`);
    });
}

/**
 * Handles players that are no longer in the current player list
 * @param {number} commentaryId - Commentary ID
 * @param {Array} currentPlayerIds - Array of current player IDs
 * @param {string|number} currentBall - Current ball
 * @param {number} ballType - Ball type
 * @param {Object} fastify - Fastify instance
 */
function handleGonePlayers(commentaryId, currentPlayerIds, currentBall, ballType, fastify) {
    const tracking = global.playerTracking[commentaryId];

    if (!tracking) return;

    const trackedPlayerIds = Object.keys(tracking).map(id => parseInt(id));
    const gonePlayerIds = trackedPlayerIds.filter(id => !currentPlayerIds.includes(id));

    if (gonePlayerIds.length === 0) {
        console.log(`[PLAYER_MODULE] No players have left the field`);
        return;
    }

    console.log(`[PLAYER_MODULE] Players no longer in list:`, gonePlayerIds);

    gonePlayerIds.forEach(playerId => {
        const playerTracking = tracking[playerId];
        if (!playerTracking) return;

        console.log(`[PLAYER_MODULE] Processing departure of player ${playerId} (${playerTracking.playerName})`);

        // Check if player was wicket or just removed
        const wasWicket = playerTracking.isWicket === 1;

        if (wasWicket) {
            // Player was dismissed - settle markets after autoResultafterBall
            settlePlayerMarketsAfterDelay(commentaryId, playerId, currentBall, fastify);
        } else {
            // Player suddenly removed - cancel markets immediately
            cancelPlayerMarkets(commentaryId, playerId, fastify);
        }

        // Remove from tracking
        delete tracking[playerId];
    });
}

/**
 * Processes markets for a specific player
 * @param {number} commentaryId - Commentary ID
 * @param {Object} player - Player data
 * @param {Array} playerTemplates - Player market templates
 * @param {string|number} currentBall - Current ball
 * @param {number} ballType - Ball type
 * @param {Object} fastify - Fastify instance
 */
function processPlayerMarkets(commentaryId, player, playerTemplates, currentBall, ballType, fastify) {
    const playerId = player.player_id;
    const playerName = player.player_name;

    // Initialize or update player tracking
    if (!global.playerTracking[commentaryId][playerId]) {
        global.playerTracking[commentaryId][playerId] = {
            playerName: playerName,
            teamId: player.team_id,
            ballsCountedSinceAppearance: 0,
            firstAppearedBall: currentBall,
            isWicket: player.isWicket || 0,
            lastSeenBall: currentBall
        };

        console.log(`[PLAYER_MODULE] New player tracked: ${playerName} (ID: ${playerId}) from ball ${currentBall}`);
    } else {
        // Update existing tracking
        global.playerTracking[commentaryId][playerId].isWicket = player.isWicket || 0;
        global.playerTracking[commentaryId][playerId].lastSeenBall = currentBall;
    }

    const playerTracking = global.playerTracking[commentaryId][playerId];

    // Process each template for this player
    playerTemplates.forEach(template => {
        processPlayerMarketTemplate(commentaryId, player, template, playerTracking, currentBall, fastify);
    });
}

/**
 * Processes a specific market template for a player
 * @param {number} commentaryId - Commentary ID
 * @param {Object} player - Player data
 * @param {Object} template - Market template
 * @param {Object} playerTracking - Player tracking data
 * @param {string|number} currentBall - Current ball
 * @param {Object} fastify - Fastify instance
 */
function processPlayerMarketTemplate(commentaryId, player, template, playerTracking, currentBall, fastify) {
    const playerId = player.player_id;
    const playerName = player.player_name;

    // Convert template timings from overs to balls
    const createBalls = oversToBalls(parseFloat(template.create || 0));
    const autoOpenBalls = oversToBalls(parseFloat(template.autoOpen || 0));
    const beforeAutoCloseBalls = oversToBalls(parseFloat(template.beforeAutoClose || 0));
    const autoResultAfterBalls = parseFloat(template.autoResultafterBall || 0);

    console.log(`[PLAYER_MODULE] Processing template ${template.marketTypeCategoryId} for player ${playerName}`);
    console.log(`[PLAYER_MODULE] Balls counted: ${playerTracking.ballsCountedSinceAppearance}, Create at: ${createBalls}, Open at: ${autoOpenBalls}`);

    // Find existing market for this player and template
    let market = findPlayerMarket(commentaryId, playerId, template.marketTypeCategoryId);

    // Check if we should create market
    if (!market && playerTracking.ballsCountedSinceAppearance >= createBalls) {
        market = createPlayerMarket(commentaryId, player, template, fastify);
        console.log(`[PLAYER_MODULE] Created market for player ${playerName}, category ${template.marketTypeCategoryId}`);
    }

    if (!market) {
        console.log(`[PLAYER_MODULE] No market to process for player ${playerName}, category ${template.marketTypeCategoryId}`);
        return;
    }

    // Update market line based on player stats
    updatePlayerMarketLine(market, player, template.marketTypeCategoryId);

    // Check market status transitions
    let statusChanged = false;

    // Open market if conditions are met
    if (market.status === EventMarketStatus.Inactive &&
        playerTracking.ballsCountedSinceAppearance >= autoOpenBalls) {
        market.status = EventMarketStatus.Open;
        statusChanged = true;
        console.log(`[PLAYER_MODULE] Opened market for player ${playerName}, category ${template.marketTypeCategoryId}`);
    }

    // Close market if conditions are met
    if (market.status === EventMarketStatus.Open &&
        playerTracking.ballsCountedSinceAppearance >= beforeAutoCloseBalls) {
        market.status = EventMarketStatus.Close;
        statusChanged = true;
        console.log(`[PLAYER_MODULE] Closed market for player ${playerName}, category ${template.marketTypeCategoryId}`);
    }

    // Settle market if player is dismissed
    if (player.isWicket === 1 &&
        (market.status === EventMarketStatus.Close || market.status === EventMarketStatus.Open) &&
        playerTracking.ballsCountedSinceAppearance >= (beforeAutoCloseBalls + autoResultAfterBalls)) {
        settlePlayerMarket(market, player, template.marketTypeCategoryId, fastify);
        statusChanged = true;
        console.log(`[PLAYER_MODULE] Settled market for dismissed player ${playerName}, category ${template.marketTypeCategoryId}`);
    }

    // Update market in DB if status changed or line updated
    if (statusChanged) {
        market.commentaryId = commentaryId;
        updateMarketStatusInDB(market, fastify);
    }
}

/**
 * Finds existing player market
 * @param {number} commentaryId - Commentary ID
 * @param {number} playerId - Player ID
 * @param {number} marketTypeCategoryId - Market category ID
 * @returns {Object|null} - Market object or null
 */
function findPlayerMarket(commentaryId, playerId, marketTypeCategoryId) {
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].markets) {
        return null;
    }

    return global.marketData[commentaryId].markets.find(market =>
        market.playerId === playerId &&
        market.marketTypeCategoryId === marketTypeCategoryId
    );
}

/**
 * Creates a new player market
 * @param {number} commentaryId - Commentary ID
 * @param {Object} player - Player data
 * @param {Object} template - Market template
 * @param {Object} fastify - Fastify instance
 * @returns {Object} - Created market
 */
function createPlayerMarket(commentaryId, player, template, fastify) {
    const playerId = player.player_id;
    const playerName = player.player_name;

    // Create market name by replacing {player} placeholder
    const marketName = template.templateName.replace("{player}", playerName);

    // Calculate initial line based on player stats
    let initialLine = 0;
    switch (template.marketTypeCategoryId) {
        case PLAYER_MODULE_CONSTANTS.PLAYER_RUN_CATEGORY:
            initialLine = parseInt(player.batRun || 0) + PLAYER_MODULE_CONSTANTS.RUN_LINE_BUFFER;
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BOUNDARY_CATEGORY:
            initialLine = parseInt(player.current_boundaries || 0) + PLAYER_MODULE_CONSTANTS.BOUNDARY_LINE_BUFFER;
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BALL_FACED_CATEGORY:
            initialLine = parseInt(player.balls_faced || 0) + PLAYER_MODULE_CONSTANTS.BALLS_FACED_LINE_BUFFER;
            break;
    }

    // Create market object
    const market = {
        eventMarketId: 0, // Will be set when saved to DB
        isCreate: true,
        status: EventMarketStatus.Inactive, // Start as inactive
        margin: parseFloat(template.margin) || 5.0,
        data: "",
        playerId: playerId,
        teamId: player.team_id,
        commentaryId: commentaryId,
        marketName: marketName,
        marketTypeCategoryId: template.marketTypeCategoryId,
        marketTypeId: template.marketTypeId,
        marketTemplateId: template.marketTemplateId,
        isActive: template.isDefaultMarketActive || true,
        isAllow: template.isDefaultBetAllowed || false,
        inningsId: 1,
        lineType: template.lineType || 2,
        defaultBackSize: template.defaultBackSize || 90,
        defaultLaySize: template.defaultLaySize || 110,
        isPredefineRunnerValue: template.isPredefineRunnerValue || false,
        runners: createPlayerMarketRunners(template, initialLine, player)
    };

    // Add to global markets
    global.marketData[commentaryId].markets.push(market);

    console.log(`[PLAYER_MODULE] Created market: ${marketName} with initial line: ${initialLine}`);

    return market;
}

/**
 * Creates runners for player market
 * @param {Object} template - Market template
 * @param {number} line - Market line
 * @param {Object} player - Player data
 * @returns {Array} - Array of runners
 */
function createPlayerMarketRunners(template, line, player) {
    // Create standard Over/Under runners for player markets
    return [
        {
            marketTemplateRunnerId: 0,
            runnerId: 0,
            marketTemplateId: template.marketTemplateId,
            runner: "Over",
            line: line,
            overRate: PLAYER_CONFIG.DEFAULTS.OVER_RATE,
            underRate: PLAYER_CONFIG.DEFAULTS.UNDER_RATE,
            backPrice: PLAYER_CONFIG.DEFAULTS.BACK_PRICE,
            layPrice: PLAYER_CONFIG.DEFAULTS.LAY_PRICE,
            backSize: template.defaultBackSize || PLAYER_CONFIG.DEFAULTS.BACK_SIZE,
            laySize: template.defaultLaySize || PLAYER_CONFIG.DEFAULTS.LAY_SIZE,
            lastUpdate: new Date().toISOString(),
            selectionId: `${player.player_id}_over`,
            order: 1,
            selectionStatus: PLAYER_CONFIG.MARKET_STATUS.INACTIVE
        },
        {
            marketTemplateRunnerId: 0,
            runnerId: 0,
            marketTemplateId: template.marketTemplateId,
            runner: "Under",
            line: line,
            overRate: PLAYER_CONFIG.DEFAULTS.OVER_RATE,
            underRate: PLAYER_CONFIG.DEFAULTS.UNDER_RATE,
            backPrice: PLAYER_CONFIG.DEFAULTS.BACK_PRICE,
            layPrice: PLAYER_CONFIG.DEFAULTS.LAY_PRICE,
            backSize: template.defaultBackSize || PLAYER_CONFIG.DEFAULTS.BACK_SIZE,
            laySize: template.defaultLaySize || PLAYER_CONFIG.DEFAULTS.LAY_SIZE,
            lastUpdate: new Date().toISOString(),
            selectionId: `${player.player_id}_under`,
            order: 2,
            selectionStatus: PLAYER_CONFIG.MARKET_STATUS.INACTIVE
        }
    ];
}

/**
 * Updates player market line based on current stats
 * @param {Object} market - Market object
 * @param {Object} player - Player data
 * @param {number} marketTypeCategoryId - Market category ID
 */
function updatePlayerMarketLine(market, player, marketTypeCategoryId) {
    let newLine = 0;

    switch (marketTypeCategoryId) {
        case PLAYER_MODULE_CONSTANTS.PLAYER_RUN_CATEGORY:
            newLine = parseInt(player.batRun || 0) + PLAYER_MODULE_CONSTANTS.RUN_LINE_BUFFER;
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BOUNDARY_CATEGORY:
            newLine = parseInt(player.current_boundaries || 0) + PLAYER_MODULE_CONSTANTS.BOUNDARY_LINE_BUFFER;
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BALL_FACED_CATEGORY:
            newLine = parseInt(player.balls_faced || 0) + PLAYER_MODULE_CONSTANTS.BALLS_FACED_LINE_BUFFER;
            break;
    }

    // Update line for all runners
    if (market.runners) {
        market.runners.forEach(runner => {
            runner.line = newLine;
            runner.lastUpdate = new Date().toISOString();
        });
    }

    console.log(`[PLAYER_MODULE] Updated line for market ${market.marketName}: ${newLine}`);
}

/**
 * Updates ball counters for active players
 * @param {number} commentaryId - Commentary ID
 * @param {Array} currentPlayerIds - Array of current player IDs
 * @param {string|number} currentBall - Current ball
 */
function updatePlayerBallCounters(commentaryId, currentPlayerIds, currentBall) {
    const tracking = global.playerTracking[commentaryId];
    if (!tracking) return;

    currentPlayerIds.forEach(playerId => {
        if (tracking[playerId]) {
            tracking[playerId].ballsCountedSinceAppearance++;
            console.log(`[PLAYER_MODULE] Player ${tracking[playerId].playerName} ball count: ${tracking[playerId].ballsCountedSinceAppearance}`);
        }
    });
}

/**
 * Settles player market
 * @param {Object} market - Market to settle
 * @param {Object} player - Player data
 * @param {number} marketTypeCategoryId - Market category ID
 * @param {Object} fastify - Fastify instance
 */
function settlePlayerMarket(market, player, marketTypeCategoryId, fastify) {
    let actualValue = 0;

    switch (marketTypeCategoryId) {
        case PLAYER_MODULE_CONSTANTS.PLAYER_RUN_CATEGORY:
            actualValue = parseInt(player.batRun || 0);
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BOUNDARY_CATEGORY:
            actualValue = parseInt(player.current_boundaries || 0);
            break;
        case PLAYER_MODULE_CONSTANTS.PLAYER_BALL_FACED_CATEGORY:
            actualValue = parseInt(player.balls_faced || 0);
            break;
    }

    market.status = EventMarketStatus.Settled;
    market.settledTime = new Date().toISOString();

    // Determine winners based on actual value vs line
    if (market.runners) {
        market.runners.forEach(runner => {
            const line = runner.line || 0;

            if (runner.runner.toLowerCase() === 'over') {
                runner.selectionStatus = actualValue > line ? EventMarketStatus.Win : EventMarketStatus.Lose;
                if (runner.selectionStatus === EventMarketStatus.Win) {
                    market.result = runner.runnerId;
                }
            } else if (runner.runner.toLowerCase() === 'under') {
                runner.selectionStatus = actualValue < line ? EventMarketStatus.Win : EventMarketStatus.Lose;
                if (runner.selectionStatus === EventMarketStatus.Win) {
                    market.result = runner.runnerId;
                }
            }
        });
    }

    console.log(`[PLAYER_MODULE] Settled market ${market.marketName}: actual ${actualValue}, line ${market.runners[0]?.line}`);
}

/**
 * Cancels player markets when player is suddenly removed
 * @param {number} commentaryId - Commentary ID
 * @param {number} playerId - Player ID
 * @param {Object} fastify - Fastify instance
 */
function cancelPlayerMarkets(commentaryId, playerId, fastify) {
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].markets) {
        return;
    }

    const playerMarkets = global.marketData[commentaryId].markets.filter(market =>
        market.playerId === playerId &&
        (market.status === EventMarketStatus.Open || market.status === EventMarketStatus.Inactive || market.status === EventMarketStatus.Close)
    );

    playerMarkets.forEach(market => {
        market.status = EventMarketStatus.Cancel;
        market.commentaryId = commentaryId;

        if (market.runners) {
            market.runners.forEach(runner => {
                runner.selectionStatus = EventMarketStatus.Cancel;
            });
        }

        updateMarketStatusInDB(market, fastify);
        console.log(`[PLAYER_MODULE] Cancelled market for removed player: ${market.marketName}`);
    });
}

/**
 * Settles player markets after delay when player is dismissed
 * @param {number} commentaryId - Commentary ID
 * @param {number} playerId - Player ID
 * @param {string|number} currentBall - Current ball
 * @param {Object} fastify - Fastify instance
 */
function settlePlayerMarketsAfterDelay(commentaryId, playerId, currentBall, fastify) {
    // For now, settle immediately when player is dismissed
    // You can add delay logic here if needed
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].markets) {
        return;
    }

    const playerMarkets = global.marketData[commentaryId].markets.filter(market =>
        market.playerId === playerId &&
        (market.status === EventMarketStatus.Close || market.status === EventMarketStatus.Open)
    );

    const playerTracking = global.playerTracking[commentaryId][playerId];

    // Get the last known player data (you might need to store this in tracking)
    const lastPlayerData = {
        batRun: 0, // You'll need to store these in player tracking
        current_boundaries: 0,
        balls_faced: playerTracking?.ballsCountedSinceAppearance || 0
    };

    playerMarkets.forEach(market => {
        settlePlayerMarket(market, lastPlayerData, market.marketTypeCategoryId, fastify);
        market.commentaryId = commentaryId;
        updateMarketStatusInDB(market, fastify);
        console.log(`[PLAYER_MODULE] Settled market for dismissed player: ${market.marketName}`);
    });
}

/**
 * Helper function to convert overs to balls
 * @param {number} overs - Overs in decimal format
 * @returns {number} - Total balls
 */
function oversToBalls(overs) {
    const fullOvers = Math.floor(overs);
    const balls = Math.round((overs - fullOvers) * 10);
    return fullOvers * 6 + balls;
}

module.exports = {
    processDynamicPlayerMarkets,
    PLAYER_MODULE_CONSTANTS,
    closeUnassignedPlayerMarkets,
    handleGonePlayers,
    processPlayerMarkets,
    findPlayerMarket,
    createPlayerMarket,
    updatePlayerMarketLine,
    settlePlayerMarket,
    cancelPlayerMarkets
};