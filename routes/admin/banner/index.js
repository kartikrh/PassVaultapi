const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
  const {
    getAllBanners,
    getBannerById,
    saveBanner,
    deleteBanner,
    activeInactiveBanner,
    updateDisplayOrderBanner
  } = require("../../../controller/users/admin/banner");
  const { Banner } = require("../../../swaggerSchema/groupTags/schema");
  
  module.exports = async (fastify, opts) => {
    fastify.post("/all", {
      schema: Banner.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Banner",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllBanners(request, reply, fastify),
    });
  
    fastify.post("/getAllBanner", {
      schema: Banner.getAll.schema,
      handler: (request, reply) => getAllBanners(request, reply, fastify),
    });
  
    fastify.post("/byId", {
      schema: Banner.getById.schema,
      // preHandler: [
      //   (request, reply) => authorize(request, reply, fastify),
      //   (request, reply, done) =>
      //     checkPermission(request, reply, fastify, {
      //       tabName: "Banner",
      //       mode: "view",
      //     }),
      // ],
      handler: (request, reply) => getBannerById(request, reply, fastify),
    });
  
    fastify.post("/save", {
      schema: Banner.save.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Banner",
            mode: request.body.NewsId === 0 ? "add" : "edit",
          }),
      ],
      handler: (request, reply) => saveBanner(request, reply, fastify),
    });
  
    fastify.post("/delete", {
      schema: Banner.delete.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Banner",
            mode: "delete",
          }),
      ],
      handler: (request, reply) => deleteBanner(request, reply, fastify),
    });

    fastify.post("/activeInactiveBanner", {
      schema: Banner.activeInactiveBanner.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Banner",
            mode: "edit",
          }),
      ],
      handler: (request, reply) => activeInactiveBanner(request, reply, fastify),
    });

  fastify.post("/updateDisplayOrder", {
    schema: Banner.updateDisplayOrder.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Banner",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateDisplayOrderBanner(request, reply, fastify),
  });
};