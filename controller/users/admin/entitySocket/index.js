const {
  getAllEntitySocketService,
} = require("../../../../services/entitySocket");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
let path = "controller/users/admin/entitySocket/index";

const getAllEntitySocket = async (request, reply, fastify) => {
  try {
    const result = await getAllEntitySocketService(request, fastify);
    reply.status(200).send(success(result, 200));
  } catch (err) {
    errorLogger(fastify, err.message, path + "/getAllEntitySocket", request);
    reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
  }
};
module.exports = {
  getAllEntitySocket,
};
