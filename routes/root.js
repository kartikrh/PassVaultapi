"use strict";
const {
  signUpUser,
  signInUser
} = require("../controller/users/index");
const { user,Auth } = require("../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  //! API DEFINITION
 fastify.post("/signup", { schema: Auth.signUp.schema, handler:  (request, reply) => signUpUser(request, reply, fastify) });
 fastify.post("/signin", { schema: Auth.signIn.schema, handler:  (request, reply) => signInUser(request, reply, fastify) });

};