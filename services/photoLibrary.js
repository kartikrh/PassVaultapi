const {
  insertPhotoLibraryQuery,
  insertLibraryImageQuery,
  updatePhotoLibraryQuery,
  updateLibraryImageQuery,
  changeDisplayOrderQuery,
  deletePhotoLibraryQuery,
  deleteLibraryImagesQuery,
  isDefaultChangeQuery,
  isDefaultFalseQuery,
  updatePhotoLibraryStatusQuery,
  updatePhotoLibraryDisplayOrderQuery,
} = require("../repository/TablePhotoLibrary");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { commentaryStatus, getDataFromTime } = require("../utilities/index");
const { errorLogger } = require("../utilities/logger");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { callClientAPI, ServiceType, APIEndpointModuleType } = require("../utilities");

const savePhotoLibraryService = async (request, fastify) => {
  const saveData = await insertPhotoLibraryQuery(
    request.body,
    fastify,
    request
  );
  global.tblPhotoLibrary.push(saveData);

  const now = Date.now();
  let sendToClient = false;
  if (saveData.isActive) {
    if (saveData.isPermanent) {
      sendToClient = true;
    } else if (saveData.startDate <= now && saveData.endDate >= now) {
      sendToClient = true;
    }
  }
  if (sendToClient) {
    await callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'photoLibrary',
          type: "add",
          data: saveData
        }
      }, request, fastify,
      "services/photoLibrary.js/savePhotoLibraryService"
    );
  }
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
    startDate: request.body.startDate ?? null,
    endDate: request.body.endDate ?? null,
    isActive: request.body.isActive ?? validateId.isActive,
    commentaryId: request.body.commentaryId ?? validateId.commentaryId,
    displayOrder: request.body.displayOrder ?? validateId.displayOrder, 
    whitelabelId: request.body.whitelabelId ?? validateId.whitelabelId, 
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
    global.tblPhotoLibrary[index] = modifiedData;
  }

  global.pendingPhotoLibraryToClient = global.pendingPhotoLibraryToClient.filter(item => item.photoLibraryId !== updateData.photoLibraryId);

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'photoLibrary',
         type: "update",
         data: modifiedData
       }
    }, request, fastify,
    "services/photoLibrary.js/editPhotoLibraryService"
  );

  return modifiedData;
};

const saveLibraryImageService = async (request, fastify, data) => {
  const validateId = global.tblLibraryImages.find(
    (item) => item.title.toLowerCase() == request.body.title.toLowerCase()
  );
  if (validateId) {
    throw new Error("Library image with same title already exists");
  }
  if (data.body.image && data.body.image.length) {
    const imgName = generateImageName({
      name: data.body.title,
    });

    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    )?.value;

    const { fullPath, imagePath } = await storeImageOnServer({
      image: data.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.LibraryImage,
    });
    data.body.image = fullPath;
    data.body.imagePath = imagePath;
  }
  if (request.body.isDefault === true) {
    await isDefaultFalseQuery(request.body, fastify, request);
    global.tblLibraryImages.forEach((item) => {
      if (
        item.id !== request.body.id &&
        item.photoLibraryId === request.body.photoLibraryId
      ) {
        item.isDefault = false;
      }
    });
  }
  const saveData = await insertLibraryImageQuery(data.body, fastify, request);
  global.tblLibraryImages.push(saveData);

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "add",
         data: saveData
       }
    }, request, fastify,
    "services/photoLibrary.js/saveLibraryImageService"
  );

  return saveData;
};

const editLibraryImageService = async (request, fastify, data) => {
  const validateId = global.tblLibraryImages.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Library image data with this Id not found");
  }
  const validateTitle = global.tblLibraryImages.find(
    (item) => item.title.toLowerCase() == request.body.title.toLowerCase() && item.id !== request.body.id
  );
  if (validateTitle) {
    throw new Error("Library image with same title already exists");
  }

  if (request.body.image && request.body.image.length) {
    const imgName = generateImageName({
      name: request.body.title,
    });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.LibraryImage,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }

  const updateData = {
    photoLibraryId:
      parseInt(request.body.photoLibraryId, 10) ?? validateId.photoLibraryId,
    title: request.body.title ?? validateId.title,
    image: request.body.image ?? validateId.image,
    isDefault: request.body.isDefault ?? validateId.isDefault,
    id: parseInt(request.body.id, 10),
    imagePath: request.body.imagePath ?? validateId.imagePath,
  };
  if (request.body.isDefault === true) {
    await isDefaultFalseQuery(request.body, fastify, request);
    global.tblLibraryImages.forEach((item) => {
      if (
        item.id !== request.body.id &&
        item.photoLibraryId === request.body.photoLibraryId
      ) {
        item.isDefault = false;
      }
    });
  }

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

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "update",
         data: modifiedData[0]
       }
    }, request, fastify,
    "services/photoLibrary.js/editLibraryImageService"
  );
  return modifiedData[0];
};

const allPhotoLibraryService = async (request) => {
  const { isActive, dateTime , isPermanent , startDate , endDate } = request.body;
  let data = global.tblPhotoLibrary;
  if (isActive !== undefined) {
    data = data.filter(p => p.isActive === isActive);
  }
  if(isPermanent != undefined){
    data = data.filter((i)=> i.isPermanent == Boolean(isPermanent))
  }
  if(startDate &&  endDate){
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    data = data.filter(item => {
      if (item.isPermanent) return false; // optional
      
      const stDate = new Date(item.startDate).getTime();
      const enDate = new Date(item.endDate).getTime();

      return stDate <= end && enDate >= start;
    });
  }
  if (dateTime) {
    data = getDataFromTime(data, "pendingPhotoLibraryToClient");
  }
  return data;
};

const getAllLibraryImagesService = async (request) => {
  return global.tblLibraryImages;
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

  global.pendingPhotoLibraryToClient = global.pendingPhotoLibraryToClient.filter(item => !photoLibraryId.includes(item.photoLibraryId));

  await callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'photoLibrary',
      type: "delete",
      data: {
        photoLibraryId: photoLibraryId
      }
    }
  }, request, fastify,
    "services/photoLibrary.js/deletePhotoLibraryService"
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

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "delete",
         data: {
          id: id
        }
       }
    }, request, fastify,
    "services/photoLibrary.js/deleteLibraryImagesService"
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

  global.pendingPhotoLibraryToClient = global.pendingPhotoLibraryToClient.filter(item => request.body.id.map(item => item.id).includes(item.photoLibraryId));

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "displayOrder",
         data: request.body
       }
    }, request, fastify,
    "services/photoLibrary.js/updateDisplayOrderService"
  );

  return `Display order updated successfully`;
};

const updateIsDefultService = async (request, fastify) => {
  const result = global.tblLibraryImages.find(
    (item) => item.id === request.body.id
  );

  if (!result) {
    throw new Error("Library Image with this Id not found");
  }

  if (request.body.isDefault === true) {
    request.body.photoLibraryId = result.photoLibraryId;
    await isDefaultFalseQuery(request.body, fastify, request);
    global.tblLibraryImages.forEach((item) => {
      if (
        item.id !== request.body.id &&
        item.photoLibraryId === result.photoLibraryId
      ) {
        item.isDefault = false;
      }
    });
  }
  await isDefaultChangeQuery(request.body, fastify, request);
  const index = global.tblLibraryImages.findIndex(
    (item) => item.id === request.body.id
  );

  if (index !== -1) {
    global.tblLibraryImages[index].isDefault = request.body.isDefault;
  }

  await callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "isDefault",
         data: {
          id: request.body.id,
          isDefault: request.body.isDefault,
          photoLibraryId: result.photoLibraryId
         }
       }
    }, request, fastify,
    "services/photoLibrary.js/updateIsDefultService"
  );

  return `IsDefault updated successfully`;
};

const updatePhotoLibraryStatusService = async (request, fastify) => {
  const { photoLibraryId, isActive } = request.body;
  await updatePhotoLibraryStatusQuery(
    { photoLibraryId, isActive },
    fastify,
    request
  );
  const index = global.tblPhotoLibrary.findIndex(
    p => String(p.photoLibraryId) === String(photoLibraryId)
  );
  if (index !== -1) {
    global.tblPhotoLibrary[index].isActive = isActive;
  }
  return {
    photoLibraryId,
    isActive
  };
};

const updatePhotoLibraryDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await updatePhotoLibraryDisplayOrderQuery(item, fastify, request);
    const index = global.tblPhotoLibrary.findIndex(
      (library) => library.photoLibraryId === item.photoLibraryId
    );
    if (index !== -1) {
      global.tblPhotoLibrary[index].displayOrder = item.displayOrder;
    }
  }
  const now = Date.now();
  let allActiveData = global.tblPhotoLibrary.filter(item => 
    item.isActive === true && (item.isPermanent === true || 
      (
        new Date(item.startDate).getTime() <= now &&
        new Date(item.endDate).getTime() >= now
      )
    )
  );

  global.pendingPhotoLibraryToClient = global.pendingPhotoLibraryToClient.filter(item => allActiveData.map(item => item.photoLibraryId).includes(item.photoLibraryId));

  await callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'libraryImage',
      type: "changeDisplayOrder",
      data: allActiveData
    }
  }, request, fastify,
    "services/photoLibrary.js/updatePhotoLibraryDisplayOrderService"
  );
  return "Photo library display order updated successfully";
};

const getPhotoLibraryCommentaryService = async () => {
  const wrCommentaryStatus = [
    commentaryStatus.COMPLETED,
    commentaryStatus.CANCELLED,
    commentaryStatus.ABANDONED
  ];
  let data = global.tblCommentaries
    .filter(item =>
      !wrCommentaryStatus.includes(Number(item.commentaryStatus))
    )
    .map(item => ({
      commentaryId: item.commentaryId,
      eventRefId: item.eventRefId,
      eventName: item.eventName,
      eventDate: item.eventDate,
      commentaryStatus: item.commentaryStatus
    }));
  return data;
};

const sendActivePhotoLibraryToClientAPIService = async (fastify) => {
  try {
    if (global.pendingPhotoLibraryToClient.length > 0) {
      const now = Date.now();
      for (const data of global.pendingPhotoLibraryToClient) {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();

        const result = start <= now && end >= now;
        if (result) {
          global.pendingPhotoLibraryToClient = global.pendingPhotoLibraryToClient.filter(item => item.photoLibraryId !== data.photoLibraryId);
          await callClientAPI(
            {
              serviceType: ServiceType.clientAPI,
              moduleType: APIEndpointModuleType.updateSeoModule,
              data: {
                module: 'photoLibrary',
                type: "add",
                data: data
              }
            },
            null,
            fastify,
            "services/photoLibrary.js/sendActivePhotoLibraryToClientAPIService"
          );
        }
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/photoLibrary.js/sendActivePhotoLibraryToClientAPIService",
      null
    );
  }
}

module.exports = {
  allPhotoLibraryService,
  getAllLibraryImagesService,
  allLibraryImagesService,
  photoLibraryById,
  libraryImageById,
  createPhotoLibraryService,
  createLibraryImageService,
  deletePhotoLibraryService,
  deleteLibraryImagesService,
  updateDisplayOrderService,
  updateIsDefultService,
  updatePhotoLibraryStatusService,
  updatePhotoLibraryDisplayOrderService,
  getPhotoLibraryCommentaryService,
  sendActivePhotoLibraryToClientAPIService
};
