"use strict";
require("dotenv").config();
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fsequelize = require("fastify-sequelize");
const dbPg = require("./sequelize/config/config")();
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const { fetchAllDataFromDb, FetchingCommentariesDataFromCron, upcomingCommentaries } = require("./utilities/fetchAllData");
// const fetchAllData = require("./utilities/fetchAllData");
const { Server } = require("socket.io"); // Import Socket.IO
const { connection, socketMiddleware } = require("./socketIo");
const { fastifyRateLimit } = require("@fastify/rate-limit");
const { responseLogger, responseLogInDB } = require("./utilities/logger");
const fastifyMultipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");
const { generateToken } = require("./utilities/tokenization");
const {
  isJson,
  getMessage,
  getTitle,
  ERROR_CODES,
  error,
} = require("./utilities");
const Sentry = require("@sentry/node");
const { instrument } = require("@socket.io/admin-ui");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const bcrypt = require("bcrypt");
const Tracing = require("@sentry/tracing");
const { connectClients, disconnectClients } = require("./sockets");
const { connectEntitySport, disconnectEntitySports } = require("./sockets/enitySport.js");
const {
  disConnectClientSocketQuery,
} = require("./repository/TableClientSocket");
const { disConnectEntitySocketQuery } = require("./repository/TableEntitySockets.js");
const {startSignalR} = require("./signalrHandler/MockSignalR.js")
const WebSocket = require("ws");
const WebsocketConnection = require("./websocket");
const webPush = require("web-push");
const {webPushset} = require("./WebPushHandler/index.js");
const { updateMarket } = require("./utilities/marketUpdate.js");
const cron = require('node-cron');
const { entitySportAutoImportProcess } = require("./utilities/entitySportAutoImport.js");
const { entitySportAutoUpdateCommentary } = require("./utilities/entitySportAutoUpdateCommentary.js");
const { entitySportAutoUpdateCommentaryTime } = require("./utilities/entityConst.js");
const { autoUpdatePlayerStatisticsDataProcess } = require("./utilities/autoUpdatePlayerStatisticsData.js");
const { ISPLAYERCALCULATIONON } = require("./utilities/configConstants.js");
const { autoUpdateTournamentTeamPoints } = require("./utilities/autoUpdateTournamentTeamPoints.js");
const { insertCompetitionstatisticsInAutoImportService } = require("./services/competitionStatistics.js");
// const { nodeProfilingIntegration } = require('@sentry/profiling-node');
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");
// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};
global.tblData = {};
global.marketData = {};
global.isAllDataLoadedInGlobal = false;
if (process.env.ENABLE_SENTRY === "TRUE") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    integrations : [
      nodeProfilingIntegration(),
      Sentry.postgresIntegration(),
      Sentry.childProcessIntegration()
      // ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    profileSessionSampleRate: 1.0,
    profileLifecycle: 'trace',
    includeLocalVariables: true,
  });
}
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception occurred:", err);
//   // Log additional diagnostic information
//   console.log("Stack Trace:", err.stack);
//   console.log("Resource usage metrics:", process.resourceUsage());
//   console.log("Memory usage:", process.memoryUsage());
//   // get cpu usage
//   console.log("CPU usage:", process.cpuUsage());
//   if (process.env.ENABLE_SENTRY === "TRUE") {
//     Sentry.captureException(err);
//   } 
//   // process.exit(1);
// });

module.exports = async function (fastify, opts) {
  const wss = new WebSocket.Server({ noServer: true });

  // process.stdin.resume(); // so the program will not close instantly
  // process.on("SIGTERM", async () => {
  //   console.log("Received SIGTERM signal");
  //   await disConnectClientSocketQuery(fastify);
  //   console.log("Cleanup task executed successfully");
  //   process.exit();
  // });
  fastify
    .register(fsequelize, {
      ...dbPg,
      instance: "db", // tells the plugin to create a Sequelize instance with the name "db"
      models: path.join(__dirname, "sequelize", "tables", "userModel.js"),
    })
    .after(async () => {
      // Load models and sync DB
      const models = [
        "userModel", "userLoginInfoModel", "tabsModel", "roleModel", "encryptionData",
        "permissionModel", "blockModel", "menuTypeModel", "menuItemModel", "menuItemTypeModel",
        "pageModel", "pageAliasModel", "pageFormateModel", "eventTypeModel", "teamModel", 
        "teamPlayersModel", "paneltyRunsModel", "playerModel", "matchTypeModel", "errorLogModel", 
        "playerTypeModel", "bowlingTypeModel", "configModel", "CommentaryModel", "commentaryTeamModel", 
        "commentaryPlayerModel", "compititionModel", "eventModel", "commentaryBallByBallModel", 
        "commentaryPartnershipModel", "commentaryWicketModel", "overModel", "displayStatusModel", 
        "newsModel", "subScribesDomainModel", "subScribesSubDomainModel", "matchTypePredictorModel", 
        "marketTemplateModel", "eventMarketsModel", "marketRunnerModel", "marketTemplateRunnerModel", 
        "vendorsModel", "vendorIpModel", "clientSocketModel", "activityLogModel", "mailSettingsModel", 
        "thirdPartyApisModel", "commentaryScoringLogsModel", "clientVideoModel", "awardModel", "commentaryAwardModel","cardTypeModel",
        "iccRankingModel", "competitionStatisticsTypeModel", "competitionStatisticsModel"
      ];
      
      models.forEach((model) => require(`./sequelize/tables/${model}`)(fastify.db));
      setImmediate(async () => {
        try {
          // await featchData(fastify);
          await fetchAllDataFromDb(fastify);
          await disConnectClientSocketQuery(fastify);
          await disConnectEntitySocketQuery(fastify);
          await startSignalR(fastify);
          connectClients(fastify);
          disconnectClients(fastify);
          connectEntitySport(fastify);
          disconnectEntitySports(fastify);
          webPushset(webPush);
          updateMarket(fastify)
          
        } catch (error) {
          console.error(new Date(), "Error during post-sync operations:", error);
        }
      });
    });
    cron.schedule('0 0 * * *', async () => {
      try {
        // Fetching data from db every 24 hrs once(at midnight)
        await FetchingCommentariesDataFromCron(fastify);
      } catch (error) {
        console.error(new Date(), "Error during scheduled task:", error);
      }
    });

    cron.schedule('* * * * *', async () => {
      try {
        await upcomingCommentaries(fastify);
      } catch (error) {
        console.error(new Date(), "Error during scheduled task:", error);
      }
    });

    let isAutoImportProcessEnded = true;
    cron.schedule('0,30 * * * * *', async () => {
      try {
        if (isAutoImportProcessEnded && global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          isAutoImportProcessEnded = false;
          await entitySportAutoImportProcess(fastify);
          isAutoImportProcessEnded = true;
        }
      } catch (error) {
        console.error("Error during scheduled task - entitySportAutoImportProcess:", error);
      }
    });

    cron.schedule(`*/${entitySportAutoUpdateCommentaryTime} * * * *`, async () => {
      try {
        if (global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive && global.tblEntitySockets?.[0]?.isAutoUpdateCommentary) {
          await entitySportAutoUpdateCommentary(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - entitySportAutoUpdateCommentary:", error);
      }
    });

    cron.schedule(`*/30 * * * * *`, async () => {
      try {
        if (global.isAllDataLoadedInGlobal && global.tblConfigs.find((item) => item.key === ISPLAYERCALCULATIONON).value === "true") {
          await autoUpdatePlayerStatisticsDataProcess(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - autoUpdatePlayerStatisticsDataProcess:", error);
      }
    });

    cron.schedule('30 19 * * *', async () => {
      try {
        if (global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          await autoUpdateTournamentTeamPoints(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - autoUpdateTournamentTeamPoints:", error);
      }
    });

    cron.schedule('00 20 * * *', async () => {
      try {
        if (global.isAllDataLoadedInGlobal && global.tblEntitySockets?.[0]?.isActive) {
          await insertCompetitionstatisticsInAutoImportService(fastify);
        }
      } catch (error) {
        console.error("Error during scheduled task - insertCompetitionstatisticsInAutoImportService:", error);
      }
    });

    // .after(async () => {
    //   require("./sequelize/tables/userModel")(fastify.db);
    //   require("./sequelize/tables/userLoginInfoModel")(fastify.db);
    //   require("./sequelize/tables/tabsModel")(fastify.db);
    //   require("./sequelize/tables/roleModel")(fastify.db);
    //   require("./sequelize/tables/encryptionData")(fastify.db);
    //   require("./sequelize/tables/permissionModel")(fastify.db);
    //   require("./sequelize/tables/blockModel")(fastify.db);
    //   require("./sequelize/tables/menuTypeModel")(fastify.db);
    //   require("./sequelize/tables/menuItemModel")(fastify.db);
    //   require("./sequelize/tables/menuItemTypeModel")(fastify.db);
    //   require("./sequelize/tables/pageModel")(fastify.db);
    //   require("./sequelize/tables/pageAliasModel")(fastify.db);
    //   require("./sequelize/tables/pageFormateModel")(fastify.db);
    //   require("./sequelize/tables/eventTypeModel")(fastify.db);
    //   require("./sequelize/tables/teamModel")(fastify.db);
    //   require("./sequelize/tables/teamPlayersModel")(fastify.db);
    //   require("./sequelize/tables/paneltyRunsModel")(fastify.db);
    //   require("./sequelize/tables/playerModel")(fastify.db);
    //   require("./sequelize/tables/matchTypeModel")(fastify.db);
    //   require("./sequelize/tables/errorLogModel")(fastify.db);
    //   require("./sequelize/tables/playerTypeModel")(fastify.db);
    //   require("./sequelize/tables/bowlingTypeModel")(fastify.db);
    //   require("./sequelize/tables/configModel")(fastify.db);
    //   require("./sequelize/tables/CommentaryModel")(fastify.db);
    //   require("./sequelize/tables/commentaryTeamModel")(fastify.db);
    //   require("./sequelize/tables/commentaryPlayerModel")(fastify.db);
    //   require("./sequelize/tables/compititionModel")(fastify.db);
    //   require("./sequelize/tables/eventModel")(fastify.db);
    //   require("./sequelize/tables/commentaryBallByBallModel")(fastify.db);
    //   require("./sequelize/tables/commentaryPartnershipModel")(fastify.db);
    //   require("./sequelize/tables/commentaryWicketModel")(fastify.db);
    //   require("./sequelize/tables/overModel")(fastify.db);
    //   require("./sequelize/tables/displayStatusModel")(fastify.db);
    //   require("./sequelize/tables/newsModel")(fastify.db);
    //   require("./sequelize/tables/subScribesDomainModel")(fastify.db);
    //   require("./sequelize/tables/subScribesSubDomainModel")(fastify.db);
    //   require("./sequelize/tables/matchTypePredictorModel")(fastify.db);
    //   require("./sequelize/tables/marketTemplateModel")(fastify.db);
    //   require("./sequelize/tables/eventMarketsModel")(fastify.db);
    //   require("./sequelize/tables/marketRunnerModel")(fastify.db);
    //   require("./sequelize/tables/marketTemplateRunnerModel")(fastify.db);
    //   require("./sequelize/tables/vendorsModel")(fastify.db);
    //   require("./sequelize/tables/vendorIpModel")(fastify.db);
    //   require("./sequelize/tables/clientSocketModel")(fastify.db);
    //   require("./sequelize/tables/activityLogModel")(fastify.db);
    //   require("./sequelize/tables/mailSettingsModel")(fastify.db);
    //   require("./sequelize/tables/thirdPartyApisModel")(fastify.db);
    //   require("./sequelize/tables/commentaryScoringLogsModel")(fastify.db);
    //   require("./sequelize/tables/clientVideoModel.js")(fastify.db);
    //   try {
    //     await fastify.db.sync();
    //     await featchData(fastify);
    //     await disConnectClientSocketQuery(fastify);
    //     await startSignalR(fastify);
    //     connectClients(fastify);
    //     //WebsocketConnection(fastify);
    //     disconnectClients(fastify);
    //     webPushset(webPush);
    //   } catch (error) {
    //     console.log("error sync with db", error);
    //   }
    // });

  // Configure fastify to use `multipart/form-data` requests
  fastify.register(fastifyMultipart, {
    throwFileSizeLimit: true,
    addToBody: true,
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  });
  fastify.addHook("preClose", async () => {
    console.log("preClose hook executed");
    try {
      await disConnectClientSocketQuery(fastify);
      await disConnectEntitySocketQuery(fastify);
      console.log("Cleanup task executed successfully");
    } catch (error) {
      console.error(new Date(), "Error during preClose hook execution:", error);
    }
  });
  fastify.register(require("@fastify/compress"), {
    global: false,
  });

  //for images static path
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "images"),
    prefix: "/images/",
  });

  // fastify.register(fastifyStatic, {
  //   root: path.join(__dirname, "images"),
  //   prefix: "/images/",
  //   serve: true,
  // });
  
  // // Serve static files from the "public" folder
  // fastify.register(fastifyStatic, {
  //   root: path.join(__dirname, "public"),
  //   prefix: "/",
  //   decorateReply: false,
  //   serve: true,
  // });

  fastify.register(fastifyRateLimit, {
    max: 100000000,
    timeWindow: "1 hour",
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: "Too Many Requests",
        message: `I only allow ${context.max} requests per ${context.after} to this Website. Try again soon.`,
      };
    },
  });

  fastify.addHook("preHandler", (request, reply, done) => {
    if (request.method === "OPTIONS") {
      reply.code(200).send();
    }
    done();
  });

  fastify.addHook("onRequest", async (request, reply) => {
    // Record the request start time in nanoseconds
    // request.startTime = process.hrtime.bigint();
    // request.startTimeTimeStemp = new Date();
    // if (request.originalUrl.includes("/commentary/saveDetails") || request.originalUrl.includes("/commentary/saveCommentaryDetails")) {
    //   // request.endTimeTimeStemp = new Date();
    //   // new Promise((resolve, reject) => {
    //   //   resolve(responseLogInDB(request, fastify));
    //   // }).then ((res) => {
    //   //   // console.log('res', res);
    //   //   request.errId = res[0].errId;
    //   // });
    //   let result = await responseLogInDB(request, fastify);
    //   request.errId = result[0]?.errId;
    // }

    if (process.env.ENABLE_SENTRY === "TRUE") {
      Sentry.startSpan(
        {
          name: `${request.method} ${request.url}`,
          op: "http.server",
          description: "Incoming HTTP request",
        },
        (span) => {
          request.sentrySpan = span;
        }
      );
    }

    // done();
  });

  fastify.addHook("onSend", (request, reply, payload, done) => {
    let newPayload = payload;
    const originalUrl = request.originalUrl; // get original url
    const urlDestructor = originalUrl.split("/"); // split original url
    const urlLastParameter = [...urlDestructor].pop().split(".");
    const urlExceptions = ["/documentation/json", "/documentation", "/admin/virtual/createEvent",
      "/admin/virtual/eventToss", "/admin/virtual/eventBallStart", "/admin/virtual/eventScoring",
      "/admin/virtual/eventSuffle", "/admin/virtual/cancelEvent","/admin/virtual/serverTime"
    ];

    if (
      urlLastParameter.length === 1 &&
      !urlExceptions.includes(originalUrl) &&
      isJson(newPayload)
    ) {
      newPayload = JSON.parse(newPayload);
      newPayload.title = getTitle(urlDestructor[2] || urlDestructor[1]);
      newPayload.message = getMessage(
        newPayload,
        reply.statusCode,
        urlLastParameter[0]
      );
      const urlTokenExceptions = ["/signout", "/verifyToken", "/agent/signout"];
      const urlTokenGeneration = ["/signin", "/signup", "/agent/signin"];
      const allowedStatusCodes = [200, 500, 403, 400];
      if (allowedStatusCodes.includes(reply.statusCode)) {
        if (
          urlTokenGeneration.includes(originalUrl) &&
          newPayload?.result?.token
        ) {
          newPayload.token = newPayload.result.token;
        } else if (
          request.userTokenInfo &&
          !urlTokenExceptions.includes(originalUrl)
        ) {
          const { ipAdress, iat, exp, ...userLoginInfo } =
            request.userTokenInfo;
          newPayload.token = generateToken(userLoginInfo);
        }
      }
      newPayload = JSON.stringify(newPayload);
    }

    if (process.env.ENABLE_SENTRY === "TRUE") {
      // const transaction = Sentry.startTransaction({
      //   name: `${request.method} ${request.url}`,
      //   op: "http.server",
      //   description: "HTTP request",
      // });
      // request.sentryTx = transaction;
      Sentry.startSpan(
        {
          name: `${request.method} ${request.url}`,
          op: "http.server",
          description: "Incoming HTTP request",
        },
        (span) => {
          request.sentrySpan = span;
        }
      );
      // const span = Sentry.startSpan({
      //   name: `${request.method} ${request.url}`,
      //   op: "http.server",
      //   description: "HTTP request",
      // });

      // request.sentrySpan = span;
    }

    done(null, newPayload);
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    const logger = false;
    // const responseTimeInNanoseconds =
    //   process.hrtime.bigint() - request.startTime;
    // const responseTimeInMilliseconds = Number(responseTimeInNanoseconds) / 1e6;
    // request.responseTime = responseTimeInMilliseconds;

    // // if path include /commentary then do log in db
    // if (request.originalUrl.includes("/commentary/saveDetails")) {
    //   request.endTimeTimeStemp = new Date();
    //   responseLogInDB(request, fastify);
    // }

    if (request.startTime && logger) {
      responseLogger(request);
    }

    if (process.env.ENABLE_SENTRY === "TRUE") {
      request.sentryTx.setHttpStatus(reply.statusCode);
      request.sentryTx.finish();
    }

    done();
  });

  fastify.register(swagger, {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "Score API",
        description: "API documentation for my Fastify application",
        version: "1.0.0",
      },
      securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "headers",
        },
      },
    },
    exposeRoute: true, // This creates a route for serving the Swagger JSON
  });

  fastify.register(swaggerUi, {
    title: "API Documentation",
    swagger: "/documentation/json", // Route to your Swagger JSON
  });

  fastify.register(require("@fastify/cors"), (instance) => {
    return (req, callback) => {
      const corsOptions = {
        // This is NOT recommended for production as it enables reflection exploits
        // origin: true,
        origin: true,
        methods: ["GET", "POST", "OPTIONS"], // Allow necessary methods
        preflightContinue: false, // Automatically handle preflight requests,
        maxAge :300,
        preflight: true,
        optionsSuccessStatus: 204, // Ensures proper handling of preflight requests

      };
      //TODO: for production set to false
      if (/^localhost$/m.test(req.headers.origin)) {
        corsOptions.origin = true;
      }

      // callback expects two parameters: error and options
      callback(null, corsOptions);
    };
  });

  //  socket.io
  const io = new Server(fastify.server, {
    cors: {
      origin: [
        "https://admin.socket.io",
        "https://panel.deployed.live",
        "https://panel.scorre.info",
        "http://localhost:3001",
        "https://uatpanel.deployed.live",
        "https://uatpanel.scorre.info",
        "http://localhost:8080"
      ],
      credentials: true,
    },
    // Improved timeout settings for better connection stability
    pingInterval: 20000, // Ping every 20 seconds (more frequent than default 25s)
    pingTimeout: 5000,  // Wait 5 seconds for pong before considering disconnected (reduced from 60s)
    connectTimeout: 10000, // Connection timeout (10 seconds)
    // Upgrade timeout for WebSocket upgrades
    upgradeTimeout: 10000,
    // Allow longer initial connection attempts
    initialPacketTimeout: 5000,
    connectionStateRecovery: {
      // Enable connection state recovery to handle reconnections better
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
    allowEIO3: true, // Allow Engine.IO v3 clients for better compatibility
    // Additional stability settings
    maxHttpBufferSize: 1e8, // 100MB max buffer size
    httpCompression: true,   // Enable compression
  });

  instrument(io, {
    auth: {
      type: "basic",
      username: process.env.SOCKET_ADMIN_USERNAME,
      password: bcrypt.hashSync(process.env.SOCKET_ADMIN_PASSWORD, 10),
    },
  });

  // //Assign socketIo to global variable
  global.socketIo = io;

  io.use(socketMiddleware);
  io.on("connection", (socket) => connection(socket, fastify));

  fastify.server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // Define your WebSocket connection handling
  wss.on("connection", (ws, req) => {
    // Handle WebSocket connections here
    // You can pass the Fastify instance to your WebSocket connection handling function
    global.wss = wss;
    WebsocketConnection(fastify, ws, req);
  });

  // connect the as a client to the socket.io admin
  // fastify.register(AutoLoad, {
  //   dir: path.join(__dirname, "sockets"),
  //   options: Object.assign({}, opts),
  // });
  // fastify.addHook("onRequest", (request, reply, done) => {
  //   const ip = requestIp.getClientIp(request);
  //   request.clintIp = ip;
  //   done();
  // });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });
  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.setErrorHandler(function (err, request, reply) {
    // console.error("err",err);
    if (process.env.ENABLE_SENTRY === "TRUE") {
      Sentry.captureException(err);
    }
    if ((err.statusCode = 400)) {
      reply
        .status(400)
        .send(error(err.message, ERROR_CODES.INVALID_INPUT, 400));
    }
    reply.status(500).send({ error: "Internal Server Error" });
  });
};
