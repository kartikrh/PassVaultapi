const { getallCommentaryScoringLogs, createCommentaryScoringLogs } = require("../../../controller/users/admin/commentaryScoringLogs/index");
const { CommentaryScoringLogs } = require("../../../swaggerSchema/groupTags/schema");
const { authorize, checkPermission, multiTabPermissionCheck } = require("../../../controller/middleware");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema : CommentaryScoringLogs.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
              multiTabPermissionCheck(request, reply, fastify, {
                tabName: ["Commentary" , "Commentary List"],
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
              multiTabPermissionCheck(request, reply, fastify, {
                tabName:[ "Commentary" , "Commentary List"],
                mode: "add",
              }),
          ],
        handler: (request, reply) => createCommentaryScoringLogs(request, reply, fastify)
    });
}