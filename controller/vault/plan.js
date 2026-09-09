const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const {
  getAvailablePlansService,
  getDefaultPaymentMethodService,
  requestPlanUpgradeService,
  getMyPlanUpgradeRequestService,
} = require("../../services/vaultPlanUpgrade");

const commonPath = "controller/vault/plan";

const getAvailablePlans = async (request, reply, fastify) => {
  try {
    const result = await getAvailablePlansService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAvailablePlans", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getDefaultPaymentMethod = async (request, reply, fastify) => {
  try {
    const result = await getDefaultPaymentMethodService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getDefaultPaymentMethod", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const requestPlanUpgrade = async (request, reply, fastify) => {
  try {
    const result = await requestPlanUpgradeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/requestPlanUpgrade", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const myPlanUpgradeRequest = async (request, reply, fastify) => {
  try {
    const result = await getMyPlanUpgradeRequestService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/myPlanUpgradeRequest", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = { getAvailablePlans, getDefaultPaymentMethod, requestPlanUpgrade, myPlanUpgradeRequest };
