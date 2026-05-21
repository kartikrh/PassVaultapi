const {
  insertBlockQuery,
  updateBlockQuery,
  validateBlockQuery,
  deleteBlockQuery,
} = require("../repository/TableBlock");
const { callClientAPI, APIEndpointModuleType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const allBlocksService = async (request, fastify) => {
  // return global.tblBlocks;
  const { isShowContent } = request.body;
  if (isShowContent === undefined) {
    return global.tblBlocks;
  } else {
    const result = global.tblBlocks.filter((block) => block.isShowContent === isShowContent);
    return result;
  }
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

  const validatecontainerId = global.tblBlocks.find(
    (block) => block.containerId === request.body.containerId
  );
  
  if (validatecontainerId) {
    throw new Error("Block with this containerId already exists");
  }

  const data = await insertBlockQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );




  global.tblBlocks.push(data);

  if(data.isShowContent){
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module : "blocks",
        type : "add",
        data : data	
      }
    },
    request,
    fastify,
    "services/blocks.js/createBlockService"
  );
  }
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

  const validatecontainerId = global.tblBlocks.find(
    (block) =>
      block.containerId.toLowerCase() === request.body.containerId.toLowerCase() &&
      block.blockId !== request.body.blockId
  );
  if (validatecontainerId) {
    throw new Error("Block with this containerId already exists");
  }

  const updateBody = {
    blockName: request.body.blockName,
    isShowContent: request.body.hasOwnProperty("isShowContent")
      ? request.body.isShowContent
      : checkId.isShowContent,
    content: request.body.content || checkId.content,
    containerId: request.body.containerId || checkId.containerId,
    blockId: request.body.blockId,
  };

  const result = await updateBlockQuery(updateBody, fastify, request);

  const index = global.tblBlocks.findIndex(
    (block) => block.blockId === request.body.blockId
  );

  global.tblBlocks[index] = { ...result, blockId: request.body.blockId };

    await callClientAPI(
      {
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module : "blocks",
          type : "update",
          data : global.tblBlocks[index]	
        }
      },
      request,
      fastify,
      "services/blocks.js/updateBlockService"
    );
  
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
  
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module : "blocks",
        type : "delete",
        data : {
          blockId : request.body.blockId,
        }	
      }
    },
    request,
    fastify,
    "services/blocks.js/deleteBlockService"
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
