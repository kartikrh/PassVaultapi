const { saveMarketTemplateService, getAllMarketTemplateService } = require("../../../../services/marketTemplate");
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

const saveMarketTemplate = async (request, reply, fastify) => {
  try {
    const result = await saveMarketTemplateService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveMarketTemplate", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllMarketTemplate,
  saveMarketTemplate
};
