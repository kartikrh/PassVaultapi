//!import dependencies
const { Sequelize } = require("sequelize");
const dbConnect = require("../sequelize/config/config")();
const sequelize = new Sequelize(dbConnect);
//!import models
const UserLoginInfoModel = require("../sequelize/tables/userLoginInfoModel")(sequelize);
const UserModel = require("../sequelize/tables/userModel")(sequelize);

async function signUpUser(request) {
  let newUser  = await UserModel.create(request);
  return { WrUserId: newUser.WrUserId };
}

async function signInUser({WrUserName}) {
  const user = await UserModel.findOne({
    where: { WrUserName:WrUserName },
    attributes: ['WrUserId', 'WrPassword','WrUserType'],
  });

  return user;
}

async function createUserLoginInfo(userLoginInfo) {
  const result = UserLoginInfoModel.create(userLoginInfo)

  return result;
}

module.exports = {
  signInUser,
  signUpUser,
  createUserLoginInfo
};
