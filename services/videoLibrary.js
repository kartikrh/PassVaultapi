const {
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
} = require("../repository/TableVideoLibrary");

const saveVideoLibraryService = async (request, fastify) => {
  const saveData = await insertVideoLibraryQuery(
    request.body,
    fastify,
    request
  );
  global.tblVideoLibrary.push(saveData);
  return saveData;
};

const editVideoLibraryService = async (request, fastify, data) => {
  const validateId = global.tblVideoLibrary.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Video library data with this Id not found");
  }

  const updateData = {
    title: request.body.title ?? validateId.title,
    isPermanent: request.body.isPermanent ?? validateId.isPermanent,
    from: request.body.from ?? validateId.from,
    to: request.body.to ?? validateId.to,
    tag: request.body.tag ?? validateId.tag,
    SEO: request.body.SEO ?? validateId.SEO,
    description: request.body.description ?? validateId.description,
    videoURL: request.body.videoURL ?? validateId.videoURL,
    type: request.body.type ?? validateId.type,
    type: request.body.type ?? validateId.type,
    commentaryId: request.body.commentaryId ?? validateId.commentaryId,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateVideoLibraryQuery(
    updateData,
    fastify,
    request
  );

  const index = global.tblVideoLibrary.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblVideoLibrary[index] = modifiedData[0];
  }

  return modifiedData[0];
};

const allVideoLibraryService = async (request) => {
  return global.tblVideoLibrary;
};

const videoLibraryById = async (request) => {
  const { id } = request.body;
  const result = global.tblVideoLibrary.find((item) => item.id === id);
  return result || null;
};

const createVideoLibraryService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveVideoLibraryService(request, fastify, request);
  } else {
    return await editVideoLibraryService(request, fastify, request);
  }
};

const deleteVideoLibraryService = async (request, fastify) => {
  const { id } = request.body;

  await deleteVideoLibraryQuery(id, fastify, request);
  global.tblVideoLibrary = global.tblVideoLibrary.filter(
    (item) => !id.includes(item.id)
  );

  return `Video library data deleted successfully`;
};

module.exports = {
  allVideoLibraryService,
  videoLibraryById,
  createVideoLibraryService,
  deleteVideoLibraryService,
};
