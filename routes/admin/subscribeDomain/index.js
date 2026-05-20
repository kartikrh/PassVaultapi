const {
  authorize,
  checkPermission,
} = require("../../../controller/middleware");
const {
  getAllSubScribesDomain,
  getSubscribeDomainById,
  deleteSubScribeDomain,
  saveSubScribeDomain,
  approveDomain,
  activeInactiveVideoApproved
} = require("../../../controller/users/admin/subScribesDomain");
const { SubScribesDomain } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify, opts) => {
  fastify.post("/all", {
    schema: SubScribesDomain.getAll.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
            checkPermission(request, reply, fastify, {
                tabName: "Subscribers",
                mode: "view",
            }),
    ],
    handler: (request, reply) =>
      getAllSubScribesDomain(request, reply, fastify),
  });
  fastify.post("/byId", {
    schema: SubScribesDomain.getById.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
            checkPermission(request, reply, fastify, {
                tabName: "Subscribers",
                mode: "view",
            }),
    ],
    handler: (request, reply) =>
      getSubscribeDomainById(request, reply, fastify),
  });
  fastify.post("/save", {
    schema: SubScribesDomain.save.schema,
    // preHandler: [
    //     (request, reply) => authorize(request, reply, fastify),
    //     (request, reply, done) =>
    //         checkPermission(request, reply, fastify, {
    //             tabName: "SubScribesDomain",
    //             mode: "view",
    //         }),
    // ],
    handler: (request, reply) => saveSubScribeDomain(request, reply, fastify),
  });
  fastify.post("/delete", {
    schema: SubScribesDomain.delete.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
            checkPermission(request, reply, fastify, {
                tabName: "Subscribers",
                mode: "delete",
            }),
    ],
    handler: (request, reply) => deleteSubScribeDomain(request, reply, fastify),
  });
  fastify.post("/isDomainApprove", {
    schema: SubScribesDomain.domainApprove.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
            checkPermission(request, reply, fastify, {
                tabName: "Subscribers",
                mode: "edit",
            }),
    ],
    handler: (request, reply) => approveDomain(request, reply, fastify),
  })
  fastify.post("/activeInactiveVideoApproved", {
    schema: SubScribesDomain.activeInactiveVideoApproved.schema,
    preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
            checkPermission(request, reply, fastify, {
                tabName: "Subscribers",
                mode: "edit",
            }),
    ],
    handler: (request, reply) => activeInactiveVideoApproved(request, reply, fastify),
  })
  
};
