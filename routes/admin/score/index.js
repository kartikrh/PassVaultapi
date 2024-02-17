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
} = require("../../../controller/users/admin/commentary/commentary");
const { getMenuItemList } = require("../../../controller/users/admin/menuType");
const {
  Score} = require("../../../swaggerSchema/groupTags/schema");

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

  fastify.get("/getCIds", {
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
  fastify.get("/scheduleMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>  getScheduleMatchList(request, reply, fastify)
  });
  fastify.get("/liveMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getLiveMatchList(request, reply, fastify)
  });
  fastify.get("/completeMatchesList", {
    schema: Score.getCIds.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ]
    handler: (request, reply) => getCompleteMatchList(request, reply, fastify)
  });
  fastify.post("/getmenuItemList",{
    schema : Score.getmenuitemlist.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Match Types",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getMenuItemList(request, reply, fastify)
  }),
  fastify.post("/getPagesList",{
    schema : Score.getmenuitemlist.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Match Types",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getAllPage(request, reply, fastify)
  }),

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
};
