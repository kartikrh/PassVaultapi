const { authorize, checkPermission } = require("../../../../controller/middleware");
const { getAllHistory } = require("../../../../controller/vault/adminHistory");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "History", mode: "view" }),
    ],
    handler: (request, reply) => getAllHistory(request, reply, fastify),
  });
};
