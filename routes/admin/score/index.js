const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllPage } = require("../../../controller/users/admin/Page/page");
const { getAllPageFormats } = require("../../../controller/users/admin/Page/pageFormate");
const { getAllBlocks } = require("../../../controller/users/admin/blocks");
const {
  getCommentaryDetailsByEventId,
  getCommentaryDetailsBycommentaryId,
  getCurrentUpdatedCommentaryID,
  getCommentaryDetailsBycommentaryEventId,
  getScheduleMatchList,
  getLiveMatchList,
  getCompleteMatchList,
  getAllDetailsByEventId,
  getCommenrtySquadList,
  getPartnershipList,
  getNodeEventbyEid,
  getOpenCommentaries,
  getActiveCommenrty,
  getShortCommerty,
  getAllCommentariesData,
  insertCommentaryConsoleFe,
  getAllCompletedCommentary,
  getAllCommentariesDataV1,
  getAllCommentariesDataV2,
  getHeadToHeadCommentary,
  getCommentaryStatistics,
  getAllCommentaryByCompetitionIdForClient,
  getCommentaryScoreStats,
} = require("../../../controller/users/admin/commentary/commentary");
const { getAllEventMarketsAndRunners } = require('../../../controller/users/admin/eventMarket');
const { getAllMenuItems } = require("../../../controller/users/admin/menuItem");
const { getMenuItemList, getAllMenuTypes } = require("../../../controller/users/admin/menuType");
const { getAllNews, getNewsById } = require("../../../controller/users/admin/news");
const { 
  getMarketsByCommentaryId,
  getNotificationByClient,
  markReadNotification,
  getMarketByGraphByRefId,
  getMarketsByCommentaryIdV1,
  saveDeviceData,
  allCommentaryAwards,
  checkPanelLoadData,
} = require("../../../controller/users/admin/score");
const {
  saveSubScribeDomain,
  getAllSubScribesDomain,
  getAllSubDomainData,
  insertSubDomains,
  insertDomains,
} = require("../../../controller/users/admin/subScribesDomain");
const { allCongifService } = require("../../../services/config");
const { getAllBanners } = require("../../../controller/users/admin/banner");
const { getMarketTypeAndCategoryByMarketType } = require("../../../controller/users/admin/marketTemplate");
const { getAllCompetitions, getAllSeasonOfCompetitions } = require("../../../controller/users/admin/competition");
const { getAllVideoLibrary } = require("../../../controller/users/admin/videoLibrary/index");
const { getAllPhotoLibrary, allLibraryImages } = require("../../../controller/users/admin/photoLibrary/index");
const { getAllTipsClientAPI } = require("../../../controller/users/admin/tips/index");
const { getAllCountryCode } = require("../../../controller/users/admin/countryCode");
const {
  getAllFavCompetitions,
  saveFavCompetition,
  deleteFavCompetition,
  updateDisplayOrder,
} = require('../../../controller/users/admin/favCompetitions');
const {
  allFavCommentary,
  saveFavCommentary,
  deleteFavCommentary,
} = require("../../../controller/users/admin/clientFavCommentary");
const { getAllCardType } = require("../../../controller/users/admin/cardType/index")
const { getTournamentTeamPoints } = require("../../../controller/users/admin/tournamentTeamPoints/index");

const {
  Score,
  SubScribesDomain,
  Commentary,
  Config,
  Client,
  FavCompetitions,
  FavCommentary,
} = require("../../../swaggerSchema/groupTags/schema");
const { getAllSocialMedia } = require("../../../controller/users/admin/socialMedia");
const { clientApiWhitelabels, getHideEvent } = require("../../../controller/users/admin/whitelabel");
const { deleteClient, deleteClientByEncrypt } = require("../../../controller/users/admin/client");
const { AllICCRankings } = require("../../../controller/users/admin/iccRanking/index");
const { getPlayerById } = require("../../../controller/users/admin/teamsAndPlayer/players");
const { getCompetitionStatisticsByCompetitionId } = require("../../../controller/users/admin/competitionStatistics");
const { getPlayerHistoryByPlayerIdForClient } = require("../../../controller/users/admin/playerHistory");
const { getCommentaryPlayerHistoryByPlayerIdForClient } = require("../../../controller/users/admin/commPlayerHistory");
const { getTournamentTeamPlayersByCompetitionIdForClient } = require("../../../controller/users/admin/tournamentTeamPlayers");
const { getAllAdvertise } = require("../../../controller/users/admin/advertise");
const {
  registerLiveActivityToken,
  unRegisterLiveActivityToken,
  getAllLiveActivityTokensByCommentary,
  deleteExpiredLiveActivityToken,
  deleteLiveActivityTokenById,
} = require("../../../controller/users/admin/lilveActivityToken")

module.exports = async (fastify, opts) => {
  fastify.post("/getscore", {
    schema: Score.getAllUpdatedIds.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCommentaryDetailsByEventId(request, reply, fastify),
  });
  fastify.post("/getscoreByCId", {
    schema: Score.getscoreByCId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsBycommentaryId(request, reply, fastify),
  });

  fastify.post("/getscoreByEId", {
    schema: Score.getscoreByEId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsBycommentaryEventId(request, reply, fastify),
  });

  fastify.post("/getCIds", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCurrentUpdatedCommentaryID(request, reply, fastify),
  });
  fastify.post("/scheduleMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getScheduleMatchList(request, reply, fastify),
  });
  fastify.post("/liveMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getLiveMatchList(request, reply, fastify),
  });
  fastify.post("/completeMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ]
    handler: (request, reply) => getCompleteMatchList(request, reply, fastify),
  });
  fastify.post("/completeMatches", {
    schema: Score.getCIds.schema,
    handler: (request, reply) => getAllCompletedCommentary(request, reply, fastify),
  });
  fastify.post("/getmenuItemList", {
    schema: Score.getmenuitemlist.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Match Types",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getMenuItemList(request, reply, fastify),
  });
  fastify.post("/getPagesList", {
    schema: Score.getmenuitemlist.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Match Types",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getAllPage(request, reply, fastify),
  });
  fastify.post("/fullScorecard", {
    schema: Score.getscoreByEId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getAllDetailsByEventId(request, reply, fastify),
  });
  fastify.post("/squadList", {
    schema: Score.getsquadList.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getCommenrtySquadList(request, reply, fastify),
  });

  fastify.post("/partnershipList", {
    schema: Score.getPartnershipList.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getPartnershipList(request, reply, fastify),
  });

  fastify.get("/getScoreEventInfo", {
    schema: Score.getEventDetails.schema,
    handler: (request, reply) => getNodeEventbyEid(request, reply, fastify),
  });

  fastify.post("/getScoreEventsList", {
    handler: (request, reply) => getActiveCommenrty(request, reply, fastify),
  });

  fastify.post("/saveDomain", {
    schema: SubScribesDomain.save.schema,
    // preHandler: [
    //     (request, reply) => authorize(request, reply, fastify),
    //     (request, reply, done) =>
    //         checkPermission(request, reply, fastify, {
    //             tabName: "SubScribesDomain",
    //             mode: "view",
    //         }),
    // ],
    handler: (request, reply) => saveSubScribeDomain(request, reply, fastify),
  });

  fastify.post("/getConfigs",{
    schema: Config.getAll.schema,
    handler: (request, reply) => allCongifService(request, reply, fastify),
  })

  fastify.post("/getCommentary", {
    schema: Commentary.getAll.schema,
    handler: (request, reply) => getOpenCommentaries(request, reply, fastify),
  });
  fastify.post("/getShortscoreByEId", {
    schema: Score.getscoreByEId.schema,
    handler: (request, reply) => getShortCommerty(request, reply, fastify),
  });
  fastify.post("/getLiveCommentaries", {
    schema: Commentary.getLiveCommentaries.schema,
    handler: (request, reply) => getAllCommentariesData(request, reply, fastify),
  })
  fastify.post("/getLiveCommentariesV1", {
    schema: Commentary.getLiveCommentaries.schema,
    handler: (request, reply) => getAllCommentariesDataV1(request, reply, fastify),
  })
  fastify.post("/getLiveCommentariesV2", {
    schema: Commentary.getLiveCommentaries.schema,
    handler: (request, reply) => getAllCommentariesDataV2(request, reply, fastify),
  })

  fastify.post("/getMarketsByCId" , {
    schema: Score.getMarkets.schema,
    handler: (request, reply) => getMarketsByCommentaryId(request, reply, fastify)
  })
  fastify.post("/getMarketsByCIdV1" , {
    schema: Score.getMarkets.schema,
    handler: (request, reply) => getMarketsByCommentaryIdV1(request, reply, fastify)
  })
  fastify.post("/notificationByClient",{
    schema : Score.getNotificationByClient.schema,
    handler : (request,reply) => getNotificationByClient(request,reply,fastify)
  })
  fastify.post("/markRead",{
    schema : Score.markreadNotification.schema,
    handler : (request,reply) => markReadNotification(request,reply,fastify)
  });
  fastify.post("/getMarketsGraphsByEId" , {
    schema: Score.getGraphsEvent.schema,
    handler: (request, reply) => getMarketByGraphByRefId(request, reply, fastify)
  })
  fastify.post("/getMarketRunners" , {
    schema: Score.getMarketRunners.schema,
    handler: (request, reply) => getAllEventMarketsAndRunners(request, reply, fastify)
  })
  fastify.post("/getAllBlock", {
    handler: (request, reply) => getAllBlocks(request, reply, fastify)
  })
  fastify.post("/getPageFormat", {
    handler: (request, reply) => getAllPageFormats(request, reply, fastify)
  })
  fastify.post("/getAllNews", {
    handler: (request, reply) => getAllNews(request, reply, fastify)
  })
  fastify.post("/newsById", {
    handler: (request, reply) => getNewsById(request, reply, fastify)
  })
  fastify.post("/getMenutype", {
    handler: (request, reply) => getAllMenuTypes(request, reply, fastify)
  })
  fastify.post("/getMenuItem", {
    handler: (request, reply) => getAllMenuItems(request, reply, fastify)
  })
  fastify.post("/getBanners" , {
    schema: Score.getBanners.schema,
    handler: (request, reply) => getAllBanners(request, reply, fastify)
  })
  fastify.post("/getMarketTypeAndCategory", {
    handler: (request, reply) => getMarketTypeAndCategoryByMarketType(request, reply, fastify),
  });
  fastify.post("/getCompetitions", {
    handler: (request, reply) => getAllCompetitions(request, reply, fastify)
  });
  fastify.post("/videoLibrary", {
    handler: (request, reply) => getAllVideoLibrary(request, reply, fastify)
  });
  fastify.post("/photoLibrary", {
    handler: (request, reply) => getAllPhotoLibrary(request, reply, fastify)
  });
  fastify.post("/libraryImage", {
    handler: (request, reply) => allLibraryImages(request, reply, fastify)
  });

  fastify.post("/commentaryConsoleFe" , {
    schema: Score.commentaryConsoleFe.schema,
        preHandler: [
        (request, reply) => authorize(request, reply, fastify)
        ],
    handler: (request, reply) => insertCommentaryConsoleFe(request, reply, fastify)
  });
  fastify.post("/tips", {
    handler: (request, reply) => getAllTipsClientAPI(request, reply, fastify)
  });
  fastify.post("/socket", (request, reply) => {
    if (request?.body?.status === 120) {
      global.sessionData = [];
      return reply.send([]);
    } 
  
    let filterData = global.sessionData;
  
    if (request?.body?.type !== undefined) {
      filterData = filterData.filter(item => item.type === request.body.type);
    }
  
    return reply.send(filterData);
  });
  fastify.post("/countryCodes", {
    handler: (request, reply) => getAllCountryCode(request, reply, fastify),
  });
  fastify.post("/socialMedia", {
    handler: (request, reply) => getAllSocialMedia(request, reply, fastify),
  });
  fastify.post("/whiteLabel", {
    handler: (request, reply) => clientApiWhitelabels(request, reply, fastify),
  });
  fastify.post("/deleteAcc", {
    // schema: Client.delete.schema,
    handler: (request, reply) => deleteClientByEncrypt(request, reply, fastify),
  });
  fastify.post("/allFavComp", {
    handler: (request, reply) => getAllFavCompetitions(request, reply, fastify),
  });
  fastify.post("/saveFavComp", {
    schema: FavCompetitions.save.schema,
    handler: (request, reply) => saveFavCompetition(request, reply, fastify),
  });
  fastify.post("/deleteFavComp", {
    schema: FavCompetitions.delete.schema,
    handler: (request, reply) => deleteFavCompetition(request, reply, fastify),
  });
  fastify.post("/changeDisplayOrder", {
    schema: FavCompetitions.updateDisplayOrder.schema,
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });
  fastify.post("/allFavComm", {
    handler: (request, reply) => allFavCommentary(request, reply, fastify),
  });
  fastify.post("/saveFavComm", {
    schema: FavCommentary.save.schema,
    handler: (request, reply) => saveFavCommentary(request, reply, fastify),
  });
  fastify.post("/deleteFavComm", {
    schema: FavCommentary.delete.schema,
    handler: (request, reply) => deleteFavCommentary(request, reply, fastify),
  });
   fastify.post("/hideEvent", {
    // schema: FavCommentary.delete.schema,
    handler: (request, reply) => getHideEvent(request, reply, fastify),
  });
   fastify.post("/allCardTypes", {
    handler: (request, reply) => getAllCardType(request, reply, fastify),
  });
   fastify.post("/saveDeviceData", {
    handler: (request, reply) => saveDeviceData(request, reply, fastify),
  });
   fastify.post("/tournamentTeamPoints", {
    handler: (request, reply) => getTournamentTeamPoints(request, reply, fastify),
  });
  fastify.post("/iccRanking", {
    handler: (request, reply) => AllICCRankings(request, reply, fastify),
  });
  fastify.post("/commAwards", {
    handler: (request, reply) => allCommentaryAwards(request, reply, fastify),
  });
  fastify.post("/playerInfo", {
    schema: Score.getPlayerByPlayerId.schema,
    handler: (request, reply) => getPlayerById(request, reply, fastify),
  });
  fastify.post("/getPlayerHistoryByPlayerId", {
    schema: Score.getPlayerByPlayerId.schema,
    handler: (request, reply) => getPlayerHistoryByPlayerIdForClient(request, reply, fastify),
  });
  fastify.post("/getPlayerCommentaryHistoryByPlayerId", {
    schema: Score.getPlayerByPlayerId.schema,
    handler: (request, reply) => getCommentaryPlayerHistoryByPlayerIdForClient(request, reply, fastify),
  });
  fastify.post("/getCompetitionStatisticsById", {
    schema: Score.getByCompetitionId.schema,
    handler: (request, reply) => getCompetitionStatisticsByCompetitionId(request, reply, fastify),
  });
  fastify.post("/getHeadToHeadCommentary", {
    schema: Score.getHeadToHeadCommentary.schema,
    handler: (request , reply) => getHeadToHeadCommentary(request, reply, fastify)
  });
  fastify.post("/getCommentaryStatistics", {
    schema: Score.getCommentaryStatistics.schema,
    handler: (request , reply) => getCommentaryStatistics(request, reply, fastify)
  });
  fastify.post("/getCompetitionSquads", {
    schema: Score.getCompetitionSquads.schema,
    handler: (request , reply) => getTournamentTeamPlayersByCompetitionIdForClient(request, reply, fastify)
  });
  fastify.post("/getAllCommentaryByCompetitionId", {
    schema: Score.getAllCommentaryByCompetitionId.schema,
    handler: (request , reply) => getAllCommentaryByCompetitionIdForClient(request, reply, fastify)
  });
  fastify.post("/getDomain", {
    // schema: Score.getAllCommentaryByCompetitionId.schema,
    handler: (request , reply) => getAllSubScribesDomain(request, reply, fastify)
  });
  fastify.post("/getSubDomain", {
    // schema: Score.getAllCommentaryByCompetitionId.schema,
    handler: (request , reply) => getAllSubDomainData(request, reply, fastify)
  });
  fastify.post("/insertSubDomain", {
    // schema: Score.getAllCommentaryByCompetitionId.schema,
    handler: (request , reply) => insertSubDomains(request, reply, fastify)
  });
  fastify.post("/insertDomain", {
    // schema: Score.getAllCommentaryByCompetitionId.schema,
    handler: (request , reply) => insertDomains(request, reply, fastify)
  });
  fastify.post("/getAllAdvertise", {
    handler: (request , reply) => getAllAdvertise(request, reply, fastify)
  });
  fastify.post("/getAllSeasonOfCompetitions", {
    schema: Score.getAllSeasonOfCompetitions.schema,
    handler: (request , reply) => getAllSeasonOfCompetitions(request, reply, fastify)
  });
  fastify.get("/checkPanelLoadData", {
    handler: (request , reply) => checkPanelLoadData(request, reply, fastify)
  });
  fastify.post("/getCommentaryScoreStats", {
    schema: Score.getCommentaryScoreStats.schema,
    handler: (request , reply) => getCommentaryScoreStats(request, reply, fastify)
  });
  fastify.post("/register", {
    handler: (request , reply) => registerLiveActivityToken(request, reply, fastify)
  });
  fastify.post("/unregister", {
    handler: (request , reply) => unRegisterLiveActivityToken(request, reply, fastify)
  });
  fastify.post("/liveMatchToken", {
    handler: (request , reply) => getAllLiveActivityTokensByCommentary(request, reply, fastify)
  });
  fastify.post("/deleteLiveActivityToken", {
    handler: (request , reply) => deleteLiveActivityTokenById(request, reply, fastify)
  });
  fastify.post("/deleteExpiredLiveActivityToken", {
    handler: (request , reply) => deleteExpiredLiveActivityToken(request, reply, fastify)
  });
};

