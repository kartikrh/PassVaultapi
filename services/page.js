const {
  insertPageQuery,
  updatePageQuery,
  validatePageIdInMenuItem,
  validatePageIdInPageAlias,
  deletePageQuery,
} = require("../repository/TablePage");

const allPageService = async (fastify) => {
  return global.tblPages;
};

const pageByIdService = async (request, fastify) => {
  const { pageId } = request.body;
  const result = global.tblPages.find((item) => item.pageId === pageId);
  return result || null;
};

const addPageService = async (request, fastify) => {
  if (request.body.pageFormatId) {
    const validatePageFormateId = global.tblPageFormats.find(
      (item) => item.pageFormatId === request.body.pageFormatId
    );

    if (!validatePageFormateId) {
      throw new Error("Invalid page format id");
    }
  }

  const data = await insertPageQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );

  global.tblPages.push(data);

  return data;
};

const updatePageService = async (request, fastify) => {
  const validatePageId = global.tblPages.find(
    (item) => item.pageId === request.body.pageId
  );
  if (!validatePageId) {
    throw new Error("Invalid page id");
  }

  if (request.body.pageFormatId) {
    const validatePageFormateId = global.tblPageFormats.find(
      (item) => item.pageFormatId === request.body.pageFormatId
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
    pageId: request.body.pageId,
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

  const index = global.tblPages.findIndex(
    (item) => item.pageId === request.body.pageId
  );

  global.tblPages[index] = {
    ...result,
    pageId: request.body.pageId,
    pageFormatId: body.pageFormatId,
  };

  return {
    ...result,
    pageId: request.body.pageId,
    pageFormatId: body.pageFormatId,
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

  global.tblPages = global.tblPages.filter(
    (item) => !encryptedIds.includes(item.pageId)
  );

  return "Page(s) deleted successfully";
};

const savePageService = async (request, fastify) => {
  const { pageId } = request.body;

  if (pageId === "0") {
    return await addPageService(request, fastify);
  } else {
    return await updatePageService(request, fastify);
  }
};

module.exports = {
  allPageService,
  pageByIdService,
  savePageService,
  deletePageService,
};
