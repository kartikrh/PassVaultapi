const {
  getAllFavCommentaryQuery,
  insertFavCommentaryQuery,
  deleteFavCommentaryQuery,
  getFavCommentaryByIdQuery,
} = require("../repository/TableClientFavCommentary");
const { getIdByValue, getEncryptClinet } = require("../repository/TableUser");

const saveFavCommentaryService = async (request, fastify) => {
  const checkExist = await getIdByValue({ clientId: request.body.clientId }, request, fastify);
  if (!checkExist) {
    throw new Error("Invalid ClientId");
  }
  request.body.clientId = checkExist.clientId;
  const index = global.tblClient.findIndex(
    (item) => item.clientId === request.body.clientId
  );
  if (index == -1) {
    throw new Error("Invalid ClientId");
  }

  const validateId = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (!validateId) {
    throw new Error("Commentary with this id not Found");
  }
  let whereCondition = `"wrClientId" = ${request.body.clientId} AND "wrCommentaryId" = ${request.body.commentaryId}`
  const favComm  = await getFavCommentaryByIdQuery(whereCondition, request, fastify);
  if(favComm) {
    throw new Error(`Commentary with this id added in favourite list`);
  }
  const saveData = await insertFavCommentaryQuery(
    request.body,
    fastify,
    request
  );
  const encrypted = await getEncryptClinet(
    { clientId: saveData.clientId },
    request,
    fastify
  );
  saveData.clientId = encrypted?.clientId;
  return saveData;
};

const allFavCommentaryService = async (request, fastify) => {
  const result = await getAllFavCommentaryQuery(fastify);
  const updatedResult = await Promise.all(
    result.map(async (item) => {
      const encrypted = await getEncryptClinet(
        { clientId: item.clientId },
        request,
        fastify
      );
      item.clientId = encrypted?.clientId;
      return item;
    })
  );

  return updatedResult;
};

const deleteFavCommentaryService = async (request, fastify) => {
  const { id } = request.body;
  await deleteFavCommentaryQuery(id, fastify, request);
  return `FavCommentary(s) data deleted successfully`;
};

module.exports = {
  saveFavCommentaryService,
  allFavCommentaryService,
  deleteFavCommentaryService
};
