const bcrypt = require("bcrypt");
const { signUpUser, signInUser } = require("../repository/TableUser");

async function signUpUserService({ body }, fastify) {
  const hashedPassword = await bcrypt.hash(
    body.password,
    parseInt(process.env.SALT_ROUNDS)
  );
  const results = await signUpUser({ ...body, password: hashedPassword });
  const token = fastify.jwt.sign({ userId: results.userId });
  return { token };
}

async function signInUserServices({ body }, fastify) {
  const { username, password } = body;

  const user = await signInUser({ username });
  if (!user) {
    throw new Error("");
  }
  const isPasswordValid = await bcrypt.compare(password, user.WrPassword);

  if (!isPasswordValid) {
    throw new Error("");
  }
  const token = fastify.jwt.sign({ userId: user.WrUserId });

  return { token };
}

module.exports = {
  signUpUserService,
  signInUserServices,
};
