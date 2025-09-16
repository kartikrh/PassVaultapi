const { checkPermission, authorize } = require("../../../controller/middleware");
const { allUndoLogsByCommentaryWise, allUndoLogsByUserWise } = require("../../../controller/users/admin/report");
const { Report } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/undoLogsByCommentaryWise", {
        schema: Report.undoLogsByCommentaryWise.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "report",
                mode: "view"
            })
        ],
        handler: (request, reply) => allUndoLogsByCommentaryWise(request, reply, fastify)
    })
    fastify.post("/undoLogsByUserWise", {
        schema: Report.undoLogsByUserWise.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "report",
                mode: "view"
            })
        ],
        handler: (request, reply) => allUndoLogsByUserWise(request, reply, fastify)
    })
};