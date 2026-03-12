const {
  allVideoLibraryService,
  videoLibraryById,
  createVideoLibraryService,
  deleteVideoLibraryService,
  updateVideoStatusService,
} = require("../../../../services/videoLibrary");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/videoLibrary/index.js";

const getAllVideoLibrary = async (request, reply, fastify) => {
  try {
    const result = await allVideoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllVideoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getVideoLibraryById = async (request, reply, fastify) => {
  try {
    const result = await videoLibraryById(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getVideoLibraryById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveVideoLibrary = async (request, reply, fastify) => {
  try {
    const result = await createVideoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/saveVideoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteVideoLibrary = async (request, reply, fastify) => {
  try {
    const result = await deleteVideoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteVideoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateVideoStatus = async (request, reply, fastify) => {
  try {
    const result = await updateVideoStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message, 
      commonPath + "/updateVideoStatus", 
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllVideoLibrary,
  getVideoLibraryById,
  saveVideoLibrary,
  deleteVideoLibrary,
  updateVideoStatus,
};
