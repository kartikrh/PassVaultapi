const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const { getVaultData, putVaultData } = require("../../../controller/vault/data");

module.exports = async (fastify, opts) => {
  fastify.get("/", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getVaultData(request, reply, fastify),
  });

  fastify.put("/", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => putVaultData(request, reply, fastify),
  });
};
