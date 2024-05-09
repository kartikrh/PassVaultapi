const {
  deleteApiEndPointQuery,
  insertApiEndPointQuery,
  updateApiEndPointQuery,
  activeInactiveApiEndPointQuery,
} = require("../repository/TableAPIEndPoint");

const getAllApiEndpointsService = async (request, fastify) => {
  return global.tblAPIEndpoints;
};

const ApiEndpointsByIdService = async (request, fastify) => {
  const { apiEndPointId } = request.body;
  return (
    global.tblAPIEndpoints.find(
      (item) => item.apiEndPointId === apiEndPointId
    ) || null
  );
};

const deleteApiEndpointsService = async (request, fastify) => {
  const { apiEndPointId } = request.body;
  // delete the apiEndPoint
  await deleteApiEndPointQuery(apiEndPointId, request, fastify);
  global.tblAPIEndpoints = global.tblAPIEndpoints.filter(
    (item) => !apiEndPointId.includes(item.apiEndPointId)
  );
  return `Api Endpoints deleted successfully`;
};

const saveApiEndpointsService = async (request, fastify) => {
  const { apiEndPointId } = request.body;
  if (apiEndPointId === 0) {
    return await createApiEndpointsService(request, fastify);
  } else {
    return await updateApiEndpointsService(request, fastify);
  }
};
const createApiEndpointsService = async (request, fastify) => {
  const data = await insertApiEndPointQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );
  global.tblAPIEndpoints.push(data[0]);

  return data;
};
const updateApiEndpointsService = async (request, fastify) => {
  // validate the apiEndPointId
  const validateApiEndpointId = global.tblAPIEndpoints.find(
    (item) => item.apiEndPointId === request.body.apiEndPointId
  );
  if (!validateApiEndpointId) {
    throw new Error("Api Endpoint with this Id not found");
  }
  const body = {
    apiEndPointId: request.body.apiEndPointId,
    serviceType: request.body.serviceType || validateApiEndpointId.serviceType,
    endPoint: request.body.endPoint || validateApiEndpointId.endPoint,
    moduleType: request.body.moduleType || validateApiEndpointId.moduleType,
    timeOut: request.body.timeOut || validateApiEndpointId.timeOut,
    isActive: request.body.isActive || validateApiEndpointId.isActive,
  };

  await updateApiEndPointQuery(body, request, fastify);
  const index = global.tblAPIEndpoints.findIndex(
    (item) => item.apiEndPointId === request.body.apiEndPointId
  );
  global.tblAPIEndpoints[index] = body;
  return body;
};

const activeInactiveApiEndpointsService = async (request, fastify) => {
  //validate the apiEndPointId
  const { apiEndPointId, isActive } = request.body;
  const validateApiEndPointId = global.tblAPIEndpoints.find(
    (item) => item.apiEndPointId === apiEndPointId
  );
  if (!validateApiEndPointId) {
    throw new Error("Api Endpoints with this Id not found");
  }
  await activeInactiveApiEndPointQuery(
    {
      apiEndPointId,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblAPIEndpoints.findIndex(
    (item) => item.apiEndPointId === apiEndPointId
  );
  global.tblAPIEndpoints[index].isActive = isActive;

  return `Api Endpoints updated successfully`;
};

module.exports = {
  getAllApiEndpointsService,
  ApiEndpointsByIdService,
  saveApiEndpointsService,
  deleteApiEndpointsService,
  activeInactiveApiEndpointsService,
};
