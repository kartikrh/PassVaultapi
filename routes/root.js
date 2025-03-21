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
  forgetPassword,
  AddUpdateWebLogs,
  verifyEmail,
  verifyEmailToken,
  verifyMobile,
  verifyMobileOtp,
  loadPanelDataInGlobal,
  registerClientApp,
  verifyMobileNoApp,
  //loginRegistrationClient,
} = require("../controller/users/index");
const { Auth ,sendPushNotification,weblogs, Config, EventType, Commentary} = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");
const { startSignalR, stopSignalR, isSignalRStarted, stopCustomSignalR, isCustomSignalRStarted  } = require('../signalrHandler/MockSignalR');
const { errorLogger } = require("../utilities/logger");
const { getAllConfigData, getInitConfig } = require("../controller/users/admin/Page/config");
const { marketType } = require("../controller/users/admin/matchType");
const { thirdPartyApiType } = require('../utilities/index');
const { getEventTypeList } = require("../controller/users/admin/eventTypes");
const { getCompetitionListByeventTypeId } = require("../controller/users/admin/competition");
// const { getCompetitionListByeventTypeId } = require("../../../controller/users/admin/competition");

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
          global.tblThirdPartyApis.forEach((item) => {
            if (item.isActive === true && item.type === thirdPartyApiType.Socket && item.isDefault === true) {
                item.adminDisconnected = false;
            }
          });
          await startSignalR(fastify);
          reply.send({ status: "SignalR started" });
        }
      } catch (error) {
        return error;
      }

    }
  });

  fastify.post("/signalr/connection", {
    handler: async (request, reply) => {
      try {
        if (isCustomSignalRStarted(request, fastify)) {
          await stopCustomSignalR(request, fastify);
          reply.send({ status: "SignalR stopped" });
        } else {
          let thirdParty = global.tblThirdPartyApis.find((item) => item.id === request.body.id);
          if(thirdParty){
            thirdParty.adminDisconnected = false;
          }
          await startSignalR(fastify);
          reply.send({ status: "SignalR started" });
        }
      } catch (error) {
        errorLogger(fastify, error.message, "signalr/connection" , request);
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
  fastify.post("/resendOtp", {
    schema: Auth.resendOtp.schema,
    handler: (request, reply) => resendOtp(request, reply, fastify),
  });
  fastify.post("/verifyMobile", {
    schema: Auth.verifyMobile.schema,
    handler: (request, reply) => verifyMobile(request, reply, fastify),
  });
  fastify.post("/verifyMobileOtp", {
    schema: Auth.verifyMobileOtp.schema,
    handler: (request, reply) => verifyMobileOtp(request, reply, fastify),
  });
  fastify.post("/verifyEmail", {
    schema: Auth.verifyEmail.schema,
    handler: (request, reply) => verifyEmail(request, reply, fastify),
  });
  fastify.post("/verifyEmailToken", {
    schema: Auth.verifyEmailToken.schema,
    handler: (request, reply) => verifyEmailToken(request, reply, fastify),
  });
  fastify.post("/clientDetailsByEmailId", {  
    schema: Auth.clientDetailsByEmailId.schema,
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
  fastify.post("/signupClient", {
    schema: Auth.clientregistration.schema,
    handler: (request, reply) => registrationClient(request, reply, fastify),
  });
  fastify.post("/signupAppAPI", {
    schema: Auth.signupAppAPI.schema,
    handler: (request, reply) => registerClientApp(request, reply, fastify),
  });
  fastify.post("/verifyMobileNo", {
    schema: Auth.verifyMobileNo.schema,
    handler: (request, reply) => verifyMobileNoApp(request, reply, fastify),
  });
  fastify.post("/signOutClient", {
    schema: Auth.signOut.schema,
    //preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => signOutClient(request, reply, fastify),
  });

  fastify.post("/updateClient", {
    schema: Auth.clientUpdate.schema,
    handler: (request, reply) => updateClient(request, reply, fastify),
  });
  fastify.post("/sendNotificationWeb", {
    schema: sendPushNotification.send.schema,
    handler: (request, reply) => sendNotificationWeb(request, reply, fastify),
  });
  fastify.post("/addUpdateWebLogs", {
    schema: weblogs.save.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => AddUpdateWebLogs(request, reply, fastify),
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
  fastify.post("/marketType", {
    // schema: Config.allConfig.schema,
    preHandler: [(request, reply) => authorize(request, reply, fastify)],
    handler: (request, reply) => marketType(request, reply, fastify),
  });
  fastify.post("/eventTypeList", {
    schema: EventType.getAll.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      // (request, reply) =>
      //   checkPermission(request, reply, fastify, {
      //     tabName: "Events",
      //     mode: "view",
      //   }),
    ],
    handler: (request, reply) => getEventTypeList(request, reply, fastify),
  });
  fastify.post("/competitionListByEventTypeId", {
    schema: Commentary.competitionListByEventTypeId.schema,
    preHandler: [
      (request, reply) => authorize(request, reply, fastify),
      // (request, reply) =>
      //   checkPermission(request, reply, fastify, {
      //     tabName: "Event Markets",
      //     mode: "view",
      //   }),
    ],
    handler: (request, reply) => getCompetitionListByeventTypeId(request, reply, fastify),
});
};
