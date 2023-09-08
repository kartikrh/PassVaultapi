const { authorize } = require("../../../controller/middleware");
const {
  getAllMenuItemTypes,
  getMenuItemTypeById,
  saveMenuItemType,
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

  fastify.post("/save", {
    schema: MenuItemType.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveMenuItemType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuItemType.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteMenuItemType(request, reply, fastify),
  });
};
