const {
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
} = require("../repository/TableVideoLibrary");
const {
  generateImageName,
  removeImageFromServer,
  storeFileOnServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { VideoLibraryType } = require("../utilities/index");

const saveVideoLibraryService = async (request, fastify) => {
  const validateId = global.tblVideoLibrary.find(
    (item) => item.title.toLowerCase() == request.body.title.toLowerCase()
  );
  if (validateId) {
    throw new Error("Video library with same title already exists");
  }
  if (request.body.type === VideoLibraryType.OUR) {
    if (request.body.video && request.body.video.length) {
      const firstVideo = request.body.video[0];

      const imgName = generateImageName({
        name: request.body.title,
      });

      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      )?.value;

      const path = await storeFileOnServer({
        file: firstVideo,
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.VideoLibrary,
      });

      request.body.video = path;
    }
  }

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
  const validateTitle = global.tblVideoLibrary.find(
    (item) => item.title.toLowerCase() == request.body.title.toLowerCase() && item.id !== request.body.id
  );
  if (validateTitle) {
    throw new Error("Video library with same title already exists");
  }

  if (request.body.type === VideoLibraryType.OUR) {
    if (request.body.video && request.body.video.length) {
      const firstVideo = request.body.video[0];

      const imgName = generateImageName({
        name: request.body.title,
      });

      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      )?.value;

      const path = await storeFileOnServer({
        file: firstVideo,
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.VideoLibrary,
      });

      request.body.video = path;
    }
  }

  const updateData = {
    title: request.body.title ?? validateId.title,
    isPermanent: request.body.isPermanent ?? validateId.isPermanent,
    from: request.body.from ?? null,
    to: request.body.to ?? null,
    tag: request.body.tag ?? validateId.tag,
    SEO: request.body.SEO ?? validateId.SEO,
    description: request.body.description ?? validateId.description,
    video: request.body.video ?? null,
    videoURL: request.body.videoURL ?? null,
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
  for (const elem of id) {
    const validateId = global.tblVideoLibrary.find((item) => item.id === elem);
    if (validateId && validateId.video && validateId.type === 1) {
      await removeImageFromServer({
        path: validateId.video,
      });
    }
  }
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
