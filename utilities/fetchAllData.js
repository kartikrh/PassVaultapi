const { ModuleTypes, EventName, GlobalModuleType, StoreTypes } = require("../utilities/index");
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
const { allTeamQuery, getAllTeamsByIdsQuery } = require("../repository/TableTeams");
const { allPaneltyRunsQuery } = require("../repository/TablePaneltyRun");
const {
  getAllPlayersQuery,
  getAllPlayerTypeQuery,
  getAllBowlingTypeQuery,
  getAllPlayersByIdsQuery,
} = require("../repository/TablePlayer");
const { getAllMatchTypeQuery } = require("../repository/TableMatchType");
const { getAllUsersQuery } = require("../repository/TableUser");
const { getAllCongigQuery } = require("../repository/TableConfig");
const { getAllDevicesQuery } = require("../repository/TableDevice");
const { getAllCompititionQuery, getAllCompetitionByIdsQuery } = require("../repository/TableCompitition");
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
  getCommentaryByIdQuery,
  getAllCommentaryTeamsDataQuery,
  getAllCommentaryPlayerDataQuery,
  getAllCommentaryWicketDataQuery,
  getAllOversDataQuery,
  getAllCommentaryPartnershipDataQuery,
  getAllCommentaryBallByBallDataQuery,
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
const { getAllEventMarketsQuery, getEventMarketQueryV1, getAllEventMarketsV2Query } = require("../repository/TableEventMarkets");
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
const { getAllNotificationQuery, insertNotificationViaNotiConfigQuery } = require("../repository/TableNotification");
const { getAllTemplateQuery } = require("../repository/TableTemplate");
const { getAllOtpQuery } = require("../repository/TableOtp");
const { getAllClientQuery } = require("../repository/TableClient");
const { allMailSettingsQuery } = require('../repository/TableMailSettings');
const { getAllMarketOddsBallByBall } = require("../repository/TableMarketOddsBallByBall");
const { allThirdPartyApisQuery } = require('../repository/TableThirdPartyApis');
const { allClientVideoQuery } = require("../repository/TableClientVideo");
// const { allCommentaryLogsQuery2 } = require("../repository/TableLogs");
const { getAllAwardQuery } = require("../repository/TableAward");
const { getAllCommentaryAwardQuery } = require("../repository/TableCommentaryAward");
const { allSocialMediaQuery } = require("../repository/TableSocialMedia");
const { getAllArticlesQuery } = require("../repository/TableArticles");
const { getAllTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers");
const { getAllGroupsQuery } = require("../repository/TableGroups");
// const { getMarketRunnerQueryV1 } = require("../repository/TableMarketRunner");
const { getAllBattingHistory, getAllBowlingHistory } = require("../repository/TablePlayerHistory");
const {
  getAllCommentaryBattingHistory,
  getAllCommentaryBowlingHistory
} = require("../repository/TableCommPlayerHistory"); 
const { getAllPhotoLibraryQuery, getAllLibraryImagesQuery } = require("../repository/TablePhotoLibrary");
const { getAllVideoLibraryQuery } = require("../repository/TableVideoLibrary");
const { getAllShotTypesQuery } = require("../repository/TableShotType");
const { getAllTipsQuery } = require("../repository/TableTips");
const { getAllMarketRunnersQuery } = require("../repository/TableMarketRunner");
const configConstants = require("./configConstants");
const { getAllMatchTypeBowlingPredictor } = require("../repository/TableMatchTypeBowlingPredictor");
const { getAllCountryCodesQuery } = require("../repository/TableCountryCodes");
const { getAllPackagesQuery } = require("../repository/TablePackages");
const { getAllWhitelabelsQuery } = require("../repository/TableWhitelabel");
const { getAllNotificationConfigsQuery, getNotificationConfigsByEventNameQuery } = require("../repository/TableNotificationConfig");
const { notiConfigContentReplaceService } = require("../services/commentry");
const { getAllHideEventsQuery } = require("../repository/TableHideEvents");
const { getAllVenuesQuery, getVenuesByIdsQuery } = require("../repository/TableVenue");
const { getAllCardTypeQuery } = require("../repository/TableCardType");
const { getAllWeathersQuery } = require("../repository/TableWeather")
const { getAllPitchConditionsQuery } = require("../repository/TablePitchCondition")
const { getAllPythonAPIsQuery } = require("../repository/TablePythonAPI");
const { getAllMatchTypeTemplatesQuery } = require("../repository/TableMatchTypeTemplates");
const { getAllOverTypesQuery } = require("../repository/TableOverType");
const { getAllICCRankingQuery } = require("../repository/tblICCRanking");

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
    const getAllMailSettings = await allMailSettingsQuery(fastify);
    const marketOddBallByBall = await getAllMarketOddsBallByBall(fastify);
    const thirdPartyApis = await allThirdPartyApisQuery(fastify);
    const clientVideos = await allClientVideoQuery(fastify);
    // const responseLogs = await allResponseLogsQuery(fastify);
    const getAllAward = await getAllAwardQuery(fastify);
    const getAllCommentaryAward = await getAllCommentaryAwardQuery(fastify);
    const getAllSocialMediaData = await allSocialMediaQuery(fastify);
    const getAllArticlesData = await getAllArticlesQuery(fastify);
    const getAllTournamentTeamPlayers = await getAllTournamentTeamPlayersQuery(fastify);
    const getAllGroups = await getAllGroupsQuery(fastify);
    // const responseLogs = await allCommentaryLogsQuery2(fastify);
    // const thirdPartyAPILogs = await allThirdPartyApiLogsQuery(fastify);
    // const predictorAPILogs = await allPredictorAPILogsQuery(fastify);
    // const commentaryLogs = await allCommentaryLogsQuery(fastify);
    // const errorLogs = await allErrorLogsQuery(fastify);
    // const getEventMarkesV1 = await getEventMarketQueryV1(fastify);
    // const getEventMarketRunnerV1 = await getMarketRunnerQueryV1(fastify);
    const getAllPlayerBattingHistory = await getAllBattingHistory(fastify);
    const getAllPlayerBowlingHistory = await getAllBowlingHistory(fastify);
    const getAllCommentaryPlayersBattingHistory = await getAllCommentaryBattingHistory(fastify);
    const getAllCommentaryPlayersBowlingHistroy = await getAllCommentaryBowlingHistory(fastify);
    const getAllPhotoLibrary = await getAllPhotoLibraryQuery(fastify);
    const getAllLibraryImages = await getAllLibraryImagesQuery(fastify);
    const getAllVideoLibrary = await getAllVideoLibraryQuery(fastify);
    const getAllShotTypes = await getAllShotTypesQuery(fastify);
    const getAllTips = await getAllTipsQuery(fastify);
    const getAllMatchTypeBowling = await getAllMatchTypeBowlingPredictor(fastify)
    const getAllCountryCodes = await getAllCountryCodesQuery(fastify);
    const getAllCardType = await getAllCardTypeQuery(fastify);
    const getAllPackages = await getAllPackagesQuery(fastify);
    const getAllWhitelabels = await getAllWhitelabelsQuery(fastify);
    const getAllNotificationConfigs = await getAllNotificationConfigsQuery(fastify);
    const allCommentaryIds = getAllCommentary.map((item) => item.commentaryId);
    let getAllEventMarketsV2 = [];
    let getEventMarketRunnerV2 = [];
    if (allCommentaryIds.length > 0) {
        getAllEventMarketsV2 = await getAllEventMarketsV2Query(fastify, allCommentaryIds.join(", "));
        if (getAllEventMarketsV2.length > 0) {
          const eventMarketIds = getAllEventMarketsV2.map((item) => item.eventMarketId);
          
          if (eventMarketIds.length > 0) {
              getEventMarketRunnerV2 = await getAllMarketRunnersQuery(fastify, eventMarketIds.join(", "));
          }
        }
    }
    // const getAllEventMarketsV2 = await getAllEventMarketsV2Query(fastify, 
    //   getAllCommentary.map((item) => item.commentaryId).join(", ")
    // );
    // const getEventMarketRunnerV2 = await getAllMarketRunnersQuery(fastify, 
    //   getAllEventMarketsV2.map((item) => item.eventMarketId).join(", ")
    // );

    const getHideEvents = await getAllHideEventsQuery(fastify);
    const getAllVenues = await getAllVenuesQuery(fastify);
    const getAllWeatherData = await getAllWeathersQuery(fastify);
    const getAllPitchConditions = await getAllPitchConditionsQuery(fastify);
    const getAllPythonAPIs = await getAllPythonAPIsQuery(fastify);
    const getAllMatchTypeTemplates = await getAllMatchTypeTemplatesQuery(fastify);
    const getAllOverTypes = await getAllOverTypesQuery(fastify);
    const getAllICCRanking = await getAllICCRankingQuery(fastify);

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
    global.tblMailSettings = getAllMailSettings;
    global.tblMarketOddsBallByBall = marketOddBallByBall;
    global.tblThirdPartyApis = thirdPartyApis;
    global.tblClientVideos = clientVideos;
    global.tblAwards = getAllAward;
    global.tblCommentaryAwards = getAllCommentaryAward;
    global.tblSocialMedia = getAllSocialMediaData;
    global.tblArticles = getAllArticlesData;
    global.tblTournamentTeamPlayers = getAllTournamentTeamPlayers;
    global.tblEventMarketsV1 = [];
    global.tblGroups = getAllGroups;
    global.tblPlayersBattingHistory = getAllPlayerBattingHistory;
    global.tblPlayersBowlingHistory = getAllPlayerBowlingHistory;
    global.tblCommPlayerBatHist = getAllCommentaryPlayersBattingHistory;
    global.tblCommPlayerBowlHist = getAllCommentaryPlayersBowlingHistroy;
    global.tblPhotoLibrary = getAllPhotoLibrary;
    global.tblLibraryImages = getAllLibraryImages;
    global.tblVideoLibrary = getAllVideoLibrary;
    global.tblShotType = getAllShotTypes;
    global.tblTips = getAllTips;
    global.tblEventMarketsV2 = getAllEventMarketsV2;
    global.tblMarketRunnerV2 = getEventMarketRunnerV2;
    global.tblMatchTypeBowlingTypePredictor = getAllMatchTypeBowling;
    global.tblCountryCodes = getAllCountryCodes;
    global.tblCardType = getAllCardType;
    global.tblPackages = getAllPackages;
    global.tblWhitelabels = getAllWhitelabels;
    global.tblNotificationConfig = getAllNotificationConfigs;
    global.tblHideEvents = getHideEvents;
    global.tblVenues = getAllVenues;
    global.tblWeather = getAllWeatherData;
    global.tblPitchConditions = getAllPitchConditions;
    global.tblPythonAPI = getAllPythonAPIs;
    global.tblMatchTypeTemplates = getAllMatchTypeTemplates;
    global.tblOverTypes = getAllOverTypes;
    global.tblICCRanking = getAllICCRanking;
    // global.responseLogs = responseLogs;
    // global.thirdPartyAPILogs = thirdPartyAPILogs;
    // global.predictorAPILogs = predictorAPILogs;
    // global.commentaryLogs = commentaryLogs;
    // global.errorLogs = errorLogs

    console.log("Okkkk - Data Synchronized successfully");

    if (reply) {
      reply.status(200).send({
        status: 200,
        message: "Data fetched successfully",
      });
    }
  } catch (error) {
    console.log("error in fetchAllDataFromDb", error.message,error);
    if (reply) {
      reply.status(200).send({
        status: 200,
        error: error.message,
      });
    }
  }
};

const FetchingCommentariesDataFromCron = async (fastify) => {
  try {
    let last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const commentaryIds  = global.tblCommentaries.filter((item) => 
    (item.commentaryCloseTime >= last7Days && item.commentaryStatus === 4) ||
    item.commentaryStatus !== 4).map((elem) => { return elem.commentaryId });

  
    global.tblCommentaries = global.tblCommentaries.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblCommentaryTeams = global.tblCommentaryTeams.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblOvers = global.tblOvers.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblCommentaryWicket = global.tblCommentaryWicket.filter((item) => commentaryIds.includes(item.commentaryId));
    global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter((item) => commentaryIds.includes(item.commentaryId));

    global.tblEventMarketsV2 = global.tblEventMarketsV2.filter((item) => commentaryIds.includes(item.commentaryId));
    const marketIds = new Set(global.tblEventMarketsV2.map((elem) => elem.eventMarketId));
    global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter((item) => marketIds.has(item.eventMarketId));

    console.log("Commentary data updated in via node-cron successfully");

  } catch (error) {
    console.log("error in FetchingCommentariesDataFromCron", error.message,error);
  }
}

global.processedUpcomingCommentaries = global.processedUpcomingCommentaries || new Set();

const upcomingCommentaries = async (fastify) => {
  try {
    const now = new Date();
    now.setSeconds(0, 0);
    let allEvents = await getAllCommentaryQuery(fastify);

    const upcomingEvents = allEvents.filter((item) => {
      if (item.commentaryStatus !== 1 || item.isActive === false) return false;

      const eventDate = new Date(item.eventDate);
      eventDate.setSeconds(0, 0);
      const oneHourBeforeEvent = new Date(eventDate.getTime() - 60 * 60 * 1000);

      return (
        oneHourBeforeEvent.getTime() === now.getTime() &&
        !global.processedUpcomingCommentaries.has(item.commentaryId)
      );
    });

    for (let item of upcomingEvents) {
      await notiConfigContentReplaceService(EventName.COMMINGSOON, item.commentaryId, null, fastify);
      global.processedUpcomingCommentaries.add(item.commentaryId);
        // let data = await getNotificationConfigsByEventNameQuery(EventName.COMMINGSOON, fastify);
        // if (!data && item.isActive === false && item.eventName === null) continue;

        // data.content = data.content.replace("{}", item.eventName);

        // if (Array.isArray(global.clientSocketIo) && global.clientSocketIo.length > 0) {
        //   global.clientSocketIo.forEach((socket) => {
        //     socket.client.emit("notificationSend", data);
        //   });

        //   const notificationData = {
        //     title: item.eventName,
        //     description: data.content,
        //     commentaryId: item.commentaryId,
        //   };

        //   await insertNotificationViaNotiConfigQuery(notificationData, null, fastify);
        //   global.processedUpcomingCommentaries.add(item.commentaryId);
        // }
      }
  } catch (error) {
    console.error("Error in upcomingCommentaries:", error.message, error);
  }
};

const panelLoadDataByEnum = async (request, fastify, reply) => {
  try {
    const {password} = request.body;
    let pass = global.tblConfigs.find((item) => item.key === configConstants.LOADDATAPASSWORD);
    if (!pass) {
      throw new Error("Password not found");
    }
    if (pass.value !== password) {
      throw new Error("Invalid password");
    }
    let {module, commentaryId} = request.body;
    for (const mod of module) {
      switch (mod) {
        case ModuleTypes.Commentary: {
          const getAllCommentary = await getAllCommentaryQuery(fastify);
          const getAllCommentaryPlayer = await getAllCommentaryPlayerQuery(fastify);
          const getAllCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);
          const getAllCommentaryBallByBall = await getAllCommentaryBallByBallQuery(fastify);
          const getAllOvers = await getAllOversQuery(fastify);
          const getAllCommentaryWicket = await getAllCommentaryWicketQuery(fastify);
          const getAllCommentaryPartnership = await getAllCommentaryPartnershipQuery(fastify);
        
          global.tblCommentaries = getAllCommentary;
          global.tblCommentaryTeams = getAllCommentaryTeams;
          global.tblCommentaryPlayers = getAllCommentaryPlayer;
          global.tblCommentaryBallByBall = getAllCommentaryBallByBall;
          global.tblOvers = getAllOvers;
          global.tblCommentaryWicket = getAllCommentaryWicket;
          global.tblCommentaryPartnership = getAllCommentaryPartnership;
          break;
        }
        case ModuleTypes.Players: {
          const getAllPlayers = await getAllPlayersQuery(fastify);
          global.tblPlayers = getAllPlayers;
          break;
        }
        case ModuleTypes.Teams: {
          const getAllTeams = await allTeamQuery(fastify);
          global.tblTeams = getAllTeams;
          break;
        }
        case ModuleTypes.PenaltyRuns: {
          const getAllPaneltyRuns = await allPaneltyRunsQuery(fastify);
          global.tblPaneltyRuns = getAllPaneltyRuns;
          break;
        }
        case ModuleTypes.MatchTypes: {
          const getAllMatchType = await getAllMatchTypeQuery(fastify);
          global.tblMatchTypes = getAllMatchType;
          break;
        }
        case ModuleTypes.MarketTemplate: {
          const getAllMarketTemplate = await getAllMarketTemplateQuery(fastify);
          global.tblMarketTemplate = getAllMarketTemplate;
          break;
        }
        case ModuleTypes.DisplayStatus: {
          const getAllDisplayStatus = await allDisplayStatusesQuery(fastify);
          global.tblDisplayStatus = getAllDisplayStatus;
          break;
        }
        case ModuleTypes.News: {
          const getAllNews = await getAllNewsQuery(fastify);
          global.tblNews = getAllNews;
          break;
        }
        case ModuleTypes.Banners: {
          const getAllBanners = await getAllBannerQuery(fastify);
          global.tblBanner = getAllBanners;
          break;
        }
        case ModuleTypes.Awards: {
          const getAllAward = await getAllAwardQuery(fastify);
          global.tblAwards = getAllAward;
          break;
        }
        case ModuleTypes.MarketTypes: {
          const getAllMarketType = await getAllMarketTypeQuery(fastify);
          const getAllMarketTypeCategories = await getAllMarketTypeCategoriesQuery(fastify);
          global.tblMarketTypes = getAllMarketType;
          global.tblMarketTypeCategories = getAllMarketTypeCategories;
          break;
        }
        case ModuleTypes.PhotoLibrary: {
          const getAllPhotoLibrary = await getAllPhotoLibraryQuery(fastify);
          const getAllLibraryImages = await getAllLibraryImagesQuery(fastify);

          global.tblPhotoLibrary = getAllPhotoLibrary;
          global.tblLibraryImages = getAllLibraryImages;
          break;
        }
        case ModuleTypes.VideoLibrary: {
          const getAllVideoLibrary = await getAllVideoLibraryQuery(fastify);
          global.tblVideoLibrary = getAllVideoLibrary;
          break;
        }
        case ModuleTypes.ShotTypes: {
          const getAllShotTypes = await getAllShotTypesQuery(fastify);
          global.tblShotType = getAllShotTypes;
          break;
        }
        case ModuleTypes.EventTypes: {
          const getAllEventTypes = await allEventTypesQuery(fastify);
          global.tblEventTypes = getAllEventTypes;
          break;
        }
        case ModuleTypes.Competition: {
          const getAllCompetition = await getAllCompititionQuery(fastify);
          global.tblCompetitions = getAllCompetition;
          break;
        }
        case ModuleTypes.Events: {
          const getAllEvents = await getAllEventsQuery(fastify);
          global.tblEvents = getAllEvents;
          break;
        }
        case ModuleTypes.Template: {
          const getAllTemplate = await getAllTemplateQuery(fastify);
          global.tblTemplate = getAllTemplate;
          break;
        }
        case ModuleTypes.SendMailConfig: {
          const getAllMailSettings = await allMailSettingsQuery(fastify);
          global.tblMailSettings = getAllMailSettings;
          break;
        }
        case ModuleTypes.Clients: {
          const getAllClient = await getAllClientQuery(fastify);
          global.tblClient = getAllClient;
          break;
        }
        case ModuleTypes.PageFormat: {
          const getAllPageFormats = await allPageFormateQuery(fastify);
          global.tblPageFormats = getAllPageFormats;
          break;
        }
        case ModuleTypes.MenuList: {
          const getAllMenuTypes = await getAllMenuTypesQuery(fastify);
          const getAllMenuItems = await allMenuItemsQuery(fastify);

          global.tblMenuTypes = getAllMenuTypes;
          global.tblMenuItems = getAllMenuItems;
          break;
        }
        case ModuleTypes.Blocks: {
          const getAllBlocks = await getAllBlocksQuery(fastify);
          global.tblBlocks = getAllBlocks;
          break;
        }
        case ModuleTypes.Pages: {
          const getAllPages = await allPageQuery(fastify);
          global.tblPages = getAllPages;
          break;
        }
        case ModuleTypes.Tabs: {
          const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);
          global.tblTabs = getAllTabs;
          break;
        }
        case ModuleTypes.SocialMedia: {
          const getAllSocialMediaData = await allSocialMediaQuery(fastify);
          global.tblSocialMedia = getAllSocialMediaData;
          break;
        }
        case ModuleTypes.Subscribers: {
          const getAllsubScribesDomain = await getAllSubScribesDomainQuery(fastify);
          const getAllsubScribesSubDomain = await getAllSubScribesSubDomainQuery(fastify);

          global.tblSubScribesDomain = getAllsubScribesDomain;
          global.tblSubScribesSubDomain = getAllsubScribesSubDomain;
          break;
        }
        case ModuleTypes.Config: {
          const getAllConfigs = await getAllCongigQuery(fastify);
          global.tblConfigs = getAllConfigs;
          break;
        }
        case ModuleTypes.Roles: {
          const getAllRoles = await getAllRolesQuery(fastify);
          global.tblRoles = getAllRoles;
          break;
        }
        case ModuleTypes.Users: {
          const getAllUsers = await getAllUsersQuery(fastify);
          global.tblUsers = getAllUsers;
          break;
        }
        case ModuleTypes.ClientScokets: {
          const getAllClientSocket = await getAllClientSocketQuery(fastify);
          global.tblClientSocket = getAllClientSocket;
          break;
        }
        case ModuleTypes.API: {
          const getAllAPIs = await getAllAPI(fastify);
          global.tblAPIs = getAllAPIs;
          break;
        }
        case ModuleTypes.APIEndpoints: {
          const getAllAPIEndpoints = await getAllAPIEndPoint(fastify);
          global.tblAPIEndpoints = getAllAPIEndpoints;
          break;
        }
        case ModuleTypes.ThirdPartyApis: {
          const thirdPartyApis = await allThirdPartyApisQuery(fastify);
          global.tblThirdPartyApis = thirdPartyApis;
          break;
        }
        case ModuleTypes.Notifications: {
          const getAllNotifications = await getAllNotificationQuery(fastify);
          global.tblNotifications = getAllNotifications;
          break;
        }
        case ModuleTypes.Vendors: {
          const getAllVendors = await getAllVendorsQuery(fastify);
          const getAllVendorIps = await getAllVendorIpsQuery(fastify);
          global.tblVendors = getAllVendors;
          global.tblVendorIp = getAllVendorIps;
          break;
        }
        case ModuleTypes.CountryCode: {
          const cc =  await getAllCountryCodesQuery(fastify);
          global.tblCountryCodes = cc;
          break;
        }
        case ModuleTypes.CardTpe: {
          const cardType =  await getAllCardTypeQuery(fastify);
          global.tblCardTpe = cardType;
          break;
        }
        case ModuleTypes.NotificationConfig: {
          const notiConfig =  await getAllNotificationConfigsQuery(fastify);
          global.tblNotificationConfig = notiConfig;
          break;
        }
        case ModuleTypes.Packages: {
          const packages =  await getAllPackagesQuery(fastify);
          global.tblPackages = packages;
          break;
        }
        case ModuleTypes.Whitelabel: {
          const whitelabel =  await getAllWhitelabelsQuery(fastify);
          global.tblWhitelabels = whitelabel;
          break;
        }
        case ModuleTypes.Venue: {
          const venues =  await getAllVenuesQuery(fastify);
          global.tblVenues = venues;
          break;
        }
        case ModuleTypes.CommentaryById: {
          if(commentaryId) {
            let whereCondition = `"wrCommentaryId" = ${commentaryId} AND "wrIsDelete" = FALSE`
            let teamCondition = `tct."wrCommentaryId" = ${commentaryId} AND tct."wrIsDelete" = FALSE`
            let playerCondition = `tcp."wrCommentaryId" = ${commentaryId} AND tcp."wrIsDelete" = FALSE`
            let whereCond = `"wrCommentaryId" = ${commentaryId} AND "wrIsDeletedStatus" = FALSE`

            const getCommentary = await getCommentaryByIdQuery(request, fastify);
            const getCommentaryTeams = await getAllCommentaryTeamsDataQuery(teamCondition, fastify);
            const getCommentaryPlayers = await getAllCommentaryPlayerDataQuery(playerCondition, fastify);
            const getCommentaryBallByBalls = await getAllCommentaryBallByBallDataQuery(whereCond, fastify);
            const getOvers = await getAllOversDataQuery(whereCondition, fastify);
            const getCommentaryWickets = await getAllCommentaryWicketDataQuery(whereCond, fastify);
            const getCommentaryPartnerships = await getAllCommentaryPartnershipDataQuery(whereCondition, fastify);

            const commentaryIndex = global.tblCommentaries.findIndex(item => item.commentaryId == commentaryId);
            if (commentaryIndex !== -1) {
              global.tblCommentaries[commentaryIndex] = getCommentary;
            }
            const filterByCommentaryId = item => item.commentaryId !== commentaryId;
            global.tblCommentaryTeams = [
              ...global.tblCommentaryTeams.filter(filterByCommentaryId),
              ...getCommentaryTeams
            ];

            global.tblCommentaryPlayers = [
              ...global.tblCommentaryPlayers.filter(filterByCommentaryId),
              ...getCommentaryPlayers
            ];

            global.tblCommentaryBallByBall = [
              ...global.tblCommentaryBallByBall.filter(filterByCommentaryId),
              ...getCommentaryBallByBalls
            ];

            global.tblOvers = [
              ...global.tblOvers.filter(filterByCommentaryId),
              ...getOvers
            ];

            global.tblCommentaryWicket = [
              ...global.tblCommentaryWicket.filter(filterByCommentaryId),
              ...getCommentaryWickets
            ];

            global.tblCommentaryPartnership = [
              ...global.tblCommentaryPartnership.filter(filterByCommentaryId),
              ...getCommentaryPartnerships
            ];
          }
          break;
        }
        case ModuleTypes.PythonAPI: {
          const pythonData =  await getAllPythonAPIsQuery(fastify);
          global.tblPythonAPI = pythonData;
          break;
        }
        default:
          break;
      }
    }

    if (reply) {
      reply.status(200).send({
        status: 200,
        message: "PanelData loaded on Memory successfully",
      });
    }
  } catch (error) {
    console.log("error in panelLoadDataByEnum", error.message,error);
    if (reply) {
      reply.status(200).send({
        status: 200,
        error: error.message,
      });
    }
  }
}


const loadEnityDataOnGlobal = async (request, fastify, reply) => {
  const { data, storeType, moduleType: mod, commentaryId } = request.body;
  try {
    switch (storeType) {
      case StoreTypes.Insert: {
        switch (mod) {
          case GlobalModuleType.Competition:
            global.tblCompetitions.push(data);
            break;

          case GlobalModuleType.Commentary:
            global.tblCommentaries.push(data);
            break;

          case GlobalModuleType.Players:
            global.tblPlayers.push(data);
            break;

          case GlobalModuleType.Teams:
            global.tblTeams.push(data);
            break;

          case GlobalModuleType.TeamCompetiton:
            global.tblTeamCompetition.push(data);
            break;

          case GlobalModuleType.MatchTypes:
            global.tblMatchTypes.push(data);
            break;

          case GlobalModuleType.CountryCode:
            global.tblCountryCodes.push(data);
            break;

          case GlobalModuleType.Venue:
            global.tblVenues.push(data);
            break;

          case GlobalModuleType.Weather:
            global.tblWeather.push(data);
            break;

          case GlobalModuleType.PitchConditon:
            global.tblPitchConditions.push(data);
            break;

          case GlobalModuleType.TournamentTeamPlayers:
            global.tblTournamentTeamPlayers.push(data);
            break;

          default:
        }
        break;
      }

      case StoreTypes.Update: {
        switch (mod) {
          case GlobalModuleType.Venue: {
            const whereCondition = `tv."wrIsDeleted" = FALSE AND tv."wrId" = ${data}`;
            const venueData = await getVenuesByIdsQuery(whereCondition, fastify);
            const index = global.tblVenues.findIndex(item => item.id === data);
            if (index !== -1) global.tblVenues[index] = venueData;
            break;
          }

          case GlobalModuleType.Teams: {
            const whereCondi = `tt."wrIsDeleted" = false AND tt."wrTeamId" = ${data}`;
            const teamData = await getAllTeamsByIdsQuery(whereCondi, fastify);
            const index = global.tblTeams.findIndex(item => item.teamId === data);
            if (index !== -1) global.tblTeams[index] = teamData;
            break;
          }

          case GlobalModuleType.Players: {
            const condition = `tp."wrIsDeleted" = false AND tp."wrPlayerId" = ${data}`;
            const playerData = await getAllPlayersByIdsQuery(condition, fastify);
            const index = global.tblPlayers.findIndex(item => item.playerId === data);
            if (index !== -1) global.tblPlayers[index] = playerData;
            break;
          }

          case GlobalModuleType.Competition: {
            const cond = `tc."wrIsDeleted" = false AND tev."wrIsDeleted" = false AND tc."wrCompetitionId" = ${data}`;
            const compData = await getAllCompetitionByIdsQuery(cond, fastify);
            const index = global.tblCompetitions.findIndex(item => item.competitionId === data);
            if (index !== -1) global.tblCompetitions[index] = compData;
            break;
          }
          default:
        }
        break;
      }

      default:
    }

    if (commentaryId) {
      const teamCondition = `tct."wrCommentaryId" = ${commentaryId} AND tct."wrIsDelete" = FALSE`;
      const playerCondition = `tcp."wrCommentaryId" = ${commentaryId} AND tcp."wrIsDelete" = FALSE`;

      const getCommentaryTeams = await getAllCommentaryTeamsDataQuery(teamCondition, fastify);
      const getCommentaryPlayers = await getAllCommentaryPlayerDataQuery(playerCondition, fastify);

      global.tblCommentaryTeams = getCommentaryTeams;
      global.tblCommentaryPlayers = getCommentaryPlayers;
    }

    // console.log("Data updated in global memory.");
  } catch (error) {
    console.error("Error in loadEnityDataOnGlobal:", error.message, error);
    if (reply) {
      reply.status(500).send({
        status: 500,
        error: error.message,
      });
    }
  }
};


module.exports = { fetchAllDataFromDb, FetchingCommentariesDataFromCron, panelLoadDataByEnum, upcomingCommentaries, loadEnityDataOnGlobal };
