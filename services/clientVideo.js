const {
  insertClientVideoQuery,
  updateClientVideoQuery,
  deleteClientVideosQuery,
  activeInactiveClientVideoQuery,
} = require("../repository/TableClientVideo");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const saveClientVideo = async (request, fastify, data) => {
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
      ...ImgModuleConfig.ClientVideo,
    });
    data.body.image = path;
  }

  const saveData = await insertClientVideoQuery(data.body, fastify, request);
  global.tblClientVideos.push(saveData);
  return saveData;
};

const editClientVideo = async (request, fastify, data) => {
  const validateId = global.tblClientVideos.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Client video with this Id not found");
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
      ...ImgModuleConfig.ClientVideo,
    });
    request.body.image = path;
  }

  const updateData = {
    title: request.body.title ?? validateId.title,
    URL: request.body.URL ?? validateId.URL,
    image: request.body.image ?? validateId.image,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    credit: request.body.credit ?? validateId.credit,
    viewerCount: parseInt(request.body.viewerCount, 10) ?? validateId.viewerCount,
    id: parseInt(request.body.id, 10),
};

  const modifiedData = await updateClientVideoQuery(updateData, fastify, request);
  
  const index = global.tblClientVideos.findIndex(
    (item) => item.id == request.body.id
  );
  
  if(index != -1){
    global.tblClientVideos[index] = modifiedData[0];
  }
  return modifiedData[0];
};

const allClientVideosService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblClientVideos.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblClientVideos.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const clientVideoByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblClientVideos.find((item) => item.id === id);
  return result || null;
};

const createClientVideoService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveClientVideo(request, fastify, request);
  } else {
    return await editClientVideo(request, fastify, request);
  }
};

const deleteClientVideoService = async (request, fastify) => {
  const { id } = request.body;
  for (const elem of id) {
    const validateId = global.tblClientVideos.find((item) => item.id === elem);
    if (validateId && validateId.image) {
      await removeImageFromServer({
        path: validateId.image,
      });
    }
  }
  await deleteClientVideosQuery(id, fastify, request);
  global.tblClientVideos = global.tblClientVideos.filter(
    (item) => !id.includes(item.id)
  );

  return `Client Video(s) deleted successfully`;
};

const activeInactiveClientVideoService = async (request, fastify) => {
  const { id, isActive } = request.body;

  const validateId = global.tblClientVideos.find(
    (item) => item.id == id
  );
  if (!validateId) {
    throw new Error("Client video with this Id not found");
  }

  await activeInactiveClientVideoQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblClientVideos.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblClientVideos[index].isActive = isActive;
  }
  
  return `Client video updated successfully`;
};

module.exports = {
  allClientVideosService,
  clientVideoByIdService,
  createClientVideoService,
  deleteClientVideoService,
  activeInactiveClientVideoService,
};
