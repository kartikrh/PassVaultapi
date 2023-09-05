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
  return await allPageFormateQuery(fastify);
};

const pageFormatServiceById = async (request, fastify) => {
  const { pageFormatId } = request.body;
  const result = await pageFormateQueryById(pageFormatId, fastify);
  if (result) delete result.id;
  return result || null;
};

const addPageFormatService = async (request, fastify) => {
  const validateByName = await checkPageFormateByName(request.body, fastify);
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }
  return await insertPageFormateQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
  );
};

const updatePageFormatService = async (request, fastify) => {
  const checkId = await pageFormateQueryById(
    request.body.pageFormatId,
    fastify
  );

  if (!checkId) {
    throw new Error("Page Format with this id not Found");
  }

  const body = {
    pageFormatName: request.body.pageFormatName || checkId.pageFormatName,
    pageName: request.body.pageName || checkId.pageName,
    image: request.body.image || checkId.image,
    description: request.body.description || checkId.description,
    pageFormatId: checkId.id,
    userId: request.userTokenInfo.WrUserId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  } else {
    body.isActive = checkId.isActive;
  }

  const validateByName = await checkPageFormateByName(body, fastify, "update");
  if (validateByName) {
    throw new Error("Page Format with this name is already exists");
  }

  return await updatePageFormateQuery(body, fastify);
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

  return "Page formate(s) deleted successfully";
};

module.exports = {
  allPageFormatService,
  pageFormatServiceById,
  addPageFormatService,
  updatePageFormatService,
  deletePageFormatService,
};
