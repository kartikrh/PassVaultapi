const { EntitySport } = require("../../../swaggerSchema/groupTags/schema");
const {
  saveTeams,
  savePlayers,
  saveCompetitions,
  saveCommentaries,
  saveCountryCodes,
  saveVenues,
  saveTournamentTeamPlayer,
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
  fastify.post("/saveCountryCode", {
    schema: EntitySport.SaveCountryCode.schema,
    handler: (request, reply) => saveCountryCodes(request, reply, fastify),
  });
  fastify.post("/saveVenue", {
    schema: EntitySport.SaveVenue.schema,
    handler: (request, reply) => saveVenues(request, reply, fastify),
  });
  fastify.post("/saveTournamentTeamPlayer", {
    schema: EntitySport.SaveTournamentTeamPlayer.schema,
    handler: (request, reply) => saveTournamentTeamPlayer(request, reply, fastify),
  });
};
