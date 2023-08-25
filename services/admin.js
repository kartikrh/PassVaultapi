const {
  getTabsQuery,
  createTabsQuery,
  encryptTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  getDisplayTabsQuery,
  hasAssociatedChildern,
} = require("../repository/TableTabs.js");

const { tabsValidator } = require("../utilities/validator.js");
const { encrypt } = require("../utilities/index.js");

async function createTabsService(request, fastify) {
  const body = tabsValidator(request.body);

  const createdTab = await createTabsQuery(body, fastify);

  const encryptedId = encrypt(createdTab.tabId.toString());

  let dataToInsert = {
    wrTabId: createdTab.tabId,
    wrEncryptedTabId: encryptedId,
  };

  await encryptTabsQuery(dataToInsert, fastify);

  createdTab.tabId = encryptedId;

  return createdTab;
}

async function getTabsService(request, fastify) {
  const tabList = await getTabsQuery(fastify);

  return tabList;
}

async function deleteTabsService(request, fastify) {
  const encryptedTabIds = request.body.encryptedTabIds;

  let idWithChildern = [];

  for (const encryptedTabId of encryptedTabIds) {
    console.log("🚀 ~ encryptedTabId:", encryptedTabId);
    const hasChildern = await hasAssociatedChildern(encryptedTabId, fastify);
    console.log("🚀 ~ hasChildern:", hasChildern);

    if (hasChildern.length) {
      idWithChildern.push(hasChildern[0].wrTabName);
    } else {
      await deleteTabsQuery(encryptedTabId, fastify);
    }
  }

  if (idWithChildern.length) {
    return `Tab(s) with name(s) ${idWithChildern.join(
      ","
    )} has associated childern , skiped from deletion`;
  } else {
    return `Tab(s) deleted successfully`;
  }
}

async function getSpecificTabsService(request, fastify) {
  const { id } = request.body;
  const data = await getSpecificTabsQuery(id, fastify);
  return data || null;
}

async function updateSpecificTabService(request, fastify) {
  const { id } = request.body;

  const checkDataById = await getTabInfoQuery(id, fastify);

  if (!checkDataById) {
    throw new Error("No Tabs Found for this Id");
  }

  const updateTab = await updateTabQuery(
    checkDataById.wrTabId,
    request,
    fastify
  );
  return { ...updateTab, tabId: id };
}

async function getDisplayTabsService(request, fastify) {
  const { displayType } = request.body;
  const tabList = await getDisplayTabsQuery(displayType, fastify);
  return tabList;
}

module.exports = {
  createTabsService,
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  updateSpecificTabService,
  updateTabQuery,
  getDisplayTabsService,
};
