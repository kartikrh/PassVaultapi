const { getAllVendors, getVendorById, saveVendor, deleteVendor, activeInactiveVendor, updateIsIPCheck } = require("../../../controller/users/admin/vendors/vendor");
const { Vendor } = require("../../../swaggerSchema/groupTags/schema");
const {
    authorize,
    checkPermission,
} = require("../../../controller/middleware");
module.exports = async function (fastify, opts) {
    fastify.post("/all", {
        schema: Vendor.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAllVendors(request, reply, fastify),
    })
    fastify.post("/byId", {
        schema: Vendor.getById.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getVendorById(request, reply, fastify),
    })
    fastify.post("/save", {
        schema: Vendor.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: request.body.vendorId == 0 ? "add" : "edit",
                }),
        ],
        handler: (request, reply) => saveVendor(request, reply, fastify),
    })

    fastify.post("/delete", {
        schema: Vendor.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteVendor(request, reply, fastify),
    })

    fastify.post("/activeInactiveVendor",{
        schema: Vendor.activeInactive.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => activeInactiveVendor(request, reply, fastify),
    })

    fastify.post("/isIPCheck",{
        schema: Vendor.isIPCheck.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Vendors",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => updateIsIPCheck(request, reply, fastify),
    })
};