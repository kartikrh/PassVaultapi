const {
  allPhotoLibraryService,
  allLibraryImagesService,
  photoLibraryById,
  libraryImageById,
  createPhotoLibraryService,
  createLibraryImageService,
  deletePhotoLibraryService,
  deleteLibraryImagesService,
  updateDisplayOrderService,
  updateIsDefultService,
  getAllLibraryImagesService,
  updatePhotoLibraryStatusService,
  updatePhotoLibraryDisplayOrderService,
} = require("../../../../services/photoLibrary");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/photoLibrary/index.js";

const getAllPhotoLibrary = async (request, reply, fastify) => {
  try {
    const result = await allPhotoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllPhotoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getAllLibraryImages = async (request, reply, fastify) => {
  try {
    const result = await allLibraryImagesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getAllLibraryImages",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const allLibraryImages = async (request, reply, fastify) => {
  try {
    const result = await getAllLibraryImagesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/allLibraryImages",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getPhotoLibraryById = async (request, reply, fastify) => {
  try {
    const result = await photoLibraryById(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getPhotoLibraryById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const getLibraryImageById = async (request, reply, fastify) => {
  try {
    const result = await libraryImageById(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/getLibraryImageById",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const savePhotoLibrary = async (request, reply, fastify) => {
  try {
    const result = await createPhotoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/savePhotoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const saveLibraryImage = async (request, reply, fastify) => {
  try {
    const result = await createLibraryImageService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/saveLibraryImage",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deletePhotoLibrary = async (request, reply, fastify) => {
  try {
    const result = await deletePhotoLibraryService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deletePhotoLibrary",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const deleteLibraryImages = async (request, reply, fastify) => {
  try {
    const result = await deleteLibraryImagesService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/deleteLibraryImages",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await updateDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateDisplayOrder",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updateIsDefault = async (request, reply, fastify) => {
  try {
    const result = await updateIsDefultService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updateIsDefault",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updatePhotoLibraryStatus = async (request, reply, fastify) => {
  try {
    const result = await updatePhotoLibraryStatusService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updatePhotoLibraryStatus",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

const updatePhotoLibraryDisplayOrder = async (request, reply, fastify) => {
  try {
    const result = await updatePhotoLibraryDisplayOrderService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      commonPath + "/updatePhotoLibraryDisplayOrder",
      request
    );
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};

module.exports = {
  getAllPhotoLibrary,
  getAllLibraryImages,
  getPhotoLibraryById,
  getLibraryImageById,
  savePhotoLibrary,
  saveLibraryImage,
  deletePhotoLibrary,
  deleteLibraryImages,
  updateDisplayOrder,
  updateIsDefault,
  allLibraryImages,
  updatePhotoLibraryStatus,
  updatePhotoLibraryDisplayOrder
};
