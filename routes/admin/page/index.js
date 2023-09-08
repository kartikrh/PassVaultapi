const { authorize } = require("../../../controller/middleware");
const {
  getAllPage,
  getPageById,
  deletePage,
  savePage,
} = require("../../../controller/users/admin/Page/page");

const { Page } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Page.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllPage(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Page.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPageById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Page.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => savePage(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Page.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePage(request, reply, fastify),
  });
};
