//!import dependencies
const { Sequelize } = require("sequelize");
const dbConnect = require("../sequelize/config/config")();
const sequelize = new Sequelize(dbConnect);
//!import models
const User = require("../sequelize/tables/user")(sequelize);
const Comment = require("../sequelize/tables/comment")(sequelize);

//!Database queries-
//! for test purposes
async function findAllUsersQuery() {
  return await User.findAll();
}

async function findAllCommentQuery() {
  return await Comment.findAll();
}

module.exports = {
  findAllUsersQuery,
  findAllCommentQuery,
};
