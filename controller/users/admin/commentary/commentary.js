const {
  commentaryByIdService,
  allCommentaryService,
  saveCommentaryService,
  deleteCommentaryService,
  updateCommentaryStatusService,
  updateTossDetailsService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  updateStrikerService,
  updateBowlerService,
  saveOverService,
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
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getAllDisplayStatus = async (request, reply, fastify) => {
  try {
    const result = await allDisplayStatusService();
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllDisplayStatus", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const getCommentaryById = async (request, reply, fastify) => {
  try {
    const result = await commentaryByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const getCommentaryDetailsById = async (request, reply, fastify) => {
  try {
    const result = await commentaryDetailsByIdService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getCommentaryById", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const addCommentary = async (request, reply, fastify) => {
  try {
    const result = await saveCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const deleteCommentary = async (request, reply, fastify) => {
  try {
    const result = await deleteCommentaryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/addCommentary", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

//apis to update commentary
const updateTossDetails = async (request, reply, fastify) => {
  try {
    const result = await updateTossDetailsService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateTossDetails", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

const updateCommentaryStatus = async (request, reply, fastify) => {
  try {
    const result = await updateCommentaryStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateTossDetails", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const updateStriker = async (request, reply, fastify) => {
  try {
    const result = await updateStrikerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateStriker", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const updateBowler = async (request, reply, fastify) => {
  try {
    const result = await updateBowlerService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/updateBowler", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};
const saveOver = async (request, reply, fastify) => {
  try {
    const result = await saveOverService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/saveOver", request);
    reply.status(500).send(error(err.message, ERROR_CODES.SERVER_ERROR, 500));
  }
};

module.exports = {
  getAllCommentaries,
  getCommentaryById,
  addCommentary,
  deleteCommentary,
  updateTossDetails,
  updateCommentaryStatus,
  getAllDisplayStatus,
  getCommentaryDetailsById,
  updateStriker,
  updateBowler,
  saveOver,
};
