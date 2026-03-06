const {
  insertActivityLogQuery,
  updateActivityLogQuery,
  deleteActivityLogQuery,
} = require("../repository/TableActivityLog");
const { bannerViewersCountQuery } = require("../repository/TableBanner");
const { newsViewersCountQuery } = require("../repository/TableNews");
const { articleViewersCountQuery } = require("../repository/TableArticles");

const getAllActivityLogService = async (request, fastify) => {
  return global.tblActivityLogs;
};

const activityLogByIdService = async (request, fastify) => {
  const { activityLogId } = request.body;
  return (
    global.tblActivityLogs.find(
      (item) => item.activityLogId === activityLogId
    ) || null
  );
};

const deleteActivityLogService = async (request, fastify) => {
  const { activityLogId } = request.body;
  // delete the activityLog
  await deleteActivityLogQuery(activityLogId, request, fastify);
  global.tblActivityLogs = global.tblActivityLogs.filter(
    (item) => !activityLogId.includes(item.activityLogId)
  );
  return `Activity Log deleted successfully`;
};

const saveActivityLogService = async (request, fastify) => {
  const { activityLogId } = request.body;
  if (activityLogId === 0) {
    return await createActivityLogService(request, fastify);
  } else {
    return await updateActivityLogService(request, fastify);
  }
};
const createActivityLogService = async (request, fastify) => {
  let data = await insertActivityLogQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );

  if(request?.body?.activityType === 1) {
    const newsIndex = global.tblNews.findIndex((item)=> item.newsId === parseInt(request.body.refId));
    await newsViewersCountQuery({ ...request.body },request,fastify);
    if (newsIndex !== -1) {
      global.tblNews[newsIndex].viewerCount = (global.tblNews[newsIndex].viewerCount || 0) + 1;
      if (data && data.length === 1) {
        data[0].count = global.tblNews[newsIndex].viewerCount;
      }
    }
  } else if(request?.body?.activityType === 2) {
    // const articleIndex = global.tblArticles.findIndex((item)=> item.id === parseInt(request.body.refId));
    // await articleViewersCountQuery({ ...request.body },request,fastify);
    // if (articleIndex !== -1) {
    //   global.tblArticles[articleIndex].viewerCount = (global.tblArticles[articleIndex].viewerCount || 0) + 1;
    // }
    const bannerIndex = global.tblBanner.findIndex((item)=> item.bannerId === parseInt(request.body.refId));
    await bannerViewersCountQuery({ ...request.body },request,fastify);
    if (bannerIndex !== -1) {
      global.tblBanner[bannerIndex].viewerCount = (global.tblBanner[bannerIndex].viewerCount || 0) + 1;
      if (data && data.length === 1) {
        data[0].count = global.tblBanner[bannerIndex].viewerCount;
      }
    }
  } else {
    // const bannerIndex = global.tblBanner.findIndex((item)=> item.bannerId === parseInt(request.body.refId));
    // await bannerViewersCountQuery({ ...request.body },request,fastify);
    // if (bannerIndex !== -1) {
    //   global.tblBanner[bannerIndex].viewerCount = (global.tblBanner[bannerIndex].viewerCount || 0) + 1;
    // }
    const articleIndex = global.tblArticles.findIndex((item)=> item.id === parseInt(request.body.refId));
    await articleViewersCountQuery({ ...request.body },request,fastify);
    if (articleIndex !== -1) {
      global.tblArticles[articleIndex].viewerCount = (global.tblArticles[articleIndex].viewerCount || 0) + 1;
    }
  }
  global.tblActivityLogs.push(data[0]);

  return data;
};
const updateActivityLogService = async (request, fastify) => {
  // validate the activityLogId
  const validateActivityLogId = global.tblActivityLogs.find(
    (item) => item.activityLogId === request.body.activityLogId
  );
  if (!validateActivityLogId) {
    throw new Error("Activity Log with this Id not found");
  }
  const body = {
    activityLogId: request.body.activityLogId,
    activityType:
      request.body.activityType || validateActivityLogId.activityType,
    refId: request.body.refId || validateActivityLogId.refId,
    ipAddress: request.body.ipAddress || validateActivityLogId.ipAddress,
  };

  await updateActivityLogQuery(body, request, fastify);
  const index = global.tblActivityLogs.findIndex(
    (item) => item.activityLogId === request.body.activityLogId
  );
  global.tblActivityLogs[index] = body;
  return body;
};

module.exports = {
  getAllActivityLogService,
  activityLogByIdService,
  saveActivityLogService,
  deleteActivityLogService,
};
