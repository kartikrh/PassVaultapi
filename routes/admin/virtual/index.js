const { xKeyPermissionVirtual } = require("../../../controller/middleware");
const {
  saveEvent,
  createVirtualEvent,
  virtualEventToss,
  updateVirtualEventStatus,
  ballByBallVirtualEvent,
  ballByBallChange,
  suffleCardAPI,
} = require("../../../controller/users/admin/virtual");
const { VirtualEvent } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/saveEvent", {
    schema: VirtualEvent.saveEvent.schema,
    preHandler: [
      (request, reply) => xKeyPermissionVirtual(request, reply, fastify),
    ],
    handler: (request, reply) => saveEvent(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: VirtualEvent.createVirtualEvent.schema,
    handler: (request, reply) => createVirtualEvent(request, reply, fastify),
  });
  fastify.post("/toss", {
    schema: VirtualEvent.EventToss.schema,
    handler: (request, reply) => virtualEventToss(request, reply, fastify),
  });
  fastify.post("/ballStart", {
    schema: VirtualEvent.BallStartEvent.schema,
    handler: (request, reply) => updateVirtualEventStatus(request, reply, fastify),
  });
  fastify.post("/ballByBall", {
    schema: VirtualEvent.ballByBall.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => ballByBallChange(request, reply, fastify),
  });
  fastify.post("/suffleCard", {
    schema: VirtualEvent.suffleCard.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => suffleCardAPI(request, reply, fastify),
  });
};
