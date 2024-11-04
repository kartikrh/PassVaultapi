const { saveMarketTemplateService, getAllMarketTemplateService, getMarketTemplateIdService, deleteMarketTemplateService, getMatchTypeListService, activeInactiveTemplateService, getByMatchTypeIdService, getMarketTypeListService, getCategoryByMarketTypeService, changePredefineRunnerService, cloneMarketTemplateService, getMarketTypeAndCategoryByMarketTypeService, isPerEventStatusService, isShowInAdvanceMarketChangeStatusService, cloneMultiMarketTemplateService, defaultIsSendDataChangeService } = require("../../../../services/marketTemplate");
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
    errorLogger(fastify, err.message, commonPath + "/getByMatchTypeId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMarketTypeList = async (request, reply, fastify) => {
  try {
    const result = await getMarketTypeListService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketTypeList", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCategoryByMarketType = async (request, reply, fastify) => {
  try {
    const result = await getCategoryByMarketTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getCategoryByMarketType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const changePredefineRunner = async (request, reply, fastify) => {
  try {
    const result = await changePredefineRunnerService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/changePredefineRunner", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const cloneMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await cloneMarketTemplateService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/cloneMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getMarketTypeAndCategoryByMarketType = async (request, reply, fastify) => {
  try {
    const result = await getMarketTypeAndCategoryByMarketTypeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketTypeAndCategoryByMarketType", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateIsPerEventStatus = async (request, reply, fastify) => {
  try {
    const result = await isPerEventStatusService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateIsPerEventStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const isShowInAdvanceMarketStatusChange = async (request, reply, fastify) => {
  try {
    const result = await isShowInAdvanceMarketChangeStatusService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/isShowInAdvanceMarketStatusChange", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const cloneMultiMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await cloneMultiMarketTemplateService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/cloneMultiMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const defaultIsSendDataChange = async (request, reply, fastify) => {
  try {
    const result = await defaultIsSendDataChangeService(request ,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/defaultIsSendDataChange", request);
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
  getByMatchTypeId,
  getMarketTypeList,
  getCategoryByMarketType,
  changePredefineRunner,
  cloneMarketTemplate,
  getMarketTypeAndCategoryByMarketType,
  updateIsPerEventStatus,
  isShowInAdvanceMarketStatusChange,
  cloneMultiMarketTemplate,
  defaultIsSendDataChange
};
