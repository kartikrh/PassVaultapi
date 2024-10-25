const { authorize } = require("../../../controller/middleware");
const {
  importMarketController,
  ListEventTypesAPIcontroller,
  marketListController,
  importMarketwithRunnerController,
  listManualMarket,
  updateTeamIdBySelectionId,
  competitionList
} = require("../../../controller/users/admin/ImportMarket/index");
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

  fastify.post("/importEventWithMarket", {
    schema: ImportMarket.setMarketDetails.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      importMarketwithRunnerController(request, reply, fastify),
  });

  fastify.post("/getlistManualMarket", {
    schema: ImportMarket.getMarket.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      listManualMarket(request, reply, fastify),
  });

  fastify.post("/updateTeamId", {
    schema: ImportMarket.updateTeamIdForSelectionId.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) =>
      updateTeamIdBySelectionId(request, reply, fastify),
  });
  fastify.post("/competitionList", {
    schema: ImportMarket.competitionList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) =>
      competitionList(request, reply, fastify)
  });
};
