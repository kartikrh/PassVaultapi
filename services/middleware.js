const jwt = require("jsonwebtoken");
const { deviceInfo } = require("../utilities/index");

const {
  createUserLoginInfo,
  checkValidQuery,
} = require("../repository/TableUser");

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

    request.userTokenInfo = decode;
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

module.exports = {
  authorization,
};
