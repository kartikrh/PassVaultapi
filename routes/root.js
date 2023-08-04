"use strict";
const {
  findAllUsersController,
} = require("../controller/users/index");
const { user,admin } = require("../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  //! API DEFINITION
  //placeholder
 fastify.get("/", { schema: user.schema, handler: findAllUsersController });

};