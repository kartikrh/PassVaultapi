const { saveActivityLogService } = require("../../../../services/activityLog");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let commonPath = "controller/users/admin/activityLog/index.js";

const saveActivityLog = async (request, reply, fastify) => {
  try {
    const result = await saveActivityLogService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, commonPath + "/saveActivityLog", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
    saveActivityLog
};