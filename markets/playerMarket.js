// playerMarket.js - Modular Player Market System
const { MARKET_STATUS, OIGINAL_MARKET_CATEGORY } = require('./constants');
const { oversToBalls, ballsToOvers, nowIsoformat, convertStatus } = require('./pythonToNodeUtils');
const { mapActionToBall, removeActionsFromBall, getBallFromOver } = require('./utils');
const { updateMarketStatusInDB, updateMarketStatusInSocket, findExistingMarketId, updateGlobalMarketId } = require('./marketActions');

/**
 * Player Market Module - Completely modular and separate from existing market flow
 * Handles: Player Runs, Player Boundaries, Player Balls Faced, Player Wickets
 */

// Global storage for player markets (similar to Python's LD_PLAYER_MARKETS)
global.playerMarkets = {
    runs: {},      // OIGINAL_MARKET_CATEGORY.PLAYERBALL (30)
    boundaries: {}, // OIGINAL_MARKET_CATEGORY.TOTALBOUNDARY (29) 
    ballsFaced: {}, // Similar to balls faced
    wickets: {}     // OIGINAL_MARKET_CATEGORY.FALLOFWICKET (31)
};

// Player market default values (similar to Python's LD_DEFAULT_VALUES)
const PLAYER_DEFAULT_VALUES = {
    runs: { defaultValue: 25 },
    boundaries: { defaultValue: 2 },
    ballsFaced: { defaultValue: 15 },
    wickets: { defaultValue: 20 }
};

/**
 * Main function to process all player markets for a ball
 * @param {Object} params - Ball processing parameters
 */
async function processPlayerMarkets({
    currentBall,
    commentaryId,
    currentScore,
    commentaryTeam,
    matchTypeId,
    eventId,
    playerDetails,
    templates,
    ballByBallId,
    fastify
}) {
    try {
        console.log(`[PLAYER_MARKET] Processing player markets for ball ${currentBall}, commentary ${commentaryId}`);

        if (!playerDetails || playerDetails.length === 0) {
            console.log('[PLAYER_MARKET] No player details available');
            return { success: true, message: 'No players to process' };
        }

        // Filter templates for player markets
        const playerTemplates = {
            runs: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.PLAYERRUNS),
            boundaries: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.TOTALBOUNDARY),
            ballsFaced: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.PLAYERBALL), // Assuming same category with different logic
            wickets: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.FALLOFWICKET)
        };

        // Process each market type
        const results = await Promise.all([
            processPlayerRunMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates: playerTemplates.runs, fastify }),
            processPlayerBoundaryMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates: playerTemplates.boundaries, fastify }),
            processPlayerBallsFacedMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates: playerTemplates.ballsFaced, fastify }),
            processPlayerWicketMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates: playerTemplates.wickets, fastify })
        ]);

        console.log(`[PLAYER_MARKET] Completed processing player markets for ball ${currentBall}`);
        return { success: true, results };

    } catch (error) {
        console.error('[PLAYER_MARKET] Error processing player markets:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Process Player Run Markets
 */
async function processPlayerRunMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates, fastify }) {
    if (!templates || templates.length === 0) return { success: true, message: 'No run market templates' };

    console.log(`[PLAYER_RUNS] Processing ${playerDetails.length} players for run markets`);

    for (const template of templates) {
        const key = `${commentaryId}_${commentaryTeam}_${template.marketTemplateId}`;

        // Get existing markets for this template
        let existingMarkets = global.playerMarkets.runs[key] || [];

        // Process active players
        for (const player of playerDetails) {
            if (!player.player_id || !player.player_name) continue;

            // Check if player market should be created/updated
            const shouldCreateMarket = await shouldCreatePlayerMarket({
                player,
                template,
                currentBall,
                matchTypeId,
                marketType: 'runs'
            });

            if (shouldCreateMarket.create) {
                const market = await createPlayerRunMarket({
                    commentaryId,
                    commentaryTeam,
                    matchTypeId,
                    player,
                    template,
                    currentBall,
                    eventId,
                    predefinedValue: shouldCreateMarket.predefinedValue
                });

                if (market) {
                    existingMarkets.push(market);
                    // Add to ballToAction map
                    await addPlayerMarketToBallToAction({
                        commentaryId,
                        market,
                        currentBall,
                        template,
                        matchTypeId
                    });
                }
            }
        }

        // Update existing markets status
        for (const market of existingMarkets) {
            await updatePlayerMarketStatus({
                market,
                currentBall,
                playerDetails,
                matchTypeId,
                fastify
            });
        }

        // Store updated markets
        global.playerMarkets.runs[key] = existingMarkets;
    }

    return { success: true };
}

/**
 * Process Player Boundary Markets  
 */
async function processPlayerBoundaryMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates, fastify }) {
    if (!templates || templates.length === 0) return { success: true, message: 'No boundary market templates' };

    console.log(`[PLAYER_BOUNDARIES] Processing ${playerDetails.length} players for boundary markets`);

    for (const template of templates) {
        const key = `${commentaryId}_${commentaryTeam}_${template.marketTemplateId}`;
        let existingMarkets = global.playerMarkets.boundaries[key] || [];

        for (const player of playerDetails) {
            if (!player.player_id || !player.player_name) continue;

            const shouldCreateMarket = await shouldCreatePlayerMarket({
                player,
                template,
                currentBall,
                matchTypeId,
                marketType: 'boundaries'
            });

            if (shouldCreateMarket.create) {
                const market = await createPlayerBoundaryMarket({
                    commentaryId,
                    commentaryTeam,
                    matchTypeId,
                    player,
                    template,
                    currentBall,
                    eventId,
                    predefinedValue: shouldCreateMarket.predefinedValue
                });

                if (market) {
                    existingMarkets.push(market);
                    await addPlayerMarketToBallToAction({
                        commentaryId,
                        market,
                        currentBall,
                        template,
                        matchTypeId
                    });
                }
            }
        }

        // Update existing markets
        for (const market of existingMarkets) {
            await updatePlayerMarketStatus({
                market,
                currentBall,
                playerDetails,
                matchTypeId,
                fastify
            });
        }

        global.playerMarkets.boundaries[key] = existingMarkets;
    }

    return { success: true };
}

/**
 * Process Player Balls Faced Markets
 */
async function processPlayerBallsFacedMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates, fastify }) {
    if (!templates || templates.length === 0) return { success: true, message: 'No balls faced market templates' };

    console.log(`[PLAYER_BALLS_FACED] Processing ${playerDetails.length} players for balls faced markets`);

    for (const template of templates) {
        const key = `${commentaryId}_${commentaryTeam}_${template.marketTemplateId}`;
        let existingMarkets = global.playerMarkets.ballsFaced[key] || [];

        for (const player of playerDetails) {
            if (!player.player_id || !player.player_name) continue;

            const shouldCreateMarket = await shouldCreatePlayerMarket({
                player,
                template,
                currentBall,
                matchTypeId,
                marketType: 'ballsFaced'
            });

            if (shouldCreateMarket.create) {
                const market = await createPlayerBallsFacedMarket({
                    commentaryId,
                    commentaryTeam,
                    matchTypeId,
                    player,
                    template,
                    currentBall,
                    eventId,
                    predefinedValue: shouldCreateMarket.predefinedValue
                });

                if (market) {
                    existingMarkets.push(market);
                    await addPlayerMarketToBallToAction({
                        commentaryId,
                        market,
                        currentBall,
                        template,
                        matchTypeId
                    });
                }
            }
        }

        // Update existing markets
        for (const market of existingMarkets) {
            await updatePlayerMarketStatus({
                market,
                currentBall,
                playerDetails,
                matchTypeId,
                fastify
            });
        }

        global.playerMarkets.ballsFaced[key] = existingMarkets;
    }

    return { success: true };
}

/**
 * Process Player Wicket Markets
 */
async function processPlayerWicketMarkets({ currentBall, commentaryId, currentScore, commentaryTeam, matchTypeId, eventId, playerDetails, templates, fastify }) {
    if (!templates || templates.length === 0) return { success: true, message: 'No wicket market templates' };

    console.log(`[PLAYER_WICKETS] Processing wicket markets`);

    for (const template of templates) {
        const key = `${commentaryId}_${commentaryTeam}_${template.marketTemplateId}`;
        let existingMarkets = global.playerMarkets.wickets[key] || [];

        // Check if new wicket market should be created
        const totalWickets = playerDetails.filter(p => p.isOut).length;

        const shouldCreateMarket = totalWickets < template.afterWicketNotCreated &&
            currentBall < template.beforeAutoClose;

        if (shouldCreateMarket && existingMarkets.length <= totalWickets) {
            const market = await createPlayerWicketMarket({
                commentaryId,
                commentaryTeam,
                matchTypeId,
                template,
                currentBall,
                eventId,
                totalWickets: totalWickets + 1,
                currentScore
            });

            if (market) {
                existingMarkets.push(market);
                await addPlayerMarketToBallToAction({
                    commentaryId,
                    market,
                    currentBall,
                    template,
                    matchTypeId
                });
            }
        }

        // Update existing wicket markets
        for (const market of existingMarkets) {
            await updatePlayerWicketMarketStatus({
                market,
                currentBall,
                totalWickets,
                matchTypeId,
                fastify
            });
        }

        global.playerMarkets.wickets[key] = existingMarkets;
    }

    return { success: true };
}

/**
 * Determine if a player market should be created
 */
async function shouldCreatePlayerMarket({ player, template, currentBall, matchTypeId, marketType }) {
    // Check if player is currently batting
    if (!player.isPlaying && !player.bat_IsPlay) {
        return { create: false };
    }

    // Check auto-open timing
    const autoOpenBall = template.autoOpen || 0;
    if (currentBall < autoOpenBall) {
        return { create: false };
    }

    // Check auto-close timing
    if (currentBall >= template.beforeAutoClose) {
        return { create: false };
    }

    // Get predefined value based on market type and player stats
    let predefinedValue = PLAYER_DEFAULT_VALUES[marketType]?.defaultValue || 20;

    switch (marketType) {
        case 'runs':
            predefinedValue = player.playerRuns || predefinedValue;
            break;
        case 'boundaries':
            predefinedValue = player.playerBoundaries || predefinedValue;
            break;
        case 'ballsFaced':
            predefinedValue = player.playerBallFaced || predefinedValue;
            break;
    }

    if (predefinedValue === 0) {
        predefinedValue = PLAYER_DEFAULT_VALUES[marketType]?.defaultValue || 20;
    }

    return { create: true, predefinedValue };
}

/**
 * Create Player Run Market
 */
async function createPlayerRunMarket({ commentaryId, commentaryTeam, matchTypeId, player, template, currentBall, eventId, predefinedValue }) {
    const marketName = `${player.player_name} - Runs`;

    const market = {
        eventMarketId: 0, // Will be set when saved to DB
        isCreate: true,
        marketName,
        marketTypeCategoryId: OIGINAL_MARKET_CATEGORY.PLAYERRUNS,
        marketTypeId: template.marketTypeId,
        marketTemplateId: template.marketTemplateId,
        commentaryId,
        eventRefId: eventId,
        teamId: commentaryTeam,
        playerId: player.player_id,
        playerName: player.player_name,
        status: player.bat_IsPlay ? MARKET_STATUS.OPEN : MARKET_STATUS.INACTIVE,
        predefinedValue,
        over: currentBall,
        autoOpen: template.autoOpen,
        autoClose: template.beforeAutoClose,
        autoSuspend: template.beforeAutoSuspend,
        createTime: nowIsoformat(),
        lastUpdate: nowIsoformat(),
        runners: createPlayerMarketRunners(marketName, predefinedValue, template),
        // Additional player-specific fields
        isPlayer: true,
        playerScore: player.playerRuns || 0,
        suspendOver: 0,
        closeOver: 0
    };

    console.log(`[PLAYER_RUNS] Created market for ${player.player_name} with predefined value ${predefinedValue}`);
    return market;
}

/**
 * Create Player Boundary Market
 */
async function createPlayerBoundaryMarket({ commentaryId, commentaryTeam, matchTypeId, player, template, currentBall, eventId, predefinedValue }) {
    const marketName = `${player.player_name} - Boundaries`;

    const market = {
        eventMarketId: 0,
        isCreate: true,
        marketName,
        marketTypeCategoryId: OIGINAL_MARKET_CATEGORY.TOTALBOUNDARY,
        marketTypeId: template.marketTypeId,
        marketTemplateId: template.marketTemplateId,
        commentaryId,
        eventRefId: eventId,
        teamId: commentaryTeam,
        playerId: player.player_id,
        playerName: player.player_name,
        status: player.bat_IsPlay ? MARKET_STATUS.OPEN : MARKET_STATUS.INACTIVE,
        predefinedValue,
        over: currentBall,
        autoOpen: template.autoOpen,
        autoClose: template.beforeAutoClose,
        autoSuspend: template.beforeAutoSuspend,
        createTime: nowIsoformat(),
        lastUpdate: nowIsoformat(),
        runners: createPlayerMarketRunners(marketName, predefinedValue, template),
        isPlayer: true,
        playerScore: player.playerBoundaries || 0,
        suspendOver: 0,
        closeOver: 0
    };

    console.log(`[PLAYER_BOUNDARIES] Created market for ${player.player_name} with predefined value ${predefinedValue}`);
    return market;
}

/**
 * Create Player Balls Faced Market
 */
async function createPlayerBallsFacedMarket({ commentaryId, commentaryTeam, matchTypeId, player, template, currentBall, eventId, predefinedValue }) {
    const marketName = `${player.player_name} - Balls Faced`;

    const market = {
        eventMarketId: 0,
        isCreate: true,
        marketName,
        marketTypeCategoryId: OIGINAL_MARKET_CATEGORY.PLAYERBALL, // Using same category with different logic
        marketTypeId: template.marketTypeId,
        marketTemplateId: template.marketTemplateId,
        commentaryId,
        eventRefId: eventId,
        teamId: commentaryTeam,
        playerId: player.player_id,
        playerName: player.player_name,
        status: player.bat_IsPlay ? MARKET_STATUS.OPEN : MARKET_STATUS.INACTIVE,
        predefinedValue,
        over: currentBall,
        autoOpen: template.autoOpen,
        autoClose: template.beforeAutoClose,
        autoSuspend: template.beforeAutoSuspend,
        createTime: nowIsoformat(),
        lastUpdate: nowIsoformat(),
        runners: createPlayerMarketRunners(marketName, predefinedValue, template),
        isPlayer: true,
        playerScore: player.playerBallFaced || 0,
        suspendOver: 0,
        closeOver: 0
    };

    console.log(`[PLAYER_BALLS_FACED] Created market for ${player.player_name} with predefined value ${predefinedValue}`);
    return market;
}

/**
 * Create Player Wicket Market
 */
async function createPlayerWicketMarket({ commentaryId, commentaryTeam, matchTypeId, template, currentBall, eventId, totalWickets, currentScore }) {
    const marketName = `${totalWickets} Wicket - Fall Over`;

    const market = {
        eventMarketId: 0,
        isCreate: true,
        marketName,
        marketTypeCategoryId: OIGINAL_MARKET_CATEGORY.FALLOFWICKET,
        marketTypeId: template.marketTypeId,
        marketTemplateId: template.marketTemplateId,
        commentaryId,
        eventRefId: eventId,
        teamId: commentaryTeam,
        status: currentBall >= template.autoOpen ? MARKET_STATUS.OPEN : MARKET_STATUS.INACTIVE,
        predefinedValue: 20,
        over: currentBall,
        autoOpen: template.autoOpen,
        autoClose: template.beforeAutoClose,
        autoSuspend: template.beforeAutoSuspend,
        createTime: nowIsoformat(),
        lastUpdate: nowIsoformat(),
        runners: createPlayerMarketRunners(marketName, 20, template),
        isPlayer: true,
        wicketNo: totalWickets,
        playerScore: currentScore,
        suspendOver: 0,
        closeOver: 0
    };

    console.log(`[PLAYER_WICKETS] Created wicket market for wicket ${totalWickets}`);
    return market;
}

/**
 * Create standard runners for player markets
 */
function createPlayerMarketRunners(marketName, predefinedValue, template) {
    return [
        {
            runnerId: 0,
            runner: `Over ${predefinedValue}`,
            line: predefinedValue,
            overRate: 1.0,
            underRate: 1.0,
            backPrice: 1.0,
            layPrice: 1.0,
            backSize: template.defaultBackSize || 100,
            laySize: template.defaultLaySize || 100,
            selectionStatus: MARKET_STATUS.OPEN,
            selectionId: `over_${predefinedValue}`,
            order: 1
        },
        {
            runnerId: 0,
            runner: `Under ${predefinedValue}`,
            line: predefinedValue,
            overRate: 1.0,
            underRate: 1.0,
            backPrice: 1.0,
            layPrice: 1.0,
            backSize: template.defaultBackSize || 100,
            laySize: template.defaultLaySize || 100,
            selectionStatus: MARKET_STATUS.OPEN,
            selectionId: `under_${predefinedValue}`,
            order: 2
        }
    ];
}

/**
 * Update player market status based on current ball and player state
 */
async function updatePlayerMarketStatus({ market, currentBall, playerDetails, matchTypeId, fastify }) {
    if (market.status === MARKET_STATUS.SETTLED) return;

    const player = playerDetails.find(p => p.player_id === market.playerId);
    let statusChanged = false;
    let originalStatus = market.status;

    // Suspend market if player is not playing and market is not already suspended/closed
    if (player && !player.bat_IsPlay && !player.isPlaying &&
        market.status !== MARKET_STATUS.SUSPEND && market.status !== MARKET_STATUS.CLOSE) {
        market.status = MARKET_STATUS.SUSPEND;
        market.suspendOver = currentBall;
        statusChanged = true;
        console.log(`[PLAYER_MARKET] Suspended market for ${market.playerName} - player not playing`);
    }

    // Reopen market if player comes back to play
    else if (player && (player.bat_IsPlay || player.isPlaying) && market.status === MARKET_STATUS.SUSPEND) {
        market.status = MARKET_STATUS.OPEN;
        market.suspendOver = 0;
        statusChanged = true;
        console.log(`[PLAYER_MARKET] Reopened market for ${market.playerName} - player back in play`);
    }

    // Auto-close market after suspend period
    const suspendBalls = oversToBalls(market.suspendOver, matchTypeId);
    const currentBalls = oversToBalls(currentBall, matchTypeId);

    if (market.status === MARKET_STATUS.SUSPEND && market.suspendOver > 0 &&
        currentBalls >= suspendBalls + 2) { // Close after 2 balls of suspension
        market.status = MARKET_STATUS.CLOSE;
        market.closeOver = currentBall;
        market.closeTime = nowIsoformat();
        statusChanged = true;
        console.log(`[PLAYER_MARKET] Auto-closed market for ${market.playerName} after suspension period`);
    }

    // Auto-close market at specified ball
    if (currentBall >= market.autoClose && market.status !== MARKET_STATUS.CLOSE && market.status !== MARKET_STATUS.SETTLED) {
        market.status = MARKET_STATUS.CLOSE;
        market.closeOver = currentBall;
        market.closeTime = nowIsoformat();
        statusChanged = true;
        console.log(`[PLAYER_MARKET] Auto-closed market for ${market.playerName} at specified ball ${market.autoClose}`);
    }

    // Update market in database and socket if status changed
    if (statusChanged) {
        market.lastUpdate = nowIsoformat();

        if (market.eventMarketId && market.eventMarketId !== 0) {
            market.commentaryId = market.commentaryId; // Ensure commentaryId is set
            await updateMarketStatusInDB(market, fastify);
            updateMarketStatusInSocket(market);
        }
    }
}

/**
 * Update player wicket market status
 */
async function updatePlayerWicketMarketStatus({ market, currentBall, totalWickets, matchTypeId, fastify }) {
    if (market.status === MARKET_STATUS.SETTLED) return;

    let statusChanged = false;

    // Check if wicket has fallen
    if (market.wicketNo <= totalWickets && totalWickets > 0) {
        market.status = MARKET_STATUS.CLOSE;
        market.closeOver = currentBall;
        market.closeTime = nowIsoformat();
        statusChanged = true;
        console.log(`[PLAYER_WICKETS] Wicket ${market.wicketNo} has fallen - closing market`);
    }

    // Auto-close at specified ball
    if (currentBall >= market.autoClose && market.status !== MARKET_STATUS.CLOSE && market.status !== MARKET_STATUS.SETTLED) {
        market.status = MARKET_STATUS.CLOSE;
        market.closeOver = currentBall;
        market.closeTime = nowIsoformat();
        statusChanged = true;
        console.log(`[PLAYER_WICKETS] Auto-closed wicket market ${market.wicketNo} at specified ball ${market.autoClose}`);
    }

    if (statusChanged) {
        market.lastUpdate = nowIsoformat();

        if (market.eventMarketId && market.eventMarketId !== 0) {
            market.commentaryId = market.commentaryId;
            await updateMarketStatusInDB(market, fastify);
            updateMarketStatusInSocket(market);
        }
    }
}

/**
 * Add player market to ballToAction map
 */
async function addPlayerMarketToBallToAction({ commentaryId, market, currentBall, template, matchTypeId }) {
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        console.log(`[PLAYER_MARKET] No ball-to-action map found for commentary ${commentaryId}`);
        return;
    }

    // Calculate balls for different actions
    const createBalls = oversToBalls(currentBall, matchTypeId);
    const openBalls = oversToBalls(template.autoOpen || currentBall, matchTypeId);
    const suspendBalls = oversToBalls(template.beforeAutoSuspend || 50, matchTypeId);
    const closeBalls = oversToBalls(template.beforeAutoClose || 50, matchTypeId);

    // Add actions to ball-to-action map for the market lifecycle
    const actions = [
        {
            ball: getBallFromOver(ballsToOvers(createBalls, matchTypeId), matchTypeId),
            action: 'create',
            marketId: market.eventMarketId || '0',
            marketTypeCategoryId: market.marketTypeCategoryId,
            over: market.over,
            teamId: market.teamId,
            playerId: market.playerId,
            playerName: market.playerName
        },
        {
            ball: getBallFromOver(ballsToOvers(openBalls, matchTypeId), matchTypeId),
            action: 'open',
            marketId: market.eventMarketId || '0',
            marketTypeCategoryId: market.marketTypeCategoryId,
            over: market.over,
            teamId: market.teamId,
            playerId: market.playerId,
            playerName: market.playerName
        },
        {
            ball: getBallFromOver(ballsToOvers(suspendBalls, matchTypeId), matchTypeId),
            action: 'suspend',
            marketId: market.eventMarketId || '0',
            marketTypeCategoryId: market.marketTypeCategoryId,
            over: market.over,
            teamId: market.teamId,
            playerId: market.playerId,
            playerName: market.playerName
        },
        {
            ball: getBallFromOver(ballsToOvers(closeBalls, matchTypeId), matchTypeId),
            action: 'close',
            marketId: market.eventMarketId || '0',
            marketTypeCategoryId: market.marketTypeCategoryId,
            over: market.over,
            teamId: market.teamId,
            playerId: market.playerId,
            playerName: market.playerName
        }
    ];

    // Add each action to the appropriate ball
    for (const action of actions) {
        if (action.ball) {
            mapActionToBall(commentaryId, action.ball, action);
        }
    }

    console.log(`[PLAYER_MARKET] Added ${actions.length} actions to ball-to-action map for ${market.playerName} market`);
}

/**
 * Remove player markets from ballToAction when player is removed
 */
async function removePlayerMarketFromBallToAction({ commentaryId, playerId, playerName }) {
    if (!global.marketData[commentaryId] || !global.marketData[commentaryId].ballToActionMap) {
        return;
    }

    let removedCount = 0;
    const ballToActionMap = global.marketData[commentaryId].ballToActionMap;

    // Remove all actions related to this player
    Object.keys(ballToActionMap).forEach(ball => {
        const actionsToKeep = ballToActionMap[ball].filter(action =>
            action.playerId !== playerId && action.playerName !== playerName
        );

        const removedFromBall = ballToActionMap[ball].length - actionsToKeep.length;
        removedCount += removedFromBall;

        if (actionsToKeep.length === 0) {
            delete ballToActionMap[ball];
        } else {
            ballToActionMap[ball] = actionsToKeep;
        }
    });

    console.log(`[PLAYER_MARKET] Removed ${removedCount} player market actions for ${playerName} (ID: ${playerId})`);
}

/**
 * Handle player changes (addition/removal)
 */
async function handlePlayerChanges({ commentaryId, previousPlayers = [], currentPlayers = [], templates, matchTypeId, currentBall, fastify }) {
    console.log('[PLAYER_MARKET] Handling player changes');

    // Find removed players
    const removedPlayers = previousPlayers.filter(prev =>
        !currentPlayers.find(curr => curr.player_id === prev.player_id)
    );

    // Find new players
    const newPlayers = currentPlayers.filter(curr =>
        !previousPlayers.find(prev => prev.player_id === curr.player_id)
    );

    // Handle removed players - remove their markets from ballToAction
    for (const removedPlayer of removedPlayers) {
        console.log(`[PLAYER_MARKET] Removing markets for player: ${removedPlayer.player_name}`);

        // Remove from ballToAction map
        await removePlayerMarketFromBallToAction({
            commentaryId,
            playerId: removedPlayer.player_id,
            playerName: removedPlayer.player_name
        });

        // Suspend existing markets for this player
        await suspendPlayerMarkets({
            commentaryId,
            playerId: removedPlayer.player_id,
            currentBall,
            fastify
        });
    }

    // Handle new players - add their markets to ballToAction
    for (const newPlayer of newPlayers) {
        console.log(`[PLAYER_MARKET] Adding markets for new player: ${newPlayer.player_name}`);

        // Create markets for new player
        await createMarketsForNewPlayer({
            commentaryId,
            player: newPlayer,
            templates,
            matchTypeId,
            currentBall,
            fastify
        });
    }

    console.log(`[PLAYER_MARKET] Processed ${removedPlayers.length} removed and ${newPlayers.length} new players`);
}

/**
 * Suspend all markets for a removed player
 */
async function suspendPlayerMarkets({ commentaryId, playerId, currentBall, fastify }) {
    const marketTypes = ['runs', 'boundaries', 'ballsFaced'];

    for (const marketType of marketTypes) {
        const markets = global.playerMarkets[marketType];

        Object.keys(markets).forEach(key => {
            if (key.includes(commentaryId)) {
                markets[key] = markets[key].map(market => {
                    if (market.playerId === playerId && market.status !== MARKET_STATUS.SETTLED) {
                        market.status = MARKET_STATUS.SUSPEND;
                        market.suspendOver = currentBall;
                        market.lastUpdate = nowIsoformat();

                        console.log(`[PLAYER_MARKET] Suspended ${marketType} market for player ${playerId}`);

                        // Update in DB if market has an ID
                        if (market.eventMarketId && market.eventMarketId !== 0) {
                            market.commentaryId = commentaryId;
                            updateMarketStatusInDB(market, fastify);
                            updateMarketStatusInSocket(market);
                        }
                    }
                    return market;
                });
            }
        });
    }
}

/**
 * Create markets for a newly added player
 */
async function createMarketsForNewPlayer({ commentaryId, player, templates, matchTypeId, currentBall, fastify }) {
    // Filter templates for player markets
    const playerTemplates = {
        runs: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.PLAYERRUNS),
        boundaries: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.TOTALBOUNDARY),
        ballsFaced: templates.filter(t => t.marketTypeCategoryId === OIGINAL_MARKET_CATEGORY.PLAYERBALL)
    };

    // Create markets for each type
    for (const [marketType, typeTemplates] of Object.entries(playerTemplates)) {
        for (const template of typeTemplates) {
            const shouldCreate = await shouldCreatePlayerMarket({
                player,
                template,
                currentBall,
                matchTypeId,
                marketType
            });

            if (shouldCreate.create) {
                let market;

                switch (marketType) {
                    case 'runs':
                        market = await createPlayerRunMarket({
                            commentaryId,
                            commentaryTeam: player.teamId,
                            matchTypeId,
                            player,
                            template,
                            currentBall,
                            eventId: player.eventId,
                            predefinedValue: shouldCreate.predefinedValue
                        });
                        break;
                    case 'boundaries':
                        market = await createPlayerBoundaryMarket({
                            commentaryId,
                            commentaryTeam: player.teamId,
                            matchTypeId,
                            player,
                            template,
                            currentBall,
                            eventId: player.eventId,
                            predefinedValue: shouldCreate.predefinedValue
                        });
                        break;
                    case 'ballsFaced':
                        market = await createPlayerBallsFacedMarket({
                            commentaryId,
                            commentaryTeam: player.teamId,
                            matchTypeId,
                            player,
                            template,
                            currentBall,
                            eventId: player.eventId,
                            predefinedValue: shouldCreate.predefinedValue
                        });
                        break;
                }

                if (market) {
                    // Add to global storage
                    const key = `${commentaryId}_${player.teamId}_${template.marketTemplateId}`;
                    if (!global.playerMarkets[marketType][key]) {
                        global.playerMarkets[marketType][key] = [];
                    }
                    global.playerMarkets[marketType][key].push(market);

                    // Add to ballToAction map
                    await addPlayerMarketToBallToAction({
                        commentaryId,
                        market,
                        currentBall,
                        template,
                        matchTypeId
                    });

                    console.log(`[PLAYER_MARKET] Created ${marketType} market for new player ${player.player_name}`);
                }
            }
        }
    }
}

/**
 * Get all player markets for a commentary
 */
function getPlayerMarkets(commentaryId) {
    const allMarkets = [];

    const marketTypes = ['runs', 'boundaries', 'ballsFaced', 'wickets'];

    for (const marketType of marketTypes) {
        const markets = global.playerMarkets[marketType];

        Object.keys(markets).forEach(key => {
            if (key.includes(commentaryId)) {
                allMarkets.push(...markets[key]);
            }
        });
    }

    return allMarkets;
}

/**
 * Clear player markets for a commentary (cleanup)
 */
function clearPlayerMarkets(commentaryId) {
    const marketTypes = ['runs', 'boundaries', 'ballsFaced', 'wickets'];

    for (const marketType of marketTypes) {
        const markets = global.playerMarkets[marketType];

        Object.keys(markets).forEach(key => {
            if (key.includes(commentaryId)) {
                delete markets[key];
            }
        });
    }

    console.log(`[PLAYER_MARKET] Cleared all player markets for commentary ${commentaryId}`);
}

/**
 * Integration function to be called from main market processing
 * This is the main entry point that should be called from your existing market flow
 */
async function integratePlayerMarkets({
    currentBall,
    commentaryId,
    currentScore,
    commentaryTeam,
    matchTypeId,
    eventId,
    playerDetails,
    templates,
    ballByBallId,
    fastify,
    previousPlayers = []
}) {
    try {
        console.log(`[PLAYER_MARKET_INTEGRATION] Starting player market integration for ball ${currentBall}`);

        // Handle player changes first
        if (previousPlayers.length > 0) {
            await handlePlayerChanges({
                commentaryId,
                previousPlayers,
                currentPlayers: playerDetails,
                templates,
                matchTypeId,
                currentBall,
                fastify
            });
        }

        // Process all player markets
        const result = await processPlayerMarkets({
            currentBall,
            commentaryId,
            currentScore,
            commentaryTeam,
            matchTypeId,
            eventId,
            playerDetails,
            templates,
            ballByBallId,
            fastify
        });

        console.log(`[PLAYER_MARKET_INTEGRATION] Completed player market integration`);
        return result;

    } catch (error) {
        console.error('[PLAYER_MARKET_INTEGRATION] Error in player market integration:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Utility function to merge player markets with existing markets for global state
 */
function mergePlayerMarketsWithGlobal(commentaryId) {
    if (!global.marketData[commentaryId]) {
        return;
    }

    const playerMarkets = getPlayerMarkets(commentaryId);

    // Add player markets to global markets array
    if (playerMarkets.length > 0) {
        if (!global.marketData[commentaryId].markets) {
            global.marketData[commentaryId].markets = [];
        }

        // Remove existing player markets to avoid duplicates
        global.marketData[commentaryId].markets = global.marketData[commentaryId].markets.filter(
            market => !market.isPlayer
        );

        // Add current player markets
        global.marketData[commentaryId].markets.push(...playerMarkets);

        console.log(`[PLAYER_MARKET] Merged ${playerMarkets.length} player markets with global state`);
    }
}

/**
 * Initialize player markets module
 */
function initializePlayerMarkets() {
    if (!global.playerMarkets) {
        global.playerMarkets = {
            runs: {},
            boundaries: {},
            ballsFaced: {},
            wickets: {}
        };
    }
    console.log('[PLAYER_MARKET] Player markets module initialized');
}

// Export all functions
module.exports = {
    // Main integration function
    integratePlayerMarkets,

    // Individual market processors
    processPlayerMarkets,
    processPlayerRunMarkets,
    processPlayerBoundaryMarkets,
    processPlayerBallsFacedMarkets,
    processPlayerWicketMarkets,

    // Player change handlers
    handlePlayerChanges,
    removePlayerMarketFromBallToAction,
    suspendPlayerMarkets,
    createMarketsForNewPlayer,

    // Market creation functions
    createPlayerRunMarket,
    createPlayerBoundaryMarket,
    createPlayerBallsFacedMarket,
    createPlayerWicketMarket,

    // Status update functions
    updatePlayerMarketStatus,
    updatePlayerWicketMarketStatus,

    // Utility functions
    shouldCreatePlayerMarket,
    createPlayerMarketRunners,
    addPlayerMarketToBallToAction,
    getPlayerMarkets,
    clearPlayerMarkets,
    mergePlayerMarketsWithGlobal,
    initializePlayerMarkets,

    // Constants
    PLAYER_DEFAULT_VALUES
};