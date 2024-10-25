const { ImportMarketService, MarketListService,ImportMarketWithRunnerService,listManualMarketService,updateTeamIdBySelectionIdService, getCompByEventTypeService } = require("../../../../services/ImportMarket.js");

const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/ImportMarket";

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

const importMarketwithRunnerController = async (request, reply, fastify) => {
  try {
    const result = await ImportMarketWithRunnerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/importMarketwithRunnerController",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const listManualMarket = async (request, reply, fastify) => {
  try {
    const result = await listManualMarketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/listManualMarket",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateTeamIdBySelectionId = async (request, reply, fastify) => {
  try {
    const result = await updateTeamIdBySelectionIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateTeamIdBySelectionId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const competitionList = async (request, reply, fastify) => {
  try {
    const result = await getCompByEventTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (error) {
    errorLogger(fastify, error.message, commonPath + "/competitionList", request);
    reply.status(200).send(error(error.message, ERROR_CODES.SERVER_ERROR, 200));
  }
}
module.exports = {
  importMarketController,
  marketListController,
  importMarketwithRunnerController,
  listManualMarket,
  updateTeamIdBySelectionId,
  competitionList
};
