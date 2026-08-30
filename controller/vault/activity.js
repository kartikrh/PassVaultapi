const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { getRecentActivityService } = require("../../services/vaultActivity");

const commonPath = "controller/vault/activity";

const getActivity = async (request, reply, fastify) => {
  try {
    const result = await getRecentActivityService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getActivity", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = { getActivity };
