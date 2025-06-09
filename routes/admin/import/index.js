const { authorize } = require("../../../controller/middleware");
const {
    importMatch,
    importCompetition,
    importPlayers,
    importTeams,
} = require("../../../controller/users/admin/importMatch");


module.exports = async function (fastify, opts) {
    fastify.post("/commentary", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => importMatch(request, reply, fastify)
    });
    fastify.post("/competition", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => importCompetition(request, reply, fastify)
    });
    fastify.post("/players", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => importPlayers(request, reply, fastify)
    });
    fastify.post("/teams", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => importTeams(request, reply, fastify)
    });
}