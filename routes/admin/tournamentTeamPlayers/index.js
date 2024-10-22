const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllTournamentTeamPlayers,
  saveTournamentTeamPlayers,
  getPlayersByTeamId,
  deleteTournamentTeamPlayers,
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
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "add",
        }),
    ],
    handler: (request, reply) => saveTournamentTeamPlayers(request, reply, fastify),
  });

  fastify.post("/playersList", {
    schema: TournamentTeamPlayers.playersList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPlayersByTeamId(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: TournamentTeamPlayers.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteTournamentTeamPlayers(request, reply, fastify),
  });
};
