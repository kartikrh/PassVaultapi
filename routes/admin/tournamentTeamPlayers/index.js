const { authorize } = require("../../../controller/middleware");
const {
  getAllTournamentTeamPlayers,
  saveTournamentTeamPlayers,
} = require("../../../controller/users/admin/tournamentTeamPlayers");
const { TournamentTeamPlayers } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: TournamentTeamPlayers.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllTournamentTeamPlayers(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: TournamentTeamPlayers.save.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveTournamentTeamPlayers(request, reply, fastify),
  });
};
