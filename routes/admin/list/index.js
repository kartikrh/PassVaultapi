const { authorize } = require("../../../controller/middleware");
const {
    getEventTypeList,
    getTeamList,
    getAllPlayerType,
    getAllBowlingType,
    getAllPlayerList,
    getMatchTypeList,
    getMarketTypeList,
    marketType,
    mtAndCategories,
    getCategoryByMarketType,
    getAllMatchTypes,
    allPythonAPIs,
    getCompetitionList,
    getAllDifficulties,
    getEventListcompetitionId,
} = require("../../../controller/users/admin/list/index");
const { Listing } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/eventTypeList", {
        schema: Listing.eventTypeList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getEventTypeList(request, reply, fastify),
    });
    fastify.post("/teamList", {
        schema: Listing.teamList.schema,
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
        schema: Listing.playerList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllPlayerList(request, reply, fastify),
    });
    fastify.post("/matchTypeList", {
        schema: Listing.getAllMatchTypes.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getMatchTypeList(request, reply, fastify),
    });
    fastify.post("/markeTypeList", {
        schema: Listing.markeTypeList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getMarketTypeList(request, reply, fastify)
    });
    fastify.post("/marketType", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => marketType(request, reply, fastify),
    });
    fastify.post("/mtAndCategories", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => mtAndCategories(request, reply, fastify),
    });
    fastify.post("/getCategoryByMarketType", {
        schema: Listing.getCategoryByMarketType.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getCategoryByMarketType(request, reply, fastify)
    });
    fastify.post("/allMatchTypes", {
        schema: Listing.getAllMatchTypes.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllMatchTypes(request, reply, fastify),
    });
    fastify.post("/pythonAPIs", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => allPythonAPIs(request, reply, fastify),
    });
    fastify.post("/competitionList", {
        schema: Listing.competitionList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getCompetitionList(request, reply, fastify),
    });
    fastify.post("/allDifficulties", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllDifficulties(request, reply, fastify),
    })
    fastify.post("/eventListByCompetitionId", {
        schema: Listing.eventListByCompetitionId.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getEventListcompetitionId(request, reply, fastify),
    });
}