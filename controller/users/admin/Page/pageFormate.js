const {
  allPageFormatService,
  pageFormatServiceById,
  savePageFormatService,
  deletePageFormatService,
} = require("../../../../services/pageFormate");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/Page/pageFormate.js";

const getAllPageFormats = async (request, reply, fastify) => {
  try {
    const result = await allPageFormatService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPageFormats",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPageFormatById = async (request, reply, fastify) => {
  try {
    const result = await pageFormatServiceById(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPageFormatById",
      request
    );

    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const savePageFormat = async (request, reply, fastify) => {
  try {
    const result = await savePageFormatService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePageFormat", request);

    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deletePageFormat = async (request, reply, fastify) => {
  try {
    const result = await deletePageFormatService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletePageFormat",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPageFormats,
  getPageFormatById,
  savePageFormat,
  deletePageFormat,
};
