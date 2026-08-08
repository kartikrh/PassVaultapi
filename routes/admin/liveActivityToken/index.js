const { authorize } = require("../../../controller/middleware");
const { deleteLiveActivityTokenById } = require("../../../controller/users/admin/lilveActivityToken");
const { getAllLiveActivityTokens } = require("../../../controller/users/admin/liveActivityToken");
const { LiveActivityToken } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/getAll", {
        schema: LiveActivityToken.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllLiveActivityTokens(request, reply, fastify),
    });
    fastify.post("/delete", {
        schema: LiveActivityToken.delete.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => deleteLiveActivityTokenById(request, reply, fastify),
    });
}