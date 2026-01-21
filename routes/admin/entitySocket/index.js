const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllEntitySocket,
  getEntitySocketById,
  saveEntitySocket,
  deleteEntitySocket,
  activeInactiveEntitySocket,
  changeEntityActionType,
  isAutoScoreUpdateEntitySocket,
  isAutoUpdateCommentaryEntitySocket,
  getEntitySocketResponse,
} = require("../../../controller/users/admin/entitySocket");
const { EntitySocket } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: EntitySocket.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEntitySocket(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: EntitySocket.byId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEntitySocketById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: EntitySocket.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: request.body.entitySocketId == 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveEntitySocket(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: EntitySocket.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteEntitySocket(request, reply, fastify),
  });

  fastify.post("/activeInactive", {
    schema: EntitySocket.activeInactive.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveEntitySocket(request, reply, fastify),
  });

  fastify.post("/changeActionType", {
    schema: EntitySocket.changeActionType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => changeEntityActionType(request, reply, fastify),
  });

  fastify.post("/autoScoreUpdate", {
    schema: EntitySocket.entityAutoScoreUpdate.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isAutoScoreUpdateEntitySocket(request, reply, fastify),
  });

  fastify.post("/autoUpdateCommentary", {
    schema: EntitySocket.entityAutoUpdateCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isAutoUpdateCommentaryEntitySocket(request, reply, fastify),
  });

  fastify.get("/getEntitySocketResponse", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "EntitySocket",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEntitySocketResponse(request, reply, fastify),
  });
};
