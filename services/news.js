const {
  insertNewsQuery,
  deleteNewsQuery,
  updateNewsQuery,
  activeInactiveNewsQuery,
  changeeDisplayOrderQuery
} = require("../repository/TableNews");
const { callClientAPI, ServiceType, APIEndpointModuleType } = require("../utilities");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
// const { handleSitemapUpdate } = require("../utilities/SEOIndexing")

const getAllNewsService = async (request, fastify) => {
  const { isActive, type, dateTime, isPermanent, startDate, endDate } = request.body;
  let result = global.tblNews;
  if (isActive !== undefined) {
    result = result.filter((item) => item.isActive === isActive);
  }
  if (type) {
    result = result.filter((item) => item.type === type);
  }
  if (isPermanent != undefined) {
    result = result.filter((i) => i.isPermanent == Boolean(isPermanent))
  }
  if (startDate && endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    result = result.filter(item => {
      if (item.isPermanent) return false; // optional

      const stDate = new Date(item.startDate).getTime();
      const enDate = new Date(item.endDate).getTime();

      return stDate <= end && enDate >= start;
    });
  }

  if (dateTime) {
    const now = Date.now();
    result = result.filter(item => {
      if (item.isPermanent) return true;

      const start = new Date(item.startDate).getTime();
      const end = new Date(item.endDate).getTime();
      const result = start <= now && end >= now;
      if (!result) {
        global.pendingNewsToClient.push(item);
      }

      return result;
    });
  }
  return result;
};

const newsByIdService = async (request, fastify) => {
  const { newsId } = request.body;
  return global.tblNews.find((item) => item.newsId === newsId) || null;
};
const saveNewsService = async (request, fastify) => {
  const { newsId } = request.body;
  if (newsId === 0) {
    return await createNewsService(request, fastify);
  } else {
    return await updateNewsService(request, fastify);
  }
};
const createNewsService = async (request, fastify) => {
  // if image is uploaded then upload it to server
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
      ...ImgModuleConfig.News,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }
  const data = await insertNewsQuery(
    {
      ...request.body,
      type: request.body.type === "news" ? 1 : Number(request.body.type) || 0,
      userId: request.userTokenInfo.WrUserId,
    },
    request,
    fastify
  );

  global.tblNews.push(data[0]);

  // const urlId = data[0].newsId;
  // const urlEndPoint = data[0].title.replace(/ /g, "-");

  // await handleSitemapUpdate(`news/${urlId}/${urlEndPoint}`)

  const now = Date.now();
  let sendToClient = false;
  if (data[0].isActive) {
    if (data[0].isPermanent) {
      sendToClient = true;
    } else if (data[0].startDate <= now && data[0].endDate >= now) {
      sendToClient = true;
    }
  }
  if (sendToClient) {
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'news',
          type: "add",
          data: data[0]
        }
      }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/news.js/createNewsService - callClientAPI",
          request
        );
      });
  }

  return data;
};
const updateNewsService = async (request, fastify) => {
  // validate the newsId
  const validateNewsId = global.tblNews.find(
    (item) => item.newsId === request.body.newsId
  );
  if (!validateNewsId) {
    throw new Error("News with this Id not found");
  }
  // if image is uploaded then upload it to server
  const body = {
    newsId: request.body.newsId,
    title: request.body.title || validateNewsId.title,
    news: request.body.news || validateNewsId.news,
    isActive: request.body.hasOwnProperty("isActive")
      ? request.body.isActive
      : validateNewsId.isActive,
    isPermanent: request.body.hasOwnProperty("isPermanent")
      ? request.body.isPermanent
      : validateNewsId.isPermanent,
    startDate: request.body.startDate || validateNewsId.startDate,
    endDate: request.body.endDate || validateNewsId.endDate,
    image: validateNewsId.image,
    userId: request.userTokenInfo.WrUserId,
    tags: request.body.tags,
    viewerCount: request.body.viewerCount,
    credit: request.body.credit || validateNewsId.credit,
    SEO: request.body.SEO || validateNewsId.SEO,
    type: request.body.type || validateNewsId.type,
    SEODescription: request.body.SEODescription || validateNewsId.SEODescription,
    imagePath: validateNewsId.imagePath,

    displayOrder: request.body.hasOwnProperty("displayOrder")
      ? request.body.displayOrder
      : (
        validateNewsId.displayOrder ??
        Math.max(...global.tblNews.map(item => item.displayOrder || 0)) + 1
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
      ...ImgModuleConfig.News,
    });
    body.image = fullPath;
    body.imagePath = imagePath;
  }

  await updateNewsQuery(body, request, fastify);
  const whiteLabelData = global.tblWhitelabels.find(
    (item) => item.id == body.whitelabelId
  );
  body.domain = whiteLabelData?.domain ?? null
  body.encryptWhitelabelId = whiteLabelData?.whitelabelId ?? null
  const index = global.tblNews.findIndex(
    (item) => item.newsId === request.body.newsId
  );
  global.tblNews[index] = body;
  global.pendingNewsToClient = global.pendingNewsToClient.filter(item => item.newsId !== body.newsId);
  if(body.isActive){
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'news',
          type: "update",
          data: body
        }
      }, request, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/news.js/createNewsService - callClientAPI",
          request
        );
      });
  }
  return body;
};
const deleteNewsService = async (request, fastify) => {
  const { newsId } = request.body;
  // validate the newsId
  for (const id of newsId) {
    const validateNewsId = global.tblNews.find((item) => item.newsId === id);
    if (validateNewsId && validateNewsId.image) {
      // delete the image from server
      await removeImageFromServer({
        path: validateNewsId.image,
      });
    }
  }
  // delete the news
  await deleteNewsQuery(newsId, request, fastify);
  global.tblNews = global.tblNews.filter(
    (item) => !newsId.includes(item.newsId)
  );
  
  global.pendingNewsToClient = global.pendingNewsToClient.filter(item => !newsId.includes(item.newsId));

    callClientAPI({
      serviceType : ServiceType.clientAPI,
      moduleType : APIEndpointModuleType.updateSeoModule,
      data : {
        module : 'news',
        type : "delete",
        data : {
          newsId : newsId
        }
      }
    }
  }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/news.js/createNewsService - callClientAPI",
        request
      );
    });
  return `News deleted successfully`;
};
const activeInactiveNewsService = async (request, fastify) => {
  //validate the newsId
  const { newsId, isActive } = request.body;
  const validateNewsId = global.tblNews.find((item) => item.newsId === newsId);
  if (!validateNewsId) {
    throw new Error("News with this Id not found");
  }
  await activeInactiveNewsQuery(
    {
      newsId,
      isActive,
      userId: request.userTokenInfo.WrUserId,
    },
    request,
    fastify
  );

  const index = global.tblNews.findIndex((item) => item.newsId === newsId);
  global.tblNews[index].isActive = isActive;

  global.pendingNewsToClient = global.pendingNewsToClient.filter(item => item.newsId !== newsId);

    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'news',
          type : isActive ? "active" : "inactive",
          data : global.tblNews[index]
        }
      }, request, fastify)
    .catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "services/news.js/createNewsService - callClientAPI",
        request
      );
    });

  return `News updated successfully`;
};

const changeDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
    await changeeDisplayOrderQuery(item, request, fastify);
    const index = global.tblNews.findIndex(
      elem => elem.newsId === item.newsId
    );
    if (index !== -1) {
      global.tblNews[index].displayOrder = item.displayOrder;
    }
  }
  return "Display order updated successfully";
};
const sendActiveNewsToClientAPIService = async (fastify) => {
  try {
    if (global.pendingNewsToClient.length > 0) {
      const now = Date.now();
      for (const data of global.pendingNewsToClient) {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();

        const result = start <= now && end >= now;
        if (result) {
          callClientAPI(
            {
              serviceType: ServiceType.clientAPI,
              moduleType: APIEndpointModuleType.updateSeoModule,
              data: {
                module: 'news',
                type: "add",
                data: data
              }
            },
            null,
            fastify
          ).then(res => {
            global.pendingNewsToClient = global.pendingNewsToClient.filter(item => item.newsId !== data.newsId);
          }).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/news.js.js/sendActiveNewsToClientAPIService- callClientAPI",
              null
            );
          });
        }
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/news.js.js/sendActiveNewsToClientAPIService",
      null
    );
  }
}

module.exports = {
  getAllNewsService,
  newsByIdService,
  saveNewsService,
  deleteNewsService,
  activeInactiveNewsService,
  changeDisplayOrderService,
  sendActiveNewsToClientAPIService
};
