const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  deleteCompetition,
  getAllCompetition,
  getCompetitionById,
  saveCompetition,
  updateDisplayOrder,
} = require("../../../controller/users/admin/competition");
const { Compitition } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Compitition.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Compitition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllCompetition(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Compitition.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Compitition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCompetitionById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Compitition.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Compitition",
          mode: request.body.competitionId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveCompetition(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Compitition.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Compitition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCompetition(request, reply, fastify),
  });
};
