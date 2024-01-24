const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllCompetition } = require("../../../controller/users/admin/competition");
const {
  deleteEvent,
  getAllEvents,
  saveEvent,
  getEventId,
  getEventcompetitionId,
} = require("../../../controller/users/admin/event");
const { getAllEventTypes } = require("../../../controller/users/admin/eventTypes");
const { Event, EventType, Compitition } = require("../../../swaggerSchema/groupTags/schema");

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
    schema: EventType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEventTypes(request, reply, fastify),
  });

  fastify.post("/competitionList", {
    schema: Compitition.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Events",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCompetition(request, reply, fastify),
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
