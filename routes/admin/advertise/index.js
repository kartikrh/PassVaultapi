const {
    authorize,
    checkPermission,
} = require("../../../controller/middleware");

const { 
    getAllAdvertise,
    getAdvertiseById,
    saveAdvertise,
    deleteAdvertise,
    activeInactiveAdvertise,
} = require("../../../controller/users/admin/advertise");

const { Advertise } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {

    fastify.post("/all", {
        schema: Advertise.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Advertise",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAllAdvertise(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: Advertise.getById.schema,
        handler: (request, reply) => getAdvertiseById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: Advertise.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Advertise",
                    mode: request.body.advertiseId === 0 ? "add" : "edit",
                }),
        ],
        handler: (request, reply) => saveAdvertise(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: Advertise.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Advertise",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteAdvertise(request, reply, fastify),
    });

    fastify.post("/activeInactiveAdvertise", {
        schema: Advertise.activeInactiveAdvertise.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Advertise",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => activeInactiveAdvertise(request, reply, fastify),
    });

};