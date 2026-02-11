const { authorize, checkPermission } = require("../../../controller/middleware");
const { getTeamMatchTypeByTeamId, saveTeamMatchTypeByTeamId, updateTeamMatchDataTypeByTeamId, activeInactiveTeamMatchDataTypeByTeamId, deleteTeamMatchTypeByTeamId } = require("../../../controller/users/admin/teamMatchType");
const { TeamMatchType } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/byTeamId", {
        schema: TeamMatchType.getbyTeamId.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Teams",
                    mode: "view",
                }),
        ],
        handler: (request, reply) => getTeamMatchTypeByTeamId(request, reply, fastify),
    });
    fastify.post("/save", {
        schema: TeamMatchType.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Teams",
                    mode: "add",
                }),
        ],
        handler: (request, reply) => saveTeamMatchTypeByTeamId(request, reply, fastify),
    });
    fastify.post("/update", {
        schema: TeamMatchType.update.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Teams",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => updateTeamMatchDataTypeByTeamId(request, reply, fastify),
    });
    fastify.post("/activeInactive", {
        schema: TeamMatchType.activeInactive.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Teams",
                    mode: "edit",
                }),
        ],
        handler: (request, reply) => activeInactiveTeamMatchDataTypeByTeamId(request, reply, fastify),
    });
    fastify.post("/delete", {
        schema: TeamMatchType.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply, done) =>
                checkPermission(request, reply, fastify, {
                    tabName: "Teams",
                    mode: "delete",
                }),
        ],
        handler: (request, reply) => deleteTeamMatchTypeByTeamId(request, reply, fastify),
    });
}