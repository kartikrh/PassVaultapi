const { authorize, checkPermission } = require("../../../controller/middleware");
const { updateCompetitionStatisticsTypeDisplayOrder } = require("../../../controller/users/admin/competitionStatisticsType");
const { getAllCompetitionStatisticsType, getCompetitionStatisticsTypeById, saveCompetitionStatisticsType, deleteCompetitionStatisticsType } = require("../../../controller/users/admin/competitionStatisticsType");
const { CompititionStatisticsType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: CompititionStatisticsType.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Competition Statistics Type",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAllCompetitionStatisticsType(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: CompititionStatisticsType.getById.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Competition Statistics Type",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getCompetitionStatisticsTypeById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: CompititionStatisticsType.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Competition Statistics Type",
                    mode: request.body.competitionStatisticsTypeId === 0 ? "add" : "edit",
                }),
        ],
        handler: (request, reply) => saveCompetitionStatisticsType(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: CompititionStatisticsType.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Competition Statistics Type",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteCompetitionStatisticsType(request, reply, fastify),
    });

    fastify.post("/changeDisplayOrder", {
        schema: CompititionStatisticsType.updateDisplayOrder.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Competition Statistics Type",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => updateCompetitionStatisticsTypeDisplayOrder(request, reply, fastify),
    });
}