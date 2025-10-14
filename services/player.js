const {
  insertPlayerQuery,
  updatePlayerQuery,
  deletePlayerQuery,
  getAllTeamsByPlayerIdQuery,
  updatePlayerStatsQuery,
  updateIsSystemPlayerQuery,
  getTeamPlayerQuery,
  activeInactivePlayerQuery,
  updateExchangePlayerQuery,
} = require("../repository/TablePlayer");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByPlayerIdQuery,
  getTeamPlayerByPlayerIdQuery,
  getTeamListByPlayerIdQuery,
  updateTeamPlayerHomeTeamQuery,
} = require("../repository/TableTeamPlayer");
const { getAllPlayersByTeamIdQuery, getAllPlayersByCompetitionIdTeamIdQuery } = require("../repository/TableTeams");
const {
  storeImageOnServer,
  generateImageName,
  removeImageFromServer,
  getImageFromUrl,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { deleteTournamentPlayersByPlayerIdQuery } = require("../repository/TableTournamentsTeamPlayers");
const { deleteAwardsByPlayerIdQuery } = require("../repository/TableCommentaryAward");
const { bowlingStyleChangeOnCommPlayersQuery } = require("../repository/TableCommentary");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const configConstants = require("../utilities/configConstants");
const { trimTextData, callEntitySportAPI, ServiceType, APIEndpointModuleType, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, RefType, EventType, checkEntitySportAPIEndpointIsActive } = require("../utilities/index");
const { getAutoImportDataByIdQuery, insertAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { updateAutoImportDataService } = require("./autoImportData");
const { errorLogger } = require("../utilities/logger");

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
    // return _player;
  }
  // else {
  //   return _player;
  // }
  const updatedPlayers = _player.map((item) => {
    const country = global.tblCountryCodes.find(elem => elem.id === item.countryId);
    return {
      ...item,
      countryName: country?.countryName ?? null
    };
  });

  return updatedPlayers;
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

const allPlayerByCompetitionAndTeamService = async (request, fastify) => {
  const { competitionId, teamId } = request.body;

  const validateTeamId = global.tblTeams.find((item) => item.teamId === teamId);
  if (!validateTeamId) {
    throw new Error("TeamId is not valid");
  }

  let tournamentTeamPlayers = global.tblTournamentTeamPlayers.filter((elem) => 
  elem.competitionId == competitionId && elem.teamId == teamId
  );

  if(tournamentTeamPlayers.length > 0) {
    const playersData = Object.values(
      tournamentTeamPlayers.reduce((acc, player) => {
        acc[player.playerId] = player;
        return acc;
      }, {})
    );
    return playersData.map(player => ({
      playerId: player.playerId,
      playerName: player.playerName,
      playerTypeId: player.playerTypeId,
      playerType: player.playerType,
    }));
    // return tournamentTeamPlayers.map((player) => ({
    //   playerId: player.playerId,
    //   playerName: player.playerName,
    //   playerTypeId: player.playerTypeId,
    //   playerType: player.playerType,
    // }));
  }
  
  const result = await getAllPlayersByCompetitionIdTeamIdQuery(teamId, fastify, request);

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

  const trimData = await trimTextData({
    playerName: request.body.playerName,
    displayName: request.body.displayName,
  }, request, fastify);
  if(trimData) {
    Object.assign(request.body, trimData);
  }

  const validatePlayerName = global.tblPlayers.find(
    (item) =>
      item.playerName.trim().toLowerCase() === request.body.playerName.trim().toLowerCase()
  );

  if (validatePlayerName) {
    throw new Error("Player Name already exist");
  }
  const validateTpId = global.tblPlayers.find(
    (item) =>
      item.tpId == request.body?.tpId && item.tpId != null
  );

  if (validateTpId) {
    throw new Error("TpId already exist");
  }
  // request.body.playerName = request.body.playerName.trim();
  if (request.body.image && request.body.image.length) {
    // generate image name
    const imgName = generateImageName({ name: request.body.playerName });
    const projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Players,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath
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
             const teamPlayerData = await insertTeamPlayerQuery(
              {
                teamId: parseInt(teamID),
                refPlayerId: result.playerId,
                tpId: result?.tpId ?? null,
                userId: request.userTokenInfo.WrUserId,
              },
              fastify,
              request
            );
            const teamData = global.tblTeams.find((item) => item.teamId == teamID);
            if(request.body.image && teamData.jersey) {
              mergeAndSaveImage({
                playerImage: request.body.image,
                jersey: teamData.jersey,
                playerName: request.body.playerName,
                teamName: teamData.teamName,
                teamPlayerId: teamPlayerData.teamPlayerId,
                commentaryPlayerId: null,
                commentaryId: null,
              }, fastify);
            }
            }
          }
        }
      }
    }
  }

  if(request.body?.homeTeamId !== null && request.body?.homeTeamId !== undefined) {
    await updateTeamPlayerHomeTeamQuery(
      {
        refPlayerId: result?.playerId,
        teamId: parseInt(request.body.homeTeamId),
      },
      fastify,
      request
    );
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
  const trimData = await trimTextData({
    playerName: request.body?.playerName,
    displayName: request.body?.displayName,
  }, request, fastify);
  if(trimData) {
    Object.assign(request.body, trimData);
  }
  const validatePlayerName = global.tblPlayers.find(
    (item) =>
      item.playerName.trim().toLowerCase() === request.body.playerName.trim().toLowerCase() &&
      item.playerId !== request.body.playerId
  );

  if (validatePlayerName) {
    throw new Error("Player Name already exist");
  }
  if(checkPlayerId) {
    const validateTpId = global.tblPlayers.find(
      (item) =>
        item.tpId == request.body?.tpId && item.playerId != request.body.playerId &&
        item.tpId != null
    );
  
    if (validateTpId) {
      throw new Error("TpId already exist");
    }
  }
  const body = {
    // country: request.body.country || checkPlayerId.country,
    playerName: request.body.playerName.trim() || checkPlayerId.playerName,
    eventTypeId: checkPlayerId.eventTypeId,
    playerTypeId: checkPlayerId.playerTypeId,
    userId: request.userTokenInfo.WrUserId,
    image: checkPlayerId.image,
    bowlingStyleId: request.body.bowlingStyleId || checkPlayerId.bowlingStyleId,
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
    isSystemPlayer: request.body.hasOwnProperty("isSystemPlayer") ? request.body.isSystemPlayer : checkPlayerId.isSystemPlayer,
    imagePath : checkPlayerId.imagePath,
    // tpId: request.body.tpId || checkPlayerId.tpId,
    tpId: request.body.tpId === undefined ? checkPlayerId.tpId
      : [0, '', 'null'].includes(request.body.tpId) ? null
      : request.body.tpId,
    countryId: request.body.countryId || checkPlayerId.countryId,
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
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Players,
    });
    body.image = fullPath;
    body.imagePath = imagePath;
  }

  await updatePlayerQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblPlayers.findIndex(
    (item) => item.playerId === request.body.playerId
  );

  global.tblPlayers[index] = body;

  if (request.body.teamId) {
    const teamPlayersData = await getTeamPlayerByPlayerIdQuery(request.body.playerId, fastify, request);
    for (const playerData of teamPlayersData) {
      if (playerData && playerData?.jerseyPlayerImage) {
        await removeImageFromServer({
          path: playerData.jerseyPlayerImage,
        });
      }
    }
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
              const playerTpId = global.tblPlayers.find(elem => elem.playerId == request.body.playerId);
              const teamPlayerData = await insertTeamPlayerQuery(
                {
                  teamId: parseInt(teamID),
                  refPlayerId: request.body.playerId,
                  userId: request.userTokenInfo.WrUserId,
                  tpId: playerTpId?.tpId ?? null
                },
                fastify,
                request
              );
              const teamData = global.tblTeams.find((item) => item.teamId == teamID);
              if(body.image && teamData.jersey) {
                mergeAndSaveImage({
                  playerImage: body.image,
                  jersey: teamData.jersey,
                  playerName: body.playerName,
                  teamName: teamData.teamName,
                  teamPlayerId: teamPlayerData.teamPlayerId,
                  commentaryPlayerId: null,
                  commentaryId: null,
                }, fastify);
              }
            }
          }
        }
      }
    }
  }
  if(request.body?.homeTeamId !== null && request.body?.homeTeamId !== undefined) {
    await updateTeamPlayerHomeTeamQuery(
      {
        refPlayerId: parseInt(request.body.playerId),
        teamId: parseInt(request.body.homeTeamId),
      },
      fastify,
      request
    );
  }
  const openCommentaryIds = global.tblCommentaries.filter(item => item.commentaryStatus == 1)
    .map(item => item.commentaryId);

  if(checkPlayerId?.bowlingTypeId != body?.bowlingTypeId && openCommentaryIds.length > 0) {
    await bowlingStyleChangeOnCommPlayersQuery(
      {
        bowlingType: body.bowlingTypeId,
        commentaryId: openCommentaryIds,
        playerId: body.playerId,
      },
      fastify, 
      request
    );
    const updateData = global.tblCommentaryPlayers.filter(
      item =>
        openCommentaryIds.includes(item.commentaryId) &&
        item.playerId === body.playerId
    );
    for (const elem of updateData) {
      const index = global.tblCommentaryPlayers.findIndex(item => 
        item.commentaryPlayerId == elem.commentaryPlayerId
      );
      if(index !== -1) {
        global.tblCommentaryPlayers[index].bowlingType = body.bowlingTypeId
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

const updateIsSystemPlayerService = async (request, fastify) => {
  // vlaidate player id
  const index = global.tblPlayers.findIndex(
    (item) => item.playerId === request.body.playerId
  );
  if (index === -1) {
    throw new Error("Player with this id not Found");
  }
  await updateIsSystemPlayerQuery(request.body, fastify, request);
  global.tblPlayers[index].isSystemPlayer = request.body.isSystemPlayer;
  return 'Player updated successfully';
};
const deletePlayerService = async (request, fastify) => {
  const { playerId } = request.body;

  for (const id of playerId) {
  const teamPlayersData = await getTeamPlayerByPlayerIdQuery(id, fastify, request);
    for (const playerData of teamPlayersData) {
      if (playerData && playerData?.jerseyPlayerImage) {
        await removeImageFromServer({
          path: playerData.jerseyPlayerImage,
        });
      }
    }
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
  await deleteTournamentPlayersByPlayerIdQuery(playerId, request, fastify);
  await deleteAwardsByPlayerIdQuery(playerId, request, fastify);
  await deletePlayerQuery(playerId, fastify, request);
  global.tblPlayers = global.tblPlayers.filter(
    (item) => !playerId.includes(item.playerId)
  );
  global.tblCommentaryAwards = global.tblCommentaryAwards.filter((item) => !playerId.includes(item.playerId));
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
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
          // country: checkPlayerId.country,
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
          imagePath: checkPlayerId.imagePath,
          tpId: checkPlayerId.tpId,
          countryId: checkPlayerId.countryId,
          isSystemPlayer: checkPlayerId.isSystemPlayer,
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

const mergePlayerImageAndJerseyService = async (request, fastify) => {
  for(const player of request.body.playerId){
    const checkPlayerId = global.tblPlayers.find(
      (item) => item.playerId === player
    );
    if (!checkPlayerId) {
      continue;
    }
    const teamPlayersData = await getTeamPlayerByPlayerIdQuery(player, fastify, request);
    if (teamPlayersData.length > 0) {
      for (const playerData of teamPlayersData) {
        const teamData = global.tblTeams.find((item) => item.teamId == playerData.teamId);
        if(checkPlayerId?.image && teamData?.jersey) {
          mergeAndSaveImage({
            playerImage: checkPlayerId.image,
            jersey: teamData.jersey,
            playerName: checkPlayerId.playerName,
            teamName: teamData.teamName,
            teamPlayerId: playerData.teamPlayerId,
            commentaryPlayerId: null,
            commentaryId: null,
          }, fastify);
        }
      }
    }
  }
  return "Player image(s) and Jersey image(s) merged successfully";
};
const setTeamPlayerImgService = async (request, fastify) => {
  const teamPlayersData = await getTeamPlayerQuery(request, fastify);
  if(teamPlayersData.length == 0){
    return "Player Jersey images already set";
  }
  // check if any player image or jersey image is null
  let notImg = teamPlayersData.find((item) => !item.playerImage || !item.teamJersey);
  let defaultImg,defaultJersey;
  if(notImg){
    // get default image from config
    defaultImg = global.tblConfigs.find((item) => item.key.toLowerCase() == configConstants.DEFAULTPLAYERIMG.toLowerCase())?.value;
    defaultJersey = global.tblConfigs.find((item) => item.key.toLowerCase() == configConstants.DEFAULTJERSEYIMG.toLowerCase())?.value;
    if(!defaultImg || !defaultJersey){
      throw new Error("Please set Default Player Image and Jersey Image in Config");
    }
  }
  //merge the image where image is not set
  for (let p of teamPlayersData) {
    // merge image
     await mergeAndSaveImage({
      playerImage: p.playerImage ? p.playerImage : defaultImg,
      jersey: p.teamJersey ? p.teamJersey : defaultJersey,
      playerName: p.playerName,
      teamName: p.teamName,
      teamPlayerId: p.teamPlayerId,
      commentaryPlayerId: null,
      commentaryId: null,
    }, fastify);

  }
  return "Player image(s) and Jersey image(s) merged successfully";
};

const getTeamListPlayerIdService = async (request, fastify) => {
  const { playerId } = request.body;
  const result = await getTeamListByPlayerIdQuery(playerId, fastify, request);
  return result;
};

const activeInactivePlayerService = async (request, fastify) => {
  const { playerId, isActive } = request.body;
  const index = global.tblPlayers.findIndex(
    (item) => item.playerId === playerId
  );
  if (index === -1) {
    throw new Error("Player with this id not Found");
  }
  await activeInactivePlayerQuery({playerId, isActive}, request, fastify);
  global.tblPlayers[index].isActive = isActive;

  return `Player data updated successfully`;
};

const UpdatePlayerFromEntityService = async (request, fastify) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getPlayerDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    throw new Error(checkEntitySportAPIEndpoint.message);
  }

  const { playerIds } = request.body;

  const playerData = global.tblPlayers.filter(
    (item) => playerIds.includes(item.playerId) && item.tpId !== null
  );

  let updateCount = 0;

  for (const entry of playerData) {
    try {
      const whereCondition = `"wrRefId" = ${entry.tpId} AND "wrRefType" = ${RefType.Player} AND "wrSourceId" = 3 AND "wrIsImported" = true`;
      const validateCompImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
      if (!validateCompImportData) {
        const insertAutoImportBody = {
          refId: entry.tpId,
          refType: RefType.Player,
          sourceId: 3
        }
        const insertAutoImportData = await insertAutoImportDataQuery({
          ...insertAutoImportBody,
          isImportStart: true,
          importStartTime: new Date()
        }, fastify, request);

        const url = checkEntitySportAPIEndpoint.data.replace("{pid}", entry.tpId);
        const entitySportPlayer = await callEntitySportAPI(url, request, fastify);

        const entitySportPlayerResponse = entitySportPlayer?.data?.result?.player;
        if (!entitySportPlayerResponse) {
          throw new Error("Invalid response from Entit-Sport API");
        }

        const { playerTypeId, playerName, displayName, isKipper, isLeftHandedBatting, isLeftArmFielding, bowlingStyleId, bowlingTypeId } = entry;
        const { playing_role, title, short_name, batting_style, bowling_style, bowling_type } = entitySportPlayerResponse;

        let changedValues = { ...entry };

        const entityPlayerTypeId = EntityPlayerType[playing_role];
        if (entityPlayerTypeId && playerTypeId !== entityPlayerTypeId) {
          changedValues.playerTypeId = entityPlayerTypeId;
        }
        if (title && playerName !== title) {
          changedValues.playerName = title;
        }
        if (short_name && displayName !== short_name) {
          changedValues.displayName = short_name;
        }
        const entityIsKeeper = playing_role === "wk";
        if ("isKipper" in entry && isKipper !== entityIsKeeper) {
          changedValues.isKipper = entityIsKeeper;
        }
        const entityBattingStyle = batting_style?.includes("Right");
        if ("isLeftHandedBatting" in entry && isLeftHandedBatting !== entityBattingStyle) {
          changedValues.isLeftHandedBatting = entityBattingStyle;
        }
        const entityBowlingStyle = bowling_style?.includes("Right");
        if ("isLeftArmFielding" in entry && isLeftArmFielding !== entityBowlingStyle) {
          changedValues.isLeftArmFielding = entityBowlingStyle;
        }
        const EntityBowlingStyleTypeId = EntityBowlingStyleType[bowling_type?.toLowerCase()];
        if (EntityBowlingStyleTypeId && bowlingStyleId !== EntityBowlingStyleTypeId) {
          changedValues.bowlingStyleId = EntityBowlingStyleTypeId;
        }
        const entityBowlingStyleId = extractBowlingStyle(bowling_type, bowling_style);
        if (entityBowlingStyleId && bowlingTypeId !== entityBowlingStyleId) {
          changedValues.bowlingTypeId = entityBowlingStyleId;
        }

        const isChanged = (
          changedValues.playerTypeId !== playerTypeId ||
          changedValues.playerName !== playerName ||
          changedValues.displayName !== displayName ||
          changedValues.isKipper !== isKipper ||
          changedValues.isLeftHandedBatting !== isLeftHandedBatting ||
          changedValues.isLeftArmFielding !== isLeftArmFielding ||
          changedValues.bowlingStyleId !== bowlingStyleId ||
          changedValues.bowlingTypeId !== bowlingTypeId
        );

        if (isChanged) {
          changedValues.userId = request.userTokenInfo.WrUserId;
          try {
            const updatePlayerData = await updatePlayerQuery(changedValues, fastify, request);
            delete changedValues.userId;
            const index = global.tblPlayers.findIndex(
              (item) => item.playerId === entry.playerId
            );
            if (index !== -1) {
              global.tblPlayers[index] = updatePlayerData[0];
            }
            updateCount++;
          } catch (err) {
            throw new Error(`Failed to update player: ${err.message}`);
          }
        }

        await updateAutoImportDataService({
          ...request,
          body: {
            ...insertAutoImportBody,
            isImported: false,
            importEndTime: new Date(),
            id: insertAutoImportData.id
          }
        }, fastify);
      }
    } catch (err) {
      errorLogger(fastify, `Failed to fetch or process player id: ${entry.playerId} data: ${err.message}`, "/services/teams.js/UpdateTeamFromEntityService", request);
      continue;
    }
  }

  if (updateCount > 0) {
    return `Player data updated successfully`;
  }

  return "No update found in player data";
};

const playerImportService = async (data, fastify, request = null) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getPlayerDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    throw new Error(checkEntitySportAPIEndpoint.message);
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{pid}", data.pid);
  const entitySportPlayer = await callEntitySportAPI(url, request, fastify);

  let entitySportPlayerResponse = entitySportPlayer?.data?.result?.player;
  if (!entitySportPlayerResponse) {
    throw new Error("Invalid response from Entit-Sport API");
  }

  let checkPlayer = global.tblPlayers.find(item => item.tpId == entitySportPlayerResponse?.pid);
  if (!checkPlayer) {
    checkPlayer = global.tblPlayers.find((item) => item.tpId == null
      && item.playerName.toLowerCase() === entitySportPlayerResponse?.title.replace(/'/g, "''").toLowerCase() &&
      item.displayName.trim().replace(/'/g, "''").toLowerCase() == entitySportPlayerResponse?.short_name.toLowerCase())
    if (!checkPlayer) {
      // let imageUrl = entitySportPlayerResponse?.logo_url;
      // if (!imageUrl) {
      let imageUrl = {
        fullPath: global.tblEntitySockets[0]?.defaultPlayerImage || null,
        imagePath: global.tblEntitySockets[0]?.defaultPlayerImagePath || null
      };
      // } else {
      //   const getImageDataFromUrl = await getImageFromUrl({
      //     type: ImgModuleConfig.Players.type,
      //     imageUrl
      //   });

      //   if (getImageDataFromUrl && getImageDataFromUrl.fullPath) {
      //     imageUrl = getImageDataFromUrl
      //   }
      // }

      let insertPlayerData = {
        eventTypeId: EventType['Cricket'],
        playerTypeId: EntityPlayerType[entitySportPlayerResponse?.playing_role],
        playerName: entitySportPlayerResponse?.title,
        displayName: entitySportPlayerResponse?.short_name,
        country: entitySportPlayerResponse?.nationality,
        isActive: true,
        isKipper: entitySportPlayerResponse?.playing_role === 'wk' ? true : false,
        isLeftHandedBatting: !entitySportPlayerResponse.batting_style.includes('Right'),
        isLeftArmFielding: !entitySportPlayerResponse.bowling_style.includes('Right'),
        userId: -3,
        batsmanAverage: 0.0,
        batsmanStrikeRate: 0.0,
        bowlerAverage: 0.0,
        bowlerEconomy: 0.0,
        tpId: entitySportPlayerResponse?.pid || null,
        bowlingStyleId: entitySportPlayerResponse.bowling_type ? EntityBowlingStyleType[entitySportPlayerResponse.bowling_type.toLowerCase()] : null,
        bowlingTypeId: extractBowlingStyle(entitySportPlayerResponse.bowling_type, entitySportPlayerResponse.bowling_style),
        image: imageUrl.fullPath,
        imagePath: imageUrl.imagePath,
      };
      const insertPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
      console.log("🚀 ~ playerImportService ~ insertPlayer:", insertPlayer)
      errorLogger(fastify, `playerImportService called for pid: ${data.pid}`, "/services/player.js/playerImportService", {
        ...request,
        body: {
          tblEntitySockets: global.tblEntitySockets[0],
          insertPlayerData: insertPlayerData,
          afterinsertPlayer: insertPlayer
        }
      });
      global.tblPlayers.push(insertPlayer);
      checkPlayer = insertPlayer;
    }
    else if (checkPlayer?.tpId === null || !checkPlayer?.tpId) {
      const data = {
        userId: -3,
        tpId: entitySportPlayerResponse?.pid || null,
        playerId: checkPlayer.playerId,
      };
      const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
      console.log("updatePlayer", updatePlayer)
      let index = global.tblPlayers.findIndex((i) => i.playerId == checkPlayer.playerId)
      if (index != -1) {
        global.tblPlayers[index] = updatePlayer
      }
      checkPlayer = updatePlayer
    }
  }
  // else if (checkPlayer?.tpId === null || !checkPlayer?.tpId) {
  //   const data = {
  //     userId: -2,
  //     tpId: entitySportPlayerResponse?.pid || null,
  //     playerId: checkPlayer.playerId,
  //   };
  //   const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
  //   let index = global.tblPlayers.findIndex((i)=>i.playerId == checkPlayer.playerId)
  //   if(index != -1){
  //     global.tblPlayers[index] = updatePlayer
  //   }
  // }
  return checkPlayer;
}

module.exports = {
  allPlayerService,
  playerByIdService,
  savePlayerService,
  deletePlayerService,
  allBowlingTypeService,
  allPlayerTypeService,
  allPlayerByTeamService,
  updatePlayerStatsService,
  updateIsSystemPlayerService,
  allPlayerByCompetitionAndTeamService,
  mergePlayerImageAndJerseyService,
  setTeamPlayerImgService,
  getTeamListPlayerIdService,
  activeInactivePlayerService,
  UpdatePlayerFromEntityService,
  playerImportService
};
