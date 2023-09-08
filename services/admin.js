const {
  getTabsQuery,
  createTabsQuery,
  deleteTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  hasAssociatedChildern,
  validateAllTabIdsQuery,
  getMaxDispalyOrderByParent,
  getAllActiveInactiveTabsQuery,
  updateDisplayOrder,
} = require("../repository/TableTabs.js");

const { tabsValidator } = require("../utilities/validator.js");

async function createTabsService(request, fastify) {
  const body = tabsValidator(request.body);

  const validateTabByNameAndParent = global.tblTabs.find(
    (item) =>
      item.parentId == body.wrParentId &&
      item.tabName.toLowerCase() === body.wrTabName.toLowerCase()
  );

  if (validateTabByNameAndParent) {
    throw new Error("Same tab name in same parent not allowed");
  }

  const createdTab = await createTabsQuery(body, fastify);

  global.tblTabs.push(createdTab);

  return createdTab;
}

async function getTabsService(request, fastify) {
  const tabList = await getTabsQuery(fastify);

  return tabList;
}

async function getAllTabsService(request, fastify) {
  return global.tblTabs;
}

async function deleteTabsService(request, fastify) {
  const encryptedTabIds = request.body.encryptedTabIds;

  for (const encryptedTabId of encryptedTabIds) {
    const hasChildern = await hasAssociatedChildern(encryptedTabId, fastify);

    if (hasChildern.length) {
      throw new Error(
        `Tab(s) with name ${hasChildern[0].wrTabName} has associated childern , skiped from deletion`
      );
    }
  }

  await deleteTabsQuery(encryptedTabIds, fastify);

  global.tblTabs = global.tblTabs.filter(
    (item) => !encryptedTabIds.includes(item.encryptedTabId)
  );

  return "Tab(s) deleted successfully";
}

async function getSpecificTabsService(request, fastify) {
  const { id } = request.body;
  const data = global.tblTabs.find((item) => item.encryptedTabId === id);
  return data || null;
}

async function updateSpecificTabService(request, fastify) {
  const { id } = request.body;

  const checkDataById = await getTabInfoQuery(id, fastify);

  if (!checkDataById) {
    throw new Error("No Tabs Found for this Id");
  }

  const checkByName = global.tblTabs.find(
    (item) =>
      item.tabName.toLowerCase() === request.body.tabName.toLowerCase() &&
      item.encryptedTabId !== id &&
      item.parentId === request.body.parentId
  );

  if (checkByName) {
    throw new Error("Same tab name in same parent not allowed");
  }

  if (checkDataById.wrParentId !== request.body.parentId) {
    const maxDisplay = await getMaxDispalyOrderByParent(
      request.body.parentId,
      fastify
    );

    request.body.displayOrder = Number(maxDisplay) + 1;
  }

  const updateTab = await updateTabQuery(
    checkDataById.wrTabId,
    request,
    fastify
  );

  global.tblTabs = global.tblTabs.map((item) => {
    if (item.encryptedTabId === id) {
      item = { ...updateTab, encryptedTabId: id };
    }
    return item;
  });

  return { ...updateTab, encryptedTabId: id };
}

async function getDisplayTabsService(request, fastify) {
  const { displayType } = request.body;
  return global.tblTabs.filter((item) => item.displayType === displayType);
}

async function changeDisplayOrderService(request, fastify) {
  const tabIds = request.body.map((item) => item.tabId);

  const validateAllTabIds = await validateAllTabIdsQuery(tabIds, fastify);

  if (validateAllTabIds.length !== tabIds.length) {
    throw new Error("Invalid Tab Ids");
  }

  const checkAllTabsParent = validateAllTabIds.every(
    (item) => item.wrParentId === validateAllTabIds[0].wrParentId
  );

  if (!checkAllTabsParent) {
    throw new Error("All tabs should have same parent");
  }

  for (const item of request.body) {
    await updateDisplayOrder(item, fastify);
  }

  const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);

  global.tblTabs = getAllTabs;

  return "Order chaged successfully";
}

async function saveTabService(request, fastify) {
  const { id } = request.body;

  if (id === "0") {
    return await createTabsService(request, fastify);
  } else {
    return await updateSpecificTabService(request, fastify);
  }
}

module.exports = {
  saveTabService,
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  getDisplayTabsService,
  changeDisplayOrderService,
  getAllTabsService,
};
