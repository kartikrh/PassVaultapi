"use strict";
const {
  signUpUser,
  signInUser,
  generateEncryption,
  validateUser,
  loadDataInMemory,
  updateUserPassword,
  signOutUser,
  verifyTokenUser,
  ckImageUpload,
  generalImageUpload,
  loadClientDataInMemory,
  loginRegistrationClient,
} = require("../controller/users/index");
const { Auth } = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");
const { startSignalR, stopSignalR, isSignalRStarted  } = require('../signalrHandler/index');

module.exports = async function (fastify, opts) {
  //! API DEFINITION
  fastify.post("/signup", {
    schema: Auth.signUp.schema,
    handler: (request, reply) => signUpUser(request, reply, fastify),
  });
  fastify.post("/signin", {
    schema: Auth.signIn.schema,
    handler: (request, reply) => signInUser(request, reply, fastify),
  });
  fastify.post("/signout", {
    schema: Auth.signOut.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => signOutUser(request, reply, fastify),
  });
  fastify.post("/verifyToken", {
    schema: Auth.verifyToken.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => verifyTokenUser(request, reply, fastify),
  });
  fastify.post("/changePassword", {
    schema: Auth.updatePassword.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => updateUserPassword(request, reply, fastify),
  });
  fastify.post("/authenticateUser", {
    schema: Auth.validateUser.schema,
    handler: (request, reply) => validateUser(request, reply, fastify),
  });
  fastify.post("/generateEncryption", {
    schema: Auth.encryption.schema,
    handler: (request, reply) => generateEncryption(request, reply, fastify),
  });
  fastify.post("/loadData", {
    schema: Auth.loaddata.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => loadDataInMemory(request, reply, fastify),
  });
  fastify.post("/loadClientData", {
    schema: Auth.loaddata.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => loadClientDataInMemory(request, reply, fastify),
  });
  fastify.post("/ckUpload", {
    schema: Auth.ckUpload.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => ckImageUpload(request, reply, fastify),
  });
  fastify.post("/imgUpload", {
    schema: Auth.imgUpload.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => generalImageUpload(request, reply, fastify),
  });
    // Single API to start and stop SignalR based on its current state
    fastify.post("/signalr/toggle", {
      handler: async (request, reply) => {
        if (isSignalRStarted(fastify)) {
          await stopSignalR(fastify);
          reply.send({ status: "SignalR stopped" });
        } else {
          await startSignalR(fastify);
          reply.send({ status: "SignalR started" });
        }
      }
    });

    fastify.post("/signupClient", {
      schema: Auth.clientLogin.schema,
      handler: (request, reply) => loginRegistrationClient(request, reply, fastify),
    });
};
