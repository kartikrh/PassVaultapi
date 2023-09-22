const { authorize } = require("../../../controller/middleware");
const {
  getAllUsers,
  getUserById,
  saveUser,
} = require("../../../controller/users/index");
const { User } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: User.getAll.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllUsers(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: User.getById.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getUserById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: User.save.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveUser(request, reply, fastify),
  });
};
