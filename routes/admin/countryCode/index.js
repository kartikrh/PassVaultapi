const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllCountryCode,
  countryCodeById,
  saveCountryCode,
  deleteCountryCodes,
} = require("../../../controller/users/admin/countryCode");
const { CountryCode } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => getAllCountryCode(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: CountryCode.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => countryCodeById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: CountryCode.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => saveCountryCode(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: CountryCode.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
    ],
    handler: (request, reply) => deleteCountryCodes(request, reply, fastify),
  });
};
