"use strict";
const { getTabs,createTab,deleteTab,getSpecificTab,updateSpecificTab } = require("../../controller/users/admin/index");
const { Admin } = require("../../swaggerSchema/groupTags/schema");
const { authorize } = require("../../controller/middleware/index");

module.exports = async function (fastify, opts) {
  //* read all tabs
  fastify.get("/tab", {
    schema: Admin.getTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getTabs(request, reply, fastify),
  });

  //*create a tab
  fastify.post("/tab", {
    schema: Admin.createTab.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => createTab(request, reply, fastify),
  });

  //*delete tabs
  fastify.delete("/tab", {
    schema: Admin.deleteTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteTab(request, reply, fastify)
  });

  //*get specific tab information
  fastify.get("/tab/:id", {
    schema: Admin.getById.schema,
    //preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getSpecificTab(request, reply, fastify),
  });

  //*update specific tab information
  fastify.post("/tab/:id", {
    schema: Admin.postById.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateSpecificTab(request, reply, fastify),
  });
};
