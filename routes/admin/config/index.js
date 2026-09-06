const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllCongig,
  getConfigById,
  revealConfigValue,
  rotateEncryptionKey,
  saveConfig,
  deleteConfig,
} = require("../../../controller/users/admin/Page/config");
const { Config } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Config.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: "view",
          }),
    ],
    handler: (request, reply) => getAllCongig(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Config.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: "view",
          }),
    ],
    handler: (request, reply) => getConfigById(request, reply, fastify),
  });
  fastify.post("/reveal", {
    schema: Config.reveal.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: "view",
          }),
    ],
    handler: (request, reply) => revealConfigValue(request, reply, fastify),
  });
  fastify.post("/rotateEncryptionKey", {
    schema: Config.rotateEncryptionKey.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: "edit",
          }),
    ],
    handler: (request, reply) => rotateEncryptionKey(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: Config.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: request.body.configId === "0" ? "add" : "edit",
          }),
    ],
    handler: (request, reply) => saveConfig(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: Config.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "config",
            mode: "delete",
          }),
    ],
    handler: (request, reply) => deleteConfig(request, reply, fastify),
  });
};
