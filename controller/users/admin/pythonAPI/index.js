const {
  allPythonAPIsService,
  pythonAPIByID,
  createPythonAPIService,
  deletePythonAPIService,
  updateIsDefultService,
  activeInactivePythonAPIService,
} = require("../../../../services/pythonAPI");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/pythonAPI/index.js";

const getAllPythonAPIs = async (request, reply, fastify) => {
  try {
    const result = await allPythonAPIsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPythonAPIs",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPythonAPIById = async (request, reply, fastify) => {
  try {
    const result = await pythonAPIByID(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPythonAPIById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const savePythonAPI = async (request, reply, fastify) => {
  try {
    const result = await createPythonAPIService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savePythonAPI",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deletePythonAPI = async (request, reply, fastify) => {
  try {
    const result = await deletePythonAPIService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletePythonAPI",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateIsDefault = async (request, reply, fastify) => {
  try {
    const result = await updateIsDefultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateIsDefault",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactivePythonAPI = async (request, reply, fastify) => {
  try {
    const result = await activeInactivePythonAPIService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/activeInactivePythonAPI",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllPythonAPIs,
  getPythonAPIById,
  savePythonAPI,
  deletePythonAPI,
  updateIsDefault,
  activeInactivePythonAPI,
};
