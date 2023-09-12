const { authorize } = require("../../../controller/middleware");
const {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
} = require("../../../controller/users/admin/teams");
const { Teams } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Teams.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllTeams(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Teams.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getTeamById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Teams.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveTeam(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Teams.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteTeam(request, reply, fastify),
  });
};
