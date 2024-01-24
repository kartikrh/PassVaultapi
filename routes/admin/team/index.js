const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllEventTypes } = require("../../../controller/users/admin/eventTypes");
const { getAllPlayers } = require("../../../controller/users/admin/teamsAndPlayer/players");
const {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
} = require("../../../controller/users/admin/teamsAndPlayer/teams");
const { Teams, EventType, Player } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Teams.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllTeams(request, reply, fastify),
  });
  fastify.post("/eventTypeList", {
    schema: EventType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEventTypes(request, reply, fastify),
  });
  fastify.post("/playerList", {
    schema: Player.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPlayers(request, reply, fastify),
  }); 
  fastify.post("/byId", {
    schema: Teams.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getTeamById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Teams.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: request.body.teamId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveTeam(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Teams.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteTeam(request, reply, fastify),
  });
};
