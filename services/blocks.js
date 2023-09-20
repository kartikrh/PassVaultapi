const {
  insertBlockQuery,
  updateBlockQuery,
  validateBlockQuery,
  deleteBlockQuery,
} = require("../repository/TableBlock");

const allBlocksService = async (fastify) => {
  return global.tblBlocks;
};

const blockByIdService = async (request, fastify) => {
  const { blockId } = request.body;
  const result = global.tblBlocks.find((block) => block.blockId === blockId);
  return result || null;
};

const createBlockService = async (request, fastify) => {
  const validateByName = global.tblBlocks.find(
    (block) =>
      block.blockName.toLowerCase() === request.body.blockName.toLowerCase()
  );

  if (validateByName) {
    throw new Error("Block with this name already exists");
  }

  const data = await insertBlockQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblBlocks.push(data);
  return data;
};

const updateBlockService = async (request, fastify) => {
  const checkId = global.tblBlocks.find(
    (block) => block.blockId === request.body.blockId
  );

  if (!checkId) {
    throw new Error("Block with this id not Found");
  }

  const validateByName = global.tblBlocks.find(
    (block) =>
      block.blockName.toLowerCase() === request.body.blockName.toLowerCase() &&
      block.blockId !== request.body.blockId
  );

  if (validateByName) {
    throw new Error("Block with this name already exists");
  }

  const updateBody = {
    blockName: request.body.blockName,
    isShowContent: request.body.isShowContent,
    content: request.body.content || checkId.content,
    controlId: request.body.controlId || checkId.controlId,
    blockId: request.body.blockId,
  };

  const result = await updateBlockQuery(updateBody, fastify, request);

  const index = global.tblBlocks.findIndex(
    (block) => block.blockId === request.body.blockId
  );

  global.tblBlocks[index] = { ...result, blockId: request.body.blockId };

  return { ...result, blockId: request.body.blockId };
};

const deleteBlockService = async (request, fastify) => {
  const encryptedIds = request.body.blockId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validateBlockQuery(
      encryptedId,
      fastify,
      request
    );

    if (checkInValide) {
      throw new Error(
        `Block with name ${checkInValide.wrBlockName} associate in Menu Type, skiped from deletion`
      );
    }
  }

  await deleteBlockQuery(encryptedIds, fastify, request);

  global.tblBlocks = global.tblBlocks.filter(
    (block) => !encryptedIds.includes(block.blockId)
  );

  return "Block(s) deleted successfully";
};

const saveBlockService = async (request, fastify) => {
  const { blockId } = request.body;
  if (blockId === "0") {
    return await createBlockService(request, fastify);
  } else {
    return await updateBlockService(request, fastify);
  }
};

module.exports = {
  allBlocksService,
  saveBlockService,
  blockByIdService,
  deleteBlockService,
};
