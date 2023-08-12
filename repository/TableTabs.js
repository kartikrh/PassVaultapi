const TabModel = require('../sequelize/tables/tabsModel')

async function getTabsQuery(request,fastify) {
    return await fastify.db.models.tblTab.findAll()

}

module.exports = {
    getTabsQuery
};
