// predictScoreHandler.js
const { getActionsForBall, findMarket, closeMarketsForOver } = require('./ballToActionMapper');
const { updateMarketStatusInDB, updateMarketStatusInSocket } = require('./marketActions');
const { processOddEvenMarkets } = require('./oddEven');
const { EventMarketStatus } = require('../utilities');
const { errorLogger } = require('../utilities/logger');
const { formatBallNumber, normalizeBallToActionMap, synchronizeMarketStatus, calculateOverRunsTillEnd, calculateRunsInSpecificOver } = require('./utils');
const { fetchRunnersForMarket } = require('./helper');

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

        console.log(`Processing ball ${currentBall}, score ${currentScore}, commentary ID ${commentaryId}, batting team ID ${strikeTeamId}`);

        // Normalize ball-to-action map to ensure consistent ball keys
        normalizeBallToActionMap(commentaryId);

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

        // Get the current over from the ball (integer part)
        const currentOver = Math.floor(parseFloat(formattedBall));

        // Get actions mapped to this ball, filtered by batting team
        const actions = getActionsForBall(commentaryId, formattedBall, strikeTeamId);

        // Check previous ball if current ball has no actions and it's not a .0 ball
        if ((!actions || actions.length === 0) && !formattedBall.endsWith('.0')) {
            // Calculate previous ball
            const prevBall = getPreviousBall(formattedBall);

            if (prevBall) {
                console.log(`No actions for ${formattedBall}, checking previous ball ${prevBall}`);

                // Get actions for previous ball
                const prevActions = getActionsForBall(commentaryId, prevBall, strikeTeamId);

                if (prevActions && prevActions.length > 0) {
                    console.log(`Found ${prevActions.length} actions from previous ball ${prevBall}`);

                    // Execute missed actions from previous ball
                    for (const action of prevActions) {
                        try {
                            console.log(`Executing missed action from ${prevBall}: ${action.action} for market ${action.marketId}`);
                            executeMarketAction(commentaryId, action, fastify);
                        } catch (actionError) {
                            console.error(`Error executing missed action ${action.action} for market ${action.marketId}:`, actionError);
                        }
                    }
                }
            }
        }

        // Process current ball's actions
        if (actions && actions.length > 0) {
            console.log(`Found ${actions.length} actions for ball ${formattedBall} and team ${strikeTeamId}`);

            // Process each action - only create in DB when needed
            for (const action of actions) {
                try {
                    executeMarketAction(commentaryId, action, fastify);
                } catch (actionError) {
                    console.error(`Error executing action ${action.action} for market ${action.marketId}:`, actionError);
                }
            }
        } else {
            console.log(`No actions mapped for ball ${formattedBall} and team ${strikeTeamId}`);

            // If no actions found but it's a key ball (like end of over), check other overs
            if (formattedBall.endsWith('.6')) {
                // Check if any markets should be manually closed for any over
                checkAndCloseMarketsForAllOvers(commentaryId, strikeTeamId, fastify);
            }
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

// Add helper function to calculate previous ball
function getPreviousBall(currentBall) {
    try {
        const parts = currentBall.split('.');
        const over = parseInt(parts[0]);
        const ball = parseInt(parts[1]);

        if (ball > 0) {
            // Previous ball in same over
            return `${over}.${ball - 1}`;
        } else if (over > 0) {
            // Last ball of previous over (assuming 6 balls per over)
            return `${over - 1}.5`;
        }

        return null; // No previous ball (we're at 0.0)
    } catch (error) {
        console.error(`Error calculating previous ball for ${currentBall}:`, error);
        return null;
    }
}

/**
 * Executes a specific market action
 * @param {number} commentaryId - The commentary ID
 * @param {Object} action - The action to execute
 * @param {Object} fastify - Fastify instance
 */
function executeMarketAction(commentaryId, action, fastify) {
    const { marketId, action: actionType, over, marketTypeCategoryId, teamId } = action;

    // Find the market in global state with additional metadata
    const market = findMarket(commentaryId, marketId, {
        over,
        marketTypeCategoryId,
        teamId
    });

    if (!market) {
        console.error(`Cannot execute ${actionType} on marketId ${marketId} with over ${over} and category ${marketTypeCategoryId}: Market not found in global state`);
        return;
    }

    // Check if this market is for the batting team
    if (teamId && !isBattingTeam(commentaryId, market.teamId)) {
        console.log(`Skipping action ${actionType} for non-batting team market: ${market.marketName} (Team ID: ${market.teamId})`);
        return;
    }

    console.log(`Executing ${actionType} on market "${market.marketName}" (ID: ${market.eventMarketId || 'unsaved'}, Category: ${marketTypeCategoryId}, Over: ${over})`);

    // Ensure we're using the synchronized status before the action
    synchronizeMarketStatus(commentaryId, market.eventMarketId, marketTypeCategoryId, over, market.status);

    // Set commentary ID for DB operations
    market.commentaryId = commentaryId;

    // Execute the appropriate action
    switch (actionType) {
        case 'open':
            openMarket(market, fastify);
            break;

        case 'close':
            closeMarket(market, fastify);
            break;

        case 'settle':
            settleMarket(market, fastify);
            break;

        default:
            console.error(`Unknown action type: ${actionType}`);
    }
}

/**
 * Checks if the team is currently batting
 * @param {number} commentaryId - Commentary ID
 * @param {number} teamId - Team ID to check
 * @returns {boolean} - True if team is batting
 */
function isBattingTeam(commentaryId, teamId) {
    if (!global.tblCommentaryTeams) {
        console.error("Global commentary teams data not available");
        return true; // Default to true if data not available
    }

    // Convert IDs to strings for comparison
    const teamIdStr = teamId ? teamId.toString() : null;

    const battingTeam = global.tblCommentaryTeams.find(
        item => item.commentaryId === parseInt(commentaryId) &&
            item.teamStatus === 1 // Assuming teamStatus 1 means batting
    );

    if (!battingTeam) {
        console.log(`Could not find batting team for commentary ${commentaryId}`);
        return true; // Default to true if batting team info not available
    }

    const battingTeamIdStr = battingTeam.teamId ? battingTeam.teamId.toString() : null;
    const isMatching = !teamIdStr || !battingTeamIdStr || teamIdStr === battingTeamIdStr;

    if (!isMatching) {
        console.log(`Team ID ${teamIdStr} does not match batting team ID ${battingTeamIdStr}`);
    }

    return isMatching;
}

/**
 * Opens a market
 * @param {Object} market - The market to open
 * @param {Object} fastify - Fastify Object
 */
function openMarket(market, fastify) {
    // Update market status to OPEN
    market.status = EventMarketStatus.Open;
    synchronizeMarketStatus(
        market.commentaryId,
        market.eventMarketId,
        market.marketTypeCategoryId,
        market.over,
        EventMarketStatus.Open
    );
    // Update runners' statuses if needed
    if (market.runners && market.runners.length > 0) {
        market.runners.forEach(runner => {
            runner.selectionStatus = EventMarketStatus.Open;
        });
    }

    // Update in DB - will insert if ID is 0 and market doesn't exist in DB
    updateMarketStatusInDB(market, fastify);
    // Socket update is handled by updateMarketStatusInDB

    console.log(`Opened market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
}

/**
 * Closes a market
 * @param {Object} market - The market to close
 * @param {Object} fastify - Fastify Object
 */
function closeMarket(market, fastify) {
    // Make a deep copy to avoid reference issues
    const marketCopy = JSON.parse(JSON.stringify(market));

    console.log(`[CLOSE] Closing market "${market.marketName}" (ID: ${market.eventMarketId || 'unsaved'}, Current Status: ${market.status})`);

    // Update market status to CLOSE (4)
    marketCopy.status = EventMarketStatus.Close;
    market.status = EventMarketStatus.Close;

    // Update runners' statuses if needed
    if (marketCopy.runners && marketCopy.runners.length > 0) {
        marketCopy.runners.forEach(runner => {
            runner.selectionStatus = EventMarketStatus.Close;
        });
    }

    // Synchronize the status in global state
    synchronizeMarketStatus(
        marketCopy.commentaryId,
        marketCopy.eventMarketId,
        marketCopy.marketTypeCategoryId,
        marketCopy.over,
        EventMarketStatus.Close
    );

    // Update in DB - will insert if ID is 0 and market doesn't exist in DB
    // Important: Pass the copied market to ensure status is consistent
    updateMarketStatusInDB(marketCopy, fastify);

    console.log(`[CLOSE] Closed market: ${marketCopy.marketName} (ID: ${marketCopy.eventMarketId || 'unsaved'}, New Status: ${marketCopy.status})`);
}

/**
 * Settles a market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleMarket(market, fastify) {
    market.status = EventMarketStatus.Settled;
    synchronizeMarketStatus(
        market.commentaryId,
        market.eventMarketId,
        market.marketTypeCategoryId,
        market.over,
        EventMarketStatus.Settled
    );

    // Different settlement logic based on market type
    if (market.marketTypeCategoryId === 35) {
        // Odd-Even market settlement
        settleOddEvenMarket(market, fastify);
    } else if (market.marketTypeCategoryId === 28) {
        // Lottery market settlement
        settleLotteryMarket(market, fastify);
    } else if (market.marketTypeCategoryId === 26) {
        // L.D.O market settlement
        settleLDOMarket(market, fastify);
    } else {
        // Default settlement - just set to settled
        market.status = EventMarketStatus.Settled;
        market.settledTime = new Date().toISOString();

        // Update in DB - will insert if ID is 0 and market doesn't exist in DB
        updateMarketStatusInDB(market, fastify);
        // Socket update is handled by updateMarketStatusInDB
    }

    console.log(`Settled market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
}

/**
 * Settles an Odd-Even market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleOddEvenMarket(market, fastify) {
    try {
        // Calculate the result based on total runs till the end of the over
        const overRuns = calculateOverRunsTillEnd(market.commentaryId, market.teamId, market.over);
        const isEven = overRuns % 2 === 0;

        console.log(`Settling odd-even market for over ${market.over}. Total runs till over end: ${overRuns}, Result: ${isEven ? 'Even' : 'Odd'}`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;

        // Find and set the winner
        if (!market.runners || market.runners.length < 2) {
            console.error(`Cannot settle market ${market.eventMarketId || market.marketName}: runners not found or incomplete`);

            // Try to fetch runners from DB if they're missing
            fetchRunnersForMarket(market.eventMarketId, fastify).then(runnersFromDB => {
                if (runnersFromDB && runnersFromDB.length >= 2) {
                    // Retry settlement with fetched runners
                    market.runners = runnersFromDB;
                    settleOddEvenMarket(market, fastify);
                }
            }).catch(error => {
                console.error(`Failed to fetch runners for market ${market.eventMarketId}:`, error);
            });

            return;
        }

        let winnerRunnerId = null;

        // Process each runner
        market.runners.forEach(runner => {
            const runnerName = runner.runner.toLowerCase();
            const isEvenRunner = runnerName.includes('even');
            const isOddRunner = runnerName.includes('odd');

            if ((isEven && isEvenRunner) || (!isEven && isOddRunner)) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`Winner: ${runner.runner} (ID: ${runner.runnerId})`);
            } else if ((isEven && isOddRunner) || (!isEven && isEvenRunner)) {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
            }
        });

        // Set the result to the winner runner ID
        market.result = winnerRunnerId;
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB - will insert if ID is 0 and market doesn't exist in DB
        updateMarketStatusInDB(market, fastify);
    } catch (error) {
        console.error(`Error settling odd-even market ${market.marketName}:`, error);
    }
}

/**
 * Settles a Lottery market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleLotteryMarket(market, fastify) {
    try {
        // Calculate the result based on total runs till the end of the over
        const overRuns = calculateOverRunsTillEnd(market.commentaryId, market.teamId, market.over);
        const lastDigit = overRuns % 10;

        console.log(`Settling lottery market for over ${market.over}. Total runs till over end: ${overRuns}, Last digit: ${lastDigit}`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;

        // Ensure we have runners
        if (!market.runners || market.runners.length === 0) {
            console.error(`Cannot settle lottery market ${market.eventMarketId || market.marketName}: runners not found`);

            // Try to fetch runners from DB if they're missing
            fetchRunnersForMarket(market.eventMarketId, fastify).then(runnersFromDB => {
                if (runnersFromDB && runnersFromDB.length > 0) {
                    // Retry settlement with fetched runners
                    market.runners = runnersFromDB;
                    settleLotteryMarket(market, fastify);
                }
            }).catch(error => {
                console.error(`Failed to fetch runners for lottery market ${market.eventMarketId}:`, error);
            });

            return;
        }

        let winnerRunnerId = null;

        // Process each runner
        market.runners.forEach(runner => {
            // Check if this runner represents the last digit
            const runnerValue = parseInt(runner.runner);

            if (!isNaN(runnerValue) && runnerValue === lastDigit) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`Winner: ${runner.runner} (ID: ${runner.runnerId})`);
            } else {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
            }
        });

        // Set the result to the winner runner ID
        market.result = winnerRunnerId;
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB
        updateMarketStatusInDB(market, fastify);
    } catch (error) {
        console.error(`Error settling lottery market ${market.marketName}:`, error);
    }
}

/**
 * Settles an L.D.O market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleLDOMarket(market, fastify) {
    try {
        // Calculate runs scored in the specific over only (not cumulative)
        const overRuns = calculateRunsInSpecificOver(market.commentaryId, market.teamId, market.over);

        console.log(`Settling L.D.O market for over ${market.over}. Runs in this over: ${overRuns}`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;

        // Ensure we have runners
        if (!market.runners || market.runners.length === 0) {
            console.error(`Cannot settle L.D.O market ${market.eventMarketId || market.marketName}: runners not found`);

            // Try to fetch runners from DB if they're missing
            fetchRunnersForMarket(market.eventMarketId, fastify).then(runnersFromDB => {
                if (runnersFromDB && runnersFromDB.length > 0) {
                    // Retry settlement with fetched runners
                    market.runners = runnersFromDB;
                    settleLDOMarket(market, fastify);
                }
            }).catch(error => {
                console.error(`Failed to fetch runners for L.D.O market ${market.eventMarketId}:`, error);
            });

            return;
        }

        let winnerRunnerId = null;

        // L.D.O market settlement logic
        market.runners.forEach(runner => {
            const predefinedValue = parseFloat(runner.predefinedValue) || 0;

            let isWinner = false;

            if (runner.runner.toLowerCase().includes('over')) {
                // Over runner wins if runs > predefined value
                isWinner = overRuns > predefinedValue;
            } else if (runner.runner.toLowerCase().includes('under')) {
                // Under runner wins if runs < predefined value
                isWinner = overRuns < predefinedValue;
            } else if (runner.runner.toLowerCase().includes('odd')) {
                // Odd runner wins if runs are odd
                isWinner = overRuns % 2 !== 0;
            } else if (runner.runner.toLowerCase().includes('even')) {
                // Even runner wins if runs are even
                isWinner = overRuns % 2 === 0;
            } else {
                // For other types of runners, use exact match
                isWinner = overRuns === predefinedValue;
            }

            if (isWinner) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`L.D.O Winner: ${runner.runner} (ID: ${runner.runnerId}, Predefined Value: ${predefinedValue})`);
            } else {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
            }
        });

        // Set the result to the winner runner ID
        market.result = winnerRunnerId;
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB
        updateMarketStatusInDB(market, fastify);

        console.log(`L.D.O market settled for over ${market.over} with runs ${overRuns}, winner ID: ${winnerRunnerId}`);
    } catch (error) {
        console.error(`Error settling L.D.O market ${market.marketName}:`, error);
    }
}

/**
 * Checks and closes markets for all overs if needed
 * @param {number} commentaryId - Commentary ID
 * @param {number} strikeTeamId - Strike team ID
 * @param {Object} fastify - Fastify instance
 */
function checkAndCloseMarketsForAllOvers(commentaryId, strikeTeamId, fastify) {
    // This is a placeholder function - implement based on your specific needs
    console.log(`[CHECK_CLOSE] Checking markets for auto-close for team ${strikeTeamId}`);

    // You can add logic here to check if any markets need to be closed
    // that might have been missed by the ball-to-action mapping
}

// Make sure to export all the functions that are used elsewhere
module.exports = {
    processPredictScoreMarket,
    executeMarketAction,
    openMarket,
    closeMarket,
    settleMarket,
    settleOddEvenMarket,
    settleLotteryMarket,
    settleLDOMarket,
};