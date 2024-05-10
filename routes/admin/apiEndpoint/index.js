const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  saveApiEndpoints,
  getAllApiEndpoints,
  getApiEndpointsById,
  deleteApiEndpoints,
  activeInactiveApiEndpoints,
} = require("../../../controller/users/admin/apiEndpoints");
const { ApiEndpoints } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: ApiEndpoints.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API Endpoints",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllApiEndpoints(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: ApiEndpoints.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API Endpoints",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getApiEndpointsById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: ApiEndpoints.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API Endpoints",
          mode: request.body.ApiEndpointsId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveApiEndpoints(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: ApiEndpoints.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API Endpoints",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteApiEndpoints(request, reply, fastify),
  });

  fastify.post("/activeInactiveApiEndpoints", {
    schema: ApiEndpoints.activeInactiveApiEndpoints.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "API Endpoints",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveApiEndpoints(request, reply, fastify),
  });
};
