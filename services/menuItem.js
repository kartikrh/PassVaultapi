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
  return await allMenuItemsQuery(fastify);
};

const menuItemByIdService = async (request, fastify) => {
  const { menuItemId } = request.body;
  const result = await menuItemByIdQuery(menuItemId, fastify);
  if (result) {
    delete result.id;
    delete result.pId;
  }
  return result || null;
};

const createMenuItemService = async (request, fastify) => {
  const validateMenuTypeId = await getMenuTypeByIdQuery(
    request.body.menuTypeId,
    fastify
  );
  if (!validateMenuTypeId) {
    throw new Error("Menu Type not found for give id");
  }

  const validatePageId = await pageByIdQuery(request.body.pageId, fastify);
  if (!validatePageId) {
    throw new Error("Page not found for give id");
  }

  const validateMenuItemTypeId = await menuItemTypeQueryById(
    request.body.menuItemTypeId,
    fastify
  );

  if (!validateMenuItemTypeId) {
    throw new Error("Menu Item Type not found for give id");
  }

  return await createMenuItemQuery(
    {
      ...request.body,
      userId: request.userTokenInfo.WrUserId,
      menuTypeId: validateMenuTypeId.id,
      pageId: validatePageId.id,
      menuItemTypeId: validateMenuItemTypeId.id,
    },
    fastify
  );
};

const updateMenuItemService = async (request, fastify) => {
  const validateMenuItemId = await menuItemByIdQuery(
    request.body.menuItemId,
    fastify
  );
  if (!validateMenuItemId) {
    throw new Error("Menu Item not found for give id");
  }

  const body = {
    menuItemId: validateMenuItemId.id,
    menuItem: request.body.menuItem || validateMenuItemId.menuItem,
    userId: request.userTokenInfo.WrUserId,
    menuTypeId: validateMenuItemId.menuTypeId,
    pageId: validateMenuItemId.pageId,
    menuItemTypeId: validateMenuItemId.menuItemTypeId,
    parentId: validateMenuItemId.pId || "0",
    isActive: validateMenuItemId.isActive,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  }

  if (request.body.menuTypeId) {
    const validateMenuTypeId = await getMenuTypeByIdQuery(
      request.body.menuTypeId,
      fastify
    );
    if (!validateMenuTypeId) {
      throw new Error("Menu Type not found for give id");
    } else {
      body.menuTypeId = validateMenuTypeId.menuTypeId;
    }
  }

  if (request.body.pageId) {
    const validatePageId = await pageByIdQuery(request.body.pageId, fastify);
    if (!validatePageId) {
      throw new Error("Page not found for give id");
    } else {
      body.pageId = validatePageId.pageId;
    }
  }

  if (request.body.menuItemTypeId) {
    const validateMenuItemTypeId = await menuItemTypeQueryById(
      request.body.menuItemTypeId,
      fastify
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
      body.parentId = validateParentId.id;
    }
  }

  if (request.body.parentId == "0") {
    body.parentId = "0";
  }

  await updateMenuItemQuery(body, fastify);

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

  return "Menu item(s) deleted successfully";
};

module.exports = {
  allMenuItemService,
  menuItemByIdService,
  createMenuItemService,
  updateMenuItemService,
  deleteMenuItemService,
};
