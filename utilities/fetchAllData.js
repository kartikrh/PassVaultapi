const { getAllActiveInactiveTabsQuery } = require("../repository/TableTabs");
const { getAllBlocksQuery } = require("../repository/TableBlock");
const { getAllMenuTypesQuery } = require("../repository/TableMenuTypes");
const { getAllMenuItemTypesQuery } = require("../repository/TableMenuItemType");
const { allPageQuery } = require("../repository/TablePage");
const { allPageFormateQuery } = require("../repository/TablePageFormate");
const { allPageAliases } = require("../repository/TablePageAlias");
const { allMenuItemsQuery } = require("../repository/TableMenuItem");
const { getAllRolesQuery } = require("../repository/TableRoles");
const { allEventTypesQuery } = require("../repository/TableEventType");
const { allTeamQuery } = require("../repository/TableTeams");
const { allPaneltyRunsQuery } = require("../repository/TablePaneltyRun");
const {
  getAllPlayersQuery,
  getAllPlayerTypeQuery,
  getAllBowlingTypeQuery,
} = require("../repository/TablePlayer");
const { getAllMatchTypeQuery } = require("../repository/TableMatchType");
const { getAllUsersQuery } = require("../repository/TableUser");
const { getAllCongigQuery } = require("../repository/TableConfig");
const { getAllCompititionQuery } = require("../repository/TableCompitition");
const { getAllEventsQuery } = require("../repository/TableEvent");
const {
  getAllCommentaryQuery,
  getAllCommentaryPlayerQuery,
  getAllCommentaryTeamsQuery,
  getAllCommentaryBallByBallQuery,
  getAllOversQuery,
  getAllDisplayStatusQuery,
  getAllCommentaryWicketQuery,
  getAllCommentaryPartnershipQuery,
} = require("../repository/TableCommentary");
const {getAllNewsQuery} = require("../repository/TableNews");
const {
  getAllSubScribesDomainQuery,
  getAllSubScribesSubDomainQuery,
} = require("../repository/TableSubScibesDomain");
const {
  getAllMatchTypePredictorQuery
} = require("../repository/TableMatchTypePredictor");
const { getAllMarketTemplateQuery } = require("../repository/TableMarketTemplate");
const { getAllEventMarketsQuery } = require("../repository/TableEventMarkets");

const fetchAllDataFromDb = async (fastify, reply) => {
  try {
    const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);
    const getAllRoles = await getAllRolesQuery(fastify);
    const getAllBlocks = await getAllBlocksQuery(fastify);
    const getAllMenuTypes = await getAllMenuTypesQuery(fastify);
    const getAllMenuItemTypes = await getAllMenuItemTypesQuery(fastify);
    const getAllPageFormats = await allPageFormateQuery(fastify);
    const getAllPages = await allPageQuery(fastify);
    const getAllPageAliases = await allPageAliases(fastify);
    const getAllMenuItems = await allMenuItemsQuery(fastify);
    const getAllEventTypes = await allEventTypesQuery(fastify);
    const getAllTeams = await allTeamQuery(fastify);
    const getAllPaneltyRuns = await allPaneltyRunsQuery(fastify);
    const getAllPlayers = await getAllPlayersQuery(fastify);
    const getAllMatchType = await getAllMatchTypeQuery(fastify);
    const getAllUsers = await getAllUsersQuery(fastify);
    const getAllPlayerTypes = await getAllPlayerTypeQuery(fastify);
    const getAllBowlingTypes = await getAllBowlingTypeQuery(fastify);
    const getAllConfigs = await getAllCongigQuery(fastify);
    const getAllCommentary = await getAllCommentaryQuery(fastify);
    const getAllCompetition = await getAllCompititionQuery(fastify);
    const getAllEvents = await getAllEventsQuery(fastify);
    const getAllCommentaryPlayer = await getAllCommentaryPlayerQuery(fastify);
    const getAllCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);
    const getAllCommentaryBallByBall = await getAllCommentaryBallByBallQuery(
      fastify
    );
    const getAllOvers = await getAllOversQuery(fastify);
    const getAllDisplayStatus = await getAllDisplayStatusQuery(fastify);
    const getAllCommentaryWicket = await getAllCommentaryWicketQuery(fastify);
    const getAllCommentaryPartnership = await getAllCommentaryPartnershipQuery(
      fastify
    );
    const getAllNews = await getAllNewsQuery(fastify);
    const getAllsubScribesDomain = await getAllSubScribesDomainQuery(fastify);
    const getAllsubScribesSubDomain = await getAllSubScribesSubDomainQuery(fastify);
    const getAllMatchTypePredictor = await getAllMatchTypePredictorQuery(fastify);
    const getAllEventMarkets = await getAllEventMarketsQuery(fastify);
    const getAllMarketTemplate = await getAllMarketTemplateQuery(fastify);

    global.tblTabs = getAllTabs;
    global.tblRoles = getAllRoles;
    global.tblBlocks = getAllBlocks;
    global.tblMenuTypes = getAllMenuTypes;
    global.tblMenuItemTypes = getAllMenuItemTypes;
    global.tblPageFormats = getAllPageFormats;
    global.tblPages = getAllPages;
    global.tblPageAliases = getAllPageAliases;
    global.tblMenuItems = getAllMenuItems;
    global.tblEventTypes = getAllEventTypes;
    global.tblTeams = getAllTeams;
    global.tblPaneltyRuns = getAllPaneltyRuns;
    global.tblPlayers = getAllPlayers;
    global.tblMatchTypes = getAllMatchType;
    global.tblUsers = getAllUsers;
    global.tblPlayerTypes = getAllPlayerTypes;
    global.tblBowlingTypes = getAllBowlingTypes;
    global.tblConfigs = getAllConfigs;
    global.tblCompetitions = getAllCompetition;
    global.tblEvents = getAllEvents;
    global.tblDisplayStatus = getAllDisplayStatus;
    global.tblCommentaries = getAllCommentary;
    global.tblCommentaryTeams = getAllCommentaryTeams;
    global.tblCommentaryPlayers = getAllCommentaryPlayer;
    global.tblCommentaryBallByBall = getAllCommentaryBallByBall;
    global.tblOvers = getAllOvers;
    global.tblCommentaryWicket = getAllCommentaryWicket;
    global.tblCommentaryPartnership = getAllCommentaryPartnership;
    global.tblNews = getAllNews;
    global.tblSubScribesDomain = getAllsubScribesDomain;
    global.tblSubScribesSubDomain = getAllsubScribesSubDomain;
    global.tblMatchTypePredictor = getAllMatchTypePredictor;
    global.tblMarketTemplate = getAllMarketTemplate;
    global.tblEventMarkets = getAllEventMarkets;

    console.log("Okkkk");

    if (reply) {
      reply.status(200).send({
        status: 200,
        message: "Data fetched successfully",
      });
    }
  } catch (error) {
    console.log("error in fetchAllDataFromDb", error.message);
    if (reply) {
      reply.status(200).send({
        status: 200,
        error: error.message,
      });
    }
  }
};

module.exports = fetchAllDataFromDb;
