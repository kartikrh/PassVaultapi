const { authorize, checkPermission } = require("../../../controller/middleware");
const {
  getAllArticles,
  getArticleById,
  saveArticle,
  deleteArticle,
  activeInactiveArticle,
} = require("../../../controller/users/admin/article");
const { Article } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Article.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Article",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllArticles(request, reply, fastify),
  });

  fastify.post("/getAllArticles", {
    schema: Article.getAll.schema,
    handler: (request, reply) => getAllArticles(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Article.getById.schema,
    handler: (request, reply) => getArticleById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: Article.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Article",
          mode: request.body.id === 0 ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveArticle(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Article.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Article",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteArticle(request, reply, fastify),
  });

  fastify.post("/activeInactiveArticle", {
    schema: Article.activeInactiveArticle.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Article",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => activeInactiveArticle(request, reply, fastify),
  });
};
