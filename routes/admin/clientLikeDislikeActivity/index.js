const { getByClientTypeRefId, saveClientLikeDislikeActivity } = require("../../../controller/users/admin/clientLikeDislikeActivity");
const { ClientLikeDislikeActivity } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/byClientTypeRefId", {
        schema: ClientLikeDislikeActivity.getByClientTypeRefId.schema,
        // preHandler: [
        //     (request, reply) => authorize(request, reply, fastify),
        //     (request, reply) =>
        //         checkPermission(request, reply, fastify, {
        //             tabName: "iccRanking",
        //             mode: "view",
        //         }),
        // ],
        handler: (request, reply) => getByClientTypeRefId(request, reply, fastify),
    });
    fastify.post("/save", {
        schema: ClientLikeDislikeActivity.save.schema,
        // preHandler: [
        //     (request, reply) => authorize(request, reply, fastify),
        //     (request, reply) =>
        //         checkPermission(request, reply, fastify, {
        //             tabName: "iccRanking",
        //             mode: "view",
        //         }),
        // ],
        handler: (request, reply) => saveClientLikeDislikeActivity(request, reply, fastify),
    });
}