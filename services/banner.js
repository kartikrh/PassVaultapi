const { insertBannerQuery, updateBannerQuery, deleteBannerQuery, activeInactiveBannerQuery } = require("../repository/TableBanner");
  const {
    generateImageName,
    storeImageOnServer,
    removeImageFromServer,
  } = require("../utilities/Images");
  const { PROJECT_NAME } = require("../utilities/configConstants");
  const { ImgModuleConfig } = require("../utilities/imageConstant");
  const { APIEndpointModuleType, ServiceType, callClientAPI } = require("../utilities");
  // const { handleSitemapUpdate } = require("../utilities/SEOIndexing")
  
  const getAllBannerService = async (request, fastify) => {
    const { isActive } = request.body;
    if (isActive == undefined) {
      return global.tblBanner;
    }
    return global.tblBanner.filter((item) => item.isActive === isActive);
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
      
      const path = await storeImageOnServer({
        image: request.body.image[0],
        project: projectName,
        name: imgName,
        ...ImgModuleConfig.Banner,
      });
      request.body.image = path;
    }
    const data = await insertBannerQuery(
      {
        ...request.body,
        userId: request.userTokenInfo.WrUserId,
      },
      request,
      fastify
    );
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : data
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/banner/createBannerService",
        request
      )
    });
  
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
      viewerCount: request.body.viewerCount || validateBannerId.viewerCount
    };
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
        ...ImgModuleConfig.Banner,
      });
      body.image = path;
    }
  
    await updateBannerQuery(body, request, fastify);
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : body
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/banner/updateBannerService",
        request
      )
    });
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
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateBanner,
        data : {
          type : "delete",
          bannerId : bannerId
        }
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/banner/deleteBannerService",
        request
      )
    });
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
    callClientAPI(
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
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "API ERROR --> services/banner/activeInactiveBannerService",
        request
      )
    });
  
    const index = global.tblBanner.findIndex((item) => item.bannerId === bannerId);
    global.tblBanner[index].isActive = isActive;
  
    return `Banner updated successfully`;
  };
  module.exports = {
    getAllBannerService,
    bannerByIdService,
    saveBannerService,
    deleteBannerService,
    activeInactiveBannerService,
  };
  