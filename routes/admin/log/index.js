const { getAllResponseLogs, getAllThirdPartyApiLogs, getAllPredictorAPILogs } = require("../../../controller/users/admin/log/index");
// const { MailSettings } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/responseLogs", {
        handler: (request, reply) => getAllResponseLogs(request, reply, fastify)
    });

    fastify.post("/predictorLogs", {
        // schema: MailSettings.getById.schema,
        handler: (request, reply) => getAllPredictorAPILogs(request, reply, fastify)
    });

    fastify.post("/thirdpartyLogs", {
        // schema: MailSettings.save.schema,
        handler: (request, reply) => getAllThirdPartyApiLogs(request, reply, fastify)
    });
};
