const { authorize } = require("../../../controller/middleware");
const {
    getAllAutoImportData,
    insertAutoImportData
} = require("../../../controller/users/admin/autoImportData");
const { AutoImportData } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: AutoImportData.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllAutoImportData(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: AutoImportData.save.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => insertAutoImportData(request, reply, fastify),
    });
}