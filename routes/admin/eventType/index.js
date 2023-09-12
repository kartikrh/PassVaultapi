const { authorize } = require("../../../controller/middleware");
const {
  getAllEventTypes,
  getEventTypeId,
  saveEventType,
  deleteEventType,
} = require("../../../controller/users/admin/eventTypes");
const { EventType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: EventType.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllEventTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: EventType.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getEventTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: EventType.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveEventType(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: EventType.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteEventType(request, reply, fastify),
  });
};
