const { authorize } = require("../../../controller/middleware");
const {
    getAllClientVideos,
    clientVideoById,
    saveClientVideo,
    deleteClientVideos,
    activeInactiveClientVideo
} = require("../../../controller/users/admin/clientVideo");
const { ClientVideo } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: ClientVideo.getAll.schema,
        handler: (request, reply) => getAllClientVideos(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: ClientVideo.getById.schema,
        handler: (request, reply) => clientVideoById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: ClientVideo.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => saveClientVideo(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: ClientVideo.delete.schema,
        handler: (request, reply) => deleteClientVideos(request, reply, fastify),
    });

    fastify.post("/activeInactiveApi", {
        schema: ClientVideo.activeInactiveApi.schema,
        handler: (request, reply) => activeInactiveClientVideo(request, reply, fastify),
    });
};