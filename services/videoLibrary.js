const {
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
  updateVideoLibraryStatusQuery,
  updateDisplayOrder,
} = require("../repository/TableVideoLibrary");
const {
  generateImageName,
  removeImageFromServer,
  storeFileOnServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { VideoLibraryType } = require("../utilities/index");
const { callClientAPI, ServiceType, APIEndpointModuleType } = require("../utilities");

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

      const { fullPath, imagePath } = await storeFileOnServer({
        file: firstVideo,
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.VideoLibrary,
      });

      request.body.video = fullPath;
      request.body.videoPath = imagePath;
    }
  }

  const saveData = await insertVideoLibraryQuery(
    request.body,
    fastify,
    request
  );
  global.tblVideoLibrary.push(saveData);

  const now = Date.now();
  let sendToClient = false;
  if (saveData.isActive) {
    if (saveData.isPermanent) {
      sendToClient = true;
    } else if (saveData.from <= now && saveData.to >= now) {
      sendToClient = true;
    }
  }

  if (sendToClient) {
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'videoLibrary',
          type: "add",
          data: saveData
        }
      }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/videoLibrary.js/saveVideoLibraryService - callClientAPI",
          request
        );
      });
  }

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

      const { fullPath, imagePath } = await storeFileOnServer({
        file: firstVideo,
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.VideoLibrary,
      });

      request.body.video = fullPath;
      request.body.videoPath = imagePath;
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
    video: request.body.video ?? validateId.video,
    videoURL: request.body.videoURL ?? validateId.videoURL,
    type: request.body.type ?? validateId.type,
    commentaryId: request.body.commentaryId ?? validateId.commentaryId,
    id: parseInt(request.body.id, 10),
    videoPath: request.body.videoPath ?? validateId.videoPath,
    whitelabelId: request.body.whitelabelId ?? validateId.whitelabelId,
  };
  if(updateData.type === 2) {
    updateData.video = null
  }
  if(updateData.type === 1) {
    updateData.videoURL = null
  }

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

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: 'videoLibrary',
        type: "update",
        data: modifiedData[0]
      }
    }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/videoLibrary.js/editVideoLibraryService - callClientAPI",
      request
    );
  });

  return modifiedData[0];
};

const allVideoLibraryService = async (request) => {
  const { isActive, dateTime, isPermanent , startDate , endDate} = request.body; 
  let videos = global.tblVideoLibrary;
  if (isActive !== undefined) {
    videos = videos.filter(v => v.isActive === Boolean(isActive));
  }
  if (isPermanent !== undefined) {
    videos = videos.filter(v => v.isPermanent === Boolean(isPermanent));
  }
  if(startDate && endDate){
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    videos = videos.filter(item => {
      if (item.isPermanent) return false; // optional
      
      const stDate = new Date(item.from).getTime();
      const enDate = new Date(item.to).getTime();

      return stDate <= end && enDate >= start;
    });
  }

  if (dateTime) {
    const now = Date.now();
    videos = videos.filter(item => {
      if (item.isPermanent) return true;

      const start = new Date(item.from).getTime();
      const end = new Date(item.to).getTime();

      return start <= now && end >= now;
    });
  }
  return videos;
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

  callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'videoLibrary',
      type: "delete",
      data: {
        id: id
      }
    }
  }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/videoLibrary.js/deleteVideoLibraryQuery - callClientAPI",
      request
    );
  });

  return `Video library data deleted successfully`;
};

const updateVideoStatusService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const index = global.tblVideoLibrary.findIndex(v => v.id === id);
  if (index === -1) {
    throw new Error("Video not found");
  }
  const body = {
    id,
    isActive,
    userId: request.userTokenInfo.WrUserId,
  };
  const updatedVideo = await updateVideoLibraryStatusQuery(body, fastify, request);
  global.tblVideoLibrary[index].isActive = isActive;
  return updatedVideo[0];
};

const updateDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await updateDisplayOrder(item, request, fastify);
    let index = global.tblVideoLibrary.findIndex((elem) => elem.id === item.id);
    if (index !== -1) {
      global.tblVideoLibrary[index].displayOrder = item.displayOrder;
    }
  }
  let allActiveData = global.tblVideoLibrary.filter(item => item.isActive == true);
  callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'videoLibrary',
      type: "changeDisplayOrder",
      data: allActiveData
    }
  }, request, fastify)
  .catch((err) => {
    errorLogger(
      fastify,
      err.message,
      "services/videoLibrary.js/deleteVideoLibraryQuery - callClientAPI",
      request
    );
  });

  return `Display order updated successfully`;
}

module.exports = {
  allVideoLibraryService,
  videoLibraryById,
  createVideoLibraryService,
  deleteVideoLibraryService,
  updateVideoStatusService,
  updateDisplayOrderService,
};
