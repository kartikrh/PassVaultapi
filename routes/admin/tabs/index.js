"use strict";
const {
  getTabs,
  createTab,
  deleteTab,
  getSpecificTab,
  updateSpecificTab,
  getDisplayTabs,
  changeDisplayOrder,
  getAllTabsData,
} = require("../../../controller/users/admin/tabs");
const { Admin } = require("../../../swaggerSchema/groupTags/schema");
const { authorize } = require("../../../controller/middleware/index");

module.exports = async function (fastify, opts) {
  //* read all tabs which is active
  fastify.post("/all", {
    schema: Admin.getTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getTabs(request, reply, fastify),
  });

  //read all tabs which is active as well as inactive
  fastify.post("/", {
    schema: Admin.getTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllTabsData(request, reply, fastify),
  });

  //*get tabs by display type
  fastify.post("/byDisplayType", {
    schema: Admin.getByDisplayType.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getDisplayTabs(request, reply, fastify),
  });

  //*create a tab
  fastify.post("/create", {
    schema: Admin.createTab.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => createTab(request, reply, fastify),
  });

  //*delete tabs
  fastify.post("/delete", {
    schema: Admin.deleteTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteTab(request, reply, fastify),
  });

  //*get specific tab information
  fastify.post("/byId", {
    schema: Admin.getById.schema,
    //preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getSpecificTab(request, reply, fastify),
  });

  //*update specific tab information
  fastify.post("/update", {
    schema: Admin.postById.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateSpecificTab(request, reply, fastify),
  });

  //chnage display order
  fastify.post("/changeDisplayOrder", {
    schema: Admin.changeDispalyOrder.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => changeDisplayOrder(request, reply, fastify),
  });
};
