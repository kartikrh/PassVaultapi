const { authorize } = require("../../../controller/middleware");
const {
    getEventTypeList,
    getTeamList,
    getAllPlayerType,
    getAllBowlingType,
    getAllPlayerList,
} = require("../../../controller/users/admin/list/index");
const { Listing } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/eventTypeList", {
        schema: Listing.EventTypeList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getEventTypeList(request, reply, fastify),
    });
    fastify.post("/teamList", {
        schema: Listing.TeamList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getTeamList(request, reply, fastify),
    });
    fastify.post("/allPlayerTypes", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllPlayerType(request, reply, fastify),
    });
    fastify.post("/allBowlingTypes", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllBowlingType(request, reply, fastify),
    });
    fastify.post("/playerList", {
        schema: Listing.PlayerList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllPlayerList(request, reply, fastify),
    });
}