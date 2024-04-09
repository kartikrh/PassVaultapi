const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllPage } = require("../../../controller/users/admin/Page/page");
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
} = require("../../../controller/users/admin/commentary/commentary");
const { getMenuItemList } = require("../../../controller/users/admin/menuType");
const {
  saveSubScribeDomain,
} = require("../../../controller/users/admin/subScribesDomain");
const {
  Score,
  SubScribesDomain,
  Commentary,
} = require("../../../swaggerSchema/groupTags/schema");

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

  fastify.post("/getCommentary", {
    schema: Commentary.getAll.schema,
    handler: (request, reply) => getOpenCommentaries(request, reply, fastify),
  });
};
