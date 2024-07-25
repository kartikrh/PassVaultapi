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
  registrationClient,
  loginClient,
  updateClient,
  sendNotificationWeb,
  sendNotificationMobile,
  signOutClient,
  registerDetails,
  registerMobile,
  validateOtp,
  setPassword,
  clientDetailsById,
  resendOtp,
  updateClientPassword,
  forgetPassword
  //loginRegistrationClient,
} = require("../controller/users/index");
const { Auth ,sendPushNotification} = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");
const { startSignalR, stopSignalR, isSignalRStarted  } = require('../signalrHandler/index');
const { errorLogger } = require("../utilities/logger");

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
      try {
        if (isSignalRStarted(fastify)) {
          await stopSignalR(fastify);
          reply.send({ status: "SignalR stopped" });
        } else {
          await startSignalR(fastify);
          reply.send({ status: "SignalR started" });
        }
      } catch (error) {
        return error;
      }

    }
  });
  fastify.post("/signalr/checkStatus", {
    handler: async (request, reply) => {
      try {
        const result = isSignalRStarted(fastify);
        console.log("SignalR status: ", result);
        reply.send({ status : true , statusCode :200 , data: {
          isSignalRStarted: result || false
        }});
      } catch (error) {
        errorLogger(fastify, error.message, "signalr/checkStatus" , request);
        return error;
      }
    }
  });
  // fastify.post("/signupClient", {
  //   schema: Auth.clientLogin.schema,
  //   handler: (request, reply) => loginRegistrationClient(request, reply, fastify),
  // });
  fastify.post("/signupClient", {
    schema: Auth.clientregistration.schema,
    handler: (request, reply) => registrationClient(request, reply, fastify),
  });
  fastify.post("/signupClientDetails", {
    schema: Auth.signupClientDetails.schema,
    handler: (request, reply) => registerDetails(request, reply, fastify),
  });
  fastify.post("/resendOtp", {
    schema: Auth.resendOtp.schema,
    handler: (request, reply) => resendOtp(request, reply, fastify),
  });
  fastify.post("/clientDetailsById", {  
    schema: Auth.clientDetailsById.schema,
    handler: (request, reply) => clientDetailsById(request, reply, fastify)
  });
  fastify.post("/verifyOtp", {
    schema: Auth.verifyOtp.schema,
    handler: (request, reply) => validateOtp(request, reply, fastify),
  });
  fastify.post("/setPassword", {
    schema: Auth.setPassword.schema,
    handler: (request, reply) => setPassword(request, reply, fastify),
  });
  fastify.post("/changeClientPassword", {
    schema: Auth.updateClientPassword.schema,
    handler: (request, reply) => updateClientPassword(request, reply, fastify),
  });
  fastify.post("/forgetPassword", {
    schema: Auth.forgetPassword.schema,
    handler: (request, reply) => forgetPassword(request, reply, fastify),
  });
  fastify.post("/signinClient", {
    schema: Auth.clientLogin.schema,
    handler: (request, reply) => loginClient(request, reply, fastify),
  });
  fastify.post("/updateClient", {
    schema: Auth.clientUpdate.schema,
    handler: (request, reply) => updateClient(request, reply, fastify),
  });
  fastify.post("/sendNotificationWeb", {
    schema: sendPushNotification.send.schema,
    handler: (request, reply) => sendNotificationWeb(request, reply, fastify),
  });
  fastify.post("/signOutClient", {
    schema: Auth.signOut.schema,
    //preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => signOutClient(request, reply, fastify),
  });
};
