const {
  allPageService,
  pageByIdService,
  deletePageService,
  savePageService,
} = require("../../../../services/page");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/page/index";

const getAllPage = async (request, reply, fastify) => {
  try {
    const result = await allPageService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPage", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getPageById = async (request, reply, fastify) => {
  try {
    const result = await pageByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPageById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const savePage = async (request, reply, fastify) => {
  try {
    const result = await savePageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePage", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deletePage = async (request, reply, fastify) => {
  try {
    const result = await deletePageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deletePage", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllPage,
  getPageById,
  savePage,
  deletePage,
};
