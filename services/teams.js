const { deleteTeamCompetitionByTeamIdQuery, insertTeamCompetitionQuery } = require("../repository/TableTeamCompetition");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
} = require("../repository/TableTeamPlayer");
const {
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
  getAllPlayersByTeamIdQuery,
  getAllCompetitionByTeamIdQuery,
} = require("../repository/TableTeams");
const {
  removeImageFromServer,
  storeImageOnServer,
  generateImageName,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const allTeamsService = async () => {
  return global.tblTeams;
};

const allteamByEventTypeIdService = async (request, fastify) => {
  const { eventTypeId, competitionId } = request.body;
  let result = global.tblTeams;

  if(eventTypeId != undefined && eventTypeId != 0) {
    result = result.filter((item) => item.eventTypeId === eventTypeId);
  } 

  if(competitionId != undefined && competitionId != 0) {
    const competitionResult = global.tblTeamCompetition.filter(
      (item) => item.refCompetitionId === competitionId
    );
    const competitionTeamIds = new Set(competitionResult.map(item => item.teamId));
    result = result.filter(
      (item) => competitionTeamIds.has(item.teamId)
    );
  }

  return result;



  // if (eventTypeId === undefined) {
  //   return global.tblTeams;
  // } else if (eventTypeId == 0) {
  //   return global.tblTeams;
  // } else if (eventTypeId) {
  //   result = global.tblTeams.filter(
  //     (item) => item.eventTypeId === eventTypeId
  //   );
  //   if (competitionId == undefined) {
  //     return result
  //   } else if (competitionId == 0) {
  //     return result
  //   } else if (competitionId) {
  //     // const competitionResult = global.tblTeamCompetition.filter(
  //     //   (item) => item.refCompetitionId === competitionId
  //     // ); 
  //     // const competitionTeamIds = new Set(competitionResult.map(item => item.teamId));

  //     // const finalResult = result.filter(
  //     //   (item) => competitionTeamIds.includes(item.teamId)
  //     // );

  //     // return finalResult;
  //     return result
  //   }
  //   // return result;
  // }
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
    const competitionInTeams = await getAllCompetitionByTeamIdQuery(
      teamId,
      fastify,
      request
    );

    result.competition = competitionInTeams;
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

  let imgName, projectName;
  projectName = global.tblConfigs.find(
    (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
  ).value;
  if (request.body.image && request.body.image.length) {
    // generate image name
    imgName = generateImageName({
      name: request.body.teamName,
    });

    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Teams,
    });
    request.body.image = path;
  }

  if (request.body.jersey && request.body.jersey.length) {
    const path = await storeImageOnServer({
      image: request.body.jersey[0],
      project: projectName,
      name: `${imgName}-jersey`,
      ...ImgModuleConfig.Teams,
    });
    request.body.jersey = path;
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
            if (playerID !== "") {
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
  }
  if (request.body.competitionId) {
    const hashString = request.body.competitionId;
    if (typeof hashString === "object") {
      // Split the string into an array using commas as the delimiter
      const jsonString = JSON.stringify(hashString);
      // Convert the string back to an array of values
      const hashArray = jsonString.split(",");
      if (hashArray.length) {
        for (let i = 0; i < hashArray.length; i++) {
          if (hashArray[i]) {
            const competitionId = hashArray[i].replace(/[\[\]"]/g, "");
            if (competitionId !== "") {
              let res = await insertTeamCompetitionQuery(
                {
                  teamId: data.teamId,
                  refCompetitionId: parseInt(competitionId),
                  userId: request.userTokenInfo.WrUserId,
                },
                fastify,
                request
              );
              global.tblTeamCompetition.push(res);
            }
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

  const _getEventType = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!checkTeamId.teamColor) {
    checkTeamId.teamColor = "#FFFFFF";
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
    eventType: _getEventType.eventType,
    teamColor: request.body.teamColor || checkTeamId.teamColor,
    backgroundColor: request.body.backgroundColor || checkTeamId.backgroundColor,
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

  let imgName, projectName;
  projectName = global.tblConfigs.find(
    (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
  ).value;
  if (request.body.image && request.body.image.length) {
    // generate image name
    imgName = generateImageName({
      name: request.body.teamName,
    });

    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Teams,
    });
    body.image = path;
  }

  if (request.body.jersey && request.body.jersey.length) {

    // generate image name
    imgName = generateImageName({
      name: request.body.teamName,
    });
    
    body.jersey = await storeImageOnServer({
      image: request.body.jersey[0],
      project: projectName,
      name: `${imgName}-jersey`,
      ...ImgModuleConfig.Teams,
    });
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
          if (playerID !== "") {
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
  }
  if (request.body.competitionId) {
    await deleteTeamCompetitionByTeamIdQuery(body.teamId, fastify, request);
    global.tblTeamCompetition = global.tblTeamCompetition.filter(
      (item) => item.teamId !== body.teamId
    );

    const hashString = request.body.competitionId;
    // Split the string into an array using commas as the delimiter
    const jsonString = JSON.stringify(hashString);
    // Convert the string back to an array of values
    const hashArray = jsonString.split(",");
    if (hashArray.length) {
      for (let i = 0; i < hashArray.length; i++) {
        if (hashArray[i]) {
          const competitionId = hashArray[i].replace(/[\[\]"]/g, "");
          if (competitionId !== "") {
            let res =await insertTeamCompetitionQuery(
              {
                teamId: body.teamId,
                refCompetitionId: competitionId,
                userId: request.userTokenInfo.WrUserId,
              },
              fastify,
              request
            );
            global.tblTeamCompetition.push(res);
          }
        }
      }
    }
  }

  return body;
};

const saveTeamService = async (request, fastify) => {
  const { teamId } = request.body;

  if (teamId === 0) {
    return createTeamService(request, fastify);
  } else {
    return updateTeamService(request, fastify);
  }
};

const deleteTeamService = async (request, fastify) => {
  const { teamId } = request.body;

  // delete images
  for (id of teamId) {
    const team = global.tblTeams.find((item) => item.teamId === id);
    // if (team && (team.image || team.jersey)) {
    //   await removeImageFromServer({ path: team.image });
    //   await removeImageFromServer({ path: team.jersey });
    // }
    if(team && team.image) {
      await removeImageFromServer({ path: team.image });
    }
    if(team && team.jersey) {
      await removeImageFromServer({ path: team.jersey });
    }
  }
  await deleteTeamQuery(teamId, fastify, request);

  for (const team of teamId) {
    await deleteTeamPlayerByTeamIdQuery(team, fastify, request);
    await deleteTeamCompetitionByTeamIdQuery(team, fastify, request);
  }

  global.tblTeams = global.tblTeams.filter(
    (item) => !teamId.includes(item.teamId)
  );
  global.tblTeamCompetition = global.tblTeamCompetition.filter(
    (item) => !teamId.includes(item.teamId)
  );

  return "Team(s) deleted successfully";
};

module.exports = {
  allTeamsService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
  allteamByEventTypeIdService,
};
