const {
  insertConfigQuery,
  updateConfigQuery,
  deleteConfigQuery,
} = require("../repository/TableConfig");

const allCongifService = async (request,fastify) => {
  // return global.tblConfigs;
  const {isActive} = request.body;
  if(isActive === undefined){
    return global.tblConfigs;
  }
  else{
    const result = global.tblConfigs.filter((config) => config.isActive === isActive);
    return result;
  }
};

const configByIdService = async (request) => {
  const { configId } = request.body;
  const result = global.tblConfigs.find((item) => item.configId === configId);
  return result || null;
};

const createConfigService = async (request, fastify) => {
  // check if key already exists
  const checkKey = global.tblConfigs.find((item) => item.key.toLowerCase() === request.body.key.trim().toLowerCase());
  if (checkKey) {
    throw new Error("Config with this Key already exists");
  }
  const data = await insertConfigQuery(
    {
      ...request.body,
      userId :request.userTokenInfo.WrUserId,
    }, fastify, request);

  global.tblConfigs.push(data);
  return data;
};

const updateConfigService = async (request, fastify) => {
  const { configId } = request.body;
  const checkId = global.tblConfigs.find((item) => item.configId === configId);

  if (!checkId) {
    throw new Error("Config with this id not Found");
  }
  const checkKey = global.tblConfigs.find((item) => item.key.toLowerCase() === request.body.key.trim().toLowerCase() && item.configId !== configId);
  if (checkKey) {
    throw new Error("Config with this Key already exists");
  }

  const data = {
    configId: request.body.configId,
    key: request.body.key || checkId.key,
    value: request.body.value || checkId.value,
    desc: request.body.desc || checkId.desc,
    isActive : request.body.hasOwnProperty('isActive') ? request.body.isActive : checkId.isActive,
    isForAdmin: request.body.hasOwnProperty('isForAdmin') ? request.body.isForAdmin : checkId.isForAdmin,
  };

  // if ("isActive" in request.body) {
  //   data.isActive = request.body.isActive;
  // }

  await updateConfigQuery({
    ...data,
    userId : request.userTokenInfo.WrUserId,
  }, fastify, request);

  const index = global.tblConfigs.findIndex((item) => item.configId === configId);

  global.tblConfigs[index] = data;

  return data;
};

const saveConfigService = async (request, fastify) => {
  const { configId } = request.body;

  if (configId === "0") {
    return await createConfigService(request, fastify);
  } else {
    return await updateConfigService(request, fastify);
  }
};

const deleteConfigService = async (request, fastify) => {
  const { configId } = request.body;

  await deleteConfigQuery(configId, fastify, request);

  global.tblConfigs = global.tblConfigs.filter((item) => !configId.includes(item.configId));

  return `Config(s) deleted successfully`;
};

module.exports = {
  allCongifService,
  configByIdService,
  saveConfigService,
  deleteConfigService,
};
