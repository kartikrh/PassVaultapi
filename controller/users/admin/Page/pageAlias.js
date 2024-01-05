const {
  allPageAliasService,
  pageAliasByIdService,
  savePageAliasService,
  deletePageAliasService,
} = require("../../../../services/pageAlias");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/Page/pageAlias.js";

const getAllPageAlias = async (request, reply, fastify) => {
  try {
    const result = await allPageAliasService(fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPageAlias", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPageAliasById = async (request, reply, fastify) => {
  try {
    const result = await pageAliasByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPageAliasById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const savePageAlias = async (request, reply, fastify) => {
  try {
    const result = await savePageAliasService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/savePageAlias", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deletePageAlias = async (request, reply, fastify) => {
  try {
    const result = await deletePageAliasService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deletePageAlias", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllPageAlias,
  getPageAliasById,
  savePageAlias,
  deletePageAlias,
};
