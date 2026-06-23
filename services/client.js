const { deleteClientQuery, insertClientQuery, updateClientQuery, activeInactiveClientQuery, isUserActiveInactiveQuery, clientEmailVerifyQuery, clientMobileVerifyQuery, deleteClientEncryptQuery, addClientDltReqQuery, getIdByEncrypt } = require("../repository/TableClient");
const { encrypt, decrypt } = require("../utilities/index");

const getAllClientService = async (request, fastify) => {
  const { isActive, isUserActive, provider, registrationProcessStatus, isEmailVerified, isMobileVerified } = request.body;
  let result = global.tblClient.map(({ password, seamlessToken, ...res }) => res);
  if (isActive == undefined) {
    result = result;
  }

  if (isActive != undefined) {
    result = result.filter((item) => item.isActive === isActive);
  }

  if (isUserActive != null || isUserActive != undefined) {
    result = result.filter((item) => item.isUserActive == isUserActive);
  }

  if (provider != null || provider != undefined) {
    result = result.filter((item) => item.provider == provider);
  }

  if (registrationProcessStatus != null || registrationProcessStatus != undefined) {
    result = result.filter((item) => item.registrationProcessStatus == registrationProcessStatus);
  }

  if (isEmailVerified != undefined) {
    result = result.filter((item) => item.isEmailVerified === isEmailVerified);
  }

  if (isMobileVerified != undefined) {
    result = result.filter((item) => item.isMobileVerified === isMobileVerified);
  }

  return result
    .sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    })
};

const clientByIdService = async (request, fastify) => {
  const { clientId } = request.body;
  let result = global.tblClient.find(item => item.clientId === clientId) || null;

  if (result) {
    result = {
      ...result,
      decryptPassword: result?.password ? decrypt(result.password) : null,
    };
  }

  return result;
  // return (
  //   global.tblClient.find((item) => item.clientId === clientId) || null
  // );
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
  if(request.body?.password) {
    request.body.password = encrypt(request.body?.password)
  }
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
  if(request.body?.password) {
    request.body.password = encrypt(request.body?.password)
  }
  const body = {
    clientId: request.body.clientId,
    fullName: request.body.fullName || validateClientId.fullName,
    userName: request.body.userName || validateClientId.userName,
    isAllowMultiLogin: request.body.isAllowMultiLogin,
    isDelete: request.body.isDelete,
    isEmailVerified: request.body.isEmailVerified,
    emailId: request.body.emailId || validateClientId.emailId,
    isMobileVerified: request.body.isMobileVerified,
    mobileNo: request.body.mobileNo || validateClientId.mobileNo,
    registrationProcessStatus: request.body.registrationProcessStatus || validateClientId.registrationProcessStatus,
    isUserActive: request.body.isUserActive,
    provider: request.body.provider || validateClientId.provider,
    isActive: request.body.isActive,
    countryCode : request.body.countryCode || validateClientId.countryCode,
    createdDate : validateClientId.createdDate,
    password : request.body?.password || validateClientId?.password,
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

const isUserActiveInactiveService = async (request, fastify) => {
  const { clientId, isUserActive } = request.body;
  const validate = global.tblClient.find(
    (item) => item.clientId === clientId
  );
  if (!validate) {
    throw new Error("Client with this Id not found");
  }
  await isUserActiveInactiveQuery({ clientId, isUserActive }, request, fastify);

  const index = global.tblClient.findIndex(
    (item) => item.clientId === clientId
  );
  if(index !== -1){
    global.tblClient[index].isUserActive = isUserActive;
  }

  return `Client updated successfully`;
};

const emailAndMobileVerifyService = async (request, fastify) => {
  const { type, clientId, isEmailVerified, isMobileVerified } = request.body;
  const validateClientId = global.tblClient.find((item) => item.clientId === clientId);
  
  if (!validateClientId) {
    throw new Error("Client with this ID not found");
  }

  if (type === 1) {
    if (validateClientId?.emailId) {
      await clientEmailVerifyQuery({ clientId, isEmailVerified }, request, fastify);

      const index = global.tblClient.findIndex((item) => item.clientId === clientId);
      if (index !== -1) {
        global.tblClient[index].isEmailVerified = isEmailVerified;
      }

      return `Email verification status updated successfully`;
    } else {
      throw new Error(`Email does not exist for this client`);
    }
  } else if (type === 2) {
    if (validateClientId?.mobileNo) {
      await clientMobileVerifyQuery({ clientId, isMobileVerified }, request, fastify);

      const index = global.tblClient.findIndex((item) => item.clientId === clientId);
      if (index !== -1) {
        global.tblClient[index].isMobileVerified = isMobileVerified;
      }
      return `Mobile verification status updated successfully`;
    } else {
      throw new Error(`Mobile number does not exist for this client`);
    }
  }
  return `Please select 1 for email verification or 2 for mobile verification.`;
};
const deleteClientByEncryptService = async (request, fastify) => {
  // validate the clientId
  const id = await getIdByEncrypt(request.body,request,fastify);
  
  const validateClientId = global.tblClient.find((item) => item.clientId == id.clientId);
  if (!validateClientId) {
    throw new Error("Client with this Id not found");
  }
  await addClientDltReqQuery({
    clientId : id.clientId,
  }, request, fastify); 
  return `Your request has been received. We will process it in next 7 working days.`;
  // let data = await deleteClientEncryptQuery(request.body, request, fastify);
  // // console.log(data, "data")
  // const idsToRemove = data.map(d => d.clientId);

  // global.tblClient = global.tblClient.filter(
  //   (item) => !idsToRemove.includes(item.clientId)
  // );
  // return `Client deleted successfully`;
}

const getClientDecryptedPasswordService = async (request) => {
  const { clientId } = request.body;
  const clientData = global.tblClient.find(item => item.clientId == clientId)
  if(!clientData) {
    throw new Error(`Client with this Id not found`);
  }
  return {
      password: clientData.password ? decrypt(clientData.password) : null
    };
};

module.exports = {
  getAllClientService,
  clientByIdService,
  saveClientService,
  deleteClientService,
  activeInactiveClientService,
  isUserActiveInactiveService,
  emailAndMobileVerifyService,
  deleteClientByEncryptService,
  getClientDecryptedPasswordService,
};
