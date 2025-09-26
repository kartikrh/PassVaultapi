const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllEntitySocket,
} = require("../../../controller/users/admin/entitySocket");
const { EntitySocket } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: EntitySocket.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    //   (request, reply) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "EntitySocket",
    //       mode: "view",
    //     }),
    ],
    handler: (request, reply) => getAllEntitySocket(request, reply, fastify),
  });
};
