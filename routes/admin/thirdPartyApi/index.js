const {
  getAllThirdPartyApis,
  thirdPartyApiseById,
  saveThirdPartyApis,
  deleteThirdPartApis,
  activeInactiveThirdPartyApis,
  isDefaultStage
} = require("../../../controller/users/admin/thirdPartyApi");
const { ThirdPartyApis } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: ThirdPartyApis.getAll.schema,
    handler: (request, reply) => getAllThirdPartyApis(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: ThirdPartyApis.getById.schema,
    handler: (request, reply) => thirdPartyApiseById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: ThirdPartyApis.save.schema,
    handler: (request, reply) => saveThirdPartyApis(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: ThirdPartyApis.delete.schema,
    handler: (request, reply) => deleteThirdPartApis(request, reply, fastify),
  });

  fastify.post("/activeInactive", {
    schema: ThirdPartyApis.activeInactive.schema,
    handler: (request, reply) => activeInactiveThirdPartyApis(request, reply, fastify),
  });
  
  fastify.post("/isDefault", {
    schema: ThirdPartyApis.isDefaultStage.schema,
    handler: (request, reply) => isDefaultStage(request, reply, fastify),
  });
};