"use strict";
require("dotenv").config();
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fsequelize = require("fastify-sequelize");
const dbPg = require("./sequelize/config/config")();
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const { fetchAllDataFromDb, globalMemoryDatas } = require("./utilities/fetchAllData");
const { registerCronJobs } = require("./utilities/cronJobs");
// const fetchAllData = require("./utilities/fetchAllData");
const { Server } = require("socket.io"); // Import Socket.IO
const { connection, socketMiddleware } = require("./socketIo");
const { fastifyRateLimit } = require("@fastify/rate-limit");
const { responseLogger, responseLogInDB, oomLogger } = require("./utilities/logger");
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
const webPush = require("web-push");
const { webPushset } = require("./WebPushHandler/index.js");
const cron = require('node-cron');
const { resetAllClientSocketReconnectCountService, disconnectAllClientSocketService } = require("./services/clientSocket.js");
const { connectClients: newConnectClients } = require("./sockets/client.js");
// const { nodeProfilingIntegration } = require('@sentry/profiling-node');
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");
// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};
global.tblData = {};
global.marketData = {};
global.isAllDataLoadedInGlobal = false;
global.connectedEntitySocketClients = global.connectedEntitySocketClients || [];
global.pendingAdvertiseToClient = [];
global.pendingBannerToClient = [];
global.pendingNewsToClient = [];
global.pendingPhotoLibraryToClient = [];
global.pendingVideoLibraryToClient = [];

if (process.env.ENABLE_SENTRY === "TRUE") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    integrations: [
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
const { getMemoryStatus } = require("./utilities/logger");

const MEMORY_WARNING_THRESHOLD = 85;
const OOM_WARNING_INTERVAL_MS = 5 * 60 * 1000;
let lastOomWarningAt = 0;
const recordMemoryWarning = async (fastify, heapPercent, memory, globalMemory) => {
  const reason = `High memory usage detected: ${heapPercent}%`;
  const detail = `Heap used ${memory.process.heapUsed}, heap total ${memory.process.heapTotal}`;
  try {
    if (fastify && fastify.db) {
      await oomLogger(
        fastify,
        reason,
        detail,
        JSON.stringify({ memory, globalMemory, heapPercent, threshold: MEMORY_WARNING_THRESHOLD, createdAt: new Date() })
      );
      // console.warn(`Persisted OOM warning to DB: ${reason}`);
    } else {
      console.warn("OOM warning DB logging skipped: fastify.db not available", reason);
    }
  } catch (err) {
    console.warn('Failed to persist OOM warning:', err?.message || err);
  }
};

const logMemoryUsage = async (fastify) => {
  try {
    const memory = getMemoryStatus();
    const globalMemory = await globalMemoryDatas();
    const heapUsed = parseFloat(memory.process.heapUsed);
    const heapTotal = parseFloat(memory.process.heapTotal);
    const heapPercent = heapTotal > 0 ? ((heapUsed / heapTotal) * 100).toFixed(1) : "0";
    // console.log(`Memory status: heapUsed=${memory.process.heapUsed}, heapTotal=${memory.process.heapTotal}, heapPct=${heapPercent}%`);
    // console.log("globalMemory", globalMemory);
    if (heapPercent >= MEMORY_WARNING_THRESHOLD) {
      console.warn(`High heap usage detected: ${heapPercent}%`);
      if (Date.now() - lastOomWarningAt > OOM_WARNING_INTERVAL_MS) {
        lastOomWarningAt = Date.now();
        await recordMemoryWarning(fastify, heapPercent, memory, globalMemory);
      }
    }
  } catch (err) {
    console.warn('Failed to log memory usage:', err?.message || err);
  }
};

const setupMemoryMonitor = (fastify) => {
  setInterval(() => logMemoryUsage(fastify), 300000);
  process.on('warning', async (warning) => {
    const message = `${warning.name}: ${warning.message}`;
    console.warn('Process warning:', message, warning.code);
    if (!fastify || !fastify.db) {
      return;
    }
    const globalMemory = await globalMemoryDatas();
    // console.log("globalMemory", globalMemory);
    await oomLogger(
      fastify,
      `Process warning: ${warning.name}`,
      `${warning.message} code=${warning.code}`,
      JSON.stringify({ warning, globalMemory, timestamp: new Date() })
    );
  });

}
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
        "pageModel", "pageAliasModel", "pageFormateModel", "errorLogModel", "configModel",
        "newsModel", "clientSocketModel", "activityLogModel", "mailSettingsModel",
      ];

      models.forEach((model) => require(`./sequelize/tables/${model}`)(fastify.db));
      setImmediate(async () => {
        try {
          // await featchData(fastify);
          await fetchAllDataFromDb(fastify);
          // setupMemoryMonitor(fastify);

          // Client Sockets
          await resetAllClientSocketReconnectCountService(null, fastify);
          await disconnectAllClientSocketService(null, fastify);
          await newConnectClients(fastify);

          webPushset(webPush);

        } catch (error) {
          console.error(new Date(), "Error during post-sync operations:", error);
        }
      });
    });

  if (process.env.IS_CRON_ENABLE && process.env.IS_CRON_ENABLE === "true") {
    registerCronJobs(fastify);
  }

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
      // Stop all cron jobs to prevent memory leaks
      cron.getTasks().forEach(task => {
        try {
          task.stop();
        } catch (e) {
          console.error("Error stopping cron task:", e);
        }
      });

      // Disconnect sockets
      await disconnectAllClientSocketService(null, fastify);
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
      // @fastify/rate-limit `throw`s whatever this returns directly (see
      // node_modules/@fastify/rate-limit/index.js) and reads `.statusCode`
      // off it for the real HTTP status -- this used to return `code`
      // instead, which the plugin doesn't look for, so `.statusCode` was
      // always undefined and every rate-limit rejection fell through
      // setErrorHandler's other bug straight to a generic 500.
      return {
        statusCode: 429,
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
    if (!global.isAllDataLoadedInGlobal) {
      throw new Error("Please wait data is loading!");
    }
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

    // if (process.env.ENABLE_SENTRY === "TRUE") {
    //   Sentry.startSpan(
    //     {
    //       name: `${request.method} ${request.url}`,
    //       op: "http.server",
    //       description: "Incoming HTTP request",
    //     },
    //     (span) => {
    //       request.sentrySpan = span;
    //     }
    //   );
    // }

    // done();
  });

  fastify.addHook("onSend", (request, reply, payload, done) => {
    let newPayload = payload;
    const originalUrl = request.originalUrl; // get original url
    const urlDestructor = originalUrl.split("/"); // split original url
    const urlLastParameter = [...urlDestructor].pop().split(".");
    const urlExceptions = ["/documentation/json", "/documentation", "/admin/virtual/createEvent",
      "/admin/virtual/eventToss", "/admin/virtual/eventBallStart", "/admin/virtual/eventScoring",
      "/admin/virtual/eventSuffle", "/admin/virtual/cancelEvent", "/admin/virtual/serverTime"
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

    // if (process.env.ENABLE_SENTRY === "TRUE") {
    //   // const transaction = Sentry.startTransaction({
    //   //   name: `${request.method} ${request.url}`,
    //   //   op: "http.server",
    //   //   description: "HTTP request",
    //   // });
    //   // request.sentryTx = transaction;
    //   Sentry.startSpan(
    //     {
    //       name: `${request.method} ${request.url}`,
    //       op: "http.server",
    //       description: "Incoming HTTP request",
    //     },
    //     (span) => {
    //       request.sentrySpan = span;
    //     }
    //   );
    //   // const span = Sentry.startSpan({
    //   //   name: `${request.method} ${request.url}`,
    //   //   op: "http.server",
    //   //   description: "HTTP request",
    //   // });

    //   // request.sentrySpan = span;
    // }

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

    // if (process.env.ENABLE_SENTRY === "TRUE") {
    //   request.sentryTx.setHttpStatus(reply.statusCode);
    //   request.sentryTx.finish();
    // }

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
        methods: ["GET", "POST", "PUT", "OPTIONS"], // Allow necessary methods -- PUT is used by /vault/data and /vault/auth/profile
        preflightContinue: false, // Automatically handle preflight requests,
        maxAge: 300,
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
    pingInterval: 25000, // Ping every 25 seconds (Standard default)
    pingTimeout: 30000,  // Wait 30 seconds for pong before considering disconnected
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
    if (process.env.ENABLE_SENTRY === "TRUE") {
      Sentry.captureException(err);
    }
    // Was `if ((err.statusCode = 400))` -- an assignment, not a comparison,
    // so it was always truthy and forced every single error (including a
    // rate-limit 429) to report back as 400 INVALID_INPUT, with the
    // `reply.status(500)` fallback below completely unreachable. Preserve
    // the real 4xx status when the thrower set one (e.g. @fastify/rate-limit's
    // 429), only falling back to a generic 500 for anything else.
    const statusCode = err.statusCode && err.statusCode < 500 ? err.statusCode : null;
    if (statusCode) {
      reply.status(statusCode).send(error(err.message, ERROR_CODES.INVALID_INPUT, statusCode));
      return;
    }
    reply.status(500).send({ error: "Internal Server Error" });
  });
};
