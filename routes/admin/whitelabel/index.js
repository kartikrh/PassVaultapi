const { authorize } = require("../../../controller/middleware");
const {
    getAllWhitelabels,
    whitelabelById,
    saveWhitelabel,
    deleteWhitelabel,
    activeInactiveWhitelabel
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
};