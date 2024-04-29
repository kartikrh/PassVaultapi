const { authorize } = require("../../../controller/middleware");
const {
  importMarketController,
  ListEventTypesAPIcontroller,
  marketListController,
} = require("../../../controller/users/admin/manualEvent/index");
const { ImportMarket } = require("../../../swaggerSchema/groupTags/schema");
const configConstants = require("../../../utilities/configConstants");

module.exports = async function (fastify, opts) {
  fastify.post("/importEvent", {
    schema: ImportMarket.setMarket.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      importMarketController(request, reply, fastify),
  });

  fastify.post("/marketList", {
    schema: ImportMarket.getMarket.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      marketListController(request, reply, fastify),
  });
};
