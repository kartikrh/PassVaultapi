const {
  insertMenuItemTypeQuery,
  updateMenuItemTypeQuery,
  validateMenuItemTypeQuery,
  deleteMenuItemTypeQuery,
} = require("../repository/TableMenuItemType");

const allMenuItemTypeService = async (fastify) => {
  return global.tblMenuItemTypes;
};

const menuItemTypeByIdService = async (request, fastify) => {
  const { menuItemTypeId } = request.body;
  const result = global.tblMenuItemTypes.find(
    (item) => item.menuItemTypeId === menuItemTypeId
  );
  return result || null;
};

const createMenuItemTypeService = async (request, fastify) => {
  const validateByName = global.tblMenuItemTypes.find(
    (item) => item.menuItemType === request.body.menuItemType
  );
  if (validateByName) {
    throw new Error("MenuItemType with this name is already exists");
  }
  const data = await insertMenuItemTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblMenuItemTypes.push(data);
  return data;
};

const updateMenuItemTypeService = async (request, fastify) => {
  const checkId = global.tblMenuItemTypes.find(
    (item) => item.menuItemTypeId === request.body.menuItemTypeId
  );

  if (!checkId) {
    throw new Error("Menu Item Type with this id not Found");
  }

  const body = {
    menuItemType: request.body.menuItemType || checkId.menuItemType,
    menuItemTypeId: request.body.menuItemTypeId,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  const validateByName = global.tblMenuItemTypes.find(
    (item) =>
      item.menuItemType.toLowerCase() === body.menuItemType.toLowerCase() &&
      item.menuItemTypeId !== body.menuItemTypeId
  );

  if (validateByName) {
    throw new Error("MenuItemType with this name is already exists");
  }

  const data = await updateMenuItemTypeQuery(body, fastify, request);

  const index = global.tblMenuItemTypes.findIndex(
    (item) => item.menuItemTypeId === request.body.menuItemTypeId
  );

  global.tblMenuItemTypes[index] = data;

  return data;
};

const deleteMenuItemTypeService = async (request, fastify) => {
  const encryptedIds = request.body.menuItemTypeId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validateMenuItemTypeQuery(
      encryptedId,
      fastify,
      request
    );

    if (checkInValide) {
      throw new Error(
        `Menu Item Type with name ${checkInValide.wrMenuItemtype} associate in Menu Items, skiped from deletion`
      );
    }
  }

  await deleteMenuItemTypeQuery(encryptedIds, fastify, request);

  global.tblMenuItemTypes = global.tblMenuItemTypes.filter(
    (item) => !encryptedIds.includes(item.menuItemTypeId)
  );

  return "Menu type(s) deleted successfully";
};

const saveMenuItemTypeService = async (request, fastify) => {
  const { menuItemTypeId } = request.body;

  if (menuItemTypeId === "0") {
    return await createMenuItemTypeService(request, fastify);
  } else {
    return await updateMenuItemTypeService(request, fastify);
  }
};

module.exports = {
  allMenuItemTypeService,
  menuItemTypeByIdService,
  saveMenuItemTypeService,
  deleteMenuItemTypeService,
};
