//!import dependencies
const sequelize = require("../sequelize/config/singleInstance");
//!import models
const UserLoginInfoModel = require("../sequelize/tables/userLoginInfoModel")(
  sequelize
);
const UserModel = require("../sequelize/tables/userModel")(sequelize);

//TODO: this is a test api
async function signUpUser(request) {
  let newUser = await UserModel.create(request);
  return { WrUserId: newUser.WrUserId };
}

async function signInUser({ WrUserName }) {
  return await UserModel.findOne({
    where: { WrUserName },
    attributes: [
      "WrUserId",
      "WrPassword",
      "WrUserType",
      "WrRoleId",
      "WrUserName",
      "WrIsSuperAdmin",
      "WrParentId",
      "WrAllowMultipleLogin",
      "WrSubAdminId",
    ],
  });
}

async function createUserLoginInfo(userLoginInfo) {
  return await UserLoginInfoModel.create(userLoginInfo);
}

async function updateSingleLoginInfoToLogout(userLoginInfo) {
  return await UserLoginInfoModel.update(
    { wrIsLogin: false },
    {
      where: {
        WrUserId: userLoginInfo,
      },
    }
  );
}

async function userAuthorization(
  UserLoginInfoSearchParameters,
  userModelSearchParameters
) {
  return await UserLoginInfoModel.findAll({
    where: UserLoginInfoSearchParameters,
    include: [
      {
        model: UserModel,
        where: userModelSearchParameters,
      },
    ],
  });
}

module.exports = {
  signInUser,
  signUpUser,
  createUserLoginInfo,
  updateSingleLoginInfoToLogout,
  userAuthorization,
};
