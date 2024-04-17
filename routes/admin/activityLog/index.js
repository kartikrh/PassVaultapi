const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { saveActivityLog } = require("../../../controller/users/admin/activityLog");
const { ActivityLog } = require("../../../swaggerSchema/groupTags/schema");
  
  module.exports = async (fastify, opts) => {

    fastify.post("/activityViewer/save", {
      schema: ActivityLog.activityViewer.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "ActivityLog",
            mode: request.body.ActivityLogId === 0 ? "add" : "edit",
          }),
      ],
      handler: (request, reply) => saveActivityLog(request, reply, fastify),
    });
};
  