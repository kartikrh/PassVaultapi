const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  deleteCompetition,
  getAllCompetition,
  getCompetitionByeventTypeId,
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
          tabName: "competition",
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
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getCompetitionById(request, reply, fastify),
  });

  fastify.post("/byeventTypeId", {
    schema: Compitition.getByeventTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "view",
        }),
    ],
    handler: (request, reply) =>
      getCompetitionByeventTypeId(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Compitition.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
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
          tabName: "competition",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteCompetition(request, reply, fastify),
  });
  fastify.post("/changeDisplayOrder", {
    schema: Compitition.changeDispalyOrder.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "competition",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });
};
