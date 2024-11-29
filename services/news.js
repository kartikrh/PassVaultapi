const {
  insertNewsQuery,
  deleteNewsQuery,
  updateNewsQuery,
  activeInactiveNewsQuery,
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
  const { isActive , type } = request.body;
  let result = global.tblNews;
  if(isActive !== undefined){
    result = result.filter((item) => item.isActive === isActive);
  }
  if(type){
    result = result.filter((item) => item.type === type);
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
    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.News,
    });
    request.body.image = path;
  }
  const data = await insertNewsQuery(
    {
      ...request.body,
      userId: request.userTokenInfo.WrUserId,
    },
    request,
    fastify
  );

  global.tblNews.push(data[0]);
  
  // const urlId = data[0].newsId;
  // const urlEndPoint = data[0].title.replace(/ /g, "-");

  // await handleSitemapUpdate(`news/${urlId}/${urlEndPoint}`)

  if(data[0].isActive){
    callClientAPI(
     {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'news',
          type : "add",
          data : data[0]
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
    credit : request.body.credit || validateNewsId.credit,
    SEO : request.body.SEO || validateNewsId.SEO,
    SEODescription : request.body.SEODescription || validateNewsId.SEODescription
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
      ...ImgModuleConfig.News,
    });
    body.image = path;
  }

  await updateNewsQuery(body, request, fastify);
  const index = global.tblNews.findIndex(
    (item) => item.newsId === request.body.newsId
  );
  global.tblNews[index] = body;
  if(body.isActive){
    callClientAPI(
      {
        serviceType : ServiceType.clientAPI,
        moduleType : APIEndpointModuleType.updateSeoModule,
        data : {
          module : 'news',
          type : "update",
          data : body
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
module.exports = {
  getAllNewsService,
  newsByIdService,
  saveNewsService,
  deleteNewsService,
  activeInactiveNewsService,
};
