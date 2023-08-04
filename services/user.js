const { findAllCommentQuery, findAllUsersQuery } = require("../repository/TableUser");

async function findAllComment() {
  const results = await findAllCommentQuery();
  return results
}

async function findAllUsers() {
  const results = await findAllUsersQuery();
  return results
}

module.exports = {
  findAllUsers,
  findAllComment,
};
