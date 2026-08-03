const { authorize } = require("../../../controller/middleware");
const { getAllLiveActivityTokens } = require("../../../controller/users/admin/liveActivityToken");
const { LiveActivityToken } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: LiveActivityToken.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllLiveActivityTokens(request, reply, fastify),
    });
}