const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  updateCommentaryStatus,
  updateTossDetails,
} = require("../../../controller/users/admin/commentary/commentary");
const { Commentary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCommentaries(request, reply, fastify),
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
  fastify.post("/updateToss", {
    schema: Commentary.updateToss.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateTossDetails(request, reply, fastify),
  });
  fastify.post("/updateStatus", {
    schema: Commentary.updateCommentaryStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updateCommentaryStatus(request, reply, fastify),
  });
};
