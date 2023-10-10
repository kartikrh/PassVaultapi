const {
  insertCompetitionQuery,
  deleteCompetitionQuery,
  updateCompititionQuery,
} = require("../repository/TableCompitition");
const { storeImage, removeImage } = require("../utilities/Images");

const allCompetitionService = async () => {
  return global.tblCompetitions;
};

const competitionByIdService = async (request) => {
  const { competitionId } = request.body;
  const result = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );
  return result || null;
};

const createCompititionService = async (request, fastify) => {
  const findExists = global.tblCompetitions.find(
    (item) =>
      item.eventTypeId === request.body.eventTypeId &&
      item.refId === request.body.refId
  );

  if (findExists) {
    throw new Error(
      "Competition with this eventTypeId and refId already exists"
    );
  }

  const validateEventTypeId = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!validateEventTypeId) {
    throw new Error("EventType with this id not Found");
  }

  if (request.body.image && request.body.image.length) {
    const data = await storeImage(request.body.image[0]);
    request.body.image = data;
  }

  const result = await insertCompetitionQuery(request, fastify);

  global.tblCompetitions.push(result);

  return result;
};

const updateCompititionService = async (request, fastify) => {
  const { competitionId } = request.body;
  const validateId = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );

  if (!validateId) {
    throw new Error("Competition with this id not Found");
  }
  const data = {
    competitionId: request.body.competitionId,
    competition: request.body.competition || validateId.competition,
    eventTypeId: validateId.eventTypeId,
    refId: request.body.refId || validateId.refId,
    image: validateId.image,
    isActive: validateId.isActive,
  };

  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    } else {
      data.eventTypeId = request.body.eventTypeId;
    }
  }

  if (request.body.image && request.body.image.length) {
    if (data.image) {
      await removeImage(data.image);
    }

    const image = await storeImage(request.body.image[0]);
    request.body.image = image;
  }

  await updateCompititionQuery(data, fastify, request);

  const index = global.tblCompetitions.findIndex(
    (item) => item.competitionId === competitionId
  );

  global.tblCompetitions[index] = data;

  return data;
};

const saveCompetitionService = async (request, fastify) => {
  const { competitionId } = request.body;

  if (competitionId === "0") {
    return await createCompititionService(request, fastify);
  } else {
    return await updateCompititionService(request, fastify);
  }
};

const deleteCompetitionService = async (request, fastify) => {
  const { competitionId } = request.body;

  for (const id of competitionId) {
    //validate id here
  }

  await deleteCompetitionQuery(request, fastify);

  global.tblCompetitions = global.tblCompetitions.filter(
    (item) => !competitionId.includes(item.competitionId)
  );

  return `Competition(s) deleted successfully`;
};

module.exports = {
  allCompetitionService,
  competitionByIdService,
  saveCompetitionService,
  deleteCompetitionService,
};
