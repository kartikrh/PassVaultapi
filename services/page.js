const {
  allPageQuery,
  insertPageQuery,
  pageByIdQuery,
  updatePageQuery,
  validatePageIdInMenuItem,
  validatePageIdInPageAlias,
  deletePageQuery,
} = require("../repository/TablePage");
const { pageFormateQueryById } = require("../repository/TablePageFormate");

const allPageService = async (fastify) => {
  return await allPageQuery(fastify);
};

const pageByIdService = async (request, fastify) => {
  const { pageId } = request.body;
  const result = await pageByIdQuery(pageId, fastify);
  if (result) delete result.id;
  return result || null;
};

const addPageService = async (request, fastify) => {
  if (request.body.pageFormatId) {
    const validatePageFormateId = await pageFormateQueryById(
      request.body.pageFormatId,
      fastify
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid page format id");
    }
  }

  return await insertPageQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updatePageService = async (request, fastify) => {
  const validatePageId = await pageByIdQuery(request.body.pageId, fastify);

  if (!validatePageId) {
    throw new Error("Invalid page id");
  }

  if (request.body.pageFormatId) {
    const validatePageFormateId = await pageFormateQueryById(
      request.body.pageFormatId,
      fastify
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid page format id");
    }
  }

  const body = {
    pageTitle: request.body.pageTitle || validatePageId.pageTitle,
    pageHeading: request.body.pageHeading || validatePageId.pageHeading,
    pageName: request.body.pageName || validatePageId.pageName,
    alias: request.body.alias || validatePageId.alias,
    isLink: validatePageId.isLink,
    linkURL: request.body.linkURL || validatePageId.linkURL,
    pageFormatId: request.body.pageFormatId || validatePageId.pageFormatId,
    isOpenInNewTab: validatePageId.isOpenInNewTab,
    pageContent: request.body.pageContent || validatePageId.pageContent,
    seoWord: request.body.seoWord || validatePageId.seoWord,
    seoDescription:
      request.body.seoDescription || validatePageId.seoDescription,
    isDefault: validatePageId.isDefault,
    dynamicParameters:
      request.body.dynamicParameters || validatePageId.dynamicParameters,
    pageId: validatePageId.id,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("islink" in request.body) {
    body.isLink = request.body.isLink;
  }

  if ("isOpenInNewTab" in request.body) {
    body.isOpenInNewTab = request.body.isOpenInNewTab;
  }

  if ("isDefault" in request.body) {
    body.isDefault = request.body.isDefault;
  }

  const result = await updatePageQuery(body, fastify);

  return {
    ...result,
    pageId: request.body.pageId,
    pageFormatId: request.body.pageFormatId,
  };
};

const deletePageService = async (request, fastify) => {
  const encryptedIds = request.body.pageId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validatePageIdInMenuItem(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Page with name ${checkInValide.wrPageName} associate in Menu Items, skiped from deletion`
      );
    }

    const checkInValidePageAlias = await validatePageIdInPageAlias(
      encryptedId,
      fastify
    );

    if (checkInValidePageAlias) {
      throw new Error(
        `Page with name ${checkInValidePageAlias.wrPageName} associate in Page Alias, skiped from deletion`
      );
    }
  }

  await deletePageQuery(encryptedIds, fastify);

  return "Page(s) deleted successfully";
};

module.exports = {
  allPageService,
  pageByIdService,
  addPageService,
  updatePageService,
  deletePageService,
};
