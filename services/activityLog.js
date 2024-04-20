const {
  insertActivityLogQuery,
  updateActivityLogQuery,
  deleteActivityLogQuery,
} = require("../repository/TableActivityLog");

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
  const data = await insertActivityLogQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );

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
