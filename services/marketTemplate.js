const { insertMarketTemplateQuery } = require("../repository/TableMarketTemplate");

const getAllMarketTemplateService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblMarketTemplate.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblMarketTemplate.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const createMarketTemplateService = async (request, fastify) => {

  const data = await insertMarketTemplateQuery(
    request.body,
    fastify,
    request
  );

  global.tblMarketTemplate.push(data);
  return data;
};

const updateMarketTemplateService = async (request, fastify) => {
  return null
};

const saveMarketTemplateService = async (request, fastify) => {
  const { marketTemplateId } = request.body;

  if (marketTemplateId === 0) {
    return await createMarketTemplateService(request, fastify);
  } else {
    return await updateMarketTemplateService(request, fastify);
  }
};

module.exports = {
  saveMarketTemplateService,
  getAllMarketTemplateService
};