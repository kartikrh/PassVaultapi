const bcrypt = require("bcrypt");
const uaParser = require('ua-parser-js');

const { signUpUser, signInUser, createUserLoginInfo } = require("../repository/TableUser");

async function signUpUserService({ body }, fastify) {

  const hashedPassword = await bcrypt.hash(
    body.WrPassword,
    parseInt(process.env.SALT_ROUNDS)
  );

  body.WrPassword=hashedPassword;

  const results = await signUpUser(body);

  const token = fastify.jwt.sign({ userId: results.WrUserId });

  return { token };
}

async function signInUserServices(request, fastify) {
  const body = request.body
  const { WrPassword } = body;

  const user = await signInUser( body );
  if (!user) {
    throw new Error("");
  }
  const isPasswordValid = await bcrypt.compare(WrPassword, user.WrPassword);

  if (!isPasswordValid) {
    throw new Error("");
  }

  const token = fastify.jwt.sign({ userId: user.WrUserId });

  const parsedUA =uaParser(request.headers['user-agent'])

  const userLoginInfo = {
    WrUserId: user.WrUserId,
    WrUserType: user.WrUserType,
    wrInfo:JSON.stringify({
      'browserInfo':{
        ip: request.ip,
        browser: {
          name: parsedUA.browser.name,
          version: parsedUA.browser.version,
        },
        os: {
          name: parsedUA.os.name,
          version: parsedUA.os.version,
        },
        device: {
          model: parsedUA.device.model,
          type: parsedUA.device.type,
          vendor: parsedUA.device.vendor,
        },
      }
  }), 
    wrIsLogin: true,
    wrToken: token, 
  };
  
  await createUserLoginInfo(userLoginInfo);

  return { token };
}

module.exports = {
  signUpUserService,
  signInUserServices,
};
