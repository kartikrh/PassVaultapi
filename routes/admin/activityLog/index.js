const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { saveActivityLog, getAllActivityLog, getActivityLogById, deleteActivityLog } = require("../../../controller/users/admin/activityLog");
const { ActivityLog } = require("../../../swaggerSchema/groupTags/schema");
  
  module.exports = async (fastify, opts) => {
    fastify.post("/all", {
      schema: ActivityLog.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "ActivityLog",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllActivityLog(request, reply, fastify),
    });

    fastify.post("/getAllActivityLog", {
      schema: ActivityLog.getAll.schema,
      handler: (request, reply) => getAllActivityLog(request, reply, fastify),
    });

    fastify.post("/byId", {
      schema: ActivityLog.getById.schema,
      // preHandler: [
      //   (request, reply) => authorize(request, reply, fastify),
      //   (request, reply, done) =>
      //     checkPermission(request, reply, fastify, {
      //       tabName: "ActivityLog",
      //       mode: "view",
      //     }),
      // ],
      handler: (request, reply) => getActivityLogById(request, reply, fastify),
    });

    fastify.post("/save", {
      schema: ActivityLog.save.schema,
      // preHandler: [
      //   (request, reply) => authorize(request, reply, fastify),
      //   (request, reply, done) =>
      //     checkPermission(request, reply, fastify, {
      //       tabName: "ActivityLog",
      //       mode: request.body.ActivityLogId === 0 ? "add" : "edit",
      //     }),
      // ],
      handler: (request, reply) => saveActivityLog(request, reply, fastify),
    });

    fastify.post("/delete", {
      schema: ActivityLog.delete.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "ActivityLog",
            mode: "delete",
          }),
      ],
      handler: (request, reply) => deleteActivityLog(request, reply, fastify),
    });
};
  