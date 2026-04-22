const { authorize } = require("../../../controller/middleware");
const {
  getAllVideoLibrary,
  getVideoLibraryById,
  saveVideoLibrary,
  deleteVideoLibrary,
  updateVideoStatus,
  updateDisplayOrder,
} = require("../../../controller/users/admin/videoLibrary");
const { VideoLibrary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllVideoLibrary(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: VideoLibrary.byId.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getVideoLibraryById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: VideoLibrary.saveVideoLibrary.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveVideoLibrary(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: VideoLibrary.deleteVideoLibrary.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteVideoLibrary(request, reply, fastify),
  });

  fastify.post("/updateStatus", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateVideoStatus(request, reply, fastify)
  });

  fastify.post("/updateDisplayOrder", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateDisplayOrder(request, reply, fastify)
  });
};
