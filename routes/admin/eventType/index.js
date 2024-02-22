const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllEventTypes,
  getEventTypeId,
  saveEventType,
  deleteEventType,
  updateDisplayOrder,
} = require("../../../controller/users/admin/eventTypes");
const { EventType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: EventType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Event Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllEventTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: EventType.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Event Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getEventTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: EventType.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Event Types",
          mode: request.body.eventTypeId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveEventType(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: EventType.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Event Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteEventType(request, reply, fastify),
  });
  fastify.post("/changeDisplayOrder", {
    schema: EventType.changeDispalyOrder.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Event Types",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });
};
