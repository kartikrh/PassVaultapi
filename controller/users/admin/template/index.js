const { getAllTemplateService, templateByIdService, saveTemplateService, deleteTemplateService, activeInactiveTemplateService } = require("../../../../services/template");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/template/index.js";

const getAllTemplate = async (request, reply, fastify) => {
  try {
    const result = await getAllTemplateService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getTemplateById = async (request, reply, fastify) => {
  try {
    const result = await templateByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getTemplateById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveTemplate = async (request, reply, fastify) => {
  try {
    const result = await saveTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteTemplate = async (request, reply, fastify) => {
  try {
    const result = await deleteTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/deleteTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const activeInactiveTemplate = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllTemplate,
  getTemplateById,
  saveTemplate,
  deleteTemplate,
  activeInactiveTemplate
};