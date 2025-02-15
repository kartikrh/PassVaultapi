const { getDetailsByCId, getAllEventMarket, createEventMarket, deleteEventMarket, activeInactiveMarket, updateAllowMarket, getEventListByCompetitionId, marketListResultFalse, changeResultOfMarket, marketListByCId, updateMarketRate, saveEventMarket ,changeMarketCancel, changeMarketResult, changeMarketClose, suspendMarketByCId, getEventMarketById, getMarketTemplateTypeList, getCommentaryTypeList, setDelayEventMarket, getDSReportEventMarket, getSLReportEventMarket, getMarketDataByCId,UpdateResulOrApproveEventMarket, getMarketTypeCategory,marketListcategoryNameByCId, setAllMarketClose, setCloseMarketCancel, cancelSettleMarket, getDetailsByCIdV1, createEventMarketV1, updateMarketRateV1, marketListByCIdV1, getRunnerByMarket, pendingMultiRunnerMarkets, updateMarketResult, getComByCompId, updateEventMarketCloseSuspendTime, closeMarketsByIds, cancelMarketsByIds, getManualMarketData, saveManualMarketData, upManualMarketData, getCommentaryList, upIsInningRunApi } = require("../../../controller/users/admin/eventMarket");
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
    fastify.post("/commListByCompetitionId", {
        schema: Commentary.eventListByCompetitionId.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => getCommentaryList(request, reply, fastify),
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
    fastify.post("/getDSReport", {
        schema: EventMarket.getDSReport.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getDSReportEventMarket(request, reply, fastify)
    })
    fastify.post("/getSLReport", {
        schema: EventMarket.getDSReport.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getSLReportEventMarket(request, reply, fastify)
    })
    fastify.post("/getMarketDataByCId", {
        schema: EventMarket.marketListByCId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify,{
                tabName: "Event Markets",
                mode: "view"            
            })
        ],
        handler: (request, reply) => getMarketDataByCId(request, reply, fastify)
    });
    fastify.post("/UpdateResulOrApproveMarketResult", {
        schema : EventMarket.updateOrApproveResultOfMarket.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => UpdateResulOrApproveEventMarket(request, reply, fastify),
    });
    fastify.post("/getMarketTypeCategory",{
        schema : EventMarket.getMarketTypeCategory.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify,{
                tabName: "Event Markets",
                mode: "view"            
            })
        ],
        handler : (request, reply) => getMarketTypeCategory(request, reply, fastify)
    });
      
      fastify.post("/marketListcategoryNameByCId", {
        schema : EventMarket.getMarketTypeCategory.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => marketListcategoryNameByCId(request, reply, fastify),
    });
    fastify.post("/allMarketClose",{
        schema : EventMarket.changeStatus.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify,{
                tabName: "Event Markets",
                mode: "edit"            
            })
        ],
        handler : (request, reply) => setAllMarketClose(request, reply, fastify)
    })
    // fastify.post("/cancelCloseMarket",{
    //     schema : EventMarket.changeStatus.schema,
    //     preHandler: [
    //         (request, reply) => authorize(request, reply, fastify),
    //         (request, reply) => checkPermission(request, reply, fastify,{
    //             tabName: "Event Markets",
    //             mode: "edit"            
    //         })
    //     ],
    //     handler : (request, reply) => setCloseMarketCancel(request, reply, fastify)
    // })
    fastify.post("/cancelSettleMarket",{
        schema : EventMarket.changeStatus.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify,{
                tabName: "Event Markets",
                mode: "edit"            
            })
        ],
        handler : (request, reply) => cancelSettleMarket(request, reply, fastify)
    });
    fastify.post("/getDetailsByCIdV1", {  
        schema: EventMarket.getDetailsByCIdV1.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getDetailsByCIdV1(request, reply, fastify)
    })
    fastify.post("/saveEventMarketV1", {  
        schema: EventMarket.createEventMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "add"
            })
        ],
        handler: (request, reply) => createEventMarketV1(request, reply, fastify)
    });

    fastify.post("/updateMarketRateV1",{
        schema: EventMarket.updateMarketRate.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "edit"
            })
        ],
        handler: (request, reply) => updateMarketRateV1(request, reply, fastify)
    })
    fastify.post("/marketListByCIdV1",{
        schema: EventMarket.marketListByCId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => marketListByCIdV1(request, reply, fastify)
    })
    fastify.post("/getRunnerByMarket",{
        schema: EventMarket.getRunnerByMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getRunnerByMarket(request, reply, fastify)
    })
    fastify.post("/pendingMultiRunnerMarket",{
        schema: EventMarket.getAll.schema, 
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => pendingMultiRunnerMarkets(request, reply, fastify),

    })
    fastify.post("/updateResultMultiMarket",{
        schema: EventMarket.updateOrApproveResultOfMarket.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => updateMarketResult(request, reply, fastify),
    })
    fastify.post("/getComByComp",{
        schema: EventMarket.getComByComp.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "view",
            }),
        ],
        handler: (request, reply) => getComByCompId(request, reply, fastify),
    })
    fastify.post("/closeSuspendTime",{
        schema: EventMarket.closeSuspendTime.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => updateEventMarketCloseSuspendTime(request, reply, fastify),
    })
    fastify.post("/closeMarkets",{
        schema: EventMarket.closeMarkets.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => closeMarketsByIds(request, reply, fastify),
    });
    fastify.post("/cancelMarkets",{
        schema: EventMarket.cancelMarkets.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply) =>
            checkPermission(request, reply, fastify, {
              tabName: "Event Markets",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => cancelMarketsByIds(request, reply, fastify),
    });
    fastify.post("/getManualMarket", {
        schema: EventMarket.getManualMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "view"
            })
        ],
        handler: (request, reply) => getManualMarketData(request, reply, fastify)
    })
    fastify.post("/saveManualMarket", {
        schema: EventMarket.saveManualMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: request.body.eventMarketId == 0 ? "add" : "edit"
            })
        ],
        handler: (request, reply) => saveManualMarketData(request, reply, fastify)
    })
    fastify.post("/upManualMarket", {
        schema: EventMarket.upManualMarket.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Event Markets",
                mode: "edit"
            })
        ],
        handler: (request, reply) => upManualMarketData(request, reply, fastify)
    })
    fastify.post("/upIsInningRun", {
        schema: EventMarket.upIsInningRun.schema,
        preHandler: [
          (request, reply) => authorize(request, reply, fastify),
          (request, reply, done) =>
            checkPermission(request, reply, fastify, {
              tabName: "API",
              mode: "edit",
            }),
        ],
        handler: (request, reply) => upIsInningRunApi(request, reply, fastify),
    });
};

