const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const {
  getKeyParamsService,
  setupKeyService,
  migrateKeyService,
  recoverKeyService,
  rotateKeyService,
} = require("../../services/vaultKey");

const commonPath = "controller/vault/key";

const getKeyParams = async (request, reply, fastify) => {
  try {
    const result = await getKeyParamsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getKeyParams", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const migrateKey = async (request, reply, fastify) => {
  try {
    const result = await migrateKeyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/migrateKey", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const setupKey = async (request, reply, fastify) => {
  try {
    const result = await setupKeyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/setupKey", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const recoverKey = async (request, reply, fastify) => {
  try {
    const result = await recoverKeyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/recoverKey", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const rotateKey = async (request, reply, fastify) => {
  try {
    const result = await rotateKeyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/rotateKey", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

module.exports = { getKeyParams, setupKey, migrateKey, recoverKey, rotateKey };
