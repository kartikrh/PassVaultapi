const {
  insertArticleQuery,
  deleteArticleQuery,
  updateArticleQuery,
  activeInactiveArticleQuery,
} = require("../repository/TableArticles");
const {
  callClientAPI,
  ServiceType,
  APIEndpointModuleType,
} = require("../utilities");
const {
  generateImageName,
  storeImageOnServer,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const getAllArticlesService = async (request, fastify) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    const result = global.tblArticles.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblArticles.filter((item) => item.isActive === true);
    return result;
  }
};

const articleByIdService = async (request, fastify) => {
  const { id } = request.body;
  return global.tblArticles.find((item) => item.id === id) || null;
};

const saveArticleService = async (request, fastify) => {
  const { id } = request.body;
  if (id === 0) {
    return await createArticleService(request, fastify);
  } else {
    return await updateArticleService(request, fastify);
  }
};

const createArticleService = async (request, fastify) => {
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
      ...ImgModuleConfig.Article,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath;
  }
  const data = await insertArticleQuery(
    {
      ...request.body,
      userId: request.userTokenInfo.WrUserId,
    },
    request,
    fastify
  );

  global.tblArticles.push(data[0]);

  return data[0];
};

const updateArticleService = async (request, fastify) => {
  const validateid = global.tblArticles.find(
    (item) => item.id === request.body.id
  );

  if (!validateid) {
    throw new Error("Article with this Id not found");
  }

  const body = {
    id: request.body.id,
    title: request.body.title || validateid.title,
    article: request.body.article || validateid.article,
    isActive: request.body.hasOwnProperty("isActive")
      ? request.body.isActive
      : validateid.isActive,
    isPermanent: request.body.hasOwnProperty("isPermanent")
      ? request.body.isPermanent
      : validateid.isPermanent,
    startDate: request.body.startDate || validateid.startDate,
    endDate: request.body.endDate || validateid.endDate,
    image: validateid.image,
    userId: request.userTokenInfo.WrUserId,
    tags: request.body.tags || validateid.tags,
    viewerCount: request.body.viewerCount || validateid.viewerCount,
    credit: request.body.credit || validateid.credit,
    SEO: request.body.SEO || validateid.SEO,
    SEODescription: request.body.SEODescription || validateid.SEODescription,
    imagePath: validateid.imagePath,
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
      ...ImgModuleConfig.Article,
    });
    body.image = fullPath;
    body.imagePath = imagePath;
  }

  const updatedData = await updateArticleQuery(body, request, fastify);

  const index = global.tblArticles.findIndex(
    (item) => item.id === request.body.id
  );

  if (index !== -1) {
    global.tblArticles[index] = updatedData[0]
  }

  return updatedData[0];
};

const deleteArticleService = async (request, fastify) => {
  const { id } = request.body;

  for (const ArticleId of id) {
    const validateid = global.tblArticles.find((item) => item.id === ArticleId);
    if (validateid && validateid.image) {
      await removeImageFromServer({
        path: validateid.image,
      });
    }
  }

  await deleteArticleQuery(id, request, fastify);
  global.tblArticles = global.tblArticles.filter(
    (item) => !id.includes(item.id)
  );

  return `Article deleted successfully`;
};

const activeInactiveArticleService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateid = global.tblArticles.find((item) => item.id === id);
  if (!validateid) {
    throw new Error("Article with this Id not found");
  }
  await activeInactiveArticleQuery(
    {
      id,
      isActive,
      userId: request.userTokenInfo.WrUserId,
    },
    request,
    fastify
  );

  const index = global.tblArticles.findIndex((item) => item.id === id);
  if (index !== -1) {
    global.tblArticles[index].isActive = isActive;
  }
  
  return `Article updated successfully`;
};

module.exports = {
  getAllArticlesService,
  articleByIdService,
  saveArticleService,
  deleteArticleService,
  activeInactiveArticleService,
};
