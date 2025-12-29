const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllMenuItems,
  getMenuItemById,
  saveMenuItem,
  deleteMenuItem,
  getMenuItemListByParent,
  getMenuTypeList,
  updateMenuItemStatus,
  getAllPageList,
  getAllMenuItemsData,
  changeDisplayOrder,
} = require("../../../controller/users/admin/menuItem");
const { allPageService } = require("../../../services/page");

const { MenuItem } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify) => {
  fastify.post("/all", {
    schema: MenuItem.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllMenuItems(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MenuItem.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMenuItemById(request, reply, fastify),
  });

  fastify.post("/getMenuItemByMenuType", {
    schema: MenuItem.getMenuItemByMenuType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllMenuItemsData(request, reply, fastify),
  })
  fastify.post("/menuItemList", {
    schema: MenuItem.menuItemList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMenuItemListByParent(request, reply, fastify),
  });

  fastify.post("/menuTypeList", {
    schema: MenuItem.menuTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getMenuTypeList(request, reply, fastify),
  });

  fastify.post("/pageList", {
    schema: MenuItem.pageList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPageList(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MenuItem.update.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: request.body.menuItemId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveMenuItem(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MenuItem.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteMenuItem(request, reply, fastify),
  });

  fastify.post("/activeInactiveMenuItem", {
    schema: MenuItem.activeInactiveMenuItem.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          // tabName: "Menu Items",
          tabName: "Menu Types",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateMenuItemStatus(request, reply, fastify),
  })

  fastify.post("/changeDisplayOrder", {
    schema : MenuItem.changeDispalyOrder.schema,
    preHandler : [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) => checkPermission(request, reply, fastify, {
        // tabName : "Menu Items",
        tabName : "Menu Types",
        mode : "edit"
      })
    ],
    handler : (request, reply) => changeDisplayOrder(request, reply, fastify)
  })

};
