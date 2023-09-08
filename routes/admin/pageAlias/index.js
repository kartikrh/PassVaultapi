const { authorize } = require("../../../controller/middleware");
const {
  getAllPageAlias,
  getPageAliasById,
  savePageAlias,
  deletePageAlias,
} = require("../../../controller/users/admin/Page/pageAlias");

const { PageAlias } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PageAlias.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllPageAlias(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: PageAlias.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPageAliasById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: PageAlias.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => savePageAlias(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: PageAlias.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePageAlias(request, reply, fastify),
  });
};
