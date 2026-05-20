"use strict";
const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllRoles,
  deleteRoles,
  getRolesByDisplayType,
  createRole,
  getRoleById,
  getPermissionByTab,
  updateRoleStatus,
} = require("../../../controller/users/admin/roles");
const { Role } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: Role.getRoles.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getAllRoles(request, reply, fastify),
  });

  fastify.post("/byTab", {
    schema: Role.getByTab.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getPermissionByTab(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: Role.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getRoleById(request, reply, fastify),
  });

  fastify.post("/byDisplayType", {
    schema: Role.getByDisplayType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getRolesByDisplayType(request, reply, fastify),
  });

  fastify.post("/create", {
    schema: Role.createRole.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: request.body.roleId === "0" ? "add" : "edit",
        }),
    ],
    handler: (request, reply) => createRole(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: Role.deleteRoles.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: "delete",
        }),
    ],
    handler: (request, reply) => deleteRoles(request, reply, fastify),
  });

   fastify.post("/updateStatus", {
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply, done) =>
        checkPermission(request, reply, fastify, {
          tabName: "Roles",
          mode: "edit",
        }),
    ],
    handler: (request, reply) => updateRoleStatus(request, reply, fastify),
  });

};
