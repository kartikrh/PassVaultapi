const { ERROR_CODES, error, success} = require('../../../utilities/index');
const {getTabsService,createTabsService,deleteTabsService,getSpecificTabsService,updateSpecificTabService} = require('../../../services/admin.js')


async function createTab(request, reply,fastify) {
  try {
    const result = await createTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getTabs(request, reply,fastify) {
  try {
    const result = await getTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function deleteTab(request, reply,fastify) {
  try {
    const result = await deleteTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function getSpecificTab(request, reply,fastify) {
  try {
    const result = await getSpecificTabsService(request,fastify);
    reply.status(200).send(success(result, 200));
  } 
  catch (err) {
    reply.status(500).send(error("Internal server error", ERROR_CODES.SERVER_ERROR, 500));
  }
}

async function updateSpecificTab(request, reply,fastify) {
  try {
    const result = await updateSpecificTabService(request,fastify);
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
updateSpecificTab,
deleteTab
};