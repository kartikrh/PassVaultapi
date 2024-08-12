const { getAllResponseLogs, getAllThirdPartyApiLogs, getAllPredictorAPILogs, getAllCommentaryLogs, getAllErrorLogs } = require("../../../controller/users/admin/log/index");

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
};