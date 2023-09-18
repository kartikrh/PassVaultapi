"use strict";
const {
  getTabs,
  deleteTab,
  getSpecificTab,
  saveTabData,
  getDisplayTabs,
  changeDisplayOrder,
  getAllTabsData,
} = require("../../../controller/users/admin/tabs");
const { Tabs } = require("../../../swaggerSchema/groupTags/schema");
const { authorize } = require("../../../controller/middleware/index");

module.exports = async function (fastify, opts) {
  //* read all tabs which is active
  fastify.post("/all", {
    schema: Tabs.getTabs.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getTabs(request, reply, fastify),
  });

  //read all tabs which is active as well as inactive
  fastify.post("/", {
    schema: Tabs.getTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllTabsData(request, reply, fastify),
  });

  //*get tabs by display type
  fastify.post("/byDisplayType", {
    schema: Tabs.getByDisplayType.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getDisplayTabs(request, reply, fastify),
  });

  //*delete tabs
  fastify.post("/delete", {
    schema: Tabs.deleteTabs.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => deleteTab(request, reply, fastify),
  });

  //*get specific tab information
  fastify.post("/byId", {
    schema: Tabs.getById.schema,
    //preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => getSpecificTab(request, reply, fastify),
  });

  //*update specific tab information
  fastify.post("/save", {
    schema: Tabs.saveTab.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => saveTabData(request, reply, fastify),
  });

  //chnage display order
  fastify.post("/changeDisplayOrder", {
    schema: Tabs.changeDispalyOrder.schema,
    // preHandler: [(request, reply, fastify) => authorize(request, reply, fastify)],
    handler: (request, reply) => changeDisplayOrder(request, reply, fastify),
  });
};
