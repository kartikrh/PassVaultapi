const { getDetailsByCId, getAllEventMarket } = require("../../../controller/users/admin/eventMarket");
const { EventMarket } = require("../../../swaggerSchema/groupTags/schema");
const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
module.exports = async (fastify, opts) => {
    fastify.post("/all", {  
        schema: EventMarket.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "EventMarket",
                mode: "view"
            })
        ],
        handler: (request, reply) => getAllEventMarket(request, reply, fastify)
    });
    fastify.post("/getDetailsByCId", {  
        schema: EventMarket.getDetailsByCId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "EventMarket",
                mode: "view"
            })
        ],
        handler: (request, reply) => getDetailsByCId(request, reply, fastify)
    });
    fastify.post("/createEventMarket", {  
        schema: EventMarket.createEventMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "EventMarket",
                mode: "view"
            })
        ],
        handler: (request, reply) => createEventMarket(request, reply, fastify)
    });
};