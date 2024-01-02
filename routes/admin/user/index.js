const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllUsers,
  getUserById,
  saveUser,
  deleteUser,
  decryptPasswordUser,
  changeUserPassword,
  getAllUsersWithCurrent,
} = require("../../../controller/users/index");
const { User } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: User.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllUsers(request, reply, fastify),
  });
  
  fastify.post("/allWithCurrent", {
    schema: User.getAllWithCurrent.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllUsersWithCurrent(request, reply, fastify),
  });

  fastify.post("/decryptPassword", {
    schema: User.decryptPassword.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "view",
        }),
    ],
    handler: (request, reply) => decryptPasswordUser(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: User.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getUserById(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: User.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: request.body.userId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => saveUser(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: User.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteUser(request, reply, fastify),
  });

  fastify.post("/changePassword", {
    schema: User.changePassword.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Users",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => changeUserPassword(request, reply, fastify),
  });
};
