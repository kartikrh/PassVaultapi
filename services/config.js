const {
  insertConfigQuery,
  updateConfigQuery,
  deleteConfigQuery,
} = require("../repository/TableConfig");

const allCongifService = async () => {
  return global.tblConfigs;
};

const configByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblConfigs.find((item) => item.id === id);
  return result || null;
};

const createConfigService = async (request, fastify) => {
  const data = await insertConfigQuery(request.body, fastify, request);

  global.tblConfigs.push(data);
  return data;
};

const updateConfigService = async (request, fastify) => {
  const { id } = request.body;
  const checkId = global.tblConfigs.find((item) => item.id === id);

  if (!checkId) {
    throw new Error("Config with this id not Found");
  }

  const data = {
    id: request.body.id,
    key: request.body.key || checkId.key,
    value: request.body.value || checkId.value,
    desc: request.body.desc || checkId.desc,
  };

  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  await updateConfigQuery(data, fastify, request);

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
