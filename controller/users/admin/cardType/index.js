const { allCardTypeService, cardTypeByIdService, createCardTypeService, deleteCardTypeService, activeInactiveCardTypeService } = require("../../../../services/cardType");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/cardType/index.js";

const getAllCardType = async (request, reply, fastify) => {
  try {
    const result = await allCardTypeService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllCardType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const cardTypeById = async (request, reply, fastify) => {
  try {
    const result = await cardTypeByIdService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/cardTypeById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveCardType = async (request, reply, fastify) => {
  try {
    const result = await createCardTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveCardType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteCardType = async (request, reply, fastify) => {
  try {
    const result = await deleteCardTypeService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteCardType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveCardType = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveCardTypeService(fastify, request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveCardType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getAllCardType,
    cardTypeById,
    saveCardType,
    deleteCardType,
    activeInactiveCardType,
};