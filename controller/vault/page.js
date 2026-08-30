const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { publicPagesService } = require("../../services/page");

const commonPath = "controller/vault/page";

// Public, unauthenticated -- called before a client is signed in, on the
// same origin as the app itself. Only ever returns the whitelisted subset
// built in services/page.js/publicPagesService.
const getPublicPages = async (request, reply, fastify) => {
  try {
    const result = await publicPagesService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getPublicPages", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = { getPublicPages };
