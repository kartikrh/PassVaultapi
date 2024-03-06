const { savePredictorDataService ,
  getAllPredictorDataService,
  getPredictorByMatchTypeIdService,
  deletePredictorByMatchTypeService,
  deletePredictorService,
  getPredictorByIdService} = require("../../../../services/matchTypePredictor");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/matchTypePredictor/index.js";

const savePredictorData = async (request, reply, fastify) => {
  try {
    const result = await savePredictorDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savePredictorData",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllPredictorData = async (request, reply, fastify) => {
  try {
    const result = await getAllPredictorDataService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPredictorData",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPredictorById = async (request, reply, fastify) => {
  try {
    const result = await getPredictorByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPredictorById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getPredictorByMatchTypeId = async (request, reply, fastify) => {
  try {
    const result = await getPredictorByMatchTypeIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPredictorByMatchTypeId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deletePredictorByMatchType = async (request, reply, fastify) => {
  try {
    const result = await deletePredictorByMatchTypeService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletePredictorByMatchType",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deletePredictor = async (request, reply, fastify) => {
  try {
    const result = await deletePredictorService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletePredictor",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  savePredictorData,
  getAllPredictorData,
  getPredictorByMatchTypeId,
  deletePredictorByMatchType,
  deletePredictor,
  getPredictorById
};
