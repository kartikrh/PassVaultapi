const {
  allBlocksService,
  blockByIdService,
  saveBlockService,
  deleteBlockService,
} = require("../../../../services/blocks");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/blocks/index.js";

const getAllBlocks = async (request, reply, fastify) => {
  try {
    const result = await allBlocksService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllBlocks", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getBlockById = async (request, reply, fastify) => {
  try {
    const result = await blockByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getBlockById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveBlock = async (request, reply, fastify) => {
  try {
    const result = await saveBlockService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveBlock", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteBlock = async (request, reply, fastify) => {
  try {
    const result = await deleteBlockService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteBlock", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllBlocks,
  getBlockById,
  saveBlock,
  deleteBlock,
};
