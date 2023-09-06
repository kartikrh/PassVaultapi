const { menuItemByIdQuery } = require("../repository/TableMenuItem");
const { pageByIdQuery } = require("../repository/TablePage");
const {
  allPageAliases,
  insertPageAliasQuery,
  pageAliasById,
  updatePageAliasQuery,
  deletePageAliasQuery,
} = require("../repository/TablePageAlias");

const allPageAliasService = async (fastify) => {
  return await allPageAliases(fastify);
};

const pageAliasByIdService = async (request, fastify) => {
  const { pageAliasId } = request.body;
  const result = await pageAliasById(pageAliasId, fastify);
  if (result) delete result.id;
  return result || null;
};

const addPageAliasService = async (request, fastify) => {
  if (request.body.pageId) {
    const validatePageFormateId = await pageByIdQuery(
      request.body.pageId,
      fastify
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid page id");
    } else {
      request.body.pageId = validatePageFormateId.id;
    }
  }

  if (request.body.menuItemId) {
    const validatePageFormateId = await menuItemByIdQuery(
      request.body.menuItemId,
      fastify
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid menuItemId id");
    } else {
      request.body.menuItemId = validatePageFormateId.id;
    }
  }

  return await insertPageAliasQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updatePageAliasService = async (request, fastify) => {
  const validatePageAliasId = await pageAliasById(
    request.body.pageAliasId,
    fastify
  );
  if (!validatePageAliasId) {
    throw new Error("Page Alias not found for give id");
  }

  const body = {
    pageTitle: request.body.pageTitle || validatePageAliasId.pageTitle,
    pageName: request.body.pageName || validatePageAliasId.pageName,
    alias: request.body.alias || validatePageAliasId.alias,
    pageId: validatePageAliasId.pageId,
    menuItemId: validatePageAliasId.menuItemId,
    userId: request.userTokenInfo.WrUserId,
    pageAliasId: validatePageAliasId.id,
  };

  if (request.body.pageId) {
    const validatePageId = await pageByIdQuery(request.body.pageId, fastify);
    if (!validatePageId) {
      throw new Error("Page not found for give id");
    }
    body.pageId = validatePageId.pageId;
  }

  if (request.body.menuItemId) {
    const validateMenuItemId = await menuItemByIdQuery(
      request.body.menuItemId,
      fastify
    );
    if (!validateMenuItemId) {
      throw new Error("Menu Item not found for give id");
    }
    body.menuItemId = validateMenuItemId.menuItemId;
  }

  await updatePageAliasQuery(body, fastify);

  return {
    ...body,
    pageAliasId: request.body.pageAliasId,
    userId: undefined,
  };
};

const deletePageAliasService = async (request, fastify) => {
  await deletePageAliasQuery(request.body.pageAliasId, fastify);

  return `Page Alias(es) deleted successfully`;
};

module.exports = {
  allPageAliasService,
  pageAliasByIdService,
  addPageAliasService,
  updatePageAliasService,
  deletePageAliasService,
};
