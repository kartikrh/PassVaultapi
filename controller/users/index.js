const { ERROR_CODES, error, success } = require("../../utilities/index");
const {
  signUpUserService,
  signInUserServices,
  generateEncryptionService,
} = require("../../services/user");

async function signUpUser(request, reply, fastify) {
  try {
    const result = await signUpUserService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(500)
      .send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}
async function signInUser(request, reply, fastify) {
  try {
    const result = await signInUserServices(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(401)
      .send(error("Invalid credentials", ERROR_CODES.AUTH_ERROR, 401));
  }
}

async function generateEncryption(request, reply, fastify) {
  try {
    const result = await generateEncryptionService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    reply
      .status(401)
      .send(error("Invalid credentials", ERROR_CODES.AUTH_ERROR, 401));
  }
}

module.exports = {
  signUpUser,
  signInUser,
  generateEncryption,
};
