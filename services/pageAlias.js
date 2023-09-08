const {
  insertPageAliasQuery,
  updatePageAliasQuery,
  deletePageAliasQuery,
} = require("../repository/TablePageAlias");

const allPageAliasService = async (fastify) => {
  return global.tblPageAliases;
};

const pageAliasByIdService = async (request, fastify) => {
  const { pageAliasId } = request.body;
  const result = global.tblPageAliases.find(
    (item) => item.pageAliasId === pageAliasId
  );
  return result || null;
};

const addPageAliasService = async (request, fastify) => {
  if (request.body.pageId) {
    const validatePageFormateId = global.tblPages.find(
      (item) => item.pageId === request.body.pageId
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid page id");
    }
  }

  if (request.body.menuItemId) {
    const validatePageFormateId = global.tblMenuItems.find(
      (item) => item.menuItemId === request.body.menuItemId
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid menuItemId id");
    }
  }

  const data = await insertPageAliasQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );

  global.tblPageAliases.push(data);

  return data;
};

const updatePageAliasService = async (request, fastify) => {
  const validatePageAliasId = global.tblPageAliases.find(
    (item) => item.pageAliasId === request.body.pageAliasId
  );
  if (!validatePageAliasId) {
    throw new Error("Page Alias not found for give id");
  }

  const body = {
    pageTitle: request.body.pageTitle || validatePageAliasId.pageTitle,
    pageName: request.body.pageName || validatePageAliasId.pageName,
    alias: request.body.alias || validatePageAliasId.alias,
    pageId: request.body.pageId || validatePageAliasId.pageId,
    menuItemId: request.body.menuItemId || validatePageAliasId.menuItemId,
    userId: request.userTokenInfo.WrUserId,
    pageAliasId: request.body.pageAliasId,
  };

  if (request.body.pageId) {
    const validatePageId = global.tblPages.find(
      (item) => item.pageId === request.body.pageId
    );
    if (!validatePageId) {
      throw new Error("Page not found for give id");
    }
  }

  if (request.body.menuItemId) {
    const validateMenuItemId = global.tblMenuItems.find(
      (item) => item.menuItemId === request.body.menuItemId
    );
    if (!validateMenuItemId) {
      throw new Error("Menu Item not found for give id");
    }
  }

  await updatePageAliasQuery(body, fastify);

  const index = global.tblPageAliases.findIndex(
    (item) => item.pageAliasId === request.body.pageAliasId
  );

  global.tblPageAliases[index] = {
    ...body,
    pageAliasId: request.body.pageAliasId,
    userId: undefined,
  };

  return {
    ...body,
    pageAliasId: request.body.pageAliasId,
    userId: undefined,
  };
};

const deletePageAliasService = async (request, fastify) => {
  await deletePageAliasQuery(request.body.pageAliasId, fastify);

  global.tblPageAliases = global.tblPageAliases.filter(
    (item) => !request.body.pageAliasId.includes(item.pageAliasId)
  );

  return `Page Alias(es) deleted successfully`;
};

const savePageAliasService = async (request, fastify) => {
  const { pageAliasId } = request.body;

  if (pageAliasId === "0") {
    return await addPageAliasService(request, fastify);
  } else {
    return await updatePageAliasService(request, fastify);
  }
};

module.exports = {
  allPageAliasService,
  pageAliasByIdService,
  savePageAliasService,
  deletePageAliasService,
};
