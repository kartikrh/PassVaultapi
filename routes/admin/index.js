"use strict";
const { getTabs } = require("../../controller/users/admin/index");
const { Admin } = require("../../swaggerSchema/groupTags/schema");
const { authorize } = require("../../controller/middleware/index");

module.exports = async function (fastify, opts) {
  //* read all tabs
  fastify.get("/tab", {
    schema: Admin.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getTabs(request, reply, fastify),
  });

  //*create a tab
  fastify.post("/tab", {
    schema: Admin.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply, fastify) => createTab(request, reply, fastify),
  });

  //*delete tabs
  fastify.delete("/tab", {
    schema: Admin.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply, fastify) => deleteTab(request, reply, fastify)
  });

  //*get specific tab information
  fastify.get("/tab/:id", {
    schema: Admin.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply, fastify) => getSpecificTab(request, reply, fastify),
  });

  //*update specific tab information
  fastify.post("/tab/:id", {
    schema: Admin.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply, fastify) => updateSpecificTab(request, reply, fastify),
  });
};
