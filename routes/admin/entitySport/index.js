const { EntitySport } = require("../../../swaggerSchema/groupTags/schema");
const {
  saveTeams,
  savePlayers,
  saveCompetitions,
  saveCommentaries,
} = require("../../../controller/users/admin/entitySport");

module.exports = async (fastify, opts) => {
  fastify.post("/saveTeam", {
    schema: EntitySport.Teams.schema,
    handler: (request, reply) => saveTeams(request, reply, fastify),
  });
  fastify.post("/savePlayer", {
    schema: EntitySport.SavePlayer.schema,
    handler: (request, reply) => savePlayers(request, reply, fastify),
  });
  fastify.post("/saveCompetition", {
    schema: EntitySport.SaveCompetition.schema,
    handler: (request, reply) => saveCompetitions(request, reply, fastify),
  });
   fastify.post("/saveCommentary", {
    schema: EntitySport.SaveCommentary.schema,
    handler: (request, reply) => saveCommentaries(request, reply, fastify),
  });
};
