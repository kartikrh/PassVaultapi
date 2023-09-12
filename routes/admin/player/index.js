const { authorize } = require("../../../controller/middleware");
const {
  getAllPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
} = require("../../../controller/users/admin/players");

const { Player } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Player.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllPlayers(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Player.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPlayerById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Player.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => savePlayer(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Player.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePlayer(request, reply, fastify),
  });
};
