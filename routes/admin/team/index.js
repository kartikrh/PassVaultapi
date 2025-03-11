const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { getCompetitionList } = require("../../../controller/users/admin/competition");
const {  getAllPlayerList } = require("../../../controller/users/admin/teamsAndPlayer/players");
const {
  getAllTeams,
  getTeamById,
  saveTeam,
  deleteTeam,
  getTeamPoint,
  mergeTeamJerseyAndPlayerImage,
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
    schema: Teams.eventTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });
  fastify.post("/competitionListByEventTypeId", {
    schema: Teams.competitionTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCompetitionList(request, reply, fastify),
  });
  fastify.post("/playerList", {
    schema: Teams.playerList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPlayerList(request, reply, fastify),
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
          mode: request.body.teamId === 0 ? "add" : "edit",
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
  
  fastify.post("/getTeamPoint", {
    schema: Teams.getTeamPoint.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getTeamPoint(request, reply, fastify),
  })
  
  fastify.post("/mergeImage", {
    schema: Teams.mergeImages.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Teams",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => mergeTeamJerseyAndPlayerImage(request, reply, fastify),
  })
};
