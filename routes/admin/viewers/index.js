const { authorize } = require("../../../controller/middleware");
const { getViewers } = require("../../../controller/users/admin/viewers");
const { Viewers } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/get", {
        schema: Viewers.get.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getViewers(request, reply, fastify),
    });
}