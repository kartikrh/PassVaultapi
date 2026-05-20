const { ERROR_CODES, error, success } = require("../../utilities/index");
const {
  authorization,
  permissionCheckService,
  XKeyConfigForExtrnal,
  XKeyVirtual,
  multiTabPermissionCheckService,
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
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 200));
  }
};

const multiTabPermissionCheck = async (request, reply, fastify, data) => {
  try {
    await multiTabPermissionCheckService(request, fastify, data);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 200));
  }
};

const xKeyPermission = async (request, reply, fastify) => {
  try {
    await XKeyConfigForExtrnal(request, fastify);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 200));
  }
};
const xKeyPermissionVirtual = async (request, reply, fastify) => {
  try {
    await XKeyVirtual(request, fastify);
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 200));
  }
}
module.exports = {
  authorize,
  checkPermission,
  xKeyPermission,
  xKeyPermissionVirtual,
  multiTabPermissionCheck,
};
