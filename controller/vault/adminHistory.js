const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const { listHistoryAdminService } = require("../../services/adminVaultHistory");

const commonPath = "controller/vault/adminHistory";

const getAllHistory = async (request, reply, fastify) => {
  try {
    const result = await listHistoryAdminService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllHistory", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = { getAllHistory };
