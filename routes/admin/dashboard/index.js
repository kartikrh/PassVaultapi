const {
    authorize,
} = require("../../../controller/middleware");
const {
    getAllNullImagePlayers,
    getAllNullImageTeams,
    getAllDuplicatePlayers,
    getAllNullImageTeamsAndPlayers,
    getPlayersWithoutTeam,
    getPlayersWithoutHomeTeam,
} = require("../../../controller/users/admin/dashboard");

module.exports = async (fastify, opts) => {
    fastify.post("/players", {
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => getAllNullImagePlayers(request, reply, fastify),
    });
    fastify.post("/teams", {
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => getAllNullImageTeams(request, reply, fastify),
    });
    fastify.post("/dupPlayers", {
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => getAllDuplicatePlayers(request, reply, fastify),
    });
    fastify.post("/imgNullData", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllNullImageTeamsAndPlayers(request, reply, fastify),
    });
    fastify.post("/playersWithoutTeam", {
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => getPlayersWithoutTeam(request, reply, fastify),
    });
    fastify.post("/playersWithoutHomeTeam", {
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => getPlayersWithoutHomeTeam(request, reply, fastify),
    });
};
