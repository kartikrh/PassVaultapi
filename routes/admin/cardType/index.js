const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const { getAllCardType, cardTypeById, saveCardType, deleteCardType, activeInactiveCardType } = require("../../../controller/users/admin/cardType");
const { CardType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => getAllCardType(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: CardType.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => cardTypeById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: CardType.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => saveCardType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: CardType.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => deleteCardType(request, reply, fastify),
  });

  fastify.post("/activeInactive", {
    schema: CardType.activeInactiveApi.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => activeInactiveCardType(request, reply, fastify),
  });
};
