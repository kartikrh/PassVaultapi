const { authorize } = require("../../../controller/middleware");
const {
    getAllAutoImportData,
    insertAutoImportData,
    updateAutoImportData,
    deleteAutoImportData,
    allAutoImportDataLogs,
    getAutoImportDataById,
    insertAllAutoImportData,
} = require("../../../controller/users/admin/autoImportData");
const { AutoImportData } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: AutoImportData.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllAutoImportData(request, reply, fastify),
    });
    fastify.post("/getAll", {
        schema: AutoImportData.getAllAutoImportData.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => allAutoImportDataLogs(request, reply, fastify),
    });
    fastify.post("/byId", {
        schema: AutoImportData.getById.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAutoImportDataById(request, reply, fastify),
    });
    fastify.post("/save", {
        schema: AutoImportData.save.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => insertAutoImportData(request, reply, fastify),
    });
    fastify.post("/update", {
        schema: AutoImportData.edit.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => updateAutoImportData(request, reply, fastify),
    });
    fastify.post("/delete", {
        schema: AutoImportData.deleteImportData.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => deleteAutoImportData(request, reply, fastify),
    });
    fastify.post("/saveAll", {
        schema: AutoImportData.saveAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => insertAllAutoImportData(request, reply, fastify),
    });
}