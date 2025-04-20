const {
  getAllFavCompetitionsQuery,
  getFavCompetitionByIdQuery,
  insertFavCompetitionsQuery,
  updateFavCompetitionsQuery,
  deleteFavCompetitionsQuery,
  updateDisplayOrderQuery,
  isDefaultFalseQuery,
} = require("../repository/TableFavCompetitions");
const { getIdByValue, getEncryptClinet } = require("../repository/TableUser")

const saveFavCompetitionsService = async (request, fastify) => {
    console.log("save  0 request.body", request.body)
  const checkExist = await getIdByValue({ clientId: request.body.clientId }, request, fastify)
  if(!checkExist){
    return "Invalid ClientId"
  }
  request.body.clientId = checkExist.clientId;
  const index = global.tblClient.findIndex((item) => item.clientId === request.body.clientId);
  if (index == -1) {
    throw new Error("Invalid ClientId");
  }

  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === request.body.competitionId
  );
  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }
  request.body.isDefault = false
  let whereCondition = `"wrClientId" = ${request.body.clientId}`
  const isDefaultValidate = await getFavCompetitionByIdQuery(whereCondition, request, fastify);
  if (!isDefaultValidate) {
    request.body.isDefault = true
  }

  const saveData = await insertFavCompetitionsQuery(request.body, fastify, request);
  const encrypted = await getEncryptClinet({ clientId: saveData.clientId }, request, fastify);
  saveData.clientId = encrypted?.clientId;
  return saveData;
};

const editFavCompetitionsService = async (request, fastify) => {
    console.log("request.body", request.body)
  const checkExist = await getIdByValue({ clientId : request.body.clientId }, request, fastify)
  if(!checkExist){
    return "Invalid ClientId"
  }
  request.body.clientId = checkExist.clientId;
  let whereCondition = `"wrId" = ${request.body.id}`
  const validateId = await getFavCompetitionByIdQuery(whereCondition, request, fastify);
  if (!validateId) {
    throw new Error("FavCompetitions data with this Id not found");
  }
  if(request.body.competitionId) {
      const validateCompId = global.tblCompetitions.find(
        (item) => item.competitionId === request.body.competitionId
      );
      if (!validateCompId) {
        throw new Error("Competition with this id not Found");
      }
  }

  if(request.body.isDefault === true) {
      await isDefaultFalseQuery({ id: request.body.id, clientId: request.body.clientId }, fastify, request);
  }
  const updateData = {
    clientId: request.body.clientId ?? validateId.clientId,
    competitionId: request.body.competitionId ?? validateId.competitionId,
    isDefault: request.body.isDefault ?? validateId.isDefault,
    displayOrder: request.body.displayOrder ?? validateId.displayOrder,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updateFavCompetitionsQuery(updateData, fastify, request);
  const encrypted = await getEncryptClinet({ clientId: modifiedData[0].clientId }, request, fastify);
  modifiedData[0].clientId = encrypted?.clientId;
  return modifiedData[0];
};

const allFavCompetitionsService = async (request, fastify) => {
  const result = await getAllFavCompetitionsQuery(fastify);
  const updatedResult = await Promise.all(
    result.map(async item => {
      const encrypted = await getEncryptClinet({ clientId: item.clientId }, request, fastify);
      item.clientId = encrypted?.clientId;
      return item;
    })
  );

  return updatedResult;
};

const createFavCompetitionsService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveFavCompetitionsService(request, fastify, request);
  } else {
    return await editFavCompetitionsService(request, fastify, request);
  }
};

const deleteFavCompetitionsService = async (request, fastify) => {
  const { id } = request.body;
  await deleteFavCompetitionsQuery(id, fastify, request);
  return `FavCompetitions(s) data deleted successfully`;
};

const updateDisplayOrderService = async (request, fastify) => {
  for (const item of request.body) {
      await updateDisplayOrderQuery(item, request, fastify);
  }
  return `Display order updated successfully`;
}

module.exports = {
  createFavCompetitionsService,
  allFavCompetitionsService,
  deleteFavCompetitionsService,
  updateDisplayOrderService,
};
