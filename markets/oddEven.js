// oddEven.js
const { EventMarketStatus } = require('../utilities');
const { ballsToOvers } = require('./ballToActionMapper');

/**
 * Process Odd/Even markets
 * @param {Object} data - The prediction score data
 */
function processOddEven(data) {
    const { total_score } = data?.predictscore || {};
    if (typeof total_score !== 'number') return { error: 'Invalid score data' };

    const result = total_score % 2 === 0 ? 'Even' : 'Odd';
    return {
        market: 'odd-even',
        value: result,
        total_score,
    };
}

/**
 * Helper function to determine if a market should be opened or closed based on total balls
 * @param {Object} market - The market to check
 * @param {number} totalBalls - The total balls played
 * @param {number} totalWicket - The total wickets fallen
 * @returns {Object} - Updated market and update flag
 */
function openCloseMarket(market, totalBalls, totalWicket) {
    let isUpdate = false;

    // Create/Open/Suspend/Close based on ball count
    const createBalls = market.createBalls || 0;
    const autoOpenBalls = market.autoOpenBalls || 0;
    const beforeAutoSuspendBalls = market.beforeAutoSuspendBalls || 0;
    const beforeAutoCloseBalls = market.beforeAutoCloseBalls || 0;

    // If market should be created
    if (totalBalls >= createBalls && market.status === EventMarketStatus.NotCreated) {
        market.status = EventMarketStatus.Inactive;
        isUpdate = true;
    }

    // If market should be opened
    if (totalBalls >= autoOpenBalls &&
        market.status === EventMarketStatus.Inactive) {
        market.status = EventMarketStatus.Open;
        isUpdate = true;
    }

    // If market should be suspended
    if (totalBalls >= beforeAutoSuspendBalls &&
        market.status === EventMarketStatus.Open) {
        market.status = EventMarketStatus.Suspend;
        isUpdate = true;
    }

    // If market should be closed
    if (totalBalls >= beforeAutoCloseBalls &&
        (market.status === EventMarketStatus.Open ||
            market.status === EventMarketStatus.Suspend)) {
        market.status = EventMarketStatus.Close;
        isUpdate = true;
    }

    return { updatedMarket: market, isUpdate };
}

/**
 * Process all odd-even, lottery, and L.D.O markets for the current ball
 * @param {Object} data - The prediction score data
 */
function processOddEvenMarkets(
    currentBall,
    run,
    commentaryId,
    currentScore,
    strikeTeamId,
    matchTypeId,
    isWicket,
    totalWicket,
    ballByBallId) {

    // Convert to total balls
    const totalBalls = oversToBalls(parseFloat(currentBall), matchTypeId);

    // Get markets for this commentary
    if (!global.marketData || !global.marketData[commentaryId]) {
        console.log(`No market data found for commentary ID: ${commentaryId}`);
        return;
    }

    // Find odd-even, lottery, and L.D.O markets
    const allMarkets = global.marketData[commentaryId].markets;
    const specialMarkets = allMarkets.filter(
        market => market.marketTypeCategoryId === 28 ||
            market.marketTypeCategoryId === 35 ||
            market.marketTypeCategoryId === 26
    );

    if (!specialMarkets || specialMarkets.length === 0) {
        console.log(`No special markets (odd-even, lottery, or L.D.O) found for commentary ID: ${commentaryId}`);
        return;
    }

    const lotteryCount = specialMarkets.filter(m => m.marketTypeCategoryId === 28).length;
    const oddEvenCount = specialMarkets.filter(m => m.marketTypeCategoryId === 35).length;
    const ldoCount = specialMarkets.filter(m => m.marketTypeCategoryId === 26).length;

    console.log(`Processing ${specialMarkets.length} special markets: ${lotteryCount} lottery, ${oddEvenCount} odd-even, and ${ldoCount} L.D.O`);

    // Process each market
    const runnerData = [];
    const eventData = [];
    const marketDatalog = [];
    const socketData = [];
    const wicketDeduction = 1;

    for (const market of specialMarkets) {
        // Skip already settled markets or markets not yet created
        if (market.status === EventMarketStatus.Settled || totalBalls < market.createBalls) {
            continue;
        }

        let marketTypeName = 'Other';
        if (market.marketTypeCategoryId === 35) marketTypeName = 'Odd-Even';
        else if (market.marketTypeCategoryId === 28) marketTypeName = 'Lottery';
        else if (market.marketTypeCategoryId === 26) marketTypeName = 'L.D.O';

        console.log(`Processing ${marketTypeName} market ${market.marketName} (ID: ${market.eventMarketId}, Category: ${market.marketTypeCategoryId}, Status: ${market.status})`);

        // Check if market needs status update
        let selectionStatus = EventMarketStatus.NotCreated;
        let isUpdate = false;
        let isSendData = true;

        // Reset from suspend if needed
        if (market.status === EventMarketStatus.Suspend) {
            market.status = EventMarketStatus.Open;
            console.log(`Resetting market ${market.marketName} from Suspend to Open`);
        }

        // Check for market status changes
        const { updatedMarket, isUpdate: statusChanged } = openCloseMarket(
            market, totalBalls, totalWicket
        );

        // Apply any wicket deduction if needed (mainly for L.D.O markets)
        if (isWicket === 1 && market.marketTypeCategoryId === 26) {
            updatedMarket.wrPredefinedValue -= wicketDeduction;
            console.log(`Applied wicket deduction to L.D.O market ${market.marketName}`);
        }

        // Deep clone the market to prevent reference issues
        const marketClone = JSON.parse(JSON.stringify(updatedMarket));

        // Update the market
        market.status = marketClone.status;
        isUpdate = statusChanged;

        console.log(`After status check: ${marketTypeName} market ${market.marketName} (Category: ${market.marketTypeCategoryId}) status: ${market.status}, isUpdate: ${isUpdate}`);

        // Process auto-settlement if needed
        if (market.isOver &&
            ((market.status === EventMarketStatus.Open ||
                market.status === EventMarketStatus.Inactive ||
                market.status === EventMarketStatus.Suspend) ||
                (market.status === EventMarketStatus.Close &&
                    totalBalls >= market.beforeAutoCloseBalls &&
                    totalBalls <= market.overBalls) ||
                (market.status === EventMarketStatus.Close &&
                    totalBalls === market.overBalls + market.wrAutoResultafterBall))) {

            // If status has changed
            if (isUpdate) {
                if (market.status === EventMarketStatus.Close) {
                    selectionStatus = EventMarketStatus.Close;
                    console.log(`Setting selectionStatus to Close for ${marketTypeName} market ${market.marketName}`);
                } else if (market.status === EventMarketStatus.Open) {
                    selectionStatus = EventMarketStatus.Open;
                    isSendData = market.wrDefaultIsSendData;
                    console.log(`Setting selectionStatus to Open for ${marketTypeName} market ${market.marketName}`);
                }

                // Check if it's time to settle
                if (totalBalls >= market.overBalls + market.wrAutoResultafterBall &&
                    market.isAutoResultSet &&
                    market.status === EventMarketStatus.Close &&
                    market.status !== EventMarketStatus.Settled) {

                    // Get runs for this over
                    const runs = currentScore; // Simplification - in real code would get specific over runs

                    // Determine winner based on market type
                    if (market.marketTypeCategoryId === 35) {
                        // Odd-Even market settlement
                        market.runners.forEach(runner => {
                            runner.wrSelectionStatus = ((runs % 2 === 0 && runner.runner.toLowerCase().includes("even")) ||
                                (runs % 2 !== 0 && runner.runner.toLowerCase().includes("odd")))
                                ? EventMarketStatus.Win : EventMarketStatus.Lose;

                            if (runner.wrSelectionStatus === EventMarketStatus.Win) {
                                market.wrResult = runner.runnerId;
                            }
                        });
                    } else if (market.marketTypeCategoryId === 28) {
                        // Lottery market settlement
                        const lastDigit = runs % 10;
                        market.runners.forEach(runner => {
                            const runnerValue = parseInt(runner.runner);
                            runner.wrSelectionStatus = (!isNaN(runnerValue) && runnerValue === lastDigit)
                                ? EventMarketStatus.Win : EventMarketStatus.Lose;

                            if (runner.wrSelectionStatus === EventMarketStatus.Win) {
                                market.wrResult = runner.runnerId;
                            }
                        });
                    } else if (market.marketTypeCategoryId === 26) {
                        // L.D.O market settlement
                        market.runners.forEach(runner => {
                            const predefinedValue = parseFloat(runner.predefinedValue) || 0;
                            let isWinner = false;

                            // L.D.O settlement logic based on runner type
                            if (runner.runner.toLowerCase().includes('over')) {
                                isWinner = runs > predefinedValue;
                            } else if (runner.runner.toLowerCase().includes('under')) {
                                isWinner = runs < predefinedValue;
                            } else if (runner.runner.toLowerCase().includes('odd')) {
                                isWinner = runs % 2 !== 0;
                            } else if (runner.runner.toLowerCase().includes('even')) {
                                isWinner = runs % 2 === 0;
                            } else {
                                // Default comparison for other types
                                isWinner = runs === predefinedValue;
                            }

                            runner.wrSelectionStatus = isWinner ? EventMarketStatus.Win : EventMarketStatus.Lose;

                            if (runner.wrSelectionStatus === EventMarketStatus.Win) {
                                market.wrResult = runner.runnerId;
                            }
                        });
                    }

                    selectionStatus = EventMarketStatus.Settled;
                    market.status = EventMarketStatus.Settled;
                    market.wrSettledTime = new Date().toISOString();
                    console.log(`Settling ${marketTypeName} market ${market.marketName} with status ${market.status}`);
                }

                // Update data for socket/DB - ensure these properties are set
                market.wrIsSendData = isSendData;

                // Prepare data for updates (simplified for this implementation)
                marketDatalog.push({
                    wrCommentaryId: commentaryId,
                    wrEventMarketId: market.eventMarketId,
                    wrData: JSON.stringify(market),
                    wrUpdateType: 1,
                    wrIsSendData: isSendData,
                    category: market.marketTypeCategoryId, // Added for debugging
                    marketType: marketTypeName // Added for debugging
                });

                socketData.push({
                    market: market.eventMarketId,
                    status: market.status,
                    runners: market.runners,
                    category: market.marketTypeCategoryId, // Added for debugging
                    marketType: marketTypeName // Added for debugging
                });
            }
        } else if (market.status === EventMarketStatus.Close &&
            parseFloat(currentBall) !== parseFloat(market.over) +
            (parseFloat(market.wrAutoResultafterBall) / 10)) {
            selectionStatus = EventMarketStatus.Close;
        } else if (market.status === EventMarketStatus.Suspend) {
            selectionStatus = EventMarketStatus.Suspend;
        }
    }

    // Send updates if needed
    if (marketDatalog.length > 0) {
        console.log(`[SPECIAL-MARKETS] Updating ${marketDatalog.length} markets:`);
        marketDatalog.forEach(entry => {
            console.log(`- Market ID: ${entry.wrEventMarketId}, Category: ${entry.category}, Type: ${entry.marketType}`);
        });
    }

    return {
        updated: marketDatalog.length > 0,
        markets: specialMarkets
    };
}

// Helper function to convert overs to balls
function oversToBalls(overs, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over
    const fullOvers = Math.floor(overs);
    const balls = Math.round((overs - fullOvers) * 10);
    return fullOvers * BALLS_PER_OVER + balls;
}

/**
 * Process L.D.O specific market logic
 * @param {Object} data - The prediction score data
 */
function processLDO(data) {
    const { total_score, predefined_value } = data?.predictscore || {};
    if (typeof total_score !== 'number') return { error: 'Invalid score data' };

    // L.D.O specific logic - you can customize this based on your requirements
    const result = {
        market: 'ldo',
        total_score,
        predefined_value: predefined_value || 0,
        over_under: total_score > (predefined_value || 0) ? 'Over' : 'Under',
        odd_even: total_score % 2 === 0 ? 'Even' : 'Odd'
    };

    return result;
}

module.exports = {
    processOddEven,
    processOddEvenMarkets,
    processLDO,
    openCloseMarket
};