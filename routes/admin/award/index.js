const { authorize, checkPermission } = require("../../../controller/middleware");
const { 
    getAllAward,
    getAwardById,
    saveAward,
    deleteAward,
    activeInactiveAward,
    updateDisplayOrder
} = require("../../../controller/users/admin/award");
const { Award } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: Award.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAllAward(request, reply, fastify),
    });
    
    fastify.post("/byId", {
        schema: Award.getById.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAwardById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: Award.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: request.body.id === 0 ? "add" : "edit",
                }),
        ],
        handler: (request, reply) => saveAward(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: Award.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteAward(request, reply, fastify),
    });

    fastify.post("/activeInactive", {
        schema: Award.activeInactive.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => activeInactiveAward(request, reply, fastify),
    });

    fastify.post("/changeDisplayOrder", {
        schema: Award.updateDisplayOrder.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Award",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
    });

};