const { getPublicPages } = require("../../../controller/vault/page");

module.exports = async (fastify, opts) => {
  fastify.post("/", {
    handler: (request, reply) => getPublicPages(request, reply, fastify),
  });
};
