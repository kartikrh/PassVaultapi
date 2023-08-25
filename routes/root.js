"use strict";
const {
  signUpUser,
  signInUser,
  generateEncryption,
} = require("../controller/users/index");
const { User, Auth } = require("../swaggerSchema/groupTags/schema");
const { authorize } = require("../controller/middleware/index");

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
  fastify.post("/generateEncryption", {
    schema: Auth.encryption.schema,
    handler: (request, reply) => generateEncryption(request, reply, fastify),
  });
};
