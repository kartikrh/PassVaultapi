const { authorize } = require("../../../controller/middleware");
const {
  getAllPaneltyRun,
  getPaneltyRunById,
  savePaneltyRun,
  deletePaneltyRun,
} = require("../../../controller/users/admin/paneltyRun");

const { PaneltyRuns } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: PaneltyRuns.getAll.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getAllPaneltyRun(request, reply, fastify),
  });

  fastify.post("/byId", {
    schema: PaneltyRuns.getById.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => getPaneltyRunById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: PaneltyRuns.save.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => savePaneltyRun(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: PaneltyRuns.delete.schema,
    preHandler: (request, reply) => authorize(request, reply, fastify),
    handler: (request, reply) => deletePaneltyRun(request, reply, fastify),
  });
};
