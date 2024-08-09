const {
    getAllMailSettings,
    singleGetMailSettings,
    saveMailSettings,
    deleteMailSetting,
    isDefaultStage
} = require("../../../controller/users/admin/mailSettings");
const { MailSettings } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        handler: (request, reply) => getAllMailSettings(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: MailSettings.getById.schema,
        handler: (request, reply) => singleGetMailSettings(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: MailSettings.save.schema,
        handler: (request, reply) => saveMailSettings(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: MailSettings.delete.schema,
        handler: (request, reply) => deleteMailSetting(request, reply, fastify),
    });

    fastify.post("/isDefault", {
        schema: MailSettings.isDefaultStage.schema,
        handler: (request, reply) => isDefaultStage(request, reply, fastify),
    });
};
