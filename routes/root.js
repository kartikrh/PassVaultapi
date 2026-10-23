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
  loadPanelDataInGlobal,
  verifyOtpUser,
  resetUserOtp,
} = require("../controller/users/index");
const { Auth, Config } = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");
const { errorLogger, getMemoryStatus } = require("../utilities/logger");
const { getAllConfigData, getInitConfig, getAllConfig } = require("../controller/users/admin/Page/config");
const { error, ERROR_CODES, success } = require('../utilities/index');

module.exports = async function (fastify, opts) {
  //! API DEFINITION
  // Staff accounts are created by signed-in staff only (admin/user screen
  // also exists) -- this used to be public, letting anyone mint a staff user.
  fastify.post("/signup", {
    schema: Auth.signUp.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => signUpUser(request, reply, fastify),
  });
  fastify.post("/signin", {
    config: { rateLimit: { max: 8, timeWindow: "5 minutes" } },
    schema: Auth.signIn.schema,
    handler: (request, reply) => signInUser(request, reply, fastify),
  });
  // No preHandler -- the pendingToken issued by /signin proves the
  // credentials already checked out (see services/user.js verifyOtpUserServices).
  fastify.post("/signin/verifyOtp", {
    config: { rateLimit: { max: 8, timeWindow: "5 minutes" } },
    handler: (request, reply) => verifyOtpUser(request, reply, fastify),
  });
  fastify.post("/2fa/reset", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => resetUserOtp(request, reply, fastify),
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
    config: { rateLimit: { max: 8, timeWindow: "5 minutes" } },
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
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
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
  fastify.post("/config", {
    schema: Config.allConfig.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getAllConfigData(request, reply, fastify),
  });
  fastify.post("/loadInitData", {
    // schema: Config.allConfig.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => getInitConfig(request, reply, fastify),
  });
  fastify.post("/configs", {
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
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
  // /globalMemory and /getGlobalMemoryData (debug dumps of any global, incl.
  // tblConfigs secrets and tblUsers) were public and are no longer exposed.

};
