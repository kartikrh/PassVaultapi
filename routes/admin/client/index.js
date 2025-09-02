const {
    authorize,
    checkPermission,
  } = require("../../../controller/middleware");
const { getAllClient, getClientById, saveClient, deleteClient, activeInactiveClient, isUserActiveInactive, emailAndMobileVerify, getClientDecryptedPassword } = require("../../../controller/users/admin/client");
const { Client } = require("../../../swaggerSchema/groupTags/schema");
  
  module.exports = async (fastify, opts) => {
    fastify.post("/all", {
      schema: Client.getAll.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getAllClient(request, reply, fastify),
    });

    fastify.post("/getAllClient", {
      schema: Client.getAll.schema,
      handler: (request, reply) => getAllClient(request, reply, fastify),
    });

    fastify.post("/byId", {
      schema: Client.getById.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "view",
          }),
      ],
      handler: (request, reply) => getClientById(request, reply, fastify),
    });

    fastify.post("/save", {
      schema: Client.save.schema,
       preHandler: [
         (request, reply) => authorize(request, reply, fastify),
         (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: request.body.clientId === 0 ? "add" : "edit",
          }),
       ],
      handler: (request, reply) => saveClient(request, reply, fastify),
    });

    fastify.post("/delete", {
      schema: Client.delete.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "delete",
          }),
      ],
      handler: (request, reply) => deleteClient(request, reply, fastify),
    });
    
    fastify.post("/activeInactiveClient", {
      schema: Client.activeInactiveClient.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "edit",
          }),
      ],
      handler: (request, reply) => activeInactiveClient(request, reply, fastify),
    });

    fastify.post("/isUserActiveInactiveClient", {
      schema: Client.UserActiveInactive.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "edit",
          }),
      ],
      handler: (request, reply) => isUserActiveInactive(request, reply, fastify),
    });

    fastify.post("/emailAndMobileVerify", {
      schema: Client.EmailAndMobileVerify.schema,
      preHandler: [
        (request, reply) => authorize(request, reply, fastify),
        (request, reply, done) =>
          checkPermission(request, reply, fastify, {
            tabName: "Client",
            mode: "edit",
          }),
      ],
      handler: (request, reply) => emailAndMobileVerify(request, reply, fastify),
    });
    fastify.post("/decryptPassword", {
    schema: Client.decryptPassword.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      (request, reply) =>
        checkPermission(request, reply, fastify, {
          tabName: "Client",
          mode: "view",
        }),
    ],
    handler: (request, reply) => getClientDecryptedPassword(request, reply, fastify),
  });
};