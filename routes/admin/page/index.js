const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllPage,
  getPageById,
  deletePage,
  savePage,
} = require("../../../controller/users/admin/Page/page");

const { Page } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Page.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Pages",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllPage(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Page.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Pages",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getPageById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Page.update.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Pages",
          mode: request.body.pageId == "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => savePage(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Page.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Pages",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deletePage(request, reply, fastify),
  });
};
