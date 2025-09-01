const { authorize } = require("../../../controller/middleware");
const {
    getAllMTDismissalConfig,
} = require("../../../controller/users/admin/mtDismissalConfig");
const { MTDismissalConfig } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/extraData", {
        schema: MTDismissalConfig.getAllExtraData.schema,
        handler: (request, reply) => getAllMTDismissalConfig(request, reply, fastify),
    });
};
