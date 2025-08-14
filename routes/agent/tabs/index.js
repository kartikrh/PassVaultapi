const {
  getTabs,
  getAgentWisePermission,
} = require("../../../controller/users/agent/tabs");
const { authorize } = require("../../../controller/middleware/index");
const { Tabs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  fastify.post("/all", {
    schema: Tabs.getTabs.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getTabs(request, reply, fastify),
  });

  fastify.post("/getUserWisePermission", {
    schema: Tabs.getTabs.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAgentWisePermission(request, reply, fastify),
  });
};