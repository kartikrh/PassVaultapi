const { getPublicWhitelabel } = require("../../../controller/vault/whitelabel");

module.exports = async (fastify, opts) => {
  fastify.post("/", {
    handler: (request, reply) => getPublicWhitelabel(request, reply, fastify),
  });
};
