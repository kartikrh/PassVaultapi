const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { setupKeyService, recoverKeyService, rotateKeyService } = require("../../services/vaultKey");

const commonPath = "controller/vault/key";

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

module.exports = { setupKey, recoverKey, rotateKey };
