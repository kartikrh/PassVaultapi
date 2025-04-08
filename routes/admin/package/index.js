const { authorize } = require("../../../controller/middleware");
const {
    allPackages,
    packageById,
    savePackage,
    deletePackage,
    activeInactivePackage,
    isDefaultChange,
    updateDisplayOrder,
    isDisplayPackage,
} = require("../../../controller/users/admin/packages");
const { Packages } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: Packages.getAll.schema,
        handler: (request, reply) => allPackages(request, reply, fastify),
    });
    fastify.post("/byId", {
        schema: Packages.getById.schema,
        handler: (request, reply) => packageById(request, reply, fastify),
    });
    fastify.post("/save", {
        schema: Packages.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => savePackage(request, reply, fastify),
    });
    fastify.post("/delete", {
        schema: Packages.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => deletePackage(request, reply, fastify),
    });
    fastify.post("/activeInactive", {
        schema: Packages.activeInactiveApi.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => activeInactivePackage(request, reply, fastify),
    });
    fastify.post("/isDefault", {
        schema: Packages.isDefaultChange.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => isDefaultChange(request, reply, fastify),
    });
    fastify.post("/changeDisplayOrder", {
        schema: Packages.DisplayUpdate.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
    });
    fastify.post("/isDisplay", {
        schema: Packages.isDisplay.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => isDisplayPackage(request, reply, fastify),
    });
};