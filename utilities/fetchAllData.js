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
const { getAllDevicesQuery } = require("../repository/TableDevice");
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
const { getAllNewsQuery } = require("../repository/TableNews");
const {
  getAllSubScribesDomainQuery,
  getAllSubScribesSubDomainQuery,
} = require("../repository/TableSubScibesDomain");
const {
  getAllMatchTypePredictorQuery,
} = require("../repository/TableMatchTypePredictor");
const {
  getAllMarketTemplateQuery,
  getAllMarketTypeCategoriesQuery,
  getAllMarketTypeQuery,
} = require("../repository/TableMarketTemplate");
const { getAllEventMarketsQuery } = require("../repository/TableEventMarkets");
const {
  getAllMarketTemplateRunnerQuery,
} = require("../repository/TableMarketTemplateRunner");
const { getAllVendorsQuery } = require("../repository/TableVendor");
const { getAllVendorIpsQuery } = require("../repository/TableVendorIp");

const { allDisplayStatusesQuery } = require("../repository/TableDisplayStatus");
const { getAllClientSocketQuery } = require("../repository/TableClientSocket");
const { getAllBannerQuery } = require("../repository/TableBanner");
const { getAllActivityLogQuery } = require("../repository/TableActivityLog");
const { getAllAPI } = require("../repository/TableAPI");
const { getAllAPIEndPoint } = require("../repository/TableAPIEndPoint");
const { getAllTeamCompetitionQuery } = require("../repository/TableTeamCompetition");
const { getAllNotificationQuery } = require("../repository/TableNotification");
const { getAllTemplateQuery } = require("../repository/TableTemplate");
const { getAllOtpQuery } = require("../repository/TableOtp");
const { getAllClientQuery } = require("../repository/TableClient");
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
    const getAllDevices = await getAllDevicesQuery(fastify);
    const getAllCommentary = await getAllCommentaryQuery(fastify);
    const getAllCompetition = await getAllCompititionQuery(fastify);
    const getAllEvents = await getAllEventsQuery(fastify);
    const getAllCommentaryPlayer = await getAllCommentaryPlayerQuery(fastify);
    const getAllCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);
    const getAllCommentaryBallByBall = await getAllCommentaryBallByBallQuery(
      fastify
    );
    const getAllOvers = await getAllOversQuery(fastify);
    const getAllDisplayStatus = await allDisplayStatusesQuery(fastify);
    const getAllCommentaryWicket = await getAllCommentaryWicketQuery(fastify);
    const getAllCommentaryPartnership = await getAllCommentaryPartnershipQuery(
      fastify
    );
    const getAllNews = await getAllNewsQuery(fastify);
    const getAllBanners = await getAllBannerQuery(fastify);
    const getAllActivityLog = await getAllActivityLogQuery(fastify);
    const getAllsubScribesDomain = await getAllSubScribesDomainQuery(fastify);
    const getAllsubScribesSubDomain = await getAllSubScribesSubDomainQuery(
      fastify
    );
    const getAllMatchTypePredictor = await getAllMatchTypePredictorQuery(
      fastify
    );
    const getAllEventMarkets = await getAllEventMarketsQuery(fastify);
    const getAllMarketTemplate = await getAllMarketTemplateQuery(fastify);
    const getAllMarketTypeCategories = await getAllMarketTypeCategoriesQuery(
      fastify
    );
    const getAllMarketType = await getAllMarketTypeQuery(fastify);
    const getAllMarketTemplateRunner = await getAllMarketTemplateRunnerQuery(
      fastify
    );
    const getAllVendors = await getAllVendorsQuery(fastify);
    const getAllVendorIps = await getAllVendorIpsQuery(fastify);
    const getAllClientSocket = await getAllClientSocketQuery(fastify);
    const getAllAPIs = await getAllAPI(fastify);
    const getAllAPIEndpoints = await getAllAPIEndPoint(fastify);
    const getAllTeamCompetition = await getAllTeamCompetitionQuery(fastify);
    const getAllNotification = await getAllNotificationQuery(fastify);
    const getAllTemplate = await getAllTemplateQuery(fastify);
    const getAllOtp = await getAllOtpQuery(fastify);
    const getAllClient = await getAllClientQuery(fastify);
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
    global.tblDevices = getAllDevices;
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
    global.tblMarketTypeCategories = getAllMarketTypeCategories;
    global.tblMarketTypes = getAllMarketType;
    global.tblMarketTemplateRunners = getAllMarketTemplateRunner;
    global.tblVendors = getAllVendors;
    global.tblVendorIp = getAllVendorIps;
    global.tblClientSocket = getAllClientSocket;
    global.tblActivityLogs = getAllActivityLog;
    global.tblBanner = getAllBanners;
    global.tblAPIs = getAllAPIs;
    global.tblAPIEndpoints = getAllAPIEndpoints;
    global.tblTeamCompetition = getAllTeamCompetition;
    global.tblNotifications = getAllNotification;
    global.tblTemplate = getAllTemplate;
    global.tblOtp = getAllOtp;
    global.tblClient = getAllClient;

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
