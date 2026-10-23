const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const { getKeyParams, setupKey, migrateKey, recoverKey, rotateKey } = require("../../../controller/vault/key");

// /migrate checks a password-derived key (a guessing target) and /rotate
// replaces the key check -- both capped tightly.
const KEY_RATE_LIMIT = { max: 10, timeWindow: "5 minutes" };

module.exports = async (fastify, opts) => {
  fastify.post("/params", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getKeyParams(request, reply, fastify),
  });

  fastify.post("/migrate", {
    config: { rateLimit: KEY_RATE_LIMIT },
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => migrateKey(request, reply, fastify),
  });

  fastify.post("/setup", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => setupKey(request, reply, fastify),
  });

  // Escrow removed -- answers outdated app versions with an update notice.
  fastify.post("/recover", {
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => recoverKey(request, reply, fastify),
  });

  fastify.post("/rotate", {
    config: { rateLimit: { max: 5, timeWindow: "1 hour" } },
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => rotateKey(request, reply, fastify),
  });
};
