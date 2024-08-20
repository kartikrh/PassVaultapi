const {
  insertThirdPartyApisQuery,
  updateThirdPartyApisQuery,
  deleteThirdPartApisQuery,
  activeInactiveThirdPartyApisQuery,
} = require("../repository/TableThirdPartyApis");

const allThirdPartyApisService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblThirdPartyApis.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblThirdPartyApis.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const thirdPartyApiseByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblThirdPartyApis.find((item) => item.id === id);
  return result || null;
};

const createThirdPartyApisService = async (request, fastify) => {
  const validateUrl = global.tblThirdPartyApis.find((item) => item.url.toLowerCase() === request.body.url.toLowerCase());
  if(validateUrl){
    throw new Error("URL already exists");
  }
  const data = await insertThirdPartyApisQuery(request.body, fastify, request);
  global.tblThirdPartyApis.push(data);
  return data;
};

const updateThirdPartyApisService = async (request, fastify) => {
  const checkId = global.tblThirdPartyApis.find((item) => item.id === request.body.id);
  if (!checkId) {
    throw new Error("ID not Found");
  }

  const validateUrl = global.tblThirdPartyApis.find((item) => item.url.toLowerCase() === request.body.url.toLowerCase());
  if(validateUrl){
    throw new Error("URL already exists");
  }

  const data = {
    providerName: request.body.providerName || checkId.providerName,
    url: request.body.url || checkId.url,
    type: request.body.type || checkId.type,
    isActive: request.body.isActive || checkId.isActive,
    isConnect: request.body.isConnect || checkId.isConnect,
    id: request.body.id,
  };

  await updateThirdPartyApisQuery(data, fastify, request);

  const index = global.tblThirdPartyApis.findIndex(
    (item) => item.id === data.id
  );
  if (index !== -1) {
    global.tblThirdPartyApis[index] = data;
  }

  return data;
};

const saveThirdPartyApisService = async (request, fastify) => {
  const { id } = request.body;

  if (id === 0) {
    return await createThirdPartyApisService(request, fastify);
  } else {
    return await updateThirdPartyApisService(request, fastify);
  }
};

const deleteThirdPartyApisService = async (request, fastify) => {
  const { id } = request.body;

  await deleteThirdPartApisQuery(id, fastify, request);
  global.tblThirdPartyApis = global.tblThirdPartyApis.filter(
    (item) => !id.includes(item.id)
  );

  return `Third party Api(s) deleted successfully`;
};

const activeInactiveThirdPartyApisService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateApiId = global.tblThirdPartyApis.find((item) => item.id === id);
  if (!validateApiId) {
    throw new Error("ID not found");
  }
  await activeInactiveThirdPartyApisQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblThirdPartyApis.findIndex((item) => item.id === id);
  if (index != -1) {
    global.tblThirdPartyApis[index].isActive = isActive;
  }

  return `IsActive stage updated successfully`;
};

module.exports = {
  allThirdPartyApisService,
  thirdPartyApiseByIdService,
  saveThirdPartyApisService,
  deleteThirdPartyApisService,
  activeInactiveThirdPartyApisService,
};
