const { authorize } = require("../../../controller/middleware");
const {
  getAllBlocks,
  getBlockById,
  saveBlock,
  deleteBlock,
} = require("../../../controller/users/admin/blocks");
const { Block } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Block.getBlocks.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllBlocks(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Block.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getBlockById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Block.saveBlock.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveBlock(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Block.deleteBlock.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteBlock(request, reply, fastify),
  });
};
