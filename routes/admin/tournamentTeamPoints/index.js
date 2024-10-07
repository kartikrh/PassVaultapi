const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllTournamentTeamPoints,
  saveTournamentTeamPoints,
  deleteTournamentTeamPoints,
  activeInactiveTournamentTeamPoints,
} = require("../../../controller/users/admin/tournamentTeamPoints");
const { getAllTeams  } = require("../../../controller/users/admin/teamsAndPlayer/teams");
const { TournamentTeamPoints } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: TournamentTeamPoints.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllTournamentTeamPoints(request, reply, fastify),
  });
  fastify.post("/save", {    
    schema: TournamentTeamPoints.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: request.body[0].id === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveTournamentTeamPoints(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: TournamentTeamPoints.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteTournamentTeamPoints(request, reply, fastify),
  });
  fastify.post("/activeInactive", {
    schema: TournamentTeamPoints.activeInactive.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveTournamentTeamPoints(request, reply, fastify),
  });
  fastify.post("/teamsList", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllTeams(request, reply, fastify),
  });
};