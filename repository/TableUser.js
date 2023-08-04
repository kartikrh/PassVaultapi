//!import dependencies
const { Sequelize } = require("sequelize");
const dbConnect = require("../sequelize/config/config")();
const sequelize = new Sequelize(dbConnect);
//!import models
const {UserLoginInfoModel} = require("../sequelize/tables/userLoginInfoModel")(sequelize);
const UserModel = require("../sequelize/tables/userModel")(sequelize);

async function signUpUser(request) {

  const newUser = await UserModel.create({
    WrUserName:request.username,
    WrPassword:request.password,
    WrRoleId:request.roleId,
    WrName:request.name,
    WrMobile:request.mobile,
  });
  return { userId: newUser.WrUserId };
}

async function signInUser(request) {

}

module.exports = {
  signInUser,
  signUpUser
};
