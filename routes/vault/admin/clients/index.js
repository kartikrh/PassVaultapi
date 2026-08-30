const { authorize, checkPermission } = require("../../../../controller/middleware");
const {
  getAllClients,
  getClientDetail,
  updateClientStatus,
  deleteClients,
  getClientUsage,
} = require("../../../../controller/vault/adminClients");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "Clients", mode: "view" }),
    ],
    handler: (request, reply) => getAllClients(request, reply, fastify),
  });

  fastify.post("/byId", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "Clients", mode: "view" }),
    ],
    handler: (request, reply) => getClientDetail(request, reply, fastify),
  });

  fastify.post("/usage", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "Clients", mode: "view" }),
    ],
    handler: (request, reply) => getClientUsage(request, reply, fastify),
  });

  fastify.post("/updateStatus", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "Clients", mode: "edit" }),
    ],
    handler: (request, reply) => updateClientStatus(request, reply, fastify),
  });

  fastify.post("/delete", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "Clients", mode: "delete" }),
    ],
    handler: (request, reply) => deleteClients(request, reply, fastify),
  });
};
