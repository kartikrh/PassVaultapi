const uaParser = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");

const {
  signUpUser,
  signInUser,
  generateEncryptionData,
  getMaxKey,
  checkValidQuery,
  addUserQuery,
  updateUserQuery,
} = require("../repository/TableUser");
const { deviceInfo, encrypt, decrypt } = require("../utilities/index");

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

  const ipAdress = requestIp.getClientIp(request);

  if (user.WrUserIp !== "0" && user.WrUserIp !== ipAdress) {
    throw new Error("Invalid IP Address");
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

const getAllUsersService = async () => {
  return global.tblUsers.map((user) => {
    return {
      ...user,
      password: decrypt(user.password),
    };
  });
};

const getUserByIdService = async (request) => {
  const { userId } = request.body;

  const user = global.tblUsers.find((user) => user.userId === userId);

  if (user) {
    return {
      ...user,
      password: decrypt(user.password),
    };
  } else {
    return null;
  }
};

const addUserService = async (request, fastify) => {
  if (request.body.parentId && request.body.parentId !== "0") {
    const validateParent = global.tblUsers.find(
      (user) => user.userId === request.body.parentId
    );

    if (!validateParent) {
      throw new Error("Invalid Parent");
    }
  }

  if (request.body.roleId) {
    const validateRole = global.tblRoles.find(
      (role) => role.roleId === request.body.roleId
    );

    if (!validateRole) {
      throw new Error("Invalid Role");
    }
  }

  request.body.password = encrypt(request.body.password);

  const userData = await addUserQuery(request, fastify);

  global.tblUsers.push(userData);

  return userData;
};

const updateUserService = async (request, fastify) => {
  const { userId } = request.body;

  const findUser = global.tblUsers.find((user) => user.userId === userId);

  if (!findUser) {
    throw new Error("Invalid User");
  }

  const body = {
    userId,
    userName: request.body.userName || findUser.userName,
    name: request.body.name || findUser.name,
    mobile: request.body.mobile || findUser.mobile,
    isActive: findUser.isActive,
    allowMultipleLogin: findUser.allowMultipleLogin,
    userType: request.body.userType || findUser.userType,
    roleId: findUser.roleId,
    password: findUser.password,
  };

  if (request.body.roleId) {
    const validateRole = global.tblRoles.find(
      (role) => role.roleId === request.body.roleId
    );

    if (!validateRole) {
      throw new Error("Invalid Role");
    } else {
      body.roleId = request.body.roleId;
    }
  }

  if (request.body.password) {
    body.password = encrypt(request.body.password);
  }

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  }

  if ("allowMultipleLogin" in request.body) {
    body.allowMultipleLogin = request.body.allowMultipleLogin;
  }

  await updateUserQuery(body, fastify, request);

  if (!body.isActive) {
    global.socketIo
      .to(userId)
      .emit("logout", "You have been removed from the room.");
  }

  const index = global.tblUsers.findIndex((user) => user.userId === userId);

  global.tblUsers[index] = body;

  return body;
};

const saveUserService = async (request, fastify) => {
  const { userId } = request.body;

  if (userId === "0") {
    return await addUserService(request, fastify);
  } else {
    return await updateUserService(request, fastify);
  }
};

module.exports = {
  signUpUserService,
  signInUserServices,
  generateEncryptionService,
  validateUserServices,
  getAllUsersService,
  getUserByIdService,
  saveUserService,
};
