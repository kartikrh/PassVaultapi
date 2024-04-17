const { insertActivityLogQuery, updateActivityLogQuery } = require("../repository/TableActivityLog");

  
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
  
    global.tblActivityLog.push(data[0]);
  
    return data;
  };
  const updateActivityLogService = async (request, fastify) => {
    // validate the activityLogIdId
    const validateActivityLogId = global.tblActivityLog.find(
      (item) => item.activityLogIdId === request.body.activityLogIdId
    );
    if (!validateActivityLogId) {
      throw new Error("Activity Log with this Id not found");
    }
    const body = {
      activityLogIdId: request.body.activityLogIdId,
      activityType: request.body.activityType || validateActivityLogId.activityType,
      refId: request.body.refId || validateActivityLogId.refId,
      ipAddress: request.body.ipAddress || validateActivityLogId.ipAddress,
    };
  
    await updateActivityLogQuery(body, request, fastify);
    const index = global.tblActivityLog.findIndex(
      (item) => item.activityLogIdId === request.body.activityLogIdId
    );
    global.tblActivityLog[index] = body;
    return body;
  };

  module.exports = {
    saveActivityLogService
  };
  