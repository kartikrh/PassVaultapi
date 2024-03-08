const { insertMarketTemplateQuery } = require("../repository/TableMarketTemplate");

const saveMarketTemplateService = async (request, fastify) => {
  const data = await insertMarketTemplateQuery(
    request.body,
    fastify,
    request
  );

  global.tblMarketTemplate.push(data);
  return data;
};

module.exports = {
  saveMarketTemplateService
};