
const { ERROR_CODES, error, success} = require('../../utilities/index');
const {signUpUserService,signInUserServices} = require('../../services/user')

async function signUpUser(request, reply,fastify) {
  try {
    const result = await signUpUserService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}
async function signInUser(request, reply,fastify) {
  try {
    const result = await signInUserServices(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

module.exports = {
  signUpUser,
  signInUser
  };