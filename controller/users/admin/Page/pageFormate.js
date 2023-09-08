const {
  allPageFormatService,
  pageFormatServiceById,
  savePageFormatService,
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

const savePageFormat = async (request, reply, fastify) => {
  try {
    const result = await savePageFormatService(request, fastify);
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
  savePageFormat,
  deletePageFormat,
};
