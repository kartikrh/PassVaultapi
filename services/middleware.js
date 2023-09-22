const jwt = require("jsonwebtoken");
const { deviceInfo } = require("../utilities/index");

const {
  createUserLoginInfo,
  checkValidQuery,
} = require("../repository/TableUser");
const { roleByTabService } = require("./roles");

async function authorization(request, fastify) {
  const wrInfo = deviceInfo(request);
  try {
    let token = request.headers.authorization;
    token = token?.split(" ")[1];
    const secretKey = process.env.SECRET_KEY_TOKEN;

    if (!token || !secretKey) {
      throw new Error("Token Not Found");
    }

    const valid = jwt.verify(token, secretKey);
    const decode = jwt.decode(token, secretKey);

    //check: same network and not deleted account and //*currently loggedIn
    const user = await checkValidQuery(decode, fastify);

    if (!user) {
      throw new Error("Invalid Token");
    }

    request.userTokenInfo = { ...decode, ipAdress: request.ip };
  } catch (e) {
    userLoginInfo = {
      WrUserId: null,
      WrUserType: -1,
      wrInfo,
      wrIsLogin: false,
      wrToken: null,
    };

    await createUserLoginInfo(userLoginInfo, fastify);

    throw new Error(e.message);
  }
}

const permissionCheckService = async (request, fastify, data) => {
  const permission = await roleByTabService(request, fastify, data.tabName);

  if (data.mode === "view" && !permission.isViewPermission) {
    throw new Error("You don't have permission to view");
  } else if (data.mode === "add" && !permission.isAddPermission) {
    throw new Error("You don't have permission to add");
  } else if (data.mode === "edit" && !permission.isEditPermission) {
    throw new Error("You don't have permission to edit");
  } else if (data.mode === "delete" && !permission.isDeletePermission) {
    throw new Error("You don't have permission to delete");
  }

  return true;
};

module.exports = {
  authorization,
  permissionCheckService,
};
