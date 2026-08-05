const { authorize } = require("../../../controller/middleware");
const { getAllAPNSActivityLogs, deleteAPNSActivityLogsById } = require("../../../controller/users/admin/apnsActivityLogs");
const { APNSLiveActivityLogs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/getAll", {
        schema: APNSLiveActivityLogs.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllAPNSActivityLogs(request, reply, fastify),
    });
    fastify.post("/delete", {
        schema: APNSLiveActivityLogs.delete.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => deleteAPNSActivityLogsById(request, reply, fastify),
    });
}