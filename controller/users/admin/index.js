const { ERROR_CODES, error, success} = require('../../../utilities/index');
const {getTabsService} = require('../../../services/admin.js')


//TODO
async function createTab(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

//TODO
async function getTabs(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

//TODO
async function deleteTab(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

//TODO
async function getSpecificTab(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

//TODO
async function updateSpecificTab(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}


module.exports = {
getTabs,
createTab,
deleteTab,
getSpecificTab,
updateSpecificTab
};