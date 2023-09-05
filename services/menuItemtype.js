const {
  checkMenuItemTypeByName,
  getAllMenuItemTypesQuery,
  insertMenuItemTypeQuery,
  menuItemTypeQueryById,
  updateMenuItemTypeQuery,
  validateMenuItemTypeQuery,
  deleteMenuItemTypeQuery,
} = require("../repository/TableMenuItemType");

const allMenuItemTypeService = async (fastify) => {
  return await getAllMenuItemTypesQuery(fastify);
};

const menuItemTypeByIdService = async (request, fastify) => {
  const { menuItemTypeId } = request.body;
  const result = await menuItemTypeQueryById(menuItemTypeId, fastify);
  if (result) delete result.id;
  return result || null;
};

const createMenuItemTypeService = async (request, fastify) => {
  const validateByName = await checkMenuItemTypeByName(request.body, fastify);
  if (validateByName) {
    throw new Error("MenuItemType with this name is already exists");
  }
  return await insertMenuItemTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updateMenuItemTypeService = async (request, fastify) => {
  const checkId = await menuItemTypeQueryById(
    request.body.menuItemTypeId,
    fastify
  );

  if (!checkId) {
    throw new Error("Menu Item Type with this id not Found");
  }

  const body = {
    menuItemType: request.body.menuItemType || checkId.menuItemType,
    menuItemTypeId: checkId.id,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  const validateByName = await checkMenuItemTypeByName(body, fastify, "update");
  if (validateByName) {
    throw new Error("MenuItemType with this name is already exists");
  }

  return await updateMenuItemTypeQuery(body, fastify);
};

const deleteMenuItemTypeService = async (request, fastify) => {
  const encryptedIds = request.body.menuItemTypeId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validateMenuItemTypeQuery(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Menu Item Type with name ${checkInValide.wrMenuItemtype} associate in Menu Items, skiped from deletion`
      );
    }
  }

  await deleteMenuItemTypeQuery(encryptedIds, fastify);

  return "Menu type(s) deleted successfully";
};

module.exports = {
  allMenuItemTypeService,
  createMenuItemTypeService,
  menuItemTypeByIdService,
  updateMenuItemTypeService,
  deleteMenuItemTypeService,
};
