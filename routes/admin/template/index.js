const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { getAllTemplate, getTemplateById, saveTemplate, deleteTemplate, activeInactiveTemplate } = require("../../../controller/users/admin/template");
const { Template } = require("../../../swaggerSchema/groupTags/schema");
  
  module.exports = async (fastify, opts) => {
    fastify.post("/all", {
      schema: Template.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Template",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllTemplate(request, reply, fastify),
    });

    fastify.post("/getAllTemplate", {
      schema: Template.getAll.schema,
      handler: (request, reply) => getAllTemplate(request, reply, fastify),
    });

    fastify.post("/byId", {
      schema: Template.getById.schema,
      // preHandler: [
      //   (request, reply) => authorize(request, reply, fastify),
      //   (request, reply, done) =>
      //     checkPermission(request, reply, fastify, {
      //       tabName: "Template",
      //       mode: "view",
      //     }),
      // ],
      handler: (request, reply) => getTemplateById(request, reply, fastify),
    });

    fastify.post("/save", {
      schema: Template.save.schema,
      // preHandler: [
      //   (request, reply) => authorize(request, reply, fastify),
      //   (request, reply, done) =>
      //     checkPermission(request, reply, fastify, {
      //       tabName: "Template",
      //       mode: request.body.templateId === 0 ? "add" : "edit",
      //     }),
      // ],
      handler: (request, reply) => saveTemplate(request, reply, fastify),
    });

    fastify.post("/delete", {
      schema: Template.delete.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Template",
            mode: "delete",
          }),
      ],
      handler: (request, reply) => deleteTemplate(request, reply, fastify),
    });
    
    fastify.post("/activeInactiveTemplate", {
      schema: Template.activeInactiveTemplate.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Template",
            mode: "edit",
          }),
      ],
      handler: (request, reply) => activeInactiveTemplate(request, reply, fastify),
    });
};