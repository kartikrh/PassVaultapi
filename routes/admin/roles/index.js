"use strict";
const { authorize } = require("../../../controller/middleware");
const {
  getAllRoles,
  deleteRoles,
  getRolesByDisplayType,
  createRole,
  getRoleById,
  getPermissionByTab,
} = require("../../../controller/users/admin/roles");
const { Role } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Role.getRoles.schema,
    handler: (request, reply) => getAllRoles(request, reply, fastify),
  });

  fastify.post("/byTab", {
    schema: Role.getByTab.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPermissionByTab(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Role.getById.schema,
    handler: (request, reply) => getRoleById(request, reply, fastify),
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
