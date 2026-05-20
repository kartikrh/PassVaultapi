const { authorize, multiTabPermissionCheck } = require("../../../controller/middleware/index");
const { Commentary } = require("../../../swaggerSchema/groupTags/schema");
const { getEventTypeList, getAllCommentaries, updateShowClientOfCommentary, activeInactiveCommentary, getTeamAndPlayerListV1 } = require("../../../controller/users/agent/commentary");
const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");

module.exports = async function (fastify, opts) {
  fastify.post("/all", {
    schema: Commentary.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Agent Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCommentaries(request, reply, fastify),
  });

  fastify.post("/updateShowClient", {
    schema: Commentary.updateShowClient.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Agent Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      updateShowClientOfCommentary(request, reply, fastify),
  });

  fastify.post("/activeInactiveCommentary", {
    schema: Commentary.activeInactiveCommentary.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Agent Commentary List" ],
          mode: "edit",
        }),
    ],
    handler: (request, reply) =>
      activeInactiveCommentary(request, reply, fastify),
  });

  fastify.post("/eventTypeList", {
    schema: Commentary.eventTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Agent Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });

  fastify.post("/getTeamAndPlayerByIdV1", {
    schema: Commentary.getById.schema,
    handler: (request, reply) => getTeamAndPlayerListV1(request, reply, fastify),
  });

  fastify.post("/competitionListByEventTypeId", {
    schema: Commentary.competitionListByEventTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        multiTabPermissionCheck(request, reply, fastify, {
          tabName:[ "Agent Commentary List" ],
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCompetitionListByeventTypeId(request, reply, fastify),
  });
};