const { authorize } = require("../../../controller/middleware");
const { getAllAPNSActivityLogs } = require("../../../controller/users/admin/apnsActivityLogs");
const { APNSLiveActivityLogs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: APNSLiveActivityLogs.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllAPNSActivityLogs(request, reply, fastify),
    });
}