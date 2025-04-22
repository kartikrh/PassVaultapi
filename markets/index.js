// Usefult to call market pages
const { getAllEventMarketsQuery, getAllEventMarketsQueryV1, getExistingEventMarketsQueryV1 } = require('../repository/TableEventMarkets');
const { getCommMatchTypeTemplatesQuery } = require('../repository/TableMarketTemplate');
const { getTemplateRunnerQuery } = require('../repository/TableMarketTemplateRunner');
const { getPlayersBattingHistoryByIdQuery } = require('../repository/TablePlayerHistory');
const { commentaryStatus, EventMarketStatus } = require('../utilities');
const configConstants = require('../utilities/configConstants');
const { errorLogger } = require('../utilities/logger');
const { processOddEven, processOddEvenMarkets } = require('./oddEven');
const { updateMarketStatusInDB, updateMarketStatusInSocket } = require('./marketActions');
const { processPredictScoreMarket } = require('./predictScoreHandler');
const { initializeBallToActionMap } = require('./ballToActionMapper');

// Define market handlers - add more as needed
const MARKET_HANDLERS = {
  'odd-even': processOddEven,
};

async function marketGenRunner({ market, data }) {
  const handler = MARKET_HANDLERS[market];
  if (!handler) return { error: `No handler for market: ${market}` };

  const result = handler(data);

  if (result.error) return result;

  const commentaryId = data?.commentary_id || data?.predictscore?.commentary_id;
  const eventId = data?.predictscore?.event_id;

  updateMarketStatusInDB(result);
  updateMarketStatusInSocket(result);

  return result;
}

const generateMarketAndRunners = async (data, request, fastify) => {
  // generate market and runner based on the data
  try {
    const { commentary, commentaryId } = data;
    // get the commentaryMarketTemplate from the data
    let configData = global.tblConfigs.find((item) => item.key.toLowerCase() == configConstants.IGNOREMARKETS.toLowerCase()).value || ""
    let ignoreMarkets = configData ? configData.split(",").map(Number) : [];
    let comTemplate = []
    if (commentary.commentaryStatus == commentaryStatus.OPEN) {
      comTemplate = await getTemplateRunnerQuery({
        commentaryId: commentaryId,
        ignoreMarkets: ignoreMarkets,
        where: null
      }, request, fastify);
    }
    else {
      let whereCondition = `AND tmt."wrIsPerEvent" = FALSE`
      comTemplate = await getTemplateRunnerQuery({
        commentaryId: commentaryId,
        ignoreMarkets: ignoreMarkets,
        where: whereCondition
      }, request, fastify);
    }

    global.marketData[data.commentaryId] = {
      template: comTemplate,
      markets: []
    }
    const matchType = global.tblMatchTypes.find(
      (item) => item.matchTypeId === data.matchTypeId
    );
    const totalInnings = matchType.noOfIningsPerSide;
    const teamAndPlayers = [];
    const playerStats = [];
    for (let i = 1; i <= totalInnings; i++) {
      let commentaryTeam;
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === i
        // &&item.teamStatus === 1
      );
      const systemPlayer = global.tblPlayers
        .filter((item) => item.isSystemPlayer === true)
        .map((item) => item.playerId);
      let teamObj = {};
      for (team of commentaryTeam) {
        commentaryPlayers = global.tblCommentaryPlayers.filter(
          (item) =>
            item.commentaryId === commentaryId &&
            item.teamId === team.teamId &&
            item.currentInnings === i
        );
        teamObj = {
          ...team,
          players: commentaryPlayers,
        };
        teamAndPlayers.push(teamObj);
        for (const curr of global.tblCommentaryPlayers) {
          if (curr.commentaryId === commentaryId && curr.teamId === team.teamId && curr.currentInnings === i) {
            const playerAvg = await getPlayersBattingHistoryByIdQuery(
              { playerId: curr.playerId, matchTypeId: commentary.matchTypeId },
              fastify,
              request
            );

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

            if (!systemPlayer.includes(curr.playerId)) {
              playerStats.push(playerObj);
            }
          }
        }
      }
    }
    // team1Name tema2Name
    let t1 = global.tblCommentaryTeams.find(
      (item) => item.commentaryId === data.commentaryId && item.teamId === data.commentary.team1Id
    );
    let t2 = global.tblCommentaryTeams.find(
      (item) => item.commentaryId === data.commentaryId && item.teamId === data.commentary.team2Id
    );
    let eventMarket;
    // LDOMARKETSIDS = global.tblConfigs.find(config => config.key === "LDOMARKET")?.value ?? "0";
    let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tem."wrCommentaryId" = ${commentaryId} AND 
      tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel})
      AND tem."wrRateSource" = 1 `;
    console.log("whereCondition", whereCondition)
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
    global.marketData[data.commentaryId].existingMarket = eventMarket;

    // Create markets and runners
    let mar = await createMarketAndRunner(
      {
        templates: comTemplate,
        teams: teamAndPlayers,
        commentary: {
          ...commentary,
          team1Name: t1.teamName,
          team2Name: t2.teamName,
        },
        matchType: matchType,
        existingMarkets: eventMarket,
      },
      request,
      fastify
    );

    // Initialize the ball-to-action map
    initializeBallToActionMap(global.marketData[data.commentaryId].markets, data.commentaryId);

    return mar;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "Error ->> markerts/index.js -> generateMarketAndRunners",
      request
    )
    console.log(error.message)
    // throw error;
  }
}

module.exports = { marketGenRunner, generateMarketAndRunners, processPredictScoreMarket };