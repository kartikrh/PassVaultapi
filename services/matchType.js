const {
  insertMatchTypeQuery,
  deleteMatchTypeQuery,
  updateMatchTypeQuery,
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
  const data = await insertMatchTypeQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify
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

  const data = await updateMatchTypeQuery(
    {
      ...request.body,
      modifyBy: request.userTokenInfo.WrUserId,
      modifyDate: new Date(),
    },
    fastify
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

  if (matchTypeId === "0") {
    return await createMatchTypeService(request, fastify);
  } else {
    return await updateMatchTypeService(request, fastify);
  }
};

const deleteMatchTypeService = async (request, fastify) => {
  const { matchTypeId } = request.body;

  await deleteMatchTypeQuery(matchTypeId, fastify);

  global.tblMatchTypes = global.tblMatchTypes.filter(
    (item) => !matchTypeId.includes(item.matchTypeId)
  );

  return `Match Type(s) deleted successfully`;
};

module.exports = {
  allMatchTypesService,
  matchTypeByIdService,
  saveMatchTypeService,
  deleteMatchTypeService,
};
