const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { saveMatchType } = require("../../../controller/users/admin/matchType");
const { getByMatchType, saveMatchTypeData } = require("../../../controller/users/admin/matchTypeBowlingPredictor");
const { MatchTypeBowlingPredictor } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {  
    fastify.post("/byMatchType", {
        schema : MatchTypeBowlingPredictor.getByMatchType.schema,
        preHandler : [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Match Types",
                mode: "view"
            })
        ],
        handler : (request, reply) => getByMatchType(request, reply, fastify)
    });
    fastify.post("/save", {
        schema : MatchTypeBowlingPredictor.save.schema,
        preHandler : [
            (request, reply) => authorize(request, reply, fastify),
            (request, reply) => checkPermission(request, reply, fastify, {
                tabName: "Match Types",
                mode: "edit"
            })
        ],
        handler : (request, reply) => saveMatchTypeData(request, reply, fastify)
    });
    
};