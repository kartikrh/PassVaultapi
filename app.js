"use strict";
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const fsequelize = require("fastify-sequelize");
const dbPg = require("./sequelize/config/config")();
const sequelize = require("./sequelize/config/sequelizeConfig");

const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify
    .register(fsequelize, {
      ...dbPg,
      models: ["./sequelize/models/*.js"],
      instance: "db",
    })
    .ready(() => {
      fastify.db
        .authenticate()
        .then(() => {
          sequelize
            .sync({ alter: true, logging: false })
            .then(() => {
              console.log("Database schema has been altered");
            })
            .catch((err) => {
              console.error("Error while altering database schema:", err);
            });
          console.log("Connection has been established successfully.");
        })
        .catch((err) => {
          console.error("Unable to connect to the database:", err);
        });
    });

  fastify.register(swagger, {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "My API",
        description: "API documentation for my Fastify application",
        version: "1.0.0",
      },
    },
    exposeRoute: true, // This creates a route for serving the Swagger JSON
  });

  fastify.register(swaggerUi, {
    title: "API Documentation",
    swagger: "/documentation/json", // Route to your Swagger JSON
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
