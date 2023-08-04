//!import dependencies
const { Sequelize } = require("sequelize");
const dbConnect = require("../sequelize/config/config")();
const sequelize = new Sequelize(dbConnect);
//!import models
const {UserLoginInfoModel} = require("../sequelize/tables/userLoginInfoModel")(sequelize);

//!Database queries- for test purposes
async function findAllUsersQuery() {
  return await UserLoginInfoModel.findAll();
}

module.exports = {
  findAllUsersQuery,
};
