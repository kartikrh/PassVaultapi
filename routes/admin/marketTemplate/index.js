const { authorize, checkPermission } = require("../../../controller/middleware");
const { saveMarketTemplate, getAllMarketTemplate, getMarketTemplateId, deleteMarketTemplate } = require("../../../controller/users/admin/marketTemplate");
const { MarketTemplate } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  fastify.post("/all", {
    schema: MarketTemplate.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "view",
      }),
    ],
    handler: (request, reply) => getAllMarketTemplate(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MarketTemplate.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "view",
      }),
    ],
    handler: (request, reply) => getMarketTemplateId(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MarketTemplate.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: request.body.marketTemplateId === 0 ? "add" : "edit",
      }),
    ],
    handler: (request, reply) =>
      saveMarketTemplate(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MarketTemplate.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "delete",
      }),
    ],
    handler: (request, reply) => deleteMarketTemplate(request, reply, fastify),
  });
};