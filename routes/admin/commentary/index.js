const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  getAllDisplayStatus,
  getCommentaryDetailsById,
  saveCommentaryDetails,
  deleteBallByBallCommentary,
  deleteOverCommentary,
  getCommentaryDetailsByEventId,
} = require("../../../controller/users/admin/commentary/commentary");
const { Commentary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Commentary.getAll.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getAllCommentaries(request, reply, fastify),
  });
  fastify.post("/displayStatus", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllDisplayStatus(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: Commentary.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryById(request, reply, fastify),
  });
  fastify.post("/detailsById", {
    schema: Commentary.getById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Commentary.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: request.body.commentaryId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => addCommentary(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Commentary.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCommentary(request, reply, fastify),
  });
  fastify.post("/saveDetails", {
    schema: Commentary.saveDetails.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => saveCommentaryDetails(request, reply, fastify),
  });
  fastify.post("/deleteBallByBall", {
    schema: Commentary.deleteBallByBall.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      deleteBallByBallCommentary(request, reply, fastify),
  });
  fastify.post("/deleteOverCommentary", {
    schema: Commentary.deleteOvers.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteOverCommentary(request, reply, fastify),
  });

  fastify.post("/getscore", {
    schema: Commentary.getByeventId.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "Commentary",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) =>
      getCommentaryDetailsByEventId(request, reply, fastify),
  });
};
