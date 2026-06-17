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
const { VideoLibraryType, getDataFromTime, checkDataSendToClient } = require("../utilities/index");
const { callClientAPI, APIEndpointModuleType } = require("../utilities");
const { sendNotificationByType } = require("../utilities/index");

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

  const sendToClient = checkDataSendToClient(saveData, "from", "to");
  if (sendToClient) {
    sendNotificationByType({ ...saveData, type: "video", sendType: 3 }, request, fastify);
    await callClientAPI(
      {
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'videoLibrary',
          type: "add",
          data: saveData
        }
      }, request, fastify,
      "services/videoLibrary.js/saveVideoLibraryService"
    );
  } else {
    global.pendingVideoLibraryToClient.push(saveData);
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
    isActive: request.body.isActive ?? validateId.isActive
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

  global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => item.id !== updateData.id);
  const sendToClient = checkDataSendToClient(modifiedData[0], "from", "to");
  if (sendToClient) {
    sendNotificationByType({ ...modifiedData[0], type: "video", sendType: 3 }, request, fastify);
  }
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: 'videoLibrary',
        type: "update",
        data: modifiedData[0]
      }
    }, request, fastify,
    "services/videoLibrary.js/editVideoLibraryService"
  );

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
    videos = getDataFromTime(videos, "pendingVideoLibraryToClient", "from", "to");
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

  global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => !id.includes(item.id));

  await callClientAPI({
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'videoLibrary',
      type: "delete",
      data: {
        id: id
      }
    }
  }, request, fastify,
    "services/videoLibrary.js/deleteVideoLibraryService"
  );

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

  global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => item.id !== updateData.id);

  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        module: 'videoLibrary',
        type: "update",
        data: global.tblVideoLibrary[index]
      }
    }, request, fastify,
    "services/videoLibrary.js/updateVideoStatusService"
  );

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
  const now = Date.now();
  let allActiveData = global.tblVideoLibrary.filter(item => 
    item.isActive === true && (item.isPermanent === true || 
      (
        new Date(item.from).getTime() <= now &&
        new Date(item.to).getTime() >= now
      )
    )
  );

  global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => request.body.map(item => item.id).includes(item.id));

  await callClientAPI({
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'videoLibrary',
      type: "changeDisplayOrder",
      data: allActiveData
    }
  }, request, fastify,
    "services/videoLibrary.js/updateDisplayOrderService"
  );

  return `Display order updated successfully`;
}

const sendActiveVideoLibraryToClientAPIService = async (fastify) => {
  try {
    if (global.pendingVideoLibraryToClient.length > 0) {
      const now = Date.now();
      for (const data of global.pendingVideoLibraryToClient) {
        const start = new Date(data.from).getTime();
        const end = new Date(data.to).getTime();

        const result = start <= now && end >= now;
        if (result) {
          global.pendingVideoLibraryToClient = global.pendingVideoLibraryToClient.filter(item => item.id !== data.id);
          await callClientAPI(
            {
              moduleType: APIEndpointModuleType.updateSeoModule,
              data: {
                module: 'videoLibrary',
                type: "add",
                data: data
              }
            },
            null,
            fastify,
            "services/videoLibrary.js/sendActiveVideoLibraryToClientAPIService"
          );
        }
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/videoLibrary.js/sendActiveVideoLibraryToClientAPIService",
      null
    );
  }
}

module.exports = {
  allVideoLibraryService,
  videoLibraryById,
  createVideoLibraryService,
  deleteVideoLibraryService,
  updateVideoStatusService,
  updateDisplayOrderService,
  sendActiveVideoLibraryToClientAPIService
};
