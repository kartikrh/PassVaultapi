//common controllers that will be used for admin as well as clients
//! Controller (dealing with status codes)
//* client specific controller

const { ERROR_CODES, error, success} = require('../../utilities/index');
const {findAllComment,findAllUsers} = require('../../services/user')


async function findAllCommentController(request, reply) {
  try {
    const result = await findAllComment(); 
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function findAllUsersController(request, reply) {
  try {
    const result = await findAllUsers();
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

module.exports = {
    findAllUsersController,
    findAllCommentController,
  };