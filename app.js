"use strict";
require("dotenv").config();

const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fsequelize = require("fastify-sequelize");
const dbPg = require("./sequelize/config/config")();
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const featchData = require("./utilities/fetchAllData");
const { Server } = require("socket.io"); // Import Socket.IO
const { connection, socketMiddleware } = require("./socketIo");
const { fastifyRateLimit } = require("@fastify/rate-limit");
const { responseLogger, responseLogInDB } = require("./utilities/logger");
const fastifyMultipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");
const { generateToken } = require("./utilities/tokenization");
const { isJson, getMessage, getTitle } = require("./utilities");
// require("./database/connnection");

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};
global.tblData = {};

module.exports = async function (fastify, opts) {
  fastify
    .register(fsequelize, {
      ...dbPg,
      instance: "db", // tells the plugin to create a Sequelize instance with the name "db"
      models: path.join(__dirname, "sequelize", "tables", "userModel.js"),
    })
    .after(async () => {
      require("./sequelize/tables/userModel")(fastify.db);
      require("./sequelize/tables/userLoginInfoModel")(fastify.db);
      require("./sequelize/tables/tabsModel")(fastify.db);
      require("./sequelize/tables/roleModel")(fastify.db);
      require("./sequelize/tables/encryptionData")(fastify.db);
      require("./sequelize/tables/permissionModel")(fastify.db);
      require("./sequelize/tables/blockModel")(fastify.db);
      require("./sequelize/tables/menuTypeModel")(fastify.db);
      require("./sequelize/tables/menuItemModel")(fastify.db);
      require("./sequelize/tables/menuItemTypeModel")(fastify.db);
      require("./sequelize/tables/pageModel")(fastify.db);
      require("./sequelize/tables/pageAliasModel")(fastify.db);
      require("./sequelize/tables/pageFormateModel")(fastify.db);
      require("./sequelize/tables/eventTypeModel")(fastify.db);
      require("./sequelize/tables/teamModel")(fastify.db);
      require("./sequelize/tables/teamPlayersModel")(fastify.db);
      require("./sequelize/tables/paneltyRunsModel")(fastify.db);
      require("./sequelize/tables/playerModel")(fastify.db);
      require("./sequelize/tables/matchTypeModel")(fastify.db);
      require("./sequelize/tables/errorLogModel")(fastify.db);
      require("./sequelize/tables/playerTypeModel")(fastify.db);
      require("./sequelize/tables/bowlingTypeModel")(fastify.db);
      require("./sequelize/tables/configModel")(fastify.db);
      require("./sequelize/tables/CommentaryModel")(fastify.db);
      require("./sequelize/tables/commentaryTeamModel")(fastify.db);
      require("./sequelize/tables/commentaryPlayerModel")(fastify.db);
      require("./sequelize/tables/compititionModel")(fastify.db);
      require("./sequelize/tables/eventModel")(fastify.db);
      require("./sequelize/tables/commentaryBallByBallModel")(fastify.db);
      require("./sequelize/tables/commentaryPartnershipModel")(fastify.db);
      require("./sequelize/tables/commentaryWicketModel")(fastify.db);
      require("./sequelize/tables/overModel")(fastify.db);
      require("./sequelize/tables/displayStatusModel")(fastify.db);
      try {
        await fastify.db.sync();
        await featchData(fastify);
      } catch (error) {
        console.log("error sync with db", error);
      }
    });

  // Configure fastify to use `multipart/form-data` requests
  fastify.register(fastifyMultipart, {
    throwFileSizeLimit: true,
        addToBody: true,
        limits: {
            fileSize: 10 * 1024 * 1024,
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

  fastify.addHook("onRequest", (request, reply, done) => {
    // Record the request start time in nanoseconds
    request.startTime = process.hrtime.bigint();
    request.startTimeTimeStemp = new Date();
    done();
  });

  fastify.addHook("onSend", (request, reply, payload, done) => {
    let newPayload = payload;
    const originalUrl = request.originalUrl; // get original url
    const urlDestructor = originalUrl.split('/'); // split original url
    const urlLastParameter = [...urlDestructor].pop().split('.');
    const urlExceptions = ['/documentation/json', "/documentation"];
    
    if (urlLastParameter.length === 1 && !urlExceptions.includes(originalUrl) && isJson(newPayload)) {
      newPayload = JSON.parse(newPayload);
      newPayload.title = getTitle(urlDestructor[2] || urlDestructor[1]);
      newPayload.message = getMessage(newPayload, reply.statusCode, urlLastParameter[0]);
      const urlTokenExceptions = ["/signout", "/verifyToken"];
      const urlTokenGeneration = ["/signin", "/signup"];
      const allowedStatusCodes = [200, 500, 403, 400];
      if (allowedStatusCodes.includes(reply.statusCode)) {
        if (urlTokenGeneration.includes(originalUrl) && newPayload?.result?.token) {
          newPayload.token = newPayload.result.token;
        } else if (
          request.userTokenInfo &&
          !urlTokenExceptions.includes(originalUrl)
        ) {
          const { ipAdress, iat, exp, ...userLoginInfo} = request.userTokenInfo;
          newPayload.token = generateToken(userLoginInfo);
        }
      }
      newPayload = JSON.stringify(newPayload);
    }

    done(null, newPayload);
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    const logger = false;
    const responseTimeInNanoseconds = process.hrtime.bigint() - request.startTime;
    const responseTimeInMilliseconds = Number(responseTimeInNanoseconds) / 1e6;
    request.responseTime = responseTimeInMilliseconds;
    
    // if path include /commentary then do log in db
    if (request.originalUrl.includes("/commentary")) {
      request.endTimeTimeStemp = new Date();
      responseLogInDB(request, fastify);
    }
  
    if (request.startTime && logger) {
      request.responseTime = responseTimeInMilliseconds;
      const responseTimeInNanoseconds =
      process.hrtime.bigint() - request.startTime;
      const responseTimeInMilliseconds =
        Number(responseTimeInNanoseconds) / 1e6;
      responseLogger(request);
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
        origin: true,
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
      origin: "*",
    },
  });

  // //Assign socketIo to global variable
  global.socketIo = io;

  io.use(socketMiddleware);
  io.on("connection", connection);

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
};
