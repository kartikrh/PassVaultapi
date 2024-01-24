const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getCompetitionList } = require("../../../controller/users/admin/competition");
const {
  deleteEvent,
  getAllEvents,
  saveEvent,
  getEventId,
  getEventcompetitionId,
} = require("../../../controller/users/admin/event");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { Event } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Event.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEvents(request, reply, fastify),
  });
  fastify.post("/eventTypeList", {
    schema: Event.eventTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });

  fastify.post("/competitionList", {
    schema: Event.competitionList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCompetitionList(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Event.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventId(request, reply, fastify),
  });

  fastify.post("/bycompetitionId", {
    schema: Event.getBycompetitionId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventcompetitionId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Event.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: request.body.eventId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveEvent(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Event.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteEvent(request, reply, fastify),
  });
};
