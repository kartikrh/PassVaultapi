const { authorize, checkPermission } = require("../../../controller/middleware");
const { saveMarketTemplate, getAllMarketTemplate, getMarketTemplateId, deleteMarketTemplate, getMatchTypeList, activeInactiveMarketTemplate, getByMatchTypeId, getMarketTypeList, getCategoryByMarketType, changePredefineRunner, cloneMarketTemplate, getMarketTypeAndCategoryByMarketType, updateIsPerEventStatus, isShowInAdvanceMarketStatusChange } = require("../../../controller/users/admin/marketTemplate");
const { MarketTemplate, Commentary } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  fastify.post("/all", {
    schema: MarketTemplate.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "view",
      }),
    ],
    handler: (request, reply) => getAllMarketTemplate(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: MarketTemplate.getById.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "view",
      }),
    ],
    handler: (request, reply) => getMarketTemplateId(request, reply, fastify),
  });

  fastify.post("/save", {
    schema: MarketTemplate.save.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: request.body.marketTemplateId === 0 ? "add" : "edit",
      }),
    ],
    handler: (request, reply) =>
      saveMarketTemplate(request, reply, fastify),
  });

  fastify.post("/delete", {
    schema: MarketTemplate.delete.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "delete",
      }),
    ],
    handler: (request, reply) => deleteMarketTemplate(request, reply, fastify),
  });

  fastify.post("/matchTypeList", {
    schema: Commentary.matchTypeList.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "view",
      }),
    ],
    handler: (request, reply) => getMatchTypeList(request, reply, fastify),
  });

  fastify.post("/activeInactiveTemplate", {
    schema: MarketTemplate.activeInactiveTemplate.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "edit",
      }),
    ],
    handler: (request, reply) => activeInactiveMarketTemplate(request, reply, fastify),
  });
  fastify.post("/getByMatchTypeId",{
    schema: MarketTemplate.getByMatchTypeId.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) => checkPermission(request, reply, fastify, {
            tabName: "Market Templates",
            mode: "view"
        })
    ],
    handler: (request, reply) => getByMatchTypeId(request, reply, fastify)
  })
  fastify.post("/markeTypeList",{
    schema: MarketTemplate.markeTypeList.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) => checkPermission(request, reply, fastify, {
            tabName: "Event Markets",
            mode: "view"
        })
    ],
    handler: (request, reply) => getMarketTypeList(request, reply, fastify)
  })
  fastify.post("/getCategoryByMarketType",{
    schema: MarketTemplate.getCategoryByMarketType.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) => checkPermission(request, reply, fastify, {
            tabName: "Event Markets",
            mode: "view"
        })
    ],
    handler: (request, reply) => getCategoryByMarketType(request, reply, fastify)
  })
  fastify.post("/changePredefineRunner",{
    schema: MarketTemplate.changePredefineRunner.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply) => checkPermission(request, reply, fastify, {
            tabName: "Event Markets",
            mode: "edit"
        })
    ],
    handler: (request, reply) => changePredefineRunner(request, reply, fastify)
  });
  fastify.post("/clone", {
    schema: MarketTemplate.clone.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "add",
      }),
    ],
    handler: (request, reply) =>
      cloneMarketTemplate(request, reply, fastify),
  })

  fastify.post("/getMarketTypeAndCategory", {
    schema: MarketTemplate.getCategoriesByMarketType.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
            tabName: "Event Markets",
            mode: "view"
      }),
    ],
    handler: (request, reply) => getMarketTypeAndCategoryByMarketType(request, reply, fastify),
  });
  
  fastify.post("/isPerEvent", {
    schema: MarketTemplate.isPerEventStatus.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "edit",
      }),
    ],
    handler: (request, reply) => updateIsPerEventStatus(request, reply, fastify),
  });

  fastify.post("/isShowInAdvanceMarket", {
    schema: MarketTemplate.isShowInAdvanceMarket.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Market Templates",
          mode: "edit",
      }),
    ],
    handler: (request, reply) => isShowInAdvanceMarketStatusChange(request, reply, fastify),
  });

};