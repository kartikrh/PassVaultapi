const { authorize } = require("../../../controller/middleware");
const {
    getAllMailSettings,
    singleGetMailSettings,
    saveMailSettings,
    deleteMailSetting,
    isDefaultStage,
    activeInactiveMails,
    testMailSettings
} = require("../../../controller/users/admin/mailSettings");
const { MailSettings } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: MailSettings.getAll.schema,
        handler: (request, reply) => getAllMailSettings(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: MailSettings.getById.schema,
        handler: (request, reply) => singleGetMailSettings(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: MailSettings.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            // (request, reply, done) =>
            //  checkPermission(request, reply, fastify, {
            //    tabName: "MailSettings",
            //    mode: request.body.clientId === 0 ? "add" : "edit",
            //  }),
          ],
        handler: (request, reply) => saveMailSettings(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: MailSettings.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => deleteMailSetting(request, reply, fastify),
    });

    fastify.post("/isDefault", {
        schema: MailSettings.isDefaultStage.schema,
        handler: (request, reply) => isDefaultStage(request, reply, fastify),
    });

    fastify.post("/activeInactiveApi", {
        schema: MailSettings.activeInactiveApi.schema,
        handler: (request, reply) => activeInactiveMails(request, reply, fastify),
    });

    fastify.post("/testMail", {
        schema: MailSettings.testMail.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
        ],
        handler: (request, reply) => testMailSettings(request, reply, fastify),
    });
};
