// index.js - Market Module
const { getAllEventMarketsQuery, getAllEventMarketsQueryV1, getExistingEventMarketsQueryV1 } = require('../repository/TableEventMarkets');
const { getCommMatchTypeTemplatesQuery } = require('../repository/TableMarketTemplate');
const { getTemplateRunnerQuery } = require('../repository/TableMarketTemplateRunner');
const { getPlayersBattingHistoryByIdQuery } = require('../repository/TablePlayerHistory');
const { commentaryStatus, EventMarketStatus } = require('../utilities');
const configConstants = require('../utilities/configConstants');
const { errorLogger } = require('../utilities/logger');
const { processOddEven, processOddEvenMarkets, processLotteryMarkets, processMarketAndRunnersOfOE } = require('./oddEven');
const { updateMarketStatusInDB, updateMarketStatusInSocket } = require('./marketActions');
const { processPredictScoreMarket } = require('./predictScoreHandler');
const {
  initializeBallToActionMap,
  getActionsForBall,
  findMarket,
  logFullBallToActionMap,
  getAllMappedActions
} = require('./ballToActionMapper');
const { createMarketAndRunner } = require('./utils');

/**
 * Market handlers for different market types
 */
const MARKET_HANDLERS = {
  'odd-even': processOddEven,
  // Add more market handlers here as needed
};

/**
 * Runs a specific market handler
 * @param {Object} params - Parameters including market type and data
 * @returns {Object} - Result of market processing
 */
async function marketGenRunner({ market, data }) {
  // Find the appropriate handler for this market type
  const handler = MARKET_HANDLERS[market];
  if (!handler) return { error: `No handler for market: ${market}` };

  // Run the handler
  const result = handler(data);
  if (result.error) return result;

  // Get required IDs
  const commentaryId = data?.commentary_id || data?.predictscore?.commentary_id;
  const eventId = data?.predictscore?.event_id;

  // Update status in DB and socket
  updateMarketStatusInDB(result);
  updateMarketStatusInSocket(result);

  return result;
}

/**
 * Generates markets and runners based on templates
 * @param {Object} data - Commentary and match data
 * @param {Object} request - FastAPI request
 * @param {Object} fastify - FastAPI instance
 * @returns {Object} - Generation result
 */
const generateMarketAndRunners = async (data, request, fastify) => {
  try {
    console.log(`Generating markets for commentary ${data.commentaryId}`);

    const { commentary, commentaryId } = data;

    // Get ignore markets configuration
    let configData = global.tblConfigs.find(
      (item) => item.key.toLowerCase() == configConstants.IGNOREMARKETS.toLowerCase()
    )?.value || "";

    let ignoreMarkets = configData ? configData.split(",").map(Number) : [];

    // Get templates based on commentary status
    let comTemplate = [];
    if (commentary.commentaryStatus == commentaryStatus.OPEN) {
      comTemplate = await getTemplateRunnerQuery({
        commentaryId: commentaryId,
        ignoreMarkets: ignoreMarkets,
        where: null
      }, request, fastify);
    } else {
      let whereCondition = `AND tmt."wrIsPerEvent" = FALSE`;
      comTemplate = await getTemplateRunnerQuery({
        commentaryId: commentaryId,
        ignoreMarkets: ignoreMarkets,
        where: whereCondition
      }, request, fastify);
    }

    // Initialize global market data structure
    global.marketData[data.commentaryId] = {
      template: comTemplate,
      markets: [],
      ballToActionMap: {}
    };

    // Get match type and innings information
    const matchType = global.tblMatchTypes.find(
      (item) => item.matchTypeId === data.matchTypeId
    );

    const totalInnings = matchType.noOfIningsPerSide;
    const teamAndPlayers = [];
    const playerStats = [];

    // Process teams and players
    for (let i = 1; i <= totalInnings; i++) {
      let commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === i
      );

      const systemPlayer = global.tblPlayers
        .filter((item) => item.isSystemPlayer === true)
        .map((item) => item.playerId);

      for (const team of commentaryTeam) {
        const commentaryPlayers = global.tblCommentaryPlayers.filter(
          (item) =>
            item.commentaryId === commentaryId &&
            item.teamId === team.teamId &&
            item.currentInnings === i
        );

        const teamObj = {
          ...team,
          players: commentaryPlayers,
        };

        teamAndPlayers.push(teamObj);

        // Process player statistics
        for (const curr of global.tblCommentaryPlayers) {
          if (curr.commentaryId === commentaryId && curr.teamId === team.teamId && curr.currentInnings === i) {
            // Get player batting history
            const playerAvg = await getPlayersBattingHistoryByIdQuery(
              { playerId: curr.playerId, matchTypeId: commentary.matchTypeId },
              fastify,
              request
            );

            // Calculate player statistics
            let boundary =
              curr.boundary == 0 || curr.boundary == null
                ? playerAvg.length > 0
                  ? parseFloat(((playerAvg[0]?.countOf4 + playerAvg[0]?.countOf6) / playerAvg[0]?.inningsCount).toFixed(1)) || 0
                  : 0
                : curr.boundary;

            let playerBallFaced =
              curr.playerBallFaced === 0 || curr.playerBallFaced == null
                ? playerAvg.length > 0
                  ? parseFloat((playerAvg[0]?.ballsFacedCount / playerAvg[0]?.inningsCount).toFixed(1)) || 0
                  : 0
                : curr.playerBallFaced;

            // Create player object with statistics
            const playerObj = {
              teamId: curr.teamId,
              playerId: curr.playerId,
              playerName: curr.playerName,
              batsmanAverage: isNaN(Number(curr.batsmanAverage)) ? 0 : parseFloat(Number(curr.batsmanAverage).toFixed(1)),
              batsmanStrikeRate: isNaN(Number(curr.batsmanStrikeRate)) ? 0 : parseFloat(Number(curr.batsmanStrikeRate).toFixed(1)),
              commentaryPlayerId: curr.commentaryPlayerId,
              isInPlayingEleven: curr.isInPlayingEleven,
              boundary,
              playerBallFaced,
              currentInnings: curr.currentInnings,
              playerTypeId: curr.playerTypeId,
              playerType: curr.playerType,
            };

            // Add non-system players to the stats array
            if (!systemPlayer.includes(curr.playerId)) {
              playerStats.push(playerObj);
            }
          }
        }
      }
    }

    // Get team names
    let t1 = global.tblCommentaryTeams.find(
      (item) => item.commentaryId === data.commentaryId && item.teamId === data.commentary.team1Id
    );

    let t2 = global.tblCommentaryTeams.find(
      (item) => item.commentaryId === data.commentaryId && item.teamId === data.commentary.team2Id
    );

    // Fetch existing markets
    let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tem."wrCommentaryId" = ${commentaryId} AND 
      tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel})
      AND tem."wrRateSource" = 1 `;

    console.log("whereCondition", whereCondition);

    let eventMarket;
    if (commentary.commentaryStatus != 1) {
      let battingTeam = global.tblCommentaryTeams.find(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === 1 &&
          item.teamStatus === 1
      );

      whereCondition += ` AND tem."wrTeamID" = ${battingTeam.teamId}`;

      if (ignoreMarkets.length > 0) {
        whereCondition += ` AND tem."wrMarketTypeCategoryId" NOT IN (${ignoreMarkets.join(",")})`;
      }

      eventMarket = await getExistingEventMarketsQueryV1(fastify, whereCondition);
    } else {
      if (ignoreMarkets.length > 0) {
        whereCondition += ` AND tem."wrMarketTypeCategoryId" NOT IN (${ignoreMarkets.join(",")})`;
      }

      eventMarket = await getExistingEventMarketsQueryV1(fastify, whereCondition);
    }

    // Store existing markets
    global.marketData[data.commentaryId].existingMarket = eventMarket;

    // Create markets and runners
    let mar = await createMarketAndRunner(
      {
        templates: comTemplate,
        teams: teamAndPlayers,
        commentary: {
          ...commentary,
          team1Name: t1?.teamName || 'Team 1',
          team2Name: t2?.teamName || 'Team 2',
        },
        matchType: matchType,
        existingMarkets: eventMarket,
      },
      request,
      fastify
    );

    // Initialize the ball-to-action map
    initializeBallToActionMap(global.marketData[data.commentaryId].markets, data.commentaryId);

    // Log the total number of markets and entries in ball-to-action map
    console.log(`Generated ${global.marketData[data.commentaryId].markets.length} markets for commentary ${data.commentaryId}`);

    // Log all ball-to-action entries for debugging
    const allMappedActions = getAllMappedActions(data.commentaryId);
    console.log(`Ball-to-action map has ${allMappedActions.length} total actions across ${Object.keys(global.marketData[data.commentaryId].ballToActionMap).length} balls`);

    // Log the raw structure for verification
    console.log(`Ball to Ball : ${Object.keys(global.marketData[data.commentaryId].ballToActionMap).join(',')}`);

    // Log in more readable format - first 10 entries
    const sampleEntries = allMappedActions.slice(0, 10);
    console.log("Sample entries from ball-to-action map:");
    console.log(JSON.stringify(sampleEntries, null, 2));

    return mar;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "Error ->> markerts/index.js -> generateMarketAndRunners",
      request
    );

    console.log(error.message);
    return { error: error.message };
  }
};

// Export the public API
module.exports = {
  marketGenRunner,
  generateMarketAndRunners,
  processPredictScoreMarket,
  processOddEven,
  processOddEvenMarkets,
  processLotteryMarkets,
  processMarketAndRunnersOfOE,
  initializeBallToActionMap,
  getActionsForBall,
  findMarket,
  updateMarketStatusInDB,
  updateMarketStatusInSocket,
  logFullBallToActionMap,
  getAllMappedActions
};