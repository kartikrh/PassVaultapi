const { authorize } = require("../../../controller/middleware");
const {
  getAllPageFormats,
  getPageFormatById,
  deletePageFormat,
  savePageFormat,
} = require("../../../controller/users/admin/Page/pageFormate");

const { PageFormate } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PageFormate.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllPageFormats(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: PageFormate.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPageFormatById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: PageFormate.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => savePageFormat(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: PageFormate.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePageFormat(request, reply, fastify),
  });
};
