
async function countTabsWithSameParent(wrParentId, fastify) {
  return await fastify.db.models.tblTab.count({
    where: {
      wrParentId,
    },
  });
}

async function createTabsQuery(body, fastify) {
    return await fastify.db.models.tblTab.create(body);
}

async function encryptTabsQuery(body, fastify) {
  return await fastify.db.models.tblEncryptedTab.create(body);
}

async function getTabsQuery(excludedParentIdsArray,fastify) {
  return await fastify.db.models.tblEncryptedTab.findAll({
    attributes:{
      exclude: ['wrTabId','id','createdAt','updatedAt'], 
    },
    include: {
      model: fastify.db.models.tblTab,
      attributes:{
        exclude: ['wrTabId'],
      },
      where: {
        wrIsActive: true,
        wrParentId: {
          [fastify.db.Sequelize.Op.notIn]: excludedParentIdsArray,
        },
      },
    },
  });
}

async function deleteTabsQuery(Id, fastify) {
  return await fastify.db.models.tblEncryptedTab.findAll({
    where: {
      wrEncryptedTabId: Id,
    },
    include: {
      model: fastify.db.models.tblTab,
      as: 'tblTab',
    },
  });
}

async function getSpecificTabsQuery(Id, fastify) {
  return await fastify.db.models.tblEncryptedTab.findOne({
    where: {
      wrEncryptedTabId: Id,
    },
    attributes:{
      exclude: ['wrTabId','id','createdAt','updatedAt'],
    },
    include: {
      model: fastify.db.models.tblTab,
      attributes:{
        exclude: ['wrTabId'],
      }
    },
  });
}


async function updateSpecificTabQuery(Id, fastify) {
  return await fastify.db.models.tblEncryptedTab.findAll({
    where: {
      wrEncryptedTabId: Id,
    },
    include: {
      model: fastify.db.models.tblTab,
      as: 'tblTab',
    },
  });
}

async function getTabInfoQuery(Id, fastify) {
  return await fastify.db.models.tblEncryptedTab.findOne({
    where: {
      wrEncryptedTabId: Id,
    },
    attributes:{
      exclude: ['wrTabId','id','createdAt','updatedAt'],
    },
    include: {
      model: fastify.db.models.tblTab,
    },
  });
}


async function updateTabQuery(tabId,req, fastify) {
  return await fastify.db.models.tblTab.update(req.body, {
    where: { wrTabId: tabId},
  });
}

async function inactiveTabsQuery(fastify) {
  return await fastify.db.models.tblEncryptedTab.findAll({
    attributes:{
      exclude: ['wrTabId','id','createdAt','updatedAt'], 
    },
    include: {
      model: fastify.db.models.tblTab,
      where: {
        wrIsActive: false
      },
      attributes:{
        include:[]
      }
    },
  });
}





module.exports = {
  countTabsWithSameParent,
  getTabsQuery,
  createTabsQuery,
  encryptTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  updateSpecificTabQuery,
  getTabInfoQuery,
  updateTabQuery,
  inactiveTabsQuery
};
