const {
  addPageAliasService,
  allPageAliasService,
  pageAliasByIdService,
  updatePageAliasService,
  deletePageAliasService,
} = require("../../../../services/pageAlias");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllPageAlias = async (request, reply, fastify) => {
  try {
    const result = await allPageAliasService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPageAliasById = async (request, reply, fastify) => {
  try {
    const result = await pageAliasByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createPageAlias = async (request, reply, fastify) => {
  try {
    const result = await addPageAliasService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const updatePageAlias = async (request, reply, fastify) => {
  try {
    const result = await updatePageAliasService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deletePageAlias = async (request, reply, fastify) => {
  try {
    const result = await deletePageAliasService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPageAlias,
  getPageAliasById,
  createPageAlias,
  updatePageAlias,
  deletePageAlias,
};
