const { authorize } = require("../../../controller/middleware");
const {
  getAllPhotoLibrary,
  getPhotoLibraryById,
  savePhotoLibrary,
  deletePhotoLibrary,
  updatePhotoLibraryStatus,
} = require("../../../controller/users/admin/photoLibrary");
const { PhotoLibrary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllPhotoLibrary(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: PhotoLibrary.byId.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getPhotoLibraryById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: PhotoLibrary.savePhotoLibrary.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => savePhotoLibrary(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: PhotoLibrary.deletePhotoLibrary.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deletePhotoLibrary(request, reply, fastify),
  });

  fastify.post("/updateStatus", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updatePhotoLibraryStatus(request, reply, fastify),
  });
};
