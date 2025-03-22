const uaParser = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const path = require("path");
const {ImgModuleConfig} = require("../utilities/imageConstant");
const nodemailer = require('nodemailer');
const {sendNotification,sendMobileNotifications} = require("../WebPushHandler/index");
const { SENDEMAILTYPE } = require("../utilities/configConstants");
const { typesOfServices, clientProcessStatus } = require('../utilities/index');

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
  loginRegistrationClient,
  registerClient,
  loginClient,
  updateClient,
  signOutClient,
  registerClientDetails,
  insertOtpQuery,
  registerClientPassword,
  registerClientOtpValidation,
  updateClientPassword,
  verifyEmail,
  verifyMobileOtp,
  registerClientAppQuery,
  getIdByValue,
  verifyMobileNoAppQuery,
  getEncryptClinet,
  signInClientAppQuery,
  updateClientProfileQuery,
  changePasswordQuery,
  clientDetailsByIdQuery,
} = require("../repository/TableUser");
const {
  deviceInfo,
  encrypt,
  decrypt,
  getUserChildIds,
} = require("../utilities/index");
const { generateToken } = require("../utilities/tokenization");
const configConstants = require("../utilities/configConstants");
const { errorLogger } = require("../utilities/logger");
const { glob } = require("fs");

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
  //* if no user exists or password incorrect
  if (!user) {
    throw new Error("Incorrect user name or password");
  }
  const WrEId = user.WrEId;
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
 
  return { token, userName: user.WrUserName , refData : {
    eventTypeId : user.wrEventTypeId,
    competitionId : user.wrCompetitionId
  } };
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
    eventTypeId : request.body.eventTypeId || findUser.eventTypeId,
    competitionId : request.body.competitionId || findUser.competitionId,
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

async function loginClientService({ body }, fastify) {
  try {
    let results;
    if (body.googleID || body.token || body.facebookId) {
      // Google Login
      body.token = uuidv4();
      results = await loginClient(body, fastify);
      global.tblClient.push({ ...results });
    } else {
      // Manual login
      if (body.password) {
        const hashedPassword = encrypt(body.password);
        body.password = hashedPassword;
        body.token = uuidv4();
        results = await loginClient(body, fastify);
      }
    }

    if (!results || results === "User not found" || results === "Invalid password" || results === "User is not active") {
      //return { error: results };
      throw new Error(results);
    }

    const tokenPayload = {
      WrClientId: results.clientId,
      WrUserType: 0,
      WrRoleId: 0,
      WrUserName: body.userName,
      WrIsSuperAdmin: false,
      WrParentId: 0,
      WrAllowMultipleLogin: false,
      wrToken: body.token,
    };

    //* token created

    const token = generateToken(tokenPayload);
    return { token, details: results };

  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> loginClientService",
      null
    )
    throw new Error(error);
  }
}

async function registrationClientService(request, fastify) {
  try {
    let body = request.body;
    if (body.password) {
      const hashedPassword = encrypt(body.password);
      body.password = hashedPassword;
    }

    let results;
    results = await registerClient(body,request, fastify);
    if (typeof results === "string") {
      if (results.includes("already exists")) {
        return { error: results };
      }
    }else if (typeof results === "object" && results !== null) {
      if (results.clientId) {
        const payload = { clientId: results.clientId };
        const token = generateToken(payload);
        global.tblClient.push({ ...results });
        return { token, details: results };
      }
    }
    else {
      return { error: results };
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> registrationClientService",
      null
    )
    throw new Error(error);
  }
}

async function registerDetailsService({ body }, fastify) {
  try {
    let response;
    response = await registerClientDetails(body, fastify);

    // if (response === "MobileNo and Email is already exists") {
    //   return { error: response };
    // }
    let isMobileVerify = false;
    let isEmailVerify = false;
    let isOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP);
    if (isOtpSend) {
      isOtpSend = isOtpSend.value;
    }
    else {
      throw new Error("Config not found");
    }

    let isEmailOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDEMAILOTP);
    if (isEmailOtpSend) {
      isEmailOtpSend = isEmailOtpSend.value;
    }
    else {
      throw new Error("Config not found");
    }
    // if(response.clientId){

    const payload = { clientId: response.clientId };
    const token = generateToken(payload);

    global.tblClient.push({ ...response, isActive: true, isUserActive: 0 });

    if (response.mobileNo && isOtpSend === "true") {
      // const generateOTP = () => {
      //   return Math.floor(100000 + Math.random() * 900000).toString();
      // };
      isMobileVerify = true;
      const otp = 1234
      const result = await insertOtpQuery({ ...body, otp, clientId: response.clientId }, fastify);
      global.tblOtp.push(result[0]);

    } else if(response.emailId && isEmailOtpSend === "true"){
      isEmailVerify = true;
      const otp = await sendOtpEmail(response.emailId);
      const result = await insertOtpQuery({...body, otp, clientId: response.clientId }, fastify);
      global.tblOtp.push(result[0]);
    } else {
      await registerClientOtpValidation({ ...body, clientId: response.clientId, isMobileVerify, isEmailVerify }, fastify);

      const index = global.tblClient.findIndex(
        (item) => item.clientId === response.clientId
      );
      response.registrationProcessStatus = 2;
      global.tblClient[index].registrationProcessStatus = 2
    }
    response.isEmailVerify = isEmailVerify;
    response.isMobileVerify = isMobileVerify;
    return { token, details: response};
    // }
    // else{
    //   return { error: response };
    // }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> registerDetailsService",
      null
    )
    throw new Error(error);
  }
};

async function sendOtpEmail(emailId) {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);

    let mailType = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === SENDEMAILTYPE.toLowerCase()
    );
    if (mailType) {
      mailType = parseInt(mailType.value);
    }
    else {
      throw new Error("Config not found");
    }

    const result = global.tblMailSettings.find(
      (item) => item.mailType === mailType && item.isDefault === true
    );
    let serviceType = mailType === 1 ? typesOfServices.GmailService : typesOfServices.SmtpService;

    let templateData = global.tblTemplate.find(
      (item) => item.isActive === true && item.isDefault === true
    );
    let template = templateData ? templateData.description.replace('{{OTP}}', otp) : `<p>Hello there! ${otp}</p>`;

    let transporter;
    if (serviceType === typesOfServices.GmailService) {
      transporter = nodemailer.createTransport({
        service: serviceType,
        auth: {
          user: result.email,
          pass: decrypt(result.password)
        }
      });
    } else if (serviceType === typesOfServices.SmtpService) {
      transporter = nodemailer.createTransport({
        host: result.smtpAddress,
        port: result.portNumber,
        secure: false,
        auth: {
          user: result.email,
          pass: decrypt(result.password)
        }
      });
    } else {
      throw new Error("Unsupported service type");
    }

    const mailOptions = {
      from: 'ScoreClient',
      to: emailId,
      subject: 'Your OTP Code',
      html: template
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent: ' + info.response);
    return otp;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}

async function resendOtpService({ body }, fastify) {
  try {
    const { email } = body;

    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if (!findUser) {
      throw new Error("Invalid User");
    }
    const clientId = findUser.clientId;
    const mobileNo = findUser.mobileNo;
    const emailId = findUser.emailId;
    
    const isOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP).value;
    const isEmailOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDEMAILOTP).value;
    
    if (mobileNo && isOtpSend === "true") {
      // const generateOTP = () => {
      //   return Math.floor(100000 + Math.random() * 900000).toString();
      // };
      const otp = 1234
      const result = await insertOtpQuery({ ...body, otp, clientId: clientId }, fastify);
      global.tblOtp.push(result[0]);
    } else if(emailId && isEmailOtpSend === "true") {
      const otp = await sendOtpEmail(emailId);
      const result = await insertOtpQuery({...body, otp, clientId: clientId}, fastify);
      global.tblOtp.push(result[0]);
    } else {
      return "Invalid Credentials"
    }

    return "Otp sent successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> resendOtpService",
      null
    )
    throw new Error(error);
  }
};

async function verifyLinkEmail(user) {
  try {
  const secretKey = process.env.SECRET_KEY_TOKEN;

  const expirationTime = global.tblConfigs.find((item) => item.key === configConstants.EMAILVERIFICATIONEXPIRATIONTIME).value;
  
  const emailToken = jwt.sign({
    email: user?.emailId,
    clientId: user?.clientId
  }, secretKey, { expiresIn: expirationTime });

  const scoreClientUrl = global.tblConfigs.find((item) => item.key === configConstants.SCORECLIENTAPIENDPOINT).value;

  const verificationUrl = `${scoreClientUrl}/verify-email?token=${emailToken}`;

    let mailType = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === SENDEMAILTYPE.toLowerCase()
    );
    if (mailType) {
      mailType = parseInt(mailType.value);
    }
    else {
      throw new Error("Config not found");
    }

    const result = global.tblMailSettings.find(
      (item) => item.mailType === mailType && item.isDefault === true
    );
    let serviceType = mailType === 1 ? typesOfServices.GmailService : typesOfServices.SmtpService;

    const mailOptions = {
      from: 'ScoreClient',
      to: user.emailId,
      subject: 'Verify Your Email',
      html: `Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
    };

    let transporter;
    if (serviceType === typesOfServices.GmailService) {
      transporter = nodemailer.createTransport({
        service: serviceType,
        auth: {
          user: result.email,
          pass: decrypt(result.password)
        }
      });
    } else if (serviceType === typesOfServices.SmtpService) {
      transporter = nodemailer.createTransport({
        host: result.smtpAddress,
        port: result.portNumber,
        secure: false,
        auth: {
          user: result.email,
          pass: decrypt(result.password)
        }
      });
    } else {
      throw new Error("Unsupported service type");
    }

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent: ' + info.response);
    return info.response;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}

async function verifyMobileService({ body }, fastify) {
  try {
    const { email } = body;

    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if(!findUser) {
      throw new Error("Invalid User");
    }
    const clientId = findUser.clientId;
    const mobileNo = findUser.mobileNo;
    
    let isOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP);
    if (isOtpSend) {
      isOtpSend = isOtpSend.value;
    }
    else {
      throw new Error("Config not found");
    }

      if(mobileNo && isOtpSend === "true") {
        // const generateOTP = () => {
        //   return Math.floor(100000 + Math.random() * 900000).toString();
        // };
        const otp = 1234
        const result = await insertOtpQuery({ ...body, otp, clientId: clientId }, fastify);
        global.tblOtp.push(result[0]);
      } else {
        return "Invalid Credentials"
      }

      return "Otp sent to your registered mobile number.";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> verifyMobileService",
      null
    )
    throw new Error(error);
  }
};

async function verifyMobileOtpService({ body }, fastify) {
  try {
    //check expiration time
    const { email, otp } = body;

    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if (!findUser) {
      throw new Error("Invalid User");
    }
    const clientId = findUser.clientId;

    const data = global.tblOtp.filter((item) => item.userId === clientId)
    data.sort((a, b) => b.otpId - a.otpId)

    if (otp === data[0]?.otp) {
      await verifyMobileOtp({ ...body, clientId: clientId }, fastify);

      const index = global.tblClient.findIndex(
        (item) => item.clientId === clientId
      );

      if (index !== -1) {
        global.tblClient[index].isMobileVerified = true;
        global.tblClient[index].registrationProcessStatus = 2;
        global.tblClient[index].isUserActive = 1;
      }
      return "OTP validated successfully"
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> verifyMobileOtpService",
      null
    )
    throw new Error(error);
  }
}

async function verifyEmailService({ body }, fastify) {
  try {
    const { email } = body;

    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if(!findUser) {
      throw new Error("Invalid User");
    }
    const emailId = findUser.emailId;
    
      if(emailId) {
        await verifyLinkEmail(findUser);
      } else {
        return "Invalid Credentials"
      }

      return "Verification link sent to gmail successfully";
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> verifyEmailService",
      null
    )
    throw new Error(error);
  }
};

async function verifyEmailTokenService({ body }, fastify) {
  try {
    const { token } = body;
    const secretKey = process.env.SECRET_KEY_TOKEN;
    const decoded = jwt.verify(token, secretKey);
    const { email, clientId } = decoded;
    
    if(email && clientId){
      const index = global.tblClient.findIndex(
        (item) => item.clientId === clientId
      );
      if(index !== -1){ 
        await verifyEmail({ ...body, clientId: clientId }, fastify);
        global.tblClient[index].isEmailVerified = true;
        global.tblClient[index].registrationProcessStatus = 2;
        global.tblClient[index].isUserActive = 1;
        return { success: true, message: 'Email verified successfully', email, clientId };
      }
      else {
        return { success: false, message: 'User Not Found' };
      }
    } else {
      return { success: false, message: 'Email verification failed' };
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> verifyEmailTokenService",
      null
    )
    throw new Error(error);
  }
};

const clientDetailsByIdService = async (request, fastify) => {
  const { email } = request.body;

  const findUser = global.tblClient.find(
    (item) => item.emailId === email
  );

  if (!findUser) {
    throw new Error("Invalid User");
  }

  const clientId = findUser.clientId;

  let clientDetails = await global.tblClient.find(
    (item) => item.clientId === clientId
  );
  return clientDetails;
};
async function validateOtpService({ body }, fastify) {
  try {
    //check expiration time
    const { email, otp, isMobileVerify, isEmailVerify } = body;

    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if (!findUser) {
      throw new Error("Invalid User");
    }
    const clientId = findUser.clientId;

    const data = global.tblOtp.filter((item) => item.userId === clientId)
    data.sort((a, b) => b.otpId - a.otpId)

    if (otp === data[0]?.otp) {
      await registerClientOtpValidation({ ...body, clientId: clientId, isMobileVerify, isEmailVerify }, fastify);

      const index = global.tblClient.findIndex(
        (item) => item.clientId === clientId
      );

      if (index !== -1) {
        global.tblClient[index].registrationProcessStatus = 2;
        global.tblClient[index].isMobileVerified = isMobileVerify;
        global.tblClient[index].isEmailVerified = isEmailVerify;
      }
      return "OTP validated successfully"
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> validateOtpService",
      null
    )
    throw new Error(error);
  }
}

async function setPasswordService({ body }, fastify) {
  try {
    if (body.password) {
      const hashedPassword = encrypt(body.password);
      body.password = hashedPassword;
    }

    await registerClientPassword(body, fastify);

    const index = global.tblClient.findIndex(
      (item) => item.emailId === body.email
    );

    let clientData = global.tblClient[index]
    clientData.password = body.password;
    clientData.registrationProcessStatus = 3;
    clientData.isUserActive = 1;

    if (clientData?.clientId) {
      const payload = { clientId: clientData.clientId };
      const token = generateToken(payload);
      return { token, details: clientData };
    } else {
      return "Error in set password"
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> setPasswordService",
      null
    )
    throw new Error(error);
  }
}

async function updateClientPasswordService({ body }, fastify) {
  try {
    const { oldPassword, newPassword, email, clientId } = body;

    const findUser = global.tblClient.find(
      (item) => item.clientId === clientId
    );

    if (!findUser) {
      throw new Error("Invalid User");
    }

    const decryptedPassword = decrypt(findUser.password);

    if (decryptedPassword !== oldPassword) {
      throw new Error("Old Password is incorrect");
    }

    if (newPassword) {
      const hashedPassword = encrypt(newPassword);
      newPassword = hashedPassword;
    }

    await updateClientPassword(body, fastify);

    const index = global.tblClient.findIndex(
      (item) => item.clientId === clientId
    );
    let clientData = global.tblClient[index]
    clientData.password = newPassword;

    return clientData;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> updateClientPasswordService",
      null
    )
    throw new Error(error);
  }
}

async function forgetPasswordService({ body }, fastify) {
  try {
    const { email } = body;
    const findUser = global.tblClient.find(
      (item) => item.emailId === email
    );

    if (!findUser) {
      throw new Error("Invalid User");
    }
    let isMobileVerify = false;
    let isEmailVerify = false;

    let isOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP);
    if (isOtpSend) {
      isOtpSend = isOtpSend.value;
    }
    else {
      throw new Error("Config not found");
    }

    let isEmailOtpSend = global.tblConfigs.find((item) => item.key === configConstants.ISSENDEMAILOTP);
    if (isEmailOtpSend) {
      isEmailOtpSend = isEmailOtpSend.value;
    }
    else {
      throw new Error("Config not found");
    }

    const mobileNo = findUser.mobileNo;
    const clientId = findUser.clientId;
    const emailId = findUser.emailId;

    if (mobileNo && isOtpSend === "true") {
      isMobileVerify = true;
      const otp = 1234
      const result = await insertOtpQuery({ ...body, otp, clientId: clientId }, fastify);
      global.tblOtp.push(result[0]);
    } else if(emailId && isEmailOtpSend === "true") {
      isEmailVerify = true;
      const otp = await sendOtpEmail(emailId);
      const result = await insertOtpQuery({...body, otp, clientId: clientId}, fastify);
      global.tblOtp.push(result[0]);
    } else {
      return "Invalid Credentials"
    }
    const message = "Otp sent successfully";
    return {message, isMobileVerify, isEmailVerify}
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR->> services/user.js -> forgetPasswordService",
      null
    )
    throw new Error(error);
  }
}
async function updateClientService({ body }, fastify) {
  try {
    let results;
    results = await updateClient(body, fastify);
    if (results === "Client ID does not exist" || results === "Email is already in use by another client" || results === "Mobile number is already in use by another client") {
      throw new Error(results);
      //return { error: results };
    }
    else {
      const index = global.tblClient.findIndex(
        (item) => item.clientId === results.clientId
      );
      global.tblClient[index] = results;
      return results;
    }
  } catch (error) {
    throw new Error(error);
  }
}

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

async function signOutClientService(request, fastify) {
  try {
    let token = request.headers.authorization;
    token = token?.split(" ")[1];
    const secretKey = process.env.SECRET_KEY_TOKEN;
    if (token) {
      const valid = jwt.verify(token, secretKey);
      const decode = jwt.decode(token, secretKey);
      const user = await checkValidQuery(decode, fastify);


      //const { WrClientId, wrToken } = request.userTokenInfo;
      if (!user) {
        throw new Error("Invalid Token");
      }
      const results = await signOutClient({ WrClientId: decode.WrClientId, wrToken: decode.wrToken }, fastify);
      return results;
    }
    else {
      return "Invalid Token";
    }

  } catch (error) {
    return null;
  }
}
const registerClientAppService = async (request, fastify) => {
  let checkExist = global.tblClient.find((item) =>
    item.mobileNo === request.body.mobileNo
  );
  if (checkExist && (checkExist.isMobileVerified == true || checkExist.registrationProcessStatus == clientProcessStatus.MOEMAILVERIFIED)) {
    throw new Error ("Mobile number already exists");
  }
  if(checkExist && (checkExist.isMobileVerified == false || checkExist.registrationProcessStatus == clientProcessStatus.ADDUSERDETAIL)){
    // get encrypt client id
    let clientId = checkExist.clientId;
    let encrypt = await getEncryptClinet({clientId},request,fastify);
    let isSendOtp = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP)?.value;
    // if(isSendOtp === 'true'){
    //   // logic for send third party otp

    // }
    return {
        clientId : encrypt.clientId,
        mobileNo : checkExist.mobileNo,
        countryCode : checkExist.countryCode,
    }
  }
  let encryptedPassword = encrypt(request.body.password);
  request.body.password = encryptedPassword;
  // if not then register
  const result = await registerClientAppQuery(request.body,request, fastify);
  global.tblClient.push(result[0]);
  // check if otpSend true for mobile
  let isSendOtp = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP)?.value;
  // if(isSendOtp === 'true'){
  //   // logic for send third party otp

  // }
  return {
      clientId : result[0].encryptClientId,
      mobileNo : result[0].mobileNo,
      countryCode : result[0].countryCode,
  }
  
}
const verifyMobileNoAppService = async (request, fastify) => {
  const {clientId , otp} = request.body;
  const checkExist = await getIdByValue({
    clientId : clientId,
  },request,fastify)

  if(!checkExist){
    return "Invalid Client Id"
  }
  let id = checkExist.clientId;
  // check if client exist
  const index = global.tblClient.findIndex((item) => item.clientId === id);
  if (index == -1) {
    throw new Error("Client not found");
  }
  if(global.tblClient[index]?.isMobileVerified == true){
    throw new Error("Mobile number already verified");
  }
  // is otp send true
  const isSendOtp = global.tblConfigs.find((item) => item.key === configConstants.ISSENDMOBILEOTP)?.value;
  if(isSendOtp === 'true'){
    // call third party otp
      await verifyMobileNoAppQuery({
        clientId :id
      },request,fastify);
      global.tblClient[index].isMobileVerified = true;
      global.tblClient[index].registrationProcessStatus = 2;
      const token = generateToken({ clientId: id });
      return {
        token : token,
        details: {
          clientId: global.tblClient[index].clientId,
          countryCode: global.tblClient[index].countryCode,
          mobileNo: global.tblClient[index].mobileNo,
        }
      }
  }
  else {
    const otpConfig = global.tblConfigs.find((item) => item.key === configConstants.CLIENTOTP)?.value;
    if(!otpConfig){
      throw new Error("OTP Config not found");
    }
    if(otpConfig === otp){
      await verifyMobileNoAppQuery({
        clientId :id
      },request,fastify);
      global.tblClient[index].isMobileVerified = true;
      global.tblClient[index].registrationProcessStatus = 2;

      const token = generateToken({ clientId: id });

      return {
        token : token,
        details: {
          clientId: global.tblClient[index].clientId,
          countryCode: global.tblClient[index].countryCode,
          mobileNo: global.tblClient[index].mobileNo,
        }
      };
    }
    else {
      return "Invalid OTP"
    }
  }
}
const signinClientAppService = async (request, fastify) => {
  const {mobileNo, password} = request.body;
  const checkExist = global.tblClient.find((item) =>
    item.mobileNo === mobileNo && item.countryCode === request.body.countryCode
  );
  if (!checkExist) {
    throw new Error("User not found");
  }
  if(checkExist.isMobileVerified == false){
    throw new Error("Mobile number not verified");
  }
  let encryptedPassword = encrypt(password);
  let t1 = uuidv4()
  const token = await signInClientAppQuery({
    clientId : checkExist.clientId,
    mobileNo : mobileNo,
    password : encryptedPassword,
    countryCode : request.body.countryCode,
    token : t1
  },request,fastify);
  return {
    token,
    details: {
      clientId: checkExist.clientId,
      countryCode: checkExist.countryCode,
      mobileNo: checkExist.mobileNo,
    }
  }
}
const updateClientProfileService = async (request, fastify) => {
  const validateId = global.tblClient.find(
    (item) => item.clientId === request.body.clientId
  );
  if (!validateId) {
    throw new Error(`Client ID does not exist`);
  }
  const results = await updateClientProfileQuery(request, fastify);
  const index = global.tblClient.findIndex(
    (item) => item.clientId === results?.clientId
  );
  if (index !== -1) {
    global.tblClient[index] = {
      ...global.tblClient[index],
      ...results
    };
  }
  return `Profile updated successfully`;
}

const changePasswordService = async (request, fastify) => {
  let { clientId, oldPassword, newPassword } = request.body;
  const validateId = await clientDetailsByIdQuery(clientId, request, fastify)
  if (!validateId) {
    throw new Error(`Client ID does not exist`);
  }
  if(validateId && validateId.password === null){
    throw new Error(`Client not registerd manually`);
  }
  const decryptedPassword = decrypt(validateId.password);
  if (decryptedPassword !== oldPassword) {
    throw new Error("Old Password is incorrect");
  }
  const hashedPassword = encrypt(newPassword);

  newPassword = hashedPassword;
  await changePasswordQuery({ newPassword: newPassword, clientId: clientId },
    request, fastify
  );
  return `password update successfully`;
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
  //loginRegistrationClientService,
  loginClientService,
  registrationClientService,
  updateClientService,
  sendNotificationWebService,
  sendNotificationMobileService,
  signOutClientService,
  registerDetailsService,
  validateOtpService,
  setPasswordService,
  clientDetailsByIdService,
  resendOtpService,
  updateClientPasswordService,
  forgetPasswordService,
  verifyEmailService,
  verifyEmailTokenService,
  verifyMobileService,
  verifyMobileOtpService,
  registerClientAppService,
  verifyMobileNoAppService,
  signinClientAppService,
  updateClientProfileService,
  changePasswordService,
};