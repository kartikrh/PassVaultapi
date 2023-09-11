"use strict";
require("dotenv").config();

const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fsequelize = require("fastify-sequelize");
const dbPg = require("./sequelize/config/config")();
const cors = require("@fastify/cors");
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const featchData = require("./utilities/fetchAllData");

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
      try {
        await fastify.db.sync();
        await featchData(fastify);
      } catch (error) {
        console.log("error sync with db", error);
      }
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
          in: "header",
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
