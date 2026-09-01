const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const {sendNotification,sendMobileNotifications} = require("../WebPushHandler/index");
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
  getParentIdTreeQuery,
  getUserOtpSecretQuery,
  updateUserOtpSecretQuery,
  resetUserOtpQuery,
} = require("../repository/TableUser");
const {
  deviceInfo,
  encrypt,
  decrypt,
  getUserChildIds,
} = require("../utilities/index");
const { generateToken, generatePurposeToken, verifyPurposeToken } = require("../utilities/tokenization");
const { OTPType } = require("../utilities/otpConstants");
const { generateTotpSecret, buildTotpKeyUri, generateQrCodeDataUrl, verifyTotpCode } = require("../utilities/totp");
const { sendMail } = require("../utilities/mailer");

const TWO_FACTOR_PURPOSE = "two-factor";
const TWO_FACTOR_TOKEN_EXPIRY = "10m";
const MAIL_OTP_LENGTH = 6;

const generateNumericCode = (length = MAIL_OTP_LENGTH) => {
  let code = "";
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10);
  return code;
};

async function signUpUserService({ body }, fastify) {
  const hashedPassword = encrypt(body.password);

  body.password = hashedPassword;

  const results = await signUpUser(body, fastify);

  const payload = { userId: results.WrUserId };
  const token = generateToken(payload);

  return { token };
}

// Runs once a login is actually finishing -- either immediately (2FA off)
// or from verifyOtpUserServices (2FA on, code confirmed). Kept out of the
// OTP-gated path itself so a password-correct-but-no-2FA-yet request can't
// kick the real owner's other sessions or claim the login-token slot.
const finalizePanelLogin = (user, tokenPayload) => {
  const WrEId = user.WrEId;
  if (WrEId) {
    const index = global.tblUsers.findIndex((u) => u.userId === WrEId);
    if (index !== -1) {
      global.tblUsers[index].loginToken = tokenPayload.wrToken;
    }
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
};

// Builds the "otpRequired" response for a staff user whose WrOTPEnable is
// true -- mirrors services/vaultAuth.js's beginTwoFactorChallenge. The full
// tokenPayload (built from the already-verified credentials) travels inside
// the pendingToken so verifyOtpUserServices can finish the exact same login
// without re-querying the password. Deliberately never returns a `token`
// field -- PassVaultpanel's axios response interceptor auto-persists any
// result.token as a finished session (see Features/axios.js).
const beginPanelTwoFactorChallenge = async (user, tokenPayload, fastify, request) => {
  if (user.WeOTPType === OTPType.MAIL) {
    // tblUsers has no email column -- mail OTP only works for staff whose
    // username is itself an email address. Google Authenticator (WeOTPType=1)
    // doesn't have this limitation and is the recommended method for staff.
    if (!user.WrUserName?.includes("@")) {
      throw new Error("Mail OTP requires this user's username to be an email address -- use Google Authenticator instead");
    }
    const code = generateNumericCode();
    const codeHash = await bcrypt.hash(code, 10);
    await sendMail({
      to: user.WrUserName,
      subject: "Your PassVault sign-in code",
      text: `Your PassVault sign-in code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    });
    const pendingToken = generatePurposeToken(
      { otpType: OTPType.MAIL, codeHash, tokenPayload },
      TWO_FACTOR_PURPOSE,
      TWO_FACTOR_TOKEN_EXPIRY
    );
    return { otpRequired: true, otpType: OTPType.MAIL, pendingToken };
  }

  // GOOGLE_AUTHENTICATOR -- first time (WrUuid blank): the secret travels
  // inside the pending token itself, not the DB, so an abandoned QR-scan
  // never leaves a half-enrolled secret behind (verifyOtpUserServices is
  // what actually persists it, only after the first code checks out).
  if (!user.WrUuid) {
    const secret = generateTotpSecret();
    const keyUri = buildTotpKeyUri(user.WrUserName, secret);
    const qrCode = await generateQrCodeDataUrl(keyUri);
    const pendingToken = generatePurposeToken(
      { otpType: OTPType.GOOGLE_AUTHENTICATOR, secret: encrypt(secret), isNewSecret: true, tokenPayload },
      TWO_FACTOR_PURPOSE,
      TWO_FACTOR_TOKEN_EXPIRY
    );
    return { otpRequired: true, otpType: OTPType.GOOGLE_AUTHENTICATOR, qrCode, pendingToken };
  }

  const pendingToken = generatePurposeToken(
    { otpType: OTPType.GOOGLE_AUTHENTICATOR, isNewSecret: false, tokenPayload },
    TWO_FACTOR_PURPOSE,
    TWO_FACTOR_TOKEN_EXPIRY
  );
  return { otpRequired: true, otpType: OTPType.GOOGLE_AUTHENTICATOR, pendingToken };
};

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
    throw new Error("Incorrect user name or password");
  }
  if(user?.WrUserType != 1) {
    throw new Error("Incorrect userType");
  }
  const ipAdress = requestIp.getClientIp(request);

  if (user.WrUserIp !== "0" && user.WrUserIp !== ipAdress) {
    throw new Error("Invalid IP Address");
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

  // Credentials + IP check passed -- if 2FA is on, stop here: no session
  // token, no socket/global bookkeeping, until verifyOtpUserServices
  // confirms the code.
  if (user.WrOTPEnable) {
    return beginPanelTwoFactorChallenge(user, tokenPayload, fastify, request);
  }

  finalizePanelLogin(user, tokenPayload);

  //* token created
  const token = generateToken(tokenPayload);

  return { token, userName: user.WrUserName , refData : {
    eventTypeId : user.wrEventTypeId,
    competitionId : user.wrCompetitionId
  } };
}

// POST /signin/verifyOtp -- the second step of a 2FA-gated panel sign-in.
// No auth header required: the pendingToken itself proves the credentials
// already checked out (see signInUserServices/beginPanelTwoFactorChallenge).
async function verifyOtpUserServices(request, fastify) {
  const { pendingToken, code } = request.body || {};
  if (!pendingToken || !code) {
    throw new Error("pendingToken and code are required");
  }

  const decoded = verifyPurposeToken(pendingToken, TWO_FACTOR_PURPOSE);
  const { tokenPayload } = decoded;
  if (!tokenPayload?.WrUserId) {
    throw new Error("Invalid token");
  }

  let verified = false;
  let justEnrolled = false;

  if (decoded.otpType === OTPType.MAIL) {
    verified = await bcrypt.compare(String(code), decoded.codeHash);
  } else {
    const encryptedSecret = decoded.isNewSecret
      ? decoded.secret
      : await getUserOtpSecretQuery(tokenPayload.WrUserId, fastify);
    const secret = encryptedSecret ? decrypt(encryptedSecret) : null;
    verified = secret ? verifyTotpCode(code, secret) : false;
    if (verified && decoded.isNewSecret) {
      await updateUserOtpSecretQuery(tokenPayload.WrUserId, decoded.secret, fastify);
      justEnrolled = true;
    }
  }

  if (!verified) {
    throw new Error("Invalid or expired code");
  }

  finalizePanelLogin(
    { WrEId: tokenPayload.WrEId, WrAllowMultipleLogin: tokenPayload.WrAllowMultipleLogin },
    tokenPayload
  );

  const token = generateToken(tokenPayload);

  return {
    token,
    userName: tokenPayload.WrUserName,
    justEnrolled,
  };
}

// POST /2fa/reset -- self-service or admin action for a lost/reset
// authenticator device. Clears WrUuid so the next sign-in re-issues a
// fresh QR code. Mirrors changeUserPasswordByUSerIDService's "Admin role
// required to reset someone else" gate; a user may always reset their own.
async function resetUserOtpService(request, fastify) {
  const { userId } = request.body;
  const requestUserID = request.userTokenInfo.WrEId;

  if (userId && userId !== requestUserID) {
    const findLoginUser = global.tblUsers.find((user) => user.userId === requestUserID);
    const validateRole = findLoginUser
      ? global.tblRoles.find((role) => role.roleId === findLoginUser.roleId)
      : null;
    if (!validateRole || !validateRole.roleName.includes("Admin")) {
      throw new Error("Only Admin Role Have Permission");
    }
  }

  await resetUserOtpQuery(userId || requestUserID, fastify);

  return "Two-factor authentication reset successfully";
}

async function signOutUserServices(request, fastify) {
  // get roomId(userId) from jwt token
  const { WrUserId, WrEId, WrAllowMultipleLogin, wrToken } =
    request.userTokenInfo;

  if (!WrAllowMultipleLogin) {
    try {
      const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(WrEId); // get sockets in user's room
      global.socketIo
        .to(WrEId)
        .emit("logout", "You have been removed from the room.");

      // Remove socket ids from the user room
      if (clientsInRoom?.size) {
        Array.from(clientsInRoom).forEach((id) =>
          global.socketIo.sockets.sockets.get(id).leave(WrEId)
        );
      }
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
  const requestUserID = request.userTokenInfo.WrEId;
  const _filteredUserIDs = getUserChildIds(requestUserID, global.tblUsers);
  const _users = global.tblUsers.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  const isActive =
    request.body?.isActive === undefined ? true : request.body?.isActive;
  if (request.body?.isActive === undefined) {
    return _users.filter((_u) => _filteredUserIDs.includes(_u.userId));
  } else {
    return _users.filter(
      (_u) => _u.isActive === isActive && _filteredUserIDs.includes(_u.userId)
    );
  }
};

const getAllUsersWithCurrentService = async (request) => {
  const requestUserID = request.userTokenInfo.WrEId;
  const _filteredUserIDs = [
    requestUserID,
    ...getUserChildIds(requestUserID, global.tblUsers),
  ];
  const _users = global.tblUsers.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  const _userList = _users.filter((_u) => _filteredUserIDs.includes(_u.userId));
  return _userList.map((value) => {
    if (value.userId === requestUserID) {
      return { ...value, current: true };
    }
    return value;
  });
};

const getUserDecryptedPassword = async (request) => {
  const requestUserID = request.userTokenInfo.WrEId;
  const { userId } = request.body;
  const _filteredUserIDs = getUserChildIds(requestUserID, global.tblUsers);
  if (_filteredUserIDs.includes(userId)) {
    const user = global.tblUsers.find((user) => user.userId === userId);
    return {
      password: decrypt(user.password),
    };
  } else {
    throw Error(403);
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
  if(request.body.eventTypeId && request.body.eventTypeId != 0){
    const validateEvent = global.tblEventTypes.find(
      (event) => event.eventTypeId === request.body.eventTypeId
    );

    if (!validateEvent) {
      throw new Error("Invalid Event Type");
    }

  }
  if(request.body.competitionId && request.body.competitionId != 0){
    const validateCompetition = global.tblCompetitions.find(
      (competition) => competition.competitionId === request.body.competitionId
    );

    if (!validateCompetition) {
      throw new Error("Invalid Competition");
    }

  }

  request.body.password = encrypt(request.body.password);

  const checkAlreadyExists = global.tblUsers.find(
    (user) => user.userName === request.body.userName
  );

  if (checkAlreadyExists) {
    throw new Error("User already exists with this username");
  }

  const parentIds = [];
  let currentId = request.body.parentId;

  while (currentId && currentId != '0') {
    const result = await getParentIdTreeQuery(currentId, request, fastify);
    if (!result.length) break;

    if (result[0].userId && !parentIds.includes(result[0].userId)) {
      parentIds.push(result[0].userId);
    }

    if (result[0].parentId && result[0].parentId !== 0) {
      parentIds.push(result[0].parentId);
    }

    currentId = result[0].encParentId;
  }

  request.body.parentTree = parentIds.join(',');

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
    parentTree: findUser.parentTree,
    password: findUser.password,
    eventTypeId : request.body.eventTypeId ?? findUser.eventTypeId,
    competitionId : request.body.competitionId ?? findUser.competitionId,
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
  if(request.body.eventTypeId && request.body.eventTypeId != 0){
    const validateEvent = global.tblEventTypes.find(
      (event) => event.eventTypeId === request.body.eventTypeId
    );
    if (!validateEvent) {
      throw new Error("Invalid Event Type");
    }
  }
  if(request.body.competitionId && request.body.competitionId != 0){
    const validateCompetition = global.tblCompetitions.find(
      (competition) => competition.competitionId === request.body.competitionId
    );
    if (!validateCompetition) {
      throw new Error("Invalid Competition");
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
    (user) => user.userId === request.userTokenInfo.WrEId
  );

  if (!findUser) {
    throw new Error("Invalid User");
  }

  const decryptedPassword = decrypt(findUser.password);

  if (decryptedPassword !== oldPassword) {
    throw new Error("Old Password is incorrect");
  }

  const body = {
    userId: request.userTokenInfo.WrEId,
    password: encrypt(newPassword),
  };

  await updateUserPasswordQuery(body, fastify, request);

  const index = global.tblUsers.findIndex(
    (user) => user.userId === request.userTokenInfo.WrEId
  );

  global.tblUsers[index].password = body.password;

  return "Password changed successfully";
};

const changeUserPasswordByUSerIDService = async (request, fastify) => {
  const { newPassword, userId } = request.body;

  const findLoginUser = global.tblUsers.find(
    (user) => user.userId === request.userTokenInfo.WrEId
  );
  if (findLoginUser) {
    const validateRole = global.tblRoles.find(
      (role) => role.roleId === findLoginUser.roleId
    );
    if (validateRole) {
      const containsAdmin = validateRole.roleName.includes("Admin");
      if (!containsAdmin) {
        throw new Error("Only Admin Role Have Permission");
      }
    }
  } else {
    throw new Error("Login User Not Found!");
  }

  const findUser = global.tblUsers.find((user) => user.userId === userId);

  if (!findUser) {
    throw new Error("Invalid User");
  }

  const body = {
    userId: userId,
    password: encrypt(newPassword),
  };

  await updateUserPasswordQuery(body, fastify, request);

  const index = global.tblUsers.findIndex((user) => user.userId === userId);

  global.tblUsers[index].password = body.password;

  return "Password changed successfully";
};

// async function loginRegistrationClientService({ body }, fastify) {
//   try {

//     if(body.password){
//       const hashedPassword = encrypt(body.password);

//       body.password = hashedPassword;
//     }

//     const results = await loginRegistrationClient(body, fastify);

//     const payload = { clientId: results.wrClientID };
//     const token = generateToken(payload);

//     return { token };

//   } catch (error) {
//     return null;
//   }
// }

async function sendNotificationWebService({ body }, fastify) {
  try {
    const { title, message, url, image, icon } = body;
    const results = await sendNotification(title, message, url, image, icon);
    return results;

  } catch (error) {
    return null;
  }
}

async function sendNotificationMobileService({ body }, fastify) {
  try {
    const { title, message, url, image, icon } = body;
    const results = await sendMobileNotifications(title, message, url, image, icon);
    return results;

  } catch (error) {  
    return null;
  }
}


module.exports = {
  signUpUserService,
  signInUserServices,
  signOutUserServices,
  verifyTokenUserServices,
  generateEncryptionService,
  validateUserServices,
  getAllUsersService,
  getAllUsersWithCurrentService,
  getUserDecryptedPassword,
  getUserByIdService,
  saveUserService,
  deleteUserService,
  changeUserPasswordService,
  changeUserPasswordByUSerIDService,
  sendNotificationWebService,
  sendNotificationMobileService,
  verifyOtpUserServices,
  resetUserOtpService,
};
