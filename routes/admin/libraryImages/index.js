const { authorize } = require("../../../controller/middleware");
const {
  getAllLibraryImages,
  getLibraryImageById,
  saveLibraryImage,
  deleteLibraryImages,
  updateDisplayOrder,
} = require("../../../controller/users/admin/photoLibrary");
const { LibraryImages } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: LibraryImages.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllLibraryImages(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: LibraryImages.byId.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getLibraryImageById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: LibraryImages.saveLibraryImage.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveLibraryImage(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: LibraryImages.deleteLibraryImage.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteLibraryImages(request, reply, fastify),
  });

  fastify.post("/changeDisplayOrder", {
    schema: LibraryImages.updateDisplayOrder.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify),
  });
};
