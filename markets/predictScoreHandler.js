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
 * Settles an Odd-Even market (uses CUMULATIVE runs from over 1 to nth over)
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleOddEvenMarket(market, fastify) {
    try {
        console.log(`################# SETTLING ODD-EVEN MARKET #################`);
        console.log(`$$$$$$$$$ Over value: ${market.over} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Team ID: ${market.teamId} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Commentary ID: ${market.commentaryId} $$$$$$$$$`);

        // Calculate CUMULATIVE runs from over 1 to nth over
        const cumulativeRuns = calculateOverRunsTillEnd(market.commentaryId, market.teamId, market.over);
        const isEven = cumulativeRuns % 2 === 0;

        console.log(`################# Get CUMULATIVE runs from over 1 to ${market.over}: ${cumulativeRuns} #################`);
        console.log(`$$$$$$$$$ Is Even: ${isEven} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Result should be: ${isEven ? '2 (Even)' : '1 (Odd)'} $$$$$$$$$`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;
        market.isResult = true; // Set isResult flag as true

        // Find and set the winner
        if (!market.runners || market.runners.length < 2) {
            console.error(`################# ERROR: Cannot settle market ${market.eventMarketId || market.marketName}: runners not found or incomplete #################`);

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

        console.log(`################# Available runners: #################`);
        market.runners.forEach((runner, index) => {
            console.log(`Runner ${index + 1}: "${runner.runner}" (ID: ${runner.runnerId})`);
        });

        let winnerRunnerId = null;
        // Set result based on odd/even: 1 for odd, 2 for even
        market.result = winnerRunnerId;
        // market.result = isEven ? 2 : 1;

        // Process each runner
        market.runners.forEach(runner => {
            const runnerName = runner.runner.toLowerCase();
            const isEvenRunner = runnerName.includes('even');
            const isOddRunner = runnerName.includes('odd');

            if ((isEven && isEvenRunner) || (!isEven && isOddRunner)) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`################# Winner: ${runner.runner} (ID: ${runner.runnerId}) #################`);
            } else if ((isEven && isOddRunner) || (!isEven && isEvenRunner)) {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
                console.log(`$$$$$$$$$ Loser: ${runner.runner} (ID: ${runner.runnerId}) $$$$$$$$$`);
            }
        });

        // Set the winner runner ID in eventMarketResult
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        console.log(`################# Final Result Set: ${market.result} (${isEven ? 'Even' : 'Odd'}) #################`);
        console.log(`################# Winner Runner ID: ${winnerRunnerId} #################`);

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB - will insert if ID is 0 and market doesn't exist in DB
        updateMarketStatusInDB(market, fastify);
    } catch (error) {
        console.error(`################# ERROR settling odd-even market ${market.marketName}: ${error} #################`);
    }
}

/**
 * Settles a Lottery market (uses CUMULATIVE runs from over 1 to nth over)
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleLotteryMarket(market, fastify) {
    try {
        console.log(`################# SETTLING LOTTERY MARKET #################`);
        console.log(`$$$$$$$$$ Over value: ${market.over} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Team ID: ${market.teamId} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Commentary ID: ${market.commentaryId} $$$$$$$$$`);

        // Calculate CUMULATIVE runs from over 1 to nth over
        const cumulativeRuns = calculateOverRunsTillEnd(market.commentaryId, market.teamId, market.over);
        const lastDigit = cumulativeRuns % 10;

        console.log(`################# Get CUMULATIVE runs from over 1 to ${market.over}: ${cumulativeRuns} #################`);
        console.log(`$$$$$$$$$ Last digit: ${lastDigit} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Result should be: ${lastDigit} $$$$$$$$$`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;
        market.isResult = true; // Set isResult flag as true

        // Ensure we have runners
        if (!market.runners || market.runners.length === 0) {
            console.error(`################# ERROR: Cannot settle lottery market ${market.eventMarketId || market.marketName}: runners not found #################`);

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

        console.log(`################# Available runners: #################`);
        market.runners.forEach((runner, index) => {
            console.log(`Runner ${index + 1}: "${runner.runner}" (ID: ${runner.runnerId})`);
        });

        let winnerRunnerId = null;
        // Set result to the last digit
        // market.result = lastDigit;
        market.result = winnerRunnerId;

        // Process each runner
        market.runners.forEach(runner => {
            // Check if this runner represents the last digit
            const runnerValue = parseInt(runner.runner);

            if (!isNaN(runnerValue) && runnerValue === lastDigit) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`################# Winner: ${runner.runner} (ID: ${runner.runnerId}) #################`);
            } else {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
                console.log(`$$$$$$$$$ Loser: ${runner.runner} (ID: ${runner.runnerId}) $$$$$$$$$`);
            }
        });

        // Set the winner runner ID in eventMarketResult
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        console.log(`################# Final Result Set: ${market.result} (Last Digit: ${lastDigit}) #################`);
        console.log(`################# Winner Runner ID: ${winnerRunnerId} #################`);

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB
        updateMarketStatusInDB(market, fastify);
    } catch (error) {
        console.error(`################# ERROR settling lottery market ${market.marketName}: ${error} #################`);
    }
}

/**
 * Settles an L.D.O market (uses runs in THAT SPECIFIC OVER ONLY)
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleLDOMarket(market, fastify) {
    try {
        console.log(`################# SETTLING L.D.O MARKET #################`);
        console.log(`$$$$$$$$$ Over value: ${market.over} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Team ID: ${market.teamId} $$$$$$$$$`);
        console.log(`$$$$$$$$$ Commentary ID: ${market.commentaryId} $$$$$$$$$`);

        // Calculate runs scored in THAT SPECIFIC OVER ONLY (not cumulative)
        const overRuns = calculateRunsInSpecificOver(market.commentaryId, market.teamId, market.over);
        const isEven = overRuns % 2 === 0;

        console.log(`################# Get runs from SPECIFIC over ${market.over} only: ${overRuns} #################`);
        console.log(`$$$$$$$$$ Is Even: ${isEven} $$$$$$$$$`);
        console.log(`$$$$$$$$$ For L.D.O odd/even result should be: ${isEven ? '2 (Even)' : '1 (Odd)'} $$$$$$$$$`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;
        market.isResult = true; // Set isResult flag as true

        // Ensure we have runners
        if (!market.runners || market.runners.length === 0) {
            console.error(`################# ERROR: Cannot settle L.D.O market ${market.eventMarketId || market.marketName}: runners not found #################`);

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

        console.log(`################# Available runners: #################`);
        market.runners.forEach((runner, index) => {
            console.log(`Runner ${index + 1}: "${runner.runner}" (ID: ${runner.runnerId}, Predefined: ${runner.predefinedValue})`);
        });

        let winnerRunnerId = null;
        let hasOddEvenRunners = false;

        // Check if this is an odd/even L.D.O market
        const hasOddRunner = market.runners.some(r => r.runner.toLowerCase().includes('odd'));
        const hasEvenRunner = market.runners.some(r => r.runner.toLowerCase().includes('even'));
        hasOddEvenRunners = hasOddRunner || hasEvenRunner;

        console.log(`$$$$$$$$$ Has Odd Runner: ${hasOddRunner}, Has Even Runner: ${hasEvenRunner} $$$$$$$$$`);

        // L.D.O market settlement logic
        market.runners.forEach(runner => {
            const predefinedValue = parseFloat(runner.predefinedValue) || 0;
            let isWinner = false;

            if (runner.runner.toLowerCase().includes('over')) {
                isWinner = overRuns > predefinedValue;
                console.log(`$$$$$$$$$ Over check: ${overRuns} > ${predefinedValue} = ${isWinner} $$$$$$$$$`);
            } else if (runner.runner.toLowerCase().includes('under')) {
                isWinner = overRuns < predefinedValue;
                console.log(`$$$$$$$$$ Under check: ${overRuns} < ${predefinedValue} = ${isWinner} $$$$$$$$$`);
            } else if (runner.runner.toLowerCase().includes('odd')) {
                isWinner = overRuns % 2 !== 0;
                console.log(`$$$$$$$$$ Odd check: ${overRuns} % 2 !== 0 = ${isWinner} $$$$$$$$$`);
            } else if (runner.runner.toLowerCase().includes('even')) {
                isWinner = overRuns % 2 === 0;
                console.log(`$$$$$$$$$ Even check: ${overRuns} % 2 === 0 = ${isWinner} $$$$$$$$$`);
            } else {
                // For other types, use exact match
                isWinner = overRuns === predefinedValue;
                console.log(`$$$$$$$$$ Exact match check: ${overRuns} === ${predefinedValue} = ${isWinner} $$$$$$$$$`);
            }

            if (isWinner) {
                // This runner wins
                runner.selectionStatus = 7; // WIN
                winnerRunnerId = runner.runnerId;
                console.log(`################# Winner: ${runner.runner} (ID: ${runner.runnerId}, Predefined: ${predefinedValue}) #################`);
            } else {
                // This runner loses
                runner.selectionStatus = 8; // LOSE
                console.log(`$$$$$$$$$ Loser: ${runner.runner} (ID: ${runner.runnerId}, Predefined: ${predefinedValue}) $$$$$$$$$`);
            }
        });

        // Set result - for odd/even L.D.O markets, use 1 for odd, 2 for even
        if (hasOddEvenRunners) {
            market.result = isEven ? 2 : 1;
            console.log(`$$$$$$$$$ L.D.O Odd/Even Result: ${market.result} (${isEven ? 'Even' : 'Odd'}) $$$$$$$$$`);
        } else {
            // For other types of L.D.O markets, set the winner runner ID as result
            market.result = winnerRunnerId || 0;
            console.log(`$$$$$$$$$ L.D.O Other Type Result: ${market.result} $$$$$$$$$`);
        }

        // Set the winner runner ID in eventMarketResult
        market.eventMarketResult = { winnerRunnerId: winnerRunnerId };

        console.log(`################# Final Result Set: ${market.result} #################`);
        console.log(`################# Winner Runner ID: ${winnerRunnerId} #################`);

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB
        updateMarketStatusInDB(market, fastify);

        console.log(`################# L.D.O market settled for over ${market.over} with runs ${overRuns}, result: ${market.result} #################`);
    } catch (error) {
        console.error(`################# ERROR settling L.D.O market ${market.marketName}: ${error} #################`);
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