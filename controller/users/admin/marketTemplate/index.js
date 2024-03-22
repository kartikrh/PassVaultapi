const { saveMarketTemplateService, getAllMarketTemplateService, getMarketTemplateIdService, deleteMarketTemplateService, getMatchTypeListService, activeInactiveTemplateService, getByMatchTypeIdService } = require("../../../../services/marketTemplate");
const { error, success, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/marketTemplate/index.js";

const getAllMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await getAllMarketTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getAllMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getMarketTemplateId = async (request, reply, fastify) => {
  try {
    const result = await getMarketTemplateIdService(request);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketTemplateId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await saveMarketTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await deleteMarketTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMatchTypeList = async (request, reply, fastify) => {
  try {
    const result = await getMatchTypeListService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const activeInactiveMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getByMatchTypeId = async (request, reply, fastify) => {
  try {
    const result = await getByMatchTypeIdService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getByMatchTypeId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};


module.exports = {
  getAllMarketTemplate,
  saveMarketTemplate,
  getMarketTemplateId,
  deleteMarketTemplate,
  getMatchTypeList,
  activeInactiveMarketTemplate,
  getByMatchTypeId
};
