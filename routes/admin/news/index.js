const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllNews,
  getNewsById,
  saveNews,
  deleteNews,
  activeInactiveNews,
  changeDisplayOrder
} = require("../../../controller/users/admin/news");
const { News } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: News.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "News",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllNews(request, reply, fastify),
  });

  fastify.post("/getAllNews", {
    schema: News.getAll.schema,
    handler: (request, reply) => getAllNews(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: News.getById.schema,
    // preHandler: [
    //   (request, reply) => authorize(request, reply, fastify),
    //   (request, reply, done) =>
    //     checkPermission(request, reply, fastify, {
    //       tabName: "News",
    //       mode: "view",
    //     }),
    // ],
    handler: (request, reply) => getNewsById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: News.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "News",
          mode: request.body.NewsId === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveNews(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: News.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "News",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteNews(request, reply, fastify),
  });

  fastify.post("/activeInactiveNews", {
    schema: News.activeInactiveNews.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "News",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveNews(request, reply, fastify),
  });

  fastify.post("/changeDisplayOrder", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "News",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => changeDisplayOrder(request, reply, fastify),
  });

};
