const { authorize } = require("../../../controller/middleware");
const { getAllAutoUpdatePlayerStatisticsData } = require("../../../controller/users/admin/autoUpdatePlayerStatisticsData");
const { AutoUpdatePlayerStatisticsData } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: AutoUpdatePlayerStatisticsData.getAll.schema,
        // preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllAutoUpdatePlayerStatisticsData(request, reply, fastify),
    });
}