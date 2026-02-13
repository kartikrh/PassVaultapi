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
  getPlayerCompetitionListByPlayerIdQuery,
  getPlayerCreatedDetailsQuery,
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
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { deleteTournamentPlayersByPlayerIdQuery } = require("../repository/TableTournamentsTeamPlayers");
const { deleteAwardsByPlayerIdQuery } = require("../repository/TableCommentaryAward");
const { bowlingStyleChangeOnCommPlayersQuery, deleteCommentaryPlayerById } = require("../repository/TableCommentary");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const configConstants = require("../utilities/configConstants");
const { trimTextData, callEntitySportAPI, APIEndpointModuleType, ServiceType, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, RefType, EventType, checkEntitySportAPIEndpointIsActive, ICCMatchType } = require("../utilities/index");
const { errorLogger } = require("../utilities/logger");
const { playersMergeImageService, callClientAPI } = require("../utilities/index");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { savePlayerBatHistQuery, savePlayerBallHistQuery, getAllCommentaryBattingHistory, getAllCommentaryBowlingHistory, deleteCommentaryPlayerBowlingHistoryQuery, deleteCommentaryPlayerBattingHistoryQuery } = require("../repository/TableCommPlayerHistory");
const { fieldNamesService } = require("../services/fieldNamesService");
const { getAllPlayersBattingHistory, insertPlayerBattingHistoryQuery, updatePlayerBattingHistoryQuery, getAllPlayerBowlingHistory, updatePlayerBowlingHistoryQuery, insertPlayerBowlingHistoryQuery } = require("../repository/TablePlayerHistory");
const { insertAutoImportDataService } = require("./autoImportData");

const allPlayerService = async (request,fastify) => {
  const { isActive, eventTypeId, teamId, isMen } = request.body;
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

  if ("isMen" in request.body && isMen !== null) {
    _player = _player.filter(_p => _p.isMen === isMen);
  }

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
      bowlingStyle: result.bowlingStyleId === 1 ? "Pace" : (result.bowlingStyleId === 2 ? "Spin" : null),
      birthDate: result.birthDate ? String(result.birthDate).split('T')[0] : result.birthDate,
      teams: playersInTeams,
      jerseyPlayerImage: playersInTeams?.find(pt => pt.homeTeam)?.jerseyPlayerImage
    };

    return data;
  }
};

const getPlayerCreatedDetailsService = async (request, fastify) => {
  const { playerId } = request.body;

  if (!playerId) {
    return null;
  }

  // Fetch createdDate & createdBy from DB
  const createdDetails = await getPlayerCreatedDetailsQuery(
    playerId,
    fastify,
    request
  );

  if (!createdDetails) {
    return null;
  }

  return {
    ...createdDetails,
  };
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

  // const validatePlayerName = global.tblPlayers.find(
  //   (item) =>
  //     item.playerName.trim().toLowerCase() === request.body.playerName.trim().toLowerCase() &&
  //     item.displayName.trim().toLowerCase () === request.body.displayName.trim().toLowerCase() 
  // );



  // if (validatePlayerName) {
  //   throw new Error("Player Name already exist");
  // }
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
              request.body.jersey = teamData.jersey;
              request.body.playerId = result?.playerId;
              request.body.teamName = teamData.teamName;
              request.body.teamPlayerId = teamPlayerData.teamPlayerId;
              runMergePlayerImageJob(2, request, fastify)
                .catch(err => {
                  errorLogger(
                    fastify,
                    err.message,
                    "services/player.js/insertPlayerService",
                    null
                  );
                });
              // mergeAndSaveImage({
              //   playerImage: request.body.image,
              //   jersey: teamData.jersey,
              //   playerName: request.body.playerName,
              //   teamName: teamData.teamName,
              //   teamPlayerId: teamPlayerData.teamPlayerId,
              //   commentaryPlayerId: null,
              //   commentaryId: null,
              // }, fastify);
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
  // const validatePlayerName = global.tblPlayers.find(
  //   (item) =>
  //     item.playerName.trim().toLowerCase() === request.body.playerName.trim().toLowerCase() &&
  //     item.playerId !== request.body.playerId
  // );

  // if (validatePlayerName) {
  //   throw new Error("Player Name already exist");
  // }
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
    birthDate: request.body.birthDate || checkPlayerId.birthDate,
    birthPlace: request.body.birthPlace || checkPlayerId.birthPlace
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

  if ("isMen" in request.body) {
    body.isMen = request.body?.isMen;
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

  const result = await updatePlayerQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblPlayers.findIndex(
    (item) => item.playerId === request.body.playerId
  );

  global.tblPlayers[index] = result[0];

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
              if (body.image && teamData.jersey) {
                request.body.playerImage = body.image;
                request.body.playerId = body?.playerId;
                request.body.jersey = teamData.jersey;
                request.body.playerName = body.playerName;
                request.body.teamName = teamData.teamName;
                request.body.teamPlayerId = teamPlayerData.teamPlayerId;
                runMergePlayerImageJob(2, request, fastify)
                  .catch(err => {
                    errorLogger(
                      fastify,
                      err.message,
                      "services/player.js/updatePlayerService",
                      null
                    );
                  });
                // mergeAndSaveImage({
                //   playerImage: body.image,
                //   jersey: teamData.jersey,
                //   playerName: body.playerName,
                //   teamName: teamData.teamName,
                //   teamPlayerId: teamPlayerData.teamPlayerId,
                //   commentaryPlayerId: null,
                //   commentaryId: null,
                // }, fastify);
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

  for (const pId of playerId) {
    const getPlayerData = global.tblPlayers.find(tp => tp.playerId === pId);
    const checkCommentaryPlayer = global.tblCommentaryPlayers.find(tcp => tcp.playerId === pId);
    if (checkCommentaryPlayer) {
      throw new Error(`'${getPlayerData?.playerName}' player is in commentary/s and cannot be deleted at this moment`);
    }

    const checkTournamentTeamPlayer = global.tblTournamentTeamPlayers.find(tttp => tttp.playerId === playerId);
    if (checkTournamentTeamPlayer) {
      throw new Error(`'${getPlayerData?.playerName}' player is in tournament/s and cannot be deleted at this moment`);
    }
  }

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

  const getPlayerCommentary = global.tblCommentaryPlayers.filter(tcp => playerId.includes(tcp.playerId));
  for (const commentary of getPlayerCommentary) {
    await deleteCommentaryPlayerById({
      commentaryPlayerId: commentary.commentaryPlayerId
    }, request, fastify);
    global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(tcp => !(tcp.commentaryPlayerId === commentary.commentaryPlayerId));

    if (commentary?.jerseyPlayerImage) {
      await removeImageFromServer({
        path: commentary.jerseyPlayerImage,
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
          birthPlace: checkPlayerId.birthPlace
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
  runMergePlayerImageJob(1, request, fastify)
    .catch(err => {
      errorLogger(
        fastify,
        err.message,
        "services/player.js/mergePlayerImageAndJerseyService",
        request
      );
    });
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

const updatePlayerBatBowlHistory = async (playerId, playerBattingData, playerBowlingData, request, fastify) => {
  const playerData = global.tblPlayers.find(item => item.playerId === playerId);
  const isMen = playerData?.isMen;

  // batting
  const commentaryPlayerBattingHistory = await getAllCommentaryBattingHistory(fastify, playerId);

  const playerBattingHistory = await getAllPlayersBattingHistory(playerId, fastify);

  for (const esMatchType of Object.keys(playerBattingData)) {
    const matchType = global.tblMatchTypes.find(item => item.entityEnum === ICCMatchType[isMen ? "men" : "women"][esMatchType]);
    const matchTypeId = matchType?.matchTypeId;
    if (matchTypeId) {
      Object.keys(playerBattingData[esMatchType]).forEach(key => {
        playerBattingData[esMatchType][key] = Number(playerBattingData[esMatchType][key]) || 0;
      })

      const { matches, innings, notout, runs, balls, highest, run100, run50, run4, run6, average, strike, catches, stumpings, fastest50balls, fastest100balls } = playerBattingData[esMatchType];
      let newPlayerBattingData = {
        matchCount: matches || 0,
        inningsCount: innings || 0,
        notOut: notout || 0,
        totalRuns: runs || 0,
        ballsFacedCount: balls || 0,
        highestScore: highest || 0,
        countOf100: run100 || 0,
        countOf50: run50 || 0,
        countOf4: run4 || 0,
        countOf6: run6 || 0,
        average: average || 0,
        strikeRate: strike || 0,
        catchCount: catches || 0,
        stumpCount: stumpings || 0,
        fastest50Balls: fastest50balls || 0,
        fastest100Balls: fastest100balls || 0,
        outCount: 0,
      }

      const checkData = Object.values(newPlayerBattingData).every(value => value === 0);
      if (!checkData) {
        newPlayerBattingData = {
          matchTypeId,
          matchTypeName: matchType?.matchType,
          playerId,
          ...newPlayerBattingData
        }

        const matchTypeCommentaryBattingHistory = commentaryPlayerBattingHistory.filter(cpbh => cpbh.matchTypeId === matchTypeId);
        if (matchTypeCommentaryBattingHistory && matchTypeCommentaryBattingHistory.length > 0) {
          await deleteCommentaryPlayerBattingHistoryQuery(
            matchTypeCommentaryBattingHistory?.map(mtcbh => mtcbh.id),
            fastify,
            request);
        }

        await savePlayerBatHistQuery(newPlayerBattingData, request, fastify);

        const matchTypeBattingHistory = playerBattingHistory.find(pbh => pbh.matchTypeId === matchTypeId);
        if (matchTypeBattingHistory?.battingHistoryId) {
          await updatePlayerBattingHistoryQuery({
            battingHistoryId: matchTypeBattingHistory?.battingHistoryId,
            ...newPlayerBattingData
          }, request, fastify);
        } else {
          await insertPlayerBattingHistoryQuery(newPlayerBattingData, fastify, request);
        }
      }
    }
  }

  // bowling
  const commentaryPlayerBowlingHistory = await getAllCommentaryBowlingHistory(fastify, playerId);

  const playerBowlingHistory = await getAllPlayerBowlingHistory(playerId, fastify);

  for (const esMatchType of Object.keys(playerBowlingData)) {
    const matchType = global.tblMatchTypes.find(item => item.entityEnum === ICCMatchType[isMen ? "men" : "women"][esMatchType]);
    const matchTypeId = matchType?.matchTypeId;
    if (matchTypeId) {
      Object.keys(playerBowlingData[esMatchType]).forEach(key => {
        playerBowlingData[esMatchType][key] = Number(playerBowlingData[esMatchType][key]) || 0;
      })

      const { matches, innings, balls, runs, wickets, average, bestinning, bestmatch, econ, strike, wicket4i, wicket5i, wicket10m, overs, hattrick, expensive_over_runs } = playerBowlingData[esMatchType];
      let newPlayerBowlingData = {
        bowlerPlayedMatchCount: matches || 0,
        bowlerPlayedInningsCount: innings || 0,
        ballCount: balls || 0,
        runsFromBowler: runs || 0,
        wicketsCount: wickets || 0,
        bowlerAverage: average || 0,
        economy: econ || 0,
        bowlerStrikeRate: parseInt(strike) || 0,
        wickets4: wicket4i || 0,
        wickets5: wicket5i || 0,
        wickets10: wicket10m || 0,
        overCount: overs || 0,
        hattrickCount: hattrick || 0,
        expensiveOverRuns: expensive_over_runs || 0
      }

      const checkData = Object.values(newPlayerBowlingData).every(value => value === 0);
      if (!checkData) {
        newPlayerBowlingData = {
          matchTypeId,
          playerId,
          bestBowlingInInnings: bestinning || "",
          bestBowlingInMatch: bestmatch || "",
          ...newPlayerBowlingData
        }

        const matchTypeCommentaryBowlingHistory = commentaryPlayerBowlingHistory.filter(cpbh => cpbh.matchTypeId === matchTypeId);
        if (matchTypeCommentaryBowlingHistory && matchTypeCommentaryBowlingHistory.length > 0) {
          await deleteCommentaryPlayerBowlingHistoryQuery(
            matchTypeCommentaryBowlingHistory?.map(mtcbh => mtcbh.id),
            fastify,
            request);
        }

        await savePlayerBallHistQuery(newPlayerBowlingData, request, fastify);

        const matchTypeBowlingHistory = playerBowlingHistory.find(pbh => pbh.matchTypeId === matchTypeId);
        if (matchTypeBowlingHistory?.bowlingHistoryId) {
          await updatePlayerBowlingHistoryQuery({
            bowlingHistoryId: matchTypeBowlingHistory?.bowlingHistoryId,
            ...newPlayerBowlingData
          }, request, fastify);
        } else {
          await insertPlayerBowlingHistoryQuery(newPlayerBowlingData, fastify, request);
        }
      }
    }
  }
}

const UpdatePlayerFromEntityService = async (data, fastify, request) => {
  let checkPlayerData = global.tblPlayers.find(item => item.playerId === data.pid);
  if (!checkPlayerData) {
    errorLogger(fastify, `Player not found. playerId: ${data.pid}`, "/services/player.js/UpdatePlayerFromEntityService - checkPlayerData", request);
    return false;
  }

  let playerNewTpId = null;
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getPlayerDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/player.js/UpdatePlayerFromEntityService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  if (!checkPlayerData.tpId) {
    const checkEntitySportAPIEndpoint2 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.searchPlayerDataFromEntity);
    if (!checkEntitySportAPIEndpoint2.data) {
      errorLogger(fastify, checkEntitySportAPIEndpoint2.message, "/services/player.js/UpdatePlayerFromEntityService - checkEntitySportAPIEndpoint2", request);
      return false;
    }

    let url2 = checkEntitySportAPIEndpoint2.data + "?search=" + encodeURIComponent(checkPlayerData.playerName);

    const getCountryShortName = global.tblCountryCodes.find(item => item.id === checkPlayerData.countryId)?.shortName;
    if (getCountryShortName) {
      url2 += "&country=" + getCountryShortName.substring(0, 2);
    }
    const entitySportSearchPlayer = await callEntitySportAPI(url2, request, fastify);

    if (!entitySportSearchPlayer?.data?.result) {
      errorLogger(
        fastify,
        `Invalid response from Entit-Sport API for url ${url2}`,
        "/services/player.js/UpdatePlayerFromEntityService - entitySportSearchPlayer", {
        ...request,
        originalUrl: url2
      }, entitySportSearchPlayer?.data);
      return false;
    }

    if (entitySportSearchPlayer?.data?.result?.total_items === "1") {
      playerNewTpId = entitySportSearchPlayer?.data?.result?.items[0]?.pid;
    } else if (Number(entitySportSearchPlayer?.data?.result?.total_items) > 1) {
      const birthDate = checkPlayerData?.birthDate ? new Date(checkPlayerData?.birthDate).toISOString().split('T')[0] : null;
      const entityPlayerData = entitySportSearchPlayer?.data?.result?.items.filter(item => item.title === checkPlayerData.playerName && item.short_name === checkPlayerData.displayName && ((birthDate && item.birthdate) ? new Date(item.birthdate).toISOString().split('T')[0] === birthDate : true));
      if (entityPlayerData?.length === 1) {
        playerNewTpId = entityPlayerData[0]?.pid;
      }
    }
  }

  if (!checkPlayerData.tpId) {
    if (!playerNewTpId) {
      errorLogger(fastify, `Player data not found for playerId: ${checkPlayerData.playerId}`, "/services/player.js/UpdatePlayerFromEntityService - checkPlayerData.tpId", request, checkPlayerData);
      return false;
    }
  } else {
    playerNewTpId = checkPlayerData.tpId;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{pid}", playerNewTpId);
  const entitySportPlayer = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportPlayer?.data?.result;
  }

  const entitySportPlayerResponse = entitySportPlayer?.data?.result;
  if (!entitySportPlayerResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/player.js/UpdatePlayerFromEntityService - entitySportPlayerResponse", {
      ...request,
      originalUrl: url
    }, entitySportPlayer?.data);
    return false;
  }

  const entitySportPlayerInfoResponse = entitySportPlayerResponse?.player;
  if (!entitySportPlayerInfoResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/player.js/UpdatePlayerFromEntityService - entitySportPlayerInfoResponse", {
      ...request,
      originalUrl: url
    }, entitySportPlayer?.data);
    return false;
  }

  const { playerId, playerTypeId, playerName, displayName, isKipper, isLeftHandedBatting, isLeftArmFielding, bowlingStyleId, bowlingTypeId, countryId, tpId, birthDate, birthPlace } = checkPlayerData;
  const { playing_role, title, short_name, batting_style, bowling_style, bowling_type, nationality, birthdate, birthplace } = entitySportPlayerInfoResponse;

  let changedValues = { ...checkPlayerData };

  if (!tpId && playerNewTpId) {
    changedValues.tpId = playerNewTpId;
  }

  if (playing_role) {
    const entityPlayerTypeId = EntityPlayerType[playing_role];
    if (entityPlayerTypeId && playerTypeId !== entityPlayerTypeId) {
      changedValues.playerTypeId = entityPlayerTypeId;
    }

    const entityIsKeeper = playing_role === "wk";
    if ("isKipper" in checkPlayerData && isKipper !== entityIsKeeper) {
      changedValues.isKipper = entityIsKeeper;
    }
  }

  if (title && playerName !== title) {
    changedValues.playerName = title;
  }

  if (short_name && displayName !== short_name) {
    changedValues.displayName = short_name;
  }

  const entityBattingStyle = batting_style?.toLowerCase().includes("left");
  if ("isLeftHandedBatting" in checkPlayerData && isLeftHandedBatting !== entityBattingStyle) {
    changedValues.isLeftHandedBatting = entityBattingStyle;
  }

  const entityBowlingStyle = bowling_style?.toLowerCase().includes("left");
  if ("isLeftArmFielding" in checkPlayerData && isLeftArmFielding !== entityBowlingStyle) {
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

  const countryData = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === nationality?.toLowerCase());
  if (nationality && countryId !== countryData?.id) {
    const checkCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === nationality?.toLowerCase());
    if (checkCountry) {
      changedValues.countryId = checkCountry?.id
    } else {
      const insertCountryData = {
        countryName: nationality || null,
        isActive: true,
      };
      const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
      global.tblCountryCodes.push(insertCountryCode);
      changedValues.countryId = insertCountryCode?.id
    }
  }

  if (birthdate && (!birthDate || (new Date(birthDate).toISOString().split('T')[0] !== new Date(birthdate).toISOString().split('T')[0]))) {
    changedValues.birthDate = birthdate;
  }

  if (birthplace && birthPlace !== birthplace) {
    changedValues.birthPlace = birthplace;
  }

  const isChanged = (
    changedValues.playerTypeId !== playerTypeId ||
    changedValues.playerName !== playerName ||
    changedValues.displayName !== displayName ||
    changedValues.isKipper !== isKipper ||
    changedValues.isLeftHandedBatting !== isLeftHandedBatting ||
    changedValues.isLeftArmFielding !== isLeftArmFielding ||
    changedValues.bowlingStyleId !== bowlingStyleId ||
    changedValues.bowlingTypeId !== bowlingTypeId ||
    changedValues.countryId !== countryId ||
    changedValues.tpId !== tpId ||
    changedValues.birthDate !== birthDate ||
    changedValues.birthPlace !== birthPlace
  );

  const playerTeams = await getAllTeamsByPlayerIdQuery(playerId, fastify, request);
  if (playerTeams && playerTeams.length === 1 && playerTeams.filter(pt => pt.homeTeam)?.length === 0) {
    await updateTeamPlayerHomeTeamQuery({
      refPlayerId: playerTeams[0].refPlayerId,
      teamId: playerTeams[0]?.teamId
    }, fastify, request);
    await playerImageChangeOnClientAPIService(playerId, fastify);
  }

  await updatePlayerBatBowlHistory(playerId, entitySportPlayerResponse?.batting, entitySportPlayerResponse?.bowling, request, fastify);

  if (isChanged) {
    changedValues.userId = request.userTokenInfo.WrUserId;
    try {
      const updatePlayerData = await updatePlayerQuery(changedValues, fastify, request);
      delete changedValues.userId;
      const index = global.tblPlayers.findIndex(
        (item) => item.playerId === checkPlayerData.playerId
      );
      if (index !== -1) {
        global.tblPlayers[index] = updatePlayerData[0];
      }
    } catch (err) {
      errorLogger(fastify, `Failed to update player id: ${checkPlayerData.playerId} error: ${err.message}`, "/services/player.js/UpdatePlayerFromEntityService", request);
      return false;
    }
  }

  return `Player data updated successfully`;
};

const playerImportService = async (data, fastify, request) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getPlayerDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/player.js/playerImportService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{pid}", data.pid);
  const entitySportPlayer = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportPlayer?.data?.result;
  }

  let entitySportPlayerResponse = entitySportPlayer?.data?.result?.player;
  let entitySportPlayerStatisticsResponse = entitySportPlayer?.data?.result;
  if (!entitySportPlayerResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/player.js/playerImportService - entitySportPlayerStatisticsResponse", {
      ...request,
      originalUrl: url
    }, entitySportPlayer?.data);
    return false;
  }

  const entitySocketData = global.tblEntitySockets[0];
  let checkPlayer = global.tblPlayers.find(item => item.tpId == entitySportPlayerResponse?.pid);
  if (!checkPlayer) {
    checkPlayer = global.tblPlayers.find((item) => item.tpId == null
      && item.playerName.toLowerCase() === entitySportPlayerResponse?.title.replace(/'/g, "''").toLowerCase() &&
      item.displayName.trim().replace(/'/g, "''").toLowerCase() == entitySportPlayerResponse?.short_name.toLowerCase())
    if (!checkPlayer) {
      let getCountry = null;
      if (entitySportPlayerResponse?.nationality) {
        getCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === entitySportPlayerResponse?.nationality.toLowerCase());
        if (!getCountry) {
          const insertCountryData = {
            countryName: entitySportPlayerResponse?.nationality || null,
            isActive: true,
          };
          const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
          global.tblCountryCodes.push(insertCountryCode);
          getCountry = insertCountryCode;
        }
      }
      let insertPlayerData = {
        eventTypeId: EventType['Cricket'],
        playerTypeId: EntityPlayerType[entitySportPlayerResponse?.playing_role],
        playerName: entitySportPlayerResponse?.title,
        displayName: entitySportPlayerResponse?.short_name,
        countryId: getCountry?.id,
        isActive: true,
        isKipper: entitySportPlayerResponse?.playing_role === 'wk' ? true : false,
        isLeftHandedBatting: !entitySportPlayerResponse.batting_style.includes('Right'),
        isLeftArmFielding: !entitySportPlayerResponse.bowling_style.includes('Right'),
        userId: -2,
        batsmanAverage: 0.0,
        batsmanStrikeRate: 0.0,
        bowlerAverage: 0.0,
        bowlerEconomy: 0.0,
        tpId: entitySportPlayerResponse?.pid || null,
        bowlingStyleId: entitySportPlayerResponse.bowling_type ? EntityBowlingStyleType[entitySportPlayerResponse.bowling_type.toLowerCase()] : null,
        bowlingTypeId: extractBowlingStyle(entitySportPlayerResponse.bowling_type, entitySportPlayerResponse.bowling_style),
        image: entitySocketData?.defaultPlayerImage || null,
        imagePath: entitySocketData?.defaultPlayerImagePath || null,
        birthDate: entitySportPlayerResponse?.birthdate,
        birthPlace: entitySportPlayerResponse?.birthplace
      };
      const insertPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
      global.tblPlayers.push(insertPlayer);
      checkPlayer = insertPlayer;
    }
    else if (checkPlayer?.tpId === null || !checkPlayer?.tpId || checkPlayer?.tpId !== entitySportPlayerResponse?.pid) {
      const data = {
        userId: -2,
        tpId: entitySportPlayerResponse?.pid || null,
        playerId: checkPlayer.playerId,
      };
      const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
      let index = global.tblPlayers.findIndex((i) => i.playerId == checkPlayer.playerId)
      if (index != -1) {
        global.tblPlayers[index] = updatePlayer
      }
      checkPlayer = updatePlayer
    }
  }

  await updatePlayerBatBowlHistory(checkPlayer?.playerId, entitySportPlayerStatisticsResponse?.batting, entitySportPlayerStatisticsResponse?.bowling, request, fastify);

  return checkPlayer;
}

const allPlayersMergeImageService = async (request, fastify) => {
  const result = await playersMergeImageService(1, request, fastify)
  return result;
};

const mergePlayerNullImageService = async (request, fastify) => {
  const result = await playersMergeImageService(2, request, fastify)
  return result;
};

const updatePlayerHomeTeamService = async (request, fastify) => {
  const { playerId, homeTeamId } = request.body;

  await updateTeamPlayerHomeTeamQuery(
    {
      refPlayerId: parseInt(playerId),
      teamId: parseInt(homeTeamId),
    },
    fastify,
    request
  );
  await playerImageChangeOnClientAPIService(parseInt(playerId), fastify);
  return "Player Home Team updated successfully";
};

const getPlayerCompetitionListByIdService = async (request, fastify) => {
  const playerId = request.body.playerId;

  const checkPlayer = global.tblPlayers.find(p => p.playerId === playerId);
  if (!checkPlayer) {
    throw new Error(`Player with this id: ${playerId} not Found`);
  }

  const result = await fastify.db.query(
    `SELECT * FROM fn_get_player_competition_list_by_id(:playerId)`,
    {
      replacements: {
        playerId: playerId
      },
      type: fastify.db.QueryTypes.SELECT
    }
  );

  return result?.[0]?.fn_get_player_competition_list_by_id ?? [];
};

const getPlayerPlayInCommentaryListByIdService = async (request, fastify) => {
  const playerId = request.body.playerId;

  const checkPlayer = global.tblPlayers.find(p => p.playerId === playerId);
  if (!checkPlayer) {
    throw new Error(`Player with this id: ${playerId} not Found`);
  }

  const result = await fastify.db.query(
    `SELECT * FROM fn_get_player_play_in_commentary_list(:playerId)`,
    {
      replacements: {
        playerId: playerId
      },
      type: fastify.db.QueryTypes.SELECT
    }
  );

  return result ?? [];
};

const runMergePlayerImageJob = async (type, request, fastify) => {
  const {
    playerImage,
    jersey,
    playerName,
    teamName,
    teamPlayerId,
    homeTeamId,
    playerId,
  } = request.body;
  if (type === 1) {
    for (const player of request.body.playerId) {
      const checkPlayerId = global.tblPlayers.find(
        (item) => item.playerId === player
      );
      if (!checkPlayerId) continue;

      const teamPlayersData = await getTeamPlayerByPlayerIdQuery(player, fastify, request);

      for (const playerData of teamPlayersData) {
        const teamData = global.tblTeams.find(
          (item) => item.teamId == playerData.teamId
        );

        if (checkPlayerId?.image && teamData?.jersey) {
          await mergeAndSaveImage({
            playerImage: checkPlayerId.image,
            jersey: teamData.jersey,
            playerName: checkPlayerId.playerName,
            teamName: teamData.teamName,
            teamPlayerId: playerData.teamPlayerId,
            commentaryPlayerId: null,
            commentaryId: null,
          }, fastify);
        }
        if (playerData?.homeTeam == true) {
          await playerImageChangeOnClientAPIService(player, fastify);
        }
      }
    }
  } else {
    await mergeAndSaveImage({
      playerImage,
      jersey,
      playerName,
      teamName,
      teamPlayerId,
      commentaryPlayerId: null,
      commentaryId: null,
    }, fastify);

    if(homeTeamId !== null && homeTeamId !== undefined) {
      await playerImageChangeOnClientAPIService(playerId, fastify);
    }
  }
};

const playerImageChangeOnClientAPIService = async (playerId, fastify) => {
  const rankingData = global.tblICCRanking.filter(item => item.playerId == playerId && item.isActive == true);
  const updatedData = await Promise.all(
    rankingData
      .map(async item => {
        const fields = await fieldNamesService(item, fastify);
        return { ...item, ...fields };
      })
  );
  if (updatedData.length > 0) {
    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: 'iccRankings',
          type: "update",
          data: updatedData
        }
      }, null, fastify)
      .catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "services/player.js/playerImageChangeOnClientAPIService - callClientAPI",
          null
        );
      });
  }
}

const upsertPlayerOnImportService = async (esPlayer, entitySocketData, isMen, fastify, request) => {
  let checkPlayer = global.tblPlayers.find(item => item.tpId === esPlayer.pid);
  if (!checkPlayer) {
    checkPlayer = global.tblPlayers.find((item) => item.tpId == null
      && item.playerName.toLowerCase() === esPlayer?.title.replace(/'/g, "''").toLowerCase() &&
      item.displayName.trim().replace(/'/g, "''").toLowerCase() == esPlayer?.short_name.toLowerCase())
    if (!checkPlayer) {
      let getCountry = null;
      if (esPlayer?.nationality) {
        getCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === esPlayer?.nationality.toLowerCase());
        if (!getCountry) {
          const insertCountryData = {
            countryName: esPlayer?.nationality || null,
            isActive: true,
          };
          const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
          global.tblCountryCodes.push(insertCountryCode);
          getCountry = insertCountryCode;
        }
      }

      let insertPlayerData = {
        eventTypeId: EventType['Cricket'],
        playerTypeId: EntityPlayerType[esPlayer?.playing_role],
        playerName: esPlayer?.title,
        displayName: esPlayer?.short_name,
        countryId: getCountry?.id,
        isActive: true,
        isKipper: esPlayer?.playing_role === 'wk' ? true : false,
        isLeftHandedBatting: esPlayer.batting_style ? !esPlayer.batting_style.includes('Right') : false,
        isLeftArmFielding: esPlayer.bowling_style ? !esPlayer.bowling_style.includes('Right') : false,
        userId: -2,
        batsmanAverage: 0.0,
        batsmanStrikeRate: 0.0,
        bowlerAverage: 0.0,
        bowlerEconomy: 0.0,
        tpId: esPlayer?.pid || null,
        bowlingStyleId: esPlayer.bowling_type ? EntityBowlingStyleType[esPlayer.bowling_type.toLowerCase()] : null,
        bowlingTypeId: extractBowlingStyle(esPlayer.bowling_type, esPlayer.bowling_style),
        image: entitySocketData?.defaultPlayerImage || null,
        imagePath: entitySocketData?.defaultPlayerImagePath || null,
        isMen,
        birthDate: esPlayer?.birthdate || null,
        birthPlace: esPlayer?.birthplace ?? null
      };
      checkPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
      global.tblPlayers.push(checkPlayer);

      await insertAutoImportDataService({
        ...request,
        body: {
          refId: checkPlayer?.playerId,
          refType: RefType.PlayerUpdate,
          sourceId: 3
        },
        userTokenInfo: {
          WrUserId: request?.userTokenInfo?.WrUserId ?? -2
        }
      }, fastify);
    } else if (checkPlayer?.tpId === null || !checkPlayer?.tpId || checkPlayer?.tpId !== esPlayer?.pid) {
      const data = {
        userId: -2,
        tpId: esPlayer.pid,
        playerId: checkPlayer.playerId,
      };
      checkPlayer = await updateExchangePlayerQuery(data, fastify, request);
      let index = global.tblPlayers.findIndex((i) => i.playerId == checkPlayer.playerId)
      if (index != -1) {
        global.tblPlayers[index] = checkPlayer
      }
    }
  }
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
  playerImportService,
  allPlayersMergeImageService,
  mergePlayerNullImageService,
  updatePlayerHomeTeamService,
  getPlayerCompetitionListByIdService,
  getPlayerPlayInCommentaryListByIdService,
  getPlayerCreatedDetailsService,
  playerImageChangeOnClientAPIService,
  upsertPlayerOnImportService
};
