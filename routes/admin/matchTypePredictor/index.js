const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  savePredictorData,
  getAllPredictorData,
  getPredictorByMatchTypeId,
  deletePredictorByMatchType,
  deletePredictor,
  getPredictorById
} = require("../../../controller/users/admin/matchTypePredictor");
const {
  MatchTypePredictor,
} = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify) => {
  fastify.post("/all", {
    schema: MatchTypePredictor.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPredictorData(request, reply, fastify),
  });
  fastify.post("/getById", {
    schema: MatchTypePredictor.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPredictorById(request, reply, fastify),
  });
  fastify.post("/getByMatchTypeId", {
    schema: MatchTypePredictor.getByMatchTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getPredictorByMatchTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: MatchTypePredictor.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "add",
        }),
    ],
    handler: (request, reply) => savePredictorData(request, reply, fastify),
  });
  fastify.post("/deleteByMatchTypeId", {
    schema: MatchTypePredictor.deleteByMatchTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) =>
      deletePredictorByMatchType(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: MatchTypePredictor.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Match Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deletePredictor(request, reply, fastify),
  });
};
