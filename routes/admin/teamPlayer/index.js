const { authorize } = require("../../../controller/middleware");
const {
  getAllTeamPlayers,
  getTeamPlayerById,
  getTeamPlayersByTeamId,
  saveTeamPlayer,
  deleteTeamPlayer,
} = require("../../../controller/users/admin/teamsAndPlayer/teamPlayers");
const { TeamPlayer } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: TeamPlayer.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllTeamPlayers(request, reply, fastify),
  });

  fastify.post("/byTeamId", {
    schema: TeamPlayer.byTeamId.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) =>
      getTeamPlayersByTeamId(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: TeamPlayer.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getTeamPlayerById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: TeamPlayer.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveTeamPlayer(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: TeamPlayer.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteTeamPlayer(request, reply, fastify),
  });
};
