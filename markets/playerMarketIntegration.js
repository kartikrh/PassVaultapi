// playerMarketIntegration.js - Complete integration helper for player markets
const {
    integratePlayerMarkets,
    initializePlayerMarkets,
    mergePlayerMarketsWithGlobal,
    clearPlayerMarkets,
    getPlayerMarkets
} = require('./playerMarket');

/**
 * Initialize player markets system
 */
function initializePlayerMarketSystem() {
    try {
        initializePlayerMarkets();

        // Initialize global storage for previous players if not exists
        if (!global.previousPlayers) {
            global.previousPlayers = {};
        }

        console.log('[PLAYER_INTEGRATION] Player market system initialized');
        return { success: true };
    } catch (error) {
        console.error('[PLAYER_INTEGRATION] Error initializing player market system:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Extract player details from your data structure
 * Modify this function based on your actual data structure
 */
function extractPlayerDetails(data) {
    try {
        const players = [];

        // Method 1: Extract from teams array (most common structure)
        if (data.teams && Array.isArray(data.teams)) {
            data.teams.forEach(team => {
                if (team.players && Array.isArray(team.players)) {
                    team.players.forEach(player => {
                        players.push({
                            player_id: player.playerId || player.id || player.wrPlayerId,
                            player_name: player.playerName || player.name || player.wrPlayerName,
                            team_id: team.teamId || team.id || team.wrTeamId,
                            isPlaying: player.isPlaying || player.wrIsPlaying || false,
                            bat_IsPlay: player.isBatting || player.bat_IsPlay || player.wrBat_IsPlay || false,
                            playerRuns: player.runs || player.playerRuns || player.wrPlayerRuns || 0,
                            playerBoundaries: player.boundaries || player.playerBoundaries || player.wrBoundary || 0,
                            playerBallFaced: player.ballsFaced || player.playerBallFaced || player.wrPlayerBallFaced || 0,
                            isOut: player.isOut || player.wrIsOut || false,
                            eventId: data.commentary?.eventRefId || data.eventRefId
                        });
                    });
                }
            });
        }

        // Method 2: Extract from commentary.players if available
        if (data.commentary?.players && Array.isArray(data.commentary.players)) {
            data.commentary.players.forEach(player => {
                // Avoid duplicates
                if (!players.find(p => p.player_id === (player.playerId || player.id))) {
                    players.push({
                        player_id: player.playerId || player.id,
                        player_name: player.playerName || player.name,
                        team_id: player.teamId || data.commentary.teamId,
                        isPlaying: player.isPlaying || false,
                        bat_IsPlay: player.isBatting || player.bat_IsPlay || false,
                        playerRuns: player.runs || player.playerRuns || 0,
                        playerBoundaries: player.boundaries || player.playerBoundaries || 0,
                        playerBallFaced: player.ballsFaced || player.playerBallFaced || 0,
                        isOut: player.isOut || false,
                        eventId: data.commentary.eventRefId
                    });
                }
            });
        }

        // Method 3: Extract from teamAndPlayers if that's your structure
        if (data.teamAndPlayers && Array.isArray(data.teamAndPlayers)) {
            data.teamAndPlayers.forEach(team => {
                if (team.players && Array.isArray(team.players)) {
                    team.players.forEach(player => {
                        if (!players.find(p => p.player_id === (player.playerId || player.id))) {
                            players.push({
                                player_id: player.playerId || player.id,
                                player_name: player.playerName || player.name,
                                team_id: team.teamId || team.id,
                                isPlaying: player.isPlaying || false,
                                bat_IsPlay: player.isBatting || player.bat_IsPlay || false,
                                playerRuns: player.runs || player.playerRuns || 0,
                                playerBoundaries: player.boundaries || player.playerBoundaries || 0,
                                playerBallFaced: player.ballsFaced || player.playerBallFaced || 0,
                                isOut: player.isOut || false,
                                eventId: data.commentary?.eventRefId || data.eventRefId
                            });
                        }
                    });
                }
            });
        }

        // Filter out invalid players
        const validPlayers = players.filter(player =>
            player.player_id && player.player_name && player.team_id
        );

        console.log(`[PLAYER_INTEGRATION] Extracted ${validPlayers.length} valid player details`);
        return validPlayers;

    } catch (error) {
        console.error('[PLAYER_INTEGRATION] Error extracting player details:', error);
        return [];
    }
}

/**
 * Process player markets for the current ball/commentary
 * This is the main integration function to call from your market processing
 */
async function processPlayerMarketsIntegration(data, fastify) {
    try {
        console.log(`[PLAYER_INTEGRATION] Processing player markets for commentary ${data.commentaryId}`);

        // Extract player details from your data structure
        const playerDetails = extractPlayerDetails(data);

        if (!playerDetails || playerDetails.length === 0) {
            console.log('[PLAYER_INTEGRATION] No valid player details found, skipping player markets');
            return { success: true, message: 'No players to process' };
        }

        // Get current ball and other required data
        const currentBall = data.commentary?.currentBall || data.currentBall || 0;
        const commentaryId = data.commentaryId || data.commentary?.commentaryId;
        const currentScore = data.commentary?.currentScore || data.currentScore || 0;
        const commentaryTeam = data.commentary?.teamId || data.teamId || data.commentaryTeam;
        const matchTypeId = data.commentary?.matchTypeId || data.matchTypeId || 2; // Default to ODI
        const eventId = data.commentary?.eventRefId || data.eventRefId;
        const ballByBallId = data.commentary?.ballByBallId || data.ballByBallId;

        // Get templates (modify this based on your template structure)
        const templates = data.templates || data.comTemplate || [];

        if (!templates || templates.length === 0) {
            console.log('[PLAYER_INTEGRATION] No templates available for player markets');
            return { success: true, message: 'No templates available' };
        }

        // Get previous players for comparison
        const previousPlayers = global.previousPlayers?.[commentaryId] || [];

        // Process player markets
        const playerMarketResult = await integratePlayerMarkets({
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
            previousPlayers
        });

        if (playerMarketResult.success) {
            console.log('[PLAYER_INTEGRATION] Player markets processed successfully');

            // Merge player markets with global market state
            mergePlayerMarketsWithGlobal(commentaryId);

            // Store current players for next ball comparison
            global.previousPlayers[commentaryId] = playerDetails;

            return {
                success: true,
                message: 'Player markets processed successfully',
                playersProcessed: playerDetails.length,
                results: playerMarketResult.results
            };

        } else {
            console.error('[PLAYER_INTEGRATION] Error processing player markets:', playerMarketResult.error);
            return {
                success: false,
                error: playerMarketResult.error
            };
        }

    } catch (error) {
        console.error('[PLAYER_INTEGRATION] Error in player market integration:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Ball-by-ball processing integration
 * Call this if you process markets ball by ball
 */
async function processBallByBallPlayerMarkets(ballData, fastify) {
    try {
        // Extract player details from ball data
        const playerDetails = extractPlayerDetailsFromBallData(ballData);

        if (!playerDetails || playerDetails.length === 0) {
            return { success: true, message: 'No players in ball data' };
        }

        const result = await integratePlayerMarkets({
            currentBall: ballData.currentBall || ballData.ball,
            commentaryId: ballData.commentaryId,
            currentScore: ballData.currentScore || ballData.score,
            commentaryTeam: ballData.teamId || ballData.team,
            matchTypeId: ballData.matchTypeId || 2,
            eventId: ballData.eventId,
            playerDetails,
            templates: ballData.templates || [],
            ballByBallId: ballData.ballByBallId || ballData.id,
            fastify,
            previousPlayers: global.previousPlayers?.[ballData.commentaryId] || []
        });

        if (result.success) {
            mergePlayerMarketsWithGlobal(ballData.commentaryId);
            if (!global.previousPlayers) global.previousPlayers = {};
            global.previousPlayers[ballData.commentaryId] = playerDetails;
        }

        return result;

    } catch (error) {
        console.error('[PLAYER_INTEGRATION] Error in ball-by-ball player market processing:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Extract player details from ball-by-ball data
 */
function extractPlayerDetailsFromBallData(ballData) {
    try {
        const players = [];

        // Extract from current batsmen
        if (ballData.batsmen && Array.isArray(ballData.batsmen)) {
            ballData.batsmen.forEach(batsman => {
                players.push({
                    player_id: batsman.playerId || batsman.id,
                    player_name: batsman.playerName || batsman.name,
                    team_id: batsman.teamId || ballData.teamId,
                    isPlaying: true,
                    bat_IsPlay: true,
                    playerRuns: batsman.runs || 0,
                    playerBoundaries: batsman.boundaries || 0,
                    playerBallFaced: batsman.ballsFaced || 0,
                    isOut: batsman.isOut || false,
                    eventId: ballData.eventId
                });
            });
        }

        // Extract from current bowler
        if (ballData.bowler) {
            players.push({
                player_id: ballData.bowler.playerId || ballData.bowler.id,
                player_name: ballData.bowler.playerName || ballData.bowler.name,
                team_id: ballData.bowler.teamId || ballData.oppositeTeamId,
                isPlaying: true,
                bat_IsPlay: false,
                playerRuns: 0,
                playerBoundaries: 0,
                playerBallFaced: 0,
                isOut: false,
                eventId: ballData.eventId
            });
        }

        return players.filter(p => p.player_id && p.player_name);

    } catch (error) {
        console.error('[PLAYER_INTEGRATION] Error extracting player details from ball data:', error);
        return [];
    }
}

/**
 * Cleanup player markets when commentary ends
 */
function cleanupPlayerMarkets(commentaryId) {
    try {
        console.log(`[PLAYER_INTEGRATION] Cleaning up player markets for commentary ${commentaryId}`);

        // Clear player markets
        clearPlayerMarkets(commentaryId);

        // Clear stored player states
        if (global.previousPlayers && global.previousPlayers[commentaryId]) {
            delete global.previousPlayers[commentaryId];
        }

        console.log(`[PLAYER_INTEGRATION] Cleanup completed for commentary ${commentaryId}`);
        return { success: true };

    } catch (error) {
        console.error(`[PLAYER_INTEGRATION] Error cleaning up commentary ${commentaryId}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all player markets for a commentary
 */
function getAllPlayerMarkets(commentaryId) {
    try {
        const markets = getPlayerMarkets(commentaryId);
        console.log(`[PLAYER_INTEGRATION] Retrieved ${markets.length} player markets for commentary ${commentaryId}`);
        return markets;
    } catch (error) {
        console.error(`[PLAYER_INTEGRATION] Error getting player markets for commentary ${commentaryId}:`, error);
        return [];
    }
}

/**
 * Test player market integration
 */
function testPlayerMarketIntegration(commentaryId) {
    console.log('=== Player Market Integration Test ===');

    try {
        // Test 1: Module initialization
        if (global.playerMarkets) {
            console.log('✓ Player markets module initialized');
        } else {
            console.log('✗ Player markets module not initialized');
            return { success: false, error: 'Module not initialized' };
        }

        // Test 2: Check markets exist
        const markets = getPlayerMarkets(commentaryId);

        if (markets && markets.length > 0) {
            console.log(`✓ Found ${markets.length} player markets`);

            // Show market distribution
            const distribution = {};
            markets.forEach(market => {
                const type = market.marketTypeCategoryId;
                distribution[type] = (distribution[type] || 0) + 1;
            });
            console.log('Market distribution:', distribution);

            // Show sample market
            console.log('Sample market:', {
                name: markets[0].marketName,
                status: markets[0].status,
                playerId: markets[0].playerId,
                predefinedValue: markets[0].predefinedValue
            });

        } else {
            console.log(`✗ No player markets found for commentary ${commentaryId}`);
        }

        // Test 3: Ball-to-action integration
        if (global.marketData?.[commentaryId]?.ballToActionMap) {
            let playerActionCount = 0;
            Object.values(global.marketData[commentaryId].ballToActionMap).forEach(actions => {
                playerActionCount += actions.filter(action =>
                    action.playerId || action.playerName
                ).length;
            });

            if (playerActionCount > 0) {
                console.log(`✓ Found ${playerActionCount} player actions in ball-to-action map`);
            } else {
                console.log('✗ No player actions in ball-to-action map');
            }
        }

        // Test 4: Global state integration
        if (global.marketData?.[commentaryId]?.markets) {
            const playerMarketsInGlobal = global.marketData[commentaryId].markets.filter(m => m.isPlayer);
            console.log(`✓ Found ${playerMarketsInGlobal.length} player markets in global state`);
        }

        console.log('=== Test Complete ===');
        return { success: true, marketCount: markets?.length || 0 };

    } catch (error) {
        console.error('Test failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get player market statistics
 */
function getPlayerMarketStats(commentaryId) {
    try {
        const markets = getPlayerMarkets(commentaryId);

        const stats = {
            total: markets.length,
            byType: {},
            byStatus: {},
            byPlayer: {}
        };

        markets.forEach(market => {
            // Count by type
            const type = market.marketTypeCategoryId;
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by status
            const status = market.status;
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Count by player
            const playerId = market.playerId;
            if (playerId) {
                stats.byPlayer[playerId] = (stats.byPlayer[playerId] || 0) + 1;
            }
        });

        return stats;

    } catch (error) {
        console.error('Error getting player market stats:', error);
        return null;
    }
}

module.exports = {
    // Main integration functions
    initializePlayerMarketSystem,
    processPlayerMarketsIntegration,
    processBallByBallPlayerMarkets,

    // Data extraction functions
    extractPlayerDetails,
    extractPlayerDetailsFromBallData,

    // Cleanup and management
    cleanupPlayerMarkets,
    getAllPlayerMarkets,

    // Testing and monitoring
    testPlayerMarketIntegration,
    getPlayerMarketStats
};