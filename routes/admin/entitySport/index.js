const { EntitySport } = require("../../../swaggerSchema/groupTags/schema");
const {
  saveTeams,
  savePlayers,
} = require("../../../controller/users/admin/entitySport");

module.exports = async (fastify, opts) => {
  fastify.post("/saveTeam", {
    schema: EntitySport.Teams.schema,
    handler: (request, reply) => saveTeams(request, reply, fastify),
  });
  fastify.post("/savePlayer", {
    schema: EntitySport.Teams.schema,
    handler: (request, reply) => savePlayers(request, reply, fastify),
  });
};
