const bcrypt = require("bcrypt");
const uaParser = require('ua-parser-js');
const jwt = require('jsonwebtoken');

const { signUpUser, signInUser, createUserLoginInfo, updateSingleLoginInfoToLogout } = require("../repository/TableUser");
const {deviceInfo} = require('../utilities/index');

async function signUpUserService({ body }, fastify) {

  const hashedPassword = await bcrypt.hash(
    body.WrPassword,
    parseInt(process.env.SALT_ROUNDS)
  );

  body.WrPassword=hashedPassword;

  const results = await signUpUser(body);

  const payload= { userId: results.WrUserId }
  const token = jwt.sign(payload, process.env.SECRET_KEY_TOKEN);

  return { token };
}

async function signInUserServices(request, fastify) {
  const body = request.body
  let userLoginInfo;

  const user = await signInUser( body );

  //* compare password 
  const isPasswordValid = await bcrypt.compare(body.WrPassword, user.WrPassword);

  //* if no user exists or password incorrect
  if (!(user&&isPasswordValid)) {
    try{
      userLoginInfo = {
        WrUserId: null,
        WrUserType: -1,
        wrInfo:deviceInfo(request), 
        wrIsLogin: false, //false
        wrToken: '-1', //false //recall
      };

      await createUserLoginInfo(userLoginInfo);

    }
    catch(e){
      throw new Error("");

    }
    finally{
      throw new Error("incorrect undername and password");
    }
    
  }
  const tokenPayload={ 
    WrUserId:user.WrUserId,
    WrUserType:user.WrUserType,
    WrRoleId:user.WrRoleId,
    WrUserName:user.WrUserName,
    WrIsSuperAdmin:user.WrIsSuperAdmin,
    WrParentId:user.WrParentId,
    WrAllowMultipleLogin:user.WrAllowMultipleLogin,
    WrAllowMultipleLogin:user.WrAllowMultipleLogin
  }

  //* token created
  const options = {
    expiresIn: '10d',
  };
  const token = jwt.sign(tokenPayload, process.env.SECRET_KEY_TOKEN,options);

  //* new table information is set
  userLoginInfo = {
    WrUserId: user.WrUserId,
    WrUserType: user.WrUserType, 
    wrInfo:deviceInfo(request), 
    wrIsLogin: true,
    wrToken: token, 
  };

  //* LoginInfo saved
    //* check of for that user token if WrAllowMultipleLogin is false
    if(!user.WrAllowMultipleLogin){
    //if yes
      //set isloggedin to false, for that given userId 
      await updateSingleLoginInfoToLogout(user.WrUserId)     
    }
    //create UserLoginInfo entry
    await createUserLoginInfo(userLoginInfo);

  return { token };
}

module.exports = {
  signUpUserService,
  signInUserServices,
};
