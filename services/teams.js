const { deleteTeamCompetitionByTeamIdQuery, insertTeamCompetitionQuery } = require("../repository/TableTeamCompetition");
const {
  insertTeamPlayerQuery,
  deleteTeamPlayerByTeamIdQuery,
  getTeamPlayerByTeamIdQuery,
  updateTeamPlayerHomeTeamQuery,
  getHomeTeamPlayerQuery,
  getTeamPlayersByTeamMatchTypeIdQuery,
  insertTeamPlayerWithHomeTeamQuery,
  deleteTeamPlayerByTeamAndPlayerIdQuery,
} = require("../repository/TableTeamPlayer");
const {
  insertTeamQuery,
  updateTeamQuery,
  deleteTeamQuery,
  getAllPlayersByTeamIdQuery,
  getAllCompetitionByTeamIdQuery,
  updateExchangeTeamQuery,
  activeInactiveTeamQuery,
  getTeamPlayersByTeamIdAndMatchTypeIdQuery,
} = require("../repository/TableTeams");
const {
  removeImageFromServer,
  storeImageOnServer,
  generateImageName,
  getImageFromUrl,
} = require("../utilities/Images");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { deletePlayersByTeamIdQuery } = require("../repository/TableTournamentsTeamPlayers")
const { deletePointsByTeamIdQuery } = require("../repository/TableTournmentTeamPoints")
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const { trimTextData, callEntitySportAPI, APIEndpointModuleType, ServiceType, EntityPlayerType, EntityBowlingStyleType, extractBowlingStyle, EventType, RefType, commentaryStatus, callClientAPI, ICCMatchType } = require("../utilities/index");
const { insertPlayerQuery, updateExchangePlayerQuery } = require("../repository/TablePlayer");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { insertAutoImportDataService } = require("./autoImportData");
const { errorLogger } = require("../utilities/logger");
const { upTeamNameInComQuery, updateCommentaryTeamColorQuery } = require("../repository/TableCommentary");
const { playerImageChangeOnClientAPIService, upsertPlayerOnImportService } = require("../services/player");
const { saveTeamMatchTypeByTeamService, deleteTeamMatchTypeByTeamIdService } = require("./teamMatchType");
const { getTeamMatchTypeByTeamQuery } = require("../repository/TableTeamMatchType");
const allTeamsService = async () => {
  return global.tblTeams;
};

const allteamByEventTypeIdService = async (request, fastify) => {
  const { eventTypeId, competitionId } = request.body;
  let result = global.tblTeams;

  if(eventTypeId != undefined && eventTypeId != 0) {
    result = result.filter((item) => item.eventTypeId === eventTypeId);
  } 

  if (competitionId != undefined && competitionId != 0) {
    const competition = global.tblCompetitions.find(cp => cp.competitionId === competitionId);
    if (competition) {
      const commentary = global.tblCommentaries.filter(cm => cm.competitionId === competitionId);
      if (commentary && commentary.length > 0) {
        const commentaryIds = commentary.map(cid => cid.commentaryId);
        if (commentaryIds && commentaryIds.length > 0) {
          const commentaryTeams = global.tblCommentaryTeams.filter(cmt => commentaryIds.includes(cmt.commentaryId));
          if (commentaryTeams && commentaryTeams.length > 0) {
            const commentaryTeamIds = commentaryTeams.map(ctid => ctid.teamId);
            if (commentaryTeamIds && commentaryTeamIds.length > 0) {
              const uniqueCommentaryIds = [...new Set(commentaryTeamIds)];
              result = result.filter(item => uniqueCommentaryIds.includes(item.teamId))
            } else {
              result = [];
            }
          } else {
            result = [];
          }
        } else {
          result = [];
        }
      } else {
        result = [];
      }
    } else {
      throw new Error(`Competition with id ${competitionId} not found`);
    }
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
    const playersInTeams = await getTeamPlayersByTeamIdAndMatchTypeIdQuery({
      ...request,
      body: {
        teamId: teamId,
        matchTypeId: -1
      }
    }, fastify);

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

const upsertPlayerWithMatchTypeService = async (request, fastify) => {
  const entitySocketData = global.tblEntitySockets[0];
  const teamId = request.body.teamId;
  const team = global.tblTeams.find(t => t.teamId === teamId);
  const teamPlayers = await getTeamPlayerByTeamIdQuery(teamId, fastify, request);
  const playerIds = request.body.playerId[0]?.split(',').map(Number);
  const allPlayers = global.tblPlayers.filter(tp => playerIds.includes(tp.playerId));
  const oldPlayerIds = [...new Set(teamPlayers.map(tp => tp.refPlayerId))];
  const newlyAddedPlayerIds = playerIds.filter(pid => !oldPlayerIds.includes(pid));
  const removedPlayerIds = oldPlayerIds.filter(pid => !playerIds.includes(pid));
  for (const playerId of newlyAddedPlayerIds) {
    const player = allPlayers.find(p => p.playerId === playerId);
    if (player) {
      const teamPlayer = teamPlayers.find(tp => tp.refPlayerId === playerId && tp.teamId === teamId);
      await upsertTeamPlayers(teamPlayer, team, player, -1, null, entitySocketData, request, fastify);
    }
  }

  for (const playerId of removedPlayerIds) {
    const removedTeamPlayer = await deleteTeamPlayerByTeamAndPlayerIdQuery(fastify, {
      ...request,
      body: {
        teamId: teamId,
        playerId: playerId
      }
    });
    for (const teamPlayer of removedTeamPlayer?.[0] ?? []) {
      await removeImageFromServer({
        path: teamPlayer.jerseyPlayerImagePath
      });
    }
  }
}

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
    await upsertPlayerWithMatchTypeService(request, fastify);
  }

  // if (request.body.playerId) {
  //   const hashString = request.body.playerId;
  //   if (typeof hashString === "object") {
  //     // Split the string into an array using commas as the delimiter
  //     const jsonString = JSON.stringify(hashString);
  //     // Convert the string back to an array of values
  //     const hashArray = jsonString.split(",");
  //     if (hashArray.length) {
  //       for (let i = 0; i < hashArray.length; i++) {
  //         if (hashArray[i]) {
  //           const playerID = hashArray[i].replace(/[\[\]"]/g, "");
  //           if (playerID !== "") {
  //             const playerTpId = global.tblPlayers.find(elem => elem.playerId == playerID);
  //             const teamPlayerData = await insertTeamPlayerQuery(
  //               {
  //                 teamId: data.teamId,
  //                 refPlayerId: playerID,
  //                 tpId: playerTpId?.tpId ?? null,
  //                 userId: request.userTokenInfo.WrUserId,
  //               },
  //               fastify,
  //               request
  //             );

  //           const playerData = global.tblPlayers.find((item) => item.playerId == playerID);
  //           if(request.body.jersey && playerData.image) {
  //             request.body.playerImage = playerData.image;
  //             request.body.playerId = playerData?.playerId;
  //             request.body.playerName = playerData.playerName;
  //             request.body.teamPlayerId = teamPlayerData.teamPlayerId;
  //             request.body.teamId = data.teamId;
  //             runMergePlayerImageJob(2, request, fastify)
  //               .catch(err => {
  //                 errorLogger(
  //                   fastify,
  //                   err.message,
  //                   "services/teams.js/createTeamService",
  //                   null
  //                 );
  //               });
  //             // mergeAndSaveImage({
  //             //   jersey: request.body.jersey,
  //             //   playerImage: playerData.image,
  //             //   playerName: playerData.playerName,
  //             //   teamName: request.body.teamName,
  //             //   teamPlayerId: teamPlayerData.teamPlayerId,
  //             //   commentaryPlayerId: null,
  //             //   commentaryId: null,
  //             // }, fastify);
  //           }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
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

  let isNameChange = false
  if(trimData.teamName != checkTeamId.teamName){
    isNameChange = true;
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
    isMen: checkTeamId.isMen,
    isInternational: checkTeamId.isInternational
  };

  if ("isMen" in request.body) {
    body.isMen = request.body.isMen === "true";
  }
  if ("isInternational" in request.body) {
    body.isInternational = request.body.isInternational === "true";
  }

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

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "TeamLogoUpadate",
          type: "updateImage",
          data: body
        },
      },
      request,
      fastify
    ).catch((err) => {
      console.log("teamImage update call client api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/team.js/updateTeamService",
        request
      );
    });
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

    const entitySocketData = global.tblEntitySockets[0];
    const teamPlayers = await getTeamPlayerByTeamIdQuery(request.body.teamId, fastify, request);
    const teamMatchTypePlayers = teamPlayers.filter(tp => tp.matchTypeId === -1);
    const allPlayers = global.tblPlayers.filter(tp => teamMatchTypePlayers.map(tmp => tmp.refPlayerId).includes(tp.playerId));
    for (const teamPlayer of teamMatchTypePlayers) {
      const player = allPlayers.find(p => p.playerId === teamPlayer.refPlayerId);
      await upsertTeamPlayers(teamPlayer, body, player, -1, null, entitySocketData, request, fastify);
    }

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.updateSeoModule,
        data: {
          module: "TeamLogoUpadate",
          type: "updateJersey",
          data: body
        },
      },
      request,
      fastify
    ).catch((err) => {
      console.log("teamJersey update call client api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/team.js/updateTeamService",
        request
      );
    });
  }

  await updateTeamQuery(body, fastify, request);

  let newTeamColor = null, newBackgroundColor = null;
  if (request.body.teamColor !== checkTeamId.teamColor) {
    newTeamColor = request.body.teamColor;
  }
  if (request.body.backgroundColor !== checkTeamId.backgroundColor) {
    newBackgroundColor = request.body.backgroundColor;
  }

  if (newTeamColor || newBackgroundColor) {
    const commentaryTeams = global.tblCommentaryTeams.filter(tct => tct.teamId === checkTeamId.teamId);
    const commentaryIds = [...new Set(commentaryTeams.map(item => item.commentaryId))];
    for (const ct of commentaryTeams) {
      const teamIndex = global.tblCommentaryTeams.findIndex(tct => tct.commentaryTeamId === ct.commentaryTeamId);
      if (teamIndex !== -1) {
        const updateCommentaryTeam = await updateCommentaryTeamColorQuery({
          ...request,
          body: {
            teamColor: newTeamColor || checkTeamId.teamColor,
            backgroundColor: newBackgroundColor || checkTeamId.backgroundColor,
            commentaryTeamId: ct.commentaryTeamId
          }
        }, fastify);
        global.tblCommentaryTeams[teamIndex] = updateCommentaryTeam;
      }
    }

    if (commentaryIds.length > 0) {
      const commentaries = global.tblCommentaries.filter(tc => commentaryIds.includes(tc.commentaryId));
      for (const c of commentaryIds) {
        if (
          global?.clientSocketIo !== undefined &&
          global?.clientSocketIo.length > 0
        ) {
          const { commentaryDetailsByEventIdService } = require("./commentry");
          commentaryDetailsByEventIdService(
            {
              ...request,
              body: {
                eventId: commentaries.find(tc => tc.commentaryId === c)?.eventRefId,
                commentaryId: c
              },
            },
            fastify,
            "callFromSocket"
          ).catch((err) => {
            console.log(new Date(), "err in commentaryDetailsByEventIdService", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/teams.js/updateTeamService",
              request
            );
          });
        }
      }
    }
  }

  delete body.userId;

  const index = global.tblTeams.findIndex(
    (item) => item.teamId == request.body.teamId
  );

  global.tblTeams[index] = body;

  if (request.body.playerId) {
    await upsertPlayerWithMatchTypeService(request, fastify);
  }

  // if (request.body.playerId) {
  //   let playerIds = []
  //   const teamPlayersData = await getTeamPlayerByTeamIdQuery(body.teamId, fastify, request);
  //     for (const teamData of teamPlayersData) {
  //       if (teamData?.homeTeam == true) {
  //         playerIds.push(teamData?.refPlayerId)
  //       }
  //     if (teamData && teamData?.jerseyPlayerImage) {
  //       await removeImageFromServer({
  //         path: teamData.jerseyPlayerImage,
  //       });
  //     }
  //   }
  //   await deleteTeamPlayerByTeamIdQuery(body.teamId, fastify, request);

  //   const hashString = request.body.playerId;
  //   // Split the string into an array using commas as the delimiter
  //   const jsonString = JSON.stringify(hashString);
  //   // Convert the string back to an array of values
  //   const hashArray = jsonString.split(",");
  //   if (hashArray.length) {
  //     for (let i = 0; i < hashArray.length; i++) {
  //       if (hashArray[i]) {
  //         const playerID = hashArray[i].replace(/[\[\]"]/g, "");
  //         if (playerID !== "") {
  //           const playerTpId = global.tblPlayers.find(elem => elem.playerId == playerID);
  //           const homeTeam = playerIds.includes(Number(playerID));
  //           const teamPlayerData = await insertTeamPlayerQuery(
  //             {
  //               teamId: body.teamId,
  //               refPlayerId: playerID,
  //               tpId: playerTpId?.tpId ?? null,
  //               userId: request.userTokenInfo.WrUserId,
  //               homeTeam,
  //             },
  //             fastify,
  //             request
  //           );

  //           const playerData = global.tblPlayers.find((item) => item.playerId == playerID);
  //           if(body.jersey && playerData.image) {
  //             request.body.playerImage = playerData.image;
  //             request.body.playerId = playerData?.playerId;
  //             request.body.jersey = body.jersey;
  //             request.body.playerName = playerData.playerName;
  //             request.body.teamName = body.teamName;
  //             request.body.teamPlayerId = teamPlayerData.teamPlayerId;
  //             request.body.teamId = body.teamId;
  //             runMergePlayerImageJob(2, request, fastify)
  //               .catch(err => {
  //                 errorLogger(
  //                   fastify,
  //                   err.message,
  //                   "services/teams.js/createTeamService",
  //                   null
  //                 );
  //               });
  //             // mergeAndSaveImage({
  //             //   jersey: body.jersey,
  //             //   playerImage: playerData.image,
  //             //   playerName: playerData.playerName,
  //             //   teamName: body.teamName,
  //             //   teamPlayerId: teamPlayerData.teamPlayerId,
  //             //   commentaryPlayerId: null,
  //             //   commentaryId: null,
  //             // }, fastify);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
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

  if(isNameChange && isNameChange == true){
     changeInComTeam(global.tblTeams[index],request,fastify)
  }
  return body;
};
const changeInComTeam = async(data,request,fastify)=>{
  try {
      let com = global.tblCommentaries.filter((i)=>i.commentaryStatus != commentaryStatus.COMPLETED && i.commentaryStatus != commentaryStatus.CANCELLED)
      if(com.length == 0){
        return true
      }
      let comIds = com.map((i)=>i.commentaryId)
      // got the comteam where this com and team exist
      let comTeam = global.tblCommentaryTeams.filter((i)=> comIds.includes(i.commentaryId) && i.teamId == data.teamId)
      if(comTeam.length == 0){
        return true;
      }
      let upTeam = await upTeamNameInComQuery({
        teamName : data.teamName,
        commentaryTeamId : comTeam.map((i)=>i.commentaryTeamId)
      },fastify,request)

      for (let c of upTeam){
        let index = global.tblCommentaryTeams.findIndex((i)=>i.commentaryTeamId == c.commentaryTeamId)
        if(index != -1){
          global.tblCommentaryTeams[index].teamName = c.teamName
        }
      }
      return true;


  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "Error --> services/teams.js/changeInComTeam",
      request
    )
    return true;
  }
}
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
  if (request?.body?.teamId?.length > 0) {
    for (const teamId of request?.body?.teamId) {
      await runMergePlayerImageJob(teamId, request, fastify);
    }
  }
  return "Player image(s) and Jersey image(s) merged successfully";
};

const UpdateTeamFromEntityService = async (data, fastify, request) => {
  const checkTeamData = global.tblTeams.find(item => item.tpId === data.tid);
  if (!checkTeamData) {
    errorLogger(fastify, `Team not found. tpId: ${data.tid}`, "/services/teams.js/UpdateTeamFromEntityService - checkTeamData", request);
    return false;
  }

  const url = `/team/${checkTeamData.tpId}/player`;
  const entitySportTeamPlayer = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportTeamPlayer?.data?.result?.items;
  }

  let entitySportTeamPlayerResponse = entitySportTeamPlayer?.data?.result?.items;
  if (!entitySportTeamPlayerResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/teams.js/UpdateTeamFromEntityService - entitySportTeamPlayerResponse", {
      ...request,
      originalUrl: url
    }, entitySportTeamPlayer?.data);
    return false;
  }

  for (const mtId of Object.keys(entitySportTeamPlayerResponse?.players || {})) {
    const matchTypeEnum = ICCMatchType[checkTeamData?.isMen ? "men" : "women"][mtId.toLowerCase()];
    const matchTypeObj = global.tblMatchTypes.find(t => t.entityEnum === matchTypeEnum);
    if (!matchTypeObj) {
      continue;
    }

    const players = entitySportTeamPlayerResponse.players[mtId];
    if (players?.length === 0) {
      continue;
    }

    const entitySocketData = global.tblEntitySockets[0];
    const upsertedPlayers = [];
    for (const player of players) {
      const checkPlayer = await upsertPlayerOnImportService(player, entitySocketData, checkTeamData?.isMen, fastify, request);
      upsertedPlayers.push(checkPlayer);
    }

    if (!checkTeamData?.teamId) {
      continue;
    }

    let teamMatchTypeId = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamId" = ${checkTeamData.teamId} AND ttmt."wrMatchTypeId" = ${matchTypeObj.matchTypeId}`);
    if (!teamMatchTypeId || teamMatchTypeId.length === 0) {
      teamMatchTypeId = await saveTeamMatchTypeByTeamService({
        ...request,
        body: {
          teamId: checkTeamData.teamId,
          matchTypeId: matchTypeObj.matchTypeId
        },
      }, fastify);
    }
    teamMatchTypeId = teamMatchTypeId?.[0] ?? null;

    const teamPlayers = await getTeamPlayersByTeamMatchTypeIdQuery({
      ...request,
      body: {
        teamId: checkTeamData.teamId,
        matchTypeId: matchTypeObj.matchTypeId
      }
    }, fastify);

    for (const player of players) {
      const teamPlayer = teamPlayers.find(tp => tp.tpId === player.pid);
      if (!teamPlayer) {
        const p = upsertedPlayers.find(up => up.tpId === player.pid);
        if (p) {
          const upsertedTeamPlayer = await insertTeamPlayerWithHomeTeamQuery(
            {
              teamId: checkTeamData.teamId,
              refPlayerId: p.playerId,
              tpId: p?.tpId ?? null,
              jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage ?? null,
              jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath ?? null,
              matchTypeId: matchTypeObj.matchTypeId
            },
            fastify,
            request
          );

          if (p?.image && teamMatchTypeId?.teamJerseyImage && upsertedTeamPlayer?.teamPlayerId) {
            try {
              await mergeAndSaveImage({
                playerImage: p.image,
                jersey: teamMatchTypeId.teamJerseyImage,
                playerName: p.playerName,
                teamName: checkTeamData.teamName,
                teamPlayerId: upsertedTeamPlayer?.teamPlayerId,
                commentaryPlayerId: null,
                commentaryId: null,
              }, fastify);
              if (upsertedTeamPlayer?.homeTeam == true) {
                // await playerImageChangeOnClientAPIService(p, fastify);
              }
            } catch (error) {

            }
          }
        }
      }
    }
  }

  return "Team data updated successfully";
};

const teamImportService = async (data, fastify, request = null) => {
  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
  return await insertTeamAndPlayers(data, eventType, request, fastify);
}

const activeInactiveTeamService = async (request, fastify) => {
  const { teamId, isMen, isInternational } = request.body;
  const index = global.tblTeams.findIndex(item => item.teamId === teamId);
  if (index === -1) {
    throw new Error("Team with this id not Found");
  }

  let updateData = {
    ...global.tblTeams[index]
  }

  if ("isMen" in request.body) {
    updateData.isMen = isMen;
  }
  if ("isInternational" in request.body) {
    updateData.isInternational = isInternational;
  }

  const response = await activeInactiveTeamQuery(updateData, request, fastify);
  if (!response || !response[0] || !response[0][0]) {
    throw new Error("Failed to update team data teamId: " + teamId);
  }

  global.tblTeams[index] = response[0][0];

  return `Team data updated successfully`;
};

const runMergePlayerImageJob = async (teamId, request, fastify) => {
  const team = global.tblTeams.find(tp => tp.teamId === teamId);
  if (!team) {
    errorLogger(
      fastify,
      `Team with this id ${teamId} not found`,
      "ERROR --> services/teams.js/runMergePlayerImageJob",
      request
    );
    return true;
  }

  const teamPlayers = await getTeamPlayerByTeamIdQuery(teamId, fastify, request);
  if (teamPlayers?.length < 1) {
    return true;
  }

  const uniqueMatchTypeIds = [...new Set(teamPlayers.map(item => item.matchTypeId))];
  const teamMatchType = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamId" = ${teamId} AND ttmt."wrMatchTypeId" IN (${uniqueMatchTypeIds})`);
  const uniquePlayerIds = [...new Set(teamPlayers.map(item => item.refPlayerId))];
  const players = global.tblPlayers.filter(tp => uniquePlayerIds.includes(tp.playerId));

  for (const teamPlayer of teamPlayers) {
    const player = players.find(p => p.playerId === teamPlayer.refPlayerId);
    if (player || player?.image) {
      let jersey = null;
      if (teamPlayer?.matchTypeId === -1) {
        jersey = team?.jersey;
      } else {
        jersey = teamMatchType?.find(tmt => tmt.teamId === teamPlayer.teamId && tmt.matchTypeId === teamPlayer.matchTypeId)?.teamJerseyImage;
      }

      if (jersey) {
        await mergeAndSaveImage({
          playerImage: player.image,
          jersey: jersey,
          playerName: player.playerName,
          teamName: team.teamName,
          teamPlayerId: teamPlayer.teamPlayerId,
          commentaryPlayerId: null,
          commentaryId: null,
        }, fastify);

        await removeImageFromServer({ path: teamPlayer.jerseyPlayerImage });
      }
    }
  }
};

const insertTeamAndPlayers = async (data, eventType, request, fastify) => {
  const url = `/team/${data.tid}/player`;
  const entitySportTeamPlayers = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportTeamPlayers?.data?.result?.items;
  }

  let entitySportTeamPlayersResponse = entitySportTeamPlayers?.data?.result?.items;
  if (!entitySportTeamPlayersResponse) {
    errorLogger(
      fastify,
      `Invalid response from Entit-Sport API for url ${url}`,
      "/services/teams.js/insertTeamAndPlayers - entitySportTeamPlayersResponse", {
      ...request,
      originalUrl: url
    }, entitySportTeamPlayers?.data);
    return false;
  }

  const teamData = entitySportTeamPlayersResponse?.team;
  const isMen = teamData?.sex === "male";
  const entitySocketData = global.tblEntitySockets[0];

  const checkTeam = await upsertTeamOnImportService(entitySportTeamPlayersResponse?.team, entitySocketData, eventType, fastify, request);

  if (!data?.playerImport) return checkTeam;

  let formatsToProcess = [];

  if (data?.matchTypeId) {
    // Specific match types requested
    for (const mtId of Object.keys(entitySportTeamPlayersResponse?.players || {})) {
      const matchTypeEnum = ICCMatchType[isMen ? "men" : "women"][mtId.toLowerCase()];
      const matchTypeObj = global.tblMatchTypes.find(t => t.entityEnum === matchTypeEnum);
      if (matchTypeObj && data.matchTypeId.includes(matchTypeObj.matchTypeId)) {
        formatsToProcess.push({
          formatKey: mtId,
          matchTypeId: matchTypeObj.matchTypeId,
          players: entitySportTeamPlayersResponse?.players[mtId] || []
        });
      }
    }
  } else {
    // All available formats
    for (const [formatKey, players] of Object.entries(entitySportTeamPlayersResponse?.players || {})) {
      const matchTypeEnum = ICCMatchType[isMen ? "men" : "women"][formatKey.toLowerCase()];
      const matchTypeObj = global.tblMatchTypes.find(t => t.entityEnum === matchTypeEnum);
      if (matchTypeObj && players?.length > 0) {
        formatsToProcess.push({
          formatKey,
          matchTypeId: matchTypeObj.matchTypeId,
          players
        });
      }
    }
  }

  for (const { matchTypeId, players } of formatsToProcess) {
    if (players.length === 0) {
      continue;
    }

    const upsertedPlayers = [];
    for (const player of players) {
      const checkPlayer = await upsertPlayerOnImportService(player, entitySocketData, isMen, fastify, request);
      upsertedPlayers.push(checkPlayer);
    }

    if (!checkTeam?.teamId) {
      continue;
    }

    const teamPlayers = await getTeamPlayerByTeamIdQuery(checkTeam.teamId, fastify, request);
    let teamMatchTypeId = null, matchTypeTeamPlayers = null;
    if (matchTypeId) {
      teamMatchTypeId = await getTeamMatchTypeByTeamQuery(request, fastify, `ttmt."wrTeamId" = ${checkTeam.teamId} AND ttmt."wrMatchTypeId" = ${matchTypeId}`);
      if (!teamMatchTypeId || teamMatchTypeId.length === 0) {
        teamMatchTypeId = await saveTeamMatchTypeByTeamService({
          ...request,
          body: {
            teamId: checkTeam.teamId,
            matchTypeId: matchTypeId
          },
        }, fastify);
      }
      teamMatchTypeId = teamMatchTypeId[0];

      matchTypeTeamPlayers = teamPlayers.filter(tp => tp.matchTypeId === matchTypeId);
    }

    for (const player of players) {
      const p = upsertedPlayers.find(up => up.tpId === player.pid);
      if (p) {
        const teamPlayer = teamPlayers.find(tp => tp.matchTypeId === -1 && tp.tpId === player.pid);
        await upsertTeamPlayers(teamPlayer, checkTeam, p, -1, teamMatchTypeId, entitySocketData, request, fastify);

        if (matchTypeId) {
          const matchTypeTeamPlayer = matchTypeTeamPlayers.find(tp => tp.tpId === p.tpId);
          await upsertTeamPlayers(matchTypeTeamPlayer, checkTeam, p, matchTypeId, teamMatchTypeId, entitySocketData, request, fastify);
        }
      }
    }
  }

  return checkTeam;
}

const upsertTeamOnImportService = async (esTeam, entitySocketData, eventType, fastify, request) => {
  let checkTeam = global.tblTeams.find(item => item.tpId === esTeam?.tid || item.teamName.toLowerCase() === esTeam.title.replace(/'/g, "''").toLowerCase());
  if (!checkTeam) {
    let imageUrl = esTeam?.logo_url;
    if (!imageUrl) {
      imageUrl = {
        fullPath: entitySocketData?.defaultTeamImage || null,
        imagePath: entitySocketData?.defaultTeamImagePath || null
      }
    } else {
      const getImageDataFromUrl = await getImageFromUrl({
        type: ImgModuleConfig.Teams.type,
        imageUrl
      });

      if (getImageDataFromUrl && getImageDataFromUrl.fullPath) {
        imageUrl = getImageDataFromUrl;
      }
    }

    const teamData = {
      teamName: esTeam?.title,
      teamShortName: esTeam?.abbr,
      eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
      userId: -2,
      tpId: esTeam?.tid || null,
      image: imageUrl.fullPath,
      imagePath: imageUrl.imagePath,
      jersey: entitySocketData?.defaultJerseyImage || null,
      jerseyPath: entitySocketData?.defaultJerseyImagePath || null,
      isMen: esTeam?.sex === "male"
    }
    const insertTeam = await insertTeamQuery(teamData, fastify, request);
    global.tblTeams.push(insertTeam);
    checkTeam = insertTeam;
  } else if (checkTeam?.tpId === null || !checkTeam?.tpId || checkTeam?.tpId !== esTeam?.tid) {
    const data = {
      userId: -2,
      tpId: esTeam?.tid || null,
      teamId: checkTeam.teamId
    }
    const updateTeam = await updateExchangeTeamQuery(data, fastify, request);
    let index = global.tblTeams.findIndex((i) => i.teamId == checkTeam.teamId)
    if (index != -1) {
      global.tblTeams[index] = updateTeam[0]
    }
    checkTeam = global.tblTeams[index];
  }
  return checkTeam;
}

const upsertTeamPlayers = async (teamPlayer, team, player, matchTypeId, teamMatchTypeId, entitySocketData, request, fastify) => {
  try {
    const mergeImage = await mergeAndSaveImage({
      playerImage: player?.image,
      jersey: teamMatchTypeId ? teamMatchTypeId?.teamJerseyImage : team?.jersey,
      playerName: player.playerName,
      teamName: team.teamName,
      teamPlayerId: teamPlayer?.teamPlayerId,
      commentaryPlayerId: null,
      commentaryId: null,
    }, fastify);

    if (!teamPlayer) {
      teamPlayer = await insertTeamPlayerWithHomeTeamQuery({
        teamId: team.teamId,
        refPlayerId: player.playerId,
        tpId: player?.tpId ?? null,
        jerseyPlayerImage: mergeImage ? mergeImage.fullPath : entitySocketData?.defaultPlayerJerseyImage,
        jerseyPlayerImagePath: mergeImage ? mergeImage.imagePath : entitySocketData?.defaultPlayerJerseyImagePath,
        matchTypeId: matchTypeId
      }, fastify, request);
    }

    if (teamMatchTypeId && matchTypeId) {
      const competitionStatisticsPlayers = global.tblCompetitionStatistics.filter(tcs => tcs.teamId === team.teamId && tcs.playerId === player.playerId && tcs.matchTypeId === matchTypeId);
      for (const cp of competitionStatisticsPlayers) {
        const index = global.tblCompetitionStatistics.findIndex(tcs => tcs.competitionStatisticsId === cp.competitionStatisticsId);
        if (index !== -1) {
          global.tblCompetitionStatistics[index].jerseyPlayerImage = mergeImage ? mergeImage.fullPath : entitySocketData?.defaultPlayerJerseyImage;
        }
      }
    }

    await playerImageChangeOnClientAPIService(teamPlayer, matchTypeId, fastify);
    return teamPlayer;
  } catch (error) {
    console.log("🚀 ~ upsertTeamPlayers ~ error:", error)
  }
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
  teamImportService,
  activeInactiveTeamService,
  insertTeamAndPlayers,
  upsertTeamOnImportService,
  upsertTeamPlayers
};
