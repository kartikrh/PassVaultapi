const { getAllNewsService, newsByIdService, saveNewsService, deleteNewsService, activeInactiveNewsService, changeDisplayOrderService } = require("../../../../services/news");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/news/index.js";

const getAllNews = async (request, reply, fastify) => {
    try {
      const result = await getAllNewsService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getAllNews", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
  
const getNewsById = async (request, reply, fastify) => {
    try {
      const result = await newsByIdService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getNewsById", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
  

const saveNews = async (request, reply, fastify) => {
  try {
    const result = await saveNewsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveNews", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteNews = async (request, reply, fastify) => {
    try {
      const result = await deleteNewsService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/deleteMenuType", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
const activeInactiveNews = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveNewsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveNews", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const changeDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await changeDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/updateDisplayOrderNews", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getAllNews,
    getNewsById,
    saveNews,
    deleteNews,
    activeInactiveNews,
    changeDisplayOrder
};