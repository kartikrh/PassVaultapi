const {
  getAllBlocksQuery,
  checkBlockByName,
  insertBlockQuery,
  getBlockByIdQuery,
  updateBlockQuery,
  validateBlockQuery,
  deleteBlockQuery,
} = require("../repository/TableBlock");

const allBlocksService = async (fastify) => {
  const result = await getAllBlocksQuery(fastify);
  return result;
};

const blockByIdService = async (request, fastify) => {
  const { blockId } = request.body;
  const result = await getBlockByIdQuery(blockId, fastify);
  if (result) delete result.id;
  return result || null;
};

const createBlockService = async (request, fastify) => {
  const validateByName = await checkBlockByName(request.body, fastify);

  if (validateByName) {
    throw new Error("Block with this name already exists");
  }

  return await insertBlockQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updateBlockService = async (request, fastify) => {
  const checkId = await getBlockByIdQuery(request.body.blockId, fastify);

  if (!checkId) {
    throw new Error("Block with this id not Found");
  }

  const validateByName = await checkBlockByName(
    {
      wrBlockId: checkId.id,
      blockName: request.body.blockName,
    },
    fastify,
    "update"
  );

  if (validateByName) {
    throw new Error("Block with this name already exists");
  }

  const updateBody = {
    blockName: request.body.blockName,
    isShowContent: request.body.isShowContent,
    content: request.body.content || checkId.content,
    controlId: request.body.controlId || checkId.controlId,
    blockId: checkId.id,
  };

  const result = await updateBlockQuery(updateBody, fastify);

  return { ...result, blockId: request.body.blockId };
};

const deleteBlockService = async (request, fastify) => {
  const encryptedIds = request.body.blockId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validateBlockQuery(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Block with name ${checkInValide.wrBlockName} associate in Menu Type, skiped from deletion`
      );
    }
  }

  for (const encryptedId of encryptedIds) {
    await deleteBlockQuery(encryptedId, fastify);
  }

  return "Block(s) deleted successfully";
};

module.exports = {
  allBlocksService,
  createBlockService,
  blockByIdService,
  updateBlockService,
  deleteBlockService,
};
