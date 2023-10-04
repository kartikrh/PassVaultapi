const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllMatchTypes,
  getMatchTypeId,
  saveMatchType,
  deleteMatchType,
} = require("../../../controller/users/admin/matchType");
const { MatchType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: MatchType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllMatchTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MatchType.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMatchTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: MatchType.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",          
          mode: request.body.matchTypeId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveMatchType(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: MatchType.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteMatchType(request, reply, fastify),
  });
};
