"use strict";
const {
  getAllRoles,
  deleteRoles,
  getRolesByDisplayType,
  createRole,
} = require("../../../controller/users/admin/roles");
const { Role } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Role.getRoles.schema,
    handler: (request, reply) => getAllRoles(request, reply, fastify),
  });

  fastify.post("/byDisplayType", {
    schema: Role.getByDisplayType.schema,
    handler: (request, reply) => getRolesByDisplayType(request, reply, fastify),
  });

  fastify.post("/create", {
    schema: Role.createRole.schema,
    handler: (request, reply) => createRole(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Role.deleteRoles.schema,
    handler: (request, reply) => deleteRoles(request, reply, fastify),
  });
};
