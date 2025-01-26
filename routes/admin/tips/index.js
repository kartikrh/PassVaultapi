const {
  authorize,
  checkPermission,
  xKeyPermission,
} = require("../../../controller/middleware");
const {
  getAllTips,
  tipsById,
  saveTips,
  deleteTips,
  activeInactiveTips,
  saveExternalCommentaryTips,
  activeInactiveExternalTips,
} = require("../../../controller/users/admin/tips");
const { Tips } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Tips.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllTips(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Tips.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "view",
        }),
    ],
    handler: (request, reply) => tipsById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Tips.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: request.body.id === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveTips(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Tips.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteTips(request, reply, fastify),
  });

  fastify.post("/activeInactive", {
    schema: Tips.activeInactive.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Commentary",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveTips(request, reply, fastify),
  });

  fastify.post("/create", {
    preHandler: [
      (request, reply, done) => xKeyPermission(request, reply, fastify),
    ],
    handler: (request, reply) => saveExternalCommentaryTips(request, reply, fastify),
  });

  fastify.post("/updateActiveInactive", {
    preHandler: [
      (request, reply, done) => xKeyPermission(request, reply, fastify),
    ],
    handler: (request, reply) => activeInactiveExternalTips(request, reply, fastify),
  });
};
