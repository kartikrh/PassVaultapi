// predictScoreHandler.js
const { getActionsForBall, findMarket, formatBallNumber } = require('./ballToActionMapper');
const { updateMarketStatusInDB, updateMarketStatusInSocket } = require('./marketActions');
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

            // Process each action - only create in DB when needed
            for (const action of actions) {
                try {
                    executeMarketAction(commentaryId, action, fastify);
                } catch (actionError) {
                    console.error(`Error executing action ${action.action} for market ${action.marketId}:`, actionError);
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
        // synchronizeMarketIds(commentaryId);
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
 * @param {Object} fastify - Fastify instance
 */
function executeMarketAction(commentaryId, action, fastify) {
    const { marketId, action: actionType, over, marketTypeCategoryId, teamId } = action;

    console.log(`[EXEC] Executing ${actionType} for ${marketTypeCategoryId === 35 ? 'Odd-Even' : marketTypeCategoryId === 28 ? 'Lottery' : 'Other'} market: ID=${marketId}, over=${over}, teamId=${teamId}`);

    // Find the market in global state with precise matching
    const market = findMarket(commentaryId, marketId, {
        over,
        marketTypeCategoryId,
        teamId
    });

    if (!market) {
        console.error(`[EXEC] Cannot execute ${actionType} - Market not found in global state. ID=${marketId}, over=${over}, type=${marketTypeCategoryId}, teamId=${teamId}`);
        return;
    }

    // Check if this market is for the batting team
    if (!isBattingTeam(commentaryId, market.teamId)) {
        console.log(`[EXEC] Skipping action ${actionType} for non-batting team market: ${market.marketName} (teamId: ${market.teamId})`);
        return;
    }

    // Log detailed information about the market we're acting on
    console.log(`[EXEC] Executing ${actionType} on market: Name="${market.marketName}", ID=${market.eventMarketId || 'unsaved'}, type=${market.marketTypeCategoryId}, over=${market.over}, runners=${market.runners?.length || 0}`);

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
            console.error(`[EXEC] Unknown action type: ${actionType}`);
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

    const battingTeam = global.tblCommentaryTeams.find(
        item => item.commentaryId === parseInt(commentaryId) &&
            item.teamStatus === 1 // Assuming teamStatus 1 means batting
    );

    if (!battingTeam) {
        console.log(`Could not find batting team for commentary ${commentaryId}`);
        return true; // Default to true if batting team info not available
    }

    return parseInt(battingTeam.teamId) === parseInt(teamId);
}
/**
 * Opens a market
 * @param {Object} market - The market to open
 * @param {Object} fastify - Fastify Object
 */
function openMarket(market, fastify) {
    // // Skip if already open
    // if (market.status === EventMarketStatus.Open) {
    //     console.log(`Market ${market.marketName} is already open`);
    //     return;
    // }

    // Update market status to OPEN
    market.status = EventMarketStatus.Open;

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
    console.log(`[CLOSE] Attempting to close market: ID=${market.eventMarketId}, Name="${market.marketName}", Type=${market.marketTypeCategoryId}, Status=${market.status}`);

    // Skip if already closed or settled
    if (market.status === EventMarketStatus.Close || market.status === EventMarketStatus.Settled) {
        console.log(`[CLOSE] Market ${market.marketName} (ID: ${market.eventMarketId}) is already closed or settled (status: ${market.status})`);
        return;
    }

    // Update market status to CLOSE
    market.status = EventMarketStatus.Close;
    console.log(`[CLOSE] Setting status to CLOSE (${EventMarketStatus.Close}) for market ${market.marketName} (ID: ${market.eventMarketId})`);

    // Update runners' statuses if needed
    if (market.runners && market.runners.length > 0) {
        console.log(`[CLOSE] Updating ${market.runners.length} runners to CLOSE status`);
        market.runners.forEach(runner => {
            runner.selectionStatus = EventMarketStatus.Close;
        });
    } else {
        console.warn(`[CLOSE] No runners found for market ${market.marketName} (ID: ${market.eventMarketId})`);
    }

    // Update in DB - will insert if ID is 0 and market doesn't exist in DB
    console.log(`[CLOSE] Calling updateMarketStatusInDB for market ${market.marketName} (ID: ${market.eventMarketId})`);
    updateMarketStatusInDB(market, fastify);
    // Socket update is handled by updateMarketStatusInDB

    console.log(`[CLOSE] Closed market: ${market.marketName} (ID: ${market.eventMarketId || 'unsaved'})`);
}

/**
 * Settles a market
 * @param {Object} market - The market to settle
 * @param {Object} fastify - Fastify Object
 */
function settleMarket(market, fastify) {
    // // Skip if already settled
    // if (market.status === EventMarketStatus.Settled) {
    //     console.log(`Market ${market.marketName} is already settled`);
    //     return;
    // }

    // Different settlement logic based on market type
    if (market.marketTypeCategoryId === 28 || market.marketTypeCategoryId === 35) {
        // Odd-Even market settlement
        settleOddEvenMarket(market, fastify);
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
        // Calculate the result based on total runs in the over
        const overRuns = calculateOverRuns(market.commentaryId, market.teamId, market.over);
        const isEven = overRuns % 2 === 0;

        console.log(`Settling odd-even market for over ${market.over}. Runs: ${overRuns}, Result: ${isEven ? 'Even' : 'Odd'}`);

        // Set market as settled
        market.status = EventMarketStatus.Settled;

        // Find and set the winner
        if (!market.runners || market.runners.length < 2) {
            console.error(`Cannot settle market ${market.eventMarketId || market.marketName}: runners not found or incomplete`);

            // Try to fetch runners from DB if they're missing
            fetchRunnersForMarket(market, fastify).then(updatedMarket => {
                if (updatedMarket.runners && updatedMarket.runners.length >= 2) {
                    // Retry settlement with fetched runners
                    settleOddEvenMarket(updatedMarket, fastify);
                }
            }).catch(error => {
                console.error(`Failed to fetch runners for market ${market.eventMarketId}:`, error);
            });

            return;
        }

        // Process each runner
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

        // Set settled time
        market.settledTime = new Date().toISOString();

        // Update in DB - will insert if ID is 0 and market doesn't exist in DB
        updateMarketStatusInDB(market, fastify);
    } catch (error) {
        console.error(`Error settling odd-even market ${market.marketName}:`, error);
    }
}

/**
 * Fetches runners for a market if they're missing
 * @param {Object} market - The market
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<Object>} - The market with runners
 */
async function fetchRunnersForMarket(market, fastify) {
    if (market.runners && market.runners.length >= 2) {
        return market; // Already has runners
    }

    try {
        const marketId = market.eventMarketId;

        if (!marketId || marketId === 0) {
            throw new Error("Cannot fetch runners for market without ID");
        }

        // Fetch runners from database
        const query = `
            SELECT * FROM "tblMarketRunners"
            WHERE "wrEventMarketId" = ${marketId}
        `;

        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            // Map DB runners to expected format
            const runners = result.map(r => ({
                runnerId: r.wrRunnerId,
                runner: r.wrRunner,
                line: r.wrLine || 0,
                backPrice: r.wrBackPrice || 1.9,
                layPrice: r.wrLayPrice || 1.9,
                backSize: r.wrBackSize || 10000,
                laySize: r.wrLaySize || 10000,
                selectionStatus: r.wrSelectionStatus
            }));

            // Update market with runners
            market.runners = runners;

            // Update global state
            if (global.marketData && global.marketData[market.commentaryId] && global.marketData[market.commentaryId].markets) {
                const marketIndex = global.marketData[market.commentaryId].markets.findIndex(
                    m => m.eventMarketId && m.eventMarketId.toString() === marketId.toString()
                );

                if (marketIndex !== -1) {
                    global.marketData[market.commentaryId].markets[marketIndex].runners = runners;
                }
            }

            console.log(`Fetched ${runners.length} runners for market ${marketId}`);
        } else {
            console.error(`No runners found for market ${marketId}`);
        }

        return market;
    } catch (error) {
        console.error(`Error fetching runners:`, error);
        return market;
    }
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

// Make sure to export all the functions that are used elsewhere
module.exports = {
    processPredictScoreMarket,
    executeMarketAction,
    openMarket,
    closeMarket,
    settleMarket,
    settleOddEvenMarket,
    calculateOverRuns
};