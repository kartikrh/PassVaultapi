const { authorize } = require("../../../controller/middleware");
const {
  getAllMenuItems,
  getMenuItemById,
  saveMenuItem,
  deleteMenuItem,
} = require("../../../controller/users/admin/menuItem");

const { MenuItem } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify) => {
  fastify.post("/all", {
    schema: MenuItem.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllMenuItems(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MenuItem.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getMenuItemById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MenuItem.update.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => saveMenuItem(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuItem.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deleteMenuItem(request, reply, fastify),
  });
};
