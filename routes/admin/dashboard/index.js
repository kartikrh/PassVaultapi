const { authorize } = require("../../../controller/middleware");
const { getDashboardCounts } = require("../../../controller/users/admin/dashboard");
const { Dashboard } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/counts", {
    schema: Dashboard.counts.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getDashboardCounts(request, reply, fastify),
  });
};
