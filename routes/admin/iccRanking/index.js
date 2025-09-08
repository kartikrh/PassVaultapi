const { checkPermission, authorize } = require("../../../controller/middleware");
const { getAllICCRanking, getICCRankingById, saveICCRanking, deleteICCRankingById } = require("../../../controller/users/admin/iccRanking");
const { ICCRanking } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: ICCRanking.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "iccRanking",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllICCRanking(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: ICCRanking.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "iccRanking",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getICCRankingById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: ICCRanking.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "iccRanking",
          mode: request.body.id === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveICCRanking(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: ICCRanking.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "iccRanking",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteICCRankingById(request, reply, fastify),
  });
};