const {
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
  getAllTeamsByPlayerIdQuery,
} = require("../repository/TablePlayer");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByPlayerIdQuery,
} = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { storeImage, removeImage } = require("../utilities/Images");

const allPlayerService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const _player = global.tblPlayers.filter((_p) => _p.isActive === isActive);
    return _player;
  } else {
    const _player = global.tblPlayers.filter((_p) => _p.isActive === true);
    return _player;
  }
};

const allPlayerTypeService = async () => {
  return global.tblPlayerTypes;
};

const allBowlingTypeService = async () => {
  return global.tblBowlingTypes;
};

const allPlayerByTeamService = async (request, fastify) => {
  const { teamId } = request.body;

  const validateTeamId = global.tblTeams.find((item) => item.teamId === teamId);
  if (!validateTeamId) {
    throw new Error("TeamId is not valid");
  }

  const result = await getAllPlayersByTeamIdQuery(teamId, fastify, request);

  return result;
};

const playerByIdService = async (request, fastify) => {
  const { playerId } = request.body;
  const result = global.tblPlayers.find((item) => item.playerId === playerId);

  if (!result) {
    return null;
  } else {
    const playersInTeams = await getAllTeamsByPlayerIdQuery(
      playerId,
      fastify,
      request
    );

    const data = {
      ...result,
      teams: playersInTeams,
    };

    return data;
  }
};

const insertPlayerService = async (request, fastify) => {
  if (request.body.eventTypeId) {
    const checkEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (!checkEventTypeId) {
      throw new Error("Event Type with this id not Found");
    }
  }

  if (request.body.playerTypeId) {
    const checkTeamId = global.tblPlayerTypes.find(
      (item) => item.playerTypeId === request.body.playerTypeId
    );
    if (!checkTeamId) {
      throw new Error("PlayerType with this id not Found");
    }
  }

  if (request.body.bowlingTypeId) {
    const checkTeamId = global.tblBowlingTypes.find(
      (item) => item.bowlingTypeId === request.body.bowlingTypeId
    );
    if (!checkTeamId) {
      throw new Error("Bowling Type with this id not Found");
    }
  }

  const validatePlayerName = global.tblPlayers.find(
    (item) =>
      item.playerName.toLowerCase() === request.body.playerName.toLowerCase()
  );

  if (validatePlayerName) {
    throw new Error("Player Name already exist");
  }

  if (request.body.image && request.body.image.length) {
    const data = await storeImage(request.body.image[0]);
    request.body.image = data;
  }

  const result = await insertPlayerQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  if (request.body.teamId) {
    const hashString = request.body.teamId;
    if (typeof hashString === "object") {
      // Split the string into an array using commas as the delimiter
      const jsonString = JSON.stringify(hashString);
      // Convert the string back to an array of values
      const hashArray = jsonString.split(",");
      // for (let team of request.body.teamId) {
      //   const checkTeamId = global.tblTeams.find((item) => item.teamId === team);
      //   if (!checkTeamId) {
      //     throw new Error("Team with this id not Found");
      //   }
      // }

      if (hashArray.length) {
        for (let i = 0; i < hashArray.length; i++) {
          if (hashArray[i]) {
            const teamID = hashArray[i].replace(/[\[\]"]/g, "");
            await insertTeamPlayerQuery(
              {
                teamId: teamID,
                refPlayerId: result.playerId,
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

  if (!result) {
    return null;
  } else {
    global.tblPlayers.push(result);
    const playersInTeams = await getAllTeamsByPlayerIdQuery(
      result.playerId,
      fastify,
      request
    );

    const data = {
      ...result,
      teams: playersInTeams,
    };
    return data;
  }
};

const updatePlayerService = async (request, fastify) => {
  const checkPlayerId = global.tblPlayers.find(
    (item) => item.playerId === request.body.playerId
  );
  if (!checkPlayerId) {
    throw new Error("Player with this id not Found");
  }

  const validatePlayerName = global.tblPlayers.find(
    (item) =>
      item.playerName.toLowerCase() === request.body.playerName.toLowerCase() &&
      item.playerId !== request.body.playerId
  );

  if (validatePlayerName) {
    throw new Error("Player Name already exist");
  }

  const body = {
    country: request.body.country || checkPlayerId.country,
    playerName: request.body.playerName || checkPlayerId.playerName,
    eventTypeId: checkPlayerId.eventTypeId,
    playerTypeId: checkPlayerId.playerTypeId,
    userId: request.userTokenInfo.WrUserId,
    image: checkPlayerId.image,
    bowlingStyle: request.body.bowlingTypeId || checkPlayerId.bowlingTypeId,
    isActive: checkPlayerId.isActive,
    isKipper: checkPlayerId.isKipper,
    isLeftHandedBatting: checkPlayerId.isLeftHandedBatting,
    isLeftArmFielding: checkPlayerId.isLeftArmFielding,
    displayName: request.body.displayName || checkPlayerId.displayName,
    batsmanAverage: request.body.batsmanAverage || checkPlayerId.batsmanAverage,
    batsmanStrikeRate:
      request.body.batsmanStrikeRate || checkPlayerId.batsmanStrikeRate,
    bowlerAverage: request.body.bowlerAverage || checkPlayerId.bowlerAverage,
    bowlerEconomy: request.body.bowlerEconomy || checkPlayerId.bowlerEconomy,
    playerId: request.body.playerId,
    playerType: checkPlayerId.playerType,
    eventType: checkPlayerId.eventType,
    bowlingTypeId: checkPlayerId.bowlingTypeId,
    bowlingStyle: checkPlayerId.bowlingTypeId,
  };

  if ("isActive" in request.body) {
    body.isActive = request.body.isActive;
  }

  if ("isKipper" in request.body) {
    body.isKipper = request.body.isKipper;
  }

  if ("isLeftHandedBatting" in request.body) {
    body.isLeftHandedBatting = request.body.isLeftHandedBatting;
  }

  if ("isLeftArmFielding" in request.body) {
    body.isLeftArmFielding = request.body.isLeftArmFielding;
  }

  if (request.body.eventTypeId) {
    const checkEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (!checkEventTypeId) {
      throw new Error("Event Type with this id not Found");
    } else {
      body.eventTypeId = request.body.eventTypeId;
      body.eventType = checkEventTypeId.eventType;
    }
  }

  if (request.body.playerTypeId) {
    const checkPlayerTypeId = global.tblPlayerTypes.find(
      (item) => item.playerTypeId === request.body.playerTypeId
    );
    if (!checkPlayerTypeId) {
      throw new Error("PlayerType with this id not Found");
    } else {
      body.playerTypeId = request.body.playerTypeId;
      body.playerType = checkPlayerTypeId.playerType;
    }
  }

  if (request.body.bowlingTypeId) {
    const checkBowlingTypeId = global.tblBowlingTypes.find(
      (item) => item.bowlingTypeId === request.body.bowlingTypeId
    );
    if (!checkBowlingTypeId) {
      throw new Error("Bowling Type with this id not Found");
    } else {
      body.bowlingTypeId = checkBowlingTypeId.bowlingTypeId;
      body.bowlingStyle = checkBowlingTypeId.bowlingType;
    }
  }

  if (request.body.image && request.body.image.length > 0) {
    if (body.image) {
      await removeImage(body.image);
    }
    const result = await storeImage(request.body.image[0]);
    body.image = result;
  }

  await updatePlayerQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblPlayers.findIndex(
    (item) => item.playerId === request.body.playerId
  );

  global.tblPlayers[index] = body;

  if (request.body.teamId) {
    await deleteTeamPlayerByPlayerIdQuery(
      request.body.playerId,
      fastify,
      request
    );
    const hashString = request.body.teamId;
    if (typeof hashString === "object") {
      // Split the string into an array using commas as the delimiter
      const jsonString = JSON.stringify(hashString);
      // Convert the string back to an array of values
      const hashArray = jsonString.split(",");
      if (hashArray.length) {
        for (let i = 0; i < hashArray.length; i++) {
          if (hashArray[i]) {
            const teamID = hashArray[i].replace(/[\[\]"]/g, "");
            await insertTeamPlayerQuery(
              {
                teamId: teamID,
                refPlayerId: request.body.playerId,
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

  const playersInTeams = await getAllTeamsByPlayerIdQuery(
    request.body.playerId,
    fastify,
    request
  );

  const data = {
    ...body,
    teams: playersInTeams,
  };
  return data;
  //return body;
};

const savePlayerService = async (request, fastify) => {
  const { playerId } = request.body;

  if (playerId === "0") {
    return await insertPlayerService(request, fastify);
  } else {
    return await updatePlayerService(request, fastify);
  }
};

const deletePlayerService = async (request, fastify) => {
  const { playerId } = request.body;

  await deletePlayerQuery(playerId, fastify, request);

  for (const id of playerId) {
    await deleteTeamPlayerByPlayerIdQuery(id, fastify, request);
  }

  global.tblPlayers = global.tblPlayers.filter(
    (item) => !playerId.includes(item.playerId)
  );

  return `Player(s)  deleted successfully`;
};

module.exports = {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
  allBowlingTypeService,
  allPlayerTypeService,
  allPlayerByTeamService,
};
