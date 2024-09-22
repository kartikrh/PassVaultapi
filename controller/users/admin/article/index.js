const { getAllArticlesService, articleByIdService, saveArticleService, deleteArticleService, activeInactiveArticleService } = require("../../../../services/article");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/article/index.js";

const getAllArticles = async (request, reply, fastify) => {
    try {
      const result = await getAllArticlesService(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getAllArticles", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
  
const getArticleById = async (request, reply, fastify) => {
    try {
      const result = await articleByIdService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/getArticleById", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const saveArticle = async (request, reply, fastify) => {
  try {
    const result = await saveArticleService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveArticle", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteArticle = async (request, reply, fastify) => {
    try {
      const result = await deleteArticleService(request, fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/deleteMenuType", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};

const activeInactiveArticle = async (request, reply, fastify) => {
  try {
    const result = await activeInactiveArticleService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/activeInactiveArticle", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
    getAllArticles,
    getArticleById,
    saveArticle,
    deleteArticle,
    activeInactiveArticle
};