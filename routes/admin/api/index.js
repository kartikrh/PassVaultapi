const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllApis, getApisById, saveApis, deleteApis, activeInactiveApi } = require("../../../controller/users/admin/apis");
const { Api } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Api.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllApis(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Api.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getApisById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Api.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API",
          mode: request.body.ApiEndpointsId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveApis(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Api.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteApis(request, reply, fastify),
  });

  fastify.post("/activeInactiveApi", {
    schema: Api.activeInactiveApi.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveApi(request, reply, fastify),
  });
};
