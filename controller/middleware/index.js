const { ERROR_CODES, error, success } = require("../../utilities/index");
const {
  authorization,
  permissionCheckService,
} = require("../../services/middleware");
const jwt = require("jsonwebtoken");

async function authorize(request, reply, fastify) {
  try {
    await authorization(request, fastify);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 401));
  }
}

const checkPermission = async (request, reply, fastify, data) => {
  try {
    await permissionCheckService(request, fastify, data);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 401));
  }
};

module.exports = {
  authorize,
  checkPermission,
};
