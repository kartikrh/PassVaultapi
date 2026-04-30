const { success, error, ERROR_CODES } = require("../../../../utilities");
const { errorLogger } = require("../../../../utilities/logger");
const { getByClientTypeRefIdService, saveClientLikeDislikeActivityService } = require("../../../../services/clientLikeDislikeActivity");

let commonPath = "controller/users/admin/clientLikeDislikeActivity/index.js";

const getByClientTypeRefId = async (request, reply, fastify) => {
  try {
    const result = await getByClientTypeRefIdService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getByClientTypeRefId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveClientLikeDislikeActivity = async (request, reply, fastify) => {
  try {
    const result = await saveClientLikeDislikeActivityService(request,fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveClientLikeDislikeActivity", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
    getByClientTypeRefId,
    saveClientLikeDislikeActivity
}