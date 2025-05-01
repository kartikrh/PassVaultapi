const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  deleteCompetition,
  getAllCompetition,
  getCompetitionByeventTypeId,
  getCompetitionById,
  saveCompetition,
  updateDisplayOrder,
  isTrendingChangeStatus,
  isEventSnap,
  isPointTable,
  getEventSnapByCompetitionId,
  updateEventSnap,
  getCommentaryResult,
  getTeamList,
  allCompetitionsList,
  isMenChangeStatus,
  getTemplateByCompetitionId,
  saveCompTemplates,
} = require("../../../controller/users/admin/competition");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { Compitition } = require("../../../swaggerSchema/groupTags/schema");
const { getAllMatchTypes } = require("../../../controller/users/admin/matchType");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Compitition.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCompetition(request, reply, fastify),
  });
  fastify.post("/eventTypeList", {
    schema: Compitition.eventTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: Compitition.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCompetitionById(request, reply, fastify),
  });

  fastify.post("/byeventTypeId", {
    schema: Compitition.getByeventTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCompetitionByeventTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Compitition.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: request.body.competitionId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveCompetition(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Compitition.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCompetition(request, reply, fastify),
  });
  fastify.post("/changeDisplayOrder", {
    schema: Compitition.changeDispalyOrder.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });
  fastify.post("/isTrending", {
    schema: Compitition.isTrendingStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isTrendingChangeStatus(request, reply, fastify),
  });
  fastify.post("/isEventSnap", {
    schema: Compitition.isEventSnap.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isEventSnap(request, reply, fastify),
  });
  fastify.post("/isPointTable", {
    schema: Compitition.isPointTable.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isPointTable(request, reply, fastify),
  });
  fastify.post("/getMatchTypes", {
    schema: Compitition.getMatchTypes.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => getAllMatchTypes(request, reply, fastify),
  });

  fastify.post("/getEventSnap", {
    schema: Compitition.getEventSnapByCompetitionId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventSnapByCompetitionId(request, reply, fastify),
  });

  fastify.post("/updateEventSnap", {
    schema: Compitition.updateEventSnap.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateEventSnap(request, reply, fastify),
  });

  fastify.post("/result", {
    schema: Compitition.getCompetitionResult.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCommentaryResult(request, reply, fastify),
  });

  fastify.post("/teamList", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getTeamList(request, reply, fastify),
  });

  fastify.post("/competitionList", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => allCompetitionsList(request, reply, fastify),
  });
  fastify.post("/isMen", {
    schema: Compitition.isMenStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => isMenChangeStatus(request, reply, fastify),
  });
  fastify.post("/getTemplateByComp", {
    schema: Compitition.getTemplatesByCompId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getTemplateByCompetitionId(request, reply, fastify),
  });
  fastify.post("/saveCompTemplate", {
    schema: Compitition.saveCompTemplate.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => saveCompTemplates(request, reply, fastify),
  });
};
