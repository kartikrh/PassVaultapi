const { authorize } = require("../../../controller/middleware");
const {
    getRoleList,
    getAllUsersWithCurrent,
    getBlockList,
    getTabs,
    allCountryCodes,
    getUserList,
} = require("../../../controller/users/admin/list/index");
const { Listing } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/roleList", {
        schema: Listing.roleList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getRoleList(request, reply, fastify),
    });
    fastify.post("/allWithCurrent", {
        schema: Listing.getAllWithCurrent.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getAllUsersWithCurrent(request, reply, fastify),
    });
    fastify.post("/blockList", {
        schema: Listing.blockList.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getBlockList(request, reply, fastify),
    });
    fastify.post("/allTabs", {
        schema: Listing.getAllTabs.schema,
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => getTabs(request, reply, fastify),
    });
    fastify.post("/countryList",{
        schema : Listing.getAllCounntryCodes.schema,
        preHandler : [(request, reply) => authorize(request, reply, fastify)],
        handler : (request, reply) => allCountryCodes(request, reply, fastify)
    });
    fastify.post("/userList",{
        preHandler : [(request, reply) => authorize(request, reply, fastify)],
        handler : (request, reply) => getUserList(request, reply, fastify)
    });
}
