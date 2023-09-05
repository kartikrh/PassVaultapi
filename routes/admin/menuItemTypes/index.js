const { authorize } = require("../../../controller/middleware");
const {
  createMenuItemType,
  getAllMenuItemTypes,
  getMenuItemTypeById,
  updateMenuItemType,
  deleteMenuItemType,
} = require("../../../controller/users/admin/menuItemType");

const { MenuItemType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify) => {
  fastify.post("/all", {
    schema: MenuItemType.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllMenuItemTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MenuItemType.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getMenuItemTypeById(request, reply, fastify),
  });

  fastify.post("/create", {
    schema: MenuItemType.create.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => createMenuItemType(request, reply, fastify),
  });

  fastify.post("/update", {
    schema: MenuItemType.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => updateMenuItemType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuItemType.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteMenuItemType(request, reply, fastify),
  });
};
