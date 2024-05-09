const {
  deleteApiQuery,
  insertApiQuery,
  updateApiQuery,
  activeInactiveApiQuery,
} = require("../repository/TableAPI");

const getAllApisService = async (request, fastify) => {
  return global.tblAPIs;
};

const ApiByIdService = async (request, fastify) => {
  const { apiId } = request.body;
  return global.tblAPIs.find((item) => item.apiId === apiId) || null;
};

const deleteApisService = async (request, fastify) => {
  const { apiId } = request.body;
  // delete the api
  await deleteApiQuery(apiId, request, fastify);
  global.tblAPIs = global.tblAPIs.filter((item) => !apiId.includes(item.apiId));
  return `Apis deleted successfully`;
};

const saveApisService = async (request, fastify) => {
  const { apiId } = request.body;
  if (apiId === 0) {
    return await createApiService(request, fastify);
  } else {
    return await updateApiService(request, fastify);
  }
};
const createApiService = async (request, fastify) => {
  const data = await insertApiQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );
  global.tblAPIs.push(data[0]);

  return data;
};
const updateApiService = async (request, fastify) => {
  // validate the apiId
  const validateApiId = global.tblAPIs.find(
    (item) => item.apiId === request.body.apiId
  );
  if (!validateApiId) {
    throw new Error("Apis with this Id not found");
  }
  const body = {
    apiId: request.body.apiId,
    type: request.body.type || validateApiId.type,
    api: request.body.api || validateApiId.api,
    isActive: request.body.isActive || validateApiId.isActive,
  };

  await updateApiQuery(body, request, fastify);
  const index = global.tblAPIs.findIndex(
    (item) => item.apiId === request.body.apiId
  );
  global.tblAPIs[index] = body;
  return body;
};

const activeInactiveApiService = async (request, fastify) => {
  //validate the apiId
  const { apiId, isActive } = request.body;
  const validateApiId = global.tblAPIs.find((item) => item.apiId === apiId);
  if (!validateApiId) {
    throw new Error("Apis with this Id not found");
  }
  await activeInactiveApiQuery(
    {
      apiId,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblAPIs.findIndex((item) => item.apiId === apiId);
  global.tblAPIs[index].isActive = isActive;

  return `Apis updated successfully`;
};

module.exports = {
  getAllApisService,
  ApiByIdService,
  saveApisService,
  deleteApisService,
  activeInactiveApiService,
};
