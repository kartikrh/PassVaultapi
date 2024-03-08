const { authorize } = require("../../../controller/middleware");
const { saveMarketTemplate } = require("../../../controller/users/admin/marketTemplate");
const { MarketTemplate } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  fastify.post("/save", {
    schema: MarketTemplate.save.schema,
    // preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      saveMarketTemplate(request, reply, fastify),
  });
};