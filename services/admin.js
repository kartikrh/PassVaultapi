
const { getTabsQuery} = require("../repository/TableTabs.js");

async function getTabsService(request,fastify) {
    await getTabsQuery(request,fastify)
  return 1
}

module.exports = {
    getTabsService
};
