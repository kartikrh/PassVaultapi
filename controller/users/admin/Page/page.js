const {
  addPageService,
  allPageService,
  pageByIdService,
  updatePageService,
  deletePageService,
} = require("../../../../services/page");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllPage = async (request, reply, fastify) => {
  try {
    const result = await allPageService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPageById = async (request, reply, fastify) => {
  try {
    const result = await pageByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createPage = async (request, reply, fastify) => {
  try {
    const result = await addPageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updatePage = async (request, reply, fastify) => {
  try {
    const result = await updatePageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePage = async (request, reply, fastify) => {
  try {
    const result = await deletePageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPage,
  getPageById,
  createPage,
  updatePage,
  deletePage,
};
