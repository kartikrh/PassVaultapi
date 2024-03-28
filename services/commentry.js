const {
  insertCommentaryQuery,
  insertCommentaryTeams,
  insertCommentaryPlayers,
  updateCommentaryQuery,
  updateCommentaryTeams,
  deleteCommentaryPlayers,
  getCommentaryTeamsQuery,
  getCommentaryPlayersQuery,
  deleteCommentryQuery,
  getCommentaryByIdQuery,
  getAllCommentaryPlayerQuery,
  getAllCommentaryTeamsQuery,
  updateOverQuery,
  createOverQuery,
  updateCommentaryDetailsQuery,
  updateCommentaryTeamsQuery,
  updateCommentaryPlayersQuery,
  createBallByBallCommentoriesQuery,
  updateBallByBallCommentoriesQuery,
  updateCommentaryWicketQuery,
  createCommentaryWicketQuery,
  updateCommentaryPartnershipQuery,
  createCommentaryPartnershipQuery,
  deleteBallByBallCommentoriesQuery,
  deleteOverCommentoriesQuery,
  UpdateCommentaryTimeQuery,
  getCommentaryID_Socket,
  upsertCommentaryPlayers,
  updateCommentaryPlayerIdInCommentaryTeams,
  updateMatchTypeInCommentaryQuery,
  changeBowlerInCommentary,
  getCommentaryBallByBallQuery,
  getCommnertySquadPlayersList,
  updateShowClientQuery,
  updatePlayerShowQuery,
  deleteCommentaryPlayerById,
  getAllCommentaryQuery,
  updateCommentaryStatusQuery,
  updateisPredictMarketInCommentaryQuery,
  getAllCommentaryBallByBallQuery,
  getAllOversQuery,
  getAllCommentaryWicketQuery,
  getAllCommentaryPartnershipQuery,
  saveCommentaryDetailsAPIQuery,
  activeInactiveCommentaryQuery,
  closeCommentaryQuery,
  deleteAllCommentaryQuery,
} = require("../repository/TableCommentary");
const moment = require("moment");
const {
  convertDate,
  wicketType,
  decryptEncryptionId,
  callPredictorMarket,
  EventMarketStatus,
} = require("../utilities");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { handleMarketCloseService } = require("./eventMarket");

const allCommentaryService = async (request, fastify) => {
  // return global.tblCommentaries;
  const { commentaryStatus, eventTypeId, competitionId, startDate, endDate } =
    request.body;
  let result;
  if (commentaryStatus === undefined || commentaryStatus === 0) {
    result = global.tblCommentaries.filter(
      (item) => item.commentaryStatus !== 4
    );
  } else {
    result = global.tblCommentaries.filter(
      (item) => item.commentaryStatus === commentaryStatus
    );
  }
  // if eventTypeId is provided then filter commentary by eventTypeId
  if (eventTypeId) {
    result = result.filter((item) => item.eventTypeId === eventTypeId);
  }

  if (competitionId) {
    result = result.filter((item) => item.competitionId === competitionId);
  }
  // add dateFilter if provided
  if (startDate && endDate) {
    result = result?.filter((item) => {
      return (
        new Date(item.eventDate) >= new Date(startDate) &&
        new Date(item.eventDate) <= new Date(endDate)
      );
    });
  }
  // desc by eventDate
  result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
  return result;
};

const allDisplayStatusService = async () => {
  return global.tblDisplayStatus;
};

const commentaryByIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }

  const commentary = { ...result };

  const team1 = await getCommentaryTeamsQuery(
    { teamId: commentary.team1Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team2 = await getCommentaryTeamsQuery(
    { teamId: commentary.team2Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team1Players = await getCommentaryPlayersQuery(
    { teamId: commentary.team1Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team2Players = await getCommentaryPlayersQuery(
    { teamId: commentary.team2Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  commentary.team1Captain = team1.teamCaptain;
  commentary.team1Kipper = team1.teamKipper;
  commentary.team1Players = team1Players;
  commentary.team2Captain = team2.teamCaptain;
  commentary.team2Kipper = team2.teamKipper;
  commentary.team2Players = team2Players;
  commentary.commentaryId = request.body.commentaryId;

  return commentary;
};

const commentaryDetailsByIdService = async (request, fastify) => {
  let commentary = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const [eventType, competition, matchType] = await Promise.all([
    global.tblEventTypes.find(
      (eventType) => eventType.eventTypeId === commentary.eventTypeId
    ),
    global.tblCompetitions.find(
      (competition) => competition.competitionId === commentary.competitionId
    ),
    global.tblMatchTypes.find(
      (matchType) => matchType.matchTypeId === commentary.matchTypeId
    ),
  ]);
  let dataToreturn = {
    eid: commentary.eventRefId || "",
    ety: eventType?.eventType || "",
    mtyp: commentary.matchType || "",
    com: competition?.competition || "",
    en: commentary.eventName || "",
    ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
    cci: commentary.currentInnings,
  };

  const commentaryTeams = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryPlayers = await global.tblCommentaryPlayers.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryOvers = await global.tblOvers.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  // const commentaryBallByBall = await global.tblCommentaryBallByBall.filter(
  //   (item) => item.commentaryId === request.body.commentaryId
  // );
  const commentaryBallByBall = await getCommentaryBallByBallQuery(
    request,
    fastify
  );

  const commentaryWicket = await global.tblCommentaryWicket.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryPartnership = await global.tblCommentaryPartnership.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryDisplayStatus = await global.tblDisplayStatus.filter(
    (item) => item.displayStatusId !== 0
  );

  const allDetails = {
    commentaryDetails: { ...commentary, ...dataToreturn },
    matchTypeDetails: matchType,
    commentaryTeams,
    commentaryPlayers,
    commentaryOvers,
    commentaryBallByBall,
    commentaryWicket,
    commentaryPartnership,
    commentaryDisplayStatus,
  };

  if (commentary.isPredictMarket == true && (commentary.commentaryStatus == 2 || commentary.commentaryStatus == 3)) {
    callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        match_type_id: commentary.matchTypeId,
        event_id: commentary.eventRefId,
      },
      "/api/loadcommentary",
      fastify,
      request
    );
  }

  return allDetails;
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

  if (
    request.body.team1Id &&
    request.body.team2Id &&
    request.body.team1Id === request.body.team2Id
  ) {
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

  if (request.body.team1Captain) {
    const validateTeam1Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team1Captain
    );

    if (!validateTeam1Captain) {
      throw new Error("Team1Captain with this id not Found");
    }
  }

  if (request.body.team2Captain) {
    const validateTeam2Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team2Captain
    );

    if (!validateTeam2Captain) {
      throw new Error("Team2Captain with this id not Found");
    }
  }

  // check if captain and kipper is in player list
  let allPlayers = [...request.body.team1Players, ...request.body.team2Players];
  let captainsAndKippers = [
    request.body.team1Captain,
    request.body.team1Kipper,
    request.body.team2Captain,
    request.body.team2Kipper,
  ];

  let check = captainsAndKippers.filter((item) => !allPlayers.includes(item));
  if (check.length > 0) {
    throw new Error(`Captain and Kipper must be in the player list.`);
  }
  const addCommentry = await insertCommentaryQuery(request, fastify);
  request.body.commentaryId = addCommentry.commentaryId;

  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  let commentaryPlayerId = {
    commentaryId: request.body.commentaryId,
    team1Id: request.body.team1Id,
    team2Id: request.body.team2Id,
  };

  // if addSystemPlayer is true then add system player in commentary
  if (request.body.addSystemPlayer && request.body.systemPlayerCount > 0) {
    let systemPlayerArr = global.tblPlayers
      .filter((item) => item.isSystemPlayer === true)
      .map((item) => item.playerId);
    if (systemPlayerArr.length > 0) {
      let [team1Players, team2Players] = [
        systemPlayerArr.slice(0, request.body.systemPlayerCount),
        systemPlayerArr.slice(
          request.body.systemPlayerCount,
          request.body.systemPlayerCount * 2
        ),
      ];

      request.body.team1Players.push(...team1Players);
      request.body.team2Players.push(...team2Players);
    }
  }

  if (validateMatchTypeId) {
    if (
      validateMatchTypeId?.noOfIningsPerSide &&
      validateMatchTypeId?.noOfIningsPerSide > 1
    ) {
      const TotalInnning = validateMatchTypeId?.noOfIningsPerSide;
      for (let i = 0; i < TotalInnning; i++) {
        request.body.currentInnings = i + 1;
        await insertCommentaryTeams(request, fastify);
        const data = [
          ...request.body.team1Players.map((item, i) => {
            return {
              commentaryId: addCommentry.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            return {
              commentaryId: addCommentry.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
        ];
        for (let info of data) {
          let playerData = await insertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );

          if (info.playerId === request.body.team1Captain) {
            commentaryPlayerId.team1Captain = playerData[0].commentaryPlayerId;
          }
          if (info.playerId === request.body.team1Kipper) {
            commentaryPlayerId.team1Kipper = playerData[0].commentaryPlayerId;
          }
          if (info.playerId === request.body.team2Captain) {
            commentaryPlayerId.team2Captain = playerData[0].commentaryPlayerId;
          }
          if (info.playerId === request.body.team2Kipper) {
            commentaryPlayerId.team2Kipper = playerData[0].commentaryPlayerId;
          }
        }
        await updateCommentaryPlayerIdInCommentaryTeams(
          {
            ...commentaryPlayerId,
            currentInnings: request.body.currentInnings,
          },
          fastify,
          request
        );
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
      await insertCommentaryTeams(request, fastify);

      const data = [
        ...request.body.team1Players.map((item, i) => {
          return {
            commentaryId: addCommentry.commentaryId,
            teamId: request.body.team1Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
        ...request.body.team2Players.map((item, i) => {
          return {
            commentaryId: addCommentry.commentaryId,
            teamId: request.body.team2Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
      ];
      for (let info of data) {
        let playerData = await insertCommentaryPlayers(
          info,
          currentinning,
          fastify,
          request
        );
        if (info.playerId === request.body.team1Captain) {
          commentaryPlayerId.team1Captain = playerData[0].commentaryPlayerId;
        }
        if (info.playerId === request.body.team1Kipper) {
          commentaryPlayerId.team1Kipper = playerData[0].commentaryPlayerId;
        }
        if (info.playerId === request.body.team2Captain) {
          commentaryPlayerId.team2Captain = playerData[0].commentaryPlayerId;
        }
        if (info.playerId === request.body.team2Kipper) {
          commentaryPlayerId.team2Kipper = playerData[0].commentaryPlayerId;
        }
      }
      await updateCommentaryPlayerIdInCommentaryTeams(
        { ...commentaryPlayerId, currentInnings: request.body.currentInnings },
        fastify,
        request
      );
    }
  }

  global.tblCommentaries.push(addCommentry);
  global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

  // call predictor market
  if (addCommentry.isPredictMarket == true) {
    callPredictorMarket(
      {
        commentary_id: addCommentry.commentaryId,
        match_type_id: addCommentry.matchTypeId,
        event_id: addCommentry.eventRefId,
      },
      "/api/loadcommentary",
      fastify,
      request
    );
  }

  return addCommentry;
};

const updateCommentaryService = async (request, fastify) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

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

  if (request.body.team1Captain) {
    const validateTeam1Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team1Captain
    );

    if (!validateTeam1Captain) {
      throw new Error("Team1Captain with this id not Found");
    }
  }

  if (request.body.team2Captain) {
    const validateTeam2Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team2Captain
    );

    if (!validateTeam2Captain) {
      throw new Error("Team2Captain with this id not Found");
    }
  }

  if (request.body.matchTypeId !== global.tblCommentaries[index].matchTypeId) {
    request.body.matchTypeId = global.tblCommentaries[index].matchTypeId;
  }
  await updateCommentaryQuery(request, fastify);
  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if (validateMatchTypeId) {
    if (
      validateMatchTypeId?.noOfIningsPerSide &&
      validateMatchTypeId?.noOfIningsPerSide > 1
    ) {
      const TotalInnning = validateMatchTypeId?.noOfIningsPerSide;
      for (let i = 0; i < TotalInnning; i++) {
        request.body.currentInnings = i + 1;
        await updateCommentaryTeams(request, fastify, {
          teamCaptain: request.body.team1Captain,
          teamKipper: request.body.team1Kipper,
          teamId: request.body.team1Id,
          commentaryId: request.body.commentaryId,
          currentInnings: request.body.currentInnings,
        });
        await updateCommentaryTeams(request, fastify, {
          teamCaptain: request.body.team2Captain,
          teamKipper: request.body.team2Kipper,
          teamId: request.body.team2Id,
          commentaryId: request.body.commentaryId,
          currentInnings: request.body.currentInnings,
        });

        // await deleteCommentaryPlayers(request, fastify);

        const data = [
          ...request.body.team1Players.map((item, i) => {
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
        ];
        for (let info of data) {
          // await insertCommentaryPlayers(
          //   info,
          //   request.body.currentInnings,
          //   fastify,
          //   request
          // );
          await upsertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );
        }
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
      await updateCommentaryTeams(request, fastify, {
        teamCaptain: request.body.team1Captain,
        teamKipper: request.body.team1Kipper,
        teamId: request.body.team1Id,
        commentaryId: request.body.commentaryId,
        currentInnings: request.body.currentInnings,
      });
      await updateCommentaryTeams(request, fastify, {
        teamCaptain: request.body.team2Captain,
        teamKipper: request.body.team2Kipper,
        teamId: request.body.team2Id,
        commentaryId: request.body.commentaryId,
        currentInnings: request.body.currentInnings,
      });

      // await deleteCommentaryPlayers(request, fastify);

      const data = [
        ...request.body.team1Players.map((item, i) => {
          return {
            commentaryId: request.body.commentaryId,
            teamId: request.body.team1Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
        ...request.body.team2Players.map((item, i) => {
          return {
            commentaryId: request.body.commentaryId,
            teamId: request.body.team2Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
      ];
      for (let info of data) {
        // await insertCommentaryPlayers(info, currentinning, fastify, request);
        await upsertCommentaryPlayers(
          info,
          request.body.currentInnings,
          fastify,
          request
        );
      }
    }
  }

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

  return updatedData;
};

const saveCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  if (commentaryId === 0) {
    return await createCommentaryService(request, fastify);
  } else {
    return await updateCommentaryService(request, fastify);
  }
};

const cloneCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const originalCommentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );

  if (!originalCommentary) {
    throw new Error("Commentary with this id not Found");
  }

  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === originalCommentary.matchTypeId
  );

  const team1 = await getCommentaryTeamsQuery(
    { teamId: originalCommentary.team1Id, commentaryId },
    fastify,
    request
  );

  const team2 = await getCommentaryTeamsQuery(
    { teamId: originalCommentary.team2Id, commentaryId },
    fastify,
    request
  );

  const team1Players = await getCommentaryPlayersQuery(
    { teamId: originalCommentary.team1Id, commentaryId },
    fastify,
    request
  );

  const team2Players = await getCommentaryPlayersQuery(
    { teamId: originalCommentary.team2Id, commentaryId },
    fastify,
    request
  );

  request.body = {
    ...originalCommentary,
    ...request.body,
  };

  const newCommentary = await insertCommentaryQuery(request, fastify);

  const filterOutUniquePlayerId = (teamPlayers) =>
    teamPlayers
      .map((player) => player.playerId)
      .filter((value, index, self) => self.indexOf(value) === index);

  request.body = {
    ...request.body,
    ...newCommentary,
    team1Captain: team1.teamCaptain,
    team1Kipper: team1.teamKipper,
    team1Players: filterOutUniquePlayerId(team1Players),
    team2Captain: team2.teamCaptain,
    team2Kipper: team2.teamKipper,
    team2Players: filterOutUniquePlayerId(team2Players),
  };

  if (validateMatchTypeId) {
    let commentaryPlayer = {
      commentaryId: newCommentary.commentaryId,
      team1Id: request.body.team1Id,
      team2Id: request.body.team2Id,
    };
    if (
      validateMatchTypeId?.noOfIningsPerSide &&
      validateMatchTypeId?.noOfIningsPerSide > 1
    ) {
      const TotalInnning = validateMatchTypeId?.noOfIningsPerSide;
      for (let i = 0; i < TotalInnning; i++) {
        const currentInning = i + 1;
        request.body.currentInnings = currentInning;
        await insertCommentaryTeams(request, fastify);
        const data = [
          ...request.body.team1Players.map((item, i) => {
            return {
              commentaryId: newCommentary.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            return {
              commentaryId: newCommentary.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              displayOrder: i + 1,
            };
          }),
        ];
        for (let info of data) {
          let playerData = await insertCommentaryPlayers(
            info,
            currentInning,
            fastify,
            request
          );
          if (playerData[0].playerId === request.body.team1Captain) {
            commentaryPlayer.team1Captain = playerData[0].commentaryPlayerId;
          }
          if (playerData[0].playerId === request.body.team1Kipper) {
            commentaryPlayer.team1Kipper = playerData[0].commentaryPlayerId;
          }
          if (playerData[0].playerId === request.body.team2Captain) {
            commentaryPlayer.team2Captain = playerData[0].commentaryPlayerId;
          }
          if (playerData[0].playerId === request.body.team2Kipper) {
            commentaryPlayer.team2Kipper = playerData[0].commentaryPlayerId;
          }
        }
        await updateCommentaryPlayerIdInCommentaryTeams(
          { ...commentaryPlayer, currentInnings: request.body.currentInnings },
          fastify,
          request
        );
      }
    } else {
      const currentInning = 1;
      request.body.currentInnings = currentInning;
      await insertCommentaryTeams(request, fastify);

      const data = [
        ...request.body.team1Players.map((item, i) => {
          return {
            commentaryId: newCommentary.commentaryId,
            teamId: request.body.team1Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
        ...request.body.team2Players.map((item, i) => {
          return {
            commentaryId: newCommentary.commentaryId,
            teamId: request.body.team2Id,
            playerId: item,
            displayOrder: i + 1,
          };
        }),
      ];
      for (let info of data) {
        let palyerData = await insertCommentaryPlayers(
          info,
          currentInning,
          fastify,
          request
        );
        if (palyerData[0].playerId === request.body.team1Captain) {
          commentaryPlayer.team1Captain = palyerData[0].commentaryPlayerId;
        }
        if (palyerData[0].playerId === request.body.team1Kipper) {
          commentaryPlayer.team1Kipper = palyerData[0].commentaryPlayerId;
        }
        if (palyerData[0].playerId === request.body.team2Captain) {
          commentaryPlayer.team2Captain = palyerData[0].commentaryPlayerId;
        }
        if (palyerData[0].playerId === request.body.team2Kipper) {
          commentaryPlayer.team2Kipper = palyerData[0].commentaryPlayerId;
        }
      }
      await updateCommentaryPlayerIdInCommentaryTeams(
        { ...commentaryPlayer, currentInnings: request.body.currentInnings },
        fastify,
        request
      );
    }
  }
  global.tblCommentaries.push(newCommentary);
  global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

  // if (newCommentary.isPredictMarket == true) {
  //   callPredictorMarket(
  //     {
  //       commentary_id: newCommentary.commentaryId,
  //       match_type_id: newCommentary.matchTypeId,
  //       event_id: newCommentary.eventRefId,
  //     },
  //     "/api/loadcommentary",
  //     fastify,
  //     request
  //   );
  // }

  return newCommentary;
};

const loadMultiCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  for (const currId of commentaryId) {
    const originalCommentary = global.tblCommentaries.find(
      (item) => item.commentaryId === currId
    );

    if (!originalCommentary) {
      throw new Error("Commentary with this id not Found");
    } 
    if(originalCommentary.isPredictMarket == true  && (originalCommentary.commentaryStatus == 2 || originalCommentary.commentaryStatus == 3)){
      callPredictorMarket(
        {
          commentary_id: originalCommentary.commentaryId,
          match_type_id: originalCommentary.matchTypeId,
          event_id: originalCommentary.eventRefId,
        },
        "/api/loadcommentary",
        fastify,
        request
      );
    }
    
  }
  return `Commentaries loaded successfully`;
};

const deleteCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  for (const commentary of commentaryId) {
    await deleteCommentryQuery(commentary, request, fastify);
  }

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item.commentaryId)
  );

  return `Commentaries deleted successfully`;
};

//update commentary details according to new flow
// const saveCommentaryDetailsService = async (request, fastify) => {
//   const {
//     commentaryDetails,
//     commentaryTeams,
//     commentaryPlayers,
//     commentaryOvers,
//     commentaryBallByBall,
//     commentaryWicket,
//     commentaryPartnership,
//   } = request.body;

//   let response = {};
//   let _CommentaryId = "";
//   //Get Commentry ID
//   if (commentaryDetails) {
//     _CommentaryId = commentaryDetails.commentaryId;
//   }
//   //end here Commenrtyid
//   if (commentaryDetails) {
//     await updateCommentaryDetailsServices(commentaryDetails, fastify, request);
//   }

//   if (commentaryTeams && commentaryTeams.length) {
//     for (const team of commentaryTeams) {
//       await updateCommentaryTeamsServices(team, fastify, request);
//     }
//   }

//   if (commentaryPlayers && commentaryPlayers.length) {
//     for (const player of commentaryPlayers) {
//       await updateCommentaryPlayerDetailsServices(player, fastify, request);
//     }
//   }

//   if (commentaryOvers) {
//     response.overdetails = await saveOverService(
//       commentaryOvers,
//       fastify,
//       request
//     );
//   }

//   if (commentaryBallByBall) {
//     response.commentaryBallByBallDetails = await ballByBallCommentoriesService(
//       commentaryBallByBall,
//       fastify,
//       request
//     );
//   }

//   if (commentaryWicket) {
//     response.commentaryWicketDetails = await saveCommentaryWicketService(
//       commentaryWicket,
//       fastify,
//       request
//     );
//   }

//   if (commentaryPartnership) {
//     response.commentaryPartnershipDetails =
//       await saveCommentaryPartnershipService(
//         commentaryPartnership,
//         fastify,
//         request
//       );
//   }
//   if (_CommentaryId) {
//     const _id = {
//       commentaryId: _CommentaryId,
//     };
//     await UpdateCommentaryTime(_id, fastify, request);
//   }
//   if (Object.keys(response).length) {
//     return response;
//   } else {
//     return true;
//   }
// };
const saveCommentaryDetailsService = async (request, fastify) => {
  const {
    commentaryDetails,
    commentaryTeams,
    commentaryPlayers,
    commentaryOvers,
    commentaryBallByBall,
    commentaryWicket,
    commentaryPartnership,
  } = request.body;

  let response = {};
  let promises = [];
  let _CommentaryId = "";
  //Get Commentry ID
  if (commentaryDetails) {
    _CommentaryId = commentaryDetails.commentaryId;
  }
  //end here Commenrtyid
  if (commentaryDetails) {
    await updateCommentaryDetailsServices(commentaryDetails, fastify, request);
  }

  // Update Commentary Teams
  if (commentaryTeams) {
    commentaryTeams?.forEach((team) => {
      promises.push(updateCommentaryTeamsServices(team, fastify, request));
    });
  }
  // Update Commentary Players
  if (commentaryPlayers) {
    commentaryPlayers?.forEach((player) => {
      promises.push(
        updateCommentaryPlayerDetailsServices(player, fastify, request)
      );
    });
  }
  commentaryOvers &&
    promises.push(saveOverService(commentaryOvers, fastify, request));

  let savecommentaryBallByBall, savecommentaryWicket, savecommentaryPartnership;
  if (commentaryWicket) {
    // first create ball by ball commentary
    savecommentaryBallByBall = await ballByBallCommentoriesService(
      commentaryBallByBall,
      fastify,
      request
    );
    savecommentaryPartnership = await saveCommentaryPartnershipService(
      {
        ...commentaryPartnership,
        commentaryBallByBallId:
          savecommentaryBallByBall.value.commentaryBallByBallId,
      },
      fastify,
      request
    );
    savecommentaryWicket = await saveCommentaryWicketService(
      {
        ...commentaryWicket,
        commentaryBallByBallId:
          savecommentaryBallByBall.value.commentaryBallByBallId,
      },
      fastify,
      request
    );

    commentaryDetails &&
      promises.push(
        updateCommentaryDetailsServices(commentaryDetails, fastify, request)
      );
    return Promise.all(promises).then((results) => {
      results.forEach((result) => {
        // console.log(result);
        if (result) {
          result["name"] && (response[result.name] = result.value);
        }
        response.commentaryBallByBallDetails = savecommentaryBallByBall.value;
        response.commentaryWicketDetails = savecommentaryWicket.value;
        response.commentaryPartnershipDetails = savecommentaryPartnership.value;
      });
      return Object.keys(response).length ? response : true;
    });
  }
  commentaryBallByBall &&
    promises.push(
      ballByBallCommentoriesService(commentaryBallByBall, fastify, request)
    );
  commentaryWicket &&
    promises.push(
      saveCommentaryWicketService(commentaryWicket, fastify, request)
    );
  commentaryPartnership &&
    promises.push(
      saveCommentaryPartnershipService(commentaryPartnership, fastify, request)
    );
  commentaryDetails &&
    promises.push(
      updateCommentaryDetailsServices(commentaryDetails, fastify, request)
    );
  return Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        // console.log(result);
        if (result) {
          result["name"] && (response[result.name] = result.value);
        }
      });
      return Object.keys(response).length ? response : true;
    })

    .catch((error) => {
      throw error; // Propagate the error
    });
};

const testStoreProcedureService = async (request, fastify) => {
  // check sp
  try {
    const {
      commentaryTeams,
      commentaryPlayers,
      commentaryOvers,
      commentaryBallByBall,
      commentaryWicket,
      commentaryPartnership,
      commentaryDetails,
      deleteCommentaryBallByBallId,
      deleteOverId,
      commentaryId,
    } = request.body;

    let commentaryIndex,
      overIndex,
      ballByBallIndex,
      wicketIndex,
      partnershipIndex;

    let commentaryData;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
    }

    let previousCommentaryStatus, statusToUpdate;
    // validate CommentaryId
    if (commentaryDetails) {
      commentaryIndex = global.tblCommentaries.findIndex(
        (item) => item.commentaryId === commentaryDetails.commentaryId
      );
      if (commentaryIndex === -1) {
        throw new Error("Commentary with this id not Found");
      }
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
    }
    // check if delete ballByBall
    if (deleteCommentaryBallByBallId) {
      let deleteBallIndex = global.tblCommentaryBallByBall.findIndex(
        (item) => item.commentaryBallByBallId === deleteCommentaryBallByBallId
      );
      if (deleteBallIndex === -1) {
        throw new Error("Delete BallByBall with this id not Found");
      }
    }
    if (deleteOverId) {
      let deleteOverIndex = global.tblOvers.findIndex(
        (item) => item.overId === deleteOverId
      );
      if (deleteOverIndex === -1) {
        throw new Error("Delete Over with this id not Found");
      }
    }
    // validate commentaryTeams
    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      });
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        if (index === -1) {
          throw new Error("Commentary Player with this id not Found");
        }
      });
    }
    //validate over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        overIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryOvers.commentaryId
        );

        if (overIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
        const indexTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId
        );

        if (indexTeam === -1) {
          throw new Error("Team with this id not Found");
        }
        const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
          return (
            item.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId &&
            item.commentaryPlayerId === commentaryOvers.bowlerId
          );
        });

        if (indexBowler === -1) {
          throw new Error("Bowler with this id not Found");
        }
      } else {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
        if (overIndex === -1) {
          throw new Error("Over with this id not Found");
        }
      }
    }
    //validate ballByBall
    if (commentaryBallByBall) {
      if (commentaryBallByBall.commentaryBallByBallId == 0) {
        ballByBallIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryBallByBall.commentaryId
        );
        if (ballByBallIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ===
            commentaryBallByBall.commentaryBallByBallId
        );
        if (ballByBallIndex === -1) {
          throw new Error("BallByBall with this id not Found");
        }
      }
    }
    //validate wicket
    if (commentaryWicket) {
      if (commentaryWicket.commentaryWicketId == 0) {
        wicketIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryWicket.commentaryId
        );
        if (wicketIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId === commentaryWicket.commentaryWicketId
        );
        if (wicketIndex === -1) {
          throw new Error("Wicket with this id not Found");
        }
      }
    }
    //validate partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        partnershipIndex = global.tblCommentaries.findIndex(
          (item) => item.commentaryId === commentaryPartnership.commentaryId
        );
        if (partnershipIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_setcommentary(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13,$14 ,$15
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? commentaryOvers : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryWicket ? JSON.stringify(commentaryWicket) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          deleteCommentaryBallByBallId ? deleteCommentaryBallByBallId : null,
          deleteOverId ? deleteOverId : null,
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          null, // commentaryWicketDetails,
          null, // commentaryPartnershipDetails,
          null, // commentaryDetailsDetails,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // if got object then push in global obj else update the global
    updatedData = updatedData[0];
    const response = {};

    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = commentaryDetails;
      response.commentaryDetails = commentaryDetails;
    }
    if (deleteCommentaryBallByBallId) {
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
    }
    if (deleteOverId) {
      global.tblOvers = global.tblOvers.filter(
        (item) => item.overId !== deleteOverId
      );
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.overId !== deleteOverId
      );
    }

    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = team;
      });
    }
    if (commentaryPlayers) {
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        global.tblCommentaryPlayers[index] = player;
      });
    }
    if (commentaryOvers) {
      if (updatedData.overDetails) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
      } else {
        global.tblOvers[overIndex] = commentaryOvers;
        response.overdetails = commentaryOvers;
      }
    }
    if (commentaryBallByBall) {
      if (updatedData.commentaryBallByBallDetails) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;
        // call the predictor market
        if (
          commentaryData.isPredictMarket &&
          updatedData.commentaryBallByBallDetails.ballType > 0
        ) {
          let strikeTeam = global.tblCommentaryTeams.find(
            (item) =>
              item.commentaryId === commentaryBallByBall.commentaryId &&
              item.teamStatus === 1
          );
          callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: commentaryBallByBall.overCount,
              run: commentaryBallByBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
            },
            "/api/predictscore",
            fastify,
            request
          );
        }
      } else {
        global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
        response.commentaryBallByBallDetails = commentaryBallByBall;
      }
    }
    if (commentaryWicket) {
      if (updatedData.commentaryWicketDetails) {
        global.tblCommentaryWicket.push(updatedData.commentaryWicketDetails);
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
      } else {
        global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
        response.commentaryWicketDetails = commentaryWicket;
      }
    }
    if (commentaryPartnership) {
      if (updatedData.commentaryPartnershipDetails) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          commentaryPartnership;
        response.commentaryPartnershipDetails = commentaryPartnership;
      }
    }
    if (deleteCommentaryBallByBallId) {
      response.deleteCommentaryBallByBallId = true;
    }
    if (deleteOverId) {
      response.deleteOverId = true;
    }
    if (
      commentaryDetails &&
      commentaryData.isPredictMarket == true &&
      previousCommentaryStatus == 1 &&
      statusToUpdate == 2
    ) {
      handleMarketCloseService(
        {
          commentaryId: commentaryDetails.commentaryId,
          inningsId: commentaryDetails.currentInnings,
        },
        request,
        fastify
      );

      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
          match_type_id: commentaryDetails.matchTypeId,
          event_id: commentaryDetails.eventRefId,
        },
        "/api/loadcommentary",
        fastify,
        request
      );
    }

    if(commentaryDetails && commentaryData.isPredictMarket == true && statusToUpdate == 4){
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId
        },
        "/api/endcommentary",
        fastify,
        request
      );
    }

   
    // which i get from request i want to return only that object
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getTeamAndPlayerListService = async (request, fastify) => {
  // get commentary details
  let commentaryDetails = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not Found");
  }
  // get unique team id from commentary teams
  const arrOfTeamId = [];
  let commentaryTeams = await global.tblCommentaryTeams
    .filter((item) => item.commentaryId === request.body.commentaryId)
    .reduce((acc, curr) => {
      if (!acc.find((team) => team.teamId === curr.teamId)) {
        arrOfTeamId.push(curr.teamId);
        acc.push({
          teamId: curr.teamId,
          teamName: curr.teamName,
          shortName: curr.shortName,
        });
      }
      return acc;
    }, []);

  // get unique player id from commentary players for this teamId

  // find teamPlayer for each team
  for (team of arrOfTeamId) {
    let commentaryTeamPlayers = await global.tblCommentaryPlayers
      .filter(
        (item) =>
          item.commentaryId === request.body.commentaryId &&
          item.teamId === team
      )
      .reduce((acc, curr) => {
        if (!acc.find((player) => player.playerId === curr.playerId)) {
          acc.push({
            teamId: curr.teamId,
            playerId: curr.playerId,
            playerName: curr.playerName,
            commentaryPlayerId: curr.commentaryPlayerId,
          });
        }
        return acc;
      }, []);

    // remove the systemPlayers from commentaryTeamPlayers
    const systemPlayer = global.tblPlayers
      .filter((item) => item.isSystemPlayer === true)
      .map((item) => item.playerId);
    commentaryTeamPlayers = commentaryTeamPlayers.filter(
      (item) => !systemPlayer.includes(item.playerId)
    );
    let index = commentaryTeams.findIndex((item) => item.teamId === team);
    commentaryTeams[index].commentaryTeamPlayers = commentaryTeamPlayers;

    //all players for this team from tblTeamPlayers
    let teamPlayers = await getAllPlayersByTeamIdQuery(team, fastify, request);
    commentaryTeams[index].teamPlayers = teamPlayers;
  }

  return {
    commentaryDetails,
    commentaryTeams,
  };
};
const addTeamPlayerService = async (request, fastify) => {
  // validate commentaryId
  const { teamId, commentaryId, playerId } = request.body;
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // validate teamId
  let commentaryTeamIndex = global.tblCommentaryTeams.find(
    (item) => item.commentaryId === commentaryId && item.teamId === teamId
  );
  if (commentaryTeamIndex === -1) {
    throw new Error("Team with this id not Found");
  }
  // validate playerId
  let commentaryPlayerIndex = global.tblPlayers.findIndex(
    (item) => item.playerId === playerId
  );
  if (commentaryPlayerIndex === -1) {
    throw new Error("Player with this id not Found");
  }
  // find the max displayOrder for this teamId
  let maxDisplayOrder = 0;
  let commentaryPlayer = global.tblCommentaryPlayers.filter(
    (item) => item.commentaryId === commentaryId && item.teamId === teamId
  );
  if (commentaryPlayer.length) {
    maxDisplayOrder = Math.max(
      ...commentaryPlayer.map((item) => item.displayOrder)
    );
  }
  // insert the new player as per inning
  // get total inning for this match
  let matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === commentary.matchTypeId
  );

  const totalInning = matchType?.noOfIningsPerSide;

  for (let i = 0; i < totalInning; i++) {
    const currentInning = i + 1;
    await insertCommentaryPlayers(
      {
        commentaryId,
        teamId,
        playerId,
        displayOrder: maxDisplayOrder + 1,
      },
      currentInning,
      fastify,
      request
    );
  }

  global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);

  return "Player added successfully";
};
// const getshortService = async (request, fastify) => {
//   // get commentary details
//   let commentaryDetails =  global.tblCommentaries.find(
//     (item) => item.commentaryId === request.body.commentaryId
//   );
//   const teamPlayers = global.tblCommentaryPlayers.filter(
//     (item) => item.commentaryId === request.body.commentaryId
//     && item.currentInnings == 2
//   );
//   const commentaryTeams = global.tblCommentaryTeams.filter(
//     (item) => item.commentaryId === request.body.commentaryId
//     && item.currentInnings == 2
//   );
//   return {
//     commentaryDetails,
//     teamPlayers,
//     commentaryTeams
//   }
// }
const deleteTeamPlayerService = async (request, fastify) => {
  // validate commentaryId
  const { teamId, commentaryId, playerId } = request.body;
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // validate teamId
  let commentaryTeamIndex = global.tblCommentaryTeams.find(
    (item) => item.commentaryId === commentaryId && item.teamId === teamId
  );
  if (commentaryTeamIndex === -1) {
    throw new Error("Team with this id not Found");
  }
  // validate playerId
  let commentaryPlayerIndex = global.tblCommentaryPlayers.findIndex(
    (item) => item.playerId === playerId
  );
  if (commentaryPlayerIndex === -1) {
    throw new Error("Commentary Player with this id not Found");
  }

  // delete the player from commentaryPlayer
  await deleteCommentaryPlayerById(
    {
      commentaryId,
      teamId,
      playerId,
    },
    request,
    fastify
  );

  global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
    (item) =>
      !(
        item.commentaryId === commentaryId &&
        item.teamId === teamId &&
        item.playerId === playerId
      )
  );

  return "Player deleted successfully";
};
const loadTeamPlayerService = async (request, fastify) => {
  // validate teamId
  const { teamId } = request.body;
  let team = global.tblTeams.find((item) => item.teamId === teamId);
  if (!team) {
    throw new Error("Team with this id not Found");
  }
  // get all players for this team
  let teamPlayers = await getAllPlayersByTeamIdQuery(teamId, fastify, request);
  return teamPlayers;
};
const saveShortCommentaryService = async (request, fastify) => {
  try {
    // const { commentaryDetails, ...rest } = request.body;
    // let teamArr = [];
    // let teamPlayerArr = [];
    // for (let key in rest) {
    //   const { teamPlayers, ...rest1 } = rest[key];
    //   teamArr.push(rest1);
    //   teamPlayerArr.push(...teamPlayers);
    // }
    const { commentaryDetails, commentaryTeams, commentaryPlayers } =
      request.body;
    // validate commentaryId
    let commentaryIndex = global.tblCommentaries.findIndex(
      (item) => item.commentaryId === commentaryDetails.commentaryId
    );
    if (commentaryIndex === -1) {
      throw new Error("Commentary with this id not Found");
    }

    //save details in commentary
    const a = await fastify.db.query(
      `CALL proc_save_shortCommentary(
      $1, $2, $3
    )`,
      {
        bind: [
          JSON.stringify(commentaryDetails) || null,
          JSON.stringify(commentaryTeams) || null,
          JSON.stringify(commentaryPlayers) || null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    global.tblCommentaries = await getAllCommentaryQuery(fastify);
    global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);
    global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);

    return "Short Commentary saved successfully";
  } catch (error) {
    throw error;
  }
};

const updateCommentaryStatusService = async (request, fastify) => {
  const { commentaryId, displayStatus } = request.body;

  // Validate input
  if (!commentaryId || displayStatus === undefined) {
    throw new Error(
      "Invalid input: commentaryId and displayStatus are required"
    );
  }

  // Find the index of the commentary to update
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryId
  );

  // Check if the commentary exists
  if (index === -1) {
    throw new Error("Commentary with this id not found");
  }

  // call predictor endpoint
  if (global.tblCommentaries[index].isPredictMarket) {
    callPredictorMarket(
      {
        commentary_id: commentaryId,
        status: EventMarketStatus.Suspend,
        match_type_id: global.tblCommentaries[index].matchTypeId,
      },
      "/api/updatemarketstatus",
      fastify,
      request
    );
  }

  // Prepare the commentary details for update
  const commentaryDetails = {
    commentaryId,
    displayStatus,
  };

  // Update the commentary status in the database
  await updateCommentaryStatusQuery(commentaryDetails, fastify, request);

  // Update the commentary status in the global array
  global.tblCommentaries[index] = {
    ...global.tblCommentaries[index],
    ...commentaryDetails,
  };

  // Return the updated commentary details
  return {
    name: "commentaryDetails",
    value: commentaryDetails,
  };
};
const updateCommentaryDetailsServices = async (
  commentaryDetails,
  fastify,
  request
) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryDetails.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  // console.time("updateCommentaryDetailsQuery");
  await updateCommentaryDetailsQuery(commentaryDetails, fastify, request);
  // console.timeEnd("updateCommentaryDetailsQuery");

  global.tblCommentaries[index] = commentaryDetails;

  return {
    name: "commentaryDetails",
    value: commentaryDetails,
  };
};

const updateCommentaryTeamsServices = async (teamDetails, fastify, request) => {
  const index = global.tblCommentaryTeams.findIndex(
    (item) =>
      item.commentaryId === teamDetails.commentaryId &&
      //item.teamId === teamDetails.teamId &&
      item.commentaryTeamId === teamDetails.commentaryTeamId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  // console.time("updateCommentaryTeamsQuery")
  await updateCommentaryTeamsQuery(teamDetails, fastify, request);
  // console.timeEnd("updateCommentaryTeamsQuery")

  global.tblCommentaryTeams[index] = teamDetails;

  return teamDetails;
};

const updateCommentaryPlayerDetailsServices = async (
  playerDetails,
  fastify,
  request
) => {
  const index = global.tblCommentaryPlayers.findIndex(
    (item) => item.commentaryPlayerId === playerDetails.commentaryPlayerId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }
  // console.time("updateCommentaryPlayersQuery")
  await updateCommentaryPlayersQuery(playerDetails, fastify, request);
  // console.timeEnd("updateCommentaryPlayersQuery")

  global.tblCommentaryPlayers[index] = playerDetails;

  return playerDetails;
};

const saveOverService = async (overDetais, fastify, request) => {
  let { overId } = overDetais;
  overId = parseInt(overId);

  if (overId === 0) {
    return await createOverService(overDetais, fastify, request);
  } else {
    return await updateOverService(overDetais, fastify, request);
  }
};

const createOverService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const indexTeam = global.tblCommentaryTeams.findIndex(
    (item) =>
      item.commentaryId === data.commentaryId && item.teamId === data.teamId
  );

  if (indexTeam === -1) {
    throw new Error("Team with this id not Found");
  }

  const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
    // console.log(item.playerId, data.bowlerId);
    return (
      item.commentaryId === data.commentaryId &&
      item.teamId === data.teamId &&
      item.commentaryPlayerId === data.bowlerId
    );
  });

  if (indexBowler === -1) {
    throw new Error("Bowler with this id not Found");
  }

  // // console.time("createOverQuery")
  const addOver = await createOverQuery(data, fastify, request);
  // // console.timeEnd("createOverQuery")

  global.tblOvers.push(addOver);

  return {
    name: "overdetails",
    value: addOver,
  };
};

const updateOverService = async (data, fastify, request) => {
  const indexOver = global.tblOvers.findIndex(
    (item) => item.overId === data.overId
  );

  if (indexOver === -1) {
    throw new Error("Over with this id not Found");
  }

  // // console.time("updateOverQuery")
  await updateOverQuery(data, fastify, request);
  // // console.timeEnd("updateOverQuery")

  global.tblOvers[indexOver] = data;

  return {
    name: "overdetails",
    value: data,
  };
};

const ballByBallCommentoriesService = async (data, fastify, request) => {
  let { commentaryBallByBallId } = data;
  commentaryBallByBallId = parseInt(commentaryBallByBallId);

  if (commentaryBallByBallId === 0) {
    return await createBallByBallCommentoriesService(data, fastify, request);
  } else {
    return await updateBallByBallCommentoriesService(data, fastify, request);
  }
};

const createBallByBallCommentoriesService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  // console.time("createBallByBallCommentoriesQuery")
  const addBallByBallCommentories = await createBallByBallCommentoriesQuery(
    data,
    fastify,
    request
  );
  // console.timeEnd("createBallByBallCommentoriesQuery")

  let dataToreturn = {
    ...data,
    ...addBallByBallCommentories,
  };

  global.tblCommentaryBallByBall.push(dataToreturn);

  return {
    name: "commentaryBallByBallDetails",
    value: dataToreturn,
  };
};

const updateBallByBallCommentoriesService = async (data, fastify, request) => {
  const indexBallByBall = global.tblCommentaryBallByBall.findIndex(
    (item) => item.commentaryBallByBallId === data.commentaryBallByBallId
  );

  if (indexBallByBall === -1) {
    throw new Error("BallByBall with this id not Found");
  }

  // console.time("updateBallByBallCommentoriesQuery")
  await updateBallByBallCommentoriesQuery(data, fastify, request);
  // console.timeEnd("updateBallByBallCommentoriesQuery")

  global.tblCommentaryBallByBall[indexBallByBall] = data;

  return {
    name: "commentaryBallByBallDetails",
    value: data,
  };
};

const saveCommentaryWicketService = async (data, fastify, request) => {
  let { commentaryWicketId } = data;
  commentaryWicketId = parseInt(commentaryWicketId);

  if (commentaryWicketId === 0) {
    return await createCommentaryWicketService(data, fastify, request);
  } else {
    return await updateCommentaryWicketService(data, fastify, request);
  }
};

const createCommentaryWicketService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  // console.time("createCommentaryWicketQuery")
  const addCommentaryWicket = await createCommentaryWicketQuery(
    data,
    fastify,
    request
  );
  // console.timeEnd("createCommentaryWicketQuery")

  global.tblCommentaryWicket.push(addCommentaryWicket);

  return {
    name: "commentaryWicketDetails",
    value: addCommentaryWicket,
  };
};

const updateCommentaryWicketService = async (data, fastify, request) => {
  const indexWicket = global.tblCommentaryWicket.findIndex(
    (item) => item.commentaryWicketId === data.commentaryWicketId
  );

  if (indexWicket === -1) {
    throw new Error("Wicket with this id not Found");
  }

  // console.time("updateCommentaryWicketQuery")
  await updateCommentaryWicketQuery(data, fastify, request);
  // console.timeEnd("updateCommentaryWicketQuery")

  global.tblCommentaryWicket[indexWicket] = data;

  return {
    name: "commentaryWicketDetails",
    value: data,
  };
};

const saveCommentaryPartnershipService = async (data, fastify, request) => {
  let { commentaryPartnershipId } = data;
  commentaryPartnershipId = parseInt(commentaryPartnershipId);

  if (commentaryPartnershipId === 0) {
    return await createCommentaryPartnershipService(data, fastify, request);
  } else {
    return await updateCommentaryPartnershipService(data, fastify, request);
  }
};

const createCommentaryPartnershipService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }
  // console.time("createCommentaryPartnershipQuery")
  const addCommentaryPartnership = await createCommentaryPartnershipQuery(
    data,
    fastify,
    request
  );
  // console.timeEnd("createCommentaryPartnershipQuery")

  global.tblCommentaryPartnership.push(addCommentaryPartnership);

  return {
    name: "commentaryPartnershipDetails",
    value: addCommentaryPartnership,
  };
};

const updateCommentaryPartnershipService = async (data, fastify, request) => {
  const indexPartnership = global.tblCommentaryPartnership.findIndex(
    (item) => item.commentaryPartnershipId === data.commentaryPartnershipId
  );

  if (indexPartnership === -1) {
    throw new Error("Partnership with this id not Found");
  }

  // console.time("updateCommentaryPartnershipQuery")
  await updateCommentaryPartnershipQuery(data, fastify, request);
  // console.timeEnd("updateCommentaryPartnershipQuery")

  global.tblCommentaryPartnership[indexPartnership] = data;

  return {
    name: "commentaryPartnershipDetails",
    value: data,
  };
};

const deleteBallByBallCommentoriesService = async (request, fastify) => {
  const { commentaryBallByBallId } = request.body;

  const index = global.tblCommentaryBallByBall.findIndex(
    (item) => item.commentaryBallByBallId === commentaryBallByBallId
  );

  if (index === -1) {
    throw new Error("BallByBall with this id not Found");
  }

  await deleteBallByBallCommentoriesQuery(
    commentaryBallByBallId,
    request,
    fastify
  );

  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );

  return true;
};
const deleteOverCommentoriesService = async (request, fastify) => {
  const { commentaryOverId } = request.body;
  const index = global.tblOvers.findIndex(
    (item) => item.overId === commentaryOverId
  );

  if (index === -1) {
    throw new Error("OverId with this id not Found");
  }

  await deleteOverCommentoriesQuery(commentaryOverId, request, fastify);

  global.tblOvers = global.tblOvers.filter(
    (item) => item.overId !== commentaryOverId
  );
  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => item.overId !== commentaryOverId
  );
  return true;
};

const commentaryDetailsByEventIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.eventRefId === request.body.eventId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }
  const currentInning = result.currentInnings;
  const resultArr = {
    eid: "",
    til: "",
    toss: "",
    scot: "",
    scor: "",
    scov: "",
    t1n: "",
    t1sn: "",
    t1s: "",
    t1im: "",
    t2n: "",
    t2sn: "",
    t2s: "",
    t2im: "",
    t1jr: "",
    t2jr: "",
    par: "",
    lawkt: "",
    rer: "",
    reb: "",
    crr: "",
    rrr: "",
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    win: "",
    cst: "",
    ics: result.isClientShow,
  };
  let eid;
  let til;
  let toss;
  let scot;
  let scor;
  let scov;
  let t1n;
  let t1nid = 0;
  let t1sn;
  let t1s;
  let t1im;
  let t1jr;
  let t2jr;
  let t2n;
  let t2nid = 0;
  let t2sn;
  let t2s;
  let t2im;
  let par;
  let lawkt;
  let rer;
  let reb;
  let crr;
  let rrr;
  let cin;
  let tmd;
  let dis;
  let isc;
  let sts;
  let rmk;
  let win;
  let getstatus = 0;
  let tossteam;
  let tossType;
  let cid = 0;
  let batid = 0;
  let ballid = 0;
  let mtype = 0;
  let bovr = 0;
  let cst;
  let ics;
  // Basic elements are set
  cid = result.commentaryId;
  eid = result.eventRefId.toString();
  til = result.eventName;
  getstatus = result.commentaryStatus;
  dis = result.eventDate;
  t1nid = result.team1Id;
  t2nid = result.team2Id;
  mtype = result.matchTypeId;
  cst = result.commentaryStatus;
  ics = result.isClientShow;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === t1nid &&
      item.currentInnings === currentInning
  );

  const matchType = await global.tblMatchTypes.filter(
    (item) => item.matchTypeId === mtype
  );

  const mt = matchType.map((mt) => ({
    tov: mt.totalOversInMatch,
    bpo: mt.ballsPerOver,
  }));

  const commentaryTeamsTwo = await global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === t2nid &&
      item.currentInnings === currentInning
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? 0;
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? 0;
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  //teams Images are Ser
  const _teamsC1 = await global.tblTeams.filter(
    (item) => item.teamId === t1nid
  );
  t1im = _teamsC1[0].image;
  t1jr = _teamsC1[0].jersey;
  const _teamsC2 = await global.tblTeams.filter(
    (item) => item.teamId === t2nid
  );
  t2im = _teamsC2[0].image;
  t2jr = _teamsC2[0].jersey;

  if (getstatus == 1) {
    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = "Toss Not Done Yet";
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    result.ics = result.isClientShow;
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
  }
  if (getstatus === 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? 0;
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? 0;
      crr = commentaryTeamsOne[0]?.crr ?? 0;
      rrr = commentaryTeamsOne[0]?.rrr ?? 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? 0;
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? 0;
      crr = commentaryTeamsTwo[0]?.crr ?? 0;
      rrr = commentaryTeamsTwo[0]?.rrr ?? 0;
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter(
        (item) =>
          item.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInning
      )
      .slice(-1)[0]; // Get the last 1 overs;

    let _playerWicket;
    let _playerWiktRun;
    let _playerWiktRBall;

    const commentaryPartnership = await global.tblCommentaryPartnership
      .filter(
        (item) =>
          item.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInning
      )
      .slice(-1)[0]; // Get the last 1 overs

    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? 0;
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? 0;
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? 0;
    let _partBall = commentaryPartnership?.totalBalls ?? 0;
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = par;
    resultArr.lawkt = lawkt;
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = crr;
    resultArr.rrr = rrr;
    resultArr.cin = result.commentaryStatus.toString();
    resultArr.tmd = "";
    resultArr.dis = result.displayStatus;
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = result.rmk;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
  }

  let eventType = await global.tblEventTypes.find(
    (eventType) => eventType.eventTypeId === result.eventTypeId
  );
  let competition = await global.tblCompetitions.find(
    (competition) => competition.competitionId === result.competitionId
  );

  resultArr.ed = convertDate(result.eventDate, "DD/MM/YYYY") || "";
  resultArr.et = convertDate(result.eventDate, "hh:mm:ss") || "";
  resultArr.ety = eventType?.eventType || "";
  resultArr.mtyp = result.matchType || "";
  resultArr.com = competition?.competition || "";
  // remove out batsman
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === batid &&
      item.onStrike !== null &&
      item.currentInnings === currentInning &&
      (item.isBatterOut === false || item.isBatterOut === null)
  );

  // if isplay is true then return that bowler
  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === ballid &&
      // item.bowlerOnStrike !== null
      item.currentInnings === currentInning &&
      item.isPlay === true
  );

  const cbt = commentaryPlayers_batter.map((player) => {
    let playerData = global.tblPlayers.find(
      (item) => item.playerId === player.playerId
    );
    return {
      pid: player.playerId,
      batn: player.playerName,
      bati: playerData.image,
      trun: player.batRun || 0,
      tball: player.batBall || 0,
      t4: player.batFour || 0,
      t6: player.batSix || 0,
      sr: player.batSrr || 0,
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || 0.0,
      isp: playerData.isSystemPlayer,
    };
  });

  const cbl = commentaryPlayersBowler.map((bowler) => {
    let playerData = global.tblPlayers.find(
      (item) => item.playerId === bowler.playerId
    );
    return {
      pid: bowler.playerId,
      pn: bowler.playerName,
      bli: playerData.image,
      tov: bowler.bowlerOver || 0,
      cob: bowler.bowlerCurrentBall || 0,
      trun: bowler.bowlerRun || 0,
      t4: bowler.bowlerFour || 0,
      t6: bowler.bowlerSix || 0,
      twr: bowler.bowlerWideBallRun || 0,
      twb: bowler.bowlerWideBall || 0,
      tnr: bowler.bowlerNoBallRun || 0,
      tnb: bowler.bowlerNoBall || 0,
      mov: bowler.bowlerMaidenOver || 0,
      twik: bowler.bowlerTotalWicket || 0.0,
      eco: parseFloat(bowler.bowlerEconomy) || 0.0,
      dob: bowler.bowlerDotBall || 0,
      exr:
        bowler.bowlerWideBallRun ||
        0 + bowler.bowlerNoBallRun ||
        0 + bowler.bowlerByeBallRun ||
        0 + bowler.bowlerLegByeBallRun ||
        0,
      isp: playerData.isSystemPlayer,
    };
  });

  const commentaryOvers = global.tblOvers
    .filter(
      (item) =>
        item.commentaryId === cid && item.currentInnings === currentInning
    )
    .slice(-2); // Get the last 2 overs

  const last2OversIds = commentaryOvers.map((over) => over.overId);

  const commentaryBallByBall = global.tblCommentaryBallByBall.filter((item) =>
    last2OversIds.includes(item.overId)
  );
  const cbb = commentaryBallByBall.map((ball) => ({
    bbi: ball.commentaryBallByBallId,
    bai: ball.batStrikeId,
    nsbi: ball.batNonStrikeId,
    boi: 0,
    oid: ball.overId,
    ocn: parseFloat(ball.overCount),
    run: ball.ballRun || 0,
    nbr: ball.ballExtraRun || 0,
    wbr: ball.ballWideBallRun || 0,
    byr: ball.ballByeBallRun || 0,
    lbr: ball.ballLegByeBallRun || 0,
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || 0,
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
  }));

  const allDetails = {
    cm: { ...resultArr },
    cbb,
    cbt,
    cbl,
    mt,
  };

  return allDetails;
};

const commentaryDetailsByCommentaryIdService = async (request, fastify) => {
  // convert encyption to decryption
  const decryptedId = await decryptEncryptionId(
    request.body.commentaryId,
    fastify
  );
  request.body.commentaryId = decryptedId;

  const result = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (!result) {
    throw new Error("Commentary with this id not Found");
  }
  const currentInnings = result.currentInnings;

  const resultArr = {
    eid: "",
    til: "",
    toss: "",
    scot: "",
    scor: "",
    scov: "",
    t1n: "",
    t1sn: "",
    t1s: "",
    t1im: "",
    t1jr: "",
    t2jr: "",
    t2n: "",
    t2sn: "",
    t2s: "",
    t2im: "",
    par: "",
    lawkt: "",
    rer: "",
    reb: "",
    crr: "",
    rrr: "",
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    win: "",
    cst: "",
    ics: result.isClientShow,
  };
  let eid;
  let til;
  let toss;
  let scot;
  let scor;
  let scov;
  let t1n;
  let t1nid = 0;
  let t1sn;
  let t1s;
  let t1im;
  let t1jr;
  let t2jr;
  let t2n;
  let t2nid = 0;
  let t2sn;
  let t2s;
  let t2im;
  let par;
  let lawkt;
  let rer;
  let reb;
  let crr;
  let rrr;
  let cin;
  let tmd;
  let dis;
  let isc;
  let sts;
  let rmk;
  let win;
  let getstatus = 0;
  let tossteam;
  let tossType;
  let cid = 0;
  let batid = 0;
  let ballid = 0;
  let mtype = 0;
  let bovr = 0;
  let ics;
  // Basic elements are set
  cid = result.commentaryId;
  eid = result.eventRefId.toString();
  til = result.eventName;
  getstatus = result.commentaryStatus;
  dis = result.eventDate;
  t1nid = result.team1Id;
  t2nid = result.team2Id;
  mtype = result.matchTypeId;
  cst = result.commentaryStatus;
  ics = result.isClientShow;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === t1nid &&
      item.currentInnings === currentInnings
  );

  const _batTeams = await global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === cid &&
      item.currentInnings == currentInnings &&
      item.teamStatus === 1
  );
  const matchType = await global.tblMatchTypes.filter(
    (item) => item.matchTypeId === mtype
  );

  const mt = matchType.map((mt) => ({
    tov: mt.totalOversInMatch,
    bpo: mt.ballsPerOver,
  }));

  const commentaryTeamsTwo = await global.tblCommentaryTeams.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === t2nid &&
      item.currentInnings === currentInnings
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? 0;
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? 0;
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  //teams Images are Ser
  const _teamsC1 = await global.tblTeams.filter(
    (item) => item.teamId === t1nid
  );
  t1im = _teamsC1[0].image;
  t1jr = _teamsC1[0].jersey;
  const _teamsC2 = await global.tblTeams.filter(
    (item) => item.teamId === t2nid
  );
  t2im = _teamsC2[0].image;
  t2jr = _teamsC2[0].jersey;

  if (getstatus == 1) {
    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = "Toss Not Done Yet";
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
  }
  // if (getstatus == 3) {
  //   const _tosswonby = result.tossWonBy;
  //   if (commentaryTeamsOne[0].teamId == _tosswonby) {
  //     tossteam = commentaryTeamsOne[0].shortName;
  //     tossType =
  //       result.choseTo === 1
  //         ? " won the toss and opt to bat"
  //         : " won the toss and opt to bowl";
  //   } else {
  //     tossteam = commentaryTeamsTwo[0].shortName;
  //     tossType =
  //       result.choseTo === 1
  //         ? " won the toss and opt to bat"
  //         : " won the toss and opt to bowl";
  //   }

  //   toss = tossteam + tossType;
  //   // Assign values to the resultArr object
  //   resultArr.eid = result.eventId.toString();
  //   resultArr.til = result.eventName;
  //   resultArr.toss = toss;
  //   resultArr.scot = "";
  //   resultArr.scor = "";
  //   resultArr.scov = "";
  //   resultArr.t1n = t1sn;
  //   resultArr.t1sn = t1sn;
  //   resultArr.t1s = t1s;
  //   resultArr.t1im = t1im;
  //   resultArr.t2n = t2n;
  //   resultArr.t2sn = t2sn;
  //   resultArr.t2s = t2s;
  //   resultArr.t2im = t2im;
  //   resultArr.par = "";
  //   resultArr.lawkt = "";
  //   resultArr.rer = "";
  //   resultArr.reb = "";
  //   resultArr.crr = "";
  //   resultArr.rrr = "";
  //   resultArr.cin = "";
  //   resultArr.tmd = "";
  //   resultArr.dis = "";
  //   resultArr.isc = "";
  //   resultArr.sts = result.commentaryStatus.toString();
  //   resultArr.rmk = toss;
  //   resultArr.win = "";
  // }
  if (getstatus === 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? 0;
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? 0;
      crr = commentaryTeamsOne[0]?.crr ?? 0;
      rrr = commentaryTeamsOne[0]?.rrr ?? 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? 0;
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? 0;
      crr = commentaryTeamsTwo[0]?.crr ?? 0;
      rrr = commentaryTeamsTwo[0]?.rrr ?? 0;
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter(
        (item) =>
          item.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInnings
      )
      .slice(-1)[0]; // Get the last 1 overs;

    let _playerWicket;
    let _playerWiktRun;
    let _playerWiktRBall;

    const commentaryPartnership = await global.tblCommentaryPartnership
      .filter(
        (item) =>
          item.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInnings
      )
      .slice(-1)[0]; // Get the last 1 overs

    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? 0;
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? 0;
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? 0;
    let _partBall = commentaryPartnership?.totalBalls ?? 0;
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t1jr = t1jr;
    resultArr.t2jr = t2jr;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = par;
    resultArr.lawkt = lawkt;
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = crr;
    resultArr.rrr = rrr;
    resultArr.cin = result.commentaryStatus.toString();
    resultArr.tmd = "";
    resultArr.dis = result.displayStatus;
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = result.rmk;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
  }

  let eventType = await global.tblEventTypes.find(
    (eventType) => eventType.eventTypeId === result.eventTypeId
  );
  let competition = await global.tblCompetitions.find(
    (competition) => competition.competitionId === result.competitionId
  );

  resultArr.ed = convertDate(result.eventDate, "DD/MM/YYYY") || "";
  resultArr.et = convertDate(result.eventDate, "hh:mm:ss") || "";
  resultArr.ety = eventType?.eventType || "";
  resultArr.mtyp = result.matchType || "";
  resultArr.com = competition?.competition || "";
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === batid &&
      item.onStrike !== null &&
      item.currentInnings === currentInnings &&
      (item.isBatterOut === false || item.isBatterOut === null)
  );
  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === ballid &&
      // item.bowlerOnStrike !== null &&
      item.currentInnings === currentInnings &&
      item.isPlay === true
  );

  const cbt = commentaryPlayers_batter.map((player) => {
    let playerData = global.tblPlayers.find(
      (item) => item.playerId === player.playerId
    );
    return {
      pid: player.playerId,
      batn: player.playerName,
      bati: playerData.image,
      trun: player.batRun || 0,
      tball: player.batBall || 0,
      t4: player.batFour || 0,
      t6: player.batSix || 0,
      sr: player.batSrr || 0,
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || 0.0,
      isp: playerData.isSystemPlayer,
    };
  });

  const cbl = commentaryPlayersBowler.map((bowler) => {
    let playerData = global.tblPlayers.find(
      (item) => item.playerId === bowler.playerId
    );
    return {
      pid: bowler.playerId,
      pn: bowler.playerName,
      bli: playerData.image,
      tov: bowler.bowlerOver || 0,
      cob: bowler.bowlerCurrentBall || 0,
      trun: bowler.bowlerRun || 0,
      t4: bowler.bowlerFour || 0,
      t6: bowler.bowlerSix || 0,
      twr: bowler.bowlerWideBallRun || 0,
      twb: bowler.bowlerWideBall || 0,
      tnr: bowler.bowlerNoBallRun || 0,
      tnb: bowler.bowlerNoBall || 0,
      mov: bowler.bowlerMaidenOver || 0,
      twik: bowler.bowlerTotalWicket || 0.0,
      eco: parseFloat(bowler.bowlerEconomy) || 0.0,
      dob: bowler.bowlerDotBall || 0,
      exr:
        bowler.bowlerWideBallRun ||
        0 + bowler.bowlerNoBallRun ||
        0 + bowler.bowlerByeBallRun ||
        0 + bowler.bowlerLegByeBallRun ||
        0,
      isp: playerData.isSystemPlayer,
    };
  });

  const commentaryOvers = global.tblOvers
    .filter(
      (item) =>
        item.commentaryId === cid && item.currentInnings === currentInnings
    )
    .slice(-2); // Get the last 2 overs

  const last2OversIds = commentaryOvers.map((over) => over.overId);

  const commentaryBallByBall = global.tblCommentaryBallByBall.filter((item) =>
    last2OversIds.includes(item.overId)
  );
  const cbb = commentaryBallByBall.map((ball) => ({
    bbi: ball.commentaryBallByBallId,
    bai: ball.batStrikeId,
    nsbi: ball.batNonStrikeId,
    boi: 0,
    oid: ball.overId,
    ocn: parseFloat(ball.overCount),
    run: ball.ballRun || 0,
    nbr: ball.ballExtraRun || 0,
    wbr: ball.ballWideBallRun || 0,
    byr: ball.ballByeBallRun || 0,
    lbr: ball.ballLegByeBallRun || 0,
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || 0,
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
  }));

  const allDetails = {
    cm: { ...resultArr },
    cbb,
    cbt,
    cbl,
    mt,
  };

  return allDetails;
};

const UpdateCommentaryTime = async (data, fastify, request) => {
  const indexCommentary = global.tblCommentaries.findIndex(
    (item) => item.CommentaryId === data.CommentaryId
  );

  if (indexCommentary === -1) {
    throw new Error("Partnership with this id not Found");
  }

  await UpdateCommentaryTimeQuery(data, fastify, request);
  global.tblCommentaries[indexCommentary].updateTime = new Date();

  return true;
};

const getCurrentUpdatedCommentaryIDService = async (data, fastify, request) => {
  return await getCommentaryID_Socket(data, fastify, request);
};
const updateMatchTypeInCommentaryService = async (request, fastify) => {
  const { commentaryId, matchTypeId } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  const validateMatchType = await global.tblMatchTypes.find(
    (item) => item.matchTypeId === matchTypeId
  );
  if (!validateMatchType) {
    throw new Error("Match Type with this id not Found");
  }

  await updateMatchTypeInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;

  if (updatedData.isPredictMarket == true) {
    callPredictorMarket(
      {
        commentary_id: commentaryId,
        match_type_id: matchTypeId,
        event_id: updatedData.eventRefId,
      },
      "/api/loadcommentary",
      fastify,
      request
    );
  }
  return updatedData;
};
const getMatchTypeListByCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const validateCommentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );

  if (!validateCommentary) {
    throw new Error("Commentary with this id not Found");
  }
  let noOfInning = global.tblMatchTypes.find(
    (item) => item.matchTypeId === validateCommentary.matchTypeId
  ).noOfIningsPerSide;
  const matchTypeList = [];

  for (const item of global.tblMatchTypes) {
    if (item.noOfIningsPerSide === noOfInning) {
      matchTypeList.push({
        matchTypeId: item.matchTypeId,
        matchType: item.matchType,
      });
    }
  }

  return matchTypeList;
};
const changeBowlerOfCommentaryService = async (request, fastify) => {
  const { bowlerId, overId, commentaryId, currentInnings } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const over = global.tblOvers.find((item) => item.overId === overId);
  if (!over) {
    throw new Error("Over with this id not Found");
  }

  const bowler = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryPlayerId === bowlerId &&
      item.currentInnings === currentInnings
  );
  if (!bowler) {
    throw new Error("Bowler with this id not Found");
  }

  // update bowler in commentary
  const updatedData = await changeBowlerInCommentary(
    {
      commentaryId,
      overId,
      bowlerId,
      currentInnings,
    },
    request,
    fastify
  );

  return updatedData;
};
const getMatchListByStatus = async (body, request, fastify) => {
  // set rno as index of commentaryData
  let resultArr = [];
  const isRun = body.type == "scheduled" || "completed" ? false : true;
  let rno = 0;
  let crr, rrr;
  for (item of body.commentaryData) {
    rno++;
    let eventType = await global.tblEventTypes.find(
      (eventType) => eventType.eventTypeId === item.eventTypeId
    );
    let competition = await global.tblCompetitions.find(
      (competition) => competition.competitionId === item.competitionId
    );
    //teams set
    const commentaryTeamsOne = await global.tblCommentaryTeams.find(
      (team) =>
        team.commentaryId === item.commentaryId &&
        team.teamId === item.team1Id &&
        team.currentInnings === item.currentInnings
    );

    const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
      (team) =>
        team.commentaryId === item.commentaryId &&
        team.teamId === item.team2Id &&
        team.currentInnings === item.currentInnings
    );
    let teamScore1, teamScore2;
    if (commentaryTeamsOne) {
      const wicket1 =
        commentaryTeamsOne.teamWicket === null
          ? 0
          : commentaryTeamsOne.teamWicket;
      const overs1 =
        commentaryTeamsOne.teamOver === null
          ? 0.0
          : commentaryTeamsOne.teamOver;
      teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
      teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    }

    if (commentaryTeamsTwo) {
      t2sn = commentaryTeamsTwo.shortName;
      t2n = commentaryTeamsTwo.teamName;
      const wicket1 =
        commentaryTeamsTwo.teamWicket === null
          ? 0
          : commentaryTeamsTwo.teamWicket;
      const overs1 =
        commentaryTeamsTwo.teamOver === null
          ? 0.0
          : commentaryTeamsTwo.teamOver;
      teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
      teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    }
    // get image of team
    const team1 = await global.tblTeams.find(
      (team) => team.teamId === item.team1Id
    );
    const team2 = await global.tblTeams.find(
      (team) => team.teamId === item.team2Id
    );

    if (body.type == "scheduled") {
      crr = 0;
      rrr = 0;
    } else {
      if (commentaryTeamsOne.teamStatus == 1) {
        crr = commentaryTeamsOne.crr;
        rrr = commentaryTeamsOne.rrr;
      } else {
        crr = commentaryTeamsTwo.crr;
        rrr = commentaryTeamsTwo.rrr;
      }
    }

    let details = {
      rno: rno,
      eid: item.eventRefId || "",
      ety: eventType?.eventType || "",
      mtyp: item.matchType || "",
      com: competition?.competition || "",
      en: item.eventName || "",
      ed: convertDate(item.eventDate, "DD/MM/YYYY") || "",
      et: convertDate(item.eventDate, "hh:mm:ss") || "",
      te1n: commentaryTeamsOne.teamName || "",
      te2n: commentaryTeamsTwo.teamName || "",
      s1n: commentaryTeamsOne.shortName || "",
      s2n: commentaryTeamsTwo.shortName || "",
      te1i: team1.image || "",
      te2i: team2.image || "",
      t1jr: team1.jersey || "",
      t2jr: team2.jersey || "",
      loc: item.location || "",
      isrun: isRun,
      t1s: teamScore1 || "",
      t2s: teamScore2 || "",
      dis: item.displayStatus || "",
      rmk: item.rmk || "",
      te1crr: commentaryTeamsOne.crr || 0,
      te2crr: commentaryTeamsTwo.crr || 0,
      te1rrr: commentaryTeamsOne.rrr || 0,
      te2rrr: commentaryTeamsTwo.rrr || 0,
      crr: crr || 0,
      rrr: rrr || 0,
      cst: item.commentaryStatus,
    };

    resultArr.push(details);
  }

  return resultArr;
};
//old Function Without Optimization
// const getAllDetailsByEventIdService123 = async (request, fastify) => {
//   const { eventId } = request.body;
//   const commentary = global.tblCommentaries.find(
//     (item) => item.eventRefId === eventId
//   );
//   if (!commentary) {
//     throw new Error("Commentary with this id not Found");
//   }
//   const currentInnings = commentary.currentInnings;
//   const commentaryTeamsOne = await global.tblCommentaryTeams.find(
//     (item) =>
//       item.commentaryId === commentary.commentaryId &&
//       item.teamId === commentary.team1Id &&
//       item.currentInnings === currentInnings
//   );
//   const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
//     (item) =>
//       item.commentaryId === commentary.commentaryId &&
//       item.teamId === commentary.team2Id &&
//       item.currentInnings === currentInnings
//   );
//   //Event Type
//   let eventType = await global.tblEventTypes.find(
//     (eventType) => eventType.eventTypeId === commentary.eventTypeId
//   );

//   let competition = await global.tblCompetitions.find(
//     (competition) => competition.competitionId === commentary.competitionId
//   );
//   //get team data from team table
//   const team1 = await global.tblTeams.find(
//     (team) => team.teamId === commentary.team1Id
//   );
//   const team2 = await global.tblTeams.find(
//     (team) => team.teamId === commentary.team2Id
//   );

//   let dataToreturn = {
//     es: {},
//   };
//   //Old One
//   let _es = {
//     eid: commentary.eventRefId || "",
//     ety: eventType?.eventType || "",
//     ena: commentary.eventName,
//     cst: commentary.commentaryStatus,
//     tn1: commentaryTeamsOne.teamName,
//     tn2: commentaryTeamsTwo.teamName,
//     tsn1: commentaryTeamsOne.shortName,
//     tsn2: commentaryTeamsTwo.shortName,
//     tim1: team1.image,
//     tim2: team2.image,
//     cci: commentary.currentInnings,
//   };

//   let teamScore1, teamScore2;
//   if (commentaryTeamsOne) {
//     const wicket1 =
//       commentaryTeamsOne.teamWicket === null
//         ? 0
//         : commentaryTeamsOne.teamWicket;
//     const overs1 =
//       commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
//     teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
//     teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
//   }

//   if (commentaryTeamsTwo) {
//     t2sn = commentaryTeamsTwo.shortName;
//     t2n = commentaryTeamsTwo.teamName;
//     const wicket1 =
//       commentaryTeamsTwo.teamWicket === null
//         ? 0
//         : commentaryTeamsTwo.teamWicket;
//     const overs1 =
//       commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
//     teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
//     teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
//   }

//   let crr, rrr, BattingTeamId;
//   if (commentaryTeamsOne.teamStatus == 1) {
//     crr = commentaryTeamsOne.crr;
//     rrr = commentaryTeamsOne.rrr;
//     BattingTeamId = commentaryTeamsOne.teamId;
//   } else {
//     crr = commentaryTeamsTwo.crr;
//     rrr = commentaryTeamsTwo.rrr;
//     BattingTeamId = commentaryTeamsTwo.teamId;
//   }
//   let es = {
//     eid: commentary.eventRefId || "",
//     ety: eventType?.eventType || "",
//     mtyp: commentary.matchType || "",
//     com: competition?.competition || "",
//     en: commentary.eventName || "",
//     ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
//     et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
//     te1n: commentaryTeamsOne.teamName || "",
//     te2n: commentaryTeamsTwo.teamName || "",
//     s1n: commentaryTeamsOne.shortName || "",
//     s2n: commentaryTeamsTwo.shortName || "",
//     te1i: team1.image || "",
//     te2i: team2.image || "",
//     t1jr: team1.jersey || "",
//     t2jr: team2.jersey || "",
//     loc: commentary.location || "",
//     t1s: teamScore1 || "",
//     t2s: teamScore2 || "",
//     dis: commentary.displayStatus || "",
//     rmk: commentary.rmk || "",
//     te1crr: commentaryTeamsOne.crr || 0,
//     te2crr: commentaryTeamsTwo.crr || 0,
//     te1rrr: commentaryTeamsOne.rrr || 0,
//     te2rrr: commentaryTeamsTwo.rrr || 0,
//     crr: crr || 0,
//     rrr: rrr || 0,
//     cst: commentary.commentaryStatus,
//   };

//   dataToreturn.es = es;

//   if (commentary.commentaryStatus === 1) {
//     return dataToreturn;
//   }
//   // get the all innings data
//   for (let i = 1; i <= commentary.currentInnings; i++) {
//     let inningData = await getInningDataByInningNumber(
//       commentary.commentaryId,
//       i
//     );
//     dataToreturn["cci" + i] = inningData;
//   }

//   let data = {
//     CommentaryId: commentary.commentaryId,
//     teamId: commentaryTeamsOne.teamId,
//   };
//   let TeamPlayes1 = await getCommnertySquadPlayersList(data, fastify, request);
//   data.teamId = commentaryTeamsTwo.teamId;
//   let TeamPlayes2 = await getCommnertySquadPlayersList(data, fastify, request);
//   dataToreturn.Sqt1 = TeamPlayes1;
//   dataToreturn.Sqt2 = TeamPlayes2;

//   //Partnership data

//   const commentaryPartnership = await global.tblCommentaryPartnership.filter(
//     (item) =>
//       item.commentaryId === commentary.commentaryId &&
//       item.teamId === BattingTeamId &&
//       item.currentInnings === currentInnings
//   );

//   const partnershipList = [];

//   // Iterate over tblCommentaryPartnership
//   commentaryPartnership.forEach((partnership) => {
//     const {
//       batter1Id,
//       batter1Name,
//       batter2Id,
//       batter2Name,
//       totalRuns,
//       totalBalls,
//     } = partnership;

//     const CommenrtyPlayers = global.tblCommentaryPlayers.find(
//       (Cplayer) => Cplayer.commentaryPlayerId === batter1Id
//     );

//     const CommenrtyPlayers1 = global.tblCommentaryPlayers.find(
//       (Cplayer) => Cplayer.commentaryPlayerId === batter2Id
//     );

//     // Find player information from tblPlayers
//     const player1Info = global.tblPlayers.find(
//       (player) => player.playerId === CommenrtyPlayers.playerId
//     );

//     const player2Info = global.tblPlayers.find(
//       (player) => player.playerId === CommenrtyPlayers1.playerId
//     );

//     if (player1Info) {
//       partnershipList.push({
//         pl1n: batter1Name,
//         pl1i: player1Info.image,
//         runs: totalRuns,
//         ball: totalBalls,
//         pl2n: batter2Name,
//         pl2i: player2Info.image,
//       });
//     }
//   });
//   dataToreturn.par = partnershipList;

//   return dataToreturn;
// };
//New one Function With Optimization
const getAllDetailsByEventIdService = async (request, fastify) => {
  try {
    const { eventId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item.eventRefId === eventId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }
    const currentInnings = commentary.currentInnings;

    // Promisify all necessary asynchronous operations
    const [
      commentaryTeamsOne,
      commentaryTeamsTwo,
      eventType,
      competition,
      team1,
      team2,
      commentryBallByBall,
      overs,
    ] = await Promise.all([
      global.tblCommentaryTeams.find(
        (item) =>
          item.commentaryId === commentary.commentaryId &&
          item.teamId === commentary.team1Id &&
          item.currentInnings === currentInnings
      ),
      global.tblCommentaryTeams.find(
        (item) =>
          item.commentaryId === commentary.commentaryId &&
          item.teamId === commentary.team2Id &&
          item.currentInnings === currentInnings
      ),
      global.tblEventTypes.find(
        (eventType) => eventType.eventTypeId === commentary.eventTypeId
      ),
      global.tblCompetitions.find(
        (competition) => competition.competitionId === commentary.competitionId
      ),
      global.tblTeams.find((team) => team.teamId === commentary.team1Id),
      global.tblTeams.find((team) => team.teamId === commentary.team2Id),
      global.tblCommentaryBallByBall.filter(
        (ball) => ball.commentaryId === commentary.commentaryId
        // ball.currentInnings === currentInnings
      ),
      global.tblOvers.filter(
        (ov) => ov.commentaryId === commentary.commentaryId
        // ov.currentInnings === currentInnings
      ),
    ]);
    let dataToreturn = {
      es: {
        eid: commentary.eventRefId || "",
        ety: eventType?.eventType || "",
        ena: commentary.eventName,
        cst: commentary.commentaryStatus,
        tn1: commentaryTeamsOne.teamName,
        tn2: commentaryTeamsTwo.teamName,
        tsn1: commentaryTeamsOne.shortName,
        tsn2: commentaryTeamsTwo.shortName,
        tim1: team1.image,
        tim2: team2.image,
        cci: commentary.currentInnings,
      },
    };

    let teamScore1, teamScore2;
    if (commentaryTeamsOne) {
      const wicket1 =
        commentaryTeamsOne.teamWicket === null
          ? 0
          : commentaryTeamsOne.teamWicket;
      const overs1 =
        commentaryTeamsOne.teamOver === null
          ? 0.0
          : commentaryTeamsOne.teamOver;
      teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
      teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    }

    if (commentaryTeamsTwo) {
      t2sn = commentaryTeamsTwo.shortName;
      t2n = commentaryTeamsTwo.teamName;
      const wicket1 =
        commentaryTeamsTwo.teamWicket === null
          ? 0
          : commentaryTeamsTwo.teamWicket;
      const overs1 =
        commentaryTeamsTwo.teamOver === null
          ? 0.0
          : commentaryTeamsTwo.teamOver;
      teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
      teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    }

    let crr, rrr, BattingTeamId, BowlingTeamId, batId, bowlId;
    if (commentaryTeamsOne.teamStatus == 1) {
      crr = commentaryTeamsOne.crr;
      rrr = commentaryTeamsOne.rrr;
      BattingTeamId = commentaryTeamsOne.commentaryTeamId;
      BowlingTeamId = commentaryTeamsTwo.commentaryTeamId;
      batId = commentaryTeamsOne.teamId;
      bowlId = commentaryTeamsTwo.teamId;
    } else {
      crr = commentaryTeamsTwo.crr;
      rrr = commentaryTeamsTwo.rrr;
      BattingTeamId = commentaryTeamsTwo.commentaryTeamId;
      BowlingTeamId = commentaryTeamsOne.commentaryTeamId;
      batId = commentaryTeamsTwo.teamId;
      bowlId = commentaryTeamsOne.teamId;
    }
    let es = {
      eid: commentary.eventRefId || "",
      ety: eventType?.eventType || "",
      mtyp: commentary.matchType || "",
      com: competition?.competition || "",
      en: commentary.eventName || "",
      ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
      et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
      te1n: commentaryTeamsOne.teamName || "",
      te2n: commentaryTeamsTwo.teamName || "",
      s1n: commentaryTeamsOne.shortName || "",
      s2n: commentaryTeamsTwo.shortName || "",
      te1i: team1.image || "",
      te2i: team2.image || "",
      t1jr: team1.jersey || "",
      t2jr: team2.jersey || "",
      loc: commentary.location || "",
      t1s: teamScore1 || "",
      t2s: teamScore2 || "",
      dis: commentary.displayStatus || "",
      rmk: commentary.rmk || "",
      te1crr: commentaryTeamsOne.crr || 0,
      te2crr: commentaryTeamsTwo.crr || 0,
      te1rrr: commentaryTeamsOne.rrr || 0,
      te2rrr: commentaryTeamsTwo.rrr || 0,
      crr: crr || 0,
      rrr: rrr || 0,
      cst: commentary.commentaryStatus,
      bowi: BowlingTeamId,
      bati: BattingTeamId,
      t1id: commentaryTeamsOne.commentaryTeamId,
      t2id: commentaryTeamsTwo.commentaryTeamId,
      boid: bowlId,
      baid: batId,
      ics: commentary.isClientShow,
      cci: commentary.currentInnings,
    };

    dataToreturn.es = es;

    const commentaryTeam = await global.tblCommentaryTeams
      .filter((item) => item.commentaryId === commentary.commentaryId)
      .map((item) => {
        let tJer, timg;
        if (item.teamId === team1.teamId) {
          tJer = team1.jersey;
          timg = team1.image;
        }
        if (item.teamId === team2.teamId) {
          tJer = team2.jersey;
          timg = team2.image;
        }
        return {
          cid: item.commentaryId,
          ctid: item.commentaryTeamId,
          cci: item.currentInnings,
          tid: item.teamId,
          ten: item.teamName,
          tes: item.shortName,
          isbc: item.isBattingComplete,
          tJer: tJer || "",
          timg: timg || "",
          batOrd: item.teamBattingOrder,
        };
      });
    dataToreturn.td = commentaryTeam;
    if (commentary.commentaryStatus === 1) {
      return dataToreturn;
    }

    // get the all innings data
    const inningDataPromises = [];
    for (let i = 1; i <= commentary.currentInnings; i++) {
      inningDataPromises.push(
        getInningDataByInningNumber(commentary.commentaryId, i)
      );
    }
    const inningsData = await Promise.all(inningDataPromises);
    inningsData.forEach((inningData, index) => {
      dataToreturn["cci" + (index + 1)] = inningData;
    });

    let data = {
      CommentaryId: commentary.commentaryId,
      teamId: commentaryTeamsOne.teamId,
    };
    let TeamPlayes1 = await getCommnertySquadPlayersList(
      data,
      fastify,
      request
    );
    data.teamId = commentaryTeamsTwo.teamId;
    let TeamPlayes2 = await getCommnertySquadPlayersList(
      data,
      fastify,
      request
    );
    dataToreturn.Sqt1 = TeamPlayes1;
    dataToreturn.Sqt2 = TeamPlayes2;

    //Partnership data

    const commentaryPartnership = await global.tblCommentaryPartnership.filter(
      (item) => item.commentaryId === commentary.commentaryId
      // item.teamId === batId &&
      // item.currentInnings === currentInnings
    );

    const partnershipList = [];

    // Iterate over tblCommentaryPartnership
    commentaryPartnership.forEach((partnership) => {
      const {
        batter1Id,
        batter1Name,
        batter2Id,
        batter2Name,
        totalRuns,
        totalBalls,
      } = partnership;

      const CommenrtyPlayers = global.tblCommentaryPlayers.find(
        (Cplayer) => Cplayer.commentaryPlayerId === batter1Id
      );

      const CommenrtyPlayers1 = global.tblCommentaryPlayers.find(
        (Cplayer) => Cplayer.commentaryPlayerId === batter2Id
      );

      // Find player information from tblPlayers
      const player1Info = global.tblPlayers.find(
        (player) => player.playerId === CommenrtyPlayers.playerId
      );

      const player2Info = global.tblPlayers.find(
        (player) => player.playerId === CommenrtyPlayers1.playerId
      );

      if (player1Info) {
        partnershipList.push({
          pl1n: batter1Name,
          pl1i: player1Info.image,
          runs: totalRuns,
          ball: totalBalls,
          pl2n: batter2Name,
          pl2i: player2Info.image,
          tid: partnership.teamId,
          cci: partnership.currentInnings,
        });
      }
    });
    dataToreturn.par = partnershipList;
    let oversList = [];

    overs.forEach((_over) => {
      const {
        overId,
        over,
        totalRun,
        teamId,
        bowlerId,
        totalWicket,
        teamScore,
      } = _over;
      let ballsList = [];

      let _overBalls = commentryBallByBall.filter(
        (item) => item.overId === overId
      );

      _overBalls.forEach((_b) => {
        const {
          commentaryBallByBallId,
          overCount,
          batStrikeId,
          batNonStrikeId,
          ballType,
          ballRun,
          ballExtraRun,
          ballIsBoundry,
          ballIsWicket,
        } = _b;
        ballsList.push({
          bid: commentaryBallByBallId,
          ovc: overCount,
          st: batStrikeId,
          nst: batNonStrikeId,
          bty: ballType,
          runs: ballRun,
          ext: ballExtraRun,
          isB: ballIsBoundry,
          wik: ballIsWicket,
        });

        // descending order of balls
        ballsList = ballsList.sort((a, b) => b.ovc - a.ovc);
      });

      oversList.push({
        oid: overId,
        ov: over + 1,
        cin: currentInnings,
        runs: totalRun,
        bid: bowlerId,
        tid: teamId,
        twk: totalWicket,
        ball: ballsList,
        ts: teamScore,
      });
    });

    // descending order of overs
    oversList = oversList.sort((a, b) => b.ov - a.ov);

    dataToreturn.ov = oversList;

    return dataToreturn;
  } catch (error) {
    // Handle errors here
    // console.error(error);
    throw new Error(error);
  }
};

const getInningDataByInningNumber = async (commentaryId, inningNumber) => {
  // get currentBattingTeam
  const currentBattingTeam = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings === inningNumber &&
      item.teamStatus === 1
  );

  const currentBowlingTeam = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings === inningNumber &&
      item.teamStatus === 2
  );

  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBattingTeam.teamId &&
      item.currentInnings === inningNumber &&
      (item.onStrike !== null || item.isBatterOut === true)
  );

  const bat1 = commentaryPlayers_batter.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      btn: player.playerName,
      ot: player.isBatterOut ? "OUT" : "NOT OUT",
      rt: player.isBatterRetir ? "RET" : "",
      wkp: player.wicketType ? wicketType[player.wicketType] : "[Batting]",
      rbl: player.batRun ? `${player.batRun}(${player.batBall})` : "0(0)",
      four: player.batFour || 0,
      six: player.batSix || 0,
      dot: player.batDotBall || 0,
      sr: player.batsmanStrikeRate || 0,
      tid: currentBattingTeam.commentaryTeamId,
      batO: player.batterOrder || null,
      inp: player.isPlay || false,
    };
  });

  const commentaryPlayers_bowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBowlingTeam.teamId &&
      item.currentInnings === inningNumber &&
      (item.bowlerTotalBall !== null || item.isPlay == true)
  );

  const bow2 = commentaryPlayers_bowler.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      pln: player.playerName,
      ovr: player.bowlerOver || 0,
      mov: player.bowlerMaidenOver || 0,
      trun: player.bowlerRun || 0,
      four: player.bowlerFour || 0,
      six: player.bowlerSix || 0,
      wkt: player.bowlerTotalWicket || 0,
      wid: player.bowlerWideBallRun
        ? `${player.bowlerWideBall}/${player.bowlerWideBallRun}`
        : "0/0",
      nob: player.bowlerNoBallRun
        ? `${player.bowlerNoBall}/${player.bowlerNoBallRun}`
        : "0/0",
      dot: player.bowlerDotBall || 0,
      xtr:
        player.bowlerWideBallRun ||
        0 + player.bowlerNoBallRun ||
        0 + player.bowlerByeBallRun ||
        0 + player.bowlerLegByeBallRun ||
        0,
      eco: player.bowlerEconomy,
      tid: currentBowlingTeam.commentaryTeamId,
      bowlO: player.bowlerOrder || null,
      inp: player.isPlay || false,
    };
  });

  const currentBatterTeamWicket = await global.tblCommentaryWicket.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBattingTeam.teamId &&
      item.currentInnings === inningNumber
  );

  const fow1 = currentBatterTeamWicket.map((player) => {
    return {
      pn1: player.batterName,
      sco1: player.teamScore,
      ovr1: player.overCount,
      wkt1: player.wicketCount,
      tid: currentBattingTeam.commentaryTeamId,
    };
  });

  // check if one team is batting complete then get the data of other team
  const getBattingCompletedTeam = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentaryId &&
      item.currentInnings === inningNumber &&
      item.isBattingComplete === true
  );
  if (!getBattingCompletedTeam) {
    return {
      bat1,
      bow2,
      fow1,
      bat2: [],
      bow1: [],
      fow2: [],
    };
  }
  const commentaryPlayers_batter2 = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBowlingTeam.teamId &&
      item.currentInnings === inningNumber &&
      (item.onStrike !== null || item.isBatterOut === true)
  );

  const bat2 = commentaryPlayers_batter2.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      btn: player.playerName,
      ot: player.isBatterOut ? "OUT" : "NOT OUT",
      rt: player.isBatterRetir ? "RET" : "",
      wkp: player.wicketType ? wicketType[player.wicketType] : "[Batting]",
      rbl: player.batRun ? `${player.batRun}(${player.batBall})` : "0(0)",
      four: player.batFour || 0,
      six: player.batSix || 0,
      dot: player.batDotBall || 0,
      sr: player.batsmanStrikeRate || 0,
      tid: currentBowlingTeam.commentaryTeamId,
      batO: player.batterOrder || null,
      inp: player.isPlay || null,
      inp: player.isPlay || false,
    };
  });

  const commentaryPlayers_bowler2 = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBattingTeam.teamId &&
      item.currentInnings === inningNumber
  );

  const bow1 = commentaryPlayers_bowler2.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      pln: player.playerName,
      ovr: player.bowlerOver || 0,
      mov: player.bowlerMaidenOver || 0,
      trun: player.bowlerRun || 0,
      four: player.bowlerFour || 0,
      six: player.bowlerSix || 0,
      wkt: player.bowlerTotalWicket || 0,
      wid: `${player.bowlerWideBall}/${player.bowlerWideBallRun}` || "0/0",
      nob: `${player.bowlerNoBall}/${player.bowlerNoBallRun}` || "0/0",
      dot: player.bowlerDotBall || 0,
      xtr:
        player.bowlerWideBallRun ||
        0 + player.bowlerNoBallRun ||
        0 + player.bowlerByeBallRun ||
        0 + player.bowlerLegByeBallRun ||
        0,
      eco: player.bowlerEconomy,
      tid: currentBattingTeam.commentaryTeamId,
      bowlO: player.bowlerOrder || null,
      inp: player.isPlay || false,
    };
  });

  const currentBowlerTeamWicket = await global.tblCommentaryWicket.filter(
    (item) =>
      item.commentaryId === commentaryId &&
      item.teamId === currentBowlingTeam.teamId &&
      item.currentInnings === inningNumber
  );

  const fow2 = currentBowlerTeamWicket.map((player) => {
    return {
      pn1: player.batterName,
      sco1: player.teamScore,
      ovr1: player.overCount,
      wkt1: player.wicketCount,
      tid: currentBowlingTeam.commentaryTeamId,
    };
  });

  return {
    bat1,
    bow2,
    fow1,
    bat2,
    bow1,
    fow2,
  };
};

const getTeamListByEventTypeService = async (request) => {
  const { eventTypeId } = request.body;
  // get encypted eventTypeId from global
  if (eventTypeId === undefined) {
    return global.tblTeams;
  } else if (eventTypeId == 0) {
    return global.tblTeams;
  } else if (eventTypeId) {
    let encyptEventTypeId = global.tblEventTypes.find(
      (item) => item.pId === eventTypeId
    );
    const result = global.tblTeams.filter(
      (item) => item.eventTypeId === encyptEventTypeId
    );
    return result;
  }
};
const getCommenrtySquadDetailsService = async (request, fastify) => {
  const { eventId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const currentInnings = commentary.currentInnings;
  const commentaryTeamsOne = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team2Id &&
      item.currentInnings === currentInnings
  );
  //Event Type
  // // let eventType = await global.tblEventTypes.find(
  // //   (eventType) => eventType.eventTypeId === commentary.eventTypeId
  // // );

  // // let competition = await global.tblCompetitions.find(
  // //   (competition) => competition.competitionId === commentary.competitionId
  // // );
  //get team data from team table
  const team1 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team1Id
  );
  const team2 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team2Id
  );

  let dataToreturn = {
    es: {},
  };

  let teamScore1, teamScore2;
  if (commentaryTeamsOne) {
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo) {
    t2sn = commentaryTeamsTwo.shortName;
    t2n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsTwo.teamWicket === null
        ? 0
        : commentaryTeamsTwo.teamWicket;
    const overs1 =
      commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
    teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let crr, rrr;
  if (commentaryTeamsOne.teamStatus == 1) {
    crr = commentaryTeamsOne.crr;
    rrr = commentaryTeamsOne.rrr;
  } else {
    crr = commentaryTeamsTwo.crr;
    rrr = commentaryTeamsTwo.rrr;
  }

  let es = {
    eid: commentary.eventRefId || "",
    // ety: eventType?.eventType || "",
    // mtyp: commentary.matchType || "",
    // com: competition?.competition || "",
    en: commentary.eventName || "",
    ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
    te1n: commentaryTeamsOne.teamName || "",
    te2n: commentaryTeamsTwo.teamName || "",
    s1n: commentaryTeamsOne.shortName || "",
    s2n: commentaryTeamsTwo.shortName || "",
    te1i: team1.image || "",
    te2i: team2.image || "",
    t1jr: team1.jersey || "",
    t2jr: team2.jersey || "",
    // loc: commentary.location || "",
    // t1s: teamScore1 || "",
    // t2s: teamScore2 || "",
    // dis: commentary.displayStatus || "",
    // rmk: commentary.rmk || "",
    // te1crr: commentaryTeamsOne.crr || 0,
    // te2crr: commentaryTeamsTwo.crr || 0,
    // te1rrr: commentaryTeamsOne.rrr || 0,
    // te2rrr: commentaryTeamsTwo.rrr || 0,
    // crr: crr || 0,
    // rrr: rrr || 0,
    // cst: commentary.commentaryStatus,
  };

  dataToreturn.es = es;
  let data = {
    CommentaryId: commentary.commentaryId,
    teamId: commentaryTeamsOne.teamId,
  };
  let TeamPlayes1 = await getCommnertySquadPlayersList(data, fastify, request);
  data.teamId = commentaryTeamsTwo.teamId;
  let TeamPlayes2 = await getCommnertySquadPlayersList(data, fastify, request);
  dataToreturn.pl1 = TeamPlayes1;
  dataToreturn.pl2 = TeamPlayes2;
  return dataToreturn;
};

const getPartnershipListService = async (request, fastify) => {
  const { eventId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const currentInnings = commentary.currentInnings;
  const commentaryTeamsOne = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team2Id &&
      item.currentInnings === currentInnings
  );

  //get team data from team table
  const team1 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team1Id
  );
  const team2 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team2Id
  );

  let dataToreturn = {
    es: {},
  };

  let teamScore1, teamScore2;
  if (commentaryTeamsOne) {
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo) {
    t2sn = commentaryTeamsTwo.shortName;
    t2n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsTwo.teamWicket === null
        ? 0
        : commentaryTeamsTwo.teamWicket;
    const overs1 =
      commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
    teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let es = {
    eid: commentary.eventRefId || "",
    // ety: eventType?.eventType || "",
    // mtyp: commentary.matchType || "",
    // com: competition?.competition || "",
    en: commentary.eventName || "",
    ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
    te1n: commentaryTeamsOne.teamName || "",
    te2n: commentaryTeamsTwo.teamName || "",
    s1n: commentaryTeamsOne.shortName || "",
    s2n: commentaryTeamsTwo.shortName || "",
    te1i: team1.image || "",
    te2i: team2.image || "",
    t1jr: team1.jersey || "",
    t2jr: team2.jersey || "",
    // loc: commentary.location || "",
    // t1s: teamScore1 || "",
    // t2s: teamScore2 || "",
    // dis: commentary.displayStatus || "",
    // rmk: commentary.rmk || "",
    // te1crr: commentaryTeamsOne.crr || 0,
    // te2crr: commentaryTeamsTwo.crr || 0,
    // te1rrr: commentaryTeamsOne.rrr || 0,
    // te2rrr: commentaryTeamsTwo.rrr || 0,
    // crr: crr || 0,
    // rrr: rrr || 0,
    // cst: commentary.commentaryStatus,
  };

  dataToreturn.es = es;

  let BattingTeamId;
  if (commentaryTeamsOne.teamStatus == 1) {
    BattingTeamId = commentaryTeamsOne.teamId;
  } else {
    BattingTeamId = commentaryTeamsTwo.teamId;
  }

  const commentaryPartnership = await global.tblCommentaryPartnership.filter(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === BattingTeamId &&
      item.currentInnings === currentInnings
  );

  const partnershipList = [];

  // Iterate over tblCommentaryPartnership
  commentaryPartnership.forEach((partnership) => {
    const {
      batter1Id,
      batter1Name,
      batter2Id,
      batter2Name,
      totalRuns,
      totalBalls,
    } = partnership;

    const CommenrtyPlayers = global.tblCommentaryPlayers.find(
      (Cplayer) => Cplayer.commentaryPlayerId === batter1Id
    );

    const CommenrtyPlayers1 = global.tblCommentaryPlayers.find(
      (Cplayer) => Cplayer.commentaryPlayerId === batter2Id
    );

    // Find player information from tblPlayers
    const player1Info = global.tblPlayers.find(
      (player) => player.playerId === CommenrtyPlayers.playerId
    );

    const player2Info = global.tblPlayers.find(
      (player) => player.playerId === CommenrtyPlayers.playerId
    );

    if (player1Info) {
      partnershipList.push({
        pl1n: batter1Name,
        pl1i: player1Info.image,
        runs: totalRuns,
        ball: totalBalls,
        pl2n: batter2Name,
        pl2i: player2Info.image,
      });
    }
  });
  dataToreturn.par = partnershipList;
  return dataToreturn;
};

const getCommentaryTeamsListService = async (request, fastify) => {
  const currentInnings = commentary.currentInnings;
  const commentaryTeamsOne = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team2Id &&
      item.currentInnings === currentInnings
  );
  //Event Type
  // // let eventType = await global.tblEventTypes.find(
  // //   (eventType) => eventType.eventTypeId === commentary.eventTypeId
  // // );

  // // let competition = await global.tblCompetitions.find(
  // //   (competition) => competition.competitionId === commentary.competitionId
  // // );
  //get team data from team table
  const team1 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team1Id
  );
  const team2 = await global.tblTeams.find(
    (team) => team.teamId === commentary.team2Id
  );

  let dataToreturn = {
    es: {},
  };

  let teamScore1, teamScore2;
  if (commentaryTeamsOne) {
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo) {
    t2sn = commentaryTeamsTwo.shortName;
    t2n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsTwo.teamWicket === null
        ? 0
        : commentaryTeamsTwo.teamWicket;
    const overs1 =
      commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
    teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let crr, rrr;
  if (commentaryTeamsOne.teamStatus == 1) {
    crr = commentaryTeamsOne.crr;
    rrr = commentaryTeamsOne.rrr;
  } else {
    crr = commentaryTeamsTwo.crr;
    rrr = commentaryTeamsTwo.rrr;
  }

  let es = {
    eid: commentary.eventRefId || "",
    // ety: eventType?.eventType || "",
    // mtyp: commentary.matchType || "",
    // com: competition?.competition || "",
    en: commentary.eventName || "",
    ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
    te1n: commentaryTeamsOne.teamName || "",
    te2n: commentaryTeamsTwo.teamName || "",
    s1n: commentaryTeamsOne.shortName || "",
    s2n: commentaryTeamsTwo.shortName || "",
    te1i: team1.image || "",
    te2i: team2.image || "",
    t1jr: team1.jersey || "",
    t2jr: team2.jersey || "",
    // loc: commentary.location || "",
    // t1s: teamScore1 || "",
    // t2s: teamScore2 || "",
    // dis: commentary.displayStatus || "",
    // rmk: commentary.rmk || "",
    // te1crr: commentaryTeamsOne.crr || 0,
    // te2crr: commentaryTeamsTwo.crr || 0,
    // te1rrr: commentaryTeamsOne.rrr || 0,
    // te2rrr: commentaryTeamsTwo.rrr || 0,
    // crr: crr || 0,
    // rrr: rrr || 0,
    // cst: commentary.commentaryStatus,
  };

  dataToreturn.es = es;
  let data = {
    CommentaryId: commentary.commentaryId,
    teamId: commentaryTeamsOne.teamId,
  };
  let TeamPlayes1 = await getCommnertySquadPlayersList(data, fastify, request);
  data.teamId = commentaryTeamsTwo.teamId;
  let TeamPlayes2 = await getCommnertySquadPlayersList(data, fastify, request);
  dataToreturn.pl1 = TeamPlayes1;
  dataToreturn.pl2 = TeamPlayes2;
  return dataToreturn;
};
const changeShowClientService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  // update showClient
  await updateShowClientQuery(request.body, request, fastify);

  global.tblCommentaries[commentary].isClientShow = request.body.isClientShow;

  return "Commentary Updated successfully";
};

const changePlayerShowService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  // update showClient
  await updatePlayerShowQuery(request.body, request, fastify);

  global.tblCommentaries[commentary].isPlayersShow = request.body.isPlayersShow;

  return "Commentary Updated successfully";
};

const getNodeEventbyEidService = async (request, fastify) => {
  const { eventId } = request.query;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );
  if (commentary) {
    try {
      const currentInnings = commentary.currentInnings;
      // Promisify all necessary asynchronous operations
      const [
        commentaryTeamsOne,
        commentaryTeamsTwo,
        eventType,
        competition,
        team1,
        team2,
        commentryBallByBall,
        overs,
      ] = await Promise.all([
        global.tblCommentaryTeams.find(
          (item) =>
            item.commentaryId === commentary.commentaryId &&
            item.teamId === commentary.team1Id &&
            item.currentInnings === currentInnings
        ),
        global.tblCommentaryTeams.find(
          (item) =>
            item.commentaryId === commentary.commentaryId &&
            item.teamId === commentary.team2Id &&
            item.currentInnings === currentInnings
        ),
        global.tblEventTypes.find(
          (eventType) => eventType.eventTypeId === commentary.eventTypeId
        ),
        global.tblCompetitions.find(
          (competition) =>
            competition.competitionId === commentary.competitionId
        ),
        global.tblTeams.find((team) => team.teamId === commentary.team1Id),
        global.tblTeams.find((team) => team.teamId === commentary.team2Id),
        global.tblCommentaryBallByBall.filter(
          (ball) => ball.commentaryId === commentary.commentaryId
          // ball.currentInnings === currentInnings
        ),
        global.tblOvers.filter(
          (ov) => ov.commentaryId === commentary.commentaryId
          // ov.currentInnings === currentInnings
        ),
      ]);
      let dataToreturn = {
        es: {
          eid: commentary.eventRefId || "",
          ety: eventType?.eventType || "",
          ena: commentary.eventName,
          cst: commentary.commentaryStatus,
          tn1: commentaryTeamsOne.teamName,
          tn2: commentaryTeamsTwo.teamName,
          tsn1: commentaryTeamsOne.shortName,
          tsn2: commentaryTeamsTwo.shortName,
          tim1: team1.image,
          tim2: team2.image,
          cci: commentary.currentInnings,
        },
      };

      let teamScore1, teamScore2;
      if (commentaryTeamsOne) {
        const wicket1 =
          commentaryTeamsOne.teamWicket === null
            ? 0
            : commentaryTeamsOne.teamWicket;
        const overs1 =
          commentaryTeamsOne.teamOver === null
            ? 0.0
            : commentaryTeamsOne.teamOver;
        teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
        teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
      }

      if (commentaryTeamsTwo) {
        t2sn = commentaryTeamsTwo.shortName;
        t2n = commentaryTeamsTwo.teamName;
        const wicket1 =
          commentaryTeamsTwo.teamWicket === null
            ? 0
            : commentaryTeamsTwo.teamWicket;
        const overs1 =
          commentaryTeamsTwo.teamOver === null
            ? 0.0
            : commentaryTeamsTwo.teamOver;
        teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
        teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
      }

      let crr, rrr, BattingTeamId, BowlingTeamId;
      if (commentaryTeamsOne.teamStatus == 1) {
        crr = commentaryTeamsOne.crr;
        rrr = commentaryTeamsOne.rrr;
        BattingTeamId = commentaryTeamsOne.teamId;
        BowlingTeamId = commentaryTeamsTwo.teamId;
      } else {
        crr = commentaryTeamsTwo.crr;
        rrr = commentaryTeamsTwo.rrr;
        BattingTeamId = commentaryTeamsTwo.teamId;
        BowlingTeamId = commentaryTeamsOne.teamId;
      }
      let es = {
        eid: commentary.eventRefId || "",
        ety: eventType?.eventType || "",
        mtyp: commentary.matchType || "",
        com: competition?.competition || "",
        en: commentary.eventName || "",
        ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
        et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
        te1n: commentaryTeamsOne.teamName || "",
        te2n: commentaryTeamsTwo.teamName || "",
        s1n: commentaryTeamsOne.shortName || "",
        s2n: commentaryTeamsTwo.shortName || "",
      };

      dataToreturn.es = es;
      return dataToreturn;
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  } else {
    console.error("Commentary with this id not Found");
    return null;
  }
};

const updateisPredictMarketInCommentaryService = async (request, fastify) => {
  const { commentaryId, isPredictMarket } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateisPredictMarketInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  return updatedData;
};

const getEventDetailsByCIdService = async (request, fastify) => {
  try {
    const { commentaryId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item.commentaryId === commentaryId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }

    // Promisify all necessary asynchronous operations
    const [eventType, competition] = await Promise.all([
      global.tblEventTypes.find(
        (eventType) => eventType.eventTypeId === commentary.eventTypeId
      ),
      global.tblCompetitions.find(
        (competition) => competition.competitionId === commentary.competitionId
      ),
    ]);
    let dataToreturn = {
      es: {
        eid: commentary.eventRefId || "",
        ety: eventType?.eventType || "",
        mtyp: commentary.matchType || "",
        com: competition?.competition || "",
        en: commentary.eventName || "",
        ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
        et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
        cci: commentary.currentInnings,
      },
    };
    return dataToreturn;
  } catch (error) {
    //throw new Error(error);
  }
};
const saveCommentaryDetailsAPIService = async (request, fastify) => {
  // validate commentary id
  const {
    commentaryDetails,
    commentaryTeams,
    commentaryOvers,
    commentaryBallByBall,
    commentaryWickets,
    commentaryPartnership,
  } = request.body;

  // call the sp to save the commentary details
  await saveCommentaryDetailsAPIQuery(request.body, fastify, request);

  if (commentaryDetails) {
    const commentaryIndex = global.tblCommentaries.findIndex(
      (item) => item.commentaryId === commentaryDetails.commentaryId
    );
    commentaryIndex !== -1
      ? (global.tblCommentaries[commentaryIndex] = commentaryDetails)
      : null;
  }
  if (commentaryTeams) {
    for (let team of commentaryTeams) {
      let teamIndex = global.tblCommentaryTeams.findIndex(
        (item) => item.commentaryTeamId === team.commentaryTeamId
      );
      teamIndex !== -1 ? (global.tblCommentaryTeams[teamIndex] = team) : null;
    }
  }
  if (commentaryOvers) {
    for (let over of commentaryOvers) {
      let overIndex = global.tblOvers.findIndex(
        (item) => item.overId === over.overId
      );
      overIndex !== -1 ? (global.tblOvers[overIndex] = over) : null;
    }
  }
  if (commentaryBallByBall) {
    for (let ball of commentaryBallByBall) {
      let ballIndex = global.tblCommentaryBallByBall.findIndex(
        (item) => item.commentaryBallByBallId === ball.commentaryBallByBallId
      );
      ballIndex !== -1
        ? (global.tblCommentaryBallByBall[ballIndex] = ball)
        : null;
    }
  }
  if (commentaryWickets) {
    for (let wicket of commentaryWickets) {
      let wicketIndex = global.tblCommentaryWicket.findIndex(
        (item) => item.commentaryWicketId === wicket.commentaryWicketId
      );
      wicketIndex !== -1
        ? (global.tblCommentaryWicket[wicketIndex] = wicket)
        : null;
    }
  }
  if (commentaryPartnership) {
    for (let partnership of commentaryPartnership) {
      let partnershipIndex = global.tblCommentaryPartnership.findIndex(
        (item) =>
          item.commentaryPartnershipId === partnership.commentaryPartnershipId
      );
      partnershipIndex !== -1
        ? (global.tblCommentaryPartnership[partnershipIndex] = partnership)
        : null;
    }
  }

  return "Commentary Updated successfully";
};
const activeInactiveCommentaryService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await activeInactiveCommentaryQuery(request.body, fastify, request);

  global.tblCommentaries[commentary].isActive = request.body.isActive;

  return "Commentary Updated successfully";
}
const closeCommentaryService = async (request, fastify) => {
  await closeCommentaryQuery(request.body,fastify, request);

  // update the global variable
  for (let commentaryId of request.body.commentaryId) {
    const index = global.tblCommentaries.findIndex(
      (item) => item.commentaryId === commentaryId
    );
    if(index !== -1){
      global.tblCommentaries[index].commentaryStatus = 4;

      callPredictorMarket(
        {
          commentary_id: commentaryId
        },
        "/api/endcommentary",
        fastify,
        request
      );
    }

  }
  return `Commentary(s) closed successfully`;
}
const deleteAllCommentaryService = async (request, fastify) => {
  await deleteAllCommentaryQuery(fastify);

  global.tblCommentaries = [];
  global.tblCommentaryTeams = [];
  global.tblCommentaryPlayers = [];
  global.tblCommentaryWicket = [];
  global.tblCommentaryPartnership = [];
  global.tblCommentaryBallByBall = [];
  global.tblOvers = [];
  global.tblEventMarkets = [];
  global.tblMarketRunners = [];


  return "All Commentary Deleted successfully";
}
module.exports = {
  allCommentaryService,
  commentaryByIdService,
  saveCommentaryService,
  cloneCommentaryService,
  deleteCommentaryService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  saveCommentaryDetailsService,
  deleteBallByBallCommentoriesService,
  deleteOverCommentoriesService,
  commentaryDetailsByEventIdService,
  commentaryDetailsByCommentaryIdService,
  UpdateCommentaryTime,
  getCurrentUpdatedCommentaryIDService,
  updateMatchTypeInCommentaryService,
  getMatchTypeListByCommentaryService,
  changeBowlerOfCommentaryService,
  getMatchListByStatus,
  getAllDetailsByEventIdService,
  getTeamListByEventTypeService,
  getCommenrtySquadDetailsService,
  getPartnershipListService,
  getCommentaryTeamsListService,
  changeShowClientService,
  changePlayerShowService,
  getNodeEventbyEidService,
  testStoreProcedureService,
  getTeamAndPlayerListService,
  addTeamPlayerService,
  deleteTeamPlayerService,
  loadTeamPlayerService,
  saveShortCommentaryService,
  updateCommentaryStatusService,
  updateisPredictMarketInCommentaryService,
  getEventDetailsByCIdService,
  saveCommentaryDetailsAPIService,
  loadMultiCommentaryService,
  activeInactiveCommentaryService,
  closeCommentaryService,
  deleteAllCommentaryService
  // getshortService
};
