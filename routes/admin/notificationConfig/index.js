const { authorize } = require("../../../controller/middleware");
const {
    getAllNotificationConfigs,
    NotificationConfigById,
    saveNotificationConfig,
    deletNotificationConfig,
    activeInactiveNotificationConfig
} = require("../../../controller/users/admin/notificationConfig");
const { NotificationConfig } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: NotificationConfig.getAll.schema,
        handler: (request, reply) => getAllNotificationConfigs(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: NotificationConfig.getById.schema,
        handler: (request, reply) => NotificationConfigById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: NotificationConfig.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => saveNotificationConfig(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: NotificationConfig.delete.schema,
        handler: (request, reply) => deletNotificationConfig(request, reply, fastify),
    });

    fastify.post("/activeInactive", {
        schema: NotificationConfig.activeInactive.schema,
        handler: (request, reply) => activeInactiveNotificationConfig(request, reply, fastify),
    });
};