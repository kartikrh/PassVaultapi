const { ERROR_CODES, error, success } = require("../../utilities/index");
const { authorization } = require("../../services/middleware");
const jwt = require("jsonwebtoken");

async function authorize(request, reply, fastify) {
  try {
    await authorization(request, fastify);
  } catch (err) {
    reply
      .status(401)
      .send(
        error(err.message || "invalid token", ERROR_CODES.INVALID_TOKEN, 401)
      );
  }
}

module.exports = {
  authorize,
};
