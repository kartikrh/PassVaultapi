const { getallCommentaryScoringLogs, createCommentaryScoringLogs } = require("../../../controller/users/admin/commentaryScoringLogs/index");
const { CommentaryScoringLogs } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema : CommentaryScoringLogs.getAll.schema,
        handler: (request, reply) => getallCommentaryScoringLogs(request, reply, fastify)
    });

    fastify.post("/save", {
        schema : CommentaryScoringLogs.save.schema,
        handler: (request, reply) => createCommentaryScoringLogs(request, reply, fastify)
    });
}