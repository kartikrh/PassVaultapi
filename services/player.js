const {
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
  getAllTeamsByPlayerIdQuery,
  updatePlayerStatsQuery,
} = require("../repository/TablePlayer");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByPlayerIdQuery,
} = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const {
  storeImageOnServer,
  generateImageName,
  removeImageFromServer,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");

const allPlayerService = async (request,fastify) => {
  const { isActive, eventTypeId , teamId} = request.body;
  const body = {
    isActive: isActive === undefined ? true : isActive,
    eventTypeId: eventTypeId === undefined ? 0 : eventTypeId,
    teamId : teamId === undefined  ? null : teamId
  };
  let _player = [];
  if (body.eventTypeId !== 0) {
     _player = global.tblPlayers.filter(
      (_p) =>
        _p.isActive === body.isActive && _p.eventTypeId === body.eventTypeId
    );
  } else {
     _player = global.tblPlayers.filter(
      (_p) => _p.isActive === body.isActive
    );
  }

  if(teamId) {
    let players = await getAllPlayersByTeamIdQuery(teamId, fastify, request);
    players = players.map((item) => item.playerId);
    _player = _player.filter((item) => players.includes(item.playerId));
    return _player;
  }
  else {
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
    // generate image name
    const imgName = generateImageName({ name: request.body.playerName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const path = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Players,
    });
    request.body.image = path;
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
      if (hashArray.length) {
        for (let i = 0; i < hashArray.length; i++) {
          if (hashArray[i]) {
            const teamID = hashArray[i].replace(/[\[\]"]/g, "");
            if(teamID !== "") {
             await insertTeamPlayerQuery(
              {
                teamId: parseInt(teamID),
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
    isSystemPlayer: request.body.hasOwnProperty("isSystemPlayer") ? request.body.isSystemPlayer : checkPlayerId.isSystemPlayer,
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
    // generate image name
    const imgName = generateImageName({ name: request.body.playerName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const result = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Players,
    });
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
            if(teamID !== ""){
              await insertTeamPlayerQuery(
                {
                  teamId: parseInt(teamID),
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

  if (playerId === 0) {
    return await insertPlayerService(request, fastify);
  } else {
    return await updatePlayerService(request, fastify);
  }
};

const deletePlayerService = async (request, fastify) => {
  const { playerId } = request.body;

  for (const id of playerId) {
    await deleteTeamPlayerByPlayerIdQuery(id, fastify, request);
  }
  // delete images
  for (const id of playerId) {
    const player = global.tblPlayers.find((item) => item.playerId === id);
    if (player && player?.image) {
      await removeImageFromServer({
        path: player.image,
      });
    }
  }
  await deletePlayerQuery(playerId, fastify, request);
  global.tblPlayers = global.tblPlayers.filter(
    (item) => !playerId.includes(item.playerId)
  );

  return `Player(s)  deleted successfully`;
};

const updatePlayerStatsService = async (request, fastify) => {
  let UnsavePlayers = [];
  for (let i = 0; i < request.body.length; i++) {
    try {
      let UnsavePlayer = {};
      const checkPlayerId = global.tblPlayers.find(
        (item) => item.playerId === request.body[i].playerId
      );
      let isSaved = false;
      if (!checkPlayerId) {
        UnsavePlayer.message = "Player with this id not Found";
        UnsavePlayer.playerId = request.body[i].playerId;
        UnsavePlayers.push(UnsavePlayer);
      } else {
        isSaved = true;
      }
      if (isSaved) {
        const body = {
          batsmanAverage: parseFloat(request.body[i].batsmanAverage),
          batsmanStrikeRate: parseFloat(request.body[i].batsmanStrikeRate),
          bowlerAverage: parseFloat(request.body[i].bowlerAverage),
          bowlerEconomy: parseFloat(request.body[i].bowlerEconomy),
          playerId: request.body[i].playerId,
          userId: request.userTokenInfo.WrUserId,
        };

        await updatePlayerStatsQuery(body, fastify, request);

        const index = global.tblPlayers.findIndex(
          (item) => item.playerId === request.body[i].playerId
        );
        const _p = {
          country: checkPlayerId.country,
          playerName: checkPlayerId.playerName,
          eventTypeId: checkPlayerId.eventTypeId,
          playerTypeId: checkPlayerId.playerTypeId,
          image: checkPlayerId.image,
          bowlingStyle: checkPlayerId.bowlingTypeId,
          isActive: checkPlayerId.isActive,
          isKipper: checkPlayerId.isKipper,
          isLeftHandedBatting: checkPlayerId.isLeftHandedBatting,
          isLeftArmFielding: checkPlayerId.isLeftArmFielding,
          displayName: checkPlayerId.displayName,
          batsmanAverage: parseFloat(request.body[i].batsmanAverage),
          batsmanStrikeRate: parseFloat(request.body[i].batsmanStrikeRate),
          bowlerAverage: parseFloat(request.body[i].bowlerAverage),
          bowlerEconomy: parseFloat(request.body[i].bowlerEconomy),
          playerId: request.body[i].playerId,
          playerType: checkPlayerId.playerType,
          eventType: checkPlayerId.eventType,
          bowlingTypeId: checkPlayerId.bowlingTypeId,
          bowlingStyle: checkPlayerId.bowlingTypeId,
        };
        global.tblPlayers[index] = _p;
      }
    } catch (e) {
      let UnsavePlayer = {};
      UnsavePlayer.message = e.message;
      UnsavePlayer.playerId = request.body[i].playerId;
      UnsavePlayers.push(UnsavePlayer);
    }
  }
  return UnsavePlayers;
};

module.exports = {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
  allBowlingTypeService,
  allPlayerTypeService,
  allPlayerByTeamService,
  updatePlayerStatsService,
};
