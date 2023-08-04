const { findAllUsersQuery } = require("../repository/TableUser");

async function findAllUsers() {
  const results = await findAllUsersQuery();
  return results
}

module.exports = {
  findAllUsers
};
