const bcrypt = require('bcrypt');
const { signUpUser,signInUser } = require("../repository/TableUser");


async function signUpUserService({body},fastify) {
  const hashedPassword = await bcrypt.hash(body.password, parseInt(process.env.SALT_ROUNDS));
  const results = await signUpUser({...body,password:hashedPassword});
  const token = fastify.jwt.sign({ userId: results.userId });
  return {token}
}

async function signInUserServices(request,fastify) {
  const results = await signInUser(request);
  return results
}

module.exports = {
  signUpUserService,
  signInUserServices
};
