const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  deleteMenuType,
  getAllMenuTypes,
  getMenuTypeById,
  saveMenuType,
  getBlockList
} = require("../../../controller/users/admin/menuType");
const { MenuType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: MenuType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllMenuTypes(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MenuType.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMenuTypeById(request, reply, fastify),
  });

  fastify.post("/blockList", {
    schema: MenuType.blockList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getBlockList(request, reply, fastify),
  })


  fastify.post("/save", {
    schema: MenuType.update.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Menu Types",
          mode: request.body.menuTypeId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveMenuType(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuType.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Menu Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteMenuType(request, reply, fastify),
  });
};
