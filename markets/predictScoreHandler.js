// predictScoreHandler.js
const { getActionsForBall, findMarket } = require('./ballToActionMapper');
const { openMarket, closeMarket, settleMarket } = require('./marketActions');
const { processOddEven, processOddEvenMarkets } = require('./oddEven');

/**
 * Process predict score market from payload
 * @param {Object} payload - The payload from the cricket match
 * @returns {Object} - Processing result
 */
function processPredictScoreMarket(payload) {
    try {
        // Extract data from payload
        const predictscore = payload.predictscore || {};
        const playerpredictscore = payload.playerpredictscore || {};
        const commentaryId = predictscore.commentary_id || playerpredictscore.commentary_id;

        // Validate essential data
        if (!commentaryId) {
            console.error("Invalid payload: Missing commentary_id");
            return { error: "Invalid payload structure" };
        }

        // Extract key information
        const currentBall = predictscore.ball;
        const score = predictscore.run;
        const totalScore = predictscore.total_score;
        const strikeTeamId = predictscore.strike_team_id;
        const matchTypeId = predictscore.match_type_id;
        const isWicket = predictscore.wicket;
        const totalWicket = predictscore.total_wicket;
        const ballByBallId = predictscore.ball_by_ball_id;
        const eventId = playerpredictscore.event_id;

        // Process market actions based on current ball
        processMarketActions(commentaryId, currentBall, totalScore);

        // Process odd-even markets (similar to Python's process_oddeven_markets)
        processOddEvenMarkets(payload);

        // Return success
        return {
            success: true,
            message: `Processed predict score for ball ${currentBall}`
        };
    } catch (error) {
        console.error("Error processing predict score market:", error);
        return {
            error: `Failed to process predict score: ${error.message}`
        };
    }
}

/**
 * Process market actions based on ball-to-action map
 * @param {number} commentaryId - The commentary ID
 * @param {string} currentBall - The current ball (e.g., "5.3")
 * @param {number} totalScore - The current total score
 */
function processMarketActions(commentaryId, currentBall, totalScore) {
    // Get the actions for this ball
    const actions = getActionsForBall(commentaryId, currentBall.toString());

    if (!actions || actions.length === 0) {
        console.log(`No actions mapped for ball ${currentBall}`);
        return;
    }

    console.log(`Processing ${actions.length} actions for ball ${currentBall}`);

    // Process each action
    actions.forEach(action => {
        const { action: actionType, marketId } = action;
        const market = findMarket(commentaryId, marketId);

        if (!market) {
            console.warn(`Market ${marketId} not found for action ${actionType}`);
            return;
        }

        // Execute the appropriate action
        switch (actionType) {
            case "open":
                openMarket(market);
                break;
            case "close":
                closeMarket(market);
                break;
            case "settle":
                settleMarket(market, totalScore);
                break;
            default:
                console.warn(`Unknown action type: ${actionType}`);
        }
    });
}

module.exports = {
    processPredictScoreMarket
};