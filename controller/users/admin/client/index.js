const { getAllClientService, clientByIdService, saveClientService, deleteClientService, activeInactiveClientService, isUserActiveInactiveService, emailAndMobileVerifyService, deleteClientByEncryptService } = require("../../../../services/client");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/client/index.js";

const getAllClient = async (request, reply, fastify) => {
  try {
    const result = await getAllClientService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getClientById = async (request, reply, fastify) => {
  try {
    const result = await clientByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getClientById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveClient = async (request, reply, fastify) => {
  try {
    const result = await saveClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteClient = async (request, reply, fastify) => {
  try {
    const result = await deleteClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveClient = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveClientService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveClient", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const isUserActiveInactive = async (request, reply, fastify) => {
  try {
    const result = await isUserActiveInactiveService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/isUserActiveInactive", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const emailAndMobileVerify = async (request, reply, fastify) => {
  try {
    const result = await emailAndMobileVerifyService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    console.log(err)
    errorLogger(fastify, err.message, commonPath + "/emailAndMobileVerify", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteClientByEncrypt = async (request, reply, fastify) => {
  try {
    const result = await deleteClientByEncryptService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteClientByEncrypt", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllClient,
  getClientById,
  saveClient,
  deleteClient,
  activeInactiveClient,
  isUserActiveInactive,
  emailAndMobileVerify,
  deleteClientByEncrypt
};