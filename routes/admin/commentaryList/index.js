const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { getAllCommentaries, getCommentaryDetailsById, getCommentaryTeamList, getAllDisplayStatus } = require("../../../controller/users/admin/commentary/commentary");
const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { getMatchTypeList } = require("../../../controller/users/admin/matchType");
const { getAllPlayerByTeam } = require("../../../controller/users/admin/teamsAndPlayer/players");
const { Commentary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
      schema: Commentary.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllCommentaries(request, reply, fastify),
    });
    fastify.post("/detailsById", {
        schema: Commentary.getByIdDetails.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply, done) =>
            checkPermission(request, reply, fastify, {
              tabName: "Commentary List",
              mode: "view",
            }),
        ],
        handler: (request, reply) =>
          getCommentaryDetailsById(request, reply, fastify),
      });
    fastify.post("/matchTypeList", {
        schema: Commentary.matchTypeList.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Commentary List",
              mode: "view",
            }),
        ],
        handler: (request, reply) => getMatchTypeList(request, reply, fastify),
    });
    fastify.post("/teamList", {
      schema: Commentary.teamList.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getCommentaryTeamList(request, reply, fastify),
    });
    fastify.post("/eventTypeList", {
      schema: Commentary.eventTypeList.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getEventTypeList(request, reply, fastify),
    });
    fastify.post("/competitionListByEventTypeId", {
      schema: Commentary.competitionListByEventTypeId.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) =>
        getCompetitionListByeventTypeId(request, reply, fastify),
    });
    fastify.post("/playerListByTeamId", {
      schema: Commentary.playerListByTeamId.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllPlayerByTeam(request, reply, fastify),
    });
    fastify.post("/displayStatus", {
      schema: Commentary.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "Commentary List",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllDisplayStatus(request, reply, fastify),
    });
}