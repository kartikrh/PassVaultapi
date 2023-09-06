const {
  getTabsQuery,
  createTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  getDisplayTabsQuery,
  hasAssociatedChildern,
  validateAllTabIdsQuery,
  validateTabByNameQuery,
  getMaxDispalyOrderByParent,
  getAllActiveInactiveTabsQuery,
  updateDisplayOrder,
} = require("../repository/TableTabs.js");

const { tabsValidator } = require("../utilities/validator.js");

async function createTabsService(request, fastify) {
  const body = tabsValidator(request.body);

  const validateTabByNameAndParent = await validateTabByNameQuery(
    body,
    fastify,
    "create"
  );

  if (validateTabByNameAndParent.length) {
    throw new Error("Same tab name in same parent not allowed");
  }

  const createdTab = await createTabsQuery(body, fastify);

  return createdTab;
}

async function getTabsService(request, fastify) {
  const tabList = await getTabsQuery(fastify);

  return tabList;
}

async function getAllTabsService(request, fastify) {
  const tabList = await getAllActiveInactiveTabsQuery(fastify);

  return tabList;
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

  for (const encryptedTabId of encryptedTabIds) {
    await deleteTabsQuery(encryptedTabId, fastify);
  }

  return "Tab(s) deleted successfully";
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

  const validateTabByNameAndParent = await validateTabByNameQuery(
    {
      wrTabName: request.body.tabName,
      wrParentId: request.body.parentId,
      wrTabId: checkDataById.wrTabId,
    },
    fastify,
    "update"
  );

  if (validateTabByNameAndParent.length) {
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
  return { ...updateTab, tabId: id };
}

async function getDisplayTabsService(request, fastify) {
  const { displayType } = request.body;
  const tabList = await getDisplayTabsQuery(displayType, fastify);
  return tabList;
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

  return "Order chaged successfully";
}

module.exports = {
  createTabsService,
  getTabsService,
  deleteTabsService,
  getSpecificTabsService,
  updateSpecificTabService,
  updateTabQuery,
  getDisplayTabsService,
  changeDisplayOrderService,
  getAllTabsService,
};
