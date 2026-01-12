const { EntitySport } = require("../../../swaggerSchema/groupTags/schema");
const {
  saveTeams,
  savePlayers,
  saveCompetitions,
  saveCommentaries,
  saveCountryCodes,
  saveVenues,
  setEntityCom,
  setEntityCom2,
  saveTournamentTeamPlayer,
  updateCommentaryPlayersPlaying11,
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
  })
  fastify.post("/setEntityCom", { 
    schema: EntitySport.SaveCommentary.schema,
    handler: (request, reply) => setEntityCom(request, reply, fastify),
  });
  fastify.post("/setEntityCom2", {
    // schema: EntitySport.SaveCommentary.schema,
    handler: (request, reply) => setEntityCom2(request, reply, fastify),
  });
  fastify.post("/saveTournamentTeamPlayer", {
    schema: EntitySport.SaveTournamentTeamPlayer.schema,
    handler: (request, reply) => saveTournamentTeamPlayer(request, reply, fastify),
  });
  fastify.post("/playing11", {
    handler: (request, reply) => updateCommentaryPlayersPlaying11(request, reply, fastify),
  });
};
