const { insertCommentaryQuery } = require("../repository/TableCommentary");

const allCommentaryService = async () => {
  return global.tblCommentaries;
};

const commentaryByIdService = async (request) => {
  const { commentaryId } = request.body;
  const result = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  return result || null;
};

const createCommentaryService = async (request, fastify) => {
  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    }
  }

  if (request.body.matchTypeId) {
    const validateMatchTypeId = global.tblMatchTypes.find(
      (item) => item.matchTypeId === request.body.matchTypeId
    );

    if (!validateMatchTypeId) {
      throw new Error("MatchType with this id not Found");
    }
  }

  if (request.body.team1Id === request.body.team2Id) {
    throw new Error("Team1 and Team2 can't be same");
  }

  if (request.body.team1Id) {
    const validateTeam1Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team1Id
    );

    if (!validateTeam1Id) {
      throw new Error("Team1 with this id not Found");
    }
  }

  if (request.body.team2Id) {
    const validateTeam2Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team2Id
    );

    if (!validateTeam2Id) {
      throw new Error("Team2 with this id not Found");
    }
  }

  if (
    request.body.homeSideTeam &&
    request.body.homeSideTeam !== request.body.team1Id &&
    request.body.homeSideTeam !== request.body.team2Id
  ) {
    throw new Error("HomeSideTeam must be Team1 or Team2");
  }

  if (
    request.body.tossWonBy &&
    request.body.tossWonBy !== request.body.team1Id &&
    request.body.tossWonBy !== request.body.team2Id
  ) {
    throw new Error("TossWonBy must be Team1 or Team2");
  }

  if (
    request.body.winnerId &&
    request.body.winnerId !== request.body.team1Id &&
    request.body.winnerId !== request.body.team2Id
  ) {
    throw new Error("WinnerId must be Team1 or Team2");
  }

  const result = await insertCommentaryQuery(request.body, fastify);

  global.tblCommentaries.push(result);

  return result;
};

const updateCommentaryService = async (request, fastify) => {
  const { id } = request.body;
  const checkId = global.tblConfigs.find((item) => item.id === id);

  if (!checkId) {
    throw new Error("Config with this id not Found");
  }

  const data = {
    id: request.body.id,
    key: request.body.key || checkId.key,
    value: request.body.value || checkId.value,
    desc: request.body.desc || checkId.desc,
  };

  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  await updateConfigQuery(data, fastify, request);

  const index = global.tblConfigs.findIndex((item) => item.id === id);

  global.tblConfigs[index] = data;

  return data;
};

const saveCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  if (commentaryId === "0") {
    return await createCommentaryService(request, fastify);
  } else {
    return await updateCommentaryService(request, fastify);
  }
};

module.exports = {
  allCommentaryService,
  commentaryByIdService,
  saveCommentaryService,
};
