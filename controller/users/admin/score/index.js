const { getMarketsByCommentaryIdService, getNotificationByClientService, markReadNotificationService,getMarketByGraphByRefIdService, getMarketsByCommentaryIdServiceV1 } = require("../../../../services/score");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let commonPath = "controller/users/admin/score/index";

const getMarketsByCommentaryId = async (request, reply, fastify) => {
  try {
    const result = await getMarketsByCommentaryIdService(request , fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketsByCommentaryId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getNotificationByClient = async (request , reply , fastify) =>{
  try {
    const result = await getNotificationByClientService(request , fastify)
    reply.status(200).send(success(result,200))
  } catch (err) {
    errorLogger(fastify,err.message,commonPath + "/getNotificationByClient",request)
    reply.status(200).send(error(err.message,ERROR_CODES.SERVER_ERROR,200))
  }
}
const markReadNotification = async (request , reply , fastify) =>{
  try {
    const result = await markReadNotificationService(request , fastify)
    reply.status(200).send(success(result,200))
  } catch (err) {
    errorLogger(fastify,err.message,commonPath + "/markReadNotification",request)
    reply.status(200).send(error(err.message,ERROR_CODES.SERVER_ERROR,200))
  }
}
const getMarketByGraphByRefId = async (request, reply, fastify) => {
  try {
    const result = await getMarketByGraphByRefIdService(request , fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketByGraphByRefId", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMarketsByCommentaryIdV1 = async (request, reply, fastify) => {
  try {
    const result = await getMarketsByCommentaryIdServiceV1(request , fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/getMarketsByCommentaryIdV1", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
    getMarketsByCommentaryId,
    getNotificationByClient,
    markReadNotification,
    getMarketByGraphByRefId,
    getMarketsByCommentaryIdV1,
}