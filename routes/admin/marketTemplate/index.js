const { authorize } = require("../../../controller/middleware");
const { saveMarketTemplate, getAllMarketTemplate, getMarketTemplateId } = require("../../../controller/users/admin/marketTemplate");
const { MarketTemplate } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  fastify.post("/all", {
    schema: MarketTemplate.getAll.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    // ],
    handler: (request, reply) => getAllMarketTemplate(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MarketTemplate.getById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    // ],
    handler: (request, reply) => getMarketTemplateId(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MarketTemplate.save.schema,
    // preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      saveMarketTemplate(request, reply, fastify),
  });
};