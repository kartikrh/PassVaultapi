const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAlldisplayStatuses,
  getdisplayStatusesById,
  savedisplayStatuses,
  deletedisplayStatuses,
} = require("../../../controller/users/admin/displayStatuses");

const { DisplayStatus } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: DisplayStatus.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "DisplayStatus",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAlldisplayStatuses(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: DisplayStatus.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "DisplayStatus",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getdisplayStatusesById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: DisplayStatus.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "DisplayStatus",
          mode: request.body.displayStatusId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => savedisplayStatuses(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: DisplayStatus.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "DisplayStatus",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deletedisplayStatuses(request, reply, fastify),
  });
};
