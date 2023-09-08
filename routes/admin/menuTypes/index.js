const { authorize } = require("../../../controller/middleware");
const {
  deleteMenuType,
  getAllMenuTypes,
  getMenuTypeById,
  saveMenuType,
} = require("../../../controller/users/admin/menuType");
const { MenuType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: MenuType.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllMenuTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MenuType.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getMenuTypeById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MenuType.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveMenuType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuType.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteMenuType(request, reply, fastify),
  });
};
