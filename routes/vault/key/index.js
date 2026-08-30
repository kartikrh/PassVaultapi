const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const { setupKey, recoverKey, rotateKey } = require("../../../controller/vault/key");

module.exports = async (fastify, opts) => {
  fastify.post("/setup", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => setupKey(request, reply, fastify),
  });

  fastify.post("/recover", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => recoverKey(request, reply, fastify),
  });

  fastify.post("/rotate", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => rotateKey(request, reply, fastify),
  });
};
