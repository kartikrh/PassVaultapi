const {
  getTabsQuery,
  createTabsQuery,
  countTabsWithSameParent,
  encryptTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  updateSpecificTabQuery
} = require("../repository/TableTabs.js");
const { tabsValidator } = require("../utilities/validator.js");
const { hashFunction, encryptedObject } = require("../utilities/index.js");

async function createTabsService(request, fastify) {
  const body = tabsValidator(request.body);

  const tabsWithSameParent = await countTabsWithSameParent(
    body.wrParentId,
    fastify
  );

  body.wrDisplayOrder = tabsWithSameParent + 1;

  const createdTab = await createTabsQuery(body, fastify);

  const encryptedId = hashFunction(createdTab.wrTabId);

  const encryptedObj = encryptedObject(createdTab.wrTabId, encryptedId);

  const encrtptedData = await encryptTabsQuery(encryptedObj, fastify);

  createdTab.dataValues.wrTabId = encrtptedData.wrEncryptedTabId;

  return { createdTab };
}

async function getTabsService(request, fastify) {
  const tabList = await getTabsQuery(fastify);
  return { tabList };
}

async function deleteTabsService(request, fastify) {
  const encryptedTabIds = request.body.encryptedTabIds;

  for (const encryptedTabId of encryptedTabIds) {

    const encryptedTabValue = await deleteTabsQuery(encryptedTabId, fastify);

    if (encryptedTabValue[0].tblTab?.wrIsActive) {

      encryptedTabValue[0].tblTab.wrIsActive = false;

      await encryptedTabValue[0].tblTab.save();
    }
  }
  return 1;
}

async function getSpecificTabsService(request,fastify) {
  const encryptedTabId = request.params.id;
  const encryptedTabValue = await getSpecificTabsQuery(encryptedTabId, fastify);
  return {"id":encryptedTabValue.wrEncryptedTabId,...encryptedTabValue.tblTab.toJSON()}
}

//TODO
async function updateSpecificTabService(request,fastify) {


return 1
} 


module.exports = {
  createTabsService,
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  updateSpecificTabService
};
