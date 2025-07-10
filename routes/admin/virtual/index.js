const { xKeyPermissionVirtual } = require("../../../controller/middleware");
const {
  saveEvent,
  createVirtualEvent,
  virtualEventToss,
  updateVirtualEventStatus,
  ballByBallVirtualEvent,
  ballByBallChange,
  suffleCardAPI,
  cancelEventAPI,
  serverTimeAPI,
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
  fastify.post("/createEvent", {
    schema: VirtualEvent.createVirtualEvent.schema,
    handler: (request, reply) => createVirtualEvent(request, reply, fastify),
  });
  fastify.post("/eventToss", {
    schema: VirtualEvent.EventToss.schema,
    handler: (request, reply) => virtualEventToss(request, reply, fastify),
  });
  fastify.post("/eventBallStart", {
    schema: VirtualEvent.BallStartEvent.schema,
    handler: (request, reply) => updateVirtualEventStatus(request, reply, fastify),
  });
  fastify.post("/eventScoring", {
    schema: VirtualEvent.ballByBall.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => ballByBallChange(request, reply, fastify),
  });
  fastify.post("/eventSuffle", {
    schema: VirtualEvent.suffleCard.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => suffleCardAPI(request, reply, fastify),
  });
   fastify.post("/cancelEvent", {
    schema: VirtualEvent.cancelEvent.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => cancelEventAPI(request, reply, fastify),
  });  
  fastify.get("/serverTime", {
    schema: VirtualEvent.cancelEvent.schema,
    // handler: (request, reply) => ballByBallVirtualEvent(request, reply, fastify),
    handler: (request, reply) => serverTimeAPI(request, reply, fastify),
  }); 
  
};
