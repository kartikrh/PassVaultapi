const { authorize } = require("../../../controller/middleware");
const {
    getAllVenues,
    venueById,
    saveVenue,
    deleteVenue,
    activeInactiveVenue,
} = require("../../../controller/users/admin/venue");
const { Venue } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
    fastify.post("/all", {
        schema: Venue.getAll.schema,
        handler: (request, reply) => getAllVenues(request, reply, fastify),
    });

    fastify.post("/byId", {
        schema: Venue.getById.schema,
        handler: (request, reply) => venueById(request, reply, fastify),
    });

    fastify.post("/save", {
        schema: Venue.save.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => saveVenue(request, reply, fastify),
    });

    fastify.post("/delete", {
        schema: Venue.delete.schema,
        preHandler: [
            (request, reply) => authorize(request, reply, fastify),
          ],
        handler: (request, reply) => deleteVenue(request, reply, fastify),
    });

    fastify.post("/activeInactive", {
        schema: Venue.activeInactive.schema,
        handler: (request, reply) => activeInactiveVenue(request, reply, fastify),
    });
};