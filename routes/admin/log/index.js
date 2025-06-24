const { checkPermission, authorize } = require("../../../controller/middleware");
const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { getAllResponseLogs, getAllThirdPartyApiLogs, getAllPredictorAPILogs, getAllCommentaryLogs, getAllErrorLogs, getEventByCompetition, getComByEvent, getUndoLogs, getAllResultLogs, getEMLogs, getCommentaryDRSLogs } = require("../../../controller/users/admin/log/index");
const { Commentary, Logs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/responseLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllResponseLogs(request, reply, fastify)
    });

    fastify.post("/predictorLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllPredictorAPILogs(request, reply, fastify)
    });

    fastify.post("/thirdpartyLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllThirdPartyApiLogs(request, reply, fastify)
    });

    fastify.post("/commentaryLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllCommentaryLogs(request, reply, fastify)
    });

    fastify.post("/errorLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllErrorLogs(request, reply, fastify)
    });
    fastify.post("/eventTypeList", {
        schema: Commentary.eventTypeList.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getEventTypeList(request, reply, fastify),
    });
    fastify.post("/competitionListByEventTypeId", {
        schema: Commentary.competitionListByEventTypeId.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) =>
          getCompetitionListByeventTypeId(request, reply, fastify),
    });
    fastify.post("/getComByCompetition", {
        schema: Logs.getComByCompetition.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=> 
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getComByEvent(request, reply, fastify),
    })
    fastify.post("/undoLogs",{
        schema : Logs.undoLogs.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => checkPermission(request,reply,fastify,{
                tabName : "Logs",
                mode : "view"
            })
        ],
        handler : (request,reply) => getUndoLogs(request,reply,fastify)
    })
    fastify.post("/resultLogs",{
        schema : Logs.resultLogs.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => checkPermission(request,reply,fastify,{
                tabName : "Logs",
                mode : "view"
            })
        ],
        handler : (request,reply) => getAllResultLogs(request,reply,fastify)
    })
    fastify.post("/emLogs",{
        schema : Logs.emLogs.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => checkPermission(request,reply,fastify,{
                tabName : "Logs",
                mode : "view"
            })
        ],
        handler : (request,reply) => getEMLogs(request,reply,fastify)
    })
    fastify.post("/DRSLogs",{
        schema : Logs.DRSLogs.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => checkPermission(request,reply,fastify,{
                tabName : "Logs",
                mode : "view"
            })
        ],
        handler : (request,reply) => getCommentaryDRSLogs(request,reply,fastify)
    })
};