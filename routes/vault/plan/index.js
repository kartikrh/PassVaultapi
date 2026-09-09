const { authorizeClient } = require("../../../controller/middleware/vaultAuth");
const {
  getAvailablePlans,
  getDefaultPaymentMethod,
  requestPlanUpgrade,
  myPlanUpgradeRequest,
} = require("../../../controller/vault/plan");
const { VaultPlan } = require("../../../swaggerSchema/groupTags/schema");

// Same rate-limit reasoning as routes/vault/auth/index.js's AUTH_ATTEMPT_RATE_LIMIT
// -- app.js's app-wide @fastify/rate-limit is effectively unlimited, only a
// route's own `config.rateLimit` takes effect.
const UPGRADE_REQUEST_RATE_LIMIT = { max: 10, timeWindow: "5 minutes" };

module.exports = async (fastify, opts) => {
  fastify.get("/packages", {
    schema: VaultPlan.availablePlans.schema,
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getAvailablePlans(request, reply, fastify),
  });

  fastify.get("/paymentMethod", {
    schema: VaultPlan.getDefaultPaymentMethod.schema,
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => getDefaultPaymentMethod(request, reply, fastify),
  });

  fastify.post("/upgradeRequest", {
    schema: VaultPlan.upgradeRequest.schema,
    config: { rateLimit: UPGRADE_REQUEST_RATE_LIMIT },
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => requestPlanUpgrade(request, reply, fastify),
  });

  fastify.get("/upgradeRequest/mine", {
    schema: VaultPlan.myUpgradeRequest.schema,
    preHandler: [(request, reply) => authorizeClient(request, reply, fastify)],
    handler: (request, reply) => myPlanUpgradeRequest(request, reply, fastify),
  });
};
