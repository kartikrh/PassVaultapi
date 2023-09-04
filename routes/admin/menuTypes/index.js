const { authorize } = require("../../../controller/middleware");
const {
  createMenuType,
  deleteMenuType,
  getAllMenuTypes,
  getMenuTypeById,
  updateMenuType,
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

  fastify.post("/create", {
    schema: MenuType.create.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => createMenuType(request, reply, fastify),
  });
  fastify.post("/update", {
    schema: MenuType.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => updateMenuType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuType.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteMenuType(request, reply, fastify),
  });
};
