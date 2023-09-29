const {
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
} = require("../repository/TableTeams");
const { storeImage, removeImage } = require("../utilities/Images");

const allTeamsService = async () => {
  return global.tblTeams;
};

const teamByIdService = async (request) => {
  const { teamId } = request.body;
  const result = global.tblTeams.find((item) => item.teamId === teamId);
  return result || null;
};

const createTeamService = async (request, fastify) => {
  if (request.body.eventTypeId) {
    const validateEventId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (!validateEventId) {
      throw new Error("EventId is not valid");
    }
  }

  if (request.body.image && request.body.image.length) {
    request.body.image = await storeImage(request.body.image[0]);
  }

  const data = await insertTeamQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblTeams.push(data);
  return data;
};

const updateTeamService = async (request, fastify) => {
  const checkTeamId = global.tblTeams.find(
    (item) => item.teamId === request.body.teamId
  );

  if (!checkTeamId) {
    throw new Error("TeamId is not valid");
  }

  const body = {
    teamName: request.body.teamName || checkTeamId.teamName,
    teamShortName: request.body.teamShortName || checkTeamId.teamShortName,
    image: checkTeamId.image,
    country: request.body.country || checkTeamId.country,
    eventTypeId: request.body.eventTypeId || checkTeamId.eventTypeId,
    userId: request.userTokenInfo.WrUserId,
    teamId: request.body.teamId,
  };

  if (request.body.eventTypeId) {
    const validateEventId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (!validateEventId) {
      throw new Error("EventId is not valid");
    }
  }

  if (request.body.image && request.body.image.length) {
    await removeImage(body.image);
    request.body.image = await storeImage(request.body.image[0]);
  }

  await updateTeamQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblTeams.findIndex(
    (item) => item.teamId === request.body.teamId
  );

  global.tblTeams[index] = body;

  return body;
};

const saveTeamService = async (request, fastify) => {
  const { teamId } = request.body;

  if (teamId === "0") {
    return createTeamService(request, fastify);
  } else {
    return updateTeamService(request, fastify);
  }
};

const deleteTeamService = async (request, fastify) => {
  const { teamId } = request.body;

  for (const team of teamId) {
    //validate team
  }

  await deleteTeamQuery(teamId, fastify, request);

  global.tblTeams = global.tblTeams.filter(
    (item) => !teamId.includes(item.teamId)
  );

  return "Team(s) deleted successfully";
};

module.exports = {
  allTeamsService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
};
