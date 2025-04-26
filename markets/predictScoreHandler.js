// predictScoreHandler.js
const { getActionsForBall, findMarket, formatBallNumber } = require('./ballToActionMapper');
const { updateMarketStatusInDB, updateMarketStatusInSocket, findExistingMarketId, updateGlobalMarketId } = require('./marketActions');
const { processOddEvenMarkets } = require('./oddEven');
const { EventMarketStatus } = require('../utilities');
const { errorLogger } = require('../utilities/logger');

/**
 * Processes the prediction score market based on incoming payload
 * @param {Object} payload - The incoming payload
 * @param {Object} fastify - Fastify Object
 * @returns {Object} - Processing result
 */
function processPredictScoreMarket(payload, fastify) {
    try {
        // Extract data from payload
        const predictscore = payload.predictscore || {};
        const playerpredictscore = payload.playerpredictscore || {};

        // Extract important values
        const currentBall = predictscore.ball || playerpredictscore.current_ball;
        const currentScore = predictscore.total_score || playerpredictscore.total_score;
        const run = predictscore.run || 0;
        const commentaryId = predictscore.commentary_id || payload.commentary_id || playerpredictscore.commentary_id;
        const strikeTeamId = predictscore.strike_team_id || playerpredictscore.current_team_id;
        const matchTypeId = predictscore.match_type_id || playerpredictscore.match_type_id;
        const isWicket = predictscore.wicket || 0;
        const totalWicket = predictscore.total_wicket || 0;
        const ballByBallId = predictscore.ball_by_ball_id || playerpredictscore.ball_by_ball_id;
        const eventId = playerpredictscore.event_id;

        console.log(`Processing ball ${currentBall}, score ${currentScore}, commentary ID ${commentaryId}`);

        // Format the ball to ensure consistent representation
        const formattedBall = formatBallNumber(currentBall);

        // Check if market data exists for this commentary
        if (!global.marketData || !global.marketData[commentaryId]) {
            console.error(`No market data found for commentary ID ${commentaryId}`);
            return {
                success: false,
                error: `No market data found for commentary ID ${commentaryId}`
            };
        }

        // Get actions mapped to this ball
        const actions = getActionsForBall(commentaryId, formattedBall);

        // Log whether actions were found
        if (actions && actions.length > 0) {
            console.log(`Found ${actions.length} actions for ball ${formattedBall}`);

            // Process each action
            const processedMarkets = [];
            actions.forEach(action => {
                try {
                    const processedMarket = executeMarketAction(commentaryId, action, fastify);
                    if (processedMarket) {
                        processedMarkets.push(processedMarket);
                    }
                } catch (actionError) {
                    console.error(`Error executing action ${action.action} for market ${action.marketId}:`, actionError);
                }
            });

            // Send batch update to socket if needed
            if (processedMarkets.length > 0 && global.socketIo) {
                const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
                if (clientInRoom?.size) {
                    global.socketIo.to(commentaryId).emit("updateMarket", processedMarkets);
                    console.log(`[Socket] Sent batch update for ${processedMarkets.length} markets`);
                }
            }
        } else {
            console.log(`No actions mapped for ball ${formattedBall}`);
        }

        // Process specific market types if needed
        // For example, odd-even markets might need special handling regardless of ball mapping
        processOddEvenMarkets(
            currentBall,
            run,
            commentaryId,
            currentScore,
            strikeTeamId,
            matchTypeId,
            isWicket,
            totalWicket,
            ballByBallId,
        );

        return {
            success: true,
            message: `Processed predict score for ball ${formattedBall}`
        };
    } catch (error) {
        console.error("Error processing predict score market:", error);
        return {
            error: error.message,
            success: false
        };
    }
}

/**
 * Executes a specific market action
 * @param {number} commentaryId - The commentary ID
 * @param {Object} action - The action to execute
 * @param {Object} fastify - Fastify Object
 * @returns {Object|null} - The processed market or null if failed
 */
function executeMarketAction(commentaryId, action, fastify) {
    const { marketId, action: actionType, over, marketTypeCategoryId } = action;

    // Find the market
    let market = findMarket(commentaryId, marketId, { over, marketTypeCategoryId });

    if (!market) {
        console.error(`Cannot execute ${actionType} on marketId ${marketId} with over ${over}: Market not found`);
        return null;
    }

    console.log(`Executing ${actionType} on market "${market.marketName}" (ID: ${market.eventMarketId || 'unsaved'})`);

    // If market ID is 0, check if it already exists in the database
    if ((market.eventMarketId === 0 || market.eventMarketId === "0") && fastify) {
        findExistingMarketId({ ...market, commentaryId }, fastify)
            .then(existingId => {
                if (existingId) {
                    console.log(`Found existing market ID ${existingId} for market with over ${over}`);
                    market.eventMarketId = existingId;
                    updateGlobalMarketId({ ...market, commentaryId }, existingId);
                }
            })
            .catch(error => {
                console.error(`Error checking for existing market:`, error);
            });
    }

    let processedMarket = null;
    switch (actionType) {
        case 'open':
            processedMarket = openMarket(market, fastify);
            break;

        case 'close':
            processedMarket = closeMarket(market, fastify);
            break;

        case 'settle':
            processedMarket = settleMarket(market, fastify);
            break;

        default:
            console.error(`Unknown action type: ${actionType}`);
    }

    return processedMarket;
}

/**
 * Opens a market
 * @param {Object} market - The market to open
 * @param {Object} fastify - Fastify Object
 * @returns {Object} - The processed market
 */
function openMarket(market, fastify) {
    // Skip if already open
    if (market.status === EventMarketStatus.Open) {
        console.log(`Market ${market.marketName} is already open`);
        return market;
    }

    // Update market status to OPEN
    market.status = EventMarketStatus.Open;

    // Update runners' statuses if needed
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            runner.selectionStatus = EventMarketStatus.Open;
        });
    }

    // Update in DB and send to socket
    updateMarketStatusInDB({ ...market, commentaryId: market.commentaryId }, fastify);
    // Socket update is now handled in batch by the main process

    console.log(`Opened market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
    return market;
}

/**
 * Closes a market
 * @param {Object} market - The market to close
 * @param {Object} fastify - Fastify Object
 * @returns {Object} - The processed market
 */
function closeMarket(market, fastify) {
    // Skip if already closed or settled
    if (market.status === EventMarketStatus.Close || market.status === EventMarketStatus.Settled) {
        console.log(`Market ${market.marketName} is already closed or settled`);
        return market;
    }

    // Update market status to CLOSE
    market.status = EventMarketStatus.Close;

    // Update runners' statuses if needed
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            runner.selectionStatus = EventMarketStatus.Close;
        });
    }

    // Update in DB and send to socket
    updateMarketStatusInDB({ ...market, commentaryId: market.commentaryId }, fastify);
    // Socket update is now handled in batch by the main process

    console.log(`Closed market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
    return market;
}

/**
 * Settles a market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 * @returns {Object} - The processed market
 */
function settleMarket(market, fastify) {
    // Skip if already settled
    if (market.status === EventMarketStatus.Settled) {
        console.log(`Market ${market.marketName} is already settled`);
        return market;
    }

    // Different settlement logic based on market type
    if (market.marketTypeCategoryId === 28 || market.marketTypeCategoryId === 35) {
        // Odd-Even market settlement
        return settleOddEvenMarket(market, fastify);
    } else {
        // Default settlement - just set to settled
        market.status = EventMarketStatus.Settled;
        market.settledTime = new Date().toISOString();

        updateMarketStatusInDB({ ...market, commentaryId: market.commentaryId }, fastify);
        // Socket update is now handled in batch by the main process

        console.log(`Settled market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
        return market;
    }
}

/**
 * Settles an Odd-Even market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 * @returns {Object} - The processed market
 */
function settleOddEvenMarket(market, fastify) {
    // Calculate the result based on total runs in the over
    const overRuns = calculateOverRuns(market.commentaryId, market.teamId, market.over);
    const isEven = overRuns % 2 === 0;

    console.log(`Settling odd-even market for over ${market.over}. Runs: ${overRuns}, Result: ${isEven ? 'Even' : 'Odd'}`);

    // Set market as settled
    market.status = EventMarketStatus.Settled;

    // Find and set the winner
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            const runnerName = runner.runner.toLowerCase();
            const isEvenRunner = runnerName.includes('even');
            const isOddRunner = runnerName.includes('odd');

            if ((isEven && isEvenRunner) || (!isEven && isOddRunner)) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                market.eventMarketResult = { winnerRunnerId: runner.runnerId };
                market.result = runner.runnerId;
                console.log(`Winner: ${runner.runner} (ID: ${runner.runnerId})`);
            } else if ((isEven && isOddRunner) || (!isEven && isEvenRunner)) {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
            }
        });
    }

    // Set settled time
    market.settledTime = new Date().toISOString();

    // Update in DB and send to socket
    updateMarketStatusInDB({ ...market, commentaryId: market.commentaryId }, fastify);
    // Socket update is now handled in batch by the main process

    return market;
}

/**
 * Calculates total runs scored in an over
 * @param {number} commentaryId - The commentary ID
 * @param {number} teamId - The team ID
 * @param {string|number} over - The over number
 * @returns {number} - Total runs in the over
 */
function calculateOverRuns(commentaryId, teamId, over) {
    try {
        // Convert over to a consistent format (number)
        const overNum = parseInt(over);
        let totalRuns = 0;

        // Always get data from global cache first
        if (global.marketData && global.marketData[commentaryId]) {
            // Try to find the over data in ball-by-ball cache
            if (global.ballByBallData &&
                global.ballByBallData[commentaryId] &&
                global.ballByBallData[commentaryId][teamId] &&
                global.ballByBallData[commentaryId][teamId][overNum]) {

                const overData = global.ballByBallData[commentaryId][teamId][overNum];
                totalRuns = overData.reduce((sum, ball) => sum + (ball.runs || 0), 0);
                console.log(`[CALC] Found runs data in ball-by-ball cache for over ${overNum}: ${totalRuns}`);
                return totalRuns;
            }

            // If not in ball-by-ball, look in an over summary cache
            if (global.overSummary &&
                global.overSummary[commentaryId] &&
                global.overSummary[commentaryId][teamId] &&
                global.overSummary[commentaryId][teamId][overNum]) {

                totalRuns = global.overSummary[commentaryId][teamId][overNum].totalRuns || 0;
                console.log(`[CALC] Found runs data in over summary cache for over ${overNum}: ${totalRuns}`);
                return totalRuns;
            }

            // If not in summary, look for an odd-even market for this over
            const markets = global.marketData[commentaryId].markets;
            const oddEvenMarket = markets.find(m =>
                (m.marketTypeCategoryId === 28 || m.marketTypeCategoryId === 35) &&
                parseInt(m.over) === overNum &&
                parseInt(m.teamId) === parseInt(teamId)
            );

            if (oddEvenMarket) {
                // If we're settling the market, get predicted value
                if (oddEvenMarket.predefinedValue) {
                    totalRuns = Math.floor(oddEvenMarket.predefinedValue);
                    console.log(`[CALC] Using predefined value for over ${overNum}: ${totalRuns}`);
                    return totalRuns;
                }

                // If market has data field with runs info
                if (oddEvenMarket.data && oddEvenMarket.data.runs) {
                    totalRuns = oddEvenMarket.data.runs;
                    console.log(`[CALC] Using market data value for over ${overNum}: ${totalRuns}`);
                    return totalRuns;
                }
            }
        }

        // If we have a specific runs counting function
        if (global.utils && global.utils.countRunsForOver) {
            totalRuns = global.utils.countRunsForOver(commentaryId, teamId, overNum);
            if (totalRuns !== null) {
                console.log(`[CALC] Using utility function for over ${overNum}: ${totalRuns}`);
                return totalRuns;
            }
        }

        // If all else fails, generate a random number (for testing only)
        console.warn(`[WARNING] No actual data found for over ${over} in global state, generating random score`);
        totalRuns = Math.floor(Math.random() * 20);

        // Cache this result for future use
        if (!global.overSummary) {
            global.overSummary = {};
        }
        if (!global.overSummary[commentaryId]) {
            global.overSummary[commentaryId] = {};
        }
        if (!global.overSummary[commentaryId][teamId]) {
            global.overSummary[commentaryId][teamId] = {};
        }
        global.overSummary[commentaryId][teamId][overNum] = { totalRuns };

        return totalRuns;
    } catch (error) {
        console.error(`Error calculating runs for over ${over}:`, error);
        // Return a fallback value in case of error
        return Math.floor(Math.random() * 20);
    }
}

module.exports = {
    processPredictScoreMarket,
    executeMarketAction,
    openMarket,
    closeMarket,
    settleMarket,
    calculateOverRuns
};