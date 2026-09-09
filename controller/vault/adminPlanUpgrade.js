const { ERROR_CODES, error, success } = require("../../utilities/index");
const { errorLogger } = require("../../utilities/logger");
const {
  getAllPlanUpgradeRequestsService,
  approvePlanUpgradeRequestService,
  rejectPlanUpgradeRequestService,
} = require("../../services/vaultPlanUpgrade");

const commonPath = "controller/vault/adminPlanUpgrade";

const getAllPlanUpgradeRequests = async (request, reply, fastify) => {
  try {
    const result = await getAllPlanUpgradeRequestsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllPlanUpgradeRequests", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const approvePlanUpgradeRequest = async (request, reply, fastify) => {
  try {
    const result = await approvePlanUpgradeRequestService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/approvePlanUpgradeRequest", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

const rejectPlanUpgradeRequest = async (request, reply, fastify) => {
  try {
    const result = await rejectPlanUpgradeRequestService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/rejectPlanUpgradeRequest", request);
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_INPUT, 200));
  }
};

module.exports = { getAllPlanUpgradeRequests, approvePlanUpgradeRequest, rejectPlanUpgradeRequest };
