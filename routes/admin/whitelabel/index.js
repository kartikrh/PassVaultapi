const { authorize } = require("../../../controller/middleware");
const {
    getAllWhitelabels,
    whitelabelById,
    saveWhitelabel,
    deleteWhitelabel,
    activeInactiveWhitelabel,
    demoClientEnableInIOSWhitelabel,
    isDemoClientLogin,
    upIsDefaultAPI,
    hideEvents,
    getEventTypes,
    getCommentary,
    getCompetition,
    unhideEvents,
} = require("../../../controller/users/admin/whitelabel");
const { Whitelabel } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: Whitelabel.getAll.schema,
        handler: (request, reply) => getAllWhitelabels(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: Whitelabel.getById.schema,
        handler: (request, reply) => whitelabelById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: Whitelabel.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => saveWhitelabel(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: Whitelabel.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => deleteWhitelabel(request, reply, fastify),
    });

    fastify.post("/activeInactive", {
        schema: Whitelabel.activeInactive.schema,
        handler: (request, reply) => activeInactiveWhitelabel(request, reply, fastify),
    });
    fastify.post("/demoClientEnableInIOS", {
        schema: Whitelabel.demoClientEnableInIOS.schema,
        handler: (request, reply) => demoClientEnableInIOSWhitelabel(request, reply, fastify),
    });
    fastify.post("/demoClientLogin", {
        schema: Whitelabel.isDemoClientLogin.schema,
        handler: (request, reply) => isDemoClientLogin(request, reply, fastify),
    });
    fastify.post("/upIsDefault", {
        schema: Whitelabel.upIsDefault.schema,
        handler: (request, reply) => upIsDefaultAPI(request, reply, fastify),
    });
    fastify.post("/hideEvent", {
        schema: Whitelabel.hideEvent.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => hideEvents(request, reply, fastify),
    });
     fastify.post("/unHideEvent", {
        schema: Whitelabel.unHideEvent.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => unhideEvents(request, reply, fastify),
    });
    fastify.post("/getEventTypes", {
        schema: Whitelabel.getEventTypes.schema,
         preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => getEventTypes(request, reply, fastify),
    });
    fastify.post("/getCommentary", {
        schema: Whitelabel.getCommentary.schema,
         preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => getCommentary(request, reply, fastify),
    });
    fastify.post("/getCompetition", {
        schema: Whitelabel.getCompetition.schema,
         preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => getCompetition(request, reply, fastify),
    });
};