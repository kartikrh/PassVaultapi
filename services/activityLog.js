const {
  insertActivityLogQuery,
  updateActivityLogQuery,
  deleteActivityLogQuery,
} = require("../repository/TableActivityLog");
const { articleViewersCountQuery } = require("../repository/TableArticles");
const { ViewerType } = require("../utilities");

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
    // Per-whitelabel viewer-count tracking (Advertise/Banner/News/PhotoLibrary/VideoLibrary)
    // relied on the now-removed tblViewers table and has been removed.
  } else {
    const articleIndex = global.tblArticles.findIndex((item)=> item.id === parseInt(request.body.refId));
    await articleViewersCountQuery({ ...request.body },request,fastify);
    if (articleIndex !== -1) {
      global.tblArticles[articleIndex].viewerCount = (global.tblArticles[articleIndex].viewerCount || 0) + 1;
      viewerCount = global.tblArticles[articleIndex].viewerCount;
    }
  }
  global.tblActivityLogs.push(data[0]);

  return {
    ...data[0],
    viewerCount
  };
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
