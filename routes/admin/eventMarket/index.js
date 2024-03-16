const { getDetailsByCId, getAllEventMarket, createEventMarket, deleteEventMarket, activeInactiveMarket, updateAllowMarket, getEventListByCompetitionId, marketListResultFalse, changeResultOfMarket } = require("../../../controller/users/admin/eventMarket");
const { EventMarket, Commentary } = require("../../../swaggerSchema/groupTags/schema");
const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");
module.exports = async (fastify, opts) => {
    fastify.post("/all", {  
        schema: EventMarket.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
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
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getDetailsByCId(request, reply, fastify)
    });
    fastify.post("/saveEventMarket", {  
        schema: EventMarket.createEventMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "add"
            })
        ],
        handler: (request, reply) => createEventMarket(request, reply, fastify)
    });
    fastify.post("/delete", {
        schema: EventMarket.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "delete"
            })
        ],
        handler: (request, reply) => deleteEventMarket(request, reply, fastify)
    })
    fastify.post("/activeInactiveMarket", {
        schema: EventMarket.activeInactiveMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "delete"
            })
        ],
        handler: (request, reply) => activeInactiveMarket(request, reply, fastify)
    })
    fastify.post("/updateAllowMarket", {
        schema: EventMarket.updateAllowMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "delete"
            })
        ],
        handler: (request, reply) => updateAllowMarket(request, reply, fastify)
    })
    fastify.post("/eventTypeList", {
        schema: Commentary.eventTypeList.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
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
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => getCompetitionListByeventTypeId(request, reply, fastify),
    });
    fastify.post("/eventListByCompetitionId", {
        schema: Commentary.eventListByCompetitionId.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => getEventListByCompetitionId(request, reply, fastify),
    })
    fastify.post("/pendingMarketList", {
        schema: EventMarket.getAll.schema, 
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => marketListResultFalse(request, reply, fastify),
    })
    fastify.post("/setMarketIsResult", {
        schema : EventMarket.changeResultOfMarket.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => changeResultOfMarket(request, reply, fastify),
    })
};