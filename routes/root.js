"use strict";
const { signUpUser, signInUser } = require("../controller/users/index");
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
  fastify.post("/", {
    schema: User.schema,
    preHandler: (request, reply, fastify) => authorize(request, reply, fastify),
    handler: (request, reply) =>
      reply.status(200).send({ hello: request.userTokenInfo }),
  });
};