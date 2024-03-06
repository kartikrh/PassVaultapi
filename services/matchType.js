const {
  insertMatchTypeQuery,
  deleteMatchTypeQuery,
  updateMatchTypeQuery,
  deleteMatchTypePredictorQuery,
} = require("../repository/TableMatchType");

const allMatchTypesService = async () => {
  return global.tblMatchTypes;
};

const matchTypeByIdService = async (request) => {
  const { matchTypeId } = request.body;
  const result = global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeId
  );
  return result || null;
};

const createMatchTypeService = async (request, fastify) => {
  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }

  const data = await insertMatchTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblMatchTypes.push(data);
  return data;
};

const cloneMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  const validateMatchType = global.tblMatchTypes.find(
    (item) =>
      item.matchType.toLowerCase() === request.body.matchType.toLowerCase()
  );

  if (validateMatchType) {
    throw new Error("MatchType already exist");
  }

  const data = await insertMatchTypeQuery(
    {
      ...checkId,
      matchType: request.body.matchType,
      userId: request.userTokenInfo.WrUserId,
    },
    fastify,
    request
  );

  global.tblMatchTypes.push(data);
  return data;
};

const updateMatchTypeService = async (request, fastify) => {
  const checkId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (!checkId) {
    throw new Error("MatchType with this id not Found");
  }

  if (request.body.matchTypeName) {
    const validateMatchType = global.tblMatchTypes.find(
      (item) =>
        item.matchType.toLowerCase() === request.body.matchType.toLowerCase() &&
        item.matchTypeId !== request.body.matchTypeId
    );

    if (validateMatchType) {
      throw new Error("MatchType already exist");
    }
  }

  const data = await updateMatchTypeQuery(
    {
      ...request.body,
      modifyBy: request.userTokenInfo.WrUserId,
      modifyDate: new Date(),
    },
    fastify,
    request
  );

  const index = global.tblMatchTypes.findIndex(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  global.tblMatchTypes[index] = {
    ...data,
    matchTypeId: request.body.matchTypeId,
  };

  return { ...data, matchTypeId: request.body.matchTypeId };
};

const saveMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  if (matchTypeId === 0) {
    return await createMatchTypeService(request, fastify);
  } else {
    return await updateMatchTypeService(request, fastify);
  }
};

const deleteMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  await deleteMatchTypePredictorQuery(matchTypeId, fastify, request);
  await deleteMatchTypeQuery(matchTypeId, fastify, request);

  global.tblMatchTypes = global.tblMatchTypes.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );
  global.tblMatchTypePredictor = global.tblMatchTypePredictor.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );

  return `Match Type(s) deleted successfully`;
};

module.exports = {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
  cloneMatchTypeService,
};
