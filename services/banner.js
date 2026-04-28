const { insertBannerQuery, updateBannerQuery, deleteBannerQuery, activeInactiveBannerQuery, updateDisplayOrderBannerQuery } = require("../repository/TableBanner");
  const {
    generateImageName,
    storeImageOnServer,
    removeImageFromServer,
  } = require("../utilities/Images");
  const { PROJECT_NAME } = require("../utilities/configConstants");
  const { ImgModuleConfig } = require("../utilities/imageConstant");
  const { APIEndpointModuleType, ServiceType, callClientAPI, getDataFromTime } = require("../utilities");
  // const { handleSitemapUpdate } = require("../utilities/SEOIndexing")
  
  const getAllBannerService = async (request, fastify) => {
    const { isActive, dateTime ,isPermanent , startDate, endDate} = request.body;
    let data = global.tblBanner;
    if(isActive != undefined){
      data = data.filter((i)=> i.isActive == Boolean(isActive))
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
      data = getDataFromTime(data, "pendingBannerToClient");
    }

    return data;
  };
  
  const bannerByIdService = async (request, fastify) => {
    const { bannerId } = request.body;
    return global.tblBanner.find((item) => item.bannerId === bannerId) || null;
  };
  const saveBannerService = async (request, fastify) => {
    const { bannerId } = request.body;
    if (bannerId === 0) {
      return await createBannerService(request, fastify);
    } else {
      return await updateBannerService(request, fastify);
    }
  };
  const createBannerService = async (request, fastify) => {
    // if image is uploaded then upload it to server
    if (request.body.image && request.body.image.length) {
      const imgName = generateImageName({
        name: request.body.title,
      });
  
      const projectName = global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      )?.value;
      
      const { fullPath, imagePath } = await storeImageOnServer({
        image: request.body.image[0],
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.Banner,
      });
      request.body.image = fullPath;
      request.body.imagePath = imagePath;
    }
    const data = await insertBannerQuery(
      {
        ...request.body,
        userId: request.userTokenInfo.WrUserId,
      },
      request,
      fastify
    );

    const now = Date.now();
    let sendToClient = false;
    if (data.isActive) {
      if (data.isPermanent) {
        sendToClient = true;
      } else if (data.startDate <= now && data.endDate >= now) {
        sendToClient = true;
      }
    }
    if (sendToClient) {
      await callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.updateBanner,
          data: data
        },
        request,
        fastify,
        "services/banner.js/createBannerService"
      );
    }
  
    global.tblBanner.push(data[0]);

    // const urlId = data[0].bannerId;
    // const urlEndPoint = data[0].title.replace(/ /g, "-");
  
    // await handleSitemapUpdate(`banners/${urlId}/${urlEndPoint}`)
  
    return data;
  };
  const updateBannerService = async (request, fastify) => {
    // validate the bannerId
    const validateBannerId = global.tblBanner.find(
      (item) => item.bannerId === request.body.bannerId
    );
    if (!validateBannerId) {
      throw new Error("Banner with this Id not found");
    }
    // if image is uploaded then upload it to server
    const body = {
      bannerId: request.body.bannerId,
      title: request.body.title || validateBannerId.title,
      bannerType: request.body.bannerType || validateBannerId.bannerType,
      isActive: request.body.hasOwnProperty("isActive")
        ? request.body.isActive
        : validateBannerId.isActive,
      isPermanent: request.body.hasOwnProperty("isPermanent")
        ? request.body.isPermanent
        : validateBannerId.isPermanent,
      startDate: request.body.startDate || validateBannerId.startDate,
      endDate: request.body.endDate || validateBannerId.endDate,
      image: validateBannerId.image,
      userId: request.userTokenInfo.WrUserId,
      link: request.body.link,
      viewerCount: validateBannerId.viewerCount,
      imagePath: validateBannerId.imagePath,
      deviceTypeId: Number(request.body.deviceTypeId) || validateBannerId?.deviceTypeId,
      whitelabelId: Number(request.body.whitelabelId) || validateBannerId?.whitelabelId,
      displayOrder: request.body.hasOwnProperty("displayOrder")
      ? request.body.displayOrder
      : (
          validateBannerId.displayOrder ??
          Math.max(...global.tblBanner.map(item => item.displayOrder || 0)) + 1
        )
    };
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
        ...ImgModuleConfig.Banner,
      });
      body.image = fullPath;
      body.imagePath = imagePath;
    }
  
    await updateBannerQuery(body, request, fastify);
    const whiteLabelData = global.tblWhitelabels.find(
      (item) => item.id == body.whitelabelId
    );
    body.domain = whiteLabelData?.domain ?? null
    body.encryptWhitelabelId = whiteLabelData?.whitelabelId ?? null

    global.pendingBannerToClient = global.pendingBannerToClient.filter(item => item.bannerId !== body.bannerId);

    await callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : body
      },
      request,
      fastify,
      "services/banner.js/updateBannerService"
    );
    const index = global.tblBanner.findIndex(
      (item) => item.bannerId === request.body.bannerId
    );
    global.tblBanner[index] = body;
    return body;
  };
  const deleteBannerService = async (request, fastify) => {
    const { bannerId } = request.body;
    // validate the bannerId
    for (const id of bannerId) {
      const validateBannerId = global.tblBanner.find((item) => item.bannerId === id);
      if (validateBannerId && validateBannerId.image) {
        // delete the image from server
        await removeImageFromServer({
          path: validateBannerId.image,
        });
      }
    }
    // delete the banner
    await deleteBannerQuery(bannerId, request, fastify);

    global.pendingBannerToClient = global.pendingBannerToClient.filter(item => item.bannerId !== bannerId);

    await callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : {
          type : "delete",
          bannerId : bannerId
        }
      },
      request,
      fastify,
      "services/banner.js/deleteBannerService"
    );
    global.tblBanner = global.tblBanner.filter(
      (item) => !bannerId.includes(item.bannerId)
    );
    return `Banner deleted successfully`;
  };
  const activeInactiveBannerService = async (request, fastify) => {
    //validate the bannerId
    const { bannerId, isActive } = request.body;
    const validateBannerId = global.tblBanner.find((item) => item.bannerId === bannerId);
    if (!validateBannerId) {
      throw new Error("Banner with this Id not found");
    }
    await activeInactiveBannerQuery(
      {
        bannerId,
        isActive,
        userId: request.userTokenInfo.WrUserId,
      },
      request,
      fastify
    );

    global.pendingBannerToClient = global.pendingBannerToClient.filter(item => item.bannerId !== bannerId);

    await callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : {
          type: "status",
          bannerId : bannerId,
          isActive: isActive
        }
      },
      request,
      fastify,
      "services/banner.js/activeInactiveBannerService"
    );
  
    const index = global.tblBanner.findIndex((item) => item.bannerId === bannerId);
    global.tblBanner[index].isActive = isActive;
  
    return `Banner updated successfully`;
  };

  const updateDisplayOrderBannerService = async (request, fastify) => {
  for (const item of request.body) {
    await updateDisplayOrderBannerQuery(item, request, fastify);
    let index = global.tblBanner.findIndex(
      (elem) => elem.bannerId === item.bannerId
    );
    if (index !== -1) {
      global.tblBanner[index].displayOrder = item.displayOrder;
    }
  }
  const now = Date.now();
  let allActiveData = global.tblBanner.filter(item => 
    item.isActive === true && (item.isPermanent === true || 
      (
        new Date(item.startDate).getTime() <= now &&
        new Date(item.endDate).getTime() >= now
      )
    )
  );

  global.pendingBannerToClient = global.pendingBannerToClient.filter(item => allActiveData.map(item => item.bannerId).includes(item.bannerId));

  await callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateBanner,
      data: {
        type: "changeDisplayOrder",
        data: allActiveData
      }
    },
    request,
    fastify,
    "services/banner.js/updateDisplayOrderBannerService"
  );

  return `Display order updated successfully`;
};

const sendActiveBannerToClientAPIService = async (fastify) => {
  try {
    if (global.pendingBannerToClient.length > 0) {
      const now = Date.now();
      for (const data of global.pendingBannerToClient) {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();

        const result = start <= now && end >= now;
        if (result) {
          global.pendingBannerToClient = global.pendingBannerToClient.filter(item => item.bannerId !== data.bannerId);
          await callClientAPI(
            {
              serviceType: ServiceType.clientAPI,
              moduleType: APIEndpointModuleType.updateBanner,
              data: data
            },
            null,
            fastify,
            "services/banner.js/sendActiveBannerToClientAPIService"
          );
        }
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/banner.js/sendActiveBannerToClientAPIService",
      null
    )
  }
}

  module.exports = {
    getAllBannerService,
    bannerByIdService,
    saveBannerService,
    deleteBannerService,
    activeInactiveBannerService,
    updateDisplayOrderBannerService,
    sendActiveBannerToClientAPIService
  };
  