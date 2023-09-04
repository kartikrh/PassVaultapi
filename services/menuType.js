const {
  checkMenuTypeByName,
  deleteMenuTypeQuery,
  getAllMenuItemsQuery,
  getMenuTypeByIdQuery,
  insertMenuTypeQuery,
  updatetMenuTypeQuery,
  validatMenuTypeQuery,
} = require("../repository/TableMenuTypes");

const { getBlockByIdQuery } = require("../repository/TableBlock");

const allMenuTypeService = async (fastify) => {
  return await getAllMenuItemsQuery(fastify);
};

const menuTypeByIdService = async (request, fastify) => {
  const { menuTypeId } = request.body;
  const result = await getMenuTypeByIdQuery(menuTypeId, fastify);
  if (result) delete result.id;
  return result || null;
};

const createMenuTypeService = async (request, fastify) => {
  const validateBlockId = await getBlockByIdQuery(
    request.body.blockId,
    fastify
  );

  if (!validateBlockId) {
    throw new Error("Block not found for give id");
  }

  const validateByName = await checkMenuTypeByName(request.body, fastify);

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  return await insertMenuTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updateMenuTypeService = async (request, fastify) => {
  const checkId = await getMenuTypeByIdQuery(request.body.menuTypeId, fastify);

  if (!checkId) {
    throw new Error("Menu Type with this id not Found");
  }

  const body = {
    menuTypeName: request.body.menuTypeName || checkId.menuTypeName,
    blockId: request.body.blockId || checkId.blockId,
    noOfLevel: request.body.noOfLevel || checkId.noOfLevel,
    menuTypeId: checkId.id,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  if (request.body.blockId) {
    const validateBlockId = await getBlockByIdQuery(
      request.body.blockId,
      fastify
    );

    if (!validateBlockId) {
      throw new Error("Block not found for give id");
    }
  }

  const validateByName = await checkMenuTypeByName(body, fastify, "update");

  if (validateByName) {
    throw new Error("MenuType with this name is already exists in this Block");
  }

  const result = await updatetMenuTypeQuery(body, fastify);

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

  return "Menu type(s) deleted successfully";
};

module.exports = {
  allMenuTypeService,
  menuTypeByIdService,
  createMenuTypeService,
  updateMenuTypeService,
  deleteMenuTypeService,
};
