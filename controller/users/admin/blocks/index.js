const {
  allBlocksService,
  createBlockService,
  blockByIdService,
  updateBlockService,
  deleteBlockService,
} = require("../../../../services/blocks");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllBlocks = async (request, reply, fastify) => {
  try {
    const result = await allBlocksService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getBlockById = async (request, reply, fastify) => {
  try {
    const result = await blockByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createBlock = async (request, reply, fastify) => {
  try {
    const result = await createBlockService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updateBlock = async (request, reply, fastify) => {
  try {
    const result = await updateBlockService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteBlock = async (request, reply, fastify) => {
  try {
    const result = await deleteBlockService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllBlocks,
  createBlock,
  getBlockById,
  updateBlock,
  deleteBlock,
};
