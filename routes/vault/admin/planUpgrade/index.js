const { authorize, checkPermission } = require("../../../../controller/middleware");
const {
  getAllPlanUpgradeRequests,
  approvePlanUpgradeRequest,
  rejectPlanUpgradeRequest,
} = require("../../../../controller/vault/adminPlanUpgrade");
const { VaultPlan } = require("../../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: VaultPlan.adminGetAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "PlanUpgradeRequests", mode: "view" }),
    ],
    handler: (request, reply) => getAllPlanUpgradeRequests(request, reply, fastify),
  });

  fastify.post("/approve", {
    schema: VaultPlan.adminApprove.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "PlanUpgradeRequests", mode: "edit" }),
    ],
    handler: (request, reply) => approvePlanUpgradeRequest(request, reply, fastify),
  });

  fastify.post("/reject", {
    schema: VaultPlan.adminReject.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, { tabName: "PlanUpgradeRequests", mode: "edit" }),
    ],
    handler: (request, reply) => rejectPlanUpgradeRequest(request, reply, fastify),
  });
};
