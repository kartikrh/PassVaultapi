const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllClientSocket,
  getClientSocketById,
  saveClientSocket,
  deleteClientSocket,
  changeActionType,
  activeInactiveClientSocket,
  socketCount,
} = require("../../../controller/users/admin/clientSocket");
const { ClientSocket } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: ClientSocket.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "ClientSocket",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllClientSocket(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: ClientSocket.byId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "ClientSocket",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getClientSocketById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: ClientSocket.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "ClientSocket",
          mode: request.body.clientSocketId == 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveClientSocket(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: ClientSocket.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "ClientSocket",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteClientSocket(request, reply, fastify),
  });
  fastify.post("/changeActionType",{
    schema : ClientSocket.changeActionType.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, {
        tabName : "ClientSocket",
        mode : "edit"
      })
    ],
    handler : (request, reply) => changeActionType(request, reply, fastify)
  })
  fastify.post("/activeInactive",{
    schema : ClientSocket.activeInactive.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, {
        tabName : "ClientSocket",
        mode : "edit"
      })
    ],
    handler : (request, reply) => activeInactiveClientSocket(request, reply, fastify)
  })
  fastify.post("/socketCount",{
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, {
        tabName : "ClientSocket",
        mode : "view"
      })
    ],
    handler : (request, reply) => socketCount(request, reply, fastify)
  })
};
