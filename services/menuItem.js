const {
  allMenuItemsQuery,
  menuItemByIdQuery,
  createMenuItemQuery,
  updateMenuItemQuery,
  validateMenuItemQuery,
  deleteMenuItemQuery,
  findMenuItemByParentId,
} = require("../repository/TableMenuItem");
const { menuItemTypeQueryById } = require("../repository/TableMenuItemType");
const { getMenuTypeByIdQuery } = require("../repository/TableMenuTypes");
const { pageByIdQuery } = require("../repository/TablePage");

const allMenuItemService = async (fastify) => {
  return global.tblMenuItems;
};

const menuItemByIdService = async (request, fastify) => {
  const { menuItemId } = request.body;
  const result = global.tblMenuItems.find(
    (item) => item.menuItemId === menuItemId
  );
  return result || null;
};

const createMenuItemService = async (request, fastify) => {
  const validateMenuTypeId = global.tblMenuTypes.find(
    (item) => item.menuTypeId === request.body.menuTypeId
  );
  if (!validateMenuTypeId) {
    throw new Error("Menu Type not found for give id");
  }

  const validatePageId = global.tblPages.find(
    (item) => item.pageId === request.body.pageId
  );
  if (!validatePageId) {
    throw new Error("Page not found for give id");
  }

  const validateMenuItemTypeId = global.tblMenuItemTypes.find(
    (item) => item.menuItemTypeId === request.body.menuItemTypeId
  );

  if (!validateMenuItemTypeId) {
    throw new Error("Menu Item Type not found for give id");
  }

  const data = await createMenuItemQuery(
    {
      ...request.body,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify
  );

  global.tblMenuItems.push(data);
  return data;
};

const updateMenuItemService = async (request, fastify) => {
  const validateMenuItemId = global.tblMenuItems.find(
    (item) => item.menuItemId === request.body.menuItemId
  );
  if (!validateMenuItemId) {
    throw new Error("Menu Item not found for give id");
  }

  const body = {
    menuItemId: validateMenuItemId.menuItemId,
    menuItem: request.body.menuItem || validateMenuItemId.menuItem,
    userId: request.userTokenInfo.WrUserId,
    menuTypeId: validateMenuItemId.menuTypeId,
    pageId: validateMenuItemId.pageId,
    menuItemTypeId: validateMenuItemId.menuItemTypeId,
    parentId: validateMenuItemId.parentId || "0",
    isActive: validateMenuItemId.isActive,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  }

  if (request.body.menuTypeId) {
    const validateMenuTypeId = global.tblMenuTypes.find(
      (item) => item.menuTypeId === request.body.menuTypeId
    );
    if (!validateMenuTypeId) {
      throw new Error("Menu Type not found for give id");
    } else {
      body.menuTypeId = validateMenuTypeId.menuTypeId;
    }
  }

  if (request.body.pageId) {
    const validatePageId = global.tblPages.find(
      (item) => item.pageId === request.body.pageId
    );
    if (!validatePageId) {
      throw new Error("Page not found for give id");
    } else {
      body.pageId = validatePageId.pageId;
    }
  }

  if (request.body.menuItemTypeId) {
    const validateMenuItemTypeId = global.tblMenuItemTypes.find(
      (item) => item.menuItemTypeId === request.body.menuItemTypeId
    );

    if (!validateMenuItemTypeId) {
      throw new Error("Menu Item Type not found for give id");
    } else {
      body.menuItemTypeId = validateMenuItemTypeId.menuItemTypeId;
    }
  }

  if (request.body.parentId && request.body.parentId !== "0") {
    const validateParentId = await menuItemByIdQuery(
      request.body.parentId,
      fastify
    );
    if (!validateParentId) {
      throw new Error("Parent Menu Item not found for give id");
    } else {
      body.parentId = validateParentId.menuItemId;
    }
  }

  if (request.body.parentId == "0") {
    body.parentId = "0";
  }

  await updateMenuItemQuery(body, fastify);

  const index = global.tblMenuItems.findIndex(
    (item) => item.menuItemId === request.body.menuItemId
  );

  global.tblMenuItems[index] = { ...body, userId: undefined };

  return `Menu Item updated successfully`;
};

const deleteMenuItemService = async (request, fastify) => {
  const encryptedIds = request.body.menuItemId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validateMenuItemQuery(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Menu Item with name ${checkInValide.wrMenuItem} associate in Page Alias, skiped from deletion`
      );
    }

    const checkChild = await findMenuItemByParentId(encryptedId, fastify);

    if (checkChild) {
      throw new Error(
        `Menu Item with name ${checkInValide.wrMenuItem} associate in other Menu Item, skiped from deletion`
      );
    }
  }

  await deleteMenuItemQuery(encryptedIds, fastify);

  global.tblMenuItems = global.tblMenuItems.filter(
    (item) => !encryptedIds.includes(item.menuItemId)
  );

  return "Menu item(s) deleted successfully";
};

const saveMenuItemService = async (request, fastify) => {
  const { menuItemId } = request.body;

  if (menuItemId === "0") {
    return await createMenuItemService(request, fastify);
  } else {
    return await updateMenuItemService(request, fastify);
  }
};

module.exports = {
  allMenuItemService,
  menuItemByIdService,
  saveMenuItemService,
  deleteMenuItemService,
};
