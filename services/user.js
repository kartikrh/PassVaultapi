const uaParser = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const {
  signUpUser,
  signInUser,
  generateEncryptionData,
  getMaxKey,
  checkValidQuery,
} = require("../repository/TableUser");
const { deviceInfo, encrypt } = require("../utilities/index");

async function signUpUserService({ body }, fastify) {
  const hashedPassword = encrypt(body.password);

  body.password = hashedPassword;

  const results = await signUpUser(body, fastify);

  const payload = { userId: results.WrUserId };
  const token = jwt.sign(payload, process.env.SECRET_KEY_TOKEN);

  return { token };
}

async function signInUserServices(request, fastify) {
  const decryptedPassword = encrypt(request.body.password);

  const body = {
    userName: request.body.userName,
    password: decryptedPassword,
    deviceInfo: deviceInfo(request),
    token: uuidv4(),
  };

  const user = await signInUser(body, fastify);

  //* if no user exists or password incorrect
  if (!user) {
    throw new Error("incorrect undername and password");
  }

  const tokenPayload = {
    WrUserId: user.WrUserId,
    WrUserType: user.WrUserType,
    WrRoleId: user.WrRoleId,
    WrUserName: user.WrUserName,
    WrIsSuperAdmin: user.WrIsSuperAdmin,
    WrParentId: user.WrParentId,
    WrAllowMultipleLogin: user.WrAllowMultipleLogin,
    wrToken: body.token,
  };

  //* token created
  const options = {
    expiresIn: process.env.TOKEN_EXPIRY_TIME,
  };
  const token = jwt.sign(tokenPayload, process.env.SECRET_KEY_TOKEN, options);

  return { token };
}

async function generateEncryptionService(request, fastify) {
  const { length } = request.body;

  const findMaxKey = await getMaxKey(fastify);

  for (let i = findMaxKey + 1; i <= findMaxKey + +length; i++) {
    const encryptedValue = encrypt(i.toString());
    const dataToInsert = {
      wrKey: i,
      wrValue: encryptedValue,
    };

    await generateEncryptionData(dataToInsert, fastify);
  }

  return "success";
}

async function validateUserServices(request, fastify) {
  let token = request.headers.authorization;
  token = token.split(" ")[1];
  const secretKey = process.env.SECRET_KEY_TOKEN;
  try {
    if (!token || !secretKey) return false;

    const valid = jwt.verify(token, secretKey); //check if expired
    const decode = jwt.decode(token, secretKey);

    const validate = await checkValidQuery(decode, fastify);

    return validate;
  } catch (e) {
    return false;
  }
}

module.exports = {
  signUpUserService,
  signInUserServices,
  generateEncryptionService,
  validateUserServices,
};
