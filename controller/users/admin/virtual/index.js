const { saveEventervice } = require("../../../../services/virtual");
const { ERROR_CODES, error, success } = require("../../../../utilities/index");
const { errorLogger } = require("../../../../utilities/logger");
const commonPath = "controller/users/admin/virtual/index";

const saveEvent = async (request, reply, fastify) => {
    try {
      const result = await saveEventervice(request,fastify);
      reply.status(200).send(success(result, 200));
    } catch (err) {
      errorLogger(fastify, err.message, commonPath + "/saveEvent", request);
      reply.status(200).send(error(err.message, ERROR_CODES.SERVER_ERROR, 200));
    }
};
module.exports = {
    saveEvent,
};