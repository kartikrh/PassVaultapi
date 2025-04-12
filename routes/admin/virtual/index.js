const { xKeyPermissionVirtual } = require("../../../controller/middleware")
const { saveEvent } = require("../../../controller/users/admin/virtual")
const { CompetitionEvent } = require("../../../swaggerSchema/groupTags/schema")

module.exports = async (fastify, opts) =>{
    fastify.post("/saveEvent", {
        schema : CompetitionEvent.saveEvent.schema,
        preHandler: [
            (request, reply) => xKeyPermissionVirtual(request, reply, fastify),
        ],
        handler: (request, reply) => saveEvent(request, reply, fastify),
    })
}