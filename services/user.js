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
  deleteUserQuery,
  signOutUser,
  getOriginalIdFromEncryptedId,
  updateUserPasswordQuery,
} = require("../repository/TableUser");
const { deviceInfo, encrypt, decrypt } = require("../utilities/index");
const { generateToken } = require("../utilities/tokenization");

async function signUpUserService({ body }, fastify) {
  const hashedPassword = encrypt(body.password);

  body.password = hashedPassword;

  const results = await signUpUser(body, fastify);

  const payload = { userId: results.WrUserId };
  const token = generateToken(payload);

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
  const WrEId = user.WrEId;
  //* if no user exists or password incorrect
  if (!user) {
    throw new Error("incorrect undername and password");
  }

  const ipAdress = requestIp.getClientIp(request);

  if (user.WrUserIp !== "0" && user.WrUserIp !== ipAdress) {
    throw new Error("Invalid IP Address");
  }

  if (WrEId) {
    const index = global.tblUsers.findIndex((user) => user.userId === WrEId);
    global.tblUsers[index].loginToken = body.token;
  }

  try {
    const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(WrEId); // get sockets in user's room

    // logout all sockets and remove all sockets from the room if multiple login is false and there are multiple sockets available
    if (clientsInRoom?.size && !user.WrAllowMultipleLogin) {
      global.socketIo
        .to(WrEId)
        .emit("logout", "You have been removed from the room.");
      Array.from(clientsInRoom).forEach((id) =>
        global.socketIo.sockets.sockets.get(id).leave(WrEId)
      );
    }
  } catch (error) {
    console.log("Error in socket in signin", error);
  }

  const tokenPayload = {
    WrUserId: user.WrUserId,
    WrEId: user.WrEId,
    WrUserType: user.WrUserType,
    WrRoleId: user.WrRoleId,
    WrUserName: user.WrUserName,
    WrIsSuperAdmin: user.WrIsSuperAdmin,
    WrParentId: user.WrParentId,
    WrAllowMultipleLogin: user.WrAllowMultipleLogin,
    wrToken: body.token,
  };

  //* token created
  const token = generateToken(tokenPayload);

  return { token, userName: user.WrUserName };
}

async function signOutUserServices(request, fastify) {
  // get roomId(userId) from jwt token
  const { WrUserId, WrEId, WrAllowMultipleLogin, wrToken } =
    request.userTokenInfo;

  if (!WrAllowMultipleLogin) {
    try {
      const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(WrEId); // get sockets in user's room
      // global.socketIo
      // .to(WrEId)
      // .emit("logout", "You have been removed from the room.");

      // Remove socket ids from the user room
      Array.from(clientsInRoom).forEach((id) =>
        global.socketIo.sockets.sockets.get(id).leave(WrEId)
      );
    } catch (error) {
      console.log(
        `Error While Logging out user id ${WrUserId} from current device`,
        error
      );
    }
  }

  // set wrIsLogin to false in userLoginInfo get wrToken from jwt token
  const userLoginInfo = {
    WrUserId,
    wrToken,
  };
  await signOutUser(userLoginInfo, fastify);

  // find user in global storage
  const index = global.tblUsers.findIndex((user) => user.userId === WrEId);

  if (!WrAllowMultipleLogin || wrToken === global.tblUsers[index].loginToken) {
    // set loginToken in global to null if user is not multiple login or loginToken and wrToken is same
    global.tblUsers[index].loginToken = null;
  }

  return "success";
}

async function verifyTokenUserServices(request, fastify) {
  // get roomId(userId) from jwt token
  const {
    WrEId: userId,
    WrAllowMultipleLogin,
    wrToken,
  } = request.userTokenInfo;

  if (userId) {
    const user = global.tblUsers.find((user) => user.userId === userId);
    // Check if token is not of latest login and multiple login is false
    if (
      user?.loginToken &&
      (wrToken === user?.loginToken || WrAllowMultipleLogin)
    ) {
      return "success";
    }
  }
  throw new Error("Invalid Token");
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

const getAllUsersService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const _users = global.tblUsers.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const users = _users.find((_u) => _u.isActive === isActive);
    return users;
  } else {
    const _users = global.tblUsers.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    const users = _users.find((_u) => _u.isActive === true);
    return users;
  }
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

  const checkAlreadyExists = global.tblUsers.find(
    (user) => user.userName === request.body.userName
  );

  if (checkAlreadyExists) {
    throw new Error("User already exists with this username");
  }

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
    parentId: findUser.parentId,
    parentName: findUser.parentName,
    roleName: findUser.roleName,
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
      body.roleName = validateRole.roleName;
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

  const checkAlreadyExists = global.tblUsers.find(
    (user) => user.userName === body.userName && user.userId !== userId
  );

  if (checkAlreadyExists) {
    throw new Error("User already exists with this username");
  }

  await updateUserQuery(body, fastify, request);

  if (!body.isActive) {
    try {
      global.socketIo
        .to(userId)
        .emit("logout", "You have been removed from the room.");
    } catch (error) {
      const originalId = await getOriginalIdFromEncryptedId(userId, fastify);
      console.log(
        `Error While Logging out user id ${originalId} from all device`,
        error
      );
    }
    body.loginToken = null;
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

const deleteUserService = async (request, fastify) => {
  const { userId } = request.body;

  await deleteUserQuery(request, fastify);

  global.tblUsers = global.tblUsers.filter(
    (user) => !userId.includes(user.userId)
  );

  return "User(s) deleted successfully";
};

const changeUserPasswordService = async (request, fastify) => {
  const { oldPassword, newPassword } = request.body;

  const findUser = global.tblUsers.find(
    (user) => user.userId === request.userTokenInfo.WrUserId
  );

  if (!findUser) {
    throw new Error("Invalid User");
  }

  const decryptedPassword = decrypt(findUser.password);

  if (decryptedPassword !== oldPassword) {
    throw new Error("Old Password is incorrect");
  }

  const body = {
    userId: request.userTokenInfo.WrUserId,
    password: encrypt(newPassword),
  };

  await updateUserPasswordQuery(body, fastify, request);

  const index = global.tblUsers.findIndex(
    (user) => user.userId === request.userTokenInfo.WrUserId
  );

  global.tblUsers[index].password = body.password;

  return "Password changed successfully";
};

module.exports = {
  signUpUserService,
  signInUserServices,
  signOutUserServices,
  verifyTokenUserServices,
  generateEncryptionService,
  validateUserServices,
  getAllUsersService,
  getUserByIdService,
  saveUserService,
  deleteUserService,
  changeUserPasswordService,
};
