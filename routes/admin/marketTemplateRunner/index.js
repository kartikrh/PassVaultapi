const { authorize, checkPermission } = require("../../../controller/middleware");
const { saveMarketTemplateRunner, getAllMarketTemplateRunner, getRunnerByTemplateId, getRunnerById, deleteMarketTemplateRunner } = require("../../../controller/users/admin/marketTemplateRunner");
const { MarketTemplateRunner } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
    fastify.post("/all",{
        schema : MarketTemplateRunner.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Market Templates",
                mode : "view"
            }),
        ],
        handler: (request, reply) => getAllMarketTemplateRunner(request, reply, fastify)
    });
    fastify.post("/getByTemplateId",{
        schema : MarketTemplateRunner.getByTemplateId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Market Templates",
                mode : "view"
            }),
        ],
        handler: (request, reply) => getRunnerByTemplateId(request, reply, fastify)
    
    })
    fastify.post("/byId",{
        schema : MarketTemplateRunner.getById.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Market Templates",
                mode : "view"
            }),
        ],
        handler: (request, reply) => getRunnerById(request, reply, fastify)
    });

    fastify.post("/save",{
        schema : MarketTemplateRunner.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Market Templates",
                mode : "add"
            }),
        ],
        handler: (request, reply) => saveMarketTemplateRunner(request, reply, fastify)
    });
    fastify.post("/delete",{
        schema : MarketTemplateRunner.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Market Templates",
                mode : "delete"
            }),
        ],
        handler: (request, reply) => deleteMarketTemplateRunner(request, reply, fastify)
    });
};