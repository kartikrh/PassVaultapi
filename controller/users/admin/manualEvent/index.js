const { ImportMarketService, MarketListService } = require("../../../../services/manualEvent");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

const importMarketController = async (request, reply, fastify) => {
  try {
    const result = await ImportMarketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/importMarketController",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const marketListController = async (request, reply, fastify) => {
  try {
    const result = await MarketListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/marketListController",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  importMarketController,
  marketListController,
};
