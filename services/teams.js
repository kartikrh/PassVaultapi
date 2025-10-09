const { deleteTeamCompetitionByTeamIdQuery, insertTeamCompetitionQuery } = require("../repository/TableTeamCompetition");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
  getTeamPlayerByTeamIdQuery,
  getHomeTeamPlayerByPlayerIdQuery,
  updateTeamPlayerHomeTeamQuery,
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
  getImageFromUrl,
} = require("../utilities/Images");
const { PROJECT_NAME, ENTITYDEFAULTPLAYERIMG, ENTITYDEFAULTPLAYERIMGPATH, ENTITYDEFAULTTEAMIMG, ENTITYDEFAULTTEAMIMGPATH, ENTITYDEFAULTJERSEYIMG, ENTITYDEFAULTJERSEYIMGPATH } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { deletePlayersByTeamIdQuery } = require("../repository/TableTournamentsTeamPlayers")
const { deletePointsByTeamIdQuery } = require("../repository/TableTournmentTeamPoints")
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { trimTextData, RefType, callEntitySportAPI, ServiceType, APIEndpointModuleType, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, EventType, checkEntitySportAPIEndpointIsActive } = require("../utilities/index");
const { getAutoImportDataByIdQuery, insertAutoImportDataQuery } = require("../repository/TableAutoImportData");
const { insertPlayerQuery } = require("../repository/TablePlayer");
const { updateAutoImportDataService } = require("./autoImportData");
const { playerImportService } = require("./player");
const { addTournamentTeamPlayersService } = require("./tournamentTeamPlayers");
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

  const updatedTeams = result.map((item) => {
    const country = global.tblCountryCodes.find(elem => elem.id === item.countryId);
    return {
      ...item,
      countryName: country?.countryName ?? null
    };
  });

  return updatedTeams;



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
  const trimData = await trimTextData({
    teamName: request.body?.teamName,
    teamShortName: request.body?.teamShortName,
  }, request, fastify);

  if(trimData) {
    Object.assign(request.body, trimData);
  }

  const validateTeamName = global.tblTeams.find(
    (item) =>
      item.teamName.toLowerCase() == request.body.teamName.toLowerCase()
  );
  // const validateTeamName = global.tblTeams.find(
  //   (item) =>
  //     item.teamName.trim().toLowerCase() == request.body.teamName.trim().toLowerCase()
  // );

  if (validateTeamName) {
    throw new Error("TeamName already exist");
  }

  if (request.body?.tpId != null) {
    const validateTpId = global.tblTeams.some(
      (item) => item.tpId == request.body?.tpId
    );

    if (validateTpId) {
      throw new Error("TpId already exists");
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

    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Teams,
    });
    request.body.image = fullPath;
    request.body.imagePath = imagePath
  }

  if (request.body.jersey && request.body.jersey.length) {
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.jersey[0],
      project: projectName,
      name: `${imgName}-jersey`,
      ...ImgModuleConfig.Teams,
    });
    request.body.jersey = fullPath;
    request.body.jerseyPath = imagePath
  }
  request.body.teamName = request.body.teamName.trim();
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
              const playerTpId = global.tblPlayers.find(elem => elem.playerId == playerID);
              const teamPlayerData = await insertTeamPlayerQuery(
                {
                  teamId: data.teamId,
                  refPlayerId: playerID,
                  tpId: playerTpId?.tpId ?? null,
                  userId: request.userTokenInfo.WrUserId,
                },
                fastify,
                request
              );

            const playerData = global.tblPlayers.find((item) => item.playerId == playerID);
            if(request.body.jersey && playerData.image) {
              mergeAndSaveImage({
                jersey: request.body.jersey,
                playerImage: playerData.image,
                playerName: playerData.playerName,
                teamName: request.body.teamName,
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
  // if (request.body.competitionId) {
  //   const hashString = request.body.competitionId;
  //   if (typeof hashString === "object") {
  //     // Split the string into an array using commas as the delimiter
  //     const jsonString = JSON.stringify(hashString);
  //     // Convert the string back to an array of values
  //     const hashArray = jsonString.split(",");
  //     if (hashArray.length) {
  //       for (let i = 0; i < hashArray.length; i++) {
  //         if (hashArray[i]) {
  //           const competitionId = hashArray[i].replace(/[\[\]"]/g, "");
  //           if (competitionId !== "") {
  //             let res = await insertTeamCompetitionQuery(
  //               {
  //                 teamId: data.teamId,
  //                 refCompetitionId: parseInt(competitionId),
  //                 userId: request.userTokenInfo.WrUserId,
  //               },
  //               fastify,
  //               request
  //             );
  //             global.tblTeamCompetition.push(res);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
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
  if(checkTeamId) {
    const validateTpId = global.tblTeams.find(
      (item) =>
        item.tpId == request.body?.tpId && item.teamId != request.body.teamId &&
        item.tpId !== null
    );
  
    if (validateTpId) {
      throw new Error("TpId already exist");
    }
  }

  const trimData = await trimTextData({
    teamName: request.body?.teamName,
    teamShortName: request.body?.teamShortName,
  }, request, fastify);
  if(trimData) {
    Object.assign(request.body, trimData);
  }

  const _getEventType = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!checkTeamId.teamColor) {
    checkTeamId.teamColor = "#FFFFFF";
  }
  const body = {
    teamName: request.body.teamName.trim() || checkTeamId.teamName,
    teamShortName: request.body.teamShortName || checkTeamId.teamShortName,
    image: checkTeamId.image,
    jersey: checkTeamId.jersey,
    // country: request.body.country || checkTeamId.country,
    eventTypeId: request.body.eventTypeId || checkTeamId.eventTypeId,
    userId: request.userTokenInfo.WrUserId,
    teamId: request.body.teamId,
    eventType: _getEventType.eventType,
    teamColor: request.body.teamColor || checkTeamId.teamColor,
    backgroundColor: request.body.backgroundColor || checkTeamId.backgroundColor,
    imagePath: checkTeamId.imagePath,
    jerseyPath: checkTeamId.jerseyPath,
    // tpId: request.body.tpId || checkTeamId.tpId,
    tpId: request.body.tpId === undefined ? checkTeamId.tpId
      : [0, '', 'null'].includes(request.body.tpId) ? null
      : request.body.tpId,
    countryId: request.body.countryId || checkTeamId.countryId,
  };

  const validateTeamName = global.tblTeams.find(
    (item) =>
      item.teamName.trim().toLowerCase() === body.teamName.trim().toLowerCase() &&
      item.teamId != request.body.teamId
  );

  if (validateTeamName) {
    throw new Error("TeamName already exist");
  }

  if (request.body.eventTypeId) {
    const validateEventId = global.tblEventTypes.find(
      (item) => item.eventTypeId == request.body.eventTypeId
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

    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.image[0],
      project: projectName,
      name: imgName,
      ...ImgModuleConfig.Teams,
    });
    body.image = fullPath;
    body.imagePath = imagePath;
  }

  if (request.body.jersey && request.body.jersey.length) {

    // generate image name
    imgName = generateImageName({
      name: request.body.teamName,
    });
    
    const { fullPath, imagePath } = await storeImageOnServer({
      image: request.body.jersey[0],
      project: projectName,
      name: `${imgName}-jersey`,
      ...ImgModuleConfig.Teams,
    });
    body.jersey = fullPath;
    body.jerseyPath = imagePath;
  }

  await updateTeamQuery(body, fastify, request);

  delete body.userId;

  const index = global.tblTeams.findIndex(
    (item) => item.teamId == request.body.teamId
  );

  global.tblTeams[index] = body;

  if (request.body.playerId) {
    const teamPlayersData = await getTeamPlayerByTeamIdQuery(body.teamId, fastify, request);
      for (const teamData of teamPlayersData) {
      if (teamData && teamData?.jerseyPlayerImage) {
        await removeImageFromServer({
          path: teamData.jerseyPlayerImage,
        });
      }
    }
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
            const playerTpId = global.tblPlayers.find(elem => elem.playerId == playerID);
            const teamPlayerData = await insertTeamPlayerQuery(
              {
                teamId: body.teamId,
                refPlayerId: playerID,
                tpId: playerTpId?.tpId ?? null,
                userId: request.userTokenInfo.WrUserId,
              },
              fastify,
              request
            );

            const playerData = global.tblPlayers.find((item) => item.playerId == playerID);
            if(body.jersey && playerData.image) {
              mergeAndSaveImage({
                jersey: body.jersey,
                playerImage: playerData.image,
                playerName: playerData.playerName,
                teamName: body.teamName,
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
  // if (request.body.competitionId) {
  //   await deleteTeamCompetitionByTeamIdQuery(body.teamId, fastify, request);
  //   global.tblTeamCompetition = global.tblTeamCompetition.filter(
  //     (item) => item.teamId !== body.teamId
  //   );

  //   const hashString = request.body.competitionId;
  //   // Split the string into an array using commas as the delimiter
  //   const jsonString = JSON.stringify(hashString);
  //   // Convert the string back to an array of values
  //   const hashArray = jsonString.split(",");
  //   if (hashArray.length) {
  //     for (let i = 0; i < hashArray.length; i++) {
  //       if (hashArray[i]) {
  //         const competitionId = hashArray[i].replace(/[\[\]"]/g, "");
  //         if (competitionId !== "") {
  //           let res =await insertTeamCompetitionQuery(
  //             {
  //               teamId: body.teamId,
  //               refCompetitionId: competitionId,
  //               userId: request.userTokenInfo.WrUserId,
  //             },
  //             fastify,
  //             request
  //           );
  //           global.tblTeamCompetition.push(res);
  //         }
  //       }
  //     }
  //   }
  // }

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
    const teamPlayersData = await getTeamPlayerByTeamIdQuery(team, fastify, request);
      for (const teamData of teamPlayersData) {
      if (teamData && teamData?.jerseyPlayerImage) {
        await removeImageFromServer({
          path: teamData.jerseyPlayerImage,
        });
      }
    }
    await deleteTeamPlayerByTeamIdQuery(team, fastify, request);
    // await deleteTeamCompetitionByTeamIdQuery(team, fastify, request);
  }

  await deletePlayersByTeamIdQuery(teamId, request, fastify);
  global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(
    (item) => !teamId.includes(item.teamId)
  );

  await deletePointsByTeamIdQuery(teamId, request, fastify);

  global.tblTeams = global.tblTeams.filter(
    (item) => !teamId.includes(item.teamId)
  );
  global.tblTeamCompetition = global.tblTeamCompetition.filter(
    (item) => !teamId.includes(item.teamId)
  );

  return "Team(s) deleted successfully";
};


const getTeamPointService = async (request, fastify) => {
  const { teamId } = request.body;

  const result = await Promise.all(
    global.tblCommentaries
      .filter((elem) => [elem.team1Id, elem.team2Id].includes(teamId))
      .map(async (item) => {
        const isTeamInTeam1 = item.team1Id === teamId;

        const teamId1 = isTeamInTeam1 ? item.team1Id : item.team2Id;
        const teamId2 = isTeamInTeam1 ? item.team2Id : item.team1Id;
        return {
          eventDate: item.eventDate,
          eventRefId: item.eventRefId,
          eventName: item.eventName,
          eventTypeId: item.eventTypeId,
          eventType: global.tblEventTypes.find(
            (etyp) => etyp.eventTypeId === item.eventTypeId
          )?.eventType || null,
          competitionId: item.competitionId,
          competitionName: global.tblCompetitions.find(
            (c) => c.competitionId === item.competitionId
          )?.competition || null,
          matchTypeId: item.matchTypeId,
          matchType: global.tblMatchTypes.find(
            (mtyp) => mtyp.matchTypeId === item.matchTypeId
          )?.matchType || null,
          team1Id: teamId1,
          team1Name: global.tblTeams.find((t) => t.teamId === teamId1)?.teamName || null,
          team2Id: teamId2,
          team2Name: global.tblTeams.find((t) => t.teamId === teamId2)?.teamName || null,
          winnerName: item.winnerName,
          commentaryResult: item.result,
        };
      })
  );

  result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  return result;
};


const mergeTeamJerseyAndPlayerImageService = async (request, fastify) => {
  for(const team of request.body.teamId){
    const checkTeamId = global.tblTeams.find(
      (item) => item.teamId === team
    );
  
    if (!checkTeamId) {
      continue;
    }
    const teamPlayersData = await getTeamPlayerByTeamIdQuery(team, fastify, request);
    if (teamPlayersData.length > 0) {
        for (const teamData of teamPlayersData) {
          const playerData = global.tblPlayers.find((item) => item.playerId == teamData.refPlayerId);
          if(checkTeamId?.jersey && playerData?.image) {
            mergeAndSaveImage({
              jersey: checkTeamId.jersey,
              playerImage: playerData.image,
              playerName: playerData.playerName,
              teamName: checkTeamId.teamName,
              teamPlayerId: teamData.teamPlayerId,
              commentaryPlayerId: null,
              commentaryId: null,
            }, fastify);
          }
      }
    }
  }
  return "Player image(s) and Jersey image(s) merged successfully";
};

const UpdateTeamFromEntityService = async (request, fastify) => {
  const { teamIds } = request.body;

  const teamData = global.tblTeams.filter((item) => teamIds.includes(item.teamId) && item.tpId !== null);
  let eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLocaleLowerCase());

  let updateCount = 0;

  for (const entry of teamData) {
    try {
      const whereCondition = `"wrRefId" = ${entry.tpId} AND "wrRefType" = ${RefType.Team} AND "wrSourceId" = 3 AND "wrIsImported" = true`;
      const validateCompImportData = await getAutoImportDataByIdQuery(whereCondition, request, fastify);
      if (!validateCompImportData) {
        const insertAutoImportBody = {
          refId: entry.tpId,
          refType: RefType.Team,
          sourceId: 3
        }
        const insertAutoImportData = await insertAutoImportDataQuery({
          ...insertAutoImportBody,
          isImportStart: true,
          importStartTime: new Date()
        }, fastify, request);

        const response = await callEntitySportAPI(
          {
            serviceType: ServiceType.entitySport,
            moduleType: APIEndpointModuleType.getTeamDataByIdFromEntity,
            data: {
              module: 'team',
              type: "get",
              tid: entry.tpId
            }
          },
          request,
          fastify
        );

        const teamDataResponse = response.data.result?.response?.items;
        const { team, players } = teamDataResponse;
        if (teamDataResponse) {
          const allPlayers = Object.values(players).flat();
          const seen = new Set();
          const uniquePlayers = allPlayers.filter(player => !seen.has(player.pid) && seen.add(player.pid));
          for (const player of uniquePlayers) {
            const playerData = global.tblPlayers.find(item => item.tpId === player.pid);
            if (!playerData) {
              let playerImageData = player?.logo_url;
              if (!playerImageData) {
                playerImageData = {
                  fullPath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTPLAYERIMG)?.value || null,
                  imagePath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTPLAYERIMGPATH)?.value || null
                }
              } else {
                const getImageDataFromUrl = await getImageFromUrl({
                  type: ImgModuleConfig.Players.type,
                  imageUrl: playerImageData
                });

                if (getImageDataFromUrl && getImageDataFromUrl.fullPath) {
                  playerImageData = getImageDataFromUrl
                }
              }
              const data = {
                eventTypeId: eventType?.eventTypeId || eventType['Cricket'],
                playerTypeId: EntityPlayerType[player?.playing_role],
                playerName: player?.title,
                displayName: player?.short_name,
                country: player?.nationality,
                isActive: true,
                isKipper: player?.playing_role === 'wk' ? true : false,
                isLeftHandedBatting: !player.batting_style.includes('Right'),
                isLeftArmFielding: !player.bowling_style.includes('Right'),
                userId: request.userTokenInfo.WrUserId,
                batsmanAverage: 0.0,
                batsmanStrikeRate: 0.0,
                bowlerAverage: 0.0,
                bowlerEconomy: 0.0,
                tpId: player?.pid || null,
                bowlingStyleId: player.bowling_type ? EntityBowlingStyleType[player.bowling_type.toLowerCase()] : null,
                bowlingTypeId: extractBowlingStyle(player.bowling_type, player.bowling_style),
                image: playerImageData.fullPath,
                imagePath: playerImageData.imagePath,
              };

              const insertPlayer = await insertPlayerQuery(data, fastify, request);
              global.tblPlayers.push(insertPlayer);
              updateCount++;

              const teamPlayersData = await getTeamPlayerByTeamIdQuery(entry.teamId, fastify, request);
              if (teamPlayersData && !teamPlayersData?.find(item => item.refPlayerId === insertPlayer.playerId)) {
                const checkHomeTeamPlayer = await getHomeTeamPlayerByPlayerIdQuery({
                  refPlayerId: insertPlayer?.playerId
                }, fastify, request);
                let teamPlayerData = {
                  teamId: entry?.teamId,
                  refPlayerId: insertPlayer?.playerId,
                  tpId: player?.pid,
                  userId: request.userTokenInfo.WrUserId,
                  homeTeam: checkHomeTeamPlayer.length === 0
                };
                await insertTeamPlayerQuery(teamPlayerData, fastify, request);
              }
            } else {
              const teamPlayersData = await getTeamPlayerByTeamIdQuery(entry.teamId, fastify, request);
              if (teamPlayersData && !teamPlayersData?.find(item => item.refPlayerId === playerData.playerId)) {
                const checkHomeTeamPlayer = await getHomeTeamPlayerByPlayerIdQuery({
                  refPlayerId: playerData?.playerId
                }, fastify, request);
                let teamPlayerData = {
                  teamId: entry?.teamId,
                  refPlayerId: playerData?.playerId,
                  tpId: player?.pid,
                  userId: request.userTokenInfo.WrUserId,
                  homeTeam: checkHomeTeamPlayer.length === 0
                };
                await insertTeamPlayerQuery(teamPlayerData, fastify, request);
                updateCount++;
              }
            }
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
      throw new Error(`Failed to fetch or process team data: ${err.message}`);
    }
  }

  if (updateCount > 0) {
    return `Team data updated successfully`;
  }

  return "No update found in team data";
};

const teamImportService = async (data, fastify, request = null) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getTeamDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    throw new Error(checkEntitySportAPIEndpoint.message);
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{tid}", data.tid);
  const entitySportTeamPlayer = await callEntitySportAPI(url, request, fastify);

  let entitySportTeamPlayerResponse = entitySportTeamPlayer?.data?.result;
  if (!entitySportTeamPlayerResponse) {
    throw new Error("Invalid response from Entit-Sport API");
  }

  let entitySportTeamResponse = entitySportTeamPlayerResponse?.items?.team;
  let entitySportPlayerResponse = entitySportTeamPlayerResponse?.items?.players;

  entitySportTeamResponse = {
    ...entitySportTeamResponse,
    ...(entitySportTeamResponse?.sex === "male" ? {
      title: entitySportTeamResponse.title.replace(/\s*\(Men\)/i, '').trim()
    } : {
      title: entitySportTeamResponse.title.replace(/\((Women)\)/i, '$1').trim()
    })
  }

  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());

  let teamData = {
    teamName: entitySportTeamResponse?.title,
    teamShortName: entitySportTeamResponse?.abbr,
    country: entitySportTeamResponse?.country,
    eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
    userId: -2,
    tpId: entitySportTeamResponse?.tid || null
  };

  let checkTeam = global.tblTeams.find(item => item.tpId === entitySportTeamResponse?.tid || item.teamName.toLowerCase() === entitySportTeamResponse.title.replace(/'/g, "''").toLowerCase());
  if (!checkTeam) {
    let imageUrl = entitySportTeamResponse?.logo_url;
    if (!imageUrl) {
      imageUrl = {
        fullPath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTTEAMIMG)?.value || null,
        imagePath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTTEAMIMGPATH)?.value || null
      }
    } else {
      const getImageDataFromUrl = await getImageFromUrl({
        type: ImgModuleConfig.Teams.type,
        imageUrl
      });

      if (getImageDataFromUrl && getImageDataFromUrl.fullPath) {
        imageUrl = getImageDataFromUrl
      }
    }

    let teamJerseyImageData = {
      fullPath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTJERSEYIMG)?.value || null,
      imagePath: global.tblConfigs.find(item => item.key === ENTITYDEFAULTJERSEYIMGPATH)?.value || null
    }
    teamData = {
      ...teamData,
      image: imageUrl.fullPath,
      imagePath: imageUrl.imagePath,
      jersey: teamJerseyImageData.fullPath,
      jerseyPath: teamJerseyImageData.imagePath,
    }
    const insertTeam = await insertTeamQuery(teamData, fastify, request);
    global.tblTeams.push(insertTeam);
    checkTeam = insertTeam;
  }

  let allPlayers = Object.values(entitySportPlayerResponse).flat();

  if (data?.competitionId && data?.cid) {
    const checkEntitySportAPIEndpoint2 = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionSquadDataByIdFromEntity);
    if (!checkEntitySportAPIEndpoint2.data) {
      throw new Error(checkEntitySportAPIEndpoint2.message);
    }

    const url2 = checkEntitySportAPIEndpoint2.data.replace("{cid}", data.cid);
    const entitySportCompetitionSquad = await callEntitySportAPI(url2, request, fastify);

    let entitySportCompetitionSquadResponse = entitySportCompetitionSquad?.data?.result?.squads;
    if (!entitySportCompetitionSquadResponse) {
      throw new Error("Invalid response from Entit-Sport API");
    }

    const competitionSquadPlayers = entitySportCompetitionSquadResponse.reduce((acc, team) => {
      acc[team.team_id] = team.players || [];
      return acc;
    }, {});
    allPlayers = [...allPlayers, ...competitionSquadPlayers[data.tid]];
  }

  const seen = new Set();
  const uniquePlayers = allPlayers.filter(player => !seen.has(player.pid) && seen.add(player.pid));
  const uniquePlayerIds = uniquePlayers.map(item => item.pid)

  if (data?.competitionId && data?.cid) {
    const playersTpId = global.tblPlayers.filter(item => uniquePlayerIds.includes(item.tpId));
    await addTournamentTeamPlayersService({
      ...request,
      body: {
        teamPlayers: playersTpId,
        competitionId: data?.competitionId,
        teamId: checkTeam.teamId
      },
      userTokenInfo: {
        WrUserId: -2
      }
    }, fastify);
  }

  for (const playerId of uniquePlayerIds) {
    await playerImportService({
      pid: playerId
    }, fastify, request);
  }

  const playersInTeams = await getAllPlayersByTeamIdQuery(checkTeam.teamId, fastify, request);

  for (const playerId of uniquePlayerIds) {
    const teamPlayerData = await playersInTeams.find(item => item.tpId === playerId);
    if (!teamPlayerData) {
      const playerData = global.tblPlayers.find(item => item.tpId === playerId);
      await insertTeamPlayerQuery({
        teamId: checkTeam.teamId,
        refPlayerId: playerData?.playerId,
        tpId: playerId,
        userId: -2,
      }, fastify, request);
      await updateTeamPlayerHomeTeamQuery({
        refPlayerId: playerData?.playerId,
        teamId: checkTeam?.teamId
      }, fastify, request);
    }
  }

  return checkTeam;
}

module.exports = {
  allTeamsService,
  teamByIdService,
  saveTeamService,
  deleteTeamService,
  allteamByEventTypeIdService,
  getTeamPointService,
  mergeTeamJerseyAndPlayerImageService,
  UpdateTeamFromEntityService,
  teamImportService
};
