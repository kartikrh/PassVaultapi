const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllGroups,
  getGroupById,
  saveGroup,
  deleteGroup,
  activeInactiveGroup,
} = require("../../../controller/users/admin/groups");
const { Groups } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Groups.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllGroups(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Groups.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getGroupById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Groups.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: request.body.groupId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveGroup(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Groups.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteGroup(request, reply, fastify),
  });
  fastify.post("/activeInactive", {
    schema: Groups.activeInactiveGroup.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveGroup(request, reply, fastify),
  });
};