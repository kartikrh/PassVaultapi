"use strict";
const {
  signUpUser,
  signInUser
} = require("../controller/users/index");
const { user,Auth } = require("../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  //! API DEFINITION
  //placeholder
 fastify.post("/signup", { schema: Auth.signin.schema, handler:  (request, reply) => signUpUser(request, reply, fastify) });
 fastify.post("/signin", { schema: Auth.signin.schema, handler:  (request, reply) => signInUser(request, reply, fastify) });

};