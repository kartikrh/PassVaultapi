const { getDetailsByCId, getAllEventMarket, createEventMarket, deleteEventMarket, activeInactiveMarket, updateAllowMarket, getEventListByCompetitionId, marketListResultFalse, changeResultOfMarket, marketListByCId, updateMarketRate, saveEventMarket ,changeMarketCancel, changeMarketResult, changeMarketClose, suspendMarketByCId, getEventMarketById, getMarketTemplateTypeList, getCommentaryTypeList, setDelayEventMarket} = require("../../../controller/users/admin/eventMarket");
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
    fastify.post("/byId", {  
        schema: EventMarket.byId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getEventMarketById(request, reply, fastify)
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
    fastify.post("/save",{
        schema: EventMarket.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: request.body.eventMarketId == 0 ? "add" : "edit"
            })
        ],
        handler: (request, reply) => saveEventMarket(request, reply, fastify)
    })
    fastify.post("/updateMarketRate",{
        schema: EventMarket.updateMarketRate.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "edit"
            })
        ],
        handler: (request, reply) => updateMarketRate(request, reply, fastify)
    })
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
    }),
    fastify.post("/setMarketCancel", {
        schema : EventMarket.changeMarketCancel.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => changeMarketCancel(request, reply, fastify),
    }),
    fastify.post("/setMarketResult", {
        schema : EventMarket.changeMarketResult.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => changeMarketResult(request, reply, fastify),
    })
    fastify.post("/marketListByCId",{
        schema: EventMarket.marketListByCId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => marketListByCId(request, reply, fastify)
    })
    fastify.post("/setMarketClose", {
        schema : EventMarket.changeMarketClose.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => changeMarketClose(request, reply, fastify),
    })
    fastify.post("/suspendMarketByCId",{
        schema: EventMarket.suspendMarketByCId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "edit"
            })
        ],
        handler: (request, reply) => suspendMarketByCId(request, reply, fastify)
    })
    fastify.post("/commentaryTypeList",{
        schema: EventMarket.commentaryTypeList.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getCommentaryTypeList(request, reply, fastify)
    })
    fastify.post("/marketTemplateTypeList",{
        schema: EventMarket.marketTemplateTypeList.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getMarketTemplateTypeList(request, reply, fastify)
    })
    fastify.post("/setdelay", {
        schema: EventMarket.setdelay.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "setdelay"
            })
        ],
        handler: (request, reply) => setDelayEventMarket(request, reply, fastify)
    })
};