const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
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
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Blocks",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllBlocks(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Block.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Blocks",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getBlockById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Block.saveBlock.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Blocks",
          mode: request.body.blockId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveBlock(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Block.deleteBlock.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Blocks",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteBlock(request, reply, fastify),
  });
};
