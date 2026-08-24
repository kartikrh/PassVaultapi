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
  sendNotificationWeb,
  loadPanelDataInGlobal,
  globalMemoryData,
  getGlobalMemoryData,
} = require("../controller/users/index");
const { Auth, sendPushNotification, Config } = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");
const { errorLogger, getMemoryStatus } = require("../utilities/logger");
const { getAllConfigData, getInitConfig, getAllConfig } = require("../controller/users/admin/Page/config");
const { error, ERROR_CODES, success } = require('../utilities/index');

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
  fastify.post("/loadPanelData", {
    schema: Auth.panelLoadData.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => loadPanelDataInGlobal(request, reply, fastify),
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
  fastify.post("/sendNotificationWeb", {
    schema: sendPushNotification.send.schema,
    handler: (request, reply) => sendNotificationWeb(request, reply, fastify),
  });
  fastify.post("/config", {
    schema: Config.allConfig.schema,
    handler: (request, reply) => getAllConfigData(request, reply, fastify),
  });
  fastify.post("/loadInitData", {
    // schema: Config.allConfig.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getInitConfig(request, reply, fastify),
  });
  fastify.post("/configs", {
    handler: (request, reply) => getAllConfig(request, reply, fastify),
  });
  fastify.get("/server/checkStatus", {
    handler: async (request, reply) => {
      try {
        const result = getMemoryStatus();
        reply.status(200).send(success(result, 200));
      } catch (err) {
        errorLogger(fastify, err.message, "/server/checkStatus", request);
        reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
      }
    }
  });
  fastify.post("/globalMemory", {
    handler: (request, reply) => globalMemoryData(request, reply, fastify),
  })
  fastify.post("/getGlobalMemoryData", {
    handler: (request, reply) => getGlobalMemoryData(request, reply, fastify),
  })

};
