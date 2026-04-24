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
const { commentaryStatus } = require("../utilities/index");
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
          module: 'photoLibrary',
          type: "add",
          data: saveData
        }
      }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/photoLibrary.js/savePhotoLibraryService - callClientAPI",
          request
        );
      });
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

  callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'photoLibrary',
         type: "update",
         data: modifiedData
       }
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/editPhotoLibraryService - callClientAPI",
       request
     );
   });

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

  callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "add",
         data: saveData
       }
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/saveLibraryImageService - callClientAPI",
       request
     );
   });

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

  callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "update",
         data: modifiedData[0]
       }
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/editLibraryImageService - callClientAPI",
       request
     );
   });
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
    const now = Date.now();
    data = data.filter(item => {
      if (item.isPermanent) return true;

      const start = new Date(item.startDate).getTime();
      const end = new Date(item.endDate).getTime();

      return start <= now && end >= now;
    });
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

  callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'photoLibrary',
      type: "delete",
      data: {
        photoLibraryId: photoLibraryId
      }
    }
  }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/deletePhotoLibraryService - callClientAPI",
       request
     );
   });

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

  callClientAPI(
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
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/deleteLibraryImagesService - callClientAPI",
       request
     );
   });

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

  callClientAPI(
    {
       serviceType: ServiceType.clientAPI,
       moduleType: APIEndpointModuleType.updateSeoModule,
       data: {
         module: 'libraryImage',
         type: "displayOrder",
         data: request.body
       }
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/updateDisplayOrderService - callClientAPI",
       request
     );
   });

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

  callClientAPI(
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
    }, request, fastify)
   .catch((err) => {
     errorLogger(
       fastify,
       err.message,
       "services/photoLibrary.js/updateIsDefultService - callClientAPI",
       request
     );
   });

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
    item.isActive === true && (item.isPermanent === true || (item.startDate <= now && item.endDate >= now))
  );
  callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.updateSeoModule,
    data: {
      module: 'libraryImage',
      type: "changeDisplayOrder",
      data: allActiveData
    }
  }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/photoLibrary.js/updatePhotoLibraryDisplayOrderService - callClientAPI",
        request
      );
    });
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
};
