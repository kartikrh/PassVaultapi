const { authorize } = require("../../../controller/middleware");
const {
    getAllPythonAPIs,
    getPythonAPIById,
    savePythonAPI,
    deletePythonAPI,
    updateIsDefault,
    activeInactivePythonAPI,
} = require("../../../controller/users/admin/pythonAPI");
const { PythonAPI } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: PythonAPI.getAll.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllPythonAPIs(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: PythonAPI.byId.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getPythonAPIById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: PythonAPI.savePythonAPI.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => savePythonAPI(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: PythonAPI.deletePythonAPI.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => deletePythonAPI(request, reply, fastify),
    });

    fastify.post("/isDefault", {
        schema: PythonAPI.updateIsDefault.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => updateIsDefault(request, reply, fastify),
    });

    fastify.post("/activeInactive", {
        schema: PythonAPI.ActiveInactive.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => activeInactivePythonAPI(request, reply, fastify),
    });
};
