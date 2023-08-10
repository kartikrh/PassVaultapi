const bcrypt = require("bcrypt");
const uaParser = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const { deviceInfo } = require("../utilities/index");

const {
  userAuthorization,
  createUserLoginInfo,
} = require("../repository/TableUser");

async function authorization(request, fastify) {
  const token = request.headers.authorization;
  const secretKey = process.env.SECRET_KEY_TOKEN;
  const wrInfo = deviceInfo(request);
  try {
    if (token && secretKey) {
      const valid = jwt.verify(token, secretKey); //check if expired
      const decode = jwt.decode(token, secretKey);
      const {
        WrUserId,
        WrUserType,
        WrRoleId,
        WrUserName,
        WrIsSuperAdmin,
        WrParentId,
        WrAllowMultipleLogin,
      } = decode;
      const userLoginInfoSearchParameters = {
        WrUserId,
        wrInfo,
        wrIsLogin: true,
      };

      const userModelSearchParameters = {
        WrUserId,
        WrUserType,
        WrRoleId,
        WrUserName,
        WrIsSuperAdmin,
        WrParentId,
        WrAllowMultipleLogin,
        WrIsDelete: false,
      };
      //check: same network and not deleted account and //*currently loggedIn
      const user = await userAuthorization(
        userLoginInfoSearchParameters,
        userModelSearchParameters
      );

      if (user.length === 0) {
        throw new Error("Invalid Token");
      }

      request.userTokenInfo = decode;
    } else {
      throw new Error("");
    }
  } catch (e) {
    userLoginInfo = {
      WrUserId: null,
      WrUserType: -1,
      wrInfo,
      wrIsLogin: false,
      wrToken: "-1",
    };

    try {
      await createUserLoginInfo(userLoginInfo);
    } catch (e) {
      throw new Error("");
    } finally {
      throw new Error("");
    }
  }
}

module.exports = {
  authorization,
};
