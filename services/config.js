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
  const { id } = request.body;
  const result = global.tblConfigs.find((item) => item.id === id);
  return result || null;
};

const createConfigService = async (request, fastify) => {
  global.tblConfigs.find((item)=>{
      if(item.key.toLowerCase() === request.body.key.toLowerCase()){
        throw new Error("Config with this Key already exists");
      }
      else if(item.value.toLowerCase() === request.body.value.toLowerCase()){
        throw new Error("Config with this Value already exists");
      }
  });
  const data = await insertConfigQuery(
    {
      ...request.body,
      userId :request.userTokenInfo.WrUserId,
    }, fastify, request);

  global.tblConfigs.push(data);
  return data;
};

const updateConfigService = async (request, fastify) => {
  const { id } = request.body;
  const checkId = global.tblConfigs.find((item) => item.id === id);

  if (!checkId) {
    throw new Error("Config with this id not Found");
  }
  global.tblConfigs.find((item)=>{
      if(item.key.toLowerCase() === request.body.key.toLowerCase() && item.id !== id){
        throw new Error("Config with this Key already exists");
      }
      else if(item.value.toLowerCase() === request.body.value.toLowerCase() && item.id !== id){
        throw new Error("Config with this Value already exists");
      }
  });

  const data = {
    id: request.body.id,
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

  const index = global.tblConfigs.findIndex((item) => item.id === id);

  global.tblConfigs[index] = data;

  return data;
};

const saveConfigService = async (request, fastify) => {
  const { id } = request.body;

  if (id === "0") {
    return await createConfigService(request, fastify);
  } else {
    return await updateConfigService(request, fastify);
  }
};

const deleteConfigService = async (request, fastify) => {
  const { id } = request.body;

  await deleteConfigQuery(id, fastify, request);

  global.tblConfigs = global.tblConfigs.filter((item) => !id.includes(item.id));

  return `Config(s) deleted successfully`;
};

module.exports = {
  allCongifService,
  configByIdService,
  saveConfigService,
  deleteConfigService,
};
