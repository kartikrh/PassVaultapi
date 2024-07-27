const { deleteClientQuery, insertClientQuery, updateClientQuery, activeInactiveClientQuery } = require("../repository/TableClient");

const getAllClientService = async (request, fastify) => {
  const { isActive, isUserActive } = request.body;
  if (isActive == undefined) {
    return global.tblClient;
  }
  if(isUserActive !== undefined && isActive !== undefined){
    return global.tblClient.filter((item)=> item.isUserActive == isUserActive && item.isActive === isActive)
  }
  return global.tblClient.filter((item) => item.isActive === isActive);
};

const clientByIdService = async (request, fastify) => {
  const { clientId } = request.body;
  return (
    global.tblClient.find((item) => item.clientId === clientId) || null
  );
};

const deleteClientService = async (request, fastify) => {
  const { clientId } = request.body;
  // delete the client
  await deleteClientQuery(clientId, request, fastify);
  global.tblClient = global.tblClient.filter(
    (item) => !clientId.includes(item.clientId)
  );
  return `Client deleted successfully`;
};

const saveClientService = async (request, fastify) => {
  const { clientId } = request.body;
  if (clientId === 0) {
    return await createClientService(request, fastify);
  } else {
    return await updateClientService(request, fastify);
  }
};
const createClientService = async (request, fastify) => {
  const data = await insertClientQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );

  global.tblClient.push(data[0]);
  return data;
};
const updateClientService = async (request, fastify) => {
  // validate the clientId
  const validateClientId = global.tblClient.find(
    (item) => item.clientId === request.body.clientId
  );
  if (!validateClientId) {
    throw new Error("Client with this Id not found");
  }
  const body = {
    clientId: request.body.clientId,
    fullName: request.body.fullName || validateClientId.fullName,
    userName: request.body.userName || validateClientId.userName,
    isAllowMultiLogin: request.body.isAllowMultiLogin || validateClientId.isAllowMultiLogin,
    isDelete: request.body.isDelete || validateClientId.isDelete,
    isEmailVerified: request.body.isEmailVerified || validateClientId.isEmailVerified,
    emailId: request.body.emailId || validateClientId.emailId,
    isMobileVerified: request.body.isMobileVerified || validateClientId.isMobileVerified,
    mobileNo: request.body.mobileNo || validateClientId.mobileNo,
    registrationProcessStatus: request.body.registrationProcessStatus || validateClientId.registrationProcessStatus,
    isUserActive: request.body.isUserActive || validateClientId.isUserActive,
    provider: request.body.provider || validateClientId.provider,
    isActive: request.body.isActive || validateClientId.isActive,
  };

  await updateClientQuery(body, request, fastify);
  const index = global.tblClient.findIndex(
    (item) => item.clientId === request.body.clientId
  );
  global.tblClient[index] = body;
  return body;
};

const activeInactiveClientService = async (request, fastify) => {
  //validate the clientId
  const { clientId, isActive } = request.body;
  const validateClientId = global.tblClient.find(
    (item) => item.clientId === clientId
  );
  if (!validateClientId) {
    throw new Error("Client with this Id not found");
  }
  await activeInactiveClientQuery(
    {
      clientId,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblClient.findIndex(
    (item) => item.clientId === clientId
  );
  global.tblClient[index].isActive = isActive;

  return `Client updated successfully`;
};

module.exports = {
  getAllClientService,
  clientByIdService,
  saveClientService,
  deleteClientService,
  activeInactiveClientService,
};
