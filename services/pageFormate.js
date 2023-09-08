const {
  allPageFormateQuery,
  pageFormateQueryById,
  checkPageFormateByName,
  insertPageFormateQuery,
  updatePageFormateQuery,
  validatePageFormatQuery,
  deletePageFormatQuery,
} = require("../repository/TablePageFormate");

const allPageFormatService = async (fastify) => {
  return global.tblPageFormats;
};

const pageFormatServiceById = async (request, fastify) => {
  const { pageFormatId } = request.body;
  const result = global.tblPageFormats.find(
    (item) => item.pageFormatId === pageFormatId
  );
  return result || null;
};

const addPageFormatService = async (request, fastify) => {
  const validateByName = global.tblPageFormats.find(
    (item) =>
      item.pageFormatName.toLowerCase() ===
      request.body.pageFormatName.toLowerCase()
  );
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }
  const data = await insertPageFormateQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
  global.tblPageFormats.push(data);
  return data;
};

const updatePageFormatService = async (request, fastify) => {
  const checkId = global.tblPageFormats.find(
    (item) => item.pageFormatId === request.body.pageFormatId
  );

  if (!checkId) {
    throw new Error("Page Format with this id not Found");
  }

  const body = {
    pageFormatName: request.body.pageFormatName || checkId.pageFormatName,
    pageName: request.body.pageName || checkId.pageName,
    image: request.body.image || checkId.image,
    description: request.body.description || checkId.description,
    pageFormatId: request.body.pageFormatId,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  const validateByName = await global.tblPageFormats.find(
    (item) =>
      item.pageFormatName.toLowerCase() === body.pageFormatName.toLowerCase() &&
      item.pageFormatId !== body.pageFormatId
  );
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }

  const data = await updatePageFormateQuery(body, fastify);

  const index = global.tblPageFormats.findIndex(
    (item) => item.pageFormatId === body.pageFormatId
  );

  global.tblPageFormats[index] = data;

  return data;
};

const deletePageFormatService = async (request, fastify) => {
  const encryptedIds = request.body.pageFormatId;

  for (const encryptedId of encryptedIds) {
    const checkInValide = await validatePageFormatQuery(encryptedId, fastify);

    if (checkInValide) {
      throw new Error(
        `Page Formate with name ${checkInValide.wrPageFormatName} associate in Pages, skiped from deletion`
      );
    }
  }

  await deletePageFormatQuery(encryptedIds, fastify);

  global.tblPageFormats = global.tblPageFormats.filter(
    (item) => !encryptedIds.includes(item.pageFormatId)
  );

  return "Page formate(s) deleted successfully";
};

const savePageFormatService = async (request, fastify) => {
  const { pageAliasId } = request.body;

  if (pageAliasId === "0") {
    return await addPageFormatService(request, fastify);
  } else {
    return await updatePageFormatService(request, fastify);
  }
};

module.exports = {
  allPageFormatService,
  pageFormatServiceById,
  savePageFormatService,
  deletePageFormatService,
};
