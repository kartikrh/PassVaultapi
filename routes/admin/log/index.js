const { checkPermission, authorize } = require("../../../controller/middleware");
const { getAllErrorLogs } = require("../../../controller/users/admin/log/index");
const { Logs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/errorLogs", {
        schema : Logs.responseLogs.schema,
        preHandler : [
            (request, reply) => authorize(request,reply,fastify),
            (request , reply)=>
                checkPermission(request, reply , fastify,{
                    tabName : "Logs",
                    mode : "view"
                })
        ],
        handler: (request, reply) => getAllErrorLogs(request, reply, fastify)
    });
};
