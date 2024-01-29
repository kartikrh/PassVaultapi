const {
  commentaryByIdService,
  allCommentaryService,
  saveCommentaryService,
  cloneCommentaryService,
  deleteCommentaryService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  saveCommentaryDetailsService,
  deleteBallByBallCommentoriesService,
  deleteOverCommentoriesService,
  //nitesh Updated
  commentaryDetailsByEventIdService,
  commentaryDetailsByCommentaryIdService,
  getCurrentUpdatedCommentaryIDService,
  updateMatchTypeInCommentaryService,
  getMatchTypeListByCommentaryService,
} = require("../../../../services/commentry");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");

let path = "controller/users/admin/commentary/commentary";

const getAllCommentaries = async (request, reply, fastify) => {
  try {
    const result = await allCommentaryService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllCommentaries", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getAllDisplayStatus = async (request, reply, fastify) => {
  try {
    const result = await allDisplayStatusService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllDisplayStatus", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryById = async (request, reply, fastify) => {
  try {
    const result = await commentaryByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getCommentaryDetailsById = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const addCommentary = async (request, reply, fastify) => {
  try {
    const result = await saveCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const cloneCommentary = async (request, reply, fastify) => {
  try {
    const result = await cloneCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/cloneCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const saveCommentaryDetails = async (request, reply, fastify) => {
  try {
    const result = await saveCommentaryDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteBallByBallCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteBallByBallCommentoriesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/deleteBallByBallCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const deleteOverCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteOverCommentoriesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/deleteOverCommentary", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetailsByEventId = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByEventIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCommentaryDetailsByEventId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCommentaryDetailsBycommentaryId = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByCommentaryIdService(
      request,
      fastify
    );
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCommentaryDetailsBycommentaryId",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getCurrentUpdatedCommentaryID = async (request, reply, fastify) => {
  try {
    const result = await getCurrentUpdatedCommentaryIDService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getCurrentUpdatedCommentaryID",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateMatchTypeInCommentary = async (request, reply, fastify) => {
  try {
    const result = await updateMatchTypeInCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
    
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/updateMatchTypeInCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
const getMatchTypeListByCommentary = async (request, reply, fastify) => {
  try {
    const result = await getMatchTypeListByCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      path + "/getMatchTypeListByCommentary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  getAllDisplayStatus,
  getCommentaryDetailsById,
  saveCommentaryDetails,
  cloneCommentary,
  deleteBallByBallCommentary,
  deleteOverCommentary,
  getCommentaryDetailsByEventId,
  getCommentaryDetailsBycommentaryId,
  getCurrentUpdatedCommentaryID,
  updateMatchTypeInCommentary,
  getMatchTypeListByCommentary
};
