const WebSocket = require("ws");
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
  updateDelayInCommentaryQuery,
  deleteCommentaryDataQuery,
  updateEventRefIdInCommentaryQuery,
  updateCommentaryPlayerById,
  getPredictorLogsQuery,
  updateResultInCommentaryQuery,
  updateMaxOverDetailQuery,
  updateSuperOverCommentaryQuery,
  insertCommentarySuperOverTeams,
  updateTeamPrediction,
  updateCommentaryBattingTeamQuery,
  updateLineRationQuery,
  updateLineRatioComQuery,
  completedCommentaryStatusQuery,
  insertCommentaryConsoleFeQuery,
  revertCommentaryQuery
} = require("../repository/TableCommentary");
const moment = require("moment");
const {
  convertDate,
  wicketType,
  decryptEncryptionId,
  callPredictorMarket,
  EventMarketStatus,
  callDataProvider,
  APIEndpointModuleType,
  ServiceType,
  callfds,
  formatDateToISOString,
  callClientAPI,
  MarketTypeId
} = require("../utilities");
const { getAllPlayersByTeamIdQuery } = require("../repository/TableTeams");
const { handleMarketCloseService, updateComInMarketService, suspendMarketService } = require("./eventMarket");
const { createMarketOddsBallByBallBYID, deleteMarketOddsBallByBall, createMarketOddsBallInSaveDetails } = require("../repository/TableMarketOddsBallByBall");
const { getEventMarketRatioQuery, closeEventMarketByCIdQuery, getMarketsByCategoryQuery, getEventMarketByIdsQuery, getMarketsByComIdQuery, updateEventMarketCloseQuery, getMarCountByComQuery } = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const { commentaryLogger, errorLogger } = require("../utilities/logger");
const { setCompEventSnapSerice } = require("./competitionEventSnap");
const { setTeamPointService } = require("./tournamentTeamPoints");
const { setPlayerHistoryService } = require("./playerHistory");
const { now } = require("mongoose");
// const { handleSitemapUpdate } = require("../utilities/SEOIndexing")


const allCommentaryService = async (request, fastify) => {
  // return global.tblCommentaries;
  const { commentaryStatus, eventTypeId, competitionId, startDate, endDate } =
    request.body;
  let result;
  if (commentaryStatus === undefined) {
    result = global.tblCommentaries.filter(
      (item) => item.commentaryStatus !== 4
    );
  }
  if (commentaryStatus && commentaryStatus != 0) {
    result = global.tblCommentaries.filter(
      (item) => item.commentaryStatus === commentaryStatus
    );
  }
  if (commentaryStatus == 0) {
    result = global.tblCommentaries;
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
  // Sort in ascending order by eventDate
  result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  return result;
};

const allDisplayStatusService = async () => {
  return global.tblDisplayStatus;
};

const commentaryByIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
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

const predictorLogsByIdService = async (request, fastify) => {
  try {
    const { commentaryId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }
    const predictorLogsData = await getPredictorLogsQuery(
      { commentaryId: request.body.commentaryId },
      fastify,
      request
    );
    return predictorLogsData;
  } catch (error) {
    throw new Error(error);
  }
};

const commentaryDetailsByIdService = async (request, fastify) => {
  let isStopLoadCommerty = false;
  if (request.body.isStopLoadCommerty) {
    isStopLoadCommerty = request.body.isStopLoadCommerty;
  }
  let commentary = await global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
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
    hmtyp: commentary.historyMatchType || "",
    com: competition?.competition || "",
    en: commentary.eventName || "",
    ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
    cci: commentary.currentInnings,
  };

  const commentaryTeams = await global.tblCommentaryTeams
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.commentaryTeamId - a.commentaryTeamId);

  const commentaryPlayers = await global.tblCommentaryPlayers
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.commentaryPlayerId - a.commentaryPlayerId);

  const commentaryOvers = await global.tblOvers
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.overId - a.overId);

  const commentaryBallByBall = await global.tblCommentaryBallByBall
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId);
  // const commentaryBallByBall = await getCommentaryBallByBallQuery(
  //   request,
  //   fastify
  // );

  const commentaryWicket = await global.tblCommentaryWicket
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.commentaryWicketId - a.commentaryWicketId);

  const commentaryPartnership = await global.tblCommentaryPartnership
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId);

  const commentaryDisplayStatus = await global.tblDisplayStatus.filter(
    (item) => item.displayStatusId !== 0
  );
  let _resFromPredictAPI;
  let callPrediction = {};
  if (
    !isStopLoadCommerty &&
    commentary.isPredictMarket == true &&
    (commentary.commentaryStatus == 2 || commentary.commentaryStatus == 3)
  ) {
    // get the eventMarket from teamOnstrike
    const teamOnStrike = global.tblCommentaryTeams.find(
      (item) =>
        item?.commentaryId === commentary.commentaryId &&
        item.currentInnings === commentary.currentInnings &&
        item.teamStatus === 1
    );
    // array of eventMarket id
    let eventMarketLine = [];
    if (teamOnStrike) {
      eventMarketLine = await getEventMarketRatioQuery(
        {
          commentaryId: commentary.commentaryId,
          teamId: teamOnStrike.teamId,
        },
        request,
        fastify
      );
    }
    // data: {
    //   status_code: 500,
    //   error_msg: 'the JSON object must be str, bytes or bytearray, not NoneType'
    // }
    let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
    let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
    let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        match_type_id: commentary.matchTypeId,
        event_id: commentary.eventRefId,
        line_ratio_data: eventMarketLine,
        default_ball_faced: parseInt(key1?.value) || 0,
        default_player_boundaries: parseInt(key2?.value) || 0,
        default_player_runs: parseInt(key3?.value) || 0,
      },
      "/api/v1/loadcommentary",
      fastify,
      request
    );
    // Check for error_msg in the response
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/loadcommentary';
    }
  }
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
    callPrediction
  };
  return allDetails;
};

const createCommentaryService = async (request, fastify) => {
  // eventRefId should be unique
  const validateEventRefId = global.tblCommentaries.find(
    (item) => item.eventRefId === request.body.eventRefId?.trim()
  );
  if (validateEventRefId) {
    throw new Error("EventRefId should be unique");
  }
  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    }
  }

  request.body.teamMaxOver = null;
  if (request.body.matchTypeId) {
    const validateMatchTypeId = global.tblMatchTypes.find(
      (item) => item.matchTypeId === request.body.matchTypeId
    );
    if (!validateMatchTypeId) {
      throw new Error("MatchType with this id not Found");
    }
    request.body.teamMaxOver = validateMatchTypeId.maxOversInFirstInings;
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
            {
              ...info,
              matchTypeId: request.body.matchTypeId,
            },
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
          {
            ...info,
            matchTypeId: request.body.matchTypeId,
          },
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

  let _resFromPredictAPI;
  let callPrediction = {};
  // call predictor market
  // if (addCommentry.isPredictMarket == true) {
  //   _resFromPredictAPI = await callPredictorMarket(
  //     {
  //       commentary_id: addCommentry.commentaryId,
  //       match_type_id: addCommentry.matchTypeId,
  //       event_id: addCommentry.eventRefId,
  //     },
  //     "/api/v1/loadcommentary",
  //     fastify,
  //     request
  //   );
  //   if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
  //     callPrediction.predictioncallSuccess = false;
  //     callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
  //     callPrediction.endPoint = '/api/v1/loadcommentary';
  //   } else {
  //     callPrediction.predictioncallSuccess = true;
  //     callPrediction.predictionMessage = 'Prediction call successful';
  //     callPrediction.endPoint = '/api/v1/loadcommentary';
  //   }
  // }

  if (
    addCommentry.commentaryStatus != 4 &&
    addCommentry.isPredictMarket == true
  ) {
    callDataProvider(
      {
        commentaryId: addCommentry.commentaryId,
        serviceType: ServiceType.dataProviderAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        type: "create"
      },
      fastify
    ).catch((err) => {
      console.log("call data provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/createCommentaryService",
        request
      );
    });
  }
  updateComInMarketService({
    commentaryId: addCommentry.commentaryId,
    eventRefId: addCommentry.eventRefId,
  }, request, fastify).catch((err) => {
    console.log("upate com in market service console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/createCommentaryService",
      request
    );
  });

  if (addCommentry.isActive) {
    let cData = await getMatchDataByCId({
      commentaryId: addCommentry.commentaryId,
    }, request, fastify);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData
      },
      request,
      fastify
    ).catch((err) => {
      console.log("call client api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/createCommentaryService",
        request
      );
    });
  }

  // const urlEventRefId = addCommentry.eventRefId;
  // let teamNames = `${addCommentry.team1Name}-v-${addCommentry.team2Name}`
  // teamNames = teamNames.replace(/ /g, "-");
  // const leagueName = addCommentry.competition.replace(/ /g, "-");
  // let matchDate;
  // if (typeof addCommentry.eventDate === "string") {
  //     matchDate = addCommentry.eventDate.split("T")[0];
  // } else if (addCommentry.eventDate instanceof Date) {
  //     matchDate = addCommentry.eventDate.toISOString().split("T")[0];
  // } else {
  //     matchDate = "";
  // }
  // await handleSitemapUpdate(`full-score/${urlEventRefId}/${matchDate}/${leagueName}/${teamNames}`)
  addCommentry.callPrediction = callPrediction
  return addCommentry;
};

const updateCommentaryService = async (request, fastify) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  // chech if isPredictMarket is true then check if commentaryStatus is 1 or 2
  if (
    request.body.isPredictMarket !== undefined &&
    request.body.isPredictMarket == true &&
    global.tblCommentaries[index].isPredictMarket !==
    request.body.isPredictMarket
  ) {
    if (
      global.tblCommentaries[index].commentaryStatus !== 1 &&
      global.tblCommentaries[index].commentaryStatus !== 2
    ) {
      throw new Error(
        "Predictor market can't be enabled for inProgress or completed commentary"
      );
    }
  }

  // eventRefId should be unique
  const validateEventRefId = global.tblCommentaries.find(
    (item) =>
      item.eventRefId === request.body.eventRefId?.trim() &&
      item?.commentaryId !== request.body.commentaryId
  );
  if (validateEventRefId) {
    throw new Error("EventRefId should be unique");
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

  if (
    updatedData.isPredictMarket == true &&
    updatedData.commentaryStatus != 4
  ) {
    callDataProvider(
      {
        commentaryId: updatedData.commentaryId,
        serviceType: ServiceType.dataProviderAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        type: "update"
      },
      fastify
    ).catch((err) => {
      console.log("call data provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateCommentaryService",
        request
      );
    });
  }

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
    (item) => item?.commentaryId === commentaryId
  );

  if (!originalCommentary) {
    throw new Error("Commentary with this id not Found");
  }

  // check if eventRefId is unique
  const validateEventRefId = global.tblCommentaries.find(
    (item) => item.eventRefId === request.body.eventRefId?.trim()
  );
  if (validateEventRefId) {
    throw new Error("EventRefId should be unique");
  }

  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === originalCommentary.matchTypeId
  );
  if (!validateMatchTypeId) {
    throw new Error("MatchType with this id not Found");
  }

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
    teamMaxOver: validateMatchTypeId.maxOversInFirstInings,
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
            {
              ...info,
              matchTypeId: request.body.matchTypeId,
            },
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
          {
            ...info,
            matchTypeId: request.body.matchTypeId,
          },
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

  if (
    newCommentary.isPredictMarket == true &&
    newCommentary.commentaryStatus != 4
  ) {
    callDataProvider(
      {
        commentaryId: newCommentary.commentaryId,
        serviceType: ServiceType.dataProviderAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        type: "create"
      },
      fastify
    ).catch((err) => {
      console.log("call data provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/cloneCommentaryService",
        request
      );
    });
  }
  updateComInMarketService({
    commentaryId: newCommentary.commentaryId,
    eventRefId: newCommentary.eventRefId,
  }, request, fastify).catch((err) => {
    console.log("update com in market service console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/cloneCommentaryService",
      request
    );
  });


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
  if (newCommentary.isActive) {
    let cData = await getMatchDataByCId({
      commentaryId: newCommentary.commentaryId,
    }, request, fastify);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData
      },
      request,
      fastify
    ).catch((err) => {
      console.log("call client api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/cloneCommentaryService",
        request
      );
    });
  }

  // const urlEventRefId = newCommentary.eventRefId;
  // let teamNames = `${newCommentary.team1Name}-v-${newCommentary.team2Name}`
  // teamNames = teamNames.replace(/ /g, "-");
  // const leagueName = newCommentary.competition.replace(/ /g, "-");
  // let matchDate;
  // if (typeof newCommentary.eventDate === "string") {
  //     matchDate = newCommentary.eventDate.split("T")[0];
  // } else if (newCommentary.eventDate instanceof Date) {
  //     matchDate = newCommentary.eventDate.toISOString().split("T")[0];
  // } else {
  //     matchDate = "";
  // }
  // await handleSitemapUpdate(`full-score/${urlEventRefId}/${matchDate}/${leagueName}/${teamNames}`)
  return newCommentary;
};

const loadMultiCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let _resFromPredictAPI;
  let callPredictions = [];
  for (const currId of commentaryId) {
    const originalCommentary = global.tblCommentaries.find(
      (item) => item?.commentaryId === currId
    );

    if (!originalCommentary) {
      throw new Error("Commentary with this id not Found");
    }
    if (
      originalCommentary.isPredictMarket == true &&
      (originalCommentary.commentaryStatus == 2 ||
        originalCommentary.commentaryStatus == 3)
    ) {
      _resFromPredictAPI = null;
      let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
      let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
      let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: originalCommentary.commentaryId,
          match_type_id: originalCommentary.matchTypeId,
          event_id: originalCommentary.eventRefId,
          default_ball_faced: parseInt(key1?.value) || 0,
          default_player_boundaries: parseInt(key2?.value) || 0,
          default_player_runs: parseInt(key3?.value) || 0,
        },
        "/api/v1/loadcommentary",
        fastify,
        request
      );
      let callPrediction = {}
      // Check for error_msg in the response
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.Cid = currId;
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = '/api/v1/loadcommentary';
        callPredictions.push(callPrediction);
      }
    }
  }
  //return `Commentaries loaded successfully`;
  return {
    message: "Commentaries loaded successfully",
    callPredictions: callPredictions,
  };
};

const deleteCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let eventIdArr = [];

  for (const commentary of commentaryId) {
    let eventId = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentary
    );
    eventIdArr.push(eventId.eventRefId);
    await deleteCommentryQuery(commentary, request, fastify);
    await updateEventMarketCloseQuery(commentaryId, request, fastify)
  }

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  callClientAPI({
    serviceType: ServiceType.clientAPI,
    moduleType: APIEndpointModuleType.commentaryUpdate,
    data: {
      type: "deleteEvent",
      eventId: eventIdArr
    }
  }, request, fastify).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteCommentaryService",
      request
    );
  });

  callDataProvider(
    {
      commentaryId: commentaryId,
      serviceType: ServiceType.dataProviderAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      type: "delete"
    },
    fastify
  ).catch((err) => {
    console.log("call data provider console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteCommentaryService",
      request
    );
  });
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
    let _sendPrePlayers = [];
    let commentaryData;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
    }

    let previousCommentaryStatus, statusToUpdate;
    // validate CommentaryId
    if (commentaryDetails) {
      commentaryIndex = global.tblCommentaries.findIndex(
        (item) => item?.commentaryId === commentaryDetails.commentaryId
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
        (item) => item.commentaryBallByBallId == deleteCommentaryBallByBallId
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
            item?.commentaryId === team.commentaryId &&
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
          (item) => item?.commentaryId === commentaryOvers.commentaryId
        );

        if (overIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
        const indexTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId
        );

        if (indexTeam === -1) {
          throw new Error("Team with this id not Found");
        }
        const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
          return (
            item?.commentaryId === commentaryOvers.commentaryId &&
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
          (item) => item?.commentaryId === commentaryBallByBall.commentaryId
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
          (item) => item?.commentaryId === commentaryWicket.commentaryId
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
          (item) => item?.commentaryId === commentaryPartnership.commentaryId
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
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13,$14 ,$15, $16, $17
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
          deleteCommentaryBallByBallId || deleteOverId ? true : false,
          deleteCommentaryBallByBallId || deleteOverId ? request.userTokenInfo.WrUserId : null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // if got object then push in global obj else update the global
    updatedData = updatedData[0];
    const response = {};

    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
      };
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
      };
      if (
        previousCommentaryStatus != statusToUpdate
      ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update"
          },
          fastify
        ).catch((err) => {
          console.log("call data provider console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/testStoreProcedureService",
            request
          );
        });
      }
      // close the market if commentary Close

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = team;
      });
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: commentaryTeams,
      });
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

      if (commentaryBallByBall) {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ===
            commentaryBallByBall.commentaryBallByBallId
        );
      }
      // call predictscore
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 1
      );
      const previousBall = global.tblCommentaryBallByBall
        .filter(
          (item) =>
            item?.commentaryId === commentaryId &&
            item.ballType > 0 &&
            item.currentInnings === commentaryData.currentInnings &&
            item.teamId === strikeTeam.teamId
        )
        .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0];
      if (previousBall) {
        const decimalOverCount = parseFloat(previousBall.overCount);
        const _wkt = previousBall.ballIsWicket;
        callPredictorMarket(
          {
            commentary_id: commentaryData.commentaryId,
            match_type_id: commentaryData.matchTypeId,
            ball: decimalOverCount,
            run: previousBall.ballRun,
            total_score: strikeTeam.teamScore,
            strike_team_id: strikeTeam.teamId,
            wicket: _wkt == true ? 1 : 0,
            total_wicket: strikeTeam.teamWicket,
          },
          "/api/v1/undoscore",
          fastify,
          request
        ).catch((err) => {
          console.log("call predictor market console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/testStoreProcedureService",
            request
          );
        });
      }
    }
    if (deleteOverId) {
      global.tblOvers = global.tblOvers.filter(
        (item) => item.overId !== deleteOverId
      );
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.overId !== deleteOverId
      );
      if (commentaryOvers) {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
      }
    }
    if (commentaryPlayers) {
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        global.tblCommentaryPlayers[index] = player;
      });

      let _plyers = commentaryPlayers.filter((_fil) => _fil.isPlay === true && _fil.onStrike !== null);
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.playerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || '0';
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10)) ? 0 : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10)) ? 0 : parseInt(player.batSix ?? 0, 10));
        _sendPrePlayers.push(_sendPrePlayer);
      });
      // sendDataForSocketUpdate.dataToUpdate.push({
      //   module: "commentaryPlayers",
      //   type: "update",
      //   data: commentaryPlayers,
      // });
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: commentaryPlayers,
      });
    }
    if (commentaryOvers) {
      if (updatedData.overDetails) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      } else {
        if (!deleteOverId) {
          overIndex !== -1
            ? (global.tblOvers[overIndex] = commentaryOvers)
            : null;
        }
        if (deleteOverId && commentaryOvers.overId !== deleteOverId) {
          overIndex !== -1
            ? (global.tblOvers[overIndex] = commentaryOvers)
            : null;
        }
        response.overdetails = commentaryOvers;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    if (commentaryBallByBall) {
      if (updatedData.commentaryBallByBallDetails) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;

        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "create",
          data: response.commentaryBallByBallDetails,
        });

        // call the predictor market
        if (
          commentaryData.isPredictMarket &&
          updatedData.commentaryBallByBallDetails.ballType > 0
        ) {
          let strikeTeam = global.tblCommentaryTeams.find(
            (item) =>
              item?.commentaryId === commentaryBallByBall.commentaryId &&
              item.teamStatus === 1
          );

          let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;

          callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: decimalOverCount,
              run: commentaryBallByBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
              wicket: _wkt === true ? 1 : 0,
              total_wicket: strikeTeam.teamWicket,
            },
            "/api/v1/predictscore",
            fastify,
            request
          ).catch((err) => {
            console.log("call predictor market console", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/testStoreProcedureService",
              request
            );
          });
          try {
            const isFDS = global.tblConfigs.find((item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI).value;
            if (isFDS && isFDS == 'true') {
              if (_wkt || _bory) {
                const now = new Date();
                const formattedDate = formatDateToISOString(now);
                callfds(
                  {
                    Id: 0,
                    EventId: parseInt(commentaryData.eventRefId),
                    BWDateTime: (await formattedDate).toString,
                    Type: _bory === true ? "2" : _wkt === true ? "1" : ""
                  },
                  "/api/transactions/SaveBoundryWicket",
                  fastify,
                  request
                ).catch((err) => {
                  console.log("call fds console", err);
                  errorLogger(
                    fastify,
                    err.message,
                    "ERROR --> services/commentary.js/testStoreProcedureService",
                    request
                  );
                });
              }
            }
          } catch (error) { }
        }
      } else {
        // if(ballByBallIndex !== -1){
        //   global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
        // }
        if (!deleteCommentaryBallByBallId) {
          ballByBallIndex !== -1
            ? (global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall)
            : null;
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryBallByBall.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          ballByBallIndex !== -1
            ? (global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall)
            : null;
        }
        response.commentaryBallByBallDetails = commentaryBallByBall;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: response.commentaryBallByBallDetails,
        });
      }
    }
    if (commentaryWicket) {
      if (updatedData.commentaryWicketDetails) {
        global.tblCommentaryWicket.push(updatedData.commentaryWicketDetails);
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "create",
          data: response.commentaryWicketDetails,
        });
      } else {
        global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
        response.commentaryWicketDetails = commentaryWicket;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "update",
          data: response.commentaryWicketDetails,
        });
      }
    }
    if (commentaryPartnership) {
      if (updatedData.commentaryPartnershipDetails) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          commentaryPartnership;
        response.commentaryPartnershipDetails = commentaryPartnership;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });
      }
    }
    if (deleteCommentaryBallByBallId) {
      response.deleteCommentaryBallByBallId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deleteCommentaryBallByBallId",
        type: "delete",
        data: {
          deleteCommentaryBallByBallId,
        },
      });
    }
    if (deleteOverId) {
      response.deleteOverId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deleteOverId",
        type: "delete",
        data: {
          deleteOverId,
        },
      });
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
      ).catch((err) => {
        console.log("handle market close service console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/testStoreProcedureService",
          request
        );
      });

      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
          match_type_id: commentaryDetails.matchTypeId,
          event_id: commentaryDetails.eventRefId,
        },
        "/api/v1/loadcommentary",
        fastify,
        request
      ).catch((err) => {
        console.log("call predictor market console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/testStoreProcedureService",
          request
        );
      });
    }

    if (
      commentaryDetails &&
      commentaryData.isPredictMarket == true &&
      statusToUpdate == 4
    ) {
      await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request
      ).catch((err) => {
        console.log("call perdictor market console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/testStoreProcedureService",
          request
        );
      });
    }

    // call the getscore and emit the event data
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: commentaryData.eventRefId,
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("commentary details by event id service console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/testStoreProcedureService",
          request
        );
      });

      // if(commentaryId){
      //   let marketRunner = global.tblEventMarkets.filter((item) => item?.commentaryId == commentaryId && item.rateSource === 2)
      //   marketRunner = marketRunner.map((item) => {
      //     let teamNameData
      //     if(item.teamId){
      //     teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
      //     }
      //     if(!item.teamId){
      //         teamNameData = global.tblCommentaryTeams.find((t) => 
      //             t.teamName.toLowerCase() == item.runner?.toLowerCase())
      //     }
      //     return {
      //         runnerId: item.runnerId,
      //         runner: item.runner,
      //         selectionId: item.selectionId,
      //         backSize: item.backSize,
      //         laySize: item.laySize,
      //         backPrice: item.backPrice,
      //         layPrice: item.layPrice,
      //         teamId: item.teamId,
      //         teamName: teamNameData?.teamName || null
      //     }
      // });
      //   sendDataForSocketUpdate.dataToUpdate.push({
      //     module: "marketRunner",
      //     type: "update",
      //     data: marketRunner,
      //   });
      // }

      global.clientSocketIo?.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }

    if (global.wss) {
      let res = {};
      res.eventname = "ShortScore";
      res.connectionID = "";
      let _ShortCommentry = setShortCommenrty(commentaryData.eventRefId);
      _ShortCommentry = JSON.stringify(_ShortCommentry);
      res.data = _ShortCommentry;
      // Iterate over all connected clients and send the update
      global.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(res));
        }
      });
    }

    if (
      commentaryDetails && _sendPrePlayers &&
      commentaryData.isPredictMarket == true &&
      previousCommentaryStatus == 3 &&
      updatedData.commentaryBallByBallDetails
    ) {
      let strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryData.commentaryId &&
          item.teamStatus === 1
      );
      let decimalOverCount;
      try {
        decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      }
      catch (error) {
        decimalOverCount = 0;
      }

      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount,
          player_details: _sendPrePlayers,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
          ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
          : null
        },
        "/api/v1/playerpredictscore",
        fastify,
        request
      ).catch((err) => {
        console.log("call predictor market console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/testStoreProcedureService",
          request
        );
      });
    }

    return response;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

const syncCommentaryStatsWithAPIAndSocket = async (request, fastify) => {
  // check sp
  try {
    let {
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
      isEndInnings
    } = request.body;

    let commentaryIndex,
      overIndex,
      ballByBallIndex,
      wicketIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let _resFromPredictAPI;
    let callPredictions = [];
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
    }

    let previousCommentaryStatus, statusToUpdate, balltypeOfdeleteBall;
    let strikeTeamForEndInnings;
    if (isEndInnings && isEndInnings == true) {
      strikeTeamForEndInnings = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.teamStatus === 1 &&
          item.currentInnings === commentaryData.currentInnings
      );
    }
    // get th strike team
    // validate CommentaryId
    if (commentaryDetails) {
      commentaryIndex = global.tblCommentaries.findIndex(
        (item) => item?.commentaryId === commentaryDetails.commentaryId
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
        (item) => item.commentaryBallByBallId == deleteCommentaryBallByBallId
      );
      if (deleteBallIndex === -1) {
        throw new Error("Delete BallByBall with this id not Found savedetails");
      }
      balltypeOfdeleteBall = global.tblCommentaryBallByBall[deleteBallIndex].ballType;
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
            item?.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      });
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter((player) => player.commentaryPlayerId != null || player.commentaryPlayerId != undefined);
      commentaryPlayers.forEach((player) => {
        if (player.commentaryPlayerId) {
          const index = global.tblCommentaryPlayers.findIndex(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId
          );
          if (index === -1) {
            throw new Error("Commentary Player with this id not Found");
          }
        }
      });
    }
    //validate over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        overIndex = global.tblCommentaries.findIndex(
          (item) => item?.commentaryId === commentaryOvers.commentaryId
        );

        if (overIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
        const indexTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId
        );

        if (indexTeam === -1) {
          throw new Error("Team with this id not Found");
        }
        const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
          return (
            item?.commentaryId === commentaryOvers.commentaryId &&
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
          (item) => item?.commentaryId === commentaryBallByBall.commentaryId
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
          (item) => item?.commentaryId === commentaryWicket.commentaryId
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
          (item) => item?.commentaryId === commentaryPartnership.commentaryId
        );
        if (partnershipIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_setcommentary(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13,$14 ,$15, $16, $17
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
          deleteCommentaryBallByBallId || deleteOverId ? true : false,
          deleteCommentaryBallByBallId || deleteOverId ? request.userTokenInfo.WrUserId : null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // if got object then push in global obj else update the global
    updatedData = updatedData[0];
    const response = {};

    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
        currentInnings: commentaryDetails.currentInnings,
      };
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: commentaryDetails.updateTime,
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        commentaryCloseTime:
          commentaryDetails.commentaryStatus == 4 ? new Date() : null,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        winnerId: commentaryDetails.winnerId,
        winnerName: commentaryDetails.winnerName,
        result: commentaryDetails.result || "",
        currentInnings: commentaryDetails.currentInnings,
        isPredict: commentaryDetails.isPredictMarket
      };
      if (
        previousCommentaryStatus != statusToUpdate
      ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update"
          },
          fastify
        ).catch((err) => {
          console.log("call Data Provider console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      if (previousCommentaryStatus != statusToUpdate) {
        const cData = await getMatchDataByCId({
          commentaryId: commentaryId,
        },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData
          },
          request,
          fastify
        ).catch((err) => {
          console.log("call client api console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryTeams) {
      response.commentaryTeams = [];
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = team;
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);

      });
      try {
        commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
          }
        });
      } catch (error) {

      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: commentaryTeams,
      });
    }
    if (deleteCommentaryBallByBallId) {
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.commentaryBallByBallId != deleteCommentaryBallByBallId
      );
      global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
        (item) => item.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      try {
        _deleteBallID = {}
        _deleteBallID.commentaryBallByBallId = deleteCommentaryBallByBallId;
        _deleteBallID.commentaryId = commentaryId;
        await deleteMarketOddsBallByBall(_deleteBallID, fastify, request)
      } catch (error) {
        console.log("delete market odds ball by ball console", error);
        errorLogger(
          fastify,
          error.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      }

      if (commentaryBallByBall) {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ==
            commentaryBallByBall.commentaryBallByBallId
        );
      }
      if (commentaryPartnership) {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
      }
      if (commentaryWicket) {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId ===
            commentaryWicket.commentaryWicketId
        );
      }
      // call predictscore
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 1
      );
      const previousBall = global.tblCommentaryBallByBall
        .filter(
          (item) =>
            item?.commentaryId === commentaryId &&
            item.ballType > 0 &&
            item.currentInnings === commentaryData.currentInnings &&
            item.teamId === strikeTeam.teamId
        )
        .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0];
      if (balltypeOfdeleteBall > 0 && previousBall) {
        if (commentaryData.isPredictMarket) {
          //_resFromPredictAPI = null;
          const decimalOverCount = parseFloat(previousBall.overCount);
          const _wkt = previousBall.ballIsWicket;
          //_resFromPredictAPI = await 
          callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: decimalOverCount,
              run: previousBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
              wicket: _wkt === true ? 1 : 0,
              total_wicket: strikeTeam.teamWicket,
              ball_by_ball_id: deleteCommentaryBallByBallId
                ? parseInt(deleteCommentaryBallByBallId)
                : null
            },
            "/api/v1/undoscore",
            fastify,
            request
          ).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
              request
            );
          });
          // let callPrediction = {};
          // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
          //   callPrediction.predictioonAPI = "undoscore"
          //   callPrediction.predictioncallSuccess = false;
          //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
          //   callPrediction.endPoint = '/api/v1/undoscore';
          //   callPredictions.push(callPrediction);
          // }
        }
      }
    }
    if (deleteOverId) {
      global.tblOvers = global.tblOvers.filter(
        (item) => item.overId !== deleteOverId
      );
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => item.overId != deleteOverId
      );
      if (commentaryOvers) {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
      }
      if (commentaryBallByBall) {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) => item.overId == commentaryBallByBall.overId
        );
      }
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        global.tblCommentaryPlayers[index] = player;
        response.commentaryPlayers.push(global.tblCommentaryPlayers[index]);
      });

      let _plyers = commentaryPlayers.filter((_fil) => _fil.isPlay === true && _fil.onStrike !== null);
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || '0';
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10)) ? 0 : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10)) ? 0 : parseInt(player.batSix ?? 0, 10));
        _sendPrePlayer.balls_faced = player.batBall || 0;
        _sendPrePlayers.push(_sendPrePlayer);
      });
      
      try {
        commentaryPlayers.forEach(async (player) => {
          if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
            player.bowlerOver = player.bowlerOver.toString();
          }
          if (player.bowlerEconomy === "NaN") {
            player.bowlerEconomy = null;
          }
          const _player = global.tblPlayers.filter((item) => item.playerId === player.playerId);
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) {

      }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: commentaryPlayers,
      });
    }
    if (commentaryOvers) {
      if (updatedData.overDetails) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      } else {
        if (!deleteOverId) {
          if (overIndex !== -1) {
            global.tblOvers[overIndex] = commentaryOvers;
          }
        }
        if (deleteOverId && commentaryOvers.overId !== deleteOverId) {
          if (overIndex !== -1) {
            global.tblOvers[overIndex] = commentaryOvers;
          }
        }
        response.overdetails = commentaryOvers;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    if (commentaryBallByBall) {
      if (updatedData.commentaryBallByBallDetails) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;

        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "create",
          data: { ...response.commentaryBallByBallDetails, overCount: response.commentaryBallByBallDetails.overCount !== null ? response.commentaryBallByBallDetails.overCount.toString() : null },
        });

        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(commentaryId, updatedData.commentaryBallByBallDetails, fastify);
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create"
                });
              }
            }
          }
        }
        if (
          commentaryData.isPredictMarket &&
          updatedData.commentaryBallByBallDetails.ballType > 0
        ) {
          let strikeTeam = global.tblCommentaryTeams.find(
            (item) =>
              item?.commentaryId === commentaryBallByBall.commentaryId &&
              item.teamStatus === 1
          );

          let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          //_resFromPredictAPI = null;
          //_resFromPredictAPI = await 
          callPredictorMarket(
            {
              commentary_id: commentaryData.commentaryId,
              match_type_id: commentaryData.matchTypeId,
              ball: decimalOverCount,
              run: commentaryBallByBall.ballRun,
              total_score: strikeTeam.teamScore,
              strike_team_id: strikeTeam.teamId,
              wicket: _wkt === true ? 1 : 0,
              total_wicket: strikeTeam.teamWicket,
              ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
                ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
                : null
            },
            "/api/v1/predictscore",
            fastify,
            request
          ).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket/callpredaictorMarket",
              request
            );
          });
          // let callPrediction = {};
          // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
          //   callPrediction.predictioonAPI = "predictscore"
          //   callPrediction.predictioncallSuccess = false;
          //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
          //   callPrediction.endPoint = '/api/v1/predictscore';
          //   callPredictions.push(callPrediction);
          // }
        }
      } else {
        // if(ballByBallIndex !== -1){
        //   global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
        // }
        if (!deleteCommentaryBallByBallId) {
          // ballByBallIndex !== -1
          //   ? (global.tblCommentaryBallByBall[ballByBallIndex] =
          //       commentaryBallByBall)
          //   : null;
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryBallByBall.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
          }
        }
        response.commentaryBallByBallDetails = commentaryBallByBall;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: { ...response.commentaryBallByBallDetails, overCount: response.commentaryBallByBallDetails.overCount !== null ? response.commentaryBallByBallDetails.overCount.toString() : null },
        });
      }
      // call Third Party API
      if (response.commentaryBallByBallDetails.ballType > 0) {
        try {
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          const isFDS = global.tblConfigs.find((item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI).value;
          if (isFDS && isFDS == 'true') {
            if (_wkt || _bory) {
              callfds(
                {
                  Id: 0,
                  EventId: parseInt(commentaryData.eventRefId),
                  BWDateTime: '',
                  Type: _bory === true ? "2" : _wkt === true ? "1" : ""
                },
                "/api/transactions/SaveBoundryWicket",
                fastify,
                request
              ).catch((err) => {
                errorLogger(
                  fastify,
                  err.message,
                  "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
                  request
                );
              });
            }
          }
        } catch (error) {
          console.log("error in console:", error)
          errorLogger(
            fastify,
            error.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
      }
    }
    if (commentaryWicket) {
      if (commentaryWicket.commentaryWicketId == 0) {
        global.tblCommentaryWicket.push(updatedData.commentaryWicketDetails);
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "create",
          data: response.commentaryWicketDetails,
        });
      } else {
        // global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
        // response.commentaryWicketDetails = commentaryWicket;
        // sendDataForSocketUpdate.dataToUpdate.push({
        //   module: "commentaryWicket",
        //   type: "update",
        //   data: response.commentaryWicketDetails,
        // });
        if (!deleteCommentaryBallByBallId) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] = updatedData.commentaryWicketDetails;
          }
        }
        if (deleteCommentaryBallByBallId && commentaryWicket.commentaryBallByBallId !== deleteCommentaryBallByBallId) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] = updatedData.commentaryWicketDetails;
          }
        }
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        if (deleteCommentaryBallByBallId != commentaryWicket.commentaryBallByBallId) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryWicket",
            type: "update",
            data: response.commentaryWicketDetails,
          });
        }
      }
    }
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image = _player1[0].playerimage;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image = _player2[0].playerimage;
            }
          } catch (error) {

          }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails = updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image = _player1[0].playerimage;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image = _player2[0].playerimage;
            }
          } catch (error) {

          }
        }

        // sendDataForSocketUpdate.dataToUpdate.push({
        //   module: "commentaryPartnership",
        //   type: "update",
        //   data: response.commentaryPartnershipDetails,
        // });
        if (!deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
          }
        }
        if (deleteCommentaryBallByBallId && commentaryPartnership.commentaryBallByBallId !== deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] = updatedData.commentaryPartnershipDetails;
          }
        }
        response.commentaryPartnershipDetails = updatedData.commentaryPartnershipDetails;
        if (deleteCommentaryBallByBallId != commentaryPartnership.commentaryBallByBallId) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPartnership",
            type: "update",
            data: response.commentaryPartnershipDetails,
          });
        }
      }
    }
    if (deleteCommentaryBallByBallId) {
      response.deleteCommentaryBallByBallId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        // module: "deleteCommentaryBallByBallId",
        // type: "delete",
        // data: deleteCommentaryBallByBallId,
        module: "commentaryBallByBall",
        type: "delete",
        data: { commentaryBallByBallId: deleteCommentaryBallByBallId },
      });
    }
    if (deleteOverId) {
      response.deleteOverId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        // module: "deleteOverId",
        // type: "delete",
        // data: deleteOverId,
        module: "commentaryOvers",
        type: "delete",
        data: { overId: deleteOverId },
      });
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
      ).catch((err) => {
        console.log("handle market closes services console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
      let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
      let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
          match_type_id: commentaryDetails.matchTypeId,
          event_id: commentaryDetails.eventRefId,
          default_ball_faced: parseInt(key1?.value) || 0,
          default_player_boundaries: parseInt(key2?.value) || 0,
          default_player_runs: parseInt(key3?.value) || 0,
        },
        "/api/v1/loadcommentary",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      setLineRatioInComService(
        {
          commentaryId: commentaryDetails.commentaryId,
          matchTypeId: commentaryData.matchTypeId
        },
        request,
        fastify
      ).catch((err) => {
        console.log("setLineRatioInComService console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/setLineRatioInComService",
          request
        );
      });
    }

    if (
      commentaryDetails &&
      commentaryData.isPredictMarket == true &&
      statusToUpdate == 4
    ) {
      await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      callPredictorMarket(
        {
          commentary_id: commentaryDetails.commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      let competition = global.tblCompetitions.find(
        (item) => item.competitionId === commentaryDetails.competitionId
      );
      if (competition.isEventSnap == true) {
        setCompEventSnapSerice([{
          commentaryId: commentaryDetails.commentaryId,
          eventRefId: commentaryDetails.eventRefId,
          competitionId: commentaryDetails.competitionId,
          eventTypeId: commentaryDetails.eventTypeId,
        }], request, fastify)
          .catch((err) => {
            console.log("setCompEventSnapSerice console", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setCompEventSnapSerice",
              request
            );
          });
      }
      if (competition.isPointTable == true) {
        setTeamPointService([{
          commetaryId: commentaryDetails.commentaryId,
          competitionId: commentaryDetails.competitionId,
          team1Id: commentaryDetails.team1Id,
          team2Id: commentaryDetails.team2Id,
          winnerId: commentaryDetails.winnerId,
        }], request, fastify)
          .catch((err) => {
            console.log("setTeamPointService console", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/setTeamPointServicsyncCommentaryStatsWithAPIAndSocket - setTeamPointService",
              request
            );
          })
      }
    }

    // call the getscore and emit the event data
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: commentaryData.eventRefId,
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );

      })

      // if(commentaryId){
      //   let marketRunner = global.tblEventMarkets.filter((item) => item?.commentaryId == commentaryId && item.rateSource === 2)
      //   marketRunner = marketRunner.map((item) => {
      //     let teamNameData
      //     if(item.teamId){
      //     teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
      //     }
      //     if(!item.teamId){
      //         teamNameData = global.tblCommentaryTeams.find((t) => 
      //             t.teamName.toLowerCase() == item.runner?.toLowerCase())
      //     }
      //     return {
      //         runnerId: item.runnerId,
      //         runner: item.runner,
      //         selectionId: item.selectionId,
      //         backSize: item.backSize,
      //         laySize: item.laySize,
      //         backPrice: item.backPrice,
      //         layPrice: item.layPrice,
      //         teamId: item.teamId,
      //         teamName: teamNameData?.teamName || null
      //     }
      // });
      //   sendDataForSocketUpdate.dataToUpdate.push({
      //     module: "marketRunner",
      //     type: "update",
      //     data: marketRunner,
      //   });
      // }

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }

    if (global.wss) {
      let res = {};
      res.eventname = "ShortScore";
      res.connectionID = "";
      let _ShortCommentry = setShortCommenrty(commentaryData.eventRefId);
      _ShortCommentry = JSON.stringify(_ShortCommentry);
      res.data = _ShortCommentry;
      // Iterate over all connected clients and send the update
      global.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(res));
        }
      });
    }

    let strikeTeam;
    strikeTeam = global.tblCommentaryTeams.find(
      (item) =>
        item?.commentaryId === commentaryData.commentaryId &&
        item.teamStatus === 1
    );
    if (
      commentaryDetails && _sendPrePlayers &&
      commentaryData.isPredictMarket == true &&
      previousCommentaryStatus == 3 &&
      updatedData.commentaryBallByBallDetails
    ) {
      let decimalOverCount;
      try {
        decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      }
      catch (error) {
        decimalOverCount = 0;
      }
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount,
          player_details: _sendPrePlayers,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
          ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
          : null
        },
        "/api/v1/playerpredictscore",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "playerpredictscore"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/playerpredictscore';
      //   callPredictions.push(callPrediction);
      // }
    }
    if (isEndInnings && isEndInnings == true) {
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await 
      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          strike_team_id: strikeTeamForEndInnings.teamId,
        },
        "/api/v1/endinnings",
        fastify,
        request
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      // let callPrediction = {};
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioonAPI = "endinnings"
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/endinnings';
      //   callPredictions.push(callPrediction);
      // }
    }
    await commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: response,
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        apiName: "/saveDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        request
      );
    });
    response.callPredictions = callPredictions;
    return response;
  } catch (error) {
    console.log("console value 7418596", error);
    await commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        apiName: "/saveDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        request
      );
    });
    throw error;
  }
};


const addinMarketBallbyballOdds = async (commentaryId, objball, fastify) => {
  let _resultArray;
  try {
    const filteredCid = global.tblEventMarkets.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);

    if (filteredCid.length > 0 && objball.ballType > 0) {
      // Iterate over tblEventMarkets to build the final structure
      const _dataForOds = filteredCid.reduce((acc, entry) => {
        const mapKey = `${entry.eventMarketId}_${entry.selectionId}`;
        // Check if the mapKey exists in SignalRData
        if (global.SignalRData[mapKey]) {
          const matchedItem = global.SignalRData[mapKey];

          // Create the runner data structure
          const runnerData = {
            teamId: matchedItem.teamId,
            RunnerId: matchedItem.RunnerId,
            BackPrice: matchedItem.BackPrice,
            LayPrice: matchedItem.LayPrice,
            BackSize: matchedItem.BackSize,
            LaySize: matchedItem.LaySize,
            RunnerName: matchedItem.RunnerName,
            selectionId: matchedItem.selectionId,
            timestamp: matchedItem.timestamp
          };

          // Check if EventMarketId already exists in acc
          if (!acc[entry.eventMarketId]) {
            // Initialize a new object for this EventMarketId
            acc[entry.eventMarketId] = {
              commentaryId: commentaryId,
              commentaryBallByBallId: objball.commentaryBallByBallId,
              eventMarketId: entry.eventMarketId,
              marketStatus: entry.status,
              marketName: entry.marketName,
              data: [] // Initialize Data array
            };
          }
          acc[entry.eventMarketId].data.push(runnerData);
        }

        return acc;
      }, {});

      // Convert the result into an array if needed
      _resultArray = Object.values(_dataForOds);

      // Optionally stringify the Data array within each EventMarketId object
      _resultArray.forEach(obj => {
        obj.data = JSON.stringify(obj.data);
      });
      let res;
      if (_resultArray.length > 0) {
        try {
          res = await createMarketOddsBallInSaveDetails(_resultArray[0], fastify, null);
          global.tblMarketOddsBallByBall.push(res);
        } catch (error) {
          errorLogger(
            fastify,
            error.message,
            "ERROR --> createMarketOddsBallInSaveDetails",
            null
          );
        }
        return res;
      }
      else {
        return null;
      }
    }
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/commentary.js/addinMarketBallbyballOdds",
      request
    );
    return null;
  }
};
const setShortCommenrty = (eventId) => {
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );

  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const commentaryTeamsOne = global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === commentary.currentInnings
  );

  const commentaryTeamsTwo = global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team2Id &&
      item.currentInnings === commentary.currentInnings
  );

  let teamScore1, teamScore2, t1sn, t1n, t2sn, t2n;
  if (commentaryTeamsOne) {
    t1sn = commentaryTeamsTwo.shortName;
    t1n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  let es = {
    eti: parseInt(commentary.eventTypeId) || "",
    eid: commentary.eventRefId || "",
    en: commentary.eventName || "",
    te1n: t1n || "",
    te2n: t2n || "",
    t1s: teamScore1 || "",
    t2s: teamScore2 || "",
    pt: 0,
    t1set: null,
    t2set: null,
    t1p: null,
    t2p: null,
  };
  return es;
};
const getTeamAndPlayerListService = async (request, fastify) => {
  // get commentary details
  let commentaryDetails = await global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not Found");
  }
  // get unique team id from commentary teams
  const arrOfTeamId = [];
  let commentaryTeams = await global.tblCommentaryTeams
    .filter((item) => item?.commentaryId === request.body.commentaryId)
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
          item?.commentaryId === request.body.commentaryId &&
          item.teamId === team
      )
      .reduce((acc, curr) => {
        if (!acc.find((player) => player.playerId === curr.playerId)) {
          acc.push({
            teamId: curr.teamId,
            playerId: curr.playerId,
            playerName: curr.playerName,
            batsmanAverage: curr.batsmanAverage,
            batsmanStrikeRate: curr.batsmanStrikeRate,
            commentaryPlayerId: curr.commentaryPlayerId,
            isInPlayingEleven: curr.isInPlayingEleven,
            boundary: curr.boundary,
            playerBallFaced: curr.playerBallFaced
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
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // validate teamId
  let commentaryTeamIndex = global.tblCommentaryTeams.find(
    (item) => item?.commentaryId === commentaryId && item.teamId === teamId
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
    (item) => item?.commentaryId === commentaryId && item.teamId === teamId
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
        matchTypeId: commentary.matchTypeId,
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
//     (item) => item?.commentaryId === request.body.commentaryId
//   );
//   const teamPlayers = global.tblCommentaryPlayers.filter(
//     (item) => item?.commentaryId === request.body.commentaryId
//     && item.currentInnings == 2
//   );
//   const commentaryTeams = global.tblCommentaryTeams.filter(
//     (item) => item?.commentaryId === request.body.commentaryId
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
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // validate teamId
  let commentaryTeamIndex = global.tblCommentaryTeams.find(
    (item) => item?.commentaryId === commentaryId && item.teamId === teamId
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
        item?.commentaryId === commentaryId &&
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
const updateTeamPlayerService = async (request, fastify) => {
  const { body: playerDataArray } = request;
  const sendDataForSocketUpdate = {};
  sendDataForSocketUpdate.dataToUpdate = [{
    module: "commentaryPlayers",
    type: "update",
    data: [],
  }];
  for (const playerData of playerDataArray) {
    // validate commentaryId
    const {
      teamId,
      commentaryId,
      playerId,
      batsmanStrikeRate,
      batsmanAverage,
      isInPlayingEleven,
      boundary,
      playerBallFaced
    } = playerData;
    let commentary = global.tblCommentaries.find(
      (item) => item?.commentaryId === +commentaryId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }
    // validate teamId
    let commentaryTeamIndex = global.tblCommentaryTeams.find(
      (item) => item?.commentaryId === +commentaryId && item.teamId === teamId
    );
    if (commentaryTeamIndex === -1) {
      throw new Error("Team with this id not Found");
    }
    // validate playerId
    let commentaryPlayerIndex = global.tblCommentaryPlayers.findIndex(
      (item) => item.playerId === +playerId
    );
    if (commentaryPlayerIndex === -1) {
      throw new Error("Commentary Player with this id not Found");
    }

    // update the player from commentaryPlayer
    await updateCommentaryPlayerById(
      {
        commentaryId,
        teamId,
        playerId,
        batsmanStrikeRate,
        batsmanAverage,
        isInPlayingEleven,
        boundary,
        playerBallFaced
      },
      request,
      fastify
    );

    let player = global.tblCommentaryPlayers.find(
      (item) =>
        item?.commentaryId === +commentaryId &&
        item.teamId === +teamId &&
        item.playerId === +playerId
    );
    if (player) {
      player.batsmanStrikeRate = batsmanStrikeRate;
      player.batsmanAverage = batsmanAverage;
      player.isInPlayingEleven = isInPlayingEleven;
      player.boundary = boundary;
      player.playerBallFaced = playerBallFaced;
    } else {
      throw new Error("Player not found for update");
    }

    sendDataForSocketUpdate.commentaryId = commentary.commentaryId;
    sendDataForSocketUpdate.eventRefId = commentary.eventRefId;

    sendDataForSocketUpdate.dataToUpdate[0].data.push({ ...player });
  }
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
  }

  return "Player updated successfully";
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
      (item) => item?.commentaryId === commentaryDetails.commentaryId
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

    commentaryLogger(
      {
        commentaryId: request.body.commentaryDetails.commentaryId,
        requestBody: request.body,
        response: {
          message: "Short Commentary saved successfully"
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryDetails.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryDetails.commentaryId
          ),
        },
        apiName: "/saveShortCommentary"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveShortCommentaryService",
        request
      );
    });

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
    (item) => item?.commentaryId === commentaryId
  );

  // Check if the commentary exists
  if (index === -1) {
    throw new Error("Commentary with this id not found");
  }
  let _resFromPredictAPI;
  let callPredictions = [];
  // call predictor endpoint
  if (global.tblCommentaries[index].isPredictMarket) {
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentaryId,
        status: EventMarketStatus.Suspend,
        match_type_id: global.tblCommentaries[index].matchTypeId,
        is_open_market: false
      },
      "/api/v1/updatemarketstatus",
      fastify,
      request
    );
    let callPrediction = {};
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/updatemarketstatus';
      callPredictions.push(callPrediction);
      callPrediction = {};
    }
    _resFromPredictAPI = null;
    let getCategory = global.tblMarketTypeCategories.filter((item) =>
      item.categoryName.toLowerCase() == 'player' || item.categoryName.toLowerCase() == 'wicket' || item.categoryName.toLowerCase() == 'player boundaries'
    ).map((c) => c.marketTypeCategoryId);
    // getmarket id's from tblEventMarkets
    let market = await getMarketsByCategoryQuery({
      categoryId: getCategory,
      commentaryId: commentaryId
    }, request, fastify);

    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentaryId,
        status: EventMarketStatus.Suspend,
        event_market_id: market.map((m) => m.eventMarketId),
      },
      "/api/v1/updateplayerstatus",
      fastify,
      request
    );

    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncall2Success = false;
      callPrediction.predictionCall2Message = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint2 = '/api/v1/updateplayerstatus';
      callPredictions.push(callPrediction);
      callPrediction = {};
    }
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

  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    commentaryDetailsByEventIdService(
      {
        ...request,
        body: {
          eventId: global.tblCommentaries[index].eventRefId,
        },
      },
      fastify,
      "callFromSocket"
    ).catch((err) => {
      console.log("err in commentaryDetailsByEventIdService/updateCommentaryStatusService", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateCommentaryStatusService",
        request
      );
    });

    // global.clientSocketIo.forEach((socket) => {
    //   socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    // });
  }
  commentaryDetails.callPredictions = callPredictions;
  // Return the updated commentary detailss
  if (global.tblCommentaries[index].isPredictMarket) {
    suspendMarketService({
      commentaryId: commentaryId,
    }, request, fastify)
      .catch((err) => {
        console.log("suspendMarketService console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/updateCommentaryStatusService - suspendMarketService",
          request
        );
      });
  }
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
    (item) => item?.commentaryId === commentaryDetails.commentaryId
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
      item?.commentaryId === teamDetails.commentaryId &&
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
    (item) => item?.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const indexTeam = global.tblCommentaryTeams.findIndex(
    (item) =>
      item?.commentaryId === data.commentaryId && item.teamId === data.teamId
  );

  if (indexTeam === -1) {
    throw new Error("Team with this id not Found");
  }

  const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
    // console.log(item.playerId, data.bowlerId);
    return (
      item?.commentaryId === data.commentaryId &&
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
    (item) => item?.commentaryId === data.commentaryId
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
    (item) => item?.commentaryId === data.commentaryId
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
    (item) => item?.commentaryId === data.commentaryId
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
  const ball = global.tblCommentaryBallByBall.find(
    (item) => item.commentaryBallByBallId === commentaryBallByBallId
  );
  if (!ball) {
    throw new Error("BallByBall with this id not Found");
  }
  try {
    await deleteBallByBallCommentoriesQuery(
      request.body.commentaryBallByBallId,
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

    commentaryLogger(
      {
        commentaryId: ball.commentaryId,
        requestBody: request.body,
        response: {
          message: "BallByBall deleted successfully"
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === ball.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === ball.commentaryId
          ),
        },
        apiName: "/deleteBallByBall"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/deleteBallByBallCommentoriesService",
        request
      );
    });

    return true;
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: ball.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message,
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        apiName: "/deleteBallByBall"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/deleteBallByBallCommentoriesService",
        request
      );
    });
    throw new Error(error);
  }
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

const commentaryDetailsByEventIdService = async (
  request,
  fastify,
  functionName = null
) => {
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
    iact: result.isActive,
    t1bg: "",
    t1co: "",
    t2bg: "",
    t2co: "",
    utc: "",
    loc: result.location,
    t1id: result.team1Id,
    t2id: result.team2Id,
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
  let batid = null;
  let ballid = null;
  let mtype = 0;
  let bovr = 0;
  let cst;
  let ics;
  let iact;
  let t1bg;
  let t1co;
  let t2bg;
  let t2co;
  let utc;
  let tpp1, tpp2;
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
  iact = result.isActive;
  utc = result.eventDate;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === cid &&
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
      item?.commentaryId === cid &&
      item.teamId === t2nid &&
      item.currentInnings === currentInning
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    t1co = commentaryTeamsOne[0].teamColor || "";
    t1bg = commentaryTeamsOne[0].backgroundColor || "";
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? '0';
    t1s = teamScore1 + "/" + wicket1 + " (" + overs1 + ")";
    tpp1 = commentaryTeamsOne[0]?.teamPredictionPercentage ?? '0';
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    t2co = commentaryTeamsTwo[0].teamColor || "";
    t2bg = commentaryTeamsTwo[0].backgroundColor || "";

    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? '0';
    t2s = teamScore2 + "/" + wicket1 + " (" + overs1 + ")";
    tpp2 = commentaryTeamsTwo[0]?.teamPredictionPercentage ?? '0';
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
    resultArr.t1n = t1n;
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
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.batid = null;
    resultArr.ballid = null;
    resultArr.tsi = []
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
      if (commentaryTeamsOne[0].teamStatus == 1) {
        resultArr.batid = commentaryTeamsOne[0].teamId;
        resultArr.ballid = commentaryTeamsTwo[0].teamId;
      }
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
      if (commentaryTeamsTwo[0].teamStatus == 1) {
        resultArr.batid = commentaryTeamsTwo[0].teamId;
        resultArr.ballid = commentaryTeamsOne[0].teamId;
      }
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1n;
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
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.tsi = []
  }
  if (getstatus >= 3) {
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
      scot = commentaryTeamsOne[0]?.shortName ?? '0';
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? '0';
      crr = commentaryTeamsOne[0]?.crr ?? '0';
      rrr = commentaryTeamsOne[0]?.rrr ?? '0';
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? '0';
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? '0';
      crr = commentaryTeamsTwo[0]?.crr ?? '0';
      rrr = commentaryTeamsTwo[0]?.rrr ?? '0';
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter(
        (item) =>
          item?.commentaryId === cid &&
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
          item?.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInning
      )
      .slice(-1)[0]; // Get the last 1 overs

    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? '0';
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? '0';
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? '0';
    let _partBall = commentaryPartnership?.totalBalls ?? '0';
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1n;
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
    resultArr.win = result.result || "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.batid = batid;
    resultArr.ballid = ballid;
    resultArr.tsi = []

    // get team score
    if (currentInning > 1) {
      for (let i = 1; i <= currentInning; i++) {
        let t1 = await global.tblCommentaryTeams.find(
          (item) =>
            item?.commentaryId === cid &&
            item.teamId == result.team1Id &&
            item.currentInnings === i
        );
        let t2 = await global.tblCommentaryTeams.find(
          (item) =>
            item?.commentaryId === cid &&
            item.teamId === result.team2Id &&
            item.currentInnings === i
        );
        let t1Score = t1?.teamScore ?? '0';
        let t2Score = t2?.teamScore ?? '0';
        let t1Wicket = t1?.teamWicket ?? 0;
        let t2Wicket = t2?.teamWicket ?? 0;
        let t1Over = t1?.teamOver ?? 0.0;
        let t2Over = t2?.teamOver ?? 0.0;
        resultArr.tsi.push({
          t1s: t1Score + "/" + t1Wicket + " (" + t1Over + ")",
          t2s: t2Score + "/" + t2Wicket + " (" + t2Over + ")",
          inning: i
        })

      }
    }
  }

  let eventType = await global.tblEventTypes.find(
    (eventType) => eventType.eventTypeId === result.eventTypeId
  );
  let competition = await global.tblCompetitions.find(
    (competition) => competition.competitionId === result.competitionId
  );

  resultArr.ed = convertDate(result.eventDate, "DD/MM/YYYY") || "";
  resultArr.et = convertDate(result.eventDate, "hh:mm:ss") || "";
  (resultArr.utc = result.eventDate),
    (resultArr.ety = eventType?.eventType || "");
  resultArr.mtyp = result.matchType || "";
  resultArr.hmtyp = result.historyMatchType || "";
  resultArr.com = competition?.competition || "";
  resultArr.eti = parseInt(eventType.refId) || "";
  resultArr.tpp1 = tpp1;
  resultArr.tpp2 = tpp2;
  resultArr.isPr = result.isPredictMarket === null ? false : result.isPredictMarket;
  // remove out batsman
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === cid &&
      item.teamId === batid &&
      // item.onStrike !== null &&
      item.isPlay == true &&
      item.currentInnings === currentInning &&
      (item.isBatterOut === false || item.isBatterOut === null)
  );

  // if isplay is true then return that bowler
  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === cid &&
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
      bati: playerData?.image,
      trun: player.batRun || '0',
      tball: player.batBall || '0',
      t4: player.batFour || '0',
      t6: player.batSix || '0',
      sr: player.batSrr || '0',
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || '0',
      isp: playerData?.isSystemPlayer,
    };
  });

  const cbl = commentaryPlayersBowler.map((bowler) => {
    let playerData = global.tblPlayers.find(
      (item) => item.playerId === bowler.playerId
    );
    return {
      pid: bowler.playerId,
      pn: bowler.playerName,
      bli: playerData?.image,
      tov: bowler.bowlerOver || '0',
      cob: bowler.bowlerCurrentBall || '0',
      trun: bowler.bowlerRun || '0',
      t4: bowler.bowlerFour || '0',
      t6: bowler.bowlerSix || '0',
      twr: bowler.bowlerWideBallRun || '0',
      twb: bowler.bowlerWideBall || '0',
      tnr: bowler.bowlerNoBallRun || '0',
      tnb: bowler.bowlerNoBall || '0',
      mov: bowler.bowlerMaidenOver || '0',
      twik: bowler.bowlerTotalWicket || '0',
      eco: parseFloat(bowler.bowlerEconomy) || '0',
      dob: bowler.bowlerDotBall || '0',
      exr:
        bowler.bowlerWideBallRun ||
        0 + bowler.bowlerNoBallRun ||
        0 + bowler.bowlerByeBallRun ||
        0 + bowler.bowlerLegByeBallRun ||
        0,
      isp: playerData?.isSystemPlayer,
    };
  });

  const commentaryOvers = global.tblOvers
    .filter(
      (item) =>
        item?.commentaryId === cid && item.currentInnings === currentInning
    )
    .sort((a, b) => a.overId - b.overId)
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
    run: ball.ballRun || '0',
    nbr: ball.ballExtraRun || '0',
    wbr: ball.ballWideBallRun || '0',
    byr: ball.ballByeBallRun || '0',
    lbr: ball.ballLegByeBallRun || '0',
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || '0',
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
    cd: ball.createdDate,
  }));

  // const marketRunnerData = await global.tblEventMarkets.filter((item) => item?.commentaryId == cid && item.rateSource === 2)

  // const mr = marketRunnerData.map((runner) => {
  //   let teamNameData
  //   if(runner.teamId){
  //   teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === runner.teamId)
  //   }
  //   if(!runner.teamId){
  //       teamNameData = global.tblCommentaryTeams.find((t) => 
  //           t.teamName.toLowerCase() == runner.runner?.toLowerCase())
  //   }
  //   return {
  //     rid: runner?.runnerId,
  //     rn: runner?.runner,
  //     sid: runner?.selectionId,
  //     bs: runner?.backSize,
  //     ls: runner?.laySize,
  //     bp: runner?.backPrice,
  //     lp: runner?.layPrice,
  //     tid: runner?.teamId,
  //     tn: teamNameData?.teamName || null
  //   };
  // });

  const allDetails = {
    cm: { ...resultArr, ci: result.currentInnings, cctime: result.commentaryCloseTime, res: result.result },
    cbb,
    cbt,
    cbl,
    mt,
    // mr
  };
  // console.log("allDetails", allDetails);
  // emit the data for update commentary
  if (functionName && functionName == "callFromSocket") {
    //console.log("callFromSocket",allDetails);
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("commentaryUpdate", allDetails);
    });
  }

  // if (functionName && functionName == "runnersFromSocket") {
  //   global.clientSocketIo.forEach((socket) => {
  //     socket.client.emit("commentaryUpdate", allDetails);
  //   });
  // }

  return allDetails;
};

const commentaryDetailsByCommentaryIdService = async (request, fastify) => {
  // convert encyption to decryption
  // const decryptedId = await decryptEncryptionId(
  //   request.body.commentaryId,
  //   fastify
  // );
  // request.body.commentaryId = decryptedId;

  const result = await global.tblCommentaries.find(
    (item) => item?.commentaryId == request.body.commentaryId
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
    iact: result.isActive,
    t1bg: "",
    t1co: "",
    t2bg: "",
    t2co: "",
    utc: "",
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
  let iact;
  let t1bg;
  let t1co;
  let t2bg;
  let t2co;
  let utc;
  let tpp1, tpp2;
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
  iact = result.isActive;
  utc = result.eventDate;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === cid &&
      item.teamId === t1nid &&
      item.currentInnings === currentInnings
  );

  const _batTeams = await global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === cid &&
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
      item?.commentaryId === cid &&
      item.teamId === t2nid &&
      item.currentInnings === currentInnings
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    t1co = commentaryTeamsOne[0].teamColor || "";
    t1bg = commentaryTeamsOne[0].backgroundColor || "";
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? '0';
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    tpp1 = commentaryTeamsOne[0]?.teamPredictionPercentage ?? '0';
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    t2co = commentaryTeamsTwo[0].teamColor || "";
    t2bg = commentaryTeamsTwo[0].backgroundColor || "";
    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? '0';
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    tpp2 = commentaryTeamsTwo[0]?.teamPredictionPercentage ?? '0';
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
    resultArr.t1n = t1n;
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
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
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
    resultArr.t1n = t1n;
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
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
  }
  if (getstatus >= 3) {
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
      scot = commentaryTeamsOne[0]?.shortName ?? '0';
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? '0';
      crr = commentaryTeamsOne[0]?.crr ?? '0';
      rrr = commentaryTeamsOne[0]?.rrr ?? '0';
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? '0';
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? '0';
      crr = commentaryTeamsTwo[0]?.crr ?? '0';
      rrr = commentaryTeamsTwo[0]?.rrr ?? '0';
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter(
        (item) =>
          item?.commentaryId === cid &&
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
          item?.commentaryId === cid &&
          item.teamId === batid &&
          item.currentInnings === currentInnings
      )
      .slice(-1)[0]; // Get the last 1 overs

    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? '0';
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? '0';
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? '0';
    let _partBall = commentaryPartnership?.totalBalls ?? '0';
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventRefId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1n;
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
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
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
  resultArr.hmtyp = result.historyMatchType || "";
  resultArr.com = competition?.competition || "";
  resultArr.eti = parseInt(eventType.refId) || "";
  resultArr.tpp1 = tpp1;
  resultArr.tpp2 = tpp2;
  resultArr.isPr = result.isPredictMarket;
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === cid &&
      item.teamId === batid &&
      item.onStrike !== null &&
      item.currentInnings === currentInnings &&
      (item.isBatterOut === false || item.isBatterOut === null)
  );
  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === cid &&
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
      trun: player.batRun || '0',
      tball: player.batBall || '0',
      t4: player.batFour || '0',
      t6: player.batSix || '0',
      sr: player.batSrr || '0',
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || '0',
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
      tov: bowler.bowlerOver || '0',
      cob: bowler.bowlerCurrentBall || '0',
      trun: bowler.bowlerRun || '0',
      t4: bowler.bowlerFour || '0',
      t6: bowler.bowlerSix || '0',
      twr: bowler.bowlerWideBallRun || '0',
      twb: bowler.bowlerWideBall || '0',
      tnr: bowler.bowlerNoBallRun || '0',
      tnb: bowler.bowlerNoBall || '0',
      mov: bowler.bowlerMaidenOver || '0',
      twik: bowler.bowlerTotalWicket || '0',
      eco: parseFloat(bowler.bowlerEconomy) || '0',
      dob: bowler.bowlerDotBall || '0',
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
        item?.commentaryId === cid && item.currentInnings === currentInnings
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
    run: ball.ballRun || '0',
    nbr: ball.ballExtraRun || '0',
    wbr: ball.ballWideBallRun || '0',
    byr: ball.ballByeBallRun || '0',
    lbr: ball.ballLegByeBallRun || '0',
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || '0',
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
    cd: ball.createdDate
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
    (item) => item?.commentaryId === commentaryId
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
  let _resFromPredictAPI;
  let callPrediction = {};
  // if (updatedData.isPredictMarket == true) {
  //   _resFromPredictAPI = await callPredictorMarket(
  //     {
  //       commentary_id: commentaryId,
  //       match_type_id: matchTypeId,
  //       event_id: updatedData.eventRefId,
  //     },
  //     "/api/v1/loadcommentary",
  //     fastify,
  //     request
  //   );
  //   if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
  //     callPrediction.predictioncallSuccess = false;
  //     callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
  //     callPrediction.endPoint = '/api/v1/loadcommentary';
  //   } else {
  //     callPrediction.predictioncallSuccess = true;
  //     callPrediction.predictionMessage = 'Prediction call successful';
  //     callPrediction.endPoint = '/api/v1/loadcommentary';
  //   }
  // }
  updatedData.callPrediction = callPrediction;
  return updatedData;
};
const getMatchTypeListByCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const validateCommentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
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
  try {
    const { bowlerId, overId, commentaryId, currentInnings } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
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

    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: updatedData,
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        apiName: "/changeBowler"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeBowlerOfCommentaryService",
        request
      );
    });
    return updatedData;
  } catch (err) {
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: err.message,
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        apiName: "/changeBowler"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console chageBowlerOfCommentaryService", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeBowlerOfCommentaryService",
        request
      );
    });
    throw new Error(err);
  }
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
        team.commentaryId === item?.commentaryId &&
        team.teamId === item.team1Id &&
        team.currentInnings === item.currentInnings
    );

    const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
      (team) =>
        team.commentaryId === item?.commentaryId &&
        team.teamId === item.team2Id &&
        team.currentInnings === item.currentInnings
    );
    let teamScore1, teamScore2, batid, ballid;
    if (commentaryTeamsOne) {
      const wicket1 =
        commentaryTeamsOne.teamWicket === null
          ? 0
          : commentaryTeamsOne.teamWicket;
      const overs1 =
        commentaryTeamsOne.teamOver === null
          ? 0.0
          : commentaryTeamsOne.teamOver;
      teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
      teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
        batid = commentaryTeamsOne.teamId;
        ballid = commentaryTeamsTwo.teamId;
      } else {
        crr = commentaryTeamsTwo.crr;
        rrr = commentaryTeamsTwo.rrr;
        batid = commentaryTeamsTwo.teamId;
        ballid = commentaryTeamsOne.teamId;
      }
    }

    //Tossteam Name
    const TossTeamName = await global.tblCommentaryTeams.find(
      (team) =>
        team.commentaryId === item?.commentaryId &&
        team.teamId === item.tossWonBy &&
        team.currentInnings === item.currentInnings
    );
    let toss = "";

    if (item.choseTo) {
      toss = item.choseTo === 1 ? "BAT" : "BOWL";
    }
    // const marketRunnerData = await global.tblEventMarkets.filter((elem) => 
    //   elem.commentaryId == item?.commentaryId && elem.rateSource === 2)
    // let mr;
    // try {
    //    mr = marketRunnerData.map((runner) => {
    //     let teamNameData
    //     if(runner.teamId){
    //     teamNameData = global.tblCommentaryTeams.find((t) => t.teamId === runner.teamId)
    //     }
    //     if(!runner.teamId){
    //         teamNameData = global.tblCommentaryTeams.find((t) => 
    //             t.teamName.toLowerCase() == runner?.runner?.toLowerCase())
    //     }
    //     return {
    //       rid: runner?.runnerId,
    //       rn: runner?.runner,
    //       sid: runner?.selectionId,
    //       bs: runner?.backSize,
    //       ls: runner?.laySize,
    //       bp: runner?.backPrice,
    //       lp: runner?.layPrice,
    //       tid: runner?.teamId,
    //       tn: teamNameData?.teamName || null
    //     };
    //   });
    // } catch (error) {
    //   console.log(error)
    // }

    let details = {
      rno: rno,
      eid: item.eventRefId || "",
      ety: eventType?.eventType || "",
      mtyp: item.matchType || "",
      hmtyp: item.historyMatchType || "",
      com: competition?.competition || "",
      compId: competition?.competitionId || 0,
      ci: item.currentInnings,
      en: item.eventName || "",
      ed: convertDate(item.eventDate, "DD/MM/YYYY") || "",
      et: convertDate(item.eventDate, "hh:mm:ss") || "",
      utc: item.eventDate,
      twonby: TossTeamName?.teamName || null,
      choseto: toss || null,
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
      te1crr: commentaryTeamsOne.crr || '0',
      te2crr: commentaryTeamsTwo.crr || '0',
      te1rrr: commentaryTeamsOne.rrr || '0',
      te2rrr: commentaryTeamsTwo.rrr || '0',
      crr: crr || '0',
      rrr: rrr || '0',
      cst: item.commentaryStatus,
      res: item.result || "",
      tsi: [],
      t1bg: commentaryTeamsOne.backgroundColor || null,
      t2bg: commentaryTeamsTwo.backgroundColor || null,
      t1co: commentaryTeamsOne.teamColor || null,
      t2co: commentaryTeamsTwo.teamColor || null,
      batid: batid || null,
      ballid: ballid || null,
      t1id: item.team1Id || null,
      t2id: item.team2Id || null,
      isPr: item.isPredictMarket,
      ics: item.isClientShow,
      // mr: mr
      // bowT : item.bowlingTeam || null,
    };

    if (item.currentInnings > 1) {
      for (let i = 1; i <= item.currentInnings; i++) {
        let t1 = await global.tblCommentaryTeams.find(
          (team) =>
            team.commentaryId === item?.commentaryId &&
            team.teamId === item.team1Id &&
            team.currentInnings === i
        );
        let t2 = await global.tblCommentaryTeams.find(
          (team) =>
            team.commentaryId === item?.commentaryId &&
            team.teamId === item.team2Id &&
            team.currentInnings === i
        );
        let teamScore1, teamScore2;
        if (t1) {
          const wicket1 =
            t1.teamWicket === null
              ? 0
              : t1.teamWicket;
          const overs1 =
            t1.teamOver === null
              ? 0.0
              : t1.teamOver;
          teamScore1 = t1?.teamScore ?? '0';
          teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
        }
        if (t2) {
          const wicket1 =
            t2.teamWicket === null
              ? 0
              : t2.teamWicket;
          const overs1 =
            t2.teamOver === null
              ? 0.0
              : t2.teamOver;
          teamScore2 = t2?.teamScore ?? '0';
          teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
        }
        details.tsi.push({
          t1s: teamScore1,
          t2s: teamScore2,
          inning: i
        })

      }
    }

    resultArr.push(details);
  }

  return resultArr;
};
const getMatchDataByCId = async (data, request, fastify) => {
  let com = global.tblCommentaries.find(
    (item) => item?.commentaryId === data.commentaryId
  );
  if (!com) {
    throw new Error("Commentary with this id not Found");
  }
  let rno = 0;
  let type = null;
  let status = com.commentaryStatus;
  if (status != 4 && status != 1) {
    type = "live";
  }
  else if (status == 4) {
    type = "completed";
  }
  else if (status == 1) {
    type = "scheduled";
  }
  const isRun = type == "scheduled" || "completed" ? false : true;
  let crr, rrr, batid, ballid;
  let eventType = await global.tblEventTypes.find(
    (e) => e.eventTypeId == com.eventTypeId
  )
  let competition = await global.tblCompetitions.find(
    (c) => c.competitionId == com.competitionId
  )
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.find(
    (team) =>
      team.commentaryId === com.commentaryId &&
      team.teamId === com.team1Id &&
      team.currentInnings === com.currentInnings
  );

  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (team) =>
      team.commentaryId === com.commentaryId &&
      team.teamId === com.team2Id &&
      team.currentInnings === com.currentInnings
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  const team1 = await global.tblTeams.find(
    (team) => team.teamId == com.team1Id
  )
  const team2 = await global.tblTeams.find(
    (team) => team.teamId == com.team2Id
  )
  if (type == "scheduled") {
    crr = 0;
    rrr = 0;
  }
  else {
    if (commentaryTeamsOne.teamStatus == 1) {
      crr = commentaryTeamsOne.crr;
      rrr = commentaryTeamsTwo.rrr;
      batid = commentaryTeamsOne.teamId;
      ballid = commentaryTeamsTwo.teamId;
    }
    else {
      crr = commentaryTeamsTwo.crr;
      rrr = commentaryTeamsTwo.rrr;
      batid = commentaryTeamsTwo.teamId;
      ballid = commentaryTeamsOne.teamId;
    }
  }
  const TossTeamName = await global.tblCommentaryTeams.find(
    (t) =>
      t.commentaryId == com.commentaryId &&
      t.teamId == com.tossWonBy &&
      t.currentInnings == com.currentInnings
  )
  let toss = "";
  if (com.choseTo) {
    toss = com.choseTo == 1 ? "BAT" : "BOWL";
  }
  let comDetails = {
    rno: rno,
    eid: com.eventRefId || "",
    ety: eventType?.eventType || "",
    mtyp: com.matchType || "",
    hmtyp: com.historyMatchType || "",
    com: competition?.competition || "",
    ci: com.currentInnings,
    en: com.eventName || "",
    ed: convertDate(com.eventDate, "DD/MM/YYYY") || "",
    et: convertDate(com.eventDate, "hh:mm:ss") || "",
    utc: com.eventDate,
    twonby: TossTeamName?.teamName || null,
    choseto: toss || null,
    te1n: commentaryTeamsOne.teamName || "",
    te2n: commentaryTeamsTwo.teamName || "",
    s1n: commentaryTeamsOne.shortName || "",
    s2n: commentaryTeamsTwo.shortName || "",
    te1i: team1.image || "",
    te2i: team2.image || "",
    t1jr: team1.jersey || "",
    t2jr: team2.jersey || "",
    loc: com.location || "",
    isrun: isRun,
    t1s: teamScore1 || "",
    t2s: teamScore2 || "",
    dis: com.displayStatus || "",
    rmk: com.rmk || "",
    te1crr: commentaryTeamsOne.crr || '0',
    te2crr: commentaryTeamsTwo.crr || '0',
    te1rrr: commentaryTeamsOne.rrr || '0',
    te2rrr: commentaryTeamsTwo.rrr || '0',
    crr: crr || '0',
    rrr: rrr || '0',
    cst: com.commentaryStatus,
    res: com.result || "",
    type,
    batid: batid || null,
    ballid: ballid || null,
    t1id: com.team1Id || null,
    t2id: com.team2Id || null,
  };
  return comDetails;

}
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
//       item?.commentaryId === commentary.commentaryId &&
//       item.teamId === commentary.team1Id &&
//       item.currentInnings === currentInnings
//   );
//   const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
//     (item) =>
//       item?.commentaryId === commentary.commentaryId &&
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
//     teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
//     teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
//     te1crr: commentaryTeamsOne.crr || '0',
//     te2crr: commentaryTeamsTwo.crr || '0',
//     te1rrr: commentaryTeamsOne.rrr || '0',
//     te2rrr: commentaryTeamsTwo.rrr || '0',
//     crr: crr || '0',
//     rrr: rrr || '0',
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
//       item?.commentaryId === commentary.commentaryId &&
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
          item?.commentaryId === commentary.commentaryId &&
          item.teamId === commentary.team1Id &&
          item.currentInnings === currentInnings
      ),
      global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentary.commentaryId &&
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
      teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
      teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
      hmtyp: commentary.historyMatchType || "",
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
      te1crr: commentaryTeamsOne.crr || '0',
      te2crr: commentaryTeamsTwo.crr || '0',
      te1rrr: commentaryTeamsOne.rrr || '0',
      te2rrr: commentaryTeamsTwo.rrr || '0',
      crr: crr || '0',
      rrr: rrr || '0',
      cst: commentary.commentaryStatus,
      bowi: BowlingTeamId,
      bati: BattingTeamId,
      t1id: commentaryTeamsOne.commentaryTeamId,
      t2id: commentaryTeamsTwo.commentaryTeamId,
      boid: bowlId,
      baid: batId,
      ics: commentary.isClientShow,
      cci: commentary.currentInnings,
      utc: commentary.eventDate,
    };

    dataToreturn.es = es;

    const commentaryTeam = await global.tblCommentaryTeams
      .filter((item) => item?.commentaryId === commentary.commentaryId)
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
          cid: item?.commentaryId,
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

    //Partnership data
    const commentaryPartnership = await global.tblCommentaryPartnership.filter(
      (item) => item?.commentaryId === commentary.commentaryId
      // item.teamId === batId &&
      // item.currentInnings === currentInnings
    );

    const partnershipList = [];
    try {
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
    } catch (e) {
      dataToreturn.par = partnershipList;
    }

    let oversList = [];

    try {
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
    } catch (e) {
      dataToreturn.ov = oversList;
    }

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
      item?.commentaryId === commentaryId &&
      item.currentInnings === inningNumber &&
      item.teamStatus === 1
  );

  const currentBowlingTeam = await global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings === inningNumber &&
      item.teamStatus === 2
  );

  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
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
      four: player.batFour || '0',
      six: player.batSix || '0',
      dot: player.batDotBall || '0',
      sr: player.batsmanStrikeRate || '0',
      tid: currentBattingTeam.commentaryTeamId,
      batO: player.batterOrder || null,
      inp: player.isPlay || false,
    };
  });

  const commentaryPlayers_bowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.teamId === currentBowlingTeam.teamId &&
      item.currentInnings === inningNumber &&
      (item.bowlerTotalBall !== null || item.isPlay == true)
  );

  const bow2 = commentaryPlayers_bowler.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      pln: player.playerName,
      ovr: player.bowlerOver || '0',
      mov: player.bowlerMaidenOver || '0',
      trun: player.bowlerRun || '0',
      four: player.bowlerFour || '0',
      six: player.bowlerSix || '0',
      wkt: player.bowlerTotalWicket || '0',
      wid: player.bowlerWideBallRun
        ? `${player.bowlerWideBall}/${player.bowlerWideBallRun}`
        : "0/0",
      nob: player.bowlerNoBallRun
        ? `${player.bowlerNoBall}/${player.bowlerNoBallRun}`
        : "0/0",
      dot: player.bowlerDotBall || '0',
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
      item?.commentaryId === commentaryId &&
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
      cd: player.createdDate
    };
  });

  // check if one team is batting complete then get the data of other team
  const getBattingCompletedTeam = await global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentaryId &&
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
      item?.commentaryId === commentaryId &&
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
      four: player.batFour || '0',
      six: player.batSix || '0',
      dot: player.batDotBall || '0',
      sr: player.batsmanStrikeRate || '0',
      tid: currentBowlingTeam.commentaryTeamId,
      batO: player.batterOrder || null,
      inp: player.isPlay || null,
      inp: player.isPlay || false,
    };
  });

  const commentaryPlayers_bowler2 = await global.tblCommentaryPlayers.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.teamId === currentBattingTeam.teamId &&
      item.currentInnings === inningNumber
  );

  const bow1 = commentaryPlayers_bowler2.map((player) => {
    return {
      pid: player.commentaryPlayerId,
      pln: player.playerName,
      ovr: player.bowlerOver || '0',
      mov: player.bowlerMaidenOver || '0',
      trun: player.bowlerRun || '0',
      four: player.bowlerFour || '0',
      six: player.bowlerSix || '0',
      wkt: player.bowlerTotalWicket || '0',
      wid: `${player.bowlerWideBall}/${player.bowlerWideBallRun}` || "0/0",
      nob: `${player.bowlerNoBall}/${player.bowlerNoBallRun}` || "0/0",
      dot: player.bowlerDotBall || '0',
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
      item?.commentaryId === commentaryId &&
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
      cd: player.createdDate
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
      item?.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
    hmtyp: commentary.historyMatchType || "",
    ety: commentary.eventType || "",
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
    // te1crr: commentaryTeamsOne.crr || '0',
    // te2crr: commentaryTeamsTwo.crr || '0',
    // te1rrr: commentaryTeamsOne.rrr || '0',
    // te2rrr: commentaryTeamsTwo.rrr || '0',
    // crr: crr || '0',
    // rrr: rrr || '0',
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
      item?.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let es = {
    eid: commentary.eventRefId || "",
    // ety: eventType?.eventType || "",
    // mtyp: commentary.matchType || "",
    // com: competition?.competition || "",
    hmtyp: commentary.historyMatchType || "",
    ety: commentary.eventType || "",
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
    // te1crr: commentaryTeamsOne.crr || '0',
    // te2crr: commentaryTeamsTwo.crr || '0',
    // te1rrr: commentaryTeamsOne.rrr || '0',
    // te2rrr: commentaryTeamsTwo.rrr || '0',
    // crr: crr || '0',
    // rrr: rrr || '0',
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
      item?.commentaryId === commentary.commentaryId &&
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
      item?.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === currentInnings
  );
  const commentaryTeamsTwo = await global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
    hmtyp: commentary.historyMatchType || "",
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
    // te1crr: commentaryTeamsOne.crr || '0',
    // te2crr: commentaryTeamsTwo.crr || '0',
    // te1rrr: commentaryTeamsOne.rrr || '0',
    // te2rrr: commentaryTeamsTwo.rrr || '0',
    // crr: crr || '0',
    // rrr: rrr || '0',
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
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  // update showClient
  await updateShowClientQuery(request.body, request, fastify);

  global.tblCommentaries[commentary].isClientShow = request.body.isClientShow;
  if (global.tblCommentaries[commentary].isActive) {
    const cData = await getMatchDataByCId({
      commentaryId: request.body.commentaryId,
    }, request, fastify);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData
      },
      request,
      fastify
    ).catch((err) => {
      console.log("cll client api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeShowClientService",
        request
      );
    });
  }

  return "Commentary Updated successfully";
};

const changePlayerShowService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
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
            item?.commentaryId === commentary.commentaryId &&
            item.teamId === commentary.team1Id &&
            item.currentInnings === currentInnings
        ),
        global.tblCommentaryTeams.find(
          (item) =>
            item?.commentaryId === commentary.commentaryId &&
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
        teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
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
        hmtyp: commentary.historyMatchType || "",
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

const getActiveCommertyService = async (fastify) => {
  const activeCommentaries = global.tblCommentaries.filter(
    (item) => item.isActive && item.commentaryStatus < 4
  );

  // Initialize an array to store results for each active commentary
  const results = [];

  // Iterate over each active commentary
  for (const commentary of activeCommentaries) {
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
            item?.commentaryId === commentary.commentaryId &&
            item.teamId === commentary.team1Id &&
            item.currentInnings === currentInnings
        ),
        global.tblCommentaryTeams.find(
          (item) =>
            item?.commentaryId === commentary.commentaryId &&
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

      // Construct the data for this commentary
      let dataToreturn = {};

      // Calculate team scores
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
        teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
        teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
      }

      // // Determine batting and bowling teams
      // let crr, rrr, BattingTeamId, BowlingTeamId;
      // if (commentaryTeamsOne.teamStatus == 1) {
      //   crr = commentaryTeamsOne.crr;
      //   rrr = commentaryTeamsOne.rrr;
      //   BattingTeamId = commentaryTeamsOne.teamId;
      //   BowlingTeamId = commentaryTeamsTwo.teamId;
      // } else {
      //   crr = commentaryTeamsTwo.crr;
      //   rrr = commentaryTeamsTwo.rrr;
      //   BattingTeamId = commentaryTeamsTwo.teamId;
      //   BowlingTeamId = commentaryTeamsOne.teamId;
      // }

      // Construct the object with required data
      let es = {
        eid: commentary.eventRefId || "",
        ety: eventType?.eventType || "",
        mtyp: commentary.matchType || "",
        hmtyp: commentary.historyMatchType || "",
        com: competition?.competition || "",
        en: commentary.eventName || "",
        ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
        et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
        te1n: commentaryTeamsOne.teamName || "",
        te2n: commentaryTeamsTwo.teamName || "",
        s1n: commentaryTeamsOne.shortName || "",
        s2n: commentaryTeamsTwo.shortName || "",
      };

      // Add data to the object
      dataToreturn = es;

      // Push data for this commentary to the results array
      results.push(dataToreturn);
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  }

  // Return results array containing data for all active commentaries
  return results;
};

const updateisPredictMarketInCommentaryService = async (request, fastify) => {
  const { commentaryId, isPredictMarket } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  if (
    isPredictMarket == true &&
    isPredictMarket !== global.tblCommentaries[index].isPredictMarket
  ) {
    if (
      global.tblCommentaries[index].commentaryStatus != 1 &&
      global.tblCommentaries[index].commentaryStatus != 2
    ) {
      throw new Error(
        "Predictor market can't be enabled for inProgress or completed commentary"
      );
    }
  }

  await updateisPredictMarketInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  if (global.tblCommentaries[index].isPredictMarket == true) {
    callDataProvider(
      {
        commentaryId: commentaryId,
        serviceType: ServiceType.dataProviderAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate
      },
      fastify
    ).catch((err) => {
      console.log("call data provider console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateisPredictMarketInCommentaryService",
        request
      );
    });
  }
  else {
    let market = await getMarketsByComIdQuery({
      commentaryId: commentaryId,
    }, request, fastify);
    if (market.marketCount == 0) {
      callDataProvider(
        {
          commentaryId: [commentaryId],
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "delete"
        },
        fastify
      ).catch((err) => {
        console.log("call data provider console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/updateisPredictMarketInCommentaryService",
          request
        );
      });
    }
  }
  return updatedData;
};

const updateResultInCommentaryService = async (request, fastify) => {
  const { commentaryId, result } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateResultInCommentaryQuery(request.body, fastify, request);

  global.tblCommentaries[index].result = result;

  if (global.tblCommentaries[index].isActive) {
    let cData = await getMatchDataByCId({
      commentaryId: commentaryId,
    }, request, fastify);

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData
      },
      request,
      fastify
    ).catch((err) => {
      console.log("call cleint api console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateResultInCommentaryService",
        request
      );
    });
  }

  return "Result updated successfully";
};

const getEventDetailsByCIdService = async (request, fastify) => {
  try {
    const { commentaryId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
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
        hmtyp: commentary.historyMatchType || "",
        mtyi: commentary.matchTypeId,
        com: competition?.competition || "",
        en: commentary.eventName || "",
        ed: convertDate(commentary.eventDate, "DD/MM/YYYY") || "",
        et: convertDate(commentary.eventDate, "hh:mm:ss") || "",
        cci: commentary.currentInnings,
        lr: commentary.lineRatio
      },
    };
    return dataToreturn;
  } catch (error) {
    //throw new Error(error);
  }
};
const saveCommentaryDetailsAPIService = async (request, fastify) => {
  // validate commentary id
  try {
    const {
      commentaryDetails,
      commentaryPlayers,
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
        (item) => item?.commentaryId === commentaryDetails.commentaryId
      );
      commentaryIndex !== -1
        ? (global.tblCommentaries[commentaryIndex] = {
          ...global.tblCommentaries[commentaryIndex],
          ...commentaryDetails,
        })
        : null;
    }
    if (commentaryTeams) {
      for (let team of commentaryTeams) {
        let teamIndex = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === team.commentaryTeamId
        );
        if (teamIndex !== -1) {
          global.tblCommentaryTeams[teamIndex] = team;
        }
      }
    }
    if (commentaryPlayers) {
      for (let player of commentaryPlayers) {
        let playerIndex = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        if (playerIndex !== -1) {
          global.tblCommentaryPlayers[playerIndex] = player;
        }
      }
    }
    if (commentaryOvers) {
      for (let over of commentaryOvers) {
        let overIndex = global.tblOvers.findIndex(
          (item) => item.overId === over.overId
        );
        if (overIndex !== -1) {
          global.tblOvers[overIndex] = over;
        }
      }
    }
    if (commentaryBallByBall) {
      for (let ball of commentaryBallByBall) {
        let ballIndex = global.tblCommentaryBallByBall.findIndex(
          (item) => item.commentaryBallByBallId === ball.commentaryBallByBallId
        );
        if (ballIndex !== -1) {
          global.tblCommentaryBallByBall[ballIndex] = ball;
        }
      }
    }
    if (commentaryWickets) {
      for (let wicket of commentaryWickets) {
        let wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) => item.commentaryWicketId === wicket.commentaryWicketId
        );
        if (wicketIndex !== -1) {
          global.tblCommentaryWicket[wicketIndex] = wicket;
        }
      }
    }
    if (commentaryPartnership) {
      for (let partnership of commentaryPartnership) {
        let partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item.commentaryPartnershipId === partnership.commentaryPartnershipId
        );
        if (partnershipIndex !== -1) {
          global.tblCommentaryPartnership[partnershipIndex] = partnership;
        }
      }
    }

    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          message: "Commentary Updated successfully"
        },
        global: null,
        extra: null,
        apiName: "/saveCommentaryDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveCommentaryDetailsAPIService",
        request
      );
    })

    return "Commentary Updated successfully";
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message
        },
        global: null,
        extra: null,
        apiName: "/saveCommentaryDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveCommentaryDetailsAPIService",
        request
      );
    })
    throw new Error(error);
  }
};
const activeInactiveCommentaryService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await activeInactiveCommentaryQuery(request.body, fastify, request);

  global.tblCommentaries[commentary].isActive = request.body.isActive;

  let cData = await getMatchDataByCId({
    commentaryId: request.body.commentaryId,
  }, request, fastify);
  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        isActive: request.body.isActive,
        type: "activeInactive"
      }
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/activeInactiveCommentaryService",
      request
    );
  });
  return "Commentary Updated successfully";
};
const closeCommentaryService = async (request, fastify) => {
  await closeCommentaryQuery(request.body, fastify, request);
  let _resFromPredictAPI;
  let callPredictions = [];

  let setEventSnap = []
  let teamPoint = []
  // update the global variable
  for (let commentaryId of request.body.commentaryId) {
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );
    if (index !== -1) {
      global.tblCommentaries[index].commentaryStatus = 4;

      await closeEventMarketByCIdQuery({ commentaryId }, fastify);
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request
      );
      let callPrediction = {}
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.Cid = commentaryId;
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = '/api/v1/endcommentary';
        callPredictions.push(callPrediction);
      }
      _resFromPredictAPI = null;
      callDataProvider(
        {
          commentaryId: commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "close"
        },
        fastify
      ).catch((err) => {
        console.log("call data provider console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/closeEventMarketByCIdQuery",
          request
        );
      });
      const cData = await getMatchDataByCId({
        commentaryId: commentaryId,
      }, request, fastify);

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData
        },
        request,
        fastify
      ).catch((err) => {
        console.log("call client api console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/closeEventMarketByCIdQuery",
          request
        );
      });
      // find competition
      let comp = global.tblCompetitions.find(
        (item) => item.competitionId === global.tblCommentaries[index].competitionId
      );
      if (comp.isEventSnap == true) {
        setEventSnap.push({
          commentaryId: commentaryId,
          eventRefId: global.tblCommentaries[index].eventRefId,
          competitionId: global.tblCommentaries[index].competitionId,
          eventTypeId: global.tblCommentaries[index].eventTypeId,
        })
      }
      if (comp.isPointTable == true) {
        teamPoint.push({
          commentaryId: commentaryId,
          competitionId: global.tblCommentaries[index].competitionId,
          team1Id: global.tblCommentaries[index].team1Id,
          team2Id: global.tblCommentaries[index].team2Id,
          winnerId: global.tblCommentaries[index].winnerId,
        })
      }
    }

  }

  if (setEventSnap.length > 0) {
    setCompEventSnapSerice(setEventSnap, request, fastify)
      .catch((err) => {
        console.log("setCompEventSnapSerice console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/closeCommentaryService - setCompEventSnapSerice",
          request
        );
      });
  }
  if (teamPoint.length > 0) {
    setTeamPointService(teamPoint, request, fastify)
      .catch((err) => {
        console.log("setTeamPointService console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/closeCommentaryService - setTeamPointService",
          request
        );
      });
  }
  setPlayerHistoryService({
    commentaryId: request.body.commentaryId
  }, request, fastify)
    .catch
    ((err) => {
      console.log("setPlayerHistoryService console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/closeCommentaryService - setPlayerHistoryService",
        request
      );
    });
  //return `Commentary(s) closed successfully`;
  return {
    message: "Commentary(s) closed successfully",
    callPredictions: callPredictions,
  };
};
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
};
const getOpenCommentariesService = async (request, fastify) => {
  const commentaries = global.tblCommentaries.filter(
    (item) => item.commentaryStatus != 4 && item.isPredictMarket == true
  );
  let result = [];
  for (com of commentaries) {
    let matchType = global.tblMatchTypes.find(
      (item) => item.matchTypeId === com.matchTypeId
    );
    com.matchType = matchType?.matchType || null;
    let competition = global.tblCompetitions.find(
      (item) => item.competitionId === com.competitionId
    );
    com.competition = competition?.competition || null;
    let eventType = global.tblEventTypes.find(
      (item) => item.eventTypeId === com.eventTypeId
    );
    com.eventType = eventType?.eventType || null;

    let data = {
      commentaryId: com.commentaryId,
      eventId: com.eventRefId,
      eventName: com.eventName,
      eventDate: com.eventDate,
      status: com.commentaryStatus,
      matchType: com.matchType,
      competition: com.competition,
      eventType: com.eventType,
      isPredictMarket: com.isPredictMarket,
    };
    result.push(data);
  }
  return result;
};
const updateDelayInCommentaryService = async (request, fastify) => {
  const { commentaryId, delay } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateDelayInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  let _resFromPredictAPI;
  let callPrediction = {};
  if (updatedData.isPredictMarket == true) {
    let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
    let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
    let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentaryId,
        delay: delay,
        event_id: updatedData.eventRefId,
        default_ball_faced: parseInt(key1?.value) || 0,
        default_player_boundaries: parseInt(key2?.value) || 0,
        default_player_runs: parseInt(key3?.value) || 0,
      },
      "/api/v1/loadcommentary",
      fastify,
      request
    );
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/loadcommentary';
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = 'Prediction call successful';
      callPrediction.endPoint = '/api/v1/loadcommentary';
    }
  }
  updatedData.callPrediction = callPrediction;
  return updatedData;
};

const getShortCommertyService = async (request, fastify) => {
  const { eventId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );
  if (commentary) {
    try {
      const currentInnings = commentary.currentInnings;
      // Promisify all necessary asynchronous operations
      const [commentaryTeamsOne, commentaryTeamsTwo, eventType] =
        await Promise.all([
          global.tblCommentaryTeams.find(
            (item) =>
              item?.commentaryId === commentary.commentaryId &&
              item.teamId === commentary.team1Id &&
              item.currentInnings === currentInnings
          ),
          global.tblCommentaryTeams.find(
            (item) =>
              item?.commentaryId === commentary.commentaryId &&
              item.teamId === commentary.team2Id &&
              item.currentInnings === currentInnings
          ),
          global.tblEventTypes.find(
            (eventType) => eventType.eventTypeId === commentary.eventTypeId
          ),
        ]);
      let dataToreturn = {};

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
        teamScore1 = commentaryTeamsOne?.teamScore ?? '0';
        teamScore1 = teamScore1 + "/" + wicket1 + " (" + overs1 + ")";
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? '0';
        teamScore2 = teamScore2 + "/" + wicket1 + " (" + overs1 + ")";
      }
      let es = {
        eti: parseInt(eventType.refId) || "",
        eid: commentary.eventRefId || "",
        en: commentary.eventName || "",
        te1n: commentaryTeamsOne.teamName || "",
        te2n: commentaryTeamsTwo.teamName || "",
        t1s: teamScore1 || "",
        t2s: teamScore2 || "",
        pt: 0,
        t1set: null,
        t2set: null,
        t1p: null,
        t2p: null,
      };

      dataToreturn = es;
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
const deleteCommentaryDataService = async (request, fastify) => {
  try {
    const { deleteWickets, deleteOvers, deletePartnership, deleteBallByBall } =
      request.body;
    const result = await deleteCommentaryDataQuery(
      request.body,
      fastify,
      request
    );

    if (deleteBallByBall) {
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (ball) => !deleteBallByBall.includes(ball.commentaryBallByBallId)
      );
    }
    if (deleteOvers) {
      global.tblOvers = global.tblOvers.filter(
        (over) => !deleteOvers.includes(over.overId)
      );
    }
    if (deleteWickets) {
      global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
        (wicket) => !deleteWickets.includes(wicket.commentaryWicketId)
      );
    }
    if (deletePartnership) {
      global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
        (partnership) =>
          !deletePartnership.includes(partnership.commentaryPartnershipId)
      );
    }
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          message: "Commentary Data deleted successfully",
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        apiName: "/deleteComentaryDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/deleteCommentaryDataService",
        request
      );
    });
    return "Commentary Data deleted successfully";
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message,
        },
        global: global.tblCommentaryPartnership.filter(
          (item) => item?.commentaryId === request.body.commentaryId
        ),
        extra: global.tblCommentaryBallByBall.filter(
          (item) => item?.commentaryId === request.body.commentaryId
        ),
        apiName: "/deleteComentaryDetails"
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/deleteCommentaryDataService",
        request
      );
    });
    throw new Error(error);
  }
};
const updateEventRefIdInCommentaryService = async (request, fastify) => {
  const { commentaryId, eventRefId } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }
  // check if the eventRefId is already assigned to another commentary
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventRefId.trim()
  );
  if (commentary) {
    throw new Error("EventRefId should be unique");
  }

  await updateEventRefIdInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  let _resFromPredictAPI;
  let callPrediction = {};
  if (updatedData.isPredictMarket == true) {
    let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
    let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
    let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentaryId,
        eventRefId: eventRefId,
        event_id: updatedData.eventRefId,
        default_ball_faced: parseInt(key1?.value) || 0,
        default_player_boundaries: parseInt(key2?.value) || 0,
        default_player_runs: parseInt(key3?.value) || 0,
      },
      "/api/v1/loadcommentary",
      fastify,
      request
    );
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/loadcommentary';
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = 'Prediction call successful';
      callPrediction.endPoint = '/api/v1/loadcommentary';
    }
  }

  updatedData.callPrediction = callPrediction;
  return updatedData;
};

const loadcommentaryService = async (request, fastify) => {
  try {
    let commentary = await global.tblCommentaries.find(
      (item) => item?.commentaryId === request.body.commentaryId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }
    let _resFromPredictAPI;
    let callPrediction = {};
    if (
      commentary.isPredictMarket == true &&
      (commentary.commentaryStatus == 2 || commentary.commentaryStatus == 3)
    ) {
      // get the eventMarket from teamOnstrike
      const teamOnStrike = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentary.commentaryId &&
          item.currentInnings === commentary.currentInnings &&
          item.teamStatus === 1
      );
      // array of eventMarket id
      let eventMarketLine = [];
      if (teamOnStrike) {
        eventMarketLine = await getEventMarketRatioQuery(
          {
            commentaryId: commentary.commentaryId,
            teamId: teamOnStrike.teamId,
          },
          request,
          fastify
        );
      }
      let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
      let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
      let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: commentary.commentaryId,
          match_type_id: commentary.matchTypeId,
          event_id: commentary.eventRefId,
          line_ratio_data: eventMarketLine,
          default_ball_faced: parseInt(key1?.value) || 0,
          default_player_boundaries: parseInt(key2?.value) || 0,
          default_player_runs: parseInt(key3?.value) || 0,
        },
        "/api/v1/loadcommentary",
        fastify,
        request
      );

      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = '/api/v1/loadcommentary';
      } else {
        callPrediction.predictioncallSuccess = true;
        callPrediction.predictionMessage = 'Prediction call successful';
        callPrediction.endPoint = '/api/v1/loadcommentary';
      }
    }
    return {
      message: "Request Send Successfully!!!",
      callPrediction: callPrediction,
    };
  } catch (error) {
    // Handle errors here
    console.error(error);
  }
};
const changeMaxOverDetailService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  // update maxOverDetail
  await updateMaxOverDetailQuery(request.body, fastify, request);

  let commentaryTeams = global.tblCommentaryTeams.filter(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  for (let team of commentaryTeams) {
    team.teamMaxOver = request.body.teamMaxOver;
  }

  return "Commentary Updated successfully";
};

const AddSuperOverCommentaryService = async (request, fastify) => {
  try {
    const { commentaryId, teamMaxOver, battingTeamId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) => item?.commentaryId == commentaryId
    );
    if (!commentary) {
      throw new Error("Commentary with this id not Found");
    }


    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );

    const commentaryTeams = global.tblCommentaryTeams.filter(
      (item) => item?.commentaryId == commentaryId && item.currentInnings === commentary.currentInnings
    );

    if (!commentaryTeams) {
      throw new Error("Commenrty Teams with this commentaryId not Found");
    }

    let Teamdata = {};
    Teamdata.commentaryId = commentaryId;
    Teamdata.teamMaxOver = teamMaxOver || 1;
    for (let team of commentaryTeams) {
      if (team.teamId == commentary.team1Id) {
        Teamdata.team1Id = team.teamId;
        Teamdata.team1Captain = team.teamCaptain;
        Teamdata.team1Kipper = team.teamKipper;
      }
      if (team.teamId == commentary.team2Id) {
        Teamdata.team2Id = team.teamId;
        Teamdata.team2Captain = team.teamCaptain;
        Teamdata.team2Kipper = team.teamKipper;
      }
    }
    const commentaryTeam1Players = global.tblCommentaryPlayers.filter(
      (item) => item?.commentaryId === commentaryId && item.teamId === commentary.team1Id && item.currentInnings === commentary.currentInnings
    );

    const commentaryTeam2Players = global.tblCommentaryPlayers.filter(
      (item) => item?.commentaryId === commentaryId && item.teamId === commentary.team2Id && item.currentInnings === commentary.currentInnings
    );

    if ((!commentaryTeam1Players && commentaryTeam1Players.length > 0) && (!commentaryTeam2Players && commentaryTeam2Players.length > 0)) {
      throw new Error("Commenrty Teams Players with this commentaryId not Found");
    }

    const Playersdata = [
      ...commentaryTeam1Players.map((item, i) => {
        return {
          commentaryId: commentary.commentaryId,
          teamId: item.teamId,
          playerId: item.playerId,
          displayOrder: i + 1,
        };
      }),
      ...commentaryTeam2Players.map((item, i) => {
        return {
          commentaryId: commentary.commentaryId,
          teamId: item.teamId,
          playerId: item.playerId,
          displayOrder: i + 1,
        };
      }),
    ];

    let _cin = parseInt(commentary.currentInnings) + 1;

    if (Teamdata) {
      try {
        await updateSuperOverCommentaryQuery({ commentaryId: commentary.commentaryId, currentInnings: _cin }, fastify);
        Teamdata.currentInnings = _cin;
        await insertCommentarySuperOverTeams({ body: { data: Teamdata } }, fastify);
      } catch (error) {
        //throw new Error(error);
      }
      try {
        await updateCommentaryBattingTeamQuery({
          commentaryId: commentary.commentaryId,
          currentInnings: _cin,
          battingTeamId: battingTeamId
        }, fastify);
      } catch (error) { }
      for (let info of Playersdata) {
        try {
          let playerData = await insertCommentaryPlayers(
            {
              ...info,
              matchTypeId: commentary.matchTypeId,
            },
            _cin,
            fastify,
            request
          );
        } catch (error) {
          console.log("error in console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/AddSuperOverCommentaryService",
            request
          );
        }
      }
    }

    const updatedData = await getCommentaryByIdQuery({ body: { commentaryId: commentary.commentaryId } }, fastify);
    global.tblCommentaries[index] = updatedData;
    global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
    global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

    const result = await commentaryDetailsByIdService({ body: { commentaryId: commentary.commentaryId } }, fastify);
    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: {
          message: "Super Over Commentary Added successfully",
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        apiName: "/AddSuperOver",
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/AddSuperOverCommentaryService",
        request
      );
    });
    return result
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message,
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === request.body.commentaryId
          ),
        },
        apiName: "/AddSuperOver",
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/AddSuperOverCommentaryService",
        request
      );
    });
    throw new Error(error);
  }
};

const updateTeamPredictionService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );

  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateTeamPrediction(request, fastify);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;

  return updatedData;
};

const updateLineRationService = async (request, fastify) => {
  const { commentaryId, lineRatio } = request.body;
  try {
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );
    if (index == -1) {
      throw new Error("Commentary with this id not Found");
    }


    await updateLineRationQuery({ commentaryId, lineRatio }, request, fastify);

    global.tblCommentaries[index].lineRatio = lineRatio;
    // console.log(global.tblCommentaries[index]);

    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: {
          message: "Line-ratio updated successfully",
        },
        global: null,
        extra: null,
        apiName: "/updatLineRatio",
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateLineRationService",
        request
      );
    });

    return `Line-ratio updated successfully`;
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: {
          error: error.message,
        },
        global: null,
        extra: null,
        apiName: "/updateLineRation"
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateLineRationService",
        request
      );
    });
    throw new Error(error);
  }
};
const deleteBallFromMemorynService = async (request, fastify) => {
  const { commentaryBallByBallId } = request.body;
  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => !commentaryBallByBallId.includes(item.commentaryBallByBallId)
  );
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
    (item) => !commentaryBallByBallId.includes(item.commentaryBallByBallId)
  );
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
    (item) => !commentaryBallByBallId.includes(item.commentaryBallByBallId)
  );
  return "Ball deleted successfully";
};
const setLineRatioInComService = async (data, request, fastify) => {
  const { commentaryId, matchTypeId } = data;
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId == matchTypeId
  );
  if (!matchType) {
    throw new Error("Match Type not found");
  }
  let marketType = global.tblMarketTypes.find((item) => item.marketTypeId == MarketTypeId.Fancy);
  if (!marketType) {
    throw new Error("Market Type Fancy not found");
  }
  let marketTypeCategory = global.tblMarketTypeCategories.find((item) => item.categoryName.toLowerCase() == "session")
  if (!marketTypeCategory) {
    throw new Error("Market Type Category not found");
  }

  let result = await updateLineRatioComQuery({
    commentaryId: commentaryId,
    marketTypeId: marketType.marketTypeId,
    marketTypeCategoryId: marketTypeCategory.marketTypeCategoryId,
    maxOver: matchType.maxOversInFirstInings,
    sumOfRunPerBall: matchType.sumOfRunPerBall,
    status: [EventMarketStatus.Close, EventMarketStatus.Settled, EventMarketStatus.Cancel]
  }, request, fastify);

  let lineRatio = result[0].line_ratio;

  let commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId == commentaryId
  );
  // console.log("lineRatio",global.tblCommentaries[commentary].lineRatio);
  if (commentary !== -1 && lineRatio != null) {
    global.tblCommentaries[commentary].lineRatio = lineRatio;
  }
  return true;

}

const completedCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  await completedCommentaryStatusQuery(commentaryId, fastify, request);
  for (let comm of request.body.commentaryId) {
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === comm
    );
    if (index !== -1) {
      global.tblCommentaries[index].commentaryStatus = 5;
    }
  }

  return `Commentary status updated successfully`;
};


const insertCommentaryConsoleFeService = async (request, fastify) => {
  const result = await insertCommentaryConsoleFeQuery(
    { ...request.body, createby: request.userTokenInfo.WrUserId },
    fastify,
    request
  );
  return true;
};
const revertCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  // let checkMar = await getMarCountByComQuery({ commentaryId },request, fastify);
  // if(checkMar.marketCount > 0){
  //   throw new Error("Cannot revert the commentary as markets are already created");
  // }

  let res = await revertCommentaryQuery(request.body, fastify, request);
  // console.log("revertCommentaryQuery", r);

  if (res) {
    global.tblCommentaries[index].displayStatus = 'Toss Pending!!';
    global.tblCommentaries[index].commentaryStatus = 1;
    global.tblCommentaries[index].target = null;
    global.tblCommentaries[index].winnerId = null;
    global.tblCommentaries[index].winnerName = null;
    global.tblCommentaries[index].tossWonBy = null;
    global.tblCommentaries[index].choseTo = null;
    global.tblCommentaries[index].rmk = false;
    global.tblCommentaries[index].updateTime = new Date();
    global.tblCommentaries[index].tpId = null;
    global.tblCommentaries[index].commentaryResult = null;
    global.tblCommentaries[index].commentaryCloseTime = null;

    const ct = global.tblCommentaryTeams.filter((item) => item?.commentaryId === commentaryId);
    const cp = global.tblCommentaryPlayers.filter((item) => item?.commentaryId === commentaryId);
    if (ct.length > 0) {
      // update the global variable
      for (let team of ct) {
        let teamIndex = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === team.commentaryTeamId
        );
        if (teamIndex !== -1) {
          let updatedData = res.commentary_team_data.find(
            (item) => item.commentaryTeamId === team.commentaryTeamId
          );
          global.tblCommentaryTeams[teamIndex] = updatedData;
        }
      }
    }
    if (cp.length > 0) {
      // update the global variable
      for (let player of cp) {
        let playerIndex = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        if (playerIndex !== -1) {
          let updatedData = res.commentary_player_data.find(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId
          );
          global.tblCommentaryPlayers[playerIndex] = updatedData;
        }
      }
    }
  }

  // remvoe over for this commentary
  global.tblOvers = global.tblOvers.filter((item) => item?.commentaryId !== commentaryId);
  // remove ball by ball for this commentary
  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter((item) => item?.commentaryId !== commentaryId);
  // remove partnership for this commentary
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter((item) => item?.commentaryId !== commentaryId);
  // remove wicket for this commentary
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter((item) => item?.commentaryId !== commentaryId);

  return "Commentary reverted successfully";


}
module.exports = {
  allCommentaryService,
  commentaryByIdService,
  saveCommentaryService,
  cloneCommentaryService,
  deleteCommentaryService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  predictorLogsByIdService,
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
  updateTeamPlayerService,
  saveShortCommentaryService,
  updateCommentaryStatusService,
  updateisPredictMarketInCommentaryService,
  updateResultInCommentaryService,
  getEventDetailsByCIdService,
  saveCommentaryDetailsAPIService,
  loadMultiCommentaryService,
  activeInactiveCommentaryService,
  closeCommentaryService,
  deleteAllCommentaryService,
  getOpenCommentariesService,
  updateDelayInCommentaryService,
  getActiveCommertyService,
  getShortCommertyService,
  deleteCommentaryDataService,
  updateEventRefIdInCommentaryService,
  loadcommentaryService,
  changeMaxOverDetailService,
  AddSuperOverCommentaryService,
  // getshortService,
  syncCommentaryStatsWithAPIAndSocket,
  getMatchDataByCId,
  updateTeamPredictionService,
  updateLineRationService,
  deleteBallFromMemorynService,
  completedCommentaryService,
  insertCommentaryConsoleFeService,
  revertCommentaryService
};
