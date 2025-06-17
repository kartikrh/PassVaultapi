const { getallCommentaryScoringLogs, createCommentaryScoringLogs } = require("../../../controller/users/admin/commentaryScoringLogs/index");
const { CommentaryScoringLogs } = require("../../../swaggerSchema/groupTags/schema");
const { authorize, checkPermission, commentaryPermissionCheck } = require("../../../controller/middleware");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema : CommentaryScoringLogs.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
              commentaryPermissionCheck(request, reply, fastify, {
                tabName: "Commentary",
                mode: "view",
              }),
          ],
        handler: (request, reply) => getallCommentaryScoringLogs(request, reply, fastify)
    });

    fastify.post("/save", {
        schema : CommentaryScoringLogs.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
              commentaryPermissionCheck(request, reply, fastify, {
                tabName: "Commentary",
                mode: "add",
              }),
          ],
        handler: (request, reply) => createCommentaryScoringLogs(request, reply, fastify)
    });
}