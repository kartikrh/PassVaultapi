const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllEventTypes } = require("../../../controller/users/admin/eventTypes");
const {
  getAllPlayers,
  getPlayerById,
  savePlayer,
  deletePlayer,
  getAllBowlingType,
  getAllPlayerType,
  getAllPlayerByTeam,
} = require("../../../controller/users/admin/teamsAndPlayer/players");
const { getAllTeams } = require("../../../controller/users/admin/teamsAndPlayer/teams");

const { Player, Teams, EventType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Player.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPlayers(request, reply, fastify),
  }); 
  fastify.post("/eventTypeList", {
    schema: EventType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEventTypes(request, reply, fastify),
  });
  fastify.post("/teamList", {
    schema: Teams.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllTeams(request, reply, fastify),
  });


  fastify.post("/byId", {
    schema: Player.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPlayerById(request, reply, fastify),
  });
  fastify.post("/byTeamId", {
    schema: Teams.getById.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllPlayerByTeam(request, reply, fastify),
  });
  fastify.post("/allPlayerTypes", {
    schema: Player.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllPlayerType(request, reply, fastify),
  });
  fastify.post("/allBowlingTypes", {
    schema: Player.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllBowlingType(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Player.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: request.body.playerId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => savePlayer(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Player.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Players",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deletePlayer(request, reply, fastify),
  });
};
