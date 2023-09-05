const { authorize } = require("../../../controller/middleware");
const {
  createPageFormat,
  getAllPageFormats,
  getPageFormatById,
  updatePageFormat,
  deletePageFormat,
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

  fastify.post("/create", {
    schema: PageFormate.create.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => createPageFormat(request, reply, fastify),
  });
  fastify.post("/update", {
    schema: PageFormate.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => updatePageFormat(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: PageFormate.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePageFormat(request, reply, fastify),
  });
};
