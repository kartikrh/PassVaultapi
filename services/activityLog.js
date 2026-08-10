const {
  insertActivityLogQuery,
  updateActivityLogQuery,
  deleteActivityLogQuery,
} = require("../repository/TableActivityLog");
const { bannerViewersCountQuery } = require("../repository/TableBanner");
const { newsViewersCountQuery } = require("../repository/TableNews");
const { articleViewersCountQuery } = require("../repository/TableArticles");
const { updateAdvertiseViewCountQuery } = require("../repository/TableAdvertise");
const { updateVideoLibraryViewCountQuery } = require("../repository/TableVideoLibrary");
const { updatePhotoLibraryViewCountQuery } = require("../repository/TablePhotoLibrary");
const { ViewerType } = require("../utilities");
const { updateViewersQuery, insertViewersQuery } = require("../repository/TableViewers");

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
  const encryptedWhitelabelId = request.body?.whitelabelId;
  let whitelabelId = null;
  if (encryptedWhitelabelId) {
    whitelabelId = global.tblWhitelabels.find(item => item.encryptedWhitelabelId === encryptedWhitelabelId)?.id;
  }
  let data = await insertActivityLogQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );

  request.body.refId = Number(request.body.refId);
  let viewerCount = 0;
  if (Number(request?.body?.activityType || 0) > 0 && Object.values(ViewerType).includes(request?.body?.activityType)) {
    const activityType = Number(request?.body.activityType);
    const getExistsViewerCountIndex = global.tblViewers.findIndex(item => item.type === activityType && item.typeId === request.body.refId && item.whitelabelId === whitelabelId);
    if (getExistsViewerCountIndex !== -1) {
      const data = global.tblViewers[getExistsViewerCountIndex];
      await updateViewersQuery({
        ...request,
        body: {
          id: data.id
        }
      }, fastify);
      global.tblViewers[getExistsViewerCountIndex].viewerCount = (global.tblViewers[getExistsViewerCountIndex].viewerCount || 0) + 1;
      viewerCount = global.tblViewers[getExistsViewerCountIndex].viewerCount;
    } else {
      const data = await insertViewersQuery({
        ...request,
        body: {
          type: activityType,
          typeId: request.body.refId,
          whitelabelId
        }
      }, fastify);
      global.tblViewers.push(data);
      viewerCount = 1;
    }

    if (activityType === ViewerType.ADVERTISE) {
      const advertiseIndex = global.tblAdvertise.findIndex(item => item.advertiseId === request.body.refId);
      if (advertiseIndex !== -1) {
        global.tblAdvertise[advertiseIndex] = {
          ...global.tblAdvertise[advertiseIndex],
          whitelabelId: global.tblAdvertise[advertiseIndex].whitelabelId?.map(item => {
            if (item.id === whitelabelId) {
              return {
                ...item,
                viewerCount
              }
            }
            return item;
          })
        }
      }
    } else if (activityType === ViewerType.BANNER) {
      const bannerIndex = global.tblBanner.findIndex(item => item.bannerId === request.body.refId);
      if (bannerIndex !== -1) {
        global.tblBanner[bannerIndex] = {
          ...global.tblBanner[bannerIndex],
          whitelabelId: global.tblBanner[bannerIndex].whitelabelId?.map(item => {
            if (item.id === whitelabelId) {
              return {
                ...item,
                viewerCount
              }
            }
            return item;
          })
        }
      }
    } else if (activityType === ViewerType.NEWS) {
      const newsIndex = global.tblNews.findIndex(item => item.newsId === request.body.refId);
      if (newsIndex !== -1) {
        global.tblNews[newsIndex] = {
          ...global.tblNews[newsIndex],
          whitelabelId: global.tblNews[newsIndex].whitelabelId?.map(item => {
            if (item.id === whitelabelId) {
              return {
                ...item,
                viewerCount
              }
            }
            return item;
          })
        }
      }
    } else if (activityType === ViewerType.PHOTO_LIBRARY) {
      const photoLibraryIndex = global.tblPhotoLibrary.findIndex(item => item.photoLibraryId === request.body.refId);
      if (photoLibraryIndex !== -1) {
        global.tblPhotoLibrary[photoLibraryIndex] = {
          ...global.tblPhotoLibrary[photoLibraryIndex],
          whitelabelId: global.tblPhotoLibrary[photoLibraryIndex].whitelabelId?.map(item => {
            if (item.id === whitelabelId) {
              return {
                ...item,
                viewerCount
              }
            }
            return item;
          })
        }
      }
    } else if (activityType === ViewerType.VIDEO_LIBRARY) {
      const videoLibraryIndex = global.tblVideoLibrary.findIndex(item => item.id === request.body.refId);
      if (videoLibraryIndex !== -1) {
        global.tblVideoLibrary[videoLibraryIndex] = {
          ...global.tblVideoLibrary[videoLibraryIndex],
          whitelabelId: global.tblVideoLibrary[videoLibraryIndex].whitelabelId?.map(item => {
            if (item.id === whitelabelId) {
              return {
                ...item,
                viewerCount
              }
            }
            return item;
          })
        }
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
