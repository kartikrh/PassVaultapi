const {
  deleteMenuTypeQuery,
  insertMenuTypeQuery,
  updatetMenuTypeQuery,
  validatMenuTypeQuery,
} = require("../repository/TableMenuTypes");

const { getBlockByIdQuery } = require("../repository/TableBlock");

const allMenuTypeService = async (fastify) => {
  return global.tblMenuTypes;
};

const menuTypeByIdService = async (request, fastify) => {
  const { menuTypeId } = request.body;
  const result = global.tblMenuTypes.find(
    (menuType) => menuType.menuTypeId === menuTypeId
  );
  return result || null;
};

const createMenuTypeService = async (request, fastify) => {
  const validateBlockId = global.tblBlocks.find(
    (block) => block.blockId === request.body.blockId
  );

  if (!validateBlockId) {
    throw new Error("Block not found for give id");
  }

  const validateByName = global.tblMenuTypes.find(
    (menuType) =>
      menuType.menuTypeName === request.body.menuTypeName &&
      menuType.blockId === request.body.blockId
  );

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  const data = await insertMenuTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );

  global.tblMenuTypes.push(data);

  return data;
};

const updateMenuTypeService = async (request, fastify) => {
  const checkId = global.tblMenuTypes.find(
    (menuType) => menuType.menuTypeId === request.body.menuTypeId
  );

  if (!checkId) {
    throw new Error("Menu Type with this id not Found");
  }

  const body = {
    menuTypeName: request.body.menuTypeName || checkId.menuTypeName,
    blockId: request.body.blockId || checkId.blockId,
    noOfLevel: request.body.noOfLevel || checkId.noOfLevel,
    menuTypeId: request.body.menuTypeId,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  if (request.body.blockId) {
    const validateBlockId = global.tblBlocks.find(
      (block) => block.blockId === request.body.blockId
    );
    if (!validateBlockId) {
      throw new Error("Block not found for give id");
    }
  }

  const validateByName = global.tblMenuTypes.find(
    (menuType) =>
      menuType.menuTypeName === body.menuTypeName &&
      menuType.blockId === body.blockId &&
      menuType.menuTypeId !== request.body.menuTypeId
  );

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  const result = await updatetMenuTypeQuery(body, fastify);

  const index = global.tblMenuTypes.findIndex(
    (menuType) => menuType.menuTypeId === request.body.menuTypeId
  );

  global.tblMenuTypes[index] = {
    ...result,
    blockId: body.blockId,
    menuTypeId: request.body.menuTypeId,
  };

  return {
    ...result,
    blockId: body.blockId,
    menuTypeId: request.body.menuTypeId,
  };
};

const deleteMenuTypeService = async (request, fastify) => {
  const encryptedIds = request.body.menuTypeId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validatMenuTypeQuery(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Menu Type with name ${checkInValide.wrBlockName} associate in Menu Items, skiped from deletion`
      );
    }
  }

  await deleteMenuTypeQuery(encryptedIds, fastify);

  global.tblMenuTypes = global.tblMenuTypes.filter(
    (menuType) => !encryptedIds.includes(menuType.menuTypeId)
  );

  return "Menu Item type(s) deleted successfully";
};

const saveMenuTypeService = async (request, fastify) => {
  const { menuTypeId } = request.body;

  if (menuTypeId === "0") {
    return await createMenuTypeService(request, fastify);
  } else {
    return await updateMenuTypeService(request, fastify);
  }
};

module.exports = {
  allMenuTypeService,
  menuTypeByIdService,
  saveMenuTypeService,
  deleteMenuTypeService,
};
