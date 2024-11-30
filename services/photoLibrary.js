const {
  insertPhotoLibraryQuery,
  insertLibraryImageQuery,
  updatePhotoLibraryQuery,
  updateLibraryImageQuery,
  changeDisplayOrderQuery,
  deletePhotoLibraryQuery,
  deleteLibraryImagesQuery,
} = require("../repository/TablePhotoLibrary");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const savePhotoLibraryService = async (request, fastify) => {
  const saveData = await insertPhotoLibraryQuery(
    request.body,
    fastify,
    request
  );
  global.tblPhotoLibrary.push(saveData);
  return saveData;
};

const editPhotoLibraryService = async (request, fastify, data) => {
  const validateId = global.tblPhotoLibrary.find(
    (item) => item.photoLibraryId == request.body.photoLibraryId
  );
  if (!validateId) {
    throw new Error("Photo library data with this Id not found");
  }

  const updateData = {
    title: request.body.title ?? validateId.title,
    SEO: request.body.SEO ?? validateId.SEO,
    description: request.body.description ?? validateId.description,
    isPermanent: request.body.isPermanent ?? validateId.isPermanent,
    startDate: request.body.startDate ?? validateId.startDate,
    endDate: request.body.endDate ?? validateId.endDate,
    photoLibraryId: parseInt(request.body.photoLibraryId, 10),
  };

  const modifiedData = await updatePhotoLibraryQuery(
    updateData,
    fastify,
    request
  );

  const index = global.tblPhotoLibrary.findIndex(
    (item) => item.photoLibraryId == request.body.photoLibraryId
  );

  if (index != -1) {
    global.tblPhotoLibrary[index] = modifiedData[0];
  }

  return modifiedData[0];
};

const saveLibraryImageService = async (request, fastify, data) => {
  if (data.body.image && data.body.image.length) {
    const imgName = generateImageName({
      name: data.body.title,
    });

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const path = await storeImageOnServer({
      image: data.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.LibraryImage,
    });
    data.body.image = path;
  }
  const saveData = await insertLibraryImageQuery(data.body, fastify, request);
  global.tblLibraryImages.push(saveData);

  return saveData;
};

const editLibraryImageService = async (request, fastify, data) => {
  const validateId = global.tblLibraryImages.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Library image data with this Id not found");
  }

  if (request.body.image && request.body.image.length) {
    const imgName = generateImageName({
      name: request.body.title,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.SocialMedia,
    });
    request.body.image = path;
  }

  const updateData = {
    photoLibraryId:
      parseInt(request.body.photoLibraryId, 10) ?? validateId.photoLibraryId,
    title: request.body.title ?? validateId.title,
    image: request.body.image ?? validateId.image,
    isDefault: request.body.isDefault ?? validateId.isDefault,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateLibraryImageQuery(
    updateData,
    fastify,
    request
  );

  const index = global.tblLibraryImages.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblLibraryImages[index] = modifiedData[0];
  }
  return modifiedData[0];
};

const allPhotoLibraryService = async (request) => {
  return global.tblPhotoLibrary;
};

const allLibraryImagesService = async (request) => {
  const { photoLibraryId } = request.body;
  const result = global.tblLibraryImages.filter(
    (item) => item.photoLibraryId === photoLibraryId
  );
  return result;
};

const photoLibraryById = async (request) => {
  const { photoLibraryId } = request.body;
  const result = global.tblPhotoLibrary.find(
    (item) => item.photoLibraryId === photoLibraryId
  );
  return result || null;
};

const libraryImageById = async (request) => {
  const { id } = request.body;
  const result = global.tblLibraryImages.find((item) => item.id === id);
  return result || null;
};

const createPhotoLibraryService = async (request, fastify) => {
  if (request.body.photoLibraryId == 0) {
    return await savePhotoLibraryService(request, fastify, request);
  } else {
    return await editPhotoLibraryService(request, fastify, request);
  }
};

const createLibraryImageService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveLibraryImageService(request, fastify, request);
  } else {
    return await editLibraryImageService(request, fastify, request);
  }
};

const deletePhotoLibraryService = async (request, fastify) => {
  const { photoLibraryId } = request.body;
  for (const elem of photoLibraryId) {
    const validateId = global.tblPhotoLibrary.find(
      (item) => item.photoLibraryId === elem
    );
    if (validateId && validateId.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
  }
  await deletePhotoLibraryQuery(photoLibraryId, fastify, request);
  global.tblPhotoLibrary = global.tblPhotoLibrary.filter(
    (item) => !photoLibraryId.includes(item.photoLibraryId)
  );

  global.tblLibraryImages = global.tblLibraryImages.filter(
    (item) => !photoLibraryId.includes(item.photoLibraryId)
  );

  return `Photo library data deleted successfully`;
};

const deleteLibraryImagesService = async (request, fastify) => {
  const { id } = request.body;
  for (const elem of id) {
    const validateId = global.tblLibraryImages.find((item) => item.id === elem);
    if (validateId && validateId.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
  }
  await deleteLibraryImagesQuery(id, fastify, request);
  global.tblLibraryImages = global.tblLibraryImages.filter(
    (item) => !id.includes(item.id)
  );

  return `Library image(s) data deleted successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await changeDisplayOrderQuery(item, request, fastify);
    let index = global.tblLibraryImages.findIndex(
      (elem) => elem.id === item.id
    );
    if (index !== -1) {
      global.tblLibraryImages[index].displayOrder = item.displayOrder;
    }
  }

  return `Display order updated successfully`;
};

module.exports = {
  allPhotoLibraryService,
  allLibraryImagesService,
  photoLibraryById,
  libraryImageById,
  createPhotoLibraryService,
  createLibraryImageService,
  deletePhotoLibraryService,
  deleteLibraryImagesService,
  updateDisplayOrderService,
};
