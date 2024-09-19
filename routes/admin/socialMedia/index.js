const { authorize } = require("../../../controller/middleware");
const {
    getAllSocialMedia,
    socialMediaById,
    saveSocialMedia,
    deleteSocialMedia,
    activeInactiveSocialMedia
} = require("../../../controller/users/admin/socialMedia");
const { SocialMedia } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: SocialMedia.getAll.schema,
        handler: (request, reply) => getAllSocialMedia(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: SocialMedia.getById.schema,
        handler: (request, reply) => socialMediaById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: SocialMedia.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => saveSocialMedia(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: SocialMedia.delete.schema,
        handler: (request, reply) => deleteSocialMedia(request, reply, fastify),
    });

    fastify.post("/activeInactiveApi", {
        schema: SocialMedia.activeInactiveApi.schema,
        handler: (request, reply) => activeInactiveSocialMedia(request, reply, fastify),
    });
};