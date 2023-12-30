const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
} = require("../repository/TableTeamPlayer");
const {
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
  getAllPlayersByTeamIdQuery,
} = require("../repository/TableTeams");
const { storeImage, removeImage } = require("../utilities/Images");

const allTeamsService = async () => {
  return global.tblTeams;
};

const teamByIdService = async (request, fastify) => {
  const { teamId } = request.body;
  const result = global.tblTeams.find((item) => item.teamId === teamId);

  if (!result) {
    return null;
  } else {
    const playersInTeams = await getAllPlayersByTeamIdQuery(
      teamId,
      fastify,
      request
    );

    result.players = playersInTeams;

    return result;
  }
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

  const validateTeamName = global.tblTeams.find(
    (item) =>
      item.teamName.toLowerCase() === request.body.teamName.toLowerCase()
  );

  if (validateTeamName) {
    throw new Error("TeamName already exist");
  }

  if (request.body.image && request.body.image.length) {
    request.body.image = await storeImage(request.body.image[0]);
  }

  if (request.body.jersey && request.body.jersey.length) {
    request.body.jersey = await storeImage(request.body.jersey[0]);
  }

  const data = await insertTeamQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  if (request.body.playerId) {
    const hashString = request.body.playerId;
    if (typeof hashString === "object") {
      // Split the string into an array using commas as the delimiter
      const jsonString = JSON.stringify(hashString);
      // Convert the string back to an array of values
      const hashArray = jsonString.split(",");
      if (hashArray.length) {
        for (let i = 0; i < hashArray.length; i++) {
          if (hashArray[i]) {
            const playerID = hashArray[i].replace(/[\[\]"]/g, "");
            await insertTeamPlayerQuery(
              {
                teamId: data.teamId,
                refPlayerId: playerID,
                userId: request.userTokenInfo.WrUserId,
              },
              fastify,
              request
            );
          }
        }
      }
    }
  }

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
    jersey: checkTeamId.jersey,
    country: request.body.country || checkTeamId.country,
    eventTypeId: request.body.eventTypeId || checkTeamId.eventTypeId,
    userId: request.userTokenInfo.WrUserId,
    teamId: request.body.teamId,
  };

  const validateTeamName = global.tblTeams.find(
    (item) =>
      item.teamName.toLowerCase() === body.teamName.toLowerCase() &&
      item.teamId !== request.body.teamId
  );

  if (validateTeamName) {
    throw new Error("TeamName already exist");
  }

  if (request.body.eventTypeId) {
    const validateEventId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (!validateEventId) {
      throw new Error("EventId is not valid");
    }
  }

  if (request.body.image && request.body.image.length) {
    if (body.image) {
      await removeImage(body.image);
    }
    body.image = await storeImage(request.body.image[0]);
  }

  if (request.body.jersey && request.body.jersey.length) {
    if (body.jersey) {
      await removeImage(body.jersey);
    }
    body.jersey = await storeImage(request.body.jersey[0]);
  }

  await updateTeamQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblTeams.findIndex(
    (item) => item.teamId === request.body.teamId
  );

  global.tblTeams[index] = body;

  if (request.body.playerId) {
    await deleteTeamPlayerByTeamIdQuery(body.teamId, fastify, request);

    const hashString = request.body.playerId;
    // Split the string into an array using commas as the delimiter
    const jsonString = JSON.stringify(hashString);
    // Convert the string back to an array of values
    const hashArray = jsonString.split(",");
    if (hashArray.length) {
      for (let i = 0; i < hashArray.length; i++) {
        if (hashArray[i]) {
          const playerID = hashArray[i].replace(/[\[\]"]/g, "");
          await insertTeamPlayerQuery(
            {
              teamId: body.teamId,
              refPlayerId: playerID,
              userId: request.userTokenInfo.WrUserId,
            },
            fastify,
            request
          );
        }
      }
    }
  }

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

  await deleteTeamQuery(teamId, fastify, request);
  for (const team of teamId) {
    await deleteTeamPlayerByTeamIdQuery(team, fastify, request);
  }

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
