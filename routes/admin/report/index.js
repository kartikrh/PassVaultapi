const { checkPermission, authorize } = require("../../../controller/middleware");
const { getAllUndoReportByType } = require("../../../controller/users/admin/report");
const { Report } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/allUndoReportByType", {
        schema: Report.undoLogsByCommentaryWise.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Reports",
                mode: "view"
            })
        ],
        handler: (request, reply) => getAllUndoReportByType(request, reply, fastify)
    })
};