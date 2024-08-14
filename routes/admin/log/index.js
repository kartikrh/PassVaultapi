const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");
const { getEventTypeList } = require("../../../controller/users/admin/eventTypes");
const { getAllResponseLogs, getAllThirdPartyApiLogs, getAllPredictorAPILogs, getAllCommentaryLogs, getAllErrorLogs, getEventByCompetition, getComByEvent } = require("../../../controller/users/admin/log/index");
const { Commentary, Logs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/responseLogs", {
        handler: (request, reply) => getAllResponseLogs(request, reply, fastify)
    });

    fastify.post("/predictorLogs", {
        handler: (request, reply) => getAllPredictorAPILogs(request, reply, fastify)
    });

    fastify.post("/thirdpartyLogs", {
        handler: (request, reply) => getAllThirdPartyApiLogs(request, reply, fastify)
    });

    fastify.post("/commentaryLogs", {
        handler: (request, reply) => getAllCommentaryLogs(request, reply, fastify)
    });

    fastify.post("/errorLogs", {
        handler: (request, reply) => getAllErrorLogs(request, reply, fastify)
    });
    fastify.post("/eventTypeList", {
        schema: Commentary.eventTypeList.schema,
        handler: (request, reply) => getEventTypeList(request, reply, fastify),
    });
    fastify.post("/competitionListByEventTypeId", {
        schema: Commentary.competitionListByEventTypeId.schema,
        handler: (request, reply) =>
          getCompetitionListByeventTypeId(request, reply, fastify),
    });
    fastify.post("/getComByCompetition", {
        schema: Logs.getComByCompetition.schema,
        handler: (request, reply) => getComByEvent(request, reply, fastify),
    })
};