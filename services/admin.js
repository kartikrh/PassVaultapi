const {
  getTabsQuery,
  createTabsQuery,
  deleteTabsQuery,
  getSpecificTabsQuery,
  getTabInfoQuery,
  updateTabQuery,
  getDisplayTabsQuery,
  hasAssociatedChildern,
  changeDisplayOrderOfMovingTabQuery,
  findTabsByParentId,
  validateTabByNameQuery,
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
    throw new Error("Same tab name in same parent nor allowed");
  }

  const createdTab = await createTabsQuery(body, fastify);

  return createdTab;
}

async function getTabsService(request, fastify) {
  const tabList = await getTabsQuery(fastify);

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
    throw new Error("Same tab name in same parent nor allowed");
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
  const { tabId, belowWho } = request.body;

  const validateMovingTab = await getTabInfoQuery(tabId, fastify);
  const validateBelowWhoTab = await getTabInfoQuery(belowWho, fastify);

  if (validateMovingTab?.wrParentId !== validateBelowWhoTab?.wrParentId) {
    throw new Error("You can only switch order in same parent tabs");
  }

  const tabsIds = await findTabsByParentId(
    validateMovingTab.wrParentId,
    fastify
  );

  const updateTabIds = tabsIds.filter((data) => {
    return (
      data.wrDisplayOrder < validateMovingTab.wrDisplayOrder &&
      data.wrDisplayOrder > validateBelowWhoTab.wrDisplayOrder
    );
  });

  if (!updateTabIds.length) {
    throw new Error("");
  }

  for (let tabs of updateTabIds) {
    await changeDisplayOrderOfMovingTabQuery(
      {
        tabId: tabs.wrTabId,
        order: tabs.wrDisplayOrder + 1,
      },
      fastify
    );
  }

  await changeDisplayOrderOfMovingTabQuery(
    {
      tabId: validateMovingTab.wrTabId,
      order: validateBelowWhoTab.wrDisplayOrder + 1,
    },
    fastify
  );

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
};
