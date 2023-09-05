const {
  addPageFormatService,
  allPageFormatService,
  pageFormatServiceById,
  updatePageFormatService,
  deletePageFormatService,
} = require("../../../../services/pageFormate");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");

const getAllPageFormats = async (request, reply, fastify) => {
  try {
    const result = await allPageFormatService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPageFormatById = async (request, reply, fastify) => {
  try {
    const result = await pageFormatServiceById(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const createPageFormat = async (request, reply, fastify) => {
  try {
    const result = await addPageFormatService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updatePageFormat = async (request, reply, fastify) => {
  try {
    const result = await updatePageFormatService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePageFormat = async (request, reply, fastify) => {
  try {
    const result = await deletePageFormatService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPageFormats,
  getPageFormatById,
  createPageFormat,
  updatePageFormat,
  deletePageFormat,
};
