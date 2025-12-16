const { authorize, checkPermission } = require("../../../controller/middleware");
const { getAllCompetitionStatistics, getCompetitionStatisticsById, saveCompetitionStatistics, deleteCompetitionStatistics, updateCompetitionStatisticsDisplayOrder, getCompetitionStatisticsByCompetitionId } = require("../../../controller/users/admin/competitionStatistics");
const { CompititionStatistics } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: CompititionStatistics.getAll.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getAllCompetitionStatistics(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: CompititionStatistics.getById.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getCompetitionStatisticsById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: CompititionStatistics.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: request.body.competitionStatisticsId === 0 ? "add" : "edit",
                }),
        ],
        handler: (request, reply) => saveCompetitionStatistics(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: CompititionStatistics.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteCompetitionStatistics(request, reply, fastify),
    });

    fastify.post("/changeDisplayOrder", {
        schema: CompititionStatistics.updateDisplayOrder.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => updateCompetitionStatisticsDisplayOrder(request, reply, fastify),
    });

    fastify.post("/getByCompetitionId", {
        schema: CompititionStatistics.getByCompetitionId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) =>
                checkPermission(request, reply, fastify, {
                    tabName: "competition",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getCompetitionStatisticsByCompetitionId(request, reply, fastify),
    });
}