"use strict";
const {
  findAllUsersController,
  findAllCommentController,
} = require("../controller/users/index");
const { user,admin } = require("../swaggerSchema/groupTags/schema");

module.exports = async function (fastify, opts) {
  //! API DEFINATION
  fastify.get("/users", { schema: user.schema, handler: findAllUsersController });
  fastify.get("/comments", { schema: user.schema, handler: findAllCommentController });
  fastify.get("/userA", { schema: admin.schema, handler: findAllUsersController });
  fastify.get("/commentB", { schema: admin.schema, handler: findAllCommentController });
};