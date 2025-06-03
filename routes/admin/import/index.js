const { authorize } = require("../../../controller/middleware");
const {
    importMatch,
} = require("../../../controller/users/admin/importMatch");


module.exports = async function (fastify, opts) {
    fastify.post("/commentary", {
        preHandler: [(request, reply) => authorize(request, reply, fastify)],
        handler: (request, reply) => importMatch(request, reply, fastify)
    });
}