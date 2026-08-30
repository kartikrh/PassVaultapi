const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { publicWhitelabelsService } = require("../../services/whitelabel");

const commonPath = "controller/vault/whitelabel";

// Public, unauthenticated -- called before a client is signed in, on the
// same origin as the app itself. Only ever returns the whitelisted subset
// built in services/whitelabel.js/publicWhitelabelsService.
const getPublicWhitelabel = async (request, reply, fastify) => {
  try {
    const result = await publicWhitelabelsService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPublicWhitelabel", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = { getPublicWhitelabel };
