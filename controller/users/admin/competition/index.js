const {
  allCompetitionService,
  competitionByIdService,
  saveCompetitionService,
  deleteCompetitionService,
  updateDisplayOrderService,
  competitionByeventTypeIdService,
} = require("../../../../services/competition");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/competition/index";

const getAllCompetition = async (request, reply, fastify) => {
  try {
    const result = await allCompetitionService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCompetition", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getCompetitionById = async (request, reply, fastify) => {
  try {
    const result = await competitionByIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCompetitionById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getCompetitionByeventTypeId = async (request, reply, fastify) => {
  try {
    const result = await competitionByeventTypeIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCompetitionByeventTypeId",
      request
    );
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const saveCompetition = async (request, reply, fastify) => {
  try {
    const result = await saveCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveCompetition", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const deleteCompetition = async (request, reply, fastify) => {
  try {
    const result = await deleteCompetitionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteCompetition", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const updateDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await updateDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateDisplayOrder", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllCompetition,
  getCompetitionById,
  saveCompetition,
  deleteCompetition,
  updateDisplayOrder,
  getCompetitionByeventTypeId,
};
