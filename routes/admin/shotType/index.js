const { authorize } = require("../../../controller/middleware");
const {
  getAllShotTypes,
  getShotTypeById,
  saveShotType,
  deleteShotType,
  updateDisplayOrder,
  activeInactiveShotType,
} = require("../../../controller/users/admin/shotType");
const { ShotType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: ShotType.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllShotTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: ShotType.byId.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getShotTypeById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: ShotType.saveShotType.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveShotType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: ShotType.deleteShotType.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteShotType(request, reply, fastify),
  });

  fastify.post("/changeDisplayOrder", {
    schema: ShotType.updateDisplayOrder.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });

  fastify.post("/activeInactive", {
    schema: ShotType.updateIsActive.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => activeInactiveShotType(request, reply, fastify),
});
};
