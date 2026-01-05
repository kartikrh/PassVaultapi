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
  getAllCommentaryPlayerQueryById,
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
  revertCommentaryQuery,
  getTemplateByComIdQuery,
  saveComTemplateQuery,
  getCommentaryBallByBallByIdsQuery,
  insertWagonWheelPositionQuery,
  updateShotTypeQuery,
  updateIsWheelShowQuery,
  insertCommentaryPlayersQuery,
  cancelCommentaryQuery,
  isCountInPOintCommentaryChangeQuery,
  getAllCommentaryHistoryQuery,
  deleteCommentryHistoryQuery,
  getCommPlayersByCommentaryIdQuery,
  getAllCompletedCommentaryQuery,
  upOverDLSQuery,
  updateCommentaryPlayerJerseyImageQuery,
  getAllCommentaryPlayerDataQuery,
  changeIsTestComQuery,
  changeIsEventStartQuery,
  getAllDifficulties,
  addCompTempQuery,
  updatePitchageAndSessionQuery,
  updatePythonAPIOnCommentaryQuery,
  updateEventTypeAndCompIdQuery,
  getMatchTypeTemplateByComIdQuery,
  scoringTypeCommentaryQuery,
  insertCommentaryPlayersEntity,
  updateteamMaxOverQuery,
  deleteCommentaryPlayersByPlayerId,
  overTypeChangeOnOversQuery,
  updateStreamingURLQuery,
  bowlingTypeChangeQuery,
  updateCommentaryViewsQuery,
  playingElevenChangeOnCommPlayersQuery,
  updateCommentaryDateByCommentaryIdQuery,
  getHeadToHeadCommentaryQuery,
  getCommentaryStatisticsQuery,
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
  MarketTypeId,
  EventName,
  exchangeMatchinfoAPI,
  EventType,
  EntityEnums,
  parseUmpires,
  callEntitySportAPI,
  checkEntitySportAPIEndpointIsActive,
  CompetitionType,
  compStatus,
  ScoringTypes,
  EntityPlayerType,
  EntityBowlingStyleType,
  extractBowlingStyle,
  RefType,
} = require("../utilities");
const {
  getAllPlayersByTeamIdQuery,
  getAllPlayersByTeamIdAndMatchTypeIdQuery,
  insertTeamQuery,
  updateExchangeTeamQuery,
  getTeamPlayerTournamentQuery,
} = require("../repository/TableTeams");
const {
  handleMarketCloseService,
  updateComInMarketService,
  suspendMarketService,
  handleMarketByDLSService,
} = require("./eventMarket");
const {
  createMarketOddsBallByBallBYID,
  deleteMarketOddsBallByBall,
  createMarketOddsBallInSaveDetails,
} = require("../repository/TableMarketOddsBallByBall");
const {
  getEventMarketRatioQuery,
  closeEventMarketByCIdQuery,
  getMarketsByCategoryQuery,
  getEventMarketByIdsQuery,
  getMarketsByComIdQuery,
  updateEventMarketCloseQuery,
  getMarCountByComQuery,
  getExtrenalMarketQuery,
  getEventMarketsByCommId,
  getAllEventMarketsQuery,
} = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const { commentaryLogger, errorLogger, commActionLogger } = require("../utilities/logger");
const { setCompEventSnapSerice } = require("./competitionEventSnap");
const { setTeamPointService } = require("./tournamentTeamPoints");
const { setPlayerHistoryService } = require("./playerHistory");
const { now } = require("mongoose");
const {
  netRunRateRe_calculationService,
} = require("../services/tournamentTeamPoints");
const {
  deleteCommentaryPlayerHistoryQuery,
} = require("../repository/TableCommPlayerHistory");
const {
  deleteEventSnapByCommentaryIdQuery,
} = require("../repository/TableCompetitionEventSnap");
const { deleteTipsByCommentaryIdQuery } = require("../repository/TableTips");
const {
  calculationOfCommPlayerBatHistService,
  calculationOfCommPlayerBowlHistService,
} = require("../services/playerHistory");
// const { handleSitemapUpdate } = require("../utilities/SEOIndexing")
const {
  getAllTournamentTeamPointsQuery,
  getTournamentPointsByGroupNameQuery,
} = require("../repository/TableTournmentTeamPoints");
const {
  getPlayersBattingHistoryByIdQuery,
} = require("../repository/TablePlayerHistory");
const { mergeAndSaveImage } = require("../utilities/imageMerge");
const {
  getAllTeamPlayersByTeamIdAndPlayerIdQuery,
  insertTeamPlayerQuery,
  updateTeamPlayerHomeTeamQuery,
} = require("../repository/TableTeamPlayer");
const {
  insertNotificationViaNotiConfigQuery,
} = require("../repository/TableNotification");
const {
  generateMarketAndRunners,
  processPredictScoreMarket,
} = require("../markets");
const {
  insertWeatherQuery,
  updateWeatherQuery,
  deleteWeatherWithCommentaryIdQuery,
} = require("../repository/TableWeather")
const {
  insertPitchConditionQuery,
  updatePitchConditionQuery,
  deletePitchConditionWithCommIdQuery,
} = require("../repository/TablePitchCondition");
const { PlayerType, nullTeamtpIds, autoUpdateCommentaryDataStatus } = require("../utilities/entityConst");
const { insertPlayerEntityQuery, insertPlayerQuery, updateExchangePlayerQuery } = require("../repository/TablePlayer");
const { insertCountryCodeQuery } = require("../repository/TableCountryCodes");
const { insertVenueQuery, updateVenueQuery } = require("../repository/TableVenue");
const { insertCompetitionQuery } = require("../repository/TableCompitition");
const { getImageFromUrl } = require("../utilities/Images");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { insertTeamPlayersByTeamId, insertCommentaryPlayersByTeam } = require("./competition");
const cron = require('node-cron');
const { insertAutoImportDataService } = require("./autoImportData");
const { insertTournamentTeamPlayersQuery, deleteTournamentTeamPlayersQuery } = require("../repository/TableTournamentsTeamPlayers");
const { insertAutoUpdateCommentaryDataQuery, getAllAutoUpdateCommentaryDataQuery } = require("../repository/TableAutoUpdateCommentaryData");

const allCommentaryService = async (request, fastify) => {
  // return global.tblCommentaries;
  const {
    commentaryStatus,
    eventTypeId,
    competitionId,
    isVirtual,
    startDate,
    endDate,
    pythonId,
    matchTypeId,
  } = request.body;
  let result;
  if (commentaryStatus === undefined) {
    result = global.tblCommentaries.filter(
      (item) => ![4, 10].includes(item.commentaryStatus)
    );
    // result = global.tblCommentaries.filter(
    //   (item) => item.commentaryStatus === 1 || item.commentaryStatus === 3
    // );
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

  if (isVirtual === true || isVirtual === false) {
    result = result.filter((item) => item.isVirtual === isVirtual);
  }

  if (competitionId) {
    result = result.filter((item) => item.competitionId === competitionId);
  }

  if (matchTypeId) {
    result = result.filter((item) => item.matchTypeId === matchTypeId);
  }

  if (pythonId) {
    result = result.filter((item) => item.pythonId === pythonId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (commentaryStatus === undefined) {
      result = result.filter((item) => {
        const eventDate = new Date(item.eventDate);

        if ([2, 3, 5].includes(item.commentaryStatus)) {
          return eventDate <= end;
        }
        // if (item.commentaryStatus === 3) {
        //   return eventDate <= end;
        // }

        return eventDate >= start && eventDate <= end;
      });
    } else {
      result = result.filter((item) => {
        const eventDate = new Date(item.eventDate);
        return eventDate >= start && eventDate <= end;
      });
    }
  }
  result = result.map(item => {
    const pythonAPI = global.tblPythonAPI.find(elem => elem.id == item.pythonId);
    item.developerName = pythonAPI?.developerName ?? null;
    return {
      ...item,
      developerName: pythonAPI?.developerName ?? null
    };
  });
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

  const weatherConditions = global.tblWeather.find(item => item.commentaryId === request.body.commentaryId);
  const pitchConditions = global.tblPitchConditions.find(item => item.commentaryId === request.body.commentaryId);

  commentary.team1Captain = team1.teamCaptain;
  commentary.team1Kipper = team1.teamKipper;
  commentary.team1Players = team1Players;
  commentary.team2Captain = team2.teamCaptain;
  commentary.team2Kipper = team2.teamKipper;
  commentary.team2Players = team2Players;
  commentary.commentaryId = request.body.commentaryId;
  commentary.drsCount = team1.drsCount;
  if (weatherConditions) {
    const { id, commentaryId, ...weatherRest } = weatherConditions;
    Object.assign(commentary, weatherRest);
  }

  if (pitchConditions) {
    const { id, commentaryId, ...pitchRest } = pitchConditions;
    Object.assign(commentary, pitchRest);
  }

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
  // let isStopLoadCommerty = false;
  // if (request.body.isStopLoadCommerty) {
  //   isStopLoadCommerty = request.body.isStopLoadCommerty;
  // }
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

  for (const team of commentaryTeams) {
    const _team = global.tblTeams.find((item) => item.teamId === team.teamId);
    if (_team) {
      team.jersey = _team?.jersey;
      team.image = _team?.image;
    }
  }

  // const commentaryPlayers = await global.tblCommentaryPlayers
  //   .filter((item) => item?.commentaryId === request.body.commentaryId)
  //   .sort((a, b) => b.commentaryPlayerId - a.commentaryPlayerId);

  const commentaryPlayers = await Promise.all(
    global.tblCommentaryPlayers
      .filter((item) => item?.commentaryId === request.body.commentaryId)
      .map(async (elem) => {
        let whereCondition = `tcp."wrIsDelete" = false AND tcp."wrCommentaryPlayerId" = ${elem.commentaryPlayerId}`;
        const result = await getAllCommentaryPlayerDataQuery(
          whereCondition,
          fastify
        );
        if (result.length > 0) {
          elem.jerseyPlayerImage = result[0].jerseyPlayerImage;
        }
        return elem;
      })
  );
  commentaryPlayers.sort((a, b) => b.commentaryPlayerId - a.commentaryPlayerId);

  for (const player of commentaryPlayers) {
    const _player = global.tblPlayers.find(
      (item) => item.playerId === player.playerId
    );
    if (_player) {
      player.playerimage = _player?.image;
    }
  }

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

  const filteredPartnerships = global.tblCommentaryPartnership.filter(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  const commentaryPartnership = await Promise.all(
    filteredPartnerships.map(async (elem) => {
      // Find player 1 details
      const _player1 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === elem.batter1Id
      );
      if (_player1) {
        elem.player1image = _player1.playerimage;
        elem.player1jerseyandimage = _player1?.jerseyPlayerImage;
        elem.player1jerseyandimagepath = _player1?.jerseyPlayerImagePath;
      }
      const _player2 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === elem.batter2Id
      );
      if (_player2) {
        elem.player2image = _player2.playerimage;
        elem.player2jerseyandimage = _player2?.jerseyPlayerImage;
        elem.player2jerseyandimagepath = _player2?.jerseyPlayerImagePath;
      }

      return elem;
    })
  );
  commentaryPartnership.sort(
    (a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId
  );

  // const commentaryPartnership = await global.tblCommentaryPartnership
  //   .filter((item) => item?.commentaryId === request.body.commentaryId)
  //   .sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId);

  const commentaryDisplayStatus = await global.tblDisplayStatus.filter(
    (item) => item.displayStatusId !== 0
  );
  // let _resFromPredictAPI;
  // let callPrediction = {};
  // if (
  //   !isStopLoadCommerty &&
  //   commentary.isPredictMarket == true &&
  //   (commentary.commentaryStatus == 2 || commentary.commentaryStatus == 3)
  // ) {
  //   // get the eventMarket from teamOnstrike
  //   const teamOnStrike = global.tblCommentaryTeams.find(
  //     (item) =>
  //       item?.commentaryId === commentary.commentaryId &&
  //       item.currentInnings === commentary.currentInnings &&
  //       item.teamStatus === 1
  //   );
  //   // array of eventMarket id
  //   let eventMarketLine = [];
  //   if (teamOnStrike) {
  //     eventMarketLine = await getEventMarketRatioQuery(
  //       {
  //         commentaryId: commentary.commentaryId,
  //         teamId: teamOnStrike.teamId,
  //       },
  //       request,
  //       fastify
  //     );
  //   }
  //   // data: {
  //   //   status_code: 500,
  //   //   error_msg: 'the JSON object must be str, bytes or bytearray, not NoneType'
  //   // }
  //   let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
  //   let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
  //   let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
  //   _resFromPredictAPI = await callPredictorMarket(
  //     {
  //       commentary_id: commentary.commentaryId,
  //       match_type_id: commentary.matchTypeId,
  //       event_id: commentary.eventRefId,
  //       line_ratio_data: eventMarketLine,
  //       default_ball_faced: parseInt(key1?.value) || 0,
  //       default_player_boundaries: parseInt(key2?.value) || 0,
  //       default_player_runs: parseInt(key3?.value) || 0,
  //     },
  //     "/api/v1/loadcommentary",
  //     fastify,
  //     request
  //   );
  //   // Check for error_msg in the response
  //   if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
  //     callPrediction.predictioncallSuccess = false;
  //     callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
  //     callPrediction.endPoint = '/api/v1/loadcommentary';
  //   }
  // }

  const shotTypes = await global.tblShotType
    .filter((item) => item?.isActive === true)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const overTypeData = global.tblOverTypes.filter(item => item.isActive == true);
  const bowlingStyles = global.tblBowlingTypes;

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
    // callPrediction,
    shotTypes,
    overTypes: overTypeData,
    bowlingStyles,
  };
  return allDetails;
};

const createCommentaryService = async (request, fastify) => {
  // eventRefId should be unique
  const validateEventRefId = global.tblCommentaries.find(
    (item) => item.eventRefId === request.body.eventRefId?.trim()
  );
  if (validateEventRefId && validateEventRefId.eventRefId !== null) {
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
  let validateTeam1Id, validateTeam2Id
  if (request.body.team1Id) {
    validateTeam1Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team1Id
    );

    if (!validateTeam1Id) {
      throw new Error("Team1 with this id not Found");
    }
  }

  if (request.body.team2Id) {
    validateTeam2Id = global.tblTeams.find(
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
  if (
    request.body.team1Players &&
    request.body.team1Players.length > 0 &&
    request.body.team2Players &&
    request.body.team2Players.length > 0
  ) {
    let allPlayers = [
      ...request.body.team1Players,
      ...request.body.team2Players,
    ];
    let captainsAndKippers = [
      request.body.team1Captain,
      request.body.team1Kipper,
      request.body.team2Captain,
      request.body.team2Kipper,
    ];

    // let check = captainsAndKippers.filter((item) => !allPlayers.includes(item));
    // if (check.length > 0) {
    //   throw new Error(`Captain and Kipper must be in the player list.`);
    // }

    let validCaptainsAndKippers = captainsAndKippers.filter(
      (item) => item !== null && item !== undefined && item !== 0
    );

    let check = validCaptainsAndKippers.filter((item) => !allPlayers.includes(item));
    if (check.length > 0) {
      throw new Error(`Captain and Kipper must be in the player list.`);
    }
  }
  if (!request.body.eventRefId || !request.body.eventId) {
    request.body.isPredictMarket = false;
  }
  if (
    !request.body.team1Players ||
    request.body.team1Players.length == 0 ||
    !request.body.team2Players ||
    request.body.team2Players.length == 0
  ) {
    request.body.isClientShow = false;
  }
  if (request.body.competitionId) {
    const compVirtual = global.tblCompetitions.find(
      (item) => item.competitionId == request.body.competitionId
    );
    request.body.isVirtual = compVirtual.isVirtual;
  }
  const addCommentry = await insertCommentaryQuery(request, fastify);
  request.body.commentaryId = addCommentry.commentaryId;
  const weatherFields = [
    "weatherCondition",
    "description",
    "temp",
    "humidity",
    "visibility",
    "windSpeed",
    "clouds"
  ];

  const hasWeatherData = weatherFields.some(field => request.body[field] != null);

  if (hasWeatherData) {
    const weather = await insertWeatherQuery(request.body, fastify, request);
    global.tblWeather.push(weather);
  }

  const pitchFields = [
    "pitchCondition",
    "battingCondition",
    "paceBowlingCondition",
    "spineBowlingConniton"
  ];
  const hasPitchData = pitchFields.some(field => request.body[field] != null);
  if (hasPitchData) {
    const pitch = await insertPitchConditionQuery(request.body, fastify, request);
    global.tblPitchConditions.push(pitch);
  }

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
  request.body.team1TpId = validateTeam1Id?.tpId ?? null
  request.body.team2TpId = validateTeam2Id?.tpId ?? null

  request.body.team1GroupId = await getGroupId(request.body.team1Id, request, fastify);
  request.body.team2GroupId = await getGroupId(request.body.team2Id, request, fastify);

  if (validateMatchTypeId) {
    if (
      validateMatchTypeId?.noOfIningsPerSide &&
      validateMatchTypeId?.noOfIningsPerSide > 1
    ) {
      const TotalInnning = validateMatchTypeId?.noOfIningsPerSide;
      for (let i = 0; i < TotalInnning; i++) {
        request.body.currentInnings = i + 1;
        await insertCommentaryTeams(request, fastify);
        if (
          request.body.team1Players &&
          request.body.team1Players.length > 0 &&
          request.body.team2Players &&
          request.body.team2Players.length > 0
        ) {
          let data = [
            ...request.body.team1Players.map((item, i) => {
              const playerTpId = global.tblPlayers.find(elem => elem.playerId === item);
              return {
                commentaryId: addCommentry.commentaryId,
                teamId: request.body.team1Id,
                playerId: item,
                tpId: playerTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
            ...request.body.team2Players.map((item, i) => {
              const plaTpId = global.tblPlayers.find(elem => elem.playerId === item);
              return {
                commentaryId: addCommentry.commentaryId,
                teamId: request.body.team2Id,
                playerId: item,
                tpId: plaTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
          ];
          data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in createCommentaryService",
                "ERROR --> services/commentary.js/createCommentaryService",
                request
              );
              return false;
            }
            return true;
          });
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
            const teamPlayerData =
              await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
                {
                  playerId: playerData[0].playerId,
                  teamId: playerData[0].teamId,
                },
                fastify,
                request
              );
            if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
              await updateCommentaryPlayerJerseyImageQuery(
                {
                  commentaryPlayerId: playerData[0].commentaryPlayerId,
                  jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                  jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
                },
                fastify
              );
            } else {
              const teamData = global.tblTeams.find(
                (item) => item.teamId == playerData[0].teamId
              );
              const playerImgData = global.tblPlayers.find(
                (elem) => elem.playerId == playerData[0].playerId
              );
              if (playerImgData?.image && teamData?.jersey) {
                mergeAndSaveImage(
                  {
                    playerImage: playerImgData?.image,
                    jersey: teamData?.jersey,
                    playerName: playerImgData.playerName,
                    teamName: teamData.teamName,
                    commentaryPlayerId: playerData[0].commentaryPlayerId,
                    teamPlayerId: null,
                    commentaryId: addCommentry?.commentaryId,
                  },
                  fastify
                );
              }
            }
            if (info.playerId === request.body.team1Captain) {
              commentaryPlayerId.team1Captain =
                playerData[0].commentaryPlayerId;
            }
            if (info.playerId === request.body.team1Kipper) {
              commentaryPlayerId.team1Kipper = playerData[0].commentaryPlayerId;
            }
            if (info.playerId === request.body.team2Captain) {
              commentaryPlayerId.team2Captain =
                playerData[0].commentaryPlayerId;
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
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
      await insertCommentaryTeams(request, fastify);
      if (
        request.body.team1Players &&
        request.body.team1Players.length > 0 &&
        request.body.team2Players &&
        request.body.team2Players.length > 0
      ) {
        let data = [
          ...request.body.team1Players.map((item, i) => {
            const playerTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: addCommentry.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              tpId: playerTpId?.tpId ?? null,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            const plaTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: addCommentry.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              tpId: plaTpId?.tpId ?? null,
              displayOrder: i + 1,
            };
          }),
        ];
        data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in createCommentaryService.",
                "ERROR --> services/commentary.js/createCommentaryService",
                request
              );
              return false;
            }
          return true;
        });
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
          const teamPlayerData =
            await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
              {
                playerId: playerData[0].playerId,
                teamId: playerData[0].teamId,
              },
              fastify,
              request
            );
          if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
            await updateCommentaryPlayerJerseyImageQuery(
              {
                commentaryPlayerId: playerData[0].commentaryPlayerId,
                jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
              },
              fastify
            );
          } else {
            const teamData = global.tblTeams.find(
              (item) => item.teamId == playerData[0].teamId
            );
            const playerImgData = global.tblPlayers.find(
              (elem) => elem.playerId == playerData[0].playerId
            );
            if (playerImgData?.image && teamData?.jersey) {
              mergeAndSaveImage(
                {
                  playerImage: playerImgData?.image,
                  jersey: teamData?.jersey,
                  playerName: playerImgData.playerName,
                  teamName: teamData.teamName,
                  commentaryPlayerId: playerData[0].commentaryPlayerId,
                  teamPlayerId: null,
                  commentaryId: addCommentry?.commentaryId,
                },
                fastify
              );
            }
          }
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
    }
  }
  //store the template in db
  // check the competition
  let comp = global.tblCompetitions.find(
    (i) => i.competitionId == addCommentry.competitionId
  );
  if (
    comp &&
    comp.matchTypeId != null &&
    comp.matchTypeId == addCommentry.matchTypeId
  ) {
    await addCompTempQuery(
      {
        commentaryId: addCommentry.commentaryId,
        matchTypeId: addCommentry.matchTypeId,
        competitionId: addCommentry.competitionId,
      },
      request,
      fastify
    );
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
        type: "create",
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
  updateComInMarketService(
    {
      commentaryId: addCommentry.commentaryId,
      eventRefId: addCommentry.eventRefId,
    },
    request,
    fastify
  ).catch((err) => {
    console.log("upate com in market service console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/createCommentaryService",
      request
    );
  });

  if (addCommentry.isActive && addCommentry.isTest == false) {
    let cData = await getMatchDataByCId(
      {
        commentaryId: addCommentry.commentaryId,
      },
      request,
      fastify
    );

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData,
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
  addCommentry.callPrediction = callPrediction;
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
    request.body.isPredictMarket &&
    (global.tblCommentaries[index].eventRefId != null ||
      global.tblCommentaries[index].eventId != null)
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
  if (validateEventRefId && validateEventRefId.eventRefId !== null) {
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

  if (!request.body.eventRefId || !request.body.eventId) {
    request.body.isPredictMarket = false;
  }
  if (
    !request.body.team1Players ||
    request.body.team1Players.length == 0 ||
    !request.body.team2Players ||
    request.body.team2Players.length == 0
  ) {
    request.body.isClientShow = false;
  }
  await updateCommentaryQuery(request, fastify);
  const team1GroupId = await getGroupId(request.body.team1Id, request, fastify);
  const team2GroupId = await getGroupId(request.body.team2Id, request, fastify);

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
        // await updateCommentaryTeams(request, fastify, {
        //   teamCaptain: request.body.team1Captain
        //     ? request.body.team1Captain
        //     : null,
        //   teamKipper: request.body.team1Kipper
        //     ? request.body.team1Kipper
        //     : null,
        //   teamId: request.body.team1Id,
        //   commentaryId: request.body.commentaryId,
        //   currentInnings: request.body.currentInnings,
        // });
        // await updateCommentaryTeams(request, fastify, {
        //   teamCaptain: request.body.team2Captain
        //     ? request.body.team2Captain
        //     : null,
        //   teamKipper: request.body.team2Kipper
        //     ? request.body.team2Kipper
        //     : null,
        //   teamId: request.body.team2Id,
        //   commentaryId: request.body.commentaryId,
        //   currentInnings: request.body.currentInnings,
        // });

        await updateCommentaryTeams(request, fastify, {
          team1Captain: request.body.team1Captain
            ? request.body.team1Captain
            : null,
          team1Kipper: request.body.team1Kipper ? request.body.team1Kipper : null,
          team1Id: request.body.team1Id,
          team2Captain: request.body.team2Captain
            ? request.body.team2Captain
            : null,
          team2Kipper: request.body.team2Kipper ? request.body.team2Kipper : null,
          team2Id: request.body.team2Id,
          commentaryId: request.body.commentaryId,
          currentInnings: request.body.currentInnings,
          team1GroupId: team1GroupId,
          team2GroupId: team2GroupId,
        });

        // await deleteCommentaryPlayers(request, fastify);
        if (
          request.body.team1Players &&
          request.body.team1Players.length > 0 &&
          request.body.team2Players &&
          request.body.team2Players.length > 0
        ) {
          let data = [
            ...request.body.team1Players.map((item, i) => {
              const playerTpId = global.tblPlayers.find(elem => elem.playerId === item);
              return {
                commentaryId: request.body.commentaryId,
                teamId: request.body.team1Id,
                playerId: item,
                tpId: playerTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
            ...request.body.team2Players.map((item, i) => {
              const plaTpId = global.tblPlayers.find(elem => elem.playerId === item);
              return {
                commentaryId: request.body.commentaryId,
                teamId: request.body.team2Id,
                playerId: item,
                tpId: plaTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
          ];
          data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in update commentary api.",
                "ERROR --> services/commentary.js/updateCommentaryService",
                request
              );
              return false;
            }
            return true;
          });
          for (let info of data) {
            // await insertCommentaryPlayers(
            //   info,
            //   request.body.currentInnings,
            //   fastify,
            //   request
            // );
            const playerData = await upsertCommentaryPlayers(
              info,
              request.body.currentInnings,
              fastify,
              request
            );
            if (playerData.length > 0) {
              for (players of playerData) {
                const teamPlayerData =
                  await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
                    { playerId: info.playerId, teamId: info.teamId },
                    fastify,
                    request
                  );
                if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
                  await updateCommentaryPlayerJerseyImageQuery(
                    {
                      commentaryPlayerId: players?.commentaryPlayerId,
                      jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                      jerseyPlayerImagePath:
                        teamPlayerData?.jerseyPlayerImagePath,
                    },
                    fastify
                  );
                } else {
                  const teamData = global.tblTeams.find(
                    (item) => item.teamId == info.teamId
                  );
                  const playerImgData = global.tblPlayers.find(
                    (elem) => elem.playerId == info.playerId
                  );
                  if (playerImgData?.image && teamData?.jersey) {
                    mergeAndSaveImage(
                      {
                        playerImage: playerImgData?.image,
                        jersey: teamData?.jersey,
                        playerName: playerImgData.playerName,
                        teamName: teamData.teamName,
                        commentaryPlayerId: players.commentaryPlayerId,
                        teamPlayerId: null,
                        commentaryId: request.body?.commentaryId,
                      },
                      fastify
                    );
                  }
                }
              }
            }
          }
          const validateCommPlayers = global.tblCommentaryPlayers
            .filter(item => item.commentaryId == request.body.commentaryId)
            .map(item => item.playerId);
          const removedPlayers = validateCommPlayers.filter(
            playerId => ![...request.body.team1Players, ...request.body.team2Players].includes(playerId)
          );
          if (removedPlayers && removedPlayers.length > 0) {
            await deleteCommentaryPlayersByPlayerId(
              {
                commentaryId: request.body.commentaryId,
                playerIds: removedPlayers
              }, 
              request, fastify
            );
            global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
              (item) => !(item.commentaryId === request.body.commentaryId &&
                removedPlayers.includes(item.playerId))
            );
          }
        } else {
          await deleteCommentaryPlayers(request, fastify);
          global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
            (item) => ![request.body.commentaryId].includes(item?.commentaryId)
          );
        }
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
      // await updateCommentaryTeams(request, fastify, {
      //   teamCaptain: request.body.team1Captain
      //     ? request.body.team1Captain
      //     : null,
      //   teamKipper: request.body.team1Kipper ? request.body.team1Kipper : null,
      //   teamId: request.body.team1Id,
      //   commentaryId: request.body.commentaryId,
      //   currentInnings: request.body.currentInnings,
      // });
      // await updateCommentaryTeams(request, fastify, {
      //   teamCaptain: request.body.team2Captain
      //     ? request.body.team2Captain
      //     : null,
      //   teamKipper: request.body.team2Kipper ? request.body.team2Kipper : null,
      //   teamId: request.body.team2Id,
      //   commentaryId: request.body.commentaryId,
      //   currentInnings: request.body.currentInnings,
      // });

      await updateCommentaryTeams(request, fastify, {
        team1Captain: request.body.team1Captain
          ? request.body.team1Captain
          : null,
        team1Kipper: request.body.team1Kipper ? request.body.team1Kipper : null,
        team1Id: request.body.team1Id,
        team2Captain: request.body.team2Captain
          ? request.body.team2Captain
          : null,
        team2Kipper: request.body.team2Kipper ? request.body.team2Kipper : null,
        team2Id: request.body.team2Id,
        commentaryId: request.body.commentaryId,
        currentInnings: request.body.currentInnings,
        team1GroupId: team1GroupId,
        team2GroupId: team2GroupId,
      });

      // await deleteCommentaryPlayers(request, fastify);
      if (
        request.body.team1Players &&
        request.body.team1Players.length > 0 &&
        request.body.team2Players &&
        request.body.team2Players.length > 0
      ) {
        let data = [
          ...request.body.team1Players.map((item, i) => {
            const playerTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              tpId: playerTpId?.tpId ?? null,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            const playTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              tpId: playTpId?.tpId,
              displayOrder: i + 1,
            };
          }),
        ];
        data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in update commentary api",
                "ERROR --> services/commentary.js/updateCommentaryService",
                request
              );
              return false;
            }
          return true;
        });
        for (let info of data) {
          // await insertCommentaryPlayers(info, currentinning, fastify, request);
          const playerData = await upsertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );
          if (playerData.length > 0) {
            for (players of playerData) {
              const teamPlayerData =
                await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
                  { playerId: info.playerId, teamId: info.teamId },
                  fastify,
                  request
                );
              if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
                await updateCommentaryPlayerJerseyImageQuery(
                  {
                    commentaryPlayerId: players?.commentaryPlayerId,
                    jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                    jerseyPlayerImagePath:
                      teamPlayerData?.jerseyPlayerImagePath,
                  },
                  fastify
                );
              } else {
                const teamData = global.tblTeams.find(
                  (item) => item.teamId == info.teamId
                );
                const playerImgData = global.tblPlayers.find(
                  (elem) => elem.playerId == info.playerId
                );
                if (playerImgData?.image && teamData?.jersey) {
                  mergeAndSaveImage(
                    {
                      playerImage: playerImgData?.image,
                      jersey: teamData?.jersey,
                      playerName: playerImgData.playerName,
                      teamName: teamData.teamName,
                      commentaryPlayerId: players.commentaryPlayerId,
                      teamPlayerId: null,
                      commentaryId: request.body?.commentaryId,
                    },
                    fastify
                  );
                }
              }
            }
          }
        }
          const validateCommPlayers = global.tblCommentaryPlayers
            .filter(item => item.commentaryId == request.body.commentaryId)
            .map(item => item.playerId);
          const removedPlayers = validateCommPlayers.filter(
            playerId => ![...request.body.team1Players, ...request.body.team2Players].includes(playerId)
          );

          if (removedPlayers && removedPlayers.length > 0) {
            await deleteCommentaryPlayersByPlayerId(
              {
                commentaryId: request.body.commentaryId,
                playerIds: removedPlayers
              }, 
              request, fastify
            );
            global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
              (item) => !(item.commentaryId === request.body.commentaryId &&
                removedPlayers.includes(item.playerId))
            );
          }
      } else if (request.body.team1Players &&
          request.body.team1Players.length > 0 ||
          request.body.team2Players &&
          request.body.team2Players.length > 0) {
          let data = [
          ...request.body.team1Players.map((item, i) => {
            const playerTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team1Id,
              playerId: item,
              tpId: playerTpId?.tpId ?? null,
              displayOrder: i + 1,
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            const playTpId = global.tblPlayers.find(elem => elem.playerId === item);
            return {
              commentaryId: request.body.commentaryId,
              teamId: request.body.team2Id,
              playerId: item,
              tpId: playTpId?.tpId,
              displayOrder: i + 1,
            };
          }),
        ];
        data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in update commentary api",
                "ERROR --> services/commentary.js/updateCommentaryService",
                request
              );
              return false;
            }
          return true;
        });
        for (let info of data) {
          const playerData = await upsertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );
          if (playerData.length > 0) {
            for (players of playerData) {
              const teamPlayerData =
                await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
                  { playerId: info.playerId, teamId: info.teamId },
                  fastify,
                  request
                );
              if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
                await updateCommentaryPlayerJerseyImageQuery(
                  {
                    commentaryPlayerId: players?.commentaryPlayerId,
                    jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                    jerseyPlayerImagePath:
                      teamPlayerData?.jerseyPlayerImagePath,
                  },
                  fastify
                );
              } else {
                const teamData = global.tblTeams.find(
                  (item) => item.teamId == info.teamId
                );
                const playerImgData = global.tblPlayers.find(
                  (elem) => elem.playerId == info.playerId
                );
                if (playerImgData?.image && teamData?.jersey) {
                  mergeAndSaveImage(
                    {
                      playerImage: playerImgData?.image,
                      jersey: teamData?.jersey,
                      playerName: playerImgData.playerName,
                      teamName: teamData.teamName,
                      commentaryPlayerId: players.commentaryPlayerId,
                      teamPlayerId: null,
                      commentaryId: request.body?.commentaryId,
                    },
                    fastify
                  );
                }
              }
            }
          }
        }
          const validateCommPlayers = global.tblCommentaryPlayers
            .filter(item => item.commentaryId == request.body.commentaryId)
            .map(item => item.playerId);
          const removedPlayers = validateCommPlayers.filter(
            playerId => ![...request.body.team1Players, ...request.body.team2Players].includes(playerId)
          );
          if (removedPlayers && removedPlayers.length > 0) {
            await deleteCommentaryPlayersByPlayerId(
              {
                commentaryId: request.body.commentaryId,
                playerIds: removedPlayers
              }, 
              request, fastify
            );
            global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
              (item) => !(item.commentaryId === request.body.commentaryId &&
                removedPlayers.includes(item.playerId))
            );
          }
      } else if (request.body.team1Players &&
          request.body.team1Players.length == 0 &&
          request.body.team2Players &&
          request.body.team2Players.length == 0) {
          await deleteCommentaryPlayers(request, fastify);
            global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
              (item) => ![request.body.commentaryId].includes(item?.commentaryId)
          );
      }
    }
  }

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;

  const validateWeather = global.tblWeather.find(item => item.commentaryId === request.body.commentaryId);
  if (validateWeather) {
    const weatherData = {
      weatherCondition: request.body.weatherCondition ?? validateWeather.weatherCondition,
      description: request.body.description ?? validateWeather.description,
      temp: request.body.temp ?? validateWeather.temp,
      humidity: request.body.humidity ?? validateWeather.humidity,
      visibility: request.body.visibility ?? validateWeather.visibility,
      windSpeed: request.body.windSpeed ?? validateWeather.windSpeed,
      clouds: request.body.clouds ?? validateWeather.clouds,
      commentaryId: request.body.commentaryId ?? validateWeather.commentaryId,
      id: validateWeather.id,
    }
    const weather = await updateWeatherQuery(weatherData, fastify, request);
    const index = global.tblWeather.findIndex(item => item?.commentaryId === request.body.commentaryId);
    if (index !== -1) {
      global.tblWeather[index] = weather[0]
    } else {
      global.tblWeather.push(weather[0]);
    }
  } else {
    const weatherFields = [
      "weatherCondition",
      "description",
      "temp",
      "humidity",
      "visibility",
      "windSpeed",
      "clouds"
    ];

    const hasWeatherData = weatherFields.some(field => request.body[field] != null);

    if(hasWeatherData) {
      const weather = await insertWeatherQuery(request.body, fastify, request);
      global.tblWeather.push(weather);
    }
  }

  const validatePitch = global.tblPitchConditions.find(item => item?.commentaryId === request.body.commentaryId);
  if (validatePitch) {
    const data = {
      pitchCondition: request.body.pitchCondition ?? validatePitch.pitchCondition,
      battingCondition: request.body.battingCondition ?? validatePitch.battingCondition,
      paceBowlingCondition: request.body.paceBowlingCondition ?? validatePitch.paceBowlingCondition,
      spineBowlingConniton: request.body.spineBowlingConniton ?? validatePitch.spineBowlingConniton,
      commentaryId: request.body.commentaryId ?? validatePitch.commentaryId,
      id: validatePitch.id,
    }
    const pitch = await updatePitchConditionQuery(data, fastify, request);
    const index = global.tblPitchConditions.findIndex(item => item?.commentaryId === request.body.commentaryId);
    if (index !== -1) {
      global.tblPitchConditions[index] = pitch[0]
    } else {
      global.tblPitchConditions.push(pitch[0]);
    }
  } else {
    const pitchFields = [
      "pitchCondition",
      "battingCondition",
      "paceBowlingCondition",
      "spineBowlingConniton"
    ];

    const hasPitchData = pitchFields.some(field => request.body[field] != null);
    if(hasPitchData) {
      const pitch = await insertPitchConditionQuery(request.body, fastify, request);
      global.tblPitchConditions.push(pitch);
    }
  }

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
        type: "update",
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

  let cData = await getMatchDataByCId(
    {
      commentaryId: updatedData.commentaryId,
    },
    request,
    fastify
  );

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        type: "update",
      },
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/updateCommentaryService",
      request
    );
  });

  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    const socketData = {
      commentaryId: updatedData.commentaryId,
      isClientShow: updatedData?.isClientShow,
      isActive: updatedData?.isActive
    };
    
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateActionType", socketData);
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
  if (validateEventRefId && validateEventRefId.eventRefId !== null) {
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
    tpId: null,
    scoringType: 1.
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
    team1Players: team1Players,
    team2Captain: team2.teamCaptain,
    team2Kipper: team2.teamKipper,
    team2Players:team2Players,
    teamMaxOver: validateMatchTypeId.maxOversInFirstInings,
    drsCount: team1.drsCount,
    subInning: team1.subInning,
    team1TpId: team1?.tpId ?? null,
    team2TpId: team2?.tpId ?? null,
  };

  request.body.team1GroupId = await getGroupId(request.body.team1Id, request, fastify);
  request.body.team2GroupId = await getGroupId(request.body.team2Id, request, fastify);

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
        if (
          request.body.team1Players &&
          request.body.team1Players.length > 0 &&
          request.body.team2Players &&
          request.body.team2Players.length > 0
        ) {
          let data = [
            ...request.body.team1Players.filter(p => p.currentInnings === currentInning)
            .map((item, i) => {
              const playerTpId = global.tblPlayers.find(elem => elem.playerId === item.playerId);
              return {
                commentaryId: newCommentary.commentaryId,
                teamId: request.body.team1Id,
                playerId: item.playerId,
                tpId: playerTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
            ...request.body.team2Players.filter(p => p.currentInnings === currentInning)
            .map((item, i) => {
              const playTpId = global.tblPlayers.find(elem => elem.playerId === item.playerId);
              return {
                commentaryId: newCommentary.commentaryId,
                teamId: request.body.team2Id,
                playerId: item.playerId,
                tpId: playTpId?.tpId ?? null,
                displayOrder: i + 1,
              };
            }),
          ];
          data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in clone commentary api",
                "ERROR --> services/commentary.js/cloneCommentaryService",
                request
              );
              return false;
            }
            return true;
          });
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
            const teamPlayerData =
              await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
                {
                  playerId: playerData[0].playerId,
                  teamId: playerData[0].teamId,
                },
                fastify,
                request
              );
            if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
              await updateCommentaryPlayerJerseyImageQuery(
                {
                  commentaryPlayerId: playerData[0].commentaryPlayerId,
                  jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                  jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
                },
                fastify
              );
            } else {
              const teamData = global.tblTeams.find(
                (item) => item.teamId == playerData[0].teamId
              );
              const playerImgData = global.tblPlayers.find(
                (elem) => elem.playerId == playerData[0].playerId
              );
              if (playerImgData?.image && teamData?.jersey) {
                mergeAndSaveImage(
                  {
                    playerImage: playerImgData?.image,
                    jersey: teamData?.jersey,
                    playerName: playerImgData.playerName,
                    teamName: teamData.teamName,
                    commentaryPlayerId: playerData[0].commentaryPlayerId,
                    teamPlayerId: null,
                    commentaryId: newCommentary?.commentaryId,
                  },
                  fastify
                );
              }
            }
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
            {
              ...commentaryPlayer,
              currentInnings: request.body.currentInnings,
            },
            fastify,
            request
          );
        }
      }
    } else {
      const currentInning = 1;
      request.body.currentInnings = currentInning;
      await insertCommentaryTeams(request, fastify);
      if (
        request.body.team1Players &&
        request.body.team1Players.length > 0 &&
        request.body.team2Players &&
        request.body.team2Players.length > 0
      ) {
        let data = [
          ...request.body.team1Players.map((item, i) => {
            const playerTpId = global.tblPlayers.find(elem => elem.playerId === item.playerId);
            return {
              commentaryId: newCommentary.commentaryId,
              teamId: request.body.team1Id,
              playerId: item.playerId,
              tpId: playerTpId?.tpId ?? null,
              displayOrder: i + 1,
              isInPlayingEleven : item.isInPlayingEleven
            };
          }),
          ...request.body.team2Players.map((item, i) => {
            const playTpId = global.tblPlayers.find(elem => elem.playerId === item.playerId);
            return {
              commentaryId: newCommentary.commentaryId,
              teamId: request.body.team2Id,
              playerId: item.playerId,
              tpId: playTpId?.tpId ?? null,
              displayOrder: i + 1,
              isInPlayingEleven : item.isInPlayingEleven
            };
          }),
        ];
        data = data.filter(elem => {
            if (elem.playerId == 0) {
              errorLogger(
                fastify,
                "playerId 0 error in clone commentary api.",
                "ERROR --> services/commentary.js/cloneCommentaryService",
                request
              );
              return false;
            }
          return true;
        });
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
          const teamPlayerData =
            await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
              {
                playerId: palyerData[0].playerId,
                teamId: palyerData[0].teamId,
              },
              fastify,
              request
            );
          if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
            await updateCommentaryPlayerJerseyImageQuery(
              {
                commentaryPlayerId: palyerData[0].commentaryPlayerId,
                jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
                jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
              },
              fastify
            );
          } else {
            const teamData = global.tblTeams.find(
              (item) => item.teamId == palyerData[0].teamId
            );
            const playerImgData = global.tblPlayers.find(
              (elem) => elem.playerId == palyerData[0].playerId
            );
            if (playerImgData?.image && teamData?.jersey) {
              mergeAndSaveImage(
                {
                  playerImage: playerImgData?.image,
                  jersey: teamData?.jersey,
                  playerName: playerImgData.playerName,
                  teamName: teamData.teamName,
                  commentaryPlayerId: palyerData[0].commentaryPlayerId,
                  teamPlayerId: null,
                  commentaryId: newCommentary?.commentaryId,
                },
                fastify
              );
            }
          }

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
  }

  // check the competition
  let comp = global.tblCompetitions.find(
    (i) => i.competitionId == newCommentary.competitionId
  );
  if (
    comp &&
    comp.matchTypeId != null &&
    comp.matchTypeId == newCommentary.matchTypeId
  ) {
    await addCompTempQuery(
      {
        commentaryId: newCommentary.commentaryId,
        matchTypeId: newCommentary.matchTypeId,
        competitionId: newCommentary.competitionId,
      },
      request,
      fastify
    );
  }

  global.tblCommentaries.push(newCommentary);
  const validateWeather = global.tblWeather.find(item => item.commentaryId === commentaryId);
  if (validateWeather) {
    const weatherData = {
      ...validateWeather,
      commentaryId: newCommentary.commentaryId
    }
    const weather = await insertWeatherQuery(weatherData, fastify, request);
    global.tblWeather.push(weather);
  }

  const validatePitch = global.tblPitchConditions.find(item => item.commentaryId === commentaryId);
  if (validatePitch) {
    const data = {
      ...validatePitch,
      commentaryId: newCommentary.commentaryId
    }
    const pitch = await insertPitchConditionQuery(data, fastify, request);
    global.tblPitchConditions.push(pitch);
  }

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
        type: "create",
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
  updateComInMarketService(
    {
      commentaryId: newCommentary.commentaryId,
      eventRefId: newCommentary.eventRefId,
    },
    request,
    fastify
  ).catch((err) => {
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
  if (newCommentary.isActive && newCommentary.isTest == false) {
    let cData = await getMatchDataByCId(
      {
        commentaryId: newCommentary.commentaryId,
      },
      request,
      fastify
    );

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData,
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
        originalCommentary.commentaryStatus == 3 ||
        originalCommentary.commentaryStatus == 5)
    ) {
      _resFromPredictAPI = null;
      let key1 = global.tblConfigs.find(
        (item) => item.key === configConstants.DEFAULTBALLFACED
      );
      let key2 = global.tblConfigs.find(
        (item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES
      );
      let key3 = global.tblConfigs.find(
        (item) => item.key === configConstants.DEFAULTPLAYERRUNS
      );
      let pythonURI = originalCommentary.pythonURI ? originalCommentary.pythonURI : null;
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
        request,
        pythonURI
      );
      let callPrediction = {};
      // Check for error_msg in the response
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.Cid = currId;
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = "/api/v1/loadcommentary";
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
  let playerIds = [];
  let matchTypeIds = [];
  let netRunRateData = [];
  for (const id of commentaryId) {
    const comm = global.tblCommentaries.find(
      (c) => c?.commentaryId === id
    );
    if (comm && comm?.isPredictMarket == true) {
      let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false 
        AND tem."wrCommentaryId" = ${id} 
        AND tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel})`;
      const eventMarket = await getAllEventMarketsQuery(fastify, whereCondition);
      if(eventMarket.length > 0) {
        throw new Error(`Some markets are still open, so no commentary can be deleted right now`)
      }
    }
  }
  for (const commentary of commentaryId) {
    let eventId = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentary
    );

    let playerlist = global.tblCommentaryPlayers
      .filter(
        (elem) =>
          elem.commentaryId === eventId.commentaryId &&
          elem.isInPlayingEleven == true
      )
      .map((pl) => pl.playerId);

    if (eventId.matchTypeId !== null && eventId.matchTypeId !== undefined) {
      matchTypeIds.push(eventId.matchTypeId);
    }

    if (eventId && eventId.isTest == false) {
      playerIds = playerIds.concat(playerlist);
      netRunRateData.push({
        competitionId: eventId.competitionId,
        teamId: [eventId.team1Id, eventId.team2Id],
      });
    }
    eventIdArr.push(eventId.eventRefId);
    await deleteCommentryQuery(commentary, request, fastify);
    await updateEventMarketCloseQuery(commentaryId, request, fastify);
    // if (result.length > 0) {
    //   result.forEach((updatedItem) => {
    //     let index = global.tblEventMarketsV2.findIndex(
    //       (item) => item.eventMarketId === updatedItem.eventMarketId
    //     );
    //     if (index !== -1) {
    //       global.tblEventMarketsV2[index] = {
    //         ...global.tblEventMarketsV2[index],
    //         ...updatedItem,
    //       };
    //     }
    //     global.tblMarketRunnerV2.forEach((elem) => {
    //       if (elem.eventMarketId === updatedItem.eventMarketId) {
    //         elem.selectionStatus = EventMarketStatus.Close;
    //       }
    //     });
    //   });
    // }

    await deleteCommentaryPlayerHistoryQuery(commentary, request, fastify);
    await deleteEventSnapByCommentaryIdQuery(commentary, request, fastify);
    await deleteTipsByCommentaryIdQuery(commentary, request, fastify);
  }

  const marketIds = global.tblEventMarketsV2
    .filter((item) => commentaryId.includes(item.commentaryId))
    .map((item) => item.eventMarketId);

  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (runner) => !marketIds.includes(runner.eventMarketId)
  );

  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !commentaryId.includes(item.commentaryId)
  );

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  global.tblTips = global.tblTips.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  await deleteWeatherWithCommentaryIdQuery(commentaryId, fastify, request);
  await deletePitchConditionWithCommIdQuery(commentaryId, fastify, request);

  global.tblWeather = global.tblWeather.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  global.tblPitchConditions = global.tblPitchConditions.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  let status = 1;
  for (const runRate of netRunRateData) {
    const request = {
      body: {
        competitionId: runRate.competitionId,
        teamId: runRate.teamId,
        status,
      },
    };

    await netRunRateRe_calculationService(request, fastify);
  }

  // for (const p of playerIds) {
  //   const request = {
  //     body: {
  //       playerId: p,
  //       matchTypeId: matchTypeIds,
  //     },
  //   };
  //   if (request.body.matchTypeId.length > 0) {
  //     await calculationOfCommPlayerBatHistService(request, fastify);
  //     await calculationOfCommPlayerBowlHistService(request, fastify);
  //   }
  // }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        type: "deleteEvent",
        eventId: eventIdArr,
        commentaryId : commentaryId
      },
    },
    request,
    fastify
  ).catch((err) => {
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
      type: "delete",
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
          deleteCommentaryBallByBallId || deleteOverId
            ? request.userTokenInfo.WrUserId
            : null,
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
      if (previousCommentaryStatus != statusToUpdate) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update",
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

      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.playerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
            const isFDS = global.tblConfigs.find(
              (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
            ).value;
            if (isFDS && isFDS == "true") {
              if (_wkt || _bory) {
                const now = new Date();
                const formattedDate = formatDateToISOString(now);
                callfds(
                  {
                    Id: 0,
                    EventId: parseInt(commentaryData.eventRefId),
                    BWDateTime: (await formattedDate).toString,
                    Type: _bory === true ? "2" : _wkt === true ? "1" : "",
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
      const eventMarket = await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      if (eventMarket.length > 0) {
        // eventMarket.forEach((updatedItem) => {
        //   let index = global.tblEventMarketsV2.findIndex(
        //     (item) => item.eventMarketId === updatedItem.marketId
        //   );
        //   if (index !== -1) {
        //     global.tblEventMarketsV2[index] = {
        //       ...global.tblEventMarketsV2[index],
        //       ...updatedItem,
        //     };
        //   }
        // });
        for (const updatedItem of eventMarket) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.marketId
          );
          if (index !== -1) {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        }
      }

      global.tblMarketRunnerV2
        .filter((elem) =>
          eventMarket.some((e) => e.marketId === elem.eventMarketId)
        )
        .forEach((elem) => {
          elem.selectionStatus = EventMarketStatus.Close;
        });

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
      commentaryDetails &&
      _sendPrePlayers &&
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
      } catch (error) {
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
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
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
  // get req start time
  const startTime = new Date();
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
      isEndInnings,
      isCallPredict = false,
      isTeamStatusUpdate = false,
      updateTeamStatus
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
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
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
      await notiConfigContentReplaceService(
        EventName.INNINGCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );

      // let data = global.tblNotificationConfig.find((elem) =>
      //   elem.isActive === true && elem.eventName === EventName.INNINGCOMPLETED
      // )
      // if(data && commentaryData.isActive == true && commentaryData.eventName != null) {
      //   data.content = data.content.replace("{}", commentaryData.eventName);
      //   if(
      //     global?.clientSocketIo !== undefined &&
      //     global?.clientSocketIo.length > 0
      //   ){
      //     global.clientSocketIo.forEach((socket) => {
      //       socket.client.emit("notificationSend", data);
      //     });
      //     let notificationData = {
      //       title: commentaryData.eventName,
      //       description: data.content,
      //       commentaryId: commentaryData.commentaryId,
      //     }
      //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      //   }
      // }
    }

    // if (!isTeamStatusUpdate && commentaryTeams && commentaryTeams.length > 0) {
    //   commentaryTeams = commentaryTeams.map(elem => {
    //     const teamData = global?.tblCommentaryTeams?.find(item =>
    //       item.commentaryTeamId === elem.commentaryTeamId
    //     );
    //     return teamData
    //       ? { ...elem, teamStatus: teamData.teamStatus }
    //       : elem;
    //   });
    // }
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
      balltypeOfdeleteBall =
        global.tblCommentaryBallByBall[deleteBallIndex].ballType;
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
            item?.commentaryId === commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      });
    }
    if(updateTeamStatus && updateTeamStatus.length > 0){
      for (let t of updateTeamStatus){
        let index = global.tblCommentaryTeams.findIndex((i)=>i.commentaryTeamId == t.commentaryTeamId)
        if(index == -1){
          throw new Error("Commentary Team with this id not found of updateTeamStatus")
        }
      }
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
      commentaryPlayers.forEach((player) => {
        if (player.commentaryPlayerId) {
          const index = global.tblCommentaryPlayers.findIndex(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId && item.commentaryId === commentaryId
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
        // const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
        //   return (
        //     item?.commentaryId === commentaryOvers.commentaryId &&
        //     // item.teamId === commentaryOvers.teamId &&
        //     item.commentaryPlayerId === commentaryOvers.bowlerId
        //   );
        // });

        // if (indexBowler === -1) {
        //   throw new Error("Bowler with this id not Found");
        // }
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_setcommentary(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13,$14 ,$15, $16, $17,$18
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
          updateTeamStatus ? JSON.stringify(updateTeamStatus) : null,
          deleteCommentaryBallByBallId ? deleteCommentaryBallByBallId : null,
          deleteOverId ? deleteOverId : null,
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          null, // commentaryWicketDetails,
          null, // commentaryPartnershipDetails,
          null, // commentaryDetailsDetails,
          deleteCommentaryBallByBallId || deleteOverId ? true : false,
          deleteCommentaryBallByBallId || deleteOverId
            ? request.userTokenInfo.WrUserId
            : null,
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
    const setEventSnap = [];
    const teamPoint = [];

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
        rmk: commentaryDetails.rmk,
        winRmk: commentaryDetails.winRmk,
        tossRmk: commentaryDetails.tossRmk,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);

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
        isPredict: commentaryDetails.isPredictMarket,
        rmk: commentaryDetails.rmk,
        winRmk: commentaryDetails.winRmk,
        tossRmk: commentaryDetails.tossRmk,
        ...weatherAndPitchData,
      };
      if (commentaryDetails.commentaryStatus == 2) {
        await notiConfigContentReplaceService(
          EventName.WINTOSS,
          commentaryDetails.commentaryId,
          request,
          fastify
        );
        // let data = global.tblNotificationConfig.find((elem) =>
        //   elem.isActive === true && elem.eventName === EventName.WINTOSS
        // )
        // if(data && commentaryDetails.isActive === true && commentaryDetails.eventName != null) {
        //   data.content = data.content.replace("{}", commentaryDetails.eventName);
        //   if(
        //     global?.clientSocketIo !== undefined &&
        //     global?.clientSocketIo.length > 0
        //   ){
        //     global.clientSocketIo.forEach((socket) => {
        //       socket.client.emit("notificationSend", data);
        //     });
        //     let notificationData = {
        //       title: commentaryDetails.eventName,
        //       description: data.content,
        //       commentaryId: commentaryDetails.commentaryId,
        //     }
        //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
        //   }
        // }
      }
      if (
        previousCommentaryStatus != statusToUpdate 
        // &&
        // commentaryData?.isPredictMarket == true
      ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update",
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
        const cData = await getMatchDataByCId(
          {
            commentaryId: commentaryId,
          },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData,
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
      if (previousCommentaryStatus != statusToUpdate && statusToUpdate == 4) {
        await notiConfigContentReplaceService(
          EventName.EVENTCOMPLETED,
          commentaryData.commentaryId,
          request,
          fastify
        );

        // let data = global.tblNotificationConfig.find((elem) =>
        //   elem.isActive === true && elem.eventName === EventName.EVENTCOMPLETED
        // )
        // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
        //   data.content = data.content.replace("{}", commentaryData.eventName);
        //   if(
        //     global?.clientSocketIo !== undefined &&
        //     global?.clientSocketIo.length > 0
        //   ){
        //     global.clientSocketIo.forEach((socket) => {
        //       socket.client.emit("notificationSend", data);
        //     });
        //     let notificationData = {
        //       title: commentaryData.eventName,
        //       description: data.content,
        //       commentaryId: commentaryData.commentaryId,
        //     }
        //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
        //   }
        // }
        let com = global.tblCompetitions.find(
          (item) => item.competitionId === commentaryData.competitionId
        );
        if (com && com.isEventSnap == true) {
          setEventSnap.push({
            commentaryId: commentaryId,
            eventRefId: commentaryData.eventRefId,
            competitionId: commentaryData.competitionId,
            eventTypeId: commentaryData.eventTypeId,
          });
        }
        if (
          com &&
          com.isPointTable == true &&
          commentaryData?.isTest == false
        ) {
          teamPoint.push({
            commentaryId: commentaryId,
            competitionId: commentaryData.competitionId,
            team1Id: commentaryData.team1Id,
            team2Id: commentaryData.team2Id,
            winnerId: commentaryDetails.winnerId,
          });
        }
        if (setEventSnap.length > 0) {
          setCompEventSnapSerice(setEventSnap, request, fastify).catch(
            (err) => {
              console.log("setCompEventSnapSerice console savedetails", err);
              errorLogger(
                fastify,
                err.message,
                "ERROR --> services/commentary.js/saveDetails - syncCommentaryStatsWithAPIAndSocket - setEventSnap",
                request
              );
            }
          );
        }
        if (teamPoint.length > 0) {
          setTeamPointService(teamPoint, request, fastify).catch((err) => {
            console.log("setTeamPointService console savedetails", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setTeamPointService",
              request
            );
          });
        }
        if (commentaryData && commentaryData?.isTest === false) {
          try {
            const result = await fastify.db.query(
              `SELECT * FROM fn_insert_auto_update_player_statistics_by_commentary(:commentaryId, :createdBy)`,
              {
                replacements: {
                  commentaryId: commentaryData.commentaryId,
                  createdBy: request?.userTokenInfo?.WrUserId || -3
                },
                type: fastify.db.QueryTypes.SELECT
              }
            );

            if (result && result.length > 0) {
              const notInsertedCPIds = result.filter(r => r.status === "skipped")?.map(r => r.player_id);
              if (notInsertedCPIds.length > 0) {
                errorLogger(
                  fastify,
                  `CommentaryId: ${commentaryId} and PlayerId: ${notInsertedCPIds.join(", ")} skipped`,
                  "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
                  request
                );
              }
            }
          } catch (error) {
            errorLogger(
              fastify,
              `Error in fn_insert_auto_update_player_statistics_by_commentary for CommentaryId: ${commentaryId} => ${error.message}`,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
              request
            );
          }
          // setPlayerHistoryService(
          //   {
          //     commentaryId: [commentaryId],
          //   },
          //   request,
          //   fastify
          // ).catch((err) => {
          //   console.log("setPlayerHistoryService console savedetails", err);
          //   errorLogger(
          //     fastify,
          //     err.message,
          //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setPlayerHistoryService",
          //     request
          //   );
          // });
        }
        const tipsData = global.tblTips
          .filter(
            (item) =>
              item.commentaryId === commentaryDetails.commentaryId ||
              item.eventRefId === commentaryDetails.eventRefId
          )
          .map((elem) => elem.id);
        if (tipsData.length > 0) {
          global.tblTips = global.tblTips.filter(
            (item) => !tipsData.includes(item.id)
          );
          callClientAPI(
            {
              serviceType: ServiceType.clientAPI,
              moduleType: APIEndpointModuleType.updateSeoModule,
              data: {
                module: "tips",
                type: "delete",
                data: {
                  id: tipsData,
                },
              },
            },
            request,
            fastify
          )
        }
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        if(team.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for team ${team.teamName}. Expected: ${commentaryId}, Found: ${team.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        else {
           global.tblCommentaryTeams[index] = {
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
          };
          response.commentaryTeams.push(global.tblCommentaryTeams[index]);
        }
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
      });
    }
    if(updateTeamStatus && updateTeamStatus != null){
      response.updateTeamStatus = [];
      updateTeamStatus.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if(team.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for team ${team.teamName}. Expected: ${commentaryId}, Found: ${team.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        else {
          global.tblCommentaryTeams[index] = {
            ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
          };
          response.updateTeamStatus.push(global.tblCommentaryTeams[index]);
        }
      });
      try {
        response.updateTeamStatus.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.updateTeamStatus.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
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
        (item) => item?.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      try {
        _deleteBallID = {};
        _deleteBallID.commentaryBallByBallId = deleteCommentaryBallByBallId;
        _deleteBallID.commentaryId = commentaryId;
        await deleteMarketOddsBallByBall(_deleteBallID, fastify, request);
      } catch (error) {
        console.log(new Date(), "delete market odds ball by ball console", error);
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
            item?.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
      }
      if (commentaryWicket) {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId === commentaryWicket.commentaryWicketId
        );
      }
      // call predictscore
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 1
      );
      const nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 2
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
        if (commentaryData.isPredictMarket && isCallPredict == true) {
          //_resFromPredictAPI = null;
          const decimalOverCount = parseFloat(previousBall.overCount);
          const _wkt = previousBall.ballIsWicket;
          // let pythonURI = commentaryData.pythonURI ?? false;
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
                : null,
              ballType: previousBall?.ballType ?? null,
              target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
            },
            "/api/v1/undoscore",
            fastify,
            request,
            pythonURI
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
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        if( player.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for player ${player.playerName}. Expected: ${commentaryId}, Found: ${player.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        else {
           response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds?.displayName,
        });
        }
       
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }
    if (
      updatedData.commentaryBallByBallDetails &&
      commentaryData.isPredictMarket &&
      updatedData.commentaryBallByBallDetails.ballType != 0 &&
      updatedData.commentaryBallByBallDetails.ballType != 8 &&
      isCallPredict == true
    ) {
      let strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 1
      );
      let over = global.tblOvers.find((i)=>i?.overId == updatedData?.commentaryBallByBallDetails?.overId)
      let nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 2
      );
      let target = commentaryData.target ?? null;
      let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      let _wkt = commentaryBallByBall.ballIsWicket;
      let partnership = updatedData.commentaryPartnershipDetails;
      // console.log("partnership", partnership.totalSix || 0, partnership.totalFour || 0);
      let boundary = (partnership?.totalSix || 0) + (partnership?.totalFour || 0);
      // console.log("boundary", boundary);
      if (partnership)
        sendPartnership.push({
          partnership_no: partnership?.order || 0,
          partnership_boundaries: boundary,
          total_balls: partnership?.totalBalls || 0,
          total_runs: partnership?.totalRuns || 0,
        })
      const predictionPayload = {
        playerpredictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount || 0,
          player_details: _sendPrePlayers,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          partnership_details: sendPartnership,
        },
        predictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          ball: decimalOverCount,
          run: commentaryBallByBall.ballRun,
          total_score: strikeTeam.teamScore,
          strike_team_id: strikeTeam.teamId,
          wicket: _wkt === true ? 1 : 0,
          over_type : over?.overType || 0,
          commentary_player_id : commentaryBallByBall?.bowlerId || 0,
          bowling_style : commentaryBallByBall?.bowlingType || 0,
          total_wicket: strikeTeam.teamWicket,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          ballType: commentaryBallByBall?.ballType ?? null,
          target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
        },
        commentary_id: commentaryId,
        target: target
      };
      let isNodePrediction =
        global.tblConfigs.find(
          (item) => item.key === configConstants.ISPREDICATIONFROMNODE
        )?.value || "false";
      if (isNodePrediction == "true") {
        processPredictScoreMarket(predictionPayload, fastify)
      }
      else {
        //  let isVirtual = commentaryData.isVirtual || false;
        callPredictorMarket(
          predictionPayload,
          "/api/v1/predictscore",
          fastify,
          request,
          pythonURI
        );
      }
    }
    if (commentaryOvers) {
      if (updatedData.overDetails) {
        // call predict call
        let pythonURI = commentaryData.pythonURI;
        let comP = global.tblCommentaryPlayers.find((i)=>i.commentaryPlayerId == updatedData.overDetails?.bowlerId);
        const batTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.teamStatus === 1 &&
          item.currentInnings === commentaryData.currentInnings
        );
        
        callPredictorMarket(
          {
            commentary_id: commentaryId,
            over_type_id: updatedData.overDetails?.overType || null,
            over_id: updatedData.overDetails?.overId || null,
            team_id: updatedData.overDetails?.teamId || null,
            bowler_id: updatedData.overDetails?.bowlerId || null,
            wicket: batTeam?.teamWicket || 0,
            bowling_style : comP?.bowlingType || null,
            ball_by_ball_id : 0
          },
          "/api/v1/changebowler",
          fastify,
          request,
          pythonURI
        )
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
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });

        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(
              commentaryId,
              updatedData.commentaryBallByBallDetails,
              fastify
            );
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create",
                });
              }
            }
          }
        }
        // if (
        //   commentaryData.isPredictMarket &&
        //   updatedData.commentaryBallByBallDetails.ballType > 0
        // ) {
        //   let strikeTeam = global.tblCommentaryTeams.find(
        //     (item) =>
        //       item?.commentaryId === commentaryBallByBall.commentaryId &&
        //       item.teamStatus === 1
        //   );

        //   let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
        //   let _wkt = commentaryBallByBall.ballIsWicket;
        //   callPredictorMarket(
        //     {
        //       playerpredictscore :  {
        //         commentary_id: commentaryData.commentaryId,
        //         match_type_id: commentaryData.matchTypeId,
        //         event_id: commentaryData.eventRefId,
        //         current_team_id: strikeTeam.teamId,
        //         total_score: strikeTeam.teamScore,
        //         current_ball: decimalOverCount || 0,
        //         player_details: _sendPrePlayers,
        //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
        //         ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
        //         : null,
        //         partnership_details : sendPartnership
        //       },
        //       predictscore : {
        //         commentary_id: commentaryData.commentaryId,
        //         match_type_id: commentaryData.matchTypeId,
        //         ball: decimalOverCount,
        //         run: commentaryBallByBall.ballRun,
        //         total_score: strikeTeam.teamScore,
        //         strike_team_id: strikeTeam.teamId,
        //         wicket: _wkt === true ? 1 : 0,
        //         total_wicket: strikeTeam.teamWicket,
        //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
        //           ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
        //           : null
        //       }
        //     },
        //     "/api/v1/predictscore",
        //     fastify,
        //     request
        //   )
        // }
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
            global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryBallByBall.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall;
          }
        }
        response.commentaryBallByBallDetails = commentaryBallByBall;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
      }
      // call Third Party API
      if (response.commentaryBallByBallDetails.ballType > 0) {
        try {
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          if (_bory == true) {
            let boundaryType;
            let ballRun = response.commentaryBallByBallDetails.ballRun;
            if (ballRun == 4) {
              boundaryType = ballRun;
            }
            if (ballRun == 6) {
              boundaryType = ballRun;
            }

            await notiConfigContentReplaceService(
              EventName.BOUNDARY,
              commentaryData.commentaryId,
              request,
              fastify,
              boundaryType
            );
            // let data = global.tblNotificationConfig.find((elem) =>
            //   elem.isActive === true && elem.eventName === EventName.BOUNDARY
            // )
            // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
            //   data.content = data.content.replace("{}", commentaryData.eventName);
            //   if(
            //     global?.clientSocketIo !== undefined &&
            //     global?.clientSocketIo.length > 0
            //   ){
            //     global.clientSocketIo.forEach((socket) => {
            //       socket.client.emit("notificationSend", data);
            //     });
            //     let notificationData = {
            //       title: commentaryData.eventName,
            //       description: data.content,
            //       commentaryId: commentaryData.commentaryId,
            //     }
            //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
            //   }
            // }
          }
          const isFDS = global.tblConfigs.find(
            (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
          ).value;
          if (isFDS && isFDS == "true") {
            if (_wkt || _bory) {
              callfds(
                {
                  Id: 0,
                  EventId: parseInt(commentaryData.eventRefId),
                  BWDateTime: "",
                  Type: _bory === true ? "2" : _wkt === true ? "1" : "",
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
          console.log(new Date(), "error in console:", error);
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
            global.tblCommentaryWicket[wicketIndex] =
              updatedData.commentaryWicketDetails;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryWicket.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] =
              updatedData.commentaryWicketDetails;
          }
        }
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        if (
          deleteCommentaryBallByBallId !=
          commentaryWicket.commentaryBallByBallId
        ) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryWicket",
            type: "update",
            data: response.commentaryWicketDetails,
          });
        }
      }
      await notiConfigContentReplaceService(
        EventName.WICKET,
        commentaryData.commentaryId,
        request,
        fastify,
        response.commentaryWicketDetails?.commentaryWicketId,
      );

      // let data = global.tblNotificationConfig.find((elem) =>
      //   elem.isActive === true && elem.eventName === EventName.WICKET
      // )
      // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
      //   data.content = data.content.replace("{}", commentaryData.eventName);
      //   if(
      //     global?.clientSocketIo !== undefined &&
      //     global?.clientSocketIo.length > 0
      //   ){
      //     global.clientSocketIo.forEach((socket) => {
      //       socket.client.emit("notificationSend", data);
      //     });
      //     let notificationData = {
      //       title: commentaryData.eventName,
      //       description: data.content,
      //       commentaryId: commentaryData.commentaryId,
      //     }
      //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      //   }
      // }
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        if(updatedData.commentaryPartnershipDetails){
          global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        }
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        if (!deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
             if(updatedData.commentaryPartnershipDetails){
                global.tblCommentaryPartnership[partnershipIndex] =
                updatedData.commentaryPartnershipDetails;
              }
            // global.tblCommentaryPartnership[partnershipIndex] =
            //   updatedData.commentaryPartnershipDetails;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryPartnership.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (partnershipIndex !== -1) {
            // global.tblCommentaryPartnership[partnershipIndex] =
            //   updatedData.commentaryPartnershipDetails;
              if(updatedData.commentaryPartnershipDetails){
                global.tblCommentaryPartnership[partnershipIndex] =
                updatedData.commentaryPartnershipDetails;
              }
          }
        }
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        if (
          deleteCommentaryBallByBallId !=
          commentaryPartnership.commentaryBallByBallId
        ) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPartnership",
            type: "update",
            data: response.commentaryPartnershipDetails,
          });
        }
      }
      // let boundary = response.commentaryPartnershipDetails.totalSix + response.commentaryPartnershipDetails.totalFour;
      // sendPartnership.push({
      //   partnership_no : response.commentaryPartnershipDetails.order,
      //   partnership_boundaries : boundary
      // })
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
        console.log(new Date(), "handle market closes services console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      if (isCallPredict == true) {
        let isNodePrediction = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICATIONFROMNODE)?.value || "false";
        if (isNodePrediction !== "true") {
          let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
          let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
          let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
          // let isVirtual = commentaryData.isVirtual || false;
          //_resFromPredictAPI = await
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
            request,
            pythonURI
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
      setLineRatioInComService(
        {
          commentaryId: commentaryDetails.commentaryId,
          matchTypeId: commentaryData.matchTypeId,
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
      const eventMarket = await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      if (eventMarket.length > 0) {
        // eventMarket.forEach((updatedItem) => {
        for (const updatedItem of eventMarket) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.marketId
          );
          if (index !== -1) {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        }
        // });
      }

      global.tblMarketRunnerV2
        .filter((elem) =>
          eventMarket.some((e) => e.marketId === elem.eventMarketId)
        )
        .forEach((elem) => {
          elem.selectionStatus = EventMarketStatus.Close;
        });

      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      if (isCallPredict == true) {
        callPredictorMarket(
          {
            commentary_id: commentaryDetails.commentaryId,
          },
          "/api/v1/endcommentary",
          fastify,
          request,
          pythonURI
        ).catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      let competition = global.tblCompetitions.find(
        (item) => item.competitionId === commentaryDetails.competitionId
      );
      await notiConfigContentReplaceService(
        EventName.EVENTCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );
      if (competition.isEventSnap == true) {
        setCompEventSnapSerice(
          [
            {
              commentaryId: commentaryDetails.commentaryId,
              eventRefId: commentaryDetails.eventRefId,
              competitionId: commentaryDetails.competitionId,
              eventTypeId: commentaryDetails.eventTypeId,
            },
          ],
          request,
          fastify
        ).catch((err) => {
          console.log("setCompEventSnapSerice console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setCompEventSnapSerice",
            request
          );
        });
      }
      if (
        competition.isPointTable == true &&
        commentaryDetails.isTest == false
      ) {
        setTeamPointService(
          [
            {
              commentaryId: commentaryDetails.commentaryId,
              competitionId: commentaryDetails.competitionId,
              team1Id: commentaryDetails.team1Id,
              team2Id: commentaryDetails.team2Id,
              winnerId: commentaryDetails.winnerId,
            },
          ],
          request,
          fastify
        ).catch((err) => {
          console.log("setTeamPointService console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/setTeamPointServicsyncCommentaryStatsWithAPIAndSocket - setTeamPointService",
            request
          );
        });
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
            commentaryId : commentaryData.commentaryId
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log(new Date(), "err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
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
    if (deleteCommentaryBallByBallId || deleteOverId) {
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(
        `score-${commentaryId}`
      );
      if (clientInRoom?.size) {
        global.socketIo.to(`score-${commentaryId}`).emit("undoCalled", {
          commentaryId: commentaryId,
          message: "Undo called for this commentary.",
        });
      }
    }
    if (isEndInnings && isEndInnings == true && isCallPredict == true) {
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
        request,
        pythonURI
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
    commentaryLogger(
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
        apiName: "/saveDetails",
        reqStartTime: startTime,
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
    // response.sendDataForSocketUpdate = sendDataForSocketUpdate
    return response;
  } catch (error) {
    console.log(new Date(), "console value 7418596", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket-error",
      request
    );
    try {
      await commentaryLogger(
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
          apiName: "/saveDetails",
          reqStartTime: startTime,
        },
        request,
        fastify
      )
    } catch (err) {
      console.log(new Date(), "commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
        request
      );
    }
    throw error;
  }
};

const addinMarketBallbyballOdds = async (commentaryId, objball, fastify) => {
  let _resultArray;
  try {
    // const filteredCid = global.tblEventMarkets.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);
    const filteredCid = global.tblEventMarketsV2.filter(
      (e) => e.commentaryId === commentaryId && e.rateSource === 2
    );
    global.sessionData.push({ type: "eventMarketData", data: filteredCid });
    if (filteredCid.length > 0 && objball.ballType > 0) {
      const _dataForOds = {};
      let data = [];
      for (let entry of filteredCid) {
        const _runners = global.tblMarketRunnerV2.filter(
          (item) => item.eventMarketId === entry.eventMarketId
        );
        global.sessionData.push({ type: "runnersData", data: _runners });
        for (let runner of _runners) {
          const mapKey = `${entry.eventMarketId}_${runner.selectionId}`;
          if (global.SignalRData[mapKey]) {
            const matchedItem = global.SignalRData[mapKey];

            const runnerData = {
              teamId: matchedItem.teamId,
              RunnerId: matchedItem.RunnerId,
              BackPrice: matchedItem.BackPrice,
              LayPrice: matchedItem.LayPrice,
              BackSize: matchedItem.BackSize,
              LaySize: matchedItem.LaySize,
              RunnerName: matchedItem.RunnerName,
              selectionId: matchedItem.selectionId,
              timestamp: matchedItem.timestamp,
            };
            data.push(runnerData);
          }
        }
        if (!_dataForOds[entry.eventMarketId]) {
          _dataForOds[entry.eventMarketId] = {
            commentaryId,
            commentaryBallByBallId: objball.commentaryBallByBallId,
            eventMarketId: entry.eventMarketId,
            marketStatus: entry.status,
            marketName: entry.marketName,
            data: [],
          };
        }
        let uniqueData = [];
        let _marketRunners = new Map();

        for (let obj of data) {
          let key = JSON.stringify(obj);
          if (!_marketRunners.has(key)) {
            _marketRunners.set(key, true);
            uniqueData.push(obj);
          }
        }
        _dataForOds[entry.eventMarketId].data.push(...uniqueData);
      }
      _resultArray = Object.values(_dataForOds);

      // Optionally stringify the Data array within each EventMarketId object
      _resultArray.forEach((obj) => {
        obj.data = JSON.stringify(obj.data);
      });
      let res;
      if (_resultArray.length > 0) {
        try {
          res = await createMarketOddsBallInSaveDetails(
            _resultArray[0],
            fastify,
            null
          );
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
      } else {
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

// const addinMarketBallbyballOdds = async (commentaryId, objball, fastify) => {
//   let _resultArray;
//   try {
//     // const filteredCid = global.tblEventMarkets.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);
//     const filteredCid = global.tblEventMarketsV2.filter((e) => e.commentaryId === commentaryId && e.rateSource === 2);

//     if (filteredCid.length > 0 && objball.ballType > 0) {
//       // Iterate over tblEventMarkets to build the final structure
//       const _dataForOds = filteredCid.reduce((acc, entry) => {
//         const mapKey = `${entry.eventMarketId}_${entry.selectionId}`;
//         // Check if the mapKey exists in SignalRData
//         if (global.SignalRData[mapKey]) {
//           const matchedItem = global.SignalRData[mapKey];

//           // Create the runner data structure
//           const runnerData = {
//             teamId: matchedItem.teamId,
//             RunnerId: matchedItem.RunnerId,
//             BackPrice: matchedItem.BackPrice,
//             LayPrice: matchedItem.LayPrice,
//             BackSize: matchedItem.BackSize,
//             LaySize: matchedItem.LaySize,
//             RunnerName: matchedItem.RunnerName,
//             selectionId: matchedItem.selectionId,
//             timestamp: matchedItem.timestamp
//           };

//           // Check if EventMarketId already exists in acc
//           if (!acc[entry.eventMarketId]) {
//             // Initialize a new object for this EventMarketId
//             acc[entry.eventMarketId] = {
//               commentaryId: commentaryId,
//               commentaryBallByBallId: objball.commentaryBallByBallId,
//               eventMarketId: entry.eventMarketId,
//               marketStatus: entry.status,
//               marketName: entry.marketName,
//               data: [] // Initialize Data array
//             };
//           }
//           acc[entry.eventMarketId].data.push(runnerData);
//         }

//         return acc;
//       }, {});

//       // Convert the result into an array if needed
//       _resultArray = Object.values(_dataForOds);

//       // Optionally stringify the Data array within each EventMarketId object
//       _resultArray.forEach(obj => {
//         obj.data = JSON.stringify(obj.data);
//       });
//       let res;
//       if (_resultArray.length > 0) {
//         try {
//           res = await createMarketOddsBallInSaveDetails(_resultArray[0], fastify, null);
//           global.tblMarketOddsBallByBall.push(res);
//         } catch (error) {
//           errorLogger(
//             fastify,
//             error.message,
//             "ERROR --> createMarketOddsBallInSaveDetails",
//             null
//           );
//         }
//         return res;
//       }
//       else {
//         return null;
//       }
//     }
//   } catch (error) {
//     errorLogger(
//       fastify,
//       error.message,
//       "ERROR --> services/commentary.js/addinMarketBallbyballOdds",
//       request
//     );
//     return null;
//   }
// };
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

  // get batting and bowling team
  let battingTeam = global.tblCommentaryTeams.find(
    (item) =>
      item?.commentaryId === commentary.commentaryId &&
      item.teamStatus === 1 &&
      item.currentInnings === commentary.currentInnings
  );
  let teamScore = (battingTeam?.teamScore || 0) + "/" + (battingTeam?.teamWicket || 0) + "(" + (battingTeam?.teamOver || 0.0) + ")";
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
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
    currBatting: battingTeam?.teamName || "",
    currBattingTeamScore: teamScore || "",
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
            playerBallFaced: curr.playerBallFaced,
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
  const { teamId, commentaryId, playerId, currentInnings } = request.body;
  let commentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const sendDataForSocketUpdate = {};

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
  // // insert the new player as per inning
  // // get total inning for this match
  // let matchType = global.tblMatchTypes.find(
  //   (item) => item.matchTypeId === commentary.matchTypeId
  // );

  // const totalInning = matchType?.noOfIningsPerSide;

  // for (let i = 0; i < totalInning; i++) {
  //   const currentInning = i + 1;
  //   await insertCommentaryPlayers(
  //     {
  //       commentaryId,
  //       teamId,
  //       playerId,
  //       displayOrder: maxDisplayOrder + 1,
  //       matchTypeId: commentary.matchTypeId,
  //     },
  //     currentInning,
  //     fastify,
  //     request
  //   );
  // }

  let matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === commentary.matchTypeId
  );

  const totalInning = matchType?.noOfIningsPerSide;
  if (currentInnings < 1 || currentInnings > totalInning) {
    throw new Error("Invalid Current Innings count");
  }

  const validatePlayer = global.tblCommentaryPlayers.filter(
    (item) => item?.commentaryId === commentaryId && item.teamId === teamId &&
      item.playerId == playerId && item.currentInnings == currentInnings
  );
  if (validatePlayer.length > 0) {
    throw new Error("Player already added in this commentary");
  }

  if(playerId == 0) {
    errorLogger(
      fastify,
      "playerId 0 error in addTeamPlayerService api",
      "ERROR --> services/commentary.js/addTeamPlayerService",
      request
    );
    return;
  }

  const playerTpId = global.tblPlayers.find(item => item.playerId === playerId);
  const playerData = await insertCommentaryPlayersQuery(
    {
      commentaryId,
      teamId,
      playerId,
      displayOrder: maxDisplayOrder + 1,
      matchTypeId: commentary.matchTypeId,
      currentInnings,
      tpId: playerTpId?.tpId
    },
    fastify,
    request
  );
  const teamPlayerData = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
    { playerId: playerId, teamId: teamId },
    fastify,
    request
  );
  if (teamPlayerData && teamPlayerData?.jerseyPlayerImage) {
    await updateCommentaryPlayerJerseyImageQuery(
      {
        commentaryPlayerId: playerData[0].commentaryPlayerId,
        jerseyPlayerImage: teamPlayerData?.jerseyPlayerImage,
        jerseyPlayerImagePath: teamPlayerData?.jerseyPlayerImagePath,
      },
      fastify
    );
  } else {
    const teamData = global.tblTeams.find((item) => item.teamId == teamId);
    const playerImgData = global.tblPlayers.find(
      (elem) => elem.playerId == playerId
    );
    if (playerImgData?.image && teamData?.jersey) {
      mergeAndSaveImage(
        {
          playerImage: playerImgData?.image,
          jersey: teamData?.jersey,
          playerName: playerImgData.playerName,
          teamName: teamData.teamName,
          commentaryPlayerId: playerData[0].commentaryPlayerId,
          teamPlayerId: teamPlayerData?.teamPlayerId ?? null,
          commentaryId: commentaryId,
        },
        fastify
      );
    }
  }

  const commPlayerData = await getAllCommentaryPlayerQueryById(
    {
      commentaryId: commentary.commentaryId,
      commentaryPlayerId: playerData[0].commentaryPlayerId,
    }, request, fastify
  )
  sendDataForSocketUpdate.commentaryId = commentary.commentaryId;
  sendDataForSocketUpdate.eventRefId = commentary.eventRefId;
  sendDataForSocketUpdate.dataToUpdate = [{
    module: "commentaryPlayers",
    type: "create",
    data: commPlayerData,
  }];
  
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
  }
  // global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryPlayers.push(commPlayerData);

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
  const { commentaryId, commentaryPlayerId } = request.body;
  let commentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const sendDataForSocketUpdate = {};

  // commentaryPlayerId validation
  if (commentaryPlayerId) {
    let index = global.tblCommentaryPlayers.findIndex(
      (item) => item?.commentaryPlayerId === commentaryPlayerId
    )
    if (index === -1) {
      throw new Error("Commentary Player with this id not Found");
    }
  }
  // validate teamId
  // let commentaryTeamIndex = global.tblCommentaryTeams.find(
  //   (item) => item?.commentaryId === commentaryId && item.teamId === teamId
  // );
  // if (commentaryTeamIndex === -1) {
  //   throw new Error("Team with this id not Found");
  // }
  // // validate playerId
  // let commentaryPlayerIndex = global.tblCommentaryPlayers.findIndex(
  //   (item) => item.playerId === playerId
  // );
  // if (commentaryPlayerIndex === -1) {
  //   throw new Error("Commentary Player with this id not Found");
  // }

  // delete the player from commentaryPlayer
  await deleteCommentaryPlayerById(
    {
      commentaryId,
      commentaryPlayerId: commentaryPlayerId,
    },
    request,
    fastify
  );

  global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
    (item) =>
      !(
        item?.commentaryId === commentaryId &&
        item?.commentaryPlayerId === commentaryPlayerId
      )
  );

  sendDataForSocketUpdate.commentaryId = commentaryId;
  sendDataForSocketUpdate.eventRefId = commentary.eventRefId;
  sendDataForSocketUpdate.dataToUpdate = [{
    module: "commentaryPlayers",
    type: "delete",
    data: { commentaryPlayerId },
  }];
  
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateFullscore", sendDataForSocketUpdate);
    });
  }

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
  const { playerDataArray, commentaryId, eventRefId } = request.body;
  const sendDataForSocketUpdate = {
    commentaryId: commentaryId,
    eventRefId : eventRefId
  };
  sendDataForSocketUpdate.dataToUpdate = [
    {
      module: "commentaryPlayers",
      type: "update",
      data: [],
    },
  ];
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
      playerBallFaced,
      currentInnings,
      bowlingType,
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
        playerBallFaced,
        currentInnings,
        bowlingType,
      },
      request,
      fastify
    );

    let player = global.tblCommentaryPlayers.find(
      (item) =>
        item?.commentaryId === +commentaryId &&
        item.teamId === +teamId &&
        item.playerId === +playerId &&
        item.currentInnings === currentInnings
    );
    const ds = global.tblPlayers.find((i) => i.playerId === +playerId);
    if (player) {
      player.batsmanStrikeRate = batsmanStrikeRate;
      player.batsmanAverage = batsmanAverage;
      player.isInPlayingEleven = isInPlayingEleven;
      player.boundary = boundary;
      player.playerBallFaced = playerBallFaced;
      player.bowlingType = bowlingType;
      player.displayName = ds?.displayName;
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
  const startTime = new Date();
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
          message: "Short Commentary saved successfully",
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) =>
              item?.commentaryId === request.body.commentaryDetails.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) =>
              item?.commentaryId === request.body.commentaryDetails.commentaryId
          ),
        },
        apiName: "/saveShortCommentary",
        reqStartTime: startTime,
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

// const updateCommentaryStatusService = async (request, fastify) => {
//   const { commentaryId, displayStatus, commentaryPlayerId } = request.body;

//   // Validate input
//   if (!commentaryId || displayStatus === undefined) {
//     throw new Error(
//       "Invalid input: commentaryId and displayStatus are required"
//     );
//   }

//   // Find the index of the commentary to update
//   const index = global.tblCommentaries.findIndex(
//     (item) => item?.commentaryId === commentaryId
//   );

//   // Check if the commentary exists
//   if (index === -1) {
//     throw new Error("Commentary with this id not found");
//   }
//   // let _resFromPredictAPI;
//   // let callPredictions = [];
//   // Prepare the commentary details for update
//   const commentaryDetails = {
//     commentaryId,
//     displayStatus,
//   };

//   // Update the commentary status in the database
//   await updateCommentaryStatusQuery(commentaryDetails, fastify, request);

//   // Update the commentary status in the global array
//   global.tblCommentaries[index] = {
//     ...global.tblCommentaries[index],
//     ...commentaryDetails,
//   };
//   if (global.tblCommentaries[index].isPredictMarket) {
//       callPredictorMarket(
//         {
//           commentary_id: commentaryId,
//           status: EventMarketStatus.Suspend,
//           match_type_id: global.tblCommentaries[index].matchTypeId,
//           is_open_market: false,
//           player_id : commentaryPlayerId || null
//         },
//         "/api/v1/updatemarketstatus",
//         fastify,
//         request
//       );
//       // let callPrediction = {};
//       // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
//       //   callPrediction.predictioncallSuccess = false;
//       //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
//       //   callPrediction.endPoint = '/api/v1/updatemarketstatus';
//       //   callPredictions.push(callPrediction);
//       //   callPrediction = {};
//       // }
//   }

//   if (
//     global?.clientSocketIo !== undefined &&
//     global?.clientSocketIo.length > 0
//   ) {
//     commentaryDetailsByEventIdService(
//       {
//         ...request,
//         body: {
//           eventId: global.tblCommentaries[index].eventRefId,
//         },
//       },
//       fastify,
//       "callFromSocket"
//     ).catch((err) => {
//       console.log("err in commentaryDetailsByEventIdService/updateCommentaryStatusService", err);
//       errorLogger(
//         fastify,
//         err.message,
//         "ERROR --> services/commentary.js/updateCommentaryStatusService",
//         request
//       );
//     });
//   }
//   commentaryDetails.callPredictions = [];
//   return {
//     name: "commentaryDetails",
//     value: commentaryDetails,
//   };
// };
const updateCommentaryStatusService = async (request, fastify) => {
  const { commentaryId, displayStatus, commentaryPlayerId } = request.body;

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
  const response = {};
  const sendDataForSocketUpdate = {};
  sendDataForSocketUpdate.commentaryId = commentaryId;
  sendDataForSocketUpdate.eventRefId = global.tblCommentaries[index]?.eventRefId ?? null;
  sendDataForSocketUpdate.dataToUpdate = [];

  // let _resFromPredictAPI;
  // let callPredictions = [];
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
  let pythonURI = global.tblCommentaries[index].pythonURI ?? null;
  if (global.tblCommentaries[index].isPredictMarket) {
    callPredictorMarket(
      {
        commentary_id: commentaryId,
        status: EventMarketStatus.Suspend,
        match_type_id: global.tblCommentaries[index].matchTypeId,
        is_open_market: false,
        player_id: commentaryPlayerId || null
      },
      "/api/v1/updatemarketstatus",
      fastify,
      request,
      pythonURI
    );
    // let callPrediction = {};
    // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
    //   callPrediction.predictioncallSuccess = false;
    //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
    //   callPrediction.endPoint = '/api/v1/updatemarketstatus';
    //   callPredictions.push(callPrediction);
    //   callPrediction = {};
    // }
  }
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    commentaryDetailsByEventIdService(
      {
        ...request,
        body: {
          eventId: global.tblCommentaries[index].eventRefId,
          commentaryId :global.tblCommentaries[index].commentaryId
        },
      },
      fastify,
      "callFromSocket"
    ).catch((err) => {
      console.log(
        "err in commentaryDetailsByEventIdService/updateCommentaryStatusService",
        err
      );
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateCommentaryStatusService",
        request
      );
    });
  }
  const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);

  response.commentaryDetails = {
    ...global.tblCommentaries[index],
    displayStatus,
    ...weatherAndPitchData,
  };
  sendDataForSocketUpdate.dataToUpdate.push({
    module: "commentaryDetails",
    type: "update",
    data: response.commentaryDetails,
  });

  global.clientSocketIo.forEach((socket) => {
    socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  });
  
  commentaryDetails.callPredictions = [];
  return {
    name: "commentaryDetails",
    value: commentaryDetails,
  };
};

const commentaryStatusService = async (request, fastify) => {
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

  const response = {};
  const sendDataForSocketUpdate = {};
  sendDataForSocketUpdate.commentaryId = commentaryId;
  sendDataForSocketUpdate.eventRefId = global.tblCommentaries[index]?.eventRefId ?? null;
  sendDataForSocketUpdate.dataToUpdate = [];

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
          commentaryId :global.tblCommentaries[index].commentaryId

        },
      },
      fastify,
      "callFromSocket"
    ).catch((err) => {
      console.log(
        "err in commentaryDetailsByEventIdService/updateCommentaryStatusService",
        err
      );
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateCommentaryStatusService",
        request
      );
    });
  }

  const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);

  response.commentaryDetails = {
    ...global.tblCommentaries[index],
    displayStatus,
    ...weatherAndPitchData,
  };
  sendDataForSocketUpdate.dataToUpdate.push({
    module: "commentaryDetails",
    type: "update",
    data: response.commentaryDetails,
  });

  global.clientSocketIo.forEach((socket) => {
    socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  });
  const cData = await getMatchDataByCId(
    {
      commentaryId: commentaryId,
    },
    request,
    fastify
  );

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: cData,
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/commentaryStatusService",
      request
    );
  });

  commentaryDetails.callPredictions = [];
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
  const startTime = new Date();
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
          message: "BallByBall deleted successfully",
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
        apiName: "/deleteBallByBall",
        reqStartTime: startTime,
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
        apiName: "/deleteBallByBall",
        reqStartTime: startTime,
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
  
  let result 
  if(request.body.commentaryId){
    result= await global.tblCommentaries.find(
    (item) =>
      item.commentaryId === request.body.commentaryId
    );
  }
  else if (request.body.eventId && request.body.eventId !== "") {
    result = global.tblCommentaries.find((item)=>
      item.eventRefId === request.body.eventId 
    )
  }

  // if (!result && request.body.status === undefined) {
  //   return null;
  // }
  // if (!result && request.body.status === 1) {
  //     throw new Error("Commentary with this id not found");
  // }
  if (!result && request.body?.eventId == "") {
    return null;
  }
  if (!result) {
    throw new Error("Commentary with this id not Found");
  }
  const currentInning = result.currentInnings;
  const resultArr = {
    cid: result.commentaryId,
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
    nt1im: "",
    nt1jr: "",
    nt2jr: "",
    nt2im: "",
    par: "",
    lawkt: "",
    rer: "",
    reb: "",
    crr: 0,
    rrr: 0,
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    winRmk: "",
    cardType: null,
    tossRmk: "",
    winNm: "",
    winId: 0,
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
    isvirt: result.isVirtual,
    ballDelay: result?.ballDelay,
    overDelay: result?.overDelay,
    inningDelay: result?.inningDelay,
    tossDelay: result?.tossDelay,
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
  let nt1im;
  let nt1jr;
  let nt2jr;
  let nt2im;
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
  let winRmk;
  let cardType;
  let tossRmk;
  let winNm;
  let winId;
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
  let cardKey;
  // Basic elements are set
  cid = result.commentaryId;
  // eid = result.eventRefId.toString();
  eid = result?.eventRefId != null ? result.eventRefId.toString() : null;
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
    t1sn = commentaryTeamsOne[0]?.shortName;
    t1n = commentaryTeamsOne[0]?.teamName;
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
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? "0";
    t1s = teamScore1 + "/" + wicket1 + " (" + overs1 + ")";
    tpp1 = parseInt(commentaryTeamsOne[0]?.teamPredictionPercentage) || 0;
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0]?.shortName;
    t2n = commentaryTeamsTwo[0]?.teamName;
    t2co = commentaryTeamsTwo[0]?.teamColor || "";
    t2bg = commentaryTeamsTwo[0]?.backgroundColor || "";

    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? "0";
    t2s = teamScore2 + "/" + wicket1 + " (" + overs1 + ")";
    tpp2 = parseInt(commentaryTeamsTwo[0]?.teamPredictionPercentage) || 0;
  }
  //teams Images are Ser
  const _teamsC1 = await global.tblTeams.filter(
    (item) => item.teamId === t1nid
  );
  
  t1im = _teamsC1[0]?.image;
  t1jr = _teamsC1[0]?.jersey;
  nt1im = _teamsC1[0]?.imagePath;
  nt1jr = _teamsC1[0]?.jerseyPath;
  const _teamsC2 = await global.tblTeams.filter(
    (item) => item.teamId === t2nid
  );

  t2im = _teamsC2[0]?.image;
  t2jr = _teamsC2[0]?.jersey;
  nt2im = _teamsC2[0]?.imagePath;
  nt2jr = _teamsC2[0]?.jerseyPath;
  if (getstatus == 1) {
    // Assign values to the resultArr object
    resultArr.cid = parseInt(result.commentaryId);
    // resultArr.eid = result.eventRefId.toString();
    resultArr.eid = result?.eventRefId != null ? result.eventRefId.toString() : null;
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
    resultArr.nt1im = nt1im;
    resultArr.nt1jr = nt1jr;
    resultArr.nt2jr = nt2jr;
    resultArr.nt2im = nt2im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = 0;
    resultArr.rrr = 0;
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.winRmk = "";
    resultArr.cardType = result.cardType;
    resultArr.tossRmk = "";
    resultArr.winNm = "";
    resultArr.winId = 0;
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
    resultArr.tsi = [];
    resultArr.ballDelay = result?.ballDelay;
    resultArr.overDelay = result?.overDelay;
    resultArr.inningDelay = result?.inningDelay;
    resultArr.tossDelay = result?.tossDelay;
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0]?.shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
      if (commentaryTeamsOne[0].teamStatus == 1) {
        resultArr.batid = commentaryTeamsOne[0].teamId;
        resultArr.ballid = commentaryTeamsTwo[0].teamId;
      }
    } else {
      tossteam = commentaryTeamsTwo[0]?.shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
      if (commentaryTeamsTwo[0].teamStatus == 1) {
        resultArr.batid = commentaryTeamsTwo[0].teamId;
        resultArr.ballid = commentaryTeamsOne[0].teamId;
      }
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.cid = parseInt(result.commentaryId);
    // resultArr.eid = result.eventRefId.toString();
    resultArr.eid = result?.eventRefId != null ? result.eventRefId.toString() : null;
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
    resultArr.nt1im = nt1im;
    resultArr.nt1jr = nt1jr;
    resultArr.nt2jr = nt2jr;
    resultArr.nt2im = nt2im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = 0;
    resultArr.rrr = 0;
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.winRmk = "";
    resultArr.cardType = result.cardType;
    resultArr.tossRmk = "";
    resultArr.winNm = "";
    resultArr.winId = 0;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.tsi = [];
    resultArr.ballDelay = result?.ballDelay;
    resultArr.overDelay = result?.overDelay;
    resultArr.inningDelay = result?.inningDelay;
    resultArr.tossDelay = result?.tossDelay;
  }
  if (getstatus >= 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0]?.shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0]?.shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? "0";
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? "0";
      crr = parseFloat(commentaryTeamsOne[0]?.crr) || 0;
      rrr = parseFloat(commentaryTeamsOne[0]?.rrr) || 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? "0";
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? "0";
      crr = parseFloat(commentaryTeamsTwo[0]?.crr) || 0;
      rrr = parseFloat(commentaryTeamsTwo[0]?.rrr) || 0;
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
      _playerWiktRun = commentaryPartnership?.playerRun ?? "0";
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? "0";
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? "0";
    let _partBall = commentaryPartnership?.totalBalls ?? "0";
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.cid = parseInt(result.commentaryId);
    // resultArr.eid = result.eventRefId.toString();
    resultArr.eid = result?.eventRefId != null ? result.eventRefId.toString() : null;
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
    resultArr.nt1im = nt1im;
    resultArr.nt1jr = nt1jr;
    resultArr.nt2jr = nt2jr;
    resultArr.nt2im = nt2im;
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
    resultArr.winRmk = result.winRmk || "";
    resultArr.cardType = result.cardType;
    resultArr.tossRmk = result.tossRmk || "";
    resultArr.winNm = result?.winnerName || "";
    resultArr.winId = result?.winnerId || 0;
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
    resultArr.tsi = [];
    resultArr.ballDelay = result?.ballDelay;
    resultArr.overDelay = result?.overDelay;
    resultArr.inningDelay = result?.inningDelay;
    resultArr.tossDelay = result?.tossDelay;

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
        let t1Score = t1?.teamScore ?? "0";
        let t2Score = t2?.teamScore ?? "0";
        let t1Wicket = t1?.teamWicket ?? 0;
        let t2Wicket = t2?.teamWicket ?? 0;
        let t1Over = t1?.teamOver ?? 0.0;
        let t2Over = t2?.teamOver ?? 0.0;
        resultArr.tsi.push({
          t1s: t1Score + "/" + t1Wicket + " (" + t1Over + ")",
          t2s: t2Score + "/" + t2Wicket + " (" + t2Over + ")",
          inning: i,
        });
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
  resultArr.eti = parseInt(eventType?.refId) || "";
  resultArr.tpp1 = tpp1;
  resultArr.tpp2 = tpp2;
  resultArr.isPr =
    result.isPredictMarket === null ? false : result.isPredictMarket;

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
      trun: player.batRun || "0",
      tball: player.batBall || "0",
      t4: player.batFour || "0",
      t6: player.batSix || "0",
      sr: player.batSrr || "0",
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || "0",
      isp: playerData?.isSystemPlayer,
      jrsyplyimg: player?.jerseyPlayerImage || "",
      jrsyplyimgpath: player?.jerseyPlayerImagePath || "",
      batsn: playerData?.displayName || "",
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
      tov: bowler.bowlerOver || "0",
      cob: bowler.bowlerCurrentBall || "0",
      trun: bowler.bowlerRun || "0",
      t4: bowler.bowlerFour || "0",
      t6: bowler.bowlerSix || "0",
      twr: bowler.bowlerWideBallRun || "0",
      twb: bowler.bowlerWideBall || "0",
      tnr: bowler.bowlerNoBallRun || "0",
      tnb: bowler.bowlerNoBall || "0",
      mov: bowler.bowlerMaidenOver || "0",
      twik: bowler.bowlerTotalWicket || "0",
      eco: parseFloat(bowler.bowlerEconomy) || "0",
      dob: bowler.bowlerDotBall || "0",
      exr:
        bowler.bowlerWideBallRun ||
        0 + bowler.bowlerNoBallRun ||
        0 + bowler.bowlerByeBallRun ||
        0 + bowler.bowlerLegByeBallRun ||
        0,
      isp: playerData?.isSystemPlayer,
      jrsyplyimg: bowler?.jerseyPlayerImage || "",
      jrsyplyimgpath: bowler?.jerseyPlayerImagePath || "",
      psn: playerData?.displayName || "",
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
    run: ball.ballRun || "0",
    nbr: ball.ballExtraRun || "0",
    wbr: ball.ballWideBallRun || "0",
    byr: ball.ballByeBallRun || "0",
    lbr: ball.ballLegByeBallRun || "0",
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || "0",
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
    cd: ball.createdDate,
    shrty: ball.shortType,
    cardKey: ball.cardKey,
    cardType: ball.cardType,
  }));
  if (cbb.length > 0) {
    const latestCBB = cbb[cbb.length - 1];
    resultArr.cardKey = latestCBB.cardKey;
  } else {
    resultArr.cardKey = null;
  }
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

  const weatherAndPitchData = await weatherAndPitchDataService(result.commentaryId);

  const allDetails = {
    cm: {
      ...resultArr,
      ci: result.currentInnings,
      cctime: result.commentaryCloseTime,
      res: result.result,
      isvirtual: result.isVirtual,
      cid : result.commentaryId,
      eventNo: result?.eventNo,
      ...weatherAndPitchData,
    },
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
    crr: 0,
    rrr: 0,
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    winRmk: "",
    cardType: result.cardType,
    tossRmk: "",
    winNm: "",
    winId: 0,
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
  let winRmk;
  let cardType = result.cardType;
  let tossRmk;
  let winNm;
  let winId;
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
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? "0";
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    tpp1 = parseInt(commentaryTeamsOne[0]?.teamPredictionPercentage) || 0;
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
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? "0";
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    tpp2 = parseInt(commentaryTeamsTwo[0]?.teamPredictionPercentage) || 0;
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
    resultArr.crr = 0;
    resultArr.rrr = 0;
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.winRmk = "";
    resultArr.cardType = result.cardType;
    resultArr.tossRmk = "";
    resultArr.winNm = "";
    resultArr.winId = 0;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.ballDelay = result.ballDelay;
    resultArr.overDelay = result.overDelay;
    resultArr.inningDelay = result.inningDelay;
    resultArr.tossDelay = result.tossDelay;
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
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
    resultArr.crr = 0;
    resultArr.rrr = 0;
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.winRmk = "";
    resultArr.cardType = result.cardType;
    resultArr.winNm = "";
    resultArr.winId = 0;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.ballDelay = result.ballDelay;
    resultArr.overDelay = result.overDelay;
    resultArr.inningDelay = result.inningDelay;
    resultArr.tossDelay = result.tossDelay;
  }
  if (getstatus >= 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
    } else {
      tossteam = commentaryTeamsTwo[0].shortName;
      tossType = result.choseTo === 1 ? " opt to bat" : " opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? "0";
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? "0";
      crr = parseFloat(commentaryTeamsOne[0]?.crr) || 0;
      rrr = parseFloat(commentaryTeamsOne[0]?.rrr) || 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? "0";
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? "0";
      crr = parseFloat(commentaryTeamsTwo[0]?.crr) || 0;
      rrr = parseFloat(commentaryTeamsTwo[0]?.rrr) || 0;
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
      _playerWiktRun = commentaryPartnership?.playerRun ?? "0";
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? "0";
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    let _partRuns = commentaryPartnership?.totalRuns ?? "0";
    let _partBall = commentaryPartnership?.totalBalls ?? "0";
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
    resultArr.winRmk = result.winRmk || "";
    resultArr.cardType = result.cardType;
    resultArr.tossRmk = result.tossRmk || "";
    resultArr.winNm = result?.winnerName || "";
    resultArr.winId = result?.winnerId || 0;
    resultArr.win = "";
    resultArr.cst = result.commentaryStatus;
    resultArr.ics = result.isClientShow;
    resultArr.iact = result.isActive;
    resultArr.t1co = t1co;
    resultArr.t1bg = t1bg;
    resultArr.t2co = t2co;
    resultArr.t2bg = t2bg;
    resultArr.utc = utc;
    resultArr.ballDelay = result.ballDelay;
    resultArr.overDelay = result.overDelay;
    resultArr.inningDelay = result.inningDelay;
    resultArr.tossDelay = result.tossDelay;
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
      bati: playerData?.image,
      trun: player.batRun || "0",
      tball: player.batBall || "0",
      t4: player.batFour || "0",
      t6: player.batSix || "0",
      sr: player.batSrr || "0",
      os: player.onStrike,
      str: parseFloat(player.batsmanStrikeRate) || "0",
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
      bli: playerData?.image,
      tov: bowler.bowlerOver || "0",
      cob: bowler.bowlerCurrentBall || "0",
      trun: bowler.bowlerRun || "0",
      t4: bowler.bowlerFour || "0",
      t6: bowler.bowlerSix || "0",
      twr: bowler.bowlerWideBallRun || "0",
      twb: bowler.bowlerWideBall || "0",
      tnr: bowler.bowlerNoBallRun || "0",
      tnb: bowler.bowlerNoBall || "0",
      mov: bowler.bowlerMaidenOver || "0",
      twik: bowler.bowlerTotalWicket || "0",
      eco: parseFloat(bowler.bowlerEconomy) || "0",
      dob: bowler.bowlerDotBall || "0",
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
    run: ball.ballRun || "0",
    nbr: ball.ballExtraRun || "0",
    wbr: ball.ballWideBallRun || "0",
    byr: ball.ballByeBallRun || "0",
    lbr: ball.ballLegByeBallRun || "0",
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || "0",
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
    cd: ball.createdDate,
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

  const teamMaxOver = validateMatchType?.maxOversInFirstInings;
  const currentInning = global.tblCommentaries[index]?.currentInnings

  await updateteamMaxOverQuery({teamMaxOver, commentaryId,
    //  currentInnings: currentInning
    },
    fastify, request
  );
  for (const elem of global.tblCommentaryTeams) {
    if (elem.commentaryId === commentaryId 
      // && elem.currentInnings == currentInning
    ) {
      elem.teamMaxOver = teamMaxOver;
    }
  }

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
  const startTime = new Date();
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
    const batTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == commentary.commentaryId 
      && i.currentInnings ==currentInnings && i.teamStatus == 1)

    const latestOver = global.tblOvers.find((i)=> i.overId == overId)
    const pythonURI = commentary?.pythonURI
    const comP = global.tblCommentaryPlayers.find((i)=>i.commentaryPlayerId == bowlerId)
    callPredictorMarket(
        {
          commentary_id: commentary.commentaryId,
          over_type_id: latestOver?.overType || null,
          over_id: latestOver?.overId || null,
          team_id: latestOver?.teamId || null,
          bowler_id: bowlerId,
          wicket: batTeam?.teamWicket || 0,
          bowling_style : comP?.bowlingType || 0,
          ball_by_ball_id : 0
        },
      "/api/v1/changebowler",
      fastify,
      request,
      pythonURI
    )
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
        apiName: "/changeBowler",
        reqStartTime: startTime,
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
        apiName: "/changeBowler",
        reqStartTime: startTime,
      },
      request,
      fastify
    ).catch((err) => {
      console.log(
        "commentary logger console chageBowlerOfCommentaryService",
        err
      );
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
      teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
      teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    }

    if (commentaryTeamsTwo) {
      t2sn = commentaryTeamsTwo?.shortName;
      t2n = commentaryTeamsTwo?.teamName;
      const wicket1 =
        commentaryTeamsTwo.teamWicket === null
          ? 0
          : commentaryTeamsTwo.teamWicket;
      const overs1 =
        commentaryTeamsTwo.teamOver === null
          ? 0.0
          : commentaryTeamsTwo.teamOver;
      teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
      teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    }
    // get image of team
    const team1 = await global.tblTeams.find(
      (team) => team.teamId === item.team1Id
    );
    const team2 = await global.tblTeams.find(
      (team) => team.teamId === item.team2Id
    );

    if (body.type == "scheduled" || body.type == "completed") {
      crr = 0;
      rrr = 0;
    } else {
      if (commentaryTeamsOne?.teamStatus == 1) {
        crr = parseFloat(commentaryTeamsOne?.crr);
        rrr = parseFloat(commentaryTeamsOne?.rrr);
        batid = commentaryTeamsOne.teamId;
        ballid = commentaryTeamsTwo.teamId;
      } else {
        crr = parseFloat(commentaryTeamsOne?.crr);
        rrr = parseFloat(commentaryTeamsOne?.rrr);
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
    
    const weatherAndPitchData = await weatherAndPitchDataService(item.commentaryId);

    let details = {
      rno: rno,
      cid: item.commentaryId,
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
      te1n: commentaryTeamsOne?.teamName || "",
      te2n: commentaryTeamsTwo?.teamName || "",
      s1n: commentaryTeamsOne?.shortName || "",
      s2n: commentaryTeamsTwo?.shortName || "",
      te1i: team1?.image || "",
      te2i: team2?.image || "",
      t1jr: team1?.jersey || "",
      t2jr: team2?.jersey || "",
      loc: item.location || "",
      isrun: isRun,
      t1s: teamScore1 || "",
      t2s: teamScore2 || "",
      dis: item.displayStatus || "",
      rmk: item.rmk === null || item.rmk === undefined ? "" : item.rmk,
      winRmk:
        item.winRmk === null || item.winRmk === undefined ? "" : item.winRmk,
      cardType:
        item.cardType === null || item.cardType === undefined
          ? ""
          : item.cardType,
      tossRmk:
        item.tossRmk === null || item.tossRmk === undefined ? "" : item.tossRmk,
      winNm:
        item.winnerName === null || item.winnerName === undefined
          ? ""
          : item.winnerName,
      winId:
        item.winnerId === null || item.winnerId === undefined
          ? 0
          : item.winnerId,
      // rmk: item.rmk || "",
      te1crr: parseFloat(commentaryTeamsOne?.crr) || 0,
      te2crr: parseFloat(commentaryTeamsTwo?.crr) || 0,
      te1rrr: parseFloat(commentaryTeamsOne?.rrr) || 0,
      te2rrr: parseFloat(commentaryTeamsTwo?.rrr) || 0,
      crr: crr || 0,
      rrr: rrr || 0,
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
      isTest: item?.isTest,
      isActive: item?.isActive,
      nte1i: team1?.imagePath || "",
      nt1jr: team1?.jerseyPath || "",
      nte2i: team2?.imagePath || "",
      nt2jr: team2?.jerseyPath || "",
      etyId: eventType?.eventTypeId,
      ballDelay: item?.ballDelay || 0,
      overDelay: item?.overDelay || 0,
      inningDelay: item?.inningDelay || 0,
      tossDelay: item?.tossDelay || 0,
      eventNo: item?.eventNo || "",
      ...weatherAndPitchData,
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
          const wicket1 = t1.teamWicket === null ? 0 : t1.teamWicket;
          const overs1 = t1.teamOver === null ? 0.0 : t1.teamOver;
          teamScore1 = t1?.teamScore ?? "0";
          teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
        }
        if (t2) {
          const wicket1 = t2.teamWicket === null ? 0 : t2.teamWicket;
          const overs1 = t2.teamOver === null ? 0.0 : t2.teamOver;
          teamScore2 = t2?.teamScore ?? "0";
          teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
        }
        details.tsi.push({
          t1s: teamScore1,
          t2s: teamScore2,
          inning: i,
        });
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
  if (status != 4 && status != 1 && status != 10) {
    type = "live";
  } else if (status == 4 || status == 10) {
    type = "completed";
  } else if (status == 1) {
    type = "scheduled";
  }
  const isRun = type == "scheduled" || "completed" ? false : true;
  let crr, rrr, batid, ballid;
  let eventType = await global.tblEventTypes.find(
    (e) => e.eventTypeId == com.eventTypeId
  );
  let competition = await global.tblCompetitions.find(
    (c) => c.competitionId == com.competitionId
  );
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
  let teamScore1, teamScore2, t1bg, t1co, t2bg, t2co;
  if (commentaryTeamsOne) {
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
    t1bg = commentaryTeamsOne.backgroundColor || "";
    t1co = commentaryTeamsOne.teamColor || "";
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    t2bg = commentaryTeamsTwo.backgroundColor || "";
    t2co = commentaryTeamsTwo.teamColor || "";
  }
  const team1 = await global.tblTeams.find(
    (team) => team.teamId == com.team1Id
  );
  const team2 = await global.tblTeams.find(
    (team) => team.teamId == com.team2Id
  );
  if (type == "scheduled") {
    crr = 0;
    rrr = 0;
  } else {
    if (commentaryTeamsOne.teamStatus == 1) {
      crr = parseFloat(commentaryTeamsOne.crr);
      rrr = parseFloat(commentaryTeamsTwo.rrr);
      batid = commentaryTeamsOne.teamId;
      ballid = commentaryTeamsTwo.teamId;
    } else {
      crr = parseFloat(commentaryTeamsTwo.crr);
      rrr = parseFloat(commentaryTeamsTwo.rrr);
      batid = commentaryTeamsTwo.teamId;
      ballid = commentaryTeamsOne.teamId;
    }
  }
  const TossTeamName = await global.tblCommentaryTeams.find(
    (t) =>
      t.commentaryId == com.commentaryId &&
      t.teamId == com.tossWonBy &&
      t.currentInnings == com.currentInnings
  );
  let toss = "";
  if (com.choseTo) {
    toss = com.choseTo == 1 ? "BAT" : "BOWL";
  }
  const weatherAndPitchData = await weatherAndPitchDataService(com.commentaryId);
  let comDetails = {
    rno: rno,
    cid : com.commentaryId,
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
    te1n: commentaryTeamsOne?.teamName || "",
    te2n: commentaryTeamsTwo?.teamName || "",
    s1n: commentaryTeamsOne?.shortName || "",
    s2n: commentaryTeamsTwo?.shortName || "",
    te1i: team1?.image || "",
    te2i: team2?.image || "",
    t1jr: team1?.jersey || "",
    t2jr: team2?.jersey || "",
    nte1i: team1?.imagePath || "",
    nt1jr: team1?.jerseyPath || "",
    nte2i: team2?.imagePath || "",
    nt2jr: team2?.jerseyPath || "",
    loc: com.location || "",
    isrun: isRun,
    t1s: teamScore1 || "",
    t2s: teamScore2 || "",
    dis: com.displayStatus || "",
    rmk: com.rmk || "",
    winRmk: com.winRmk || "",
    cardType: com.cardType,
    tossRmk: com.tossRmk || "",
    winNm: com?.winnerName || "",
    winId: com?.winnerId || 0,
    te1crr: parseFloat(commentaryTeamsOne.crr) || 0,
    te2crr: parseFloat(commentaryTeamsTwo.crr) || 0,
    te1rrr: parseFloat(commentaryTeamsOne.rrr) || 0,
    te2rrr: parseFloat(commentaryTeamsTwo.rrr) || 0,
    crr: crr || 0,
    rrr: rrr || 0,
    cst: com.commentaryStatus,
    res: com.result || "",
    type,
    batid: batid || null,
    ballid: ballid || null,
    t1id: com.team1Id || null,
    t2id: com.team2Id || null,
    t1bg: t1bg || "",
    t1co: t1co || "",
    t2bg: t2bg || "",
    t2co: t2co || "",
    compId: competition?.competitionId || 0,
    isPr: com.isPredictMarket,
    ics: com.isClientShow,
    isTest: com.isTest,
    isActive: com.isActive,
    etyId: eventType?.eventTypeId,
    eventNo: com?.eventNo,
    ...weatherAndPitchData,
  };
  return comDetails;
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
    const { eventId, commentaryId } = request.body;
    const commentary = global.tblCommentaries.find(
      (item) =>
        item.commentaryId === commentaryId || item.eventRefId === eventId
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
        tim1: team1?.image,
        tim2: team2?.image,
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
      teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
      teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
      teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
    }

    let crr, rrr, BattingTeamId, BowlingTeamId, batId, bowlId;
    if (commentaryTeamsOne.teamStatus == 1) {
      crr = parseFloat(commentaryTeamsOne.crr);
      rrr = parseFloat(commentaryTeamsOne.rrr);
      BattingTeamId = commentaryTeamsOne.commentaryTeamId;
      BowlingTeamId = commentaryTeamsTwo.commentaryTeamId;
      batId = commentaryTeamsOne.teamId;
      bowlId = commentaryTeamsTwo.teamId;
    } else {
      crr = parseFloat(commentaryTeamsTwo.crr);
      rrr = parseFloat(commentaryTeamsTwo.rrr);
      BattingTeamId = commentaryTeamsTwo.commentaryTeamId;
      BowlingTeamId = commentaryTeamsOne.commentaryTeamId;
      batId = commentaryTeamsTwo.teamId;
      bowlId = commentaryTeamsOne.teamId;
    }
    let es = {
      cid: commentary.commentaryId || 0,
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
      te1i: team1?.image || "",
      te2i: team2?.image || "",
      t1jr: team1?.jersey || "",
      t2jr: team2?.jersey || "",
      loc: commentary.location || "",
      t1s: teamScore1 || "",
      t2s: teamScore2 || "",
      dis: commentary.displayStatus || "",
      rmk: commentary.rmk || "",
      winRmk: commentary.winRmk || "",
      cardType: commentary.cardType,
      tossRmk: commentary.tossRmk || "",
      winNm: commentary?.winnerName || "",
      winId: commentary?.winnerId || 0,
      te1crr: parseFloat(commentaryTeamsOne.crr) || 0,
      te2crr: parseFloat(commentaryTeamsTwo.crr) || 0,
      te1rrr: parseFloat(commentaryTeamsOne.rrr) || 0,
      te2rrr: parseFloat(commentaryTeamsTwo.rrr) || 0,
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
      utc: commentary.eventDate,
    };

    dataToreturn.es = es;

    const commentaryTeam = await global.tblCommentaryTeams
      .filter((item) => item?.commentaryId === commentary.commentaryId)
      .map((item) => {
        let tJer, timg;
        if (item.teamId === team1.teamId) {
          tJer = team1?.jersey;
          timg = team1?.image;
        }
        if (item.teamId === team2.teamId) {
          tJer = team2?.jersey;
          timg = team2?.image;
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
            pl1i: player1Info?.image,
            runs: totalRuns,
            ball: totalBalls,
            pl2n: batter2Name,
            pl2i: player2Info?.image,
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
      four: player.batFour || "0",
      six: player.batSix || "0",
      dot: player.batDotBall || "0",
      sr: player.batsmanStrikeRate || "0",
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
      ovr: player.bowlerOver || "0",
      mov: player.bowlerMaidenOver || "0",
      trun: player.bowlerRun || "0",
      four: player.bowlerFour || "0",
      six: player.bowlerSix || "0",
      wkt: player.bowlerTotalWicket || "0",
      wid: player.bowlerWideBallRun
        ? `${player.bowlerWideBall}/${player.bowlerWideBallRun}`
        : "0/0",
      nob: player.bowlerNoBallRun
        ? `${player.bowlerNoBall}/${player.bowlerNoBallRun}`
        : "0/0",
      dot: player.bowlerDotBall || "0",
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
      cd: player.createdDate,
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
      four: player.batFour || "0",
      six: player.batSix || "0",
      dot: player.batDotBall || "0",
      sr: player.batsmanStrikeRate || "0",
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
      ovr: player.bowlerOver || "0",
      mov: player.bowlerMaidenOver || "0",
      trun: player.bowlerRun || "0",
      four: player.bowlerFour || "0",
      six: player.bowlerSix || "0",
      wkt: player.bowlerTotalWicket || "0",
      wid: `${player.bowlerWideBall}/${player.bowlerWideBallRun}` || "0/0",
      nob: `${player.bowlerNoBall}/${player.bowlerNoBallRun}` || "0/0",
      dot: player.bowlerDotBall || "0",
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
      cd: player.createdDate,
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

const getTeamListByEventTypeService = async (request, fastify) => {
  const { eventTypeId, competitionId } = request.body;
  // get encypted eventTypeId from global
  // if (eventTypeId === undefined) {
  //   return global.tblTeams;
  // } else if (eventTypeId == 0) {
  //   return global.tblTeams;
  // } else if (eventTypeId) {
  //   let encyptEventTypeId = global.tblEventTypes.find(
  //     (item) => item.pId === eventTypeId
  //   );
  //   const result = global.tblTeams.filter(
  //     (item) => item.eventTypeId === encyptEventTypeId
  //   );
  //   return result;
  // }
  let teams = global.tblTeams;
  if (eventTypeId === undefined || eventTypeId == 0) {
    teams = global.tblTeams;
  }
  if (eventTypeId && eventTypeId != 0) {
    teams = global.tblTeams.filter((item) => item.eventTypeId === eventTypeId);
  }
  let compTeam = [];
  if (competitionId && competitionId != 0) {
    // teams = global.tblTeams.filter((item) => item.competitionId === competitionId);
    let competitionResult = await getAllTournamentTeamPointsQuery(fastify);
    competitionResult = competitionResult.filter(
      (item) => item.competitionId === competitionId
    );
    const competitionTeamIds = new Set(
      competitionResult.map((item) => item.teamId)
    );
    compTeam = teams.filter((item) => competitionTeamIds.has(item.teamId));
  }
  if (compTeam.length === 0) {
    return teams;
  }
  return compTeam;

  // return teams;
};
const getCommenrtySquadDetailsService = async (request, fastify) => {
  const { eventId, commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId || item.commentaryId === commentaryId
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let crr, rrr;
  if (commentaryTeamsOne.teamStatus == 1) {
    crr = parseFloat(commentaryTeamsOne.crr);
    rrr = parseFloat(commentaryTeamsOne.rrr);
  } else {
    crr = parseFloat(commentaryTeamsTwo.crr);
    rrr = parseFloat(commentaryTeamsTwo.rrr);
  }

  let es = {
    cid: commentary.commentaryId || 0,
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
    te1i: team1?.image || "",
    te2i: team2?.image || "",
    t1jr: team1?.jersey || "",
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
  const { eventId, commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId || item.commentaryId === commentaryId
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let es = {
    cid: commentary.commentaryId || 0,
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
    te1i: team1?.image || "",
    te2i: team2?.image || "",
    t1jr: team1?.jersey || "",
    t2jr: team2?.jersey || "",
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
        pl1i: player1Info?.image,
        runs: totalRuns,
        ball: totalBalls,
        pl2n: batter2Name,
        pl2i: player2Info?.image,
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
    teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
    teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }

  let crr, rrr;
  if (commentaryTeamsOne.teamStatus == 1) {
    crr = parseFloat(commentaryTeamsOne.crr);
    rrr = parseFloat(commentaryTeamsOne.rrr);
  } else {
    crr = parseFloat(commentaryTeamsTwo.crr);
    rrr = parseFloat(commentaryTeamsTwo.rrr);
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
    te1i: team1?.image || "",
    te2i: team2?.image || "",
    t1jr: team1?.jersey || "",
    t2jr: team2?.jersey || "",
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
  const commentaryPlayers = global.tblCommentaryPlayers.filter(
    (item) => item.commentaryId == request.body.commentaryId
  );
  // update showClient
  if (commentaryPlayers.length == 0) {
    await updateShowClientQuery(
      {
        isClientShow: false,
        commentaryId: request.body.commentaryId,
      },
      request,
      fastify
    );
    global.tblCommentaries[commentary].isClientShow = false;
  } else {
    await updateShowClientQuery(request.body, request, fastify);
    global.tblCommentaries[commentary].isClientShow = request.body.isClientShow;
  }

  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    const socketData = {
      commentaryId: request.body.commentaryId,
      isClientShow: global.tblCommentaries[commentary].isClientShow,
      isActive: global.tblCommentaries[commentary]?.isActive
    };
    
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateActionType", socketData);
    });
  }

    // if (global.tblCommentaries[commentary].isClientShow) {
    const cData = await getMatchDataByCId(
      {
        commentaryId: request.body.commentaryId,
      },
      request,
      fastify
    );

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: {
          ...cData,
          isClientShow: request.body.isClientShow,
          type: "isClientShow",
        },
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

    commActionLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          message: "Commentary Updated successfully",
        },
        apiName: "/admin/commentary/updateShowClient",
      },
      request,
      fastify
    ).catch((err) => {
      console.log("isClientshow commActionLogger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeShowClientService - commActionLogger",
        request
      );
    });
  // }

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
          tim1: team1?.image,
          tim2: team2?.image,
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
        teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
        teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
      }

      let crr, rrr, BattingTeamId, BowlingTeamId;
      if (commentaryTeamsOne.teamStatus == 1) {
        crr = parseFloat(commentaryTeamsOne.crr);
        rrr = parseFloat(commentaryTeamsOne.rrr);
        BattingTeamId = commentaryTeamsOne.teamId;
        BowlingTeamId = commentaryTeamsTwo.teamId;
      } else {
        crr = parseFloat(commentaryTeamsTwo.crr);
        rrr = parseFloat(commentaryTeamsTwo.rrr);
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
        teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
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
        te1n: commentaryTeamsOne?.teamName || "",
        te2n: commentaryTeamsTwo?.teamName || "",
        s1n: commentaryTeamsOne?.shortName || "",
        s2n: commentaryTeamsTwo?.shortName || "",
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
    isPredictMarket !== global.tblCommentaries[index].isPredictMarket &&
    (global.tblCommentaries[index].eventRefId != null ||
      global.tblCommentaries[index].eventId != null)
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

  if (
    global.tblCommentaries[index].isVirtual === false &&
    (global.tblCommentaries[index].eventRefId == null)
  ) {
    await updateisPredictMarketInCommentaryQuery(
      {
        isPredictMarket: false,
        commentaryId: request.body.commentaryId,
      },
      fastify,
      request
    );
  } else {
    await updateisPredictMarketInCommentaryQuery(
      request.body,
      fastify,
      request
    );
  }

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  if (global.tblCommentaries[index].isPredictMarket == true) {
    callDataProvider(
      {
        commentaryId: commentaryId,
        serviceType: ServiceType.dataProviderAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
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
  } else {
    let market = await getMarketsByComIdQuery(
      {
        commentaryId: commentaryId,
      },
      request,
      fastify
    );
    if (market.marketCount == 0) {
      callDataProvider(
        {
          commentaryId: [commentaryId],
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "delete",
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

  global.tblCommentaries[index] = {
    ...global.tblCommentaries[index],
    ...request.body,
  };

  if (
    global.tblCommentaries[index].isActive &&
    global.tblCommentaries[index].isTest == false
  ) {
    let cData = await getMatchDataByCId(
      {
        commentaryId: commentaryId,
      },
      request,
      fastify
    );

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData,
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
        lr: commentary.lineRatio,
      },
    };
    return dataToreturn;
  } catch (error) {
    //throw new Error(error);
  }
};
const saveCommentaryDetailsAPIService = async (request, fastify) => {
  // validate commentary id
  const startTime = new Date();
  try {
    const {
      commentaryDetails,
      commentaryPlayers,
      commentaryTeams,
      commentaryOvers,
      commentaryBallByBall,
      commentaryWickets,
      commentaryPartnership,
      password
    } = request.body;

    let pass = global.tblConfigs.find((i)=>i.key == configConstants.SUPDATEPASS)?.value || null
    if(!pass){
      throw new Error("Password not found in config")
    }
    if(pass != password){
      throw new Error("Invalid password")
    }
    // call the sp to save the commentary details
    const res = await saveCommentaryDetailsAPIQuery(request.body, fastify, request);
    // console.log("saveCommentaryDetailsAPIQuery response", res);

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
    if (res && res.commentaryBallByBallDetails?.length > 0) {
      for (let ball of res.commentaryBallByBallDetails) {
        let ballIndex = global.tblCommentaryBallByBall.findIndex(
          (item) => item.commentaryBallByBallId === ball.commentaryBallByBallId
        );
        if (ballIndex === -1) {
          global.tblCommentaryBallByBall.push(ball);
        } else {
          global.tblCommentaryBallByBall[ballIndex] = ball;
        }
      }
    }

    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          message: "Commentary Updated successfully",
        },
        global: null,
        extra: null,
        apiName: "/saveCommentaryDetails",
        reqStartTime: startTime,
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
    });

    return "Commentary Updated successfully";
  } catch (error) {
    commentaryLogger(
      {
        commentaryId: request.body.commentaryId,
        requestBody: request.body,
        response: {
          error: error.message,
        },
        global: null,
        extra: null,
        apiName: "/saveCommentaryDetails",
        reqStartTime: startTime,
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
    });
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

  let cData = await getMatchDataByCId(
    {
      commentaryId: request.body.commentaryId,
    },
    request,
    fastify
  );
  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        isActive: request.body.isActive,
        type: "activeInactive",
      },
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
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    const socketData = {
      commentaryId: request.body.commentaryId,
      isClientShow: global.tblCommentaries[commentary].isClientShow,
      isActive: global.tblCommentaries[commentary].isActive
    };
    
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateActionType", socketData);
    });
  }
  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Updated successfully",
      },
      apiName: "/admin/commentary/activeInactiveCommentary",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("acitve commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/activeInactiveCommentaryService - commActionLogger",
      request
    );
  });
  return "Commentary Updated successfully";
};
const closeCommentaryService = async (request, fastify) => {
  await closeCommentaryQuery(request.body, fastify, request);
  let _resFromPredictAPI;
  let callPredictions = [];

  let setEventSnap = [];
  let teamPoint = [];
  // update the global variable
  for (let commentaryId of request.body.commentaryId) {
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );
    if (index !== -1) {
      global.tblCommentaries[index].commentaryStatus = 4;

      const eventMarket = await closeEventMarketByCIdQuery(
        { commentaryId },
        fastify
      );
      if (eventMarket.length > 0) {
        // eventMarket.forEach((updatedItem) => {
        for (const updatedItem of eventMarket) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.marketId
          );
          if (index !== -1) {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        }
        // });
      }

      global.tblMarketRunnerV2
        .filter((elem) =>
          eventMarket.some((e) => e.marketId === elem.eventMarketId)
        )
        .forEach((elem) => {
          elem.selectionStatus = EventMarketStatus.Close;
        });

      let pythonURI = global.tblCommentaries[index].pythonURI ?? null;
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request,
        pythonURI
      );
      let callPrediction = {};
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.Cid = commentaryId;
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = "/api/v1/endcommentary";
        callPredictions.push(callPrediction);
      }
      _resFromPredictAPI = null;
      callDataProvider(
        {
          commentaryId: commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "close",
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
      const cData = await getMatchDataByCId(
        {
          commentaryId: commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
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
        (item) =>
          item.competitionId === global.tblCommentaries[index].competitionId
      );
      if (comp.isEventSnap == true) {
        setEventSnap.push({
          commentaryId: commentaryId,
          eventRefId: global.tblCommentaries[index].eventRefId,
          competitionId: global.tblCommentaries[index].competitionId,
          eventTypeId: global.tblCommentaries[index].eventTypeId,
        });
      }
      if (
        comp.isPointTable == true &&
        global.tblCommentaries[index]?.isTest == false
      ) {
        teamPoint.push({
          commentaryId: commentaryId,
          competitionId: global.tblCommentaries[index].competitionId,
          team1Id: global.tblCommentaries[index].team1Id,
          team2Id: global.tblCommentaries[index].team2Id,
          winnerId: global.tblCommentaries[index].winnerId,
        });
      }

      const tipsData = global.tblTips
        .filter(
          (item) =>
            item.commentaryId === global.tblCommentaries[index].competitionId ||
            item.eventRefId === global.tblCommentaries[index].eventRefId
        )
        .map((elem) => elem.id);
      if (tipsData.length > 0) {
        global.tblTips = global.tblTips.filter(
          (item) => !tipsData.includes(item.id)
        );
        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.updateSeoModule,
            data: {
              module: "tips",
              type: "delete",
              data: {
                id: tipsData,
              },
            },
          },
          request,
          fastify
        ).catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "services/commentary.js/syncCommentaryStatsWithAPIAndSocket - callClientAPI",
            request
          );
        });
      }
    }
    if (setEventSnap.length > 0) {
      setCompEventSnapSerice(setEventSnap, request, fastify).catch((err) => {
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
      setTeamPointService(teamPoint, request, fastify).catch((err) => {
        console.log("setTeamPointService console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/closeCommentaryService - setTeamPointService",
          request
        );
      });
    }
    // if (
    //   global.tblCommentaries[index] &&
    //   global.tblCommentaries[index]?.isTest == false
    // ) {
    //   setPlayerHistoryService(
    //     {
    //       commentaryId: request.body.commentaryId,
    //     },
    //     request,
    //     fastify
    //   ).catch((err) => {
    //     console.log("setPlayerHistoryService console", err);
    //     errorLogger(
    //       fastify,
    //       err.message,
    //       "ERROR --> services/commentary.js/closeCommentaryService - setPlayerHistoryService",
    //       request
    //     );
    //   });
    // }
  }

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
  global.tblEventMarketsV2 = [];
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
      competitionId : com.competitionId,
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
    let key1 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTBALLFACED
    );
    let key2 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES
    );
    let key3 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTPLAYERRUNS
    );
    let pythonURI = updatedData.pythonURI ?? null;
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
      request,
      pythonURI
    );
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = "/api/v1/loadcommentary";
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = "Prediction call successful";
      callPrediction.endPoint = "/api/v1/loadcommentary";
    }
  }
  commActionLogger(
    {
      commentaryId: commentaryId,
      requestBody: request.body,
      response: updatedData,
      apiName: "/admin/commentary/changeDelay",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("changeDelay commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/updateDelayInCommentaryService - commActionLogger",
      request
    );
  });
  updatedData.callPrediction = callPrediction;
  return updatedData;
};

const getShortCommertyService = async (request, fastify) => {
  const { eventId, commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId && item.commentaryId == commentaryId
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
        teamScore1 = commentaryTeamsOne?.teamScore ?? "0";
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
        teamScore2 = commentaryTeamsTwo?.teamScore ?? "0";
        teamScore2 = teamScore2 + "/" + wicket1 + " (" + overs1 + ")";
      }
      let es = {
        eti: parseInt(eventType.refId) || "",
        cid: commentary.commentaryId || 0,
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
  const startTime = new Date();
  try {
     let pass = global.tblConfigs.find((i)=>i.key == configConstants.SUPDATEPASS)?.value || null
    if(!pass){
      throw new Error("Password not found in config")
    }
    if(pass != request.body.password){
      throw new Error("Invalid password")
    }
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
        apiName: "/deleteComentaryDetails",
        reqStartTime: startTime,
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
        apiName: "/deleteComentaryDetails",
        reqStartTime: startTime,
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
  if(eventRefId) {
    const commentary = global.tblCommentaries.find(
      (item) => item.eventRefId === eventRefId.trim() &&
      item.commentaryId !== commentaryId
    );
    if (commentary) {
      throw new Error("EventRefId should be unique");
    }
  }
  // const commentary = global.tblCommentaries.find(
  //   (item) => item.eventRefId === eventRefId.trim()
  // );
  // if (commentary) {
  //   throw new Error("EventRefId should be unique");
  // }

  await updateEventRefIdInCommentaryQuery(request.body, fastify, request);

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  let _resFromPredictAPI;
  let callPrediction = {};
  if (updatedData.isPredictMarket == true) {
    let key1 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTBALLFACED
    );
    let key2 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES
    );
    let key3 = global.tblConfigs.find(
      (item) => item.key === configConstants.DEFAULTPLAYERRUNS
    );
    let pythonURI = updatedData.pythonURI ?? null;
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
      request,
      pythonURI
    );
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = "/api/v1/loadcommentary";
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = "Prediction call successful";
      callPrediction.endPoint = "/api/v1/loadcommentary";
    }
  }

  let cData = await getMatchDataByCId(
    {
      commentaryId: updatedData.commentaryId,
    },
    request,
    fastify
  );
  
  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        type: "update",
      },
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/updateEventRefIdInCommentaryService",
      request
    );
  });

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
    let pythonURI = commentary.pythonURI ?? null;
    let _resFromPredictAPI;
    let callPrediction = {};
    if (
      commentary.isPredictMarket == true &&
      (commentary.commentaryStatus == 2 ||
        commentary.commentaryStatus == 3 ||
        commentary.commentaryStatus == 5)
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
      let isNodePrediction = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICATIONFROMNODE)?.value || "false";
      if (isNodePrediction == "true") {
        const data = await generateMarketAndRunners({
          commentary: commentary,
          commentaryId: commentary.commentaryId,
          matchTypeId: commentary.matchTypeId,
          default_ball_faced: parseInt(key1?.value) || 0,
          default_player_boundaries: parseInt(key2?.value) || 0,
          default_player_runs: parseInt(key3?.value) || 0,
        }, request, fastify)
        console.log({ data })
      } else {
        callPredictorMarket(
          {
            commentary_id: commentary.commentaryId,
            match_type_id: commentary.matchTypeId,
            event_id: commentary.eventRefId,
            // line_ratio_data: eventMarketLine,
            default_ball_faced: parseInt(key1?.value) || 0,
            default_player_boundaries: parseInt(key2?.value) || 0,
            default_player_runs: parseInt(key3?.value) || 0,
          },
          "/api/v1/loadcommentary",
          fastify,
          request,
          pythonURI
        );
      }
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/loadcommentary';
      // } else {
      //   callPrediction.predictioncallSuccess = true;
      //   callPrediction.predictionMessage = 'Prediction call successful';
      //   callPrediction.endPoint = '/api/v1/loadcommentary';
      // }
      // }
    }
    // call the prediction module
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

const upDLSDetailsService = async (request, fastify) => {
  // validate commentary id
  const { commentaryId, comTeams } = request.body;
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  for (let t of comTeams) {
    let index = global.tblCommentaryTeams.findIndex(
      (item) => item.commentaryTeamId === t.commentaryTeamId
    );
    if (index == -1) {
      throw new Error("Commentary Team with this id not Found");
    }
    await upOverDLSQuery(
      {
        commentaryTeamId: t.commentaryTeamId,
        teamMaxOver: t.teamMaxOver,
        teamTrialRuns: t.teamTrialRuns,
      },
      fastify,
      request
    );
    global.tblCommentaryTeams[index].teamMaxOver = t.teamMaxOver;
    global.tblCommentaryTeams[index].teamTrialRuns = t.teamTrialRuns;
  }

  await handleMarketByDLSService(
    {
      commentaryId: request.body.commentaryId,
      inningsId: global.tblCommentaries[commentary].currentInnings,
      teamId: comTeams.map((item) => item.teamId),
    },
    request,
    fastify
  );
  return "Commentary Updated successfully";
};
const AddSuperOverCommentaryService = async (request, fastify) => {
  const startTime = new Date();
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
      (item) =>
        item?.commentaryId == commentaryId &&
        item.currentInnings === commentary.currentInnings
    );

    if (!commentaryTeams) {
      throw new Error("Commenrty Teams with this commentaryId not Found");
    }
    request.body.competitionId = commentary?.competitionId;
    const team1GroupId = await getGroupId(commentary.team1Id, request, fastify);
    const team2GroupId = await getGroupId(commentary.team2Id, request, fastify);
    let Teamdata = {};
    Teamdata.commentaryId = commentaryId;
    Teamdata.teamMaxOver = teamMaxOver || 1;
    for (let team of commentaryTeams) {
      if (team.teamId == commentary.team1Id) {
        Teamdata.team1Id = team.teamId;
        Teamdata.team1Captain = team.teamCaptain;
        Teamdata.team1Kipper = team.teamKipper;
        Teamdata.team1GroupId = team1GroupId;
      }
      if (team.teamId == commentary.team2Id) {
        Teamdata.team2Id = team.teamId;
        Teamdata.team2Captain = team.teamCaptain;
        Teamdata.team2Kipper = team.teamKipper;
        Teamdata.team2GroupId = team2GroupId;
      }
    }
    const commentaryTeam1Players = global.tblCommentaryPlayers.filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.teamId === commentary.team1Id &&
        item.currentInnings === commentary.currentInnings
    );

    const commentaryTeam2Players = global.tblCommentaryPlayers.filter(
      (item) =>
        item?.commentaryId === commentaryId &&
        item.teamId === commentary.team2Id &&
        item.currentInnings === commentary.currentInnings
    );

    if (
      !commentaryTeam1Players &&
      commentaryTeam1Players.length > 0 &&
      !commentaryTeam2Players &&
      commentaryTeam2Players.length > 0
    ) {
      throw new Error(
        "Commenrty Teams Players with this commentaryId not Found"
      );
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
        await updateSuperOverCommentaryQuery(
          { commentaryId: commentary.commentaryId, currentInnings: _cin },
          fastify
        );
        Teamdata.currentInnings = _cin;
        await insertCommentarySuperOverTeams(
          { body: { data: Teamdata } },
          fastify
        );
      } catch (error) {
        //throw new Error(error);
      }
      try {
        await updateCommentaryBattingTeamQuery(
          {
            commentaryId: commentary.commentaryId,
            currentInnings: _cin,
            battingTeamId: battingTeamId,
          },
          fastify
        );
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

    const updatedData = await getCommentaryByIdQuery(
      { body: { commentaryId: commentary.commentaryId } },
      fastify
    );
    global.tblCommentaries[index] = updatedData;
    global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
    global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

    const result = await commentaryDetailsByIdService(
      { body: { commentaryId: commentary.commentaryId } },
      fastify
    );
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
        reqStartTime: startTime,
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
    return result;
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
        reqStartTime: startTime,
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

  commActionLogger(
    {
      commentaryId: commentaryId,
      requestBody: request.body,
      response: updatedData,
      apiName: "/admin/commentary/updateTeamPrediction",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("team predict commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/updateTeamPredictionService - commActionLogger",
      request
    );
  });

  return updatedData;
};

const updateLineRationService = async (request, fastify) => {
  const startTime = new Date();
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
        reqStartTime: startTime,
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
        apiName: "/updateLineRation",
        reqStartTime: startTime,
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
  let marketType = global.tblMarketTypes.find(
    (item) => item.marketTypeId == MarketTypeId.Fancy
  );
  if (!marketType) {
    throw new Error("Market Type Fancy not found");
  }
  let marketTypeCategory = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() == "session"
  );
  if (!marketTypeCategory) {
    throw new Error("Market Type Category not found");
  }

  let result = await updateLineRatioComQuery(
    {
      commentaryId: commentaryId,
      marketTypeId: marketType.marketTypeId,
      marketTypeCategoryId: marketTypeCategory.marketTypeCategoryId,
      maxOver: matchType.maxOversInFirstInings,
      sumOfRunPerBall: matchType.sumOfRunPerBall,
      status: [
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    },
    request,
    fastify
  );

  let lineRatio = result[0].line_ratio;

  let commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId == commentaryId
  );
  // console.log("lineRatio",global.tblCommentaries[commentary].lineRatio);
  if (commentary !== -1 && lineRatio != null) {
    global.tblCommentaries[commentary].lineRatio = lineRatio;
  }
  return true;
};

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
const getTemplateByComIdService = async (request, fastify) => {
  let com = global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (!com) {
    throw new Error("Commentary with this id not Found");
  }
  // const result = await getTemplateByComIdQuery(
  //   {
  //     commentaryId: request.body.commentaryId,
  //     matchTypeId: com.historyMatchTypeId,
  //   },
  //   request,
  //   fastify
  // );
  const result = await getMatchTypeTemplateByComIdQuery(
    {
      commentaryId: request.body.commentaryId,
      matchTypeId: com.historyMatchTypeId,
    },
    request,
    fastify
  );
  return result;
};
const saveComTemplatesService = async (request, fastify) => {
  const { saveTemplates, dltTemplate } = request.body;
  await saveComTemplateQuery({ saveTemplates, dltTemplate }, request, fastify);
  return "Commentary Template saved successfully";
};
const revertCommentaryService = async (request, fastify) => {
  const startTime = new Date();
  const { commentaryId, password } = request.body;
  let pass = global.tblConfigs.find(
    (item) => item.key === configConstants.REVERTCOMPASS
  );
  if (pass && pass.value != password) {
    throw new Error("Invalid Password.");
  }
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  // let checkMar = await getMarCountByComQuery(
  //   { commentaryId },
  //   request,
  //   fastify
  // );
  // if (checkMar.marketCount > 0) {
  //   throw new Error(
  //     "Cannot revert the commentary as markets are already created"
  //   );
  // }
  const sendDataForSocketUpdate = {};
  sendDataForSocketUpdate.commentaryId = commentaryId;
  sendDataForSocketUpdate.dataToUpdate = [];

  let res = await revertCommentaryQuery(request.body, fastify, request);

  if (res) {
    global.tblCommentaries[index].displayStatus = "Toss Pending!!";
    global.tblCommentaries[index].commentaryStatus = 1;
    global.tblCommentaries[index].target = null;
    global.tblCommentaries[index].winnerId = null;
    global.tblCommentaries[index].winnerName = null;
    global.tblCommentaries[index].tossWonBy = null;
    global.tblCommentaries[index].choseTo = null;
    global.tblCommentaries[index].rmk = false;
    global.tblCommentaries[index].winRmk = null;
    global.tblCommentaries[index].tossRmk = null;
    global.tblCommentaries[index].updateTime = new Date();
    global.tblCommentaries[index].tpId = null;
    global.tblCommentaries[index].commentaryResult = null;
    global.tblCommentaries[index].commentaryCloseTime = null;
    global.tblCommentaries[index].currentInnings = 1;

    sendDataForSocketUpdate.eventRefId = global.tblCommentaries[index]?.eventRefId;
    sendDataForSocketUpdate.dataToUpdate.push({
      module: "commentaryDetails",
      type: "update",
      data: global.tblCommentaries[index],
    });

    const ct = global.tblCommentaryTeams.filter(
      (item) => item?.commentaryId === commentaryId
    );
    const cp = global.tblCommentaryPlayers.filter(
      (item) => item?.commentaryId === commentaryId
    );
    if (ct.length > 0) {
      let comTeams = []
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
          comTeams.push(updatedData)
        }
      }
      if (comTeams.length > 0) {
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryTeams",
          type: "update",
          data: comTeams.map((team) => ({
            ...team,
            crr: parseFloat(team?.crr) || 0,
            rrr: parseFloat(team?.rrr) || 0,
          })),
        });
      }
    }
    if (cp.length > 0) {
      // update the global variable
      let commPlayer = []
      for (let player of cp) {
        let playerIndex = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        if (playerIndex !== -1) {
          let updatedData = res.commentary_player_data.find(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId
          );
          global.tblCommentaryPlayers[playerIndex] = updatedData;
          commPlayer.push(updatedData)
        }
      }
      if (commPlayer.length > 0) {
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPlayers",
          type: "update",
          data: commPlayer,
        });
      }
    }
  }

  const deleteOvers = global.tblOvers
    .filter(item => item?.commentaryId === commentaryId)
    .map(item => item?.overId);

  if (deleteOvers && deleteOvers.length > 0) {
    sendDataForSocketUpdate.dataToUpdate.push({
      module: "deleteOverIds",
      data: { overId: deleteOvers },
    });
  }

  const deleteWickets = global.tblCommentaryWicket
    .filter(item => item?.commentaryId === commentaryId)
    .map(item => item?.commentaryWicketId);

  if (deleteWickets && deleteWickets.length > 0) {
    sendDataForSocketUpdate.dataToUpdate.push({
      module: "deleteWicketIds",
      data: { commentaryWicketId: deleteWickets },
    });
  }

  const deletePartnerships = global.tblCommentaryPartnership
    .filter(item => item?.commentaryId === commentaryId)
    .map(item => item?.commentaryPartnershipId);

  if (deletePartnerships && deletePartnerships.length > 0) {
    sendDataForSocketUpdate.dataToUpdate.push({
      module: "deletePartnershipIds",
      data: { commentaryPartnershipId: deletePartnerships },
    });
  }

  const deleteCommBallByBalls = global.tblCommentaryBallByBall
    .filter(item => item?.commentaryId === commentaryId)
    .map(item => item?.commentaryBallByBallId);

  if (deleteCommBallByBalls && deleteCommBallByBalls.length > 0) {
    sendDataForSocketUpdate.dataToUpdate.push({
      module: "deleteCommentaryBallByBallIds",
      data: { commentaryBallByBallId: deleteCommBallByBalls },
    });
  }

  // remvoe over for this commentary
  global.tblOvers = global.tblOvers.filter(
    (item) => item?.commentaryId !== commentaryId
  );
  // remove ball by ball for this commentary
  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => item?.commentaryId !== commentaryId
  );
  // remove partnership for this commentary
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
    (item) => item?.commentaryId !== commentaryId
  );
  // remove wicket for this commentary
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
    (item) => item?.commentaryId !== commentaryId
  );

  global.clientSocketIo.forEach((socket) => {
    socket.client.emit("updateFullscore", sendDataForSocketUpdate);
  });

  commentaryLogger(
    {
      commentaryId: commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary reverted successfully",
      },
      global: null,
      extra: null,
      apiName: "/revertCommentary",
      reqStartTime: startTime,
    },
    request,
    fastify
  );

  return "Commentary reverted successfully";
};

const getGlobalDataService = async (request, fastify) => {
  return true;
  const result = {
    commentaries: global.tblCommentaries,
    commentaryTeams: global.tblCommentaryTeams,
    commentaryPlayers: global.tblCommentaryPlayers,
    commentaryBallByBall: global.tblCommentaryBallByBall,
    overs: global.tblOvers,
    commentaryWickets: global.tblCommentaryWicket,
    commentaryPartnership: global.tblCommentaryPartnership,
  };
  const fileName = `globalData_${Date.now()}.json`;
  const filePath = path.resolve(__dirname, `../public/${fileName}`);

  const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });
  // Start the JSON array and object
  writeStream.write('{ "data": [\n');
  let first = true;
  // Chunk the data (example: process 100 items at a time)
  for (let i = 0; i < result.commentaries.length; i += 100) {
    const chunk = {
      commentaries: result.commentaries.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.commentaryTeams.length; i += 100) {
    const chunk = {
      // commentaries: result.commentaries.slice(i, i + 100),
      commentaryTeams: result.commentaryTeams.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.commentaryPlayers.length; i += 100) {
    const chunk = {
      commentaryPlayers: result.commentaryPlayers.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.commentaryBallByBall.length; i += 100) {
    const chunk = {
      commentaryBallByBall: result.commentaryBallByBall.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.overs.length; i += 100) {
    const chunk = {
      overs: result.overs.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.commentaryWickets.length; i += 100) {
    const chunk = {
      commentaryWickets: result.commentaryWickets.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }
    first = false;
    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }
  for (let i = 0; i < result.commentaryPartnership.length; i += 100) {
    const chunk = {
      commentaryPartnership: result.commentaryPartnership.slice(i, i + 100),
    };
    if (!first) {
      writeStream.write(",\n");
    }

    writeStream.write(JSON.stringify(chunk, null, 2)); // Write each chunk
  }

  // End the JSON array and object
  writeStream.write("\n] }\n");
  // Handle stream completion and errors
  writeStream.on("finish", () => {
    return { success: true, message: "Data saved successfully" };
  });
  writeStream.on("error", (err) => {
    errorLogger(fastify, err.message, "/globalData", request);
    return { success: false, message: "Error saving data" };
  });
  // Close the stream when done
  writeStream.end();
};

const getCommentaryBallByBallService = async (request, fastify) => {
  const { commentaryBallByBallId } = request.body;

  const Data_DBcomBB = await getCommentaryBallByBallByIdsQuery(
    commentaryBallByBallId,
    request,
    fastify
  );
  const Data_GLComBB = global.tblCommentaryBallByBall.filter((item) =>
    commentaryBallByBallId.includes(item.commentaryBallByBallId)
  );

  return {
    Data_DBcomBB,
    Data_GLComBB,
  };
};

const saveWagonWheelPositionService = async (request, fastify) => {
  const validateId = global.tblCommentaryBallByBall.find(
    (item) =>
      item.commentaryBallByBallId === request.body.commentaryBallByBallId
  );
  if (!validateId) {
    throw new Error("Ballbyball with this id not Found");
  }

  const wagonWheel = await insertWagonWheelPositionQuery(
    request.body,
    request,
    fastify
  );
  const index = global.tblCommentaryBallByBall.findIndex(
    (item) =>
      item.commentaryBallByBallId === request.body.commentaryBallByBallId
  );
  if (index !== -1) {
    global.tblCommentaryBallByBall[index] = {
      ...global.tblCommentaryBallByBall[index],
      x2: wagonWheel[0].x2,
      y2: wagonWheel[0].y2,
      shortType: wagonWheel[0].shortType,
      commentryRemark: wagonWheel[0].commentryRemark,
    };
  }
  return wagonWheel[0];
};

const updateShotTypeService = async (request, fastify) => {
  const { commentaryId, shotType } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await updateShotTypeQuery(request.body, request, fastify);
  global.tblCommentaries[index].shotType = shotType;
  let msg =
    shotType == true
      ? "Shot Type enabled successfully."
      : "Shot Type disabled successfully.";
  return msg;
};
const updateIsWheelShowService = async (request, fastify) => {
  const { commentaryId, isWheelShow } = request.body;
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await updateIsWheelShowQuery(request.body, request, fastify);
  global.tblCommentaries[index].isWheelShow = isWheelShow;
  let msg =
    isWheelShow == true
      ? "Tracking Ball enabled successfully."
      : "Tracking Ball disabled successfully.";
  return msg;
};

// const getTeamAndPlayerListServiceV1 = async (request, fastify) => {
//   // get commentary details
//   let commentaryDetails = await global.tblCommentaries.find(
//     (item) => item?.commentaryId === request.body.commentaryId
//   );
//   if (!commentaryDetails) {
//     throw new Error("Commentary with this id not Found");
//   }
//   // get unique team id from commentary teams
//   const arrOfTeamId = [];
//   let commentaryTeams = await global.tblCommentaryTeams
//     .filter((item) => item?.commentaryId === request.body.commentaryId)
//     .reduce((acc, curr) => {
//       const teamData = {
//         teamId: curr?.teamId,
//         teamName: curr?.teamName,
//         shortName: curr?.shortName,
//         currentInnings: curr?.currentInnings,
//       };
//       arrOfTeamId.push(teamData);
//       acc.push({
//         teamId: curr?.teamId,
//         teamName: curr?.teamName,
//         shortName: curr?.shortName,
//         currentInnings: curr?.currentInnings,
//       });
//       return acc;
//     }, []);

//   let totalInnings = arrOfTeamId.length / 2;
//   commentaryDetails.totalInnings = totalInnings;

//   let teamMap = {};
//   for (team of arrOfTeamId) {
//     // let commentaryTeamPlayers = await global.tblCommentaryPlayers
//     //   .filter(
//     //     (item) =>
//     //       item?.commentaryId === request.body.commentaryId &&
//     //       item.teamId === team.teamId &&
//     //       item.currentInnings === team.currentInnings
//     //   )
//     //   .reduce((acc, curr) => {
//     //     acc.push({
//     //       teamId: curr.teamId,
//     //       playerId: curr.playerId,
//     //       playerName: curr.playerName,
//     //       batsmanAverage: curr.batsmanAverage,
//     //       batsmanStrikeRate: curr.batsmanStrikeRate,
//     //       commentaryPlayerId: curr.commentaryPlayerId,
//     //       isInPlayingEleven: curr.isInPlayingEleven,
//     //       boundary: curr.boundary,
//     //       playerBallFaced: curr.playerBallFaced,
//     //       currentInnings: curr.currentInnings,
//     //       playerTypeId: curr.playerTypeId,
//     //       playerType: curr.playerType,
//     //     });
//     //     return acc;
//     //   }, []);

//     let commentaryTeamPlayers = await Promise.all(
//       global.tblCommentaryPlayers
//         .filter(
//           (item) =>
//             item?.commentaryId === request.body.commentaryId &&
//             item.teamId === team.teamId &&
//             item.currentInnings === team.currentInnings
//         )
//         .map(async (curr) => {
//           const playerAvg = await getPlayersBattingHistoryByIdQuery(
//             {
//               playerId: curr.playerId,
//               matchTypeId: commentaryDetails.matchTypeId,
//             },
//             fastify,
//             request
//           );

//           return {
//             teamId: curr.teamId,
//             playerId: curr.playerId,
//             playerName: curr.playerName,
//             batsmanAverage: isNaN(Number(curr.batsmanAverage))
//               ? 0
//               : parseFloat(Number(curr.batsmanAverage).toFixed(1)),
//             batsmanStrikeRate: isNaN(Number(curr.batsmanStrikeRate))
//               ? 0
//               : parseFloat(Number(curr.batsmanStrikeRate).toFixed(1)),
//             commentaryPlayerId: curr.commentaryPlayerId,
//             isInPlayingEleven: curr.isInPlayingEleven,
//             boundary:
//               curr.boundary == 0 || curr.boundary == null
//                 ? playerAvg.length > 0
//                   ? parseFloat(
//                     (
//                       (playerAvg[0].countOf4 + playerAvg[0].countOf6) /
//                       playerAvg[0].inningsCount
//                     ).toFixed(1)
//                   ) || 0
//                   : 0
//                 : curr.boundary,
//             playerBallFaced:
//               curr.playerBallFaced === 0 || curr.playerBallFaced == null
//                 ? playerAvg.length > 0
//                   ? parseFloat(
//                     (
//                       playerAvg[0].ballsFacedCount / playerAvg[0].inningsCount
//                     ).toFixed(1)
//                   ) || 0
//                   : 0
//                 : curr.playerBallFaced,
//             currentInnings: curr.currentInnings,
//             playerTypeId: curr.playerTypeId,
//             playerType: curr.playerType,
//           };
//         })
//     );
//     // remove the systemPlayers from commentaryTeamPlayers
//     const systemPlayer = global.tblPlayers
//       .filter((item) => item.isSystemPlayer === true)
//       .map((item) => item.playerId);
//     commentaryTeamPlayers = commentaryTeamPlayers.filter(
//       (item) => !systemPlayer.includes(item.playerId)
//     );

//     if (!teamMap[team.teamId]) {
//       const players = await getAllPlayersByTeamIdAndMatchTypeIdQuery(
//       { matchTypeId: commentaryDetails.matchTypeId, teamId: team.teamId },
//       fastify,
//       request
//     );
//     teamMap[team.teamId] = {
//       teamId: team.teamId,
//       teamName: team?.teamName || null,
//       shortName: team?.shortName || null,
//       commentaryTeamPlayers: {},
//       teamPlayers: players,
//     };
//   } else {
//     teamMap[team.teamId].teamName =
//       team.teamName || teamMap[team.teamId].teamName;
//     teamMap[team.teamId].shortName =
//       team.shortName || teamMap[team.teamId].shortName;
//   }

//     // if (!teamMap[team.teamId]) {
//     //   teamMap[team.teamId] = {
//     //     teamId: team.teamId,
//     //     // teamName: team?.teamName || teamMap[team.teamId]?.teamName,
//     //     // shortName: team.shortName || teamMap[team.teamId]?.shortName,
//     //     teamName: team?.teamName || null,
//     //     shortName: team.shortName || null,
//     //     commentaryTeamPlayers: {},
//     //     teamPlayers: await getAllPlayersByTeamIdAndMatchTypeIdQuery(
//     //       { matchTypeId: commentaryDetails.matchTypeId, teamId: team.teamId },
//     //       fastify,
//     //       request
//     //     ),
//     //   };
//     // }

//     // // Update teamName and shortName if already initialized
//     // teamMap[team.teamId].teamName =
//     //   team.teamName || teamMap[team.teamId].teamName;
//     // teamMap[team.teamId].shortName =
//     //   team.shortName || teamMap[team.teamId].shortName;

//     // Add players under respective innings
//     const inningsKey = `currentInnings${team.currentInnings}`;
//     if (!teamMap[team.teamId].commentaryTeamPlayers[inningsKey]) {
//       teamMap[team.teamId].commentaryTeamPlayers[inningsKey] = [];
//     }
//     teamMap[team.teamId].commentaryTeamPlayers[inningsKey].push(
//       ...commentaryTeamPlayers
//     );

//     // Convert teamMap back to an array
//     commentaryTeams = Object.values(teamMap);
//   }

//   return {
//     commentaryDetails,
//     commentaryTeams,
//   };
// };
const getTeamAndPlayerListServiceV1 = async (request, fastify) => {
  let commentaryDetails = await global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not Found");
  }

  const arrOfTeamId = [];
  let commentaryTeams = await global.tblCommentaryTeams
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .reduce((acc, curr) => {
      const teamData = {
        teamId: curr?.teamId,
        teamName: curr?.teamName,
        shortName: curr?.shortName,
        currentInnings: curr?.currentInnings,
      };
      arrOfTeamId.push(teamData);
      acc.push(teamData);
      return acc;
    }, []);

  let totalInnings = arrOfTeamId.length / 2;
  commentaryDetails.totalInnings = totalInnings;

  const systemPlayerIds = new Set(
    global.tblPlayers
      .filter((item) => item.isSystemPlayer === true)
      .map((item) => item.playerId)
  );

  let teamMap = {};

  for (const team of arrOfTeamId) {
    let commentaryTeamPlayers = await Promise.all(
      global.tblCommentaryPlayers
        .filter(
          (item) =>
            item?.commentaryId === request.body.commentaryId &&
            item.teamId === team.teamId &&
            item.currentInnings === team.currentInnings &&
            !systemPlayerIds.has(item.playerId) // Filter system players early
        )
        .map(async (curr) => {
          const playerAvg = await getPlayersBattingHistoryByIdQuery(
            {
              playerId: curr.playerId,
              matchTypeId: commentaryDetails.matchTypeId,
            },
            fastify,
            request
          );

          return {
            teamId: curr.teamId,
            playerId: curr.playerId,
            playerName: curr.playerName,
            batsmanAverage: isNaN(Number(curr.batsmanAverage))
              ? 0
              : parseFloat(Number(curr.batsmanAverage).toFixed(1)),
            batsmanStrikeRate: isNaN(Number(curr.batsmanStrikeRate))
              ? 0
              : parseFloat(Number(curr.batsmanStrikeRate).toFixed(1)),
            commentaryPlayerId: curr.commentaryPlayerId,
            isInPlayingEleven: curr.isInPlayingEleven,
            boundary:
              curr.boundary == 0 || curr.boundary == null
                ? playerAvg.length > 0
                  ? parseFloat(
                      (
                        (playerAvg[0].countOf4 + playerAvg[0].countOf6) /
                        playerAvg[0].inningsCount
                      ).toFixed(1)
                    ) || 0
                  : 0
                : curr.boundary,
            playerBallFaced:
              curr.playerBallFaced === 0 || curr.playerBallFaced == null
                ? playerAvg.length > 0
                  ? parseFloat(
                      (
                        playerAvg[0].ballsFacedCount / playerAvg[0].inningsCount
                      ).toFixed(1)
                    ) || 0
                  : 0
                : curr.playerBallFaced,
            currentInnings: curr.currentInnings,
            playerTypeId: curr.playerTypeId,
            playerType: curr.playerType,
            jerseyPlayerImage: curr.jerseyPlayerImage,
            jerseyPlayerImagePath: curr.jerseyPlayerImagePath,
            bowlingType: curr?.bowlingType,
            isPlay: curr?.isPlay,
            onStrike: curr?.onStrike,
            isBatterOut: curr?.isBatterOut,
            isBatterRetir: curr?.isBatterRetir,
            isPlayInEvent: curr?.isPlayInEvent,
            createdDate: curr?.createdDate,
          };
        })
    );

    if (!teamMap[team.teamId]) {
      let findInCompPlayer = global.tblTournamentTeamPlayers.find((i)=> i.competitionId == commentaryDetails.competitionId && 
        i.teamId == team.teamId)
      let players =[]
      if(!findInCompPlayer){
          players = await getAllPlayersByTeamIdAndMatchTypeIdQuery(
          { matchTypeId: commentaryDetails.matchTypeId, teamId: team.teamId },
          fastify,
          request
        );
      }
      else {
          players = await getTeamPlayerTournamentQuery({ matchTypeId: commentaryDetails.matchTypeId, 
            competitionId :commentaryDetails.competitionId,teamId: team.teamId },
          fastify,
          request
        );
      }

      teamMap[team.teamId] = {
        teamId: team.teamId,
        teamName: team?.teamName || null,
        shortName: team?.shortName || null,
        commentaryTeamPlayers: {},
        teamPlayers: players,
      };
    } else {
      teamMap[team.teamId].teamName =
        team.teamName || teamMap[team.teamId].teamName;
      teamMap[team.teamId].shortName =
        team.shortName || teamMap[team.teamId].shortName;
    }
    
    const inningsKey = `currentInnings${team.currentInnings}`;
     if (!teamMap[team.teamId].commentaryTeamPlayers[inningsKey]) {
      teamMap[team.teamId].commentaryTeamPlayers[inningsKey] = [];
    }
    teamMap[team.teamId].commentaryTeamPlayers[inningsKey] =
      commentaryTeamPlayers; // Replace instead of push
  }

  commentaryTeams = Object.values(teamMap);

  return {
    commentaryDetails,
    commentaryTeams,
  };
};
const cancelCommentaryService = async (request, fastify) => {
  await cancelCommentaryQuery(request.body, fastify, request);
  let _resFromPredictAPI;
  let callPredictions = [];

  // update the global variable
  for (let commentaryId of request.body.commentaryId) {
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );
    if (index !== -1) {
      // global.tblCommentaries[index].commentaryStatus = 4;
      global.tblCommentaries[index].commentaryStatus = 10;
      global.tblCommentaries[index].result = "Abandoned";

      const eventMarket = await closeEventMarketByCIdQuery(
        { commentaryId },
        fastify
      );
      if (eventMarket.length > 0) {
        // eventMarket.forEach((updatedItem) => {
        for (const updatedItem of eventMarket) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.marketId
          );
          if (index !== -1) {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        }
        // });
      }
      global.tblMarketRunnerV2
        .filter((elem) =>
          eventMarket.some((e) => e.marketId === elem.eventMarketId)
        )
        .forEach((elem) => {
          elem.selectionStatus = EventMarketStatus.Close;
        });
      let pythonURI = global.tblCommentaries[index].pythonURI || null;
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: commentaryId,
        },
        "/api/v1/endcommentary",
        fastify,
        request,
        pythonURI
      );
      let callPrediction = {};
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.Cid = commentaryId;
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = "/api/v1/endcommentary";
        callPredictions.push(callPrediction);
      }
      _resFromPredictAPI = null;
      callDataProvider(
        {
          commentaryId: commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: "close",
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
      const cData = await getMatchDataByCId(
        {
          commentaryId: commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
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

      const tipsData = global.tblTips
        .filter(
          (item) =>
            item.commentaryId === global.tblCommentaries[index].competitionId ||
            item.eventRefId === global.tblCommentaries[index].eventRefId
        )
        .map((elem) => elem.id);
      if (tipsData.length > 0) {
        global.tblTips = global.tblTips.filter(
          (item) => !tipsData.includes(item.id)
        );
        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.updateSeoModule,
            data: {
              module: "tips",
              type: "delete",
              data: {
                id: tipsData,
              },
            },
          },
          request,
          fastify
        ).catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "services/commentary.js/syncCommentaryStatsWithAPIAndSocket - callClientAPI",
            request
          );
        });
      }
    }
  }
  return {
    message: "Commentary(s) canceled successfully",
    callPredictions: callPredictions,
  };
};

const deleteEventResultService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let eventIdArr = [];
  let netRunRateData = [];

  for (const commentary of commentaryId) {
    let eventId = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentary
    );
    eventIdArr.push(eventId.eventRefId);
    if (eventId && eventId?.isTest == false) {
      netRunRateData.push({
        competitionId: eventId.competitionId,
        teamId: [eventId.team1Id, eventId.team2Id],
      });
    }
    await deleteCommentryQuery(commentary, request, fastify);
    const result = await updateEventMarketCloseQuery(
      commentaryId,
      request,
      fastify
    );
    if (result.length > 0) {
      // result.forEach((updatedItem) => {
      for (const updatedItem of result) {
        let index = global.tblEventMarketsV2.findIndex(
          (item) => item.eventMarketId === updatedItem.eventMarketId
        );
        if (index !== -1) {
          global.tblEventMarketsV2[index] = {
            ...global.tblEventMarketsV2[index],
            ...updatedItem,
          };
        }
        // global.tblMarketRunnerV2.forEach((elem) => {
        //   if (elem.eventMarketId === updatedItem.eventMarketId) {
        //     elem.selectionStatus = EventMarketStatus.Close;
        //   }
        // });
        // global.tblMarketRunnerV2.forEach((elem) => {
        for (const elem of global.tblMarketRunnerV2) {
          if (elem.eventMarketId === updatedItem.eventMarketId) {
            elem.selectionStatus = EventMarketStatus.Close;
          }
        }
      }
      // });
    }
  }

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );
  let status = 1;
  for (const runRate of netRunRateData) {
    const request = {
      body: {
        competitionId: runRate.competitionId,
        teamId: runRate.teamId,
        status,
      },
    };

    await netRunRateRe_calculationService(request, fastify);
  }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        type: "deleteEvent",
        eventId: eventIdArr,
        commentaryId : commentaryId
      },
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteEventResultService",
      request
    );
  });

  callDataProvider(
    {
      commentaryId: commentaryId,
      serviceType: ServiceType.dataProviderAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      type: "delete",
    },
    fastify
  ).catch((err) => {
    console.log("call data provider console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteEventResultService",
      request
    );
  });
  return `Commentaries deleted successfully`;
};

const isCountInPointCommentaryService = async (request, fastify) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await isCountInPOintCommentaryChangeQuery(request.body, fastify, request);
  global.tblCommentaries[index].isCountInPoint = request.body.isCountInPoint;

  const commentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
  );

  if (commentary.commentaryStatus === 4 && commentary?.isTest == false) {
    const request = {
      body: {
        competitionId: commentary.competitionId,
        teamId: [commentary.team1Id, commentary.team2Id],
        status: 1,
      },
    };

    await netRunRateRe_calculationService(request, fastify);
  }

  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Updated successfully",
      },
      apiName: "/admin/commentary/isCountInPoint",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("isCountInPoint commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/isCountInPointCommentaryService - commActionLogger",
      request
    );
  });

  return "Commentary Updated successfully";
};

const multiIsCountInPointCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let netRunRateData = [];

  for (const commentary of commentaryId) {
    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentary
    );
    if (!commentaryData) {
      continue;
    }
    if (commentaryData && commentaryData?.isTest == false) {
      netRunRateData.push({
        competitionId: commentaryData.competitionId,
        teamId: [commentaryData.team1Id, commentaryData.team2Id],
      });
    }
    await isCountInPOintCommentaryChangeQuery(
      { isCountInPoint: false, commentaryId: commentary },
      fastify,
      request
    );
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentary
    );
    global.tblCommentaries[index].isCountInPoint = false;
  }

  let status = 1;
  for (const runRate of netRunRateData) {
    const request = {
      body: {
        competitionId: runRate.competitionId,
        teamId: runRate.teamId,
        status,
      },
    };

    await netRunRateRe_calculationService(request, fastify);
  }

  return `Commentaries isCountInPoint updated successfully`;
};
const getRunnerOfMarketService = async (request, fastify) => {
  try {
    // const apiUrl = process.env.IMPORTMARKET_API;
    const { isAustralian, refID } = request.body;

    // let response = global.tblEventMarkets.filter(
    //   (item) => item.eventRefId == refID && item.rateSource === 2
    // );

    // let whereCondition = `tem."wrEventRefID" = '${refID}' AND tem."wrRateSource" = 2 AND tc."wrIsDelete" = false`;
    let response = await getExtrenalMarketQuery(refID, fastify, request);

    // const apiUrl = global.tblConfigs.find((item) => item.key == configConstants.IMPORTMARKET_API)?.value;
    // if(!apiUrl){
    //   throw new Error("IMPORTMARKET_API not found in tblConfigs");
    // }
    // let endpoint = "/listManualMarket";

    // let postData = {
    //   isaustralian: isAustralian,
    //   eventids:refID
    // }

    // const response = await fetch(apiUrl + endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(postData),
    // });
    let responseData = {};
    if (response) {
      //  responseData = await response.json();
      responseData.data = response;
      // for (let res of responseData) {
      const commentary = global.tblCommentaries.find(
        (item) => item.eventRefId === refID
      );
      responseData.teamsDetails = {};
      if (commentary) {
        const currentInnings = commentary.currentInnings;

        const [commentaryTeamsOne, commentaryTeamsTwo] = await Promise.all([
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
        ]);
        // res.team1Id = commentaryTeamsOne.teamId;
        // res.team1Name = commentaryTeamsOne.teamName;
        // res.team2Id = commentaryTeamsTwo.teamId;
        // res.team2Name = commentaryTeamsTwo.teamName;
        responseData.teamsDetails.team1Id = commentaryTeamsOne.teamId;
        responseData.teamsDetails.team1Name = commentaryTeamsOne.teamName;
        responseData.teamsDetails.team2Id = commentaryTeamsTwo.teamId;
        responseData.teamsDetails.team2Name = commentaryTeamsTwo.teamName;
        // }
      }
      return responseData;
    } else {
      // console.error(`Error: ${response.status} - ${response.statusText}`);
      throw new Error("Error while fetching data from import market");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getEventMarketAndRunnersService = async (request, fastify) => {
  const { commentaryId } = request.body;

  const validate = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!validate) {
    throw new Error("Commentary with this ID not found");
  }
  const result = await getEventMarketsByCommId(commentaryId, request, fastify);

  return result;
};

const commentaryHistoryService = async (request, fastify) => {
  const { commentaryStatus, eventTypeId, competitionId, startDate, endDate } =
    request.body;

  let whereCondition = `tc."wrIsDelete" = FALSE`;
  if (commentaryStatus === undefined) {
    // whereCondition += ` AND tc."wrCommentaryStatus" != 4`;
    whereCondition += ` AND tc."wrCommentaryStatus" in (4, 10)`;
  }
  if (commentaryStatus && commentaryStatus != 0) {
    whereCondition += ` AND tc."wrCommentaryStatus" = ${commentaryStatus}`;
  }
  if (commentaryStatus == 0) {
    whereCondition;
  }
  if (eventTypeId) {
    whereCondition += ` AND tc."wrEventTypeId" = ${eventTypeId}`;
  }

  if (competitionId) {
    whereCondition += ` AND tc."wrCompetitionId" = ${competitionId}`;
  }
  let orderByClause = ` ORDER BY tc."wrEventDate" ASC`;

  if (startDate && endDate) {
    whereCondition += ` AND tc."wrEventDate" BETWEEN '${startDate}' AND '${endDate}'`;
    orderByClause = ` ORDER BY tc."wrEventDate" DESC`;
  }
  whereCondition += orderByClause;

  let result = await getAllCommentaryHistoryQuery(
    whereCondition,
    fastify,
    request
  );

  return result;
};

const deleteCommentaryHistoryService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let eventIdArr = [];
  let playerIds = [];
  let matchTypeIds = [];
  let netRunRateData = [];
  for (const commentary of commentaryId) {
    let whereCondition = `tc."wrIsDelete" = FALSE AND tc."wrCommentaryId" = ${commentary}`;
    let result = await getAllCommentaryHistoryQuery(
      whereCondition,
      fastify,
      request
    );
    if (result.length == 0) {
      throw new Error(`Commentary with this ID not found`);
    }
    let eventId = result[0];

    let playerlist = await getCommPlayersByCommentaryIdQuery(
      commentary,
      request,
      fastify
    );
    playerlist = playerlist.map((pla) => pla.playerId);

    matchTypeIds.push(eventId.matchTypeId);

    if (eventId && eventId.isTest == false) {
      playerIds = playerIds.concat(playerlist);
      netRunRateData.push({
        competitionId: eventId.competitionId,
        teamId: [eventId.team1Id, eventId.team2Id],
      });
    }
    eventIdArr.push(eventId.eventRefId);
  }
  await deleteCommentryHistoryQuery(commentaryId, request, fastify);

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  const marketIds = global.tblEventMarketsV2
    .filter((item) => commentaryId.includes(item.commentaryId))
    .map((item) => item.eventMarketId);

  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (runner) => !marketIds.includes(runner.eventMarketId)
  );

  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !commentaryId.includes(item.commentaryId)
  );

  global.tblCommentaryAwards = global.tblCommentaryAwards.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  global.tblTips = global.tblTips.filter(
    (item) => !commentaryId.includes(item?.commentaryId)
  );

  let status = 1;
  for (const runRate of netRunRateData) {
    const request = {
      body: {
        competitionId: runRate.competitionId,
        teamId: runRate.teamId,
        status,
      },
    };

    await netRunRateRe_calculationService(request, fastify);
  }

  // for (const p of playerIds) {
  //   const request = {
  //     body: {
  //       playerId: p,
  //       matchTypeId: matchTypeIds,
  //     },
  //   };
  //   await calculationOfCommPlayerBatHistService(request, fastify);
  //   await calculationOfCommPlayerBowlHistService(request, fastify);
  // }

  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        type: "deleteEvent",
        eventId: eventIdArr,
        commentaryId :commentaryId
      },
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteCommentaryHistoryService",
      request
    );
  });

  callDataProvider(
    {
      commentaryId: commentaryId,
      serviceType: ServiceType.dataProviderAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      type: "delete",
    },
    fastify
  ).catch((err) => {
    console.log("call data provider console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/deleteCommentaryHistoryService",
      request
    );
  });
  return `Commentaries deleted successfully`;
};

const getAllCompletedCommentaryService = async (request, fastify) => {
  const completedCommentaryData = await getAllCompletedCommentaryQuery(request, fastify);
  const result = await Promise.all(
    completedCommentaryData.map(async (item) => {
      const weatherAndPitchData = await weatherAndPitchDataService(item.commentaryId);
      return {
        ...item,
        ...weatherAndPitchData,
      };
    })
  );
  return result;
};

const updateMergeImageOnCommentaryPlayersService = async (request, fastify) => {
  if (request.body.commentaryId) {
    let validateId = await getCommentaryByIdQuery(request, fastify);
    if (!validateId) {
      throw new Error(`Commentary with this ID not found`);
    }
    let whereCondition = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${request.body.commentaryId}`;
    const result = await getAllCommentaryPlayerDataQuery(
      whereCondition,
      fastify
    );
    if (result.length > 0) {
      for (const players of result) {
        const teamPlayers = await getAllTeamPlayersByTeamIdAndPlayerIdQuery(
          { playerId: players.playerId, teamId: players.teamId },
          fastify,
          request
        );
        if (teamPlayers && teamPlayers?.jerseyPlayerImage) {
          await updateCommentaryPlayerJerseyImageQuery(
            {
              commentaryPlayerId: players.commentaryPlayerId,
              jerseyPlayerImage: teamPlayers?.jerseyPlayerImage,
              jerseyPlayerImagePath: teamPlayers?.jerseyPlayerImagePath,
            },
            fastify
          );
          const index = global.tblCommentaryPlayers.findIndex(item => 
            item.commentaryPlayerId == players?.commentaryPlayerId
          );
          if(index !== -1) {
            global.tblCommentaryPlayers[index] = {
              ...global.tblCommentaryPlayers[index],
              jerseyPlayerImage: teamPlayers?.jerseyPlayerImage,
              jerseyPlayerImagePath: teamPlayers?.jerseyPlayerImagePath,
            }
          } 
        }
      }
    }
  }
  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Jersey and Player images updated successfully"
      },
      apiName: "/admin/commentary/mergeImage",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("mergeImage commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/updateMergeImageOnCommentaryPlayersService - commActionLogger",
      request
    );
  });
  return "Jersey and Player images updated successfully";
};
const changeIsTestComService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await changeIsTestComQuery(request.body, fastify, request);

  global.tblCommentaries[commentary].isTest = request.body.isTest;

  let cData = await getMatchDataByCId(
    {
      commentaryId: request.body.commentaryId,
    },
    request,
    fastify
  );
  callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        isTest: request.body.isTest,
        type: "isTestChange",
      },
    },
    request,
    fastify
  ).catch((err) => {
    console.log("call client api console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/changeIsTestComService",
      request
    );
  });
  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Updated successfully"
      },
      apiName: "/admin/commentary/changeIsTest",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("isTest commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/changeIsTestComService - commActionLogger",
      request
    );
  });
  return "Commentary Updated successfully";
};
const changeisEventStartService = async (request, fastify) => {
  const { commentaryId, isEventStart } = request.body;
  // validate commentary id
  const commentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  if (commentary.isEventStart == false) {
    await changeIsEventStartQuery(
      { isEventStart: isEventStart, commentaryId: commentaryId },
      fastify,
      request
    );
    const index = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryId
    );
    if (index !== -1) {
      global.tblCommentaries[index].isEventStart = isEventStart;
    }
    if (isEventStart === true) {
      if (commentary.isActive === true) {
        await notiConfigContentReplaceService(
          EventName.EVENTSTART,
          commentaryId,
          request,
          fastify
        );
      }
      // let data = global.tblNotificationConfig.find((elem) =>
      //   elem.isActive === true && elem.eventName === EventName.EVENTSTART
      // )
      // if(data && commentary.isActive === true && commentary.eventName != null) {
      //   data.content = data.content.replace("{}", commentary.eventName);
      // if(
      //   global?.clientSocketIo !== undefined &&
      //   global?.clientSocketIo.length > 0
      // ){
      //   global.clientSocketIo.forEach((socket) => {
      //     socket.client.emit("notificationSend", data);
      //   });
      //   let notificationData = {
      //     title: commentary.eventName,
      //     description: data.content,
      //     commentaryId: commentary.commentaryId,
      //   }
      //   await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      // }
      // }
    }
  }

  return "IsEventStart Updated successfully";
};

const getAllDifficultyService = async (request, fastify) => {
  const result = await getAllDifficulties(fastify);
  return result;
};

const notiConfigContentReplaceService = async (
  eventName,
  commentaryId,
  request,
  fastify,
  cId
) => {
  let data = global.tblNotificationConfig.find(
    (elem) => elem.isActive === true && elem.eventName === eventName
  );

  if (!data) {
    return;
  }

  const commentary = global.tblCommentaries.find(
    (item) => item?.commentaryId === commentaryId
  );
  const commentaryTeams = global.tblCommentaryTeams.filter(item => item.commentaryId === commentaryId);

  const battingTeam = commentaryTeams.find(item => item.teamStatus === 1);
  const bowlingTeam = commentaryTeams.find(item => item.teamStatus === 2);
  const tossWonBy = commentaryTeams.find(item => item.teamId == commentary?.tossWonBy)?.teamName;
  const teamData = commentaryTeams.find(item => item.teamBattingOrder === 2);

  let wicketData = null;
  let batterNameForBoundary = "";

  // const playerName = global.tblCommentaryWicket.find(item => item.commentaryId === commentaryId &&
  //   item.commentaryWicketId == cId
  // );

  if (eventName === EventName.WICKET && cId) {
    wicketData = global.tblCommentaryWicket.find(item => item.commentaryId === commentaryId &&
      item.commentaryWicketId == cId
    );
  }

  // Logic to get the player name for BOUNDARY event (using last ball)
  if (eventName === EventName.BOUNDARY) {
    const battingTeamId = battingTeam?.teamId;
    
    // Find the most recent ball-by-ball entry for the batting team
    const lastBall = global.tblCommentaryBallByBall
      .filter(item => 
        item.commentaryId === commentaryId && 
        item.teamId === battingTeamId
      )
      .sort((a, b) => b.commentaryBallByBallId - a.commentaryBallByBallId)[0];

    if (lastBall && lastBall?.ballIsBoundry) {
        // Find the player's name using the striker ID from the last ball
        const strikerPlayer = global.tblCommentaryPlayers.find(player =>
            player.commentaryPlayerId === lastBall?.batStrikeId
        );
        batterNameForBoundary = strikerPlayer?.playerName || "";
    }
  }
  const date = commentary?.eventDate ? convertDate(commentary.eventDate, "ddd MMM D YYYY") : "";
  const title = data?.title.replace(/\{(.*?)\}/g, (_, key) => {
    const normalizedKey = key.toLowerCase();
    const batsmanname = eventName === EventName.WICKET 
      ? wicketData?.batterName ?? ""
      : batterNameForBoundary;
    const valueMap = {
      eventname: commentary.eventName ?? "",
      eventtype: commentary.eventType ?? "",
      eventdate: commentary.eventDate ?? "",
      date: date ?? "",
      location: commentary.location ?? "",
      battingteam: battingTeam?.teamName ?? "",
      bowlername: wicketData?.bowlerName ?? "",
      batsmanname: batsmanname ?? "",
      // bowlername: playerName?.bowlerName ?? "",
      // batsmanname: playerName?.batterName ?? "",
      batsmanrun: (wicketData?.playerRun != null) ? wicketData?.playerRun : "",
      batsmanball: (wicketData?.playerBalls != null) ? wicketData?.playerBalls : "",
      wickettype: wicketType[wicketData?.wicketType] ?? "",
      // batsmanrun: (playerName?.playerRun != null) ? playerName?.playerRun : "",
      // wickettype: wicketType[playerName?.wicketType] ?? "",
      bowlingteam: bowlingTeam?.teamName ?? "",
      trilscore: battingTeam?.teamScore ?? "",
      rmk: commentary.rmk ?? "",
      wonremark: commentary.winRmk ?? "",
      winnername: commentary?.winnerName ?? "",
      winnerid: commentary?.winnerId ?? 0,
      boundarytype: cId ?? "",
      team1name: commentary?.team1Name ?? "",
      team2name: commentary?.team2Name ?? "",
      matchtype: commentary?.matchType ?? "",
      competition: commentary?.competition ?? "",
      result: commentary?.result ?? "",
      eventtype: commentary?.eventType ?? "",
      displaystatus: commentary?.displayStatus ?? "",
      eventno: commentary?.eventNo ?? "",
      tosswonby: tossWonBy,
      runs: battingTeam?.teamScore ?? "0",
      wickets: battingTeam?.teamWicket ?? "0",
      overs: battingTeam?.teamOver ?? "0.0",
    };

    return valueMap[normalizedKey] ?? "";
  });

  const content = data.content.replace(/\{(.*?)\}/g, (_, key) => {
    const normalizedKey = key.toLowerCase();
    const batsmanname = eventName === EventName.WICKET 
      ? wicketData?.batterName ?? ""
      : batterNameForBoundary;
    const valueMap = {
      eventname: commentary.eventName ?? "",
      eventtype: commentary.eventType ?? "",
      eventdate: commentary.eventDate ?? "",
      date: date ?? "",
      location: commentary.location ?? "",
      battingteam: battingTeam?.teamName ?? "",
      bowlername: wicketData?.bowlerName ?? "",
      batsmanname: batsmanname ?? "",
      // bowlername: playerName?.bowlerName ?? "",
      // batsmanname: playerName?.batterName ?? "",
      batsmanrun: (wicketData?.playerRun != null) ? wicketData?.playerRun : "",
      batsmanball: (wicketData?.playerBalls != null) ? wicketData?.playerBalls : "",
      wickettype: wicketType[wicketData?.wicketType] ?? "",
      // batsmanrun: (playerName?.playerRun != null) ? playerName?.playerRun : "",
      // wickettype: wicketType[playerName?.wicketType] ?? "",
      bowlingteam: bowlingTeam?.teamName ?? "",
      trilscore: battingTeam?.teamScore ?? "",
      rmk: commentary.rmk ?? "",
      wonremark: commentary.winRmk ?? "",
      winnername: commentary?.winnerName ?? "",
      winnerid: commentary?.winnerId ?? 0,
      boundarytype: cId ?? "",
      team1name: commentary?.team1Name ?? "",
      team2name: commentary?.team2Name ?? "",
      matchtype: commentary?.matchType ?? "",
      competition: commentary?.competition ?? "",
      result: commentary?.result ?? "",
      eventtype: commentary?.eventType ?? "",
      displaystatus: commentary?.displayStatus ?? "",
      eventno: commentary?.eventNo ?? "",
      tosswonby: tossWonBy,
      runs: battingTeam?.teamScore ?? "0",
      wickets: battingTeam?.teamWicket ?? "0",
      overs: battingTeam?.teamOver ?? "0.0",
    };

    return valueMap[normalizedKey] ?? "";
  });

  if (data && commentary.isActive === true) {
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("notificationSend", { ...data, title, content ,eventId : commentary.eventRefId ?? null, commentaryId: commentary?.commentaryId ?? null});
      });
      let notificationData = {
        title: commentary.eventName,
        description: content,
        commentaryId: commentary.commentaryId,
        // subTitle: title,
      };
      await insertNotificationViaNotiConfigQuery(
        notificationData,
        request,
        fastify
      );
    }
  }
  return { ...data, content };
};

const saveComVirtual = async (request, fastify) => {
  // check sp
  // get req start time
  const startTime = new Date();
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
      isEndInnings = false,
      isCallPredict = false,
      isOverComplete = false
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
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI || null;
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
      // await notiConfigContentReplaceService(EventName.INNINGCOMPLETED, commentaryData.commentaryId, request, fastify);
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
      balltypeOfdeleteBall =
        global.tblCommentaryBallByBall[deleteBallIndex].ballType;
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
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
        // const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
        //   return (
        //     item?.commentaryId === commentaryOvers.commentaryId &&
        //     item.teamId === commentaryOvers.teamId &&
        //     item.commentaryPlayerId === commentaryOvers.bowlerId
        //   );
        // });

        // if (indexBowler === -1) {
        //   throw new Error("Bowler with this id not Found");
        // }
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_setcommentary_virtual(
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
          deleteCommentaryBallByBallId || deleteOverId
            ? request.userTokenInfo.WrUserId
            : null,
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
    // const setEventSnap = [];
    // const teamPoint = [];

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
        rmk: commentaryDetails.rmk,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
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
        isPredict: commentaryDetails.isPredictMarket,
        rmk: commentaryDetails.rmk,
        ...weatherAndPitchData,
      };
      // if(commentaryDetails.commentaryStatus == 2) {
      //   // await notiConfigContentReplaceService(EventName.WINTOSS, commentaryDetails.commentaryId, request, fastify);
      // }
      // if (
      //   previousCommentaryStatus != statusToUpdate && commentaryData?.isPredictMarket == true
      // ) {
      //   callDataProvider(
      //     {
      //       commentaryId: commentaryId,
      //       serviceType: ServiceType.dataProviderAPI,
      //       moduleType: APIEndpointModuleType.commentaryUpdate,
      //       type: statusToUpdate == 4 ? "close" : "update"
      //     },
      //     fastify
      //   ).catch((err) => {
      //     console.log("call Data Provider console", err);
      //     errorLogger(
      //       fastify,
      //       err.message,
      //       "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //       request
      //     );
      //   });
      // }
      // if (previousCommentaryStatus != statusToUpdate) {
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
          console.log("call client api console in saveCommVirtual", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/saveComVirtual",
            request
          );
        });
      // }
      // if (previousCommentaryStatus != statusToUpdate && statusToUpdate == 4) {
      //   // await notiConfigContentReplaceService(EventName.EVENTCOMPLETED, commentaryData.commentaryId, request, fastify)
      //   let com = global.tblCompetitions.find((item) => item.competitionId === commentaryData.competitionId);
      //   if (com && com.isEventSnap == true) {
      //     setEventSnap.push({
      //       commentaryId: commentaryId,
      //       eventRefId: commentaryData.eventRefId,
      //       competitionId: commentaryData.competitionId,
      //       eventTypeId: commentaryData.eventTypeId,
      //     })
      //   }
      //   if (com && com.isPointTable == true && commentaryData?.isTest == false) {
      //     teamPoint.push({
      //       commentaryId: commentaryId,
      //       competitionId: commentaryData.competitionId,
      //       team1Id: commentaryData.team1Id,
      //       team2Id: commentaryData.team2Id,
      //       winnerId: commentaryDetails.winnerId,
      //     })
      //   }
      //   if (setEventSnap.length > 0) {
      //     setCompEventSnapSerice(setEventSnap, request, fastify)
      //       .catch((err) => {
      //         console.log("setCompEventSnapSerice console savedetails", err);
      //         errorLogger(
      //           fastify,
      //           err.message,
      //           "ERROR --> services/commentary.js/saveDetails - syncCommentaryStatsWithAPIAndSocket - setEventSnap",
      //           request
      //         );
      //       });
      //   }
      //   if (teamPoint.length > 0) {
      //     setTeamPointService(teamPoint, request, fastify)
      //       .catch((err) => {
      //         console.log("setTeamPointService console savedetails", err);
      //         errorLogger(
      //           fastify,
      //           err.message,
      //           "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setTeamPointService",
      //           request
      //         );
      //       });
      //   }
      //   if (commentaryData && commentaryData?.isTest == false) {
      //     setPlayerHistoryService({
      //       commentaryId: [commentaryId]
      //     }, request, fastify)
      //       .catch
      //       ((err) => {
      //         console.log("setPlayerHistoryService console savedetails", err);
      //         errorLogger(
      //           fastify,
      //           err.message,
      //           "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setPlayerHistoryService",
      //           request
      //         );
      //       });
      //   }
      //   const tipsData = global.tblTips.filter(
      //     (item) =>
      //       item.commentaryId === commentaryDetails.commentaryId ||
      //       item.eventRefId === commentaryDetails.eventRefId
      //   ).map((elem) => elem.id);
      //   if (tipsData.length > 0) {
      //     global.tblTips = global.tblTips.filter((item) => !tipsData.includes(item.id));
      //     callClientAPI(
      //       {
      //         serviceType: ServiceType.clientAPI,
      //         moduleType: APIEndpointModuleType.updateSeoModule,
      //         data: {
      //           module: "tips",
      //           type: "delete",
      //           data: {
      //             id: tipsData,
      //           },
      //         },
      //       },
      //       request,
      //       fastify
      //     ).catch((err) => {
      //       errorLogger(
      //         fastify,
      //         err.message,
      //         "services/commentary.js/syncCommentaryStatsWithAPIAndSocket - callClientAPI",
      //         request
      //       );
      //     });
      //   }
      // }
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        global.tblCommentaryTeams[index] = {
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
        };
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
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
        (item) => item?.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      try {
        _deleteBallID = {};
        _deleteBallID.commentaryBallByBallId = deleteCommentaryBallByBallId;
        _deleteBallID.commentaryId = commentaryId;
        await deleteMarketOddsBallByBall(_deleteBallID, fastify, request);
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
            item?.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
      }
      if (commentaryWicket) {
        wicketIndex = global.tblCommentaryWicket.findIndex(
          (item) =>
            item.commentaryWicketId === commentaryWicket.commentaryWicketId
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
        if (commentaryData.isPredictMarket && isCallPredict == true) {
          //_resFromPredictAPI = null;
          const decimalOverCount = parseFloat(previousBall.overCount);
          const _wkt = previousBall.ballIsWicket;
          //_resFromPredictAPI = await

          // await callPredictorMarket(
          //   {
          //     commentary_id: commentaryData.commentaryId,
          //     match_type_id: commentaryData.matchTypeId,
          //     ball: decimalOverCount,
          //     run: previousBall.ballRun,
          //     total_score: strikeTeam.teamScore,
          //     strike_team_id: strikeTeam.teamId,
          //     wicket: _wkt === true ? 1 : 0,
          //     total_wicket: strikeTeam.teamWicket,
          //     ball_by_ball_id: deleteCommentaryBallByBallId
          //       ? parseInt(deleteCommentaryBallByBallId)
          //       : null,
          //   },
          //   "/api/v1/undoscore",
          //   fastify,
          //   request,
          //   pythonURI
          // ).catch((err) => {
          //   console.log("errorrrrrr99999-", err)
          //   errorLogger(
          //     fastify,
          //     err.message,
          //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          //     request
          //   );
          // });
          try {
            await callPredictorMarket(
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
                  : null,
              },
              "/api/v1/undoscore",
              fastify,
              request,
              pythonURI
            )
          } catch (error) {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
              request
            );
          }
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
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      // let _plyers = commentaryPlayers.filter((_fil) => _fil.isPlay === true && _fil.onStrike !== null);
      // _plyers.forEach((player) => {
      //   let _sendPrePlayer = {};
      //   _sendPrePlayer.player_id = player.commentaryPlayerId;
      //   _sendPrePlayer.player_name = player.playerName;
      //   _sendPrePlayer.team_id = player.teamId;
      //   _sendPrePlayer.batRun = player.batRun || '0';
      //   _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
      //   _sendPrePlayer.current_boundaries =
      //     (isNaN(parseInt(player.batFour ?? 0, 10)) ? 0 : parseInt(player.batFour ?? 0, 10)) +
      //     (isNaN(parseInt(player.batSix ?? 0, 10)) ? 0 : parseInt(player.batSix ?? 0, 10));
      //   _sendPrePlayer.balls_faced = player.batBall || 0;
      //   _sendPrePlayers.push(_sendPrePlayer);
      // });

      try {
        commentaryPlayers.forEach(async (player) => {
          if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
            player.bowlerOver = player.bowlerOver.toString();
          }
          if (player.bowlerEconomy === "NaN") {
            player.bowlerEconomy = null;
          }
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
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
    if (
      updatedData.commentaryBallByBallDetails &&
      commentaryData.isPredictMarket &&
      (updatedData.commentaryBallByBallDetails.ballType != 0 && updatedData.commentaryBallByBallDetails.ballType != 8)
    ) {

      let isShuffle = false;
      
      let wicketS,overCS,endinningS = false
      if(commentaryWicket) {
        wicketS = commentaryData.shuffle?.Wicket == true ? true : false
      }
      if(isOverComplete == true){
        overCS = commentaryData.shuffle?.OverComplete == true ? true : false
      }
      if(isEndInnings && isEndInnings == true){
        endinningS = commentaryData.shuffle?.InningsComplete == true ? true : false
      }
      if(wicketS == true || overCS == true || endinningS == true){
        isShuffle = true
      }
      // console.log("isShuffle",isShuffle)
      let strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 1
      );
      let nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 2
      );

      let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      let _wkt = commentaryBallByBall.ballIsWicket;
      let partnership = updatedData.commentaryPartnershipDetails;
      let boundary = partnership.totalSix + partnership.totalFour;
      sendPartnership.push({
        partnership_no: partnership?.order || 0,
        partnership_boundaries: boundary
      })

      const predictionPayload = {
        playerpredictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: strikeTeam?.teamOver || 0,
          // player_details: _sendPrePlayers,
          // ball_by_ball_details: updatedData.commentaryBallByBallDetails,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
            : null,
          partnership_details: sendPartnership
        },
        predictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          ball: strikeTeam?.teamOver,
          run: commentaryBallByBall.ballRun,
          total_score: strikeTeam.teamScore,
          strike_team_id: strikeTeam.teamId,
          wicket: _wkt === true ? 1 : 0,
          total_wicket: strikeTeam.teamWicket,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
            : null,
          ballType: commentaryBallByBall?.ballType ?? null,
          target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
        },
        commentary_id: commentaryId,
        ball_by_ball_details: {
          cardKey: updatedData.commentaryBallByBallDetails?.cardKey,
          cardType: updatedData.commentaryBallByBallDetails?.cardType,
          currentInnings: strikeTeam?.teamBattingOrder,
          isShuffle
          // currentInnings: updatedData.commentaryBallByBallDetails?.currentInnings
        }
      }
      let isNodePrediction = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICATIONFROMNODE)?.value || "false";
      if (isNodePrediction == "true")
        processPredictScoreMarket(predictionPayload)
      else
        // callPredictorMarket(
        //   predictionPayload,
        //   "/api/v1/predictscore",
        //   fastify,
        //   request,
        //   pythonURI
        // )
        try {
          await callPredictorMarket(
            predictionPayload,
            "/api/v1/predictscore",
            fastify,
            request,
            pythonURI
          );
        } catch (err) {
          errorLogger(
            fastify,
            err?.message || String(err),
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
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
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });

        // if (updatedData.commentaryBallByBallDetails.ballType > 0) {
        //   if (!global.isSignalRStopped) {
        //     let _results = [];
        //     let result = await addinMarketBallbyballOdds(commentaryId, updatedData.commentaryBallByBallDetails, fastify);
        //     if (result) {
        //       _results.push(result);
        //       if (_results && _results.length > 0) {
        //         sendDataForSocketUpdate.dataToUpdate.push({
        //           module: "marketOddsBallByBall",
        //           data: _results,
        //           type: "create"
        //         });
        //       }
        //     }
        //   }
        // }
      } else {
        if (!deleteCommentaryBallByBallId) {
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryBallByBall.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (ballByBallIndex !== -1) {
            global.tblCommentaryBallByBall[ballByBallIndex] =
              commentaryBallByBall;
          }
        }
        response.commentaryBallByBallDetails = commentaryBallByBall;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
      }
      // call Third Party API
      // if (response.commentaryBallByBallDetails.ballType > 0) {
      //   try {
      //     let _wkt = commentaryBallByBall.ballIsWicket;
      //     let _bory = commentaryBallByBall.ballIsBoundry;
      //     if(_bory == true) {
      //       let boundaryType
      //       let ballRun = response.commentaryBallByBallDetails.ballRun
      //       if (ballRun == 4) {
      //         boundaryType = ballRun
      //       }
      //       if (ballRun == 6) {
      //         boundaryType = ballRun
      //       }

      //       // await notiConfigContentReplaceService(EventName.BOUNDARY, commentaryData.commentaryId, request, fastify, boundaryType);
      //         // let data = global.tblNotificationConfig.find((elem) =>
      //         //   elem.isActive === true && elem.eventName === EventName.BOUNDARY
      //         // )
      //         // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
      //         //   data.content = data.content.replace("{}", commentaryData.eventName);
      //         //   if(
      //         //     global?.clientSocketIo !== undefined &&
      //         //     global?.clientSocketIo.length > 0
      //         //   ){
      //         //     global.clientSocketIo.forEach((socket) => {
      //         //       socket.client.emit("notificationSend", data);
      //         //     });
      //         //     let notificationData = {
      //         //       title: commentaryData.eventName,
      //         //       description: data.content,
      //         //       commentaryId: commentaryData.commentaryId,
      //         //     }
      //         //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      //         //   }
      //         // }
      //     }
      //     const isFDS = global.tblConfigs.find((item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI).value;
      //     if (isFDS && isFDS == 'true') {
      //       if (_wkt || _bory) {
      //         callfds(
      //           {
      //             Id: 0,
      //             EventId: parseInt(commentaryData.eventRefId),
      //             BWDateTime: '',
      //             Type: _bory === true ? "2" : _wkt === true ? "1" : ""
      //           },
      //           "/api/transactions/SaveBoundryWicket",
      //           fastify,
      //           request
      //         ).catch((err) => {
      //           errorLogger(
      //             fastify,
      //             err.message,
      //             "ERROR --> services/commentary.js/saveComVirtual",
      //             request
      //           );
      //         });
      //       }
      //     }
      //   } catch (error) {
      //     console.log("error in console:", error)
      //     errorLogger(
      //       fastify,
      //       error.message,
      //       "ERROR --> services/commentary.js/saveComVirtual",
      //       request
      //     );
      //   }
      // }
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
        global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
        response.commentaryWicketDetails = commentaryWicket;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "update",
          data: response.commentaryWicketDetails,
        });
        if (!deleteCommentaryBallByBallId) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] =
              updatedData.commentaryWicketDetails;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryWicket.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (wicketIndex !== -1) {
            global.tblCommentaryWicket[wicketIndex] =
              updatedData.commentaryWicketDetails;
          }
        }
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        if (
          deleteCommentaryBallByBallId !=
          commentaryWicket.commentaryBallByBallId
        ) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryWicket",
            type: "update",
            data: response.commentaryWicketDetails,
          });
        }
      }
      // await notiConfigContentReplaceService(EventName.WICKET, commentaryData.commentaryId, request, fastify)
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        if (!deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] =
              updatedData.commentaryPartnershipDetails;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryPartnership.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] =
              updatedData.commentaryPartnershipDetails;
          }
        }
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        if (
          deleteCommentaryBallByBallId !=
          commentaryPartnership.commentaryBallByBallId
        ) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPartnership",
            type: "update",
            data: response.commentaryPartnershipDetails,
          });
        }
      }
      // let boundary = response.commentaryPartnershipDetails.totalSix + response.commentaryPartnershipDetails.totalFour;
      // sendPartnership.push({
      //   partnership_no : response.commentaryPartnershipDetails.order,
      //   partnership_boundaries : boundary
      // })
    }
    // if (deleteCommentaryBallByBallId) {
    //   response.deleteCommentaryBallByBallId = true;
    //   sendDataForSocketUpdate.dataToUpdate.push({
    //     // module: "deleteCommentaryBallByBallId",
    //     // type: "delete",
    //     // data: deleteCommentaryBallByBallId,
    //     module: "commentaryBallByBall",
    //     type: "delete",
    //     data: { commentaryBallByBallId: deleteCommentaryBallByBallId },
    //   });
    // }
    // if (deleteOverId) {
    //   response.deleteOverId = true;
    //   sendDataForSocketUpdate.dataToUpdate.push({
    //     // module: "deleteOverId",
    //     // type: "delete",
    //     // data: deleteOverId,
    //     module: "commentaryOvers",
    //     type: "delete",
    //     data: { overId: deleteOverId },
    //   });
    // }
    // if (
    //   commentaryDetails &&
    //   commentaryData.isPredictMarket == true &&
    //   previousCommentaryStatus == 1 &&
    //   statusToUpdate == 2
    // ) {
    //   handleMarketCloseService(
    //     {
    //       commentaryId: commentaryDetails.commentaryId,
    //       inningsId: commentaryDetails.currentInnings,
    //     },
    //     request,
    //     fastify
    //   ).catch((err) => {
    //     console.log("handle market closes services console", err);
    //     errorLogger(
    //       fastify,
    //       err.message,
    //       "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
    //       request
    //     );
    //   });
    //   //_resFromPredictAPI = null;
    //   //_resFromPredictAPI = await
    //   if (isCallPredict == true) {
    //     let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
    //     let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
    //     let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
    //     callPredictorMarket(
    //       {
    //         commentary_id: commentaryDetails.commentaryId,
    //         match_type_id: commentaryDetails.matchTypeId,
    //         event_id: commentaryDetails.eventRefId,
    //         default_ball_faced: parseInt(key1?.value) || 0,
    //         default_player_boundaries: parseInt(key2?.value) || 0,
    //         default_player_runs: parseInt(key3?.value) || 0,
    //       },
    //       "/api/v1/loadcommentary",
    //       fastify,
    //       request
    //     ).catch((err) => {
    //       errorLogger(
    //         fastify,
    //         err.message,
    //         "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
    //         request
    //       );
    //     });
    //   }
    //   setLineRatioInComService(
    //     {
    //       commentaryId: commentaryDetails.commentaryId,
    //       matchTypeId: commentaryData.matchTypeId
    //     },
    //     request,
    //     fastify
    //   ).catch((err) => {
    //     console.log("setLineRatioInComService console", err);
    //     errorLogger(
    //       fastify,
    //       err.message,
    //       "ERROR --> services/commentary.js/setLineRatioInComService",
    //       request
    //     );
    //   });
    // }

    if (
      commentaryData.isPredictMarket == true &&
      statusToUpdate == 4
    ) {
      // const eventMarket = await closeEventMarketByCIdQuery(
      //   {
      //     commentaryId: commentaryDetails.commentaryId,
      //   },
      //   fastify
      // );
      // if (eventMarket.length > 0) {
      //   // eventMarket.forEach((updatedItem) => {
      //   for (const updatedItem of eventMarket) {
      //     let index = global.tblEventMarketsV2.findIndex(
      //       (item) => item.eventMarketId === updatedItem.marketId
      //     );
      //     if (index !== -1) {
      //       global.tblEventMarketsV2[index] = {
      //         ...global.tblEventMarketsV2[index],
      //         ...updatedItem,
      //       };
      //     }
      //   };
      //   // });
      // }

      // global.tblMarketRunnerV2
      //   .filter((elem) => eventMarket.some((e) => e.marketId === elem.eventMarketId))
      //   .forEach((elem) => {
      //     elem.selectionStatus = EventMarketStatus.Close;
      //   });

      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await
      // if (isCallPredict == true) {
      // await callPredictorMarket(
      //   {
      //     commentary_id: commentaryDetails.commentaryId,
      //   },
      //   "/api/v1/endcommentary",
      //   fastify,
      //   request,
      //   pythonURI
      // ).catch((err) => {
      //   console.log("222---", err)
      //   errorLogger(
      //     fastify,
      //     err.message,
      //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //     request
      //   );
      // });
      try {
        await callPredictorMarket(
          {
            commentary_id: commentaryDetails.commentaryId,
          },
          "/api/v1/endcommentary",
          fastify,
          request,
          pythonURI
        )
      } catch (error) {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      }
      // }
      // let competition = global.tblCompetitions.find(
      //   (item) => item.competitionId === commentaryDetails.competitionId
      // );
      // // await notiConfigContentReplaceService(EventName.EVENTCOMPLETED, commentaryData.commentaryId, request, fastify);
      // if (competition.isEventSnap == true) {
      //   setCompEventSnapSerice([{
      //     commentaryId: commentaryDetails.commentaryId,
      //     eventRefId: commentaryDetails.eventRefId,
      //     competitionId: commentaryDetails.competitionId,
      //     eventTypeId: commentaryDetails.eventTypeId,
      //   }], request, fastify)
      //     .catch((err) => {
      //       console.log("setCompEventSnapSerice console", err);
      //       errorLogger(
      //         fastify,
      //         err.message,
      //         "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setCompEventSnapSerice",
      //         request
      //       );
      //     });
      // }
      // if (competition.isPointTable == true && commentaryDetails.isTest == false) {
      //   setTeamPointService([{
      //     commentaryId: commentaryDetails.commentaryId,
      //     competitionId: commentaryDetails.competitionId,
      //     team1Id: commentaryDetails.team1Id,
      //     team2Id: commentaryDetails.team2Id,
      //     winnerId: commentaryDetails.winnerId,
      //   }], request, fastify)
      //     .catch((err) => {
      //       console.log("setTeamPointService console", err);
      //       errorLogger(
      //         fastify,
      //         err.message,
      //         "ERROR --> services/commentary.js/setTeamPointServicsyncCommentaryStatsWithAPIAndSocket - setTeamPointService",
      //         request
      //       );
      //     })
      // }
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
            commentaryId : commentaryData.commentaryId
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
      });
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
    if (
      previousCommentaryStatus != statusToUpdate &&
      commentaryData?.isPredictMarket == true
    ) {
      callDataProvider(
        {
          commentaryId: commentaryData?.commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: statusToUpdate == 4 ? "close" : "update",
        },
        fastify
      ).catch((err) => {
        console.log("call Data Provider console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/saveComVirtual",
          request
        );
      });
    }
    let strikeTeam;
    strikeTeam = global.tblCommentaryTeams.find(
      (item) =>
        item?.commentaryId === commentaryData.commentaryId &&
        item.teamStatus === 1
    );
    // if (deleteCommentaryBallByBallId || deleteOverId) {
    //   const clientInRoom = global.socketIo.sockets.adapter.rooms.get(`score-${commentaryId}`);
    //   if (clientInRoom?.size) {
    //     global.socketIo.to(`score-${commentaryId}`).emit("undoCalled", {
    //       commentaryId: commentaryId,
    //       message: "Undo called for this commentary."
    //     });
    //   }
    // }
    // if (isEndInnings && isEndInnings == true && isCallPredict == true) {
    if (isEndInnings && isEndInnings == true && commentaryData?.isPredictMarket == true) {
      //_resFromPredictAPI = null;
      //_resFromPredictAPI = await

      // await callPredictorMarket(
      //   {
      //     commentary_id: commentaryData.commentaryId,
      //     match_type_id: commentaryData.matchTypeId,
      //     strike_team_id: strikeTeamForEndInnings.teamId,
      //   },
      //   "/api/v1/endinnings",
      //   fastify,
      //   request,
      //   pythonURI
      // ).catch((err) => {
      //   console.log("errorrrrrr", err)
      //   errorLogger(
      //     fastify,
      //     err.message,
      //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //     request
      //   );
      // });

      try {
        await callPredictorMarket(
          {
            commentary_id: commentaryData.commentaryId,
            match_type_id: commentaryData.matchTypeId,
            strike_team_id: strikeTeamForEndInnings.teamId,
          },
          "/api/v1/endinnings",
          fastify,
          request,
          pythonURI
        )
      } catch (error) {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      }
      // let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
      // let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
      // let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
      //     // let isVirtual = commentaryData.isVirtual || false;
      // callPredictorMarket(
      //   {
      //     commentary_id: commentaryData.commentaryId,
      //     match_type_id: commentaryData.matchTypeId,
      //     event_id: commentaryData.eventRefId,
      //     default_ball_faced: parseInt(key1?.value) || 0,
      //     default_player_boundaries: parseInt(key2?.value) || 0,
      //     default_player_runs: parseInt(key3?.value) || 0
      //   },
      //   "/api/v1/loadcommentary",
      //   fastify,
      //   request,
      //   pythonURI
      // ).catch((err) => {
      //   errorLogger(
      //     fastify,
      //     err.message,
      //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //     request
      //   );
      // });
    }
    commentaryLogger(
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
        apiName: "/ballByBall",
        reqStartTime: startTime,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveComVirtual",
        request
      );
    });
    // response.callPredictions = callPredictions;
    return response;
  } catch (error) {
    console.log(new Date(), "console value 7418596", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/commentary.js/saveComVirtual-error",
      request
    );
    try {
      await commentaryLogger(
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
          apiName: "/ballByBall",
          reqStartTime: startTime,
        },
        request,
        fastify
      );
    } catch (err) {
      console.log(new Date(), "commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveComVirtual",
        request
      );
    }
    throw error;
  }
};
const commentaryStartService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comStart";
  try {
    const {
      commentaryId,
      commentaryDetails,
      commentaryPlayers,
      commentaryOvers,
      commentaryBallByBall,
      commentaryPartnership,
    } = request.body;
    let comI, overI, partnerI, ballbyballI;
    let sendPrePlayers = [];
    let previousCommentaryStatus, statusToUpdate;

    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
    }
    for (let p of commentaryPlayers) {
      const index = global.tblCommentaryPlayers.findIndex(
        (item) => item.commentaryPlayerId === p.commentaryPlayerId
      );
      if (index === -1) {
        throw new Error("Commentary Player with this id not Found");
      }
    }
    // check over
    const indexTeam = global.tblCommentaryTeams.findIndex(
      (item) =>
        item?.commentaryId === commentaryOvers.commentaryId &&
        item.teamId === commentaryOvers.teamId
    );

    if (indexTeam === -1) {
      throw new Error("Over Team with this id not Found");
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
    // validate ballbyball
    ballbyballI = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryBallByBall.commentaryId
    );
    if (ballbyballI === -1) {
      throw new Error("BallByBall Commentary with this id not Found");
    }

    partnerI = global.tblCommentaries.findIndex(
      (item) => item?.commentaryId === commentaryPartnership.commentaryId
    );
    if (partnerI === -1) {
      throw new Error("Partnership Commentary with this id not Found");
    }
    let updatedData = await fastify.db.query(
      `CALL proc_commentary_start(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )`,
      {
        bind: [
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? commentaryOvers : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          null, // commentaryPartnershipDetails,
          null, // commentaryDetailsDetails,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    updatedData = updatedData[0];
    let response = {};
    let sendToSocket = {};
    sendToSocket.commentaryId = commentaryId;
    sendToSocket.eventRefId = commentaryData.eventRefId;
    sendToSocket.dataToUpdate = [];

    if (commentaryDetails) {
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      sendToSocket.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: { ...global.tblCommentaries[comI], ...weatherAndPitchData },
      });
    }
    if (previousCommentaryStatus != statusToUpdate) {
      const cData = await getMatchDataByCId(
        {
          commentaryId: commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
        },
        request,
        fastify
      );
      if (commentaryData?.isPredictMarket == true) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update",
          },
          fastify
        );
      }
    }
    if (commentaryPlayers.length > 0) {
      let socketPlayer = [];
      for (let p of commentaryPlayers) {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId == p.commentaryPlayerId
        );
        if (index !== -1) {
          global.tblCommentaryPlayers[index] = {
            ...global.tblCommentaryPlayers[index],
            isPlay: p.isPlay,
            onStrike: p.onStrike,
            bowlerOver: p.bowlerOver,
            isBatterOut: p.isBatterOut,
            batterOrder: p.batterOrder,
            bowlerOrder: p.bowlerOrder,
          };
        }
        let prePlayer = {};
        if (p.isPlay == true && p.onStrike != null) {
          prePlayer.player_id = p.commentaryPlayerId;
          prePlayer.player_name = p.playerName;
          prePlayer.team_id = p.teamId;
          prePlayer.batRun = p.batRun || "0";
          prePlayer.isWicket = p.isBatterOut === false ? 0 : 1;
          prePlayer.current_boundaries =
            (isNaN(parseInt(p.batFour ?? 0, 10))
              ? 0
              : parseInt(p.batFour ?? 0, 10)) +
            (isNaN(parseInt(p.batSix ?? 0, 10))
              ? 0
              : parseInt(p.batSix ?? 0, 10));
          prePlayer.balls_faced = p.batBall || 0;
          sendPrePlayers.push(prePlayer);
        }
        let ds = global.tblPlayers.find((i) => i.playerId == p.playerId);
        socketPlayer.push({ ...p, displayName: ds.displayName });
      }
      sendToSocket.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: socketPlayer,
      });
    }
    if (commentaryOvers && updatedData.overDetails) {
      global.tblOvers.push(updatedData.overDetails);
      sendToSocket.dataToUpdate.push({
        module: "commentaryOvers",
        type: "create",
        data: updatedData.overdetails,
      });
    }
    if (commentaryBallByBall && updatedData.commentaryBallByBallDetails) {
      global.tblCommentaryBallByBall.push(
        updatedData.commentaryBallByBallDetails
      );
      sendToSocket.dataToUpdate.push({
        module: "commentaryBallByBall",
        type: "create",
        data: {
          ...updatedData.commentaryBallByBallDetails,
          overCount:
            updatedData.commentaryBallByBallDetails.overCount !== null
              ? updatedData.commentaryBallByBallDetails.overCount.toString()
              : null,
        },
      });
    }
    if (commentaryPartnership && updatedData.commentaryPartnershipDetails) {
      global.tblCommentaryPartnership.push(
        updatedData.commentaryPartnershipDetails
      );
      let partnership = updatedData.commentaryPartnershipDetails;
      const _player1 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === partnership.batter1Id
      );
      if (_player1) {
        partnership.player1image = _player1.playerimage;
        partnership.player1jerseyandimage = _player1?.jerseyPlayerImage;
        partnership.player1jerseyandimagepath = _player1?.jerseyPlayerImagePath;
      }
      // Find player 2 image
      const _player2 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === partnership.batter2Id
      );
      if (_player2) {
        partnership.player2image = _player2.playerimage;
        partnership.player2jerseyandimage = _player2?.jerseyPlayerImage;
        partnership.player2jerseyandimagepath = _player2?.jerseyPlayerImagePath;
      }
      sendToSocket.dataToUpdate.push({
        module: "commentaryPartnership",
        type: "create",
        data: partnership,
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
            commentaryId : commentaryData.commentaryId

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
      });

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendToSocket);
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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    return "success";
  } catch (error) {
    console.log(error);
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const commentaryTossService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comToss";
  try {
    const {
      commentaryId,
      commentaryDetails,
      commentaryTeams,
      isCallPredict = false,
    } = request.body;
    let comI;
    let previousCommentaryStatus, statusToUpdate;
    let pythonURI;
    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
      pythonURI = commentaryData?.pythonURI ?? null;
    }
    if (commentaryTeams) {
      for (let t of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === t.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_commentary_toss(
      $1, $2, $3
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    updatedData = updatedData[0];
    let response = {};
    let sendToSocket = {};
    sendToSocket.commentaryId = commentaryId;
    sendToSocket.eventRefId = commentaryData.eventRefId;
    sendToSocket.dataToUpdate = [];

    if (commentaryDetails) {
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        modifyDate: commentaryDetails.modifyDate,
        commentaryStatus: commentaryDetails.commentaryStatus,
        tossWonBy: commentaryDetails.tossWonBy,
        choseTo: commentaryDetails.choseTo,
        tossRmk: commentaryDetails.tossRmk,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      sendToSocket.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: { ...global.tblCommentaries[comI], ...weatherAndPitchData },
      });
      notiConfigContentReplaceService(
        EventName.WINTOSS,
        commentaryDetails.commentaryId,
        request,
        fastify
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService/notiConfigContentReplaceService",
          request
        );
      });
      callDataProvider(
        {
          commentaryId: commentaryId,
          serviceType: ServiceType.dataProviderAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          type: statusToUpdate == 4 ? "close" : "update",
        },
        fastify
      );
      const cData = await getMatchDataByCId(
        {
          commentaryId: commentaryId,
        },
        request,
        fastify
      );

      callClientAPI(
        {
          serviceType: ServiceType.clientAPI,
          moduleType: APIEndpointModuleType.commentaryUpdate,
          data: cData,
        },
        request,
        fastify
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService",
          request
        );
      });
    }
    if (commentaryTeams.length > 0) {
      let teams = [];
      for (let t of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === t.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          teamStatus: t.teamStatus,
          teamBattingOrder: t.teamBattingOrder,
        };
        teams.push({
          ...global.tblCommentaryTeams[index],
          crr: parseFloat(global.tblCommentaryTeams[index].crr) || 0,
          rrr: parseFloat(global.tblCommentaryTeams[index].rrr) || 0,
        });
      }
      sendToSocket.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: teams,
      });
    }
    if (
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
          "ERROR --> services/commentary.js/commentaryTossService",
          request
        );
      });
      if (isCallPredict == true) {
        let key1 = global.tblConfigs.find(
          (item) => item.key === configConstants.DEFAULTBALLFACED
        );
        let key2 = global.tblConfigs.find(
          (item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES
        );
        let key3 = global.tblConfigs.find(
          (item) => item.key === configConstants.DEFAULTPLAYERRUNS
        );
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
          request,
          pythonURI
        ).catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/commentaryTossService",
            request
          );
        });
      }
      setLineRatioInComService(
        {
          commentaryId: commentaryDetails.commentaryId,
          matchTypeId: commentaryData.matchTypeId,
        },
        request,
        fastify
      ).catch((err) => {
        console.log("setLineRatioInComService console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService/setLineRatioInComService",
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
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService",
          request
        );
      });

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendToSocket);
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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    return "success";
  } catch (error) {
    console.log("wrrr", error);
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const commentaryScoreService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comScore";
  try {
    let {
      commentaryId,
      commentaryDetails,
      commentaryTeams,
      commentaryPartnership,
      commentaryPlayers,
      commentaryBallByBall,
      commentaryOvers,
      isCallPredict = false,
    } = request.body;
    let comI,
      overIndex,
      ballByBallIndex,
      partnershipIndex;
    let previousCommentaryStatus, statusToUpdate;
    let sendPartnership = [];
    let _sendPrePlayers = [];
    let pythonURI;
    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
      pythonURI = commentaryData?.pythonURI || null;
    }
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
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

    let updatedData = await fastify.db.query(
      `CALL proc_commentary_scoring(
      $1, $2, $3, $4,$5,$6,$7,$8,$9,$10
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null,
          null,
          null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    updatedData = updatedData[0];
    let response = {};
    let sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];

    if (commentaryDetails) {
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        displayStatus: commentaryDetails.displayStatus,
        rmk: commentaryDetails.rmk,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: { ...global.tblCommentaries[comI], ...weatherAndPitchData },
      });
    }
    if (commentaryTeams.length > 0) {
      let teams = [];
      response.commentaryTeams = [];
      for (let t of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === t.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          teamWicket: t.teamWicket,
          teamScore: t.teamScore,
          crr: t.crr,
          teamOver: t.teamOver,
          rrr: t.rrr,
        };
        teams.push({
          ...global.tblCommentaryTeams[index],
          crr: parseFloat(global.tblCommentaryTeams[index].crr) || 0,
          rrr: parseFloat(global.tblCommentaryTeams[index].rrr) || 0,
        });
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: teams,
      });
    }
    if (commentaryPlayers.length > 0) {
      response.commentaryPlayers = [];
      for (let player of commentaryPlayers) {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      }
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
        _sendPrePlayer.balls_faced = player.batBall || 0;
        _sendPrePlayers.push(_sendPrePlayer);
      });
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }
    if (
      updatedData.commentaryBallByBallDetails &&
      commentaryData.isPredictMarket &&
      updatedData.commentaryBallByBallDetails.ballType != 0 &&
      updatedData.commentaryBallByBallDetails.ballType != 8 &&
      isCallPredict == true
    ) {
      let strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 1
      );
      let nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 2
      );
      let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      let _wkt = commentaryBallByBall.ballIsWicket;
      let partnership = commentaryPartnership;
      let boundary = partnership?.totalSix + partnership?.totalFour;
      sendPartnership.push({
        partnership_no: global.tblCommentaryPartnership[partnershipIndex]?.order || 0,
        partnership_boundaries: boundary,
      });

      const predictionPayload = {
        playerpredictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount || 0,
          player_details: _sendPrePlayers,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          partnership_details: sendPartnership,
        },
        predictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          ball: decimalOverCount,
          run: commentaryBallByBall.ballRun,
          total_score: strikeTeam.teamScore,
          strike_team_id: strikeTeam.teamId,
          wicket: _wkt === true ? 1 : 0,
          total_wicket: strikeTeam.teamWicket,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          ballType: commentaryBallByBall?.ballType ?? null,
          target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
        },
        commentary_id: commentaryId,
      };
      let isNodePrediction =
        global.tblConfigs.find(
          (item) => item.key === configConstants.ISPREDICATIONFROMNODE
        )?.value || "false";
      if (isNodePrediction == "true")
        processPredictScoreMarket(predictionPayload);
      else
        callPredictorMarket(
          predictionPayload,
          "/api/v1/predictscore",
          fastify,
          request,
          pythonURI
        );
    }
    // check over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      } else {
        global.tblOvers[overIndex] = {
          ...global.tblOvers[overIndex],
          ballCount: commentaryOvers.ballCount,
          totalRun: commentaryOvers.totalRun,
          totalFour: commentaryOvers.totalFour,
          totalSix: commentaryOvers.totalSix,
          dotBall: commentaryOvers.dotBall,
        };
        response.overdetails = global.tblOvers[overIndex];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    // check ballbyball
    if (commentaryBallByBall) {
      if (commentaryBallByBall.commentaryBallByBallId == 0) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "create",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(
              commentaryId,
              updatedData.commentaryBallByBallDetails,
              fastify
            );
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create",
                });
              }
            }
          }
        }
      } else {
        global.tblCommentaryBallByBall[ballByBallIndex] = {
          ...global.tblCommentaryBallByBall[ballByBallIndex],
          batStrikeId: commentaryBallByBall.batStrikeId,
          batNonStrikeId: commentaryBallByBall.batNonStrikeId,
          ballIsCount: commentaryBallByBall.ballIsCount,
          ballType: commentaryBallByBall.ballType,
          ballIsDot: commentaryBallByBall.ballIsDot,
          ballRun: commentaryBallByBall.ballRun,
          ballIsBoundry: commentaryBallByBall.ballIsBoundry,
          ballFour: commentaryBallByBall.ballFour,
          ballSix: commentaryBallByBall.ballSix,
        };
        response.commentaryBallByBallDetails =
          global.tblCommentaryBallByBall[ballByBallIndex];

        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
        if (response.commentaryBallByBallDetails.ballType > 0) {
          let _bory = commentaryBallByBall.ballIsBoundry;
          if (_bory == true) {
            let boundaryType;
            let ballRun = response.commentaryBallByBallDetails.ballRun;
            if (ballRun == 4) {
              boundaryType = ballRun;
            }
            if (ballRun == 6) {
              boundaryType = ballRun;
            }
            await notiConfigContentReplaceService(
              EventName.BOUNDARY,
              commentaryData.commentaryId,
              request,
              fastify,
              boundaryType
            );
          }
          const isFDS = global.tblConfigs.find(
            (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
          ).value;
          if (isFDS && isFDS == "true") {
            if (_bory) {
              callfds(
                {
                  Id: 0,
                  EventId: parseInt(commentaryData.eventRefId),
                  BWDateTime: "",
                  Type: _bory === true ? "2" : "",
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
        }
      }
    }
    // check partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        const partnership = response.commentaryPartnershipDetails;
        // Find player 1 image
        const _player1 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === partnership.batter1Id
        );
        if (_player1) {
          response.commentaryPartnershipDetails.player1image =
            _player1.playerimage;
          response.commentaryPartnershipDetails.player1jerseyandimage =
            _player1?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player1jerseyandimagepath =
            _player1?.jerseyPlayerImagePath;
        }
        const _player2 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === partnership.batter2Id
        );
        if (_player2) {
          response.commentaryPartnershipDetails.player2image =
            _player2.playerimage;
          response.commentaryPartnershipDetails.player2jerseyandimage =
            _player2?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player2jerseyandimagepath =
            _player2?.jerseyPlayerImagePath;
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] = {
          ...global.tblCommentaryPartnership[partnershipIndex],
          totalRuns: commentaryPartnership.totalRuns,
          totalBalls: commentaryPartnership.totalBalls,
          batter1Balls: commentaryPartnership.batter1Balls,
          batter2Balls: commentaryPartnership.batter2Balls,
          batter1Runs: commentaryPartnership.batter1Runs,
          batter2Runs: commentaryPartnership.batter2Runs,
          totalFour: commentaryPartnership.totalFour,
          totalSix: commentaryPartnership.totalSix,
        };
        response.commentaryPartnershipDetails =
          global.tblCommentaryPartnership[partnershipIndex];

        // Find player 1 image
        const _player1 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === commentaryPartnership.batter1Id
        );
        if (_player1) {
          response.commentaryPartnershipDetails.player1image =
            _player1.playerimage;
          response.commentaryPartnershipDetails.player1jerseyandimage =
            _player1?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player1jerseyandimagepath =
            _player1?.jerseyPlayerImagePath;
        }
        const _player2 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === commentaryPartnership.batter2Id
        );
        if (_player2) {
          response.commentaryPartnershipDetails.player2image =
            _player2.playerimage;
          response.commentaryPartnershipDetails.player2jerseyandimage =
            _player2?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player2jerseyandimagepath =
            _player2?.jerseyPlayerImagePath;
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });
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
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService",
          request
        );
      });

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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    return response
  } catch (error) {
    console.log("wrrr", error);
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const commentaryOverStartService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comOverStart";
  try {
    let {
      commentaryId,
      commentaryBallByBall,
      commentaryOvers,
      commentaryPlayers,
      isCallPredict = false,
    } = request.body;
    let comI,
      overIndex,
      ballByBallIndex;

    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
    let updatedData = await fastify.db.query(
      `CALL proc_generate_over(
        $1 , $2 , $3 ,$4 ,$5,$6
      )`,
      {
        bind: [
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryId,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          null,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    // if got object then push in global obj else update the global
    updatedData = updatedData[0];
    const response = {};
    let sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];

    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      }
      else {
        response.overdetails = global.tblOvers[overIndex];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    if (commentaryBallByBall) {
      if (commentaryBallByBall.commentaryBallByBallId == 0) {
        global.tblCommentaryBallByBall.push(
          updatedData.commentaryBallByBallDetails
        );
        response.commentaryBallByBallDetails =
          updatedData.commentaryBallByBallDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "create",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
      }
      else {
        response.commentaryBallByBallDetails =
          global.tblCommentaryBallByBall[ballByBallIndex]
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        })
      }
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          isPlay: player.isPlay,
          onStrike: player.onStrike,
          batterOrder: player.batterOrder,
          bowlerOrder: player.bowlerOrder,
          bowlerOver: player.bowlerOver
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
          isPlay: player.isPlay,
          onStrike: player.onStrike,
          batterOrder: player.batterOrder,
          bowlerOrder: player.bowlerOrder,
          bowlerOver: player.bowlerOver
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );

      try {
        commentaryPlayers.forEach(async (player) => {
          if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
            player.bowlerOver = player.bowlerOver.toString();
          }
          if (player.bowlerEconomy === "NaN") {
            player.bowlerEconomy = null;
          }
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
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
            commentaryId : commentaryData.commentaryId

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
      });

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

    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const commentarySwapPlayerService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comSwapPlayer";
  try {
    let {
      commentaryId,
      commentaryPlayers,
      commentaryPartnership,
      commentaryDetails,
      isCallPredict = false,
    } = request.body;
    let comI,
      partnershipIndex,
      commentaryIndex;

    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
    //validate partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        partnershipIndex = global.tblCommentaries.findIndex(
          (item) => item?.commentaryId === commentaryPartnership.commentaryId
        );
        if (partnershipIndex === -1) {
          throw new Error("Commentary with this id not Found in Partnership");
        }
      } else {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }
    let updatedData = await fastify.db.query(
      `CALL proc_swap_player(
      $1, $2, $3, $4, $5
    )`,
      {
        bind: [
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null
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
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: new Date(),
        rmk: commentaryDetails.rmk
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[comI],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: new Date(),
        rmk: commentaryDetails.rmk,
        ...weatherAndPitchData,
      };
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });

      }
    }
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: commentaryData.eventRefId,
            commentaryId : commentaryData.commentaryId
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
      });
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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response;

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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const commentaryInningChangeService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comInningChange"
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryPartnership,
      commentaryDetails,
      commentaryId,
      isEndInnings,
      isCallPredict = false,
    } = request.body;

    let commentaryIndex,
      partnershipIndex,
      commentaryData;
    let _sendPrePlayers = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
    }
    let previousCommentaryStatus, statusToUpdate;
    let strikeTeamForEndInnings;
    if (isEndInnings && isEndInnings == true) {
      strikeTeamForEndInnings = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryId &&
          item.teamStatus === 1 &&
          item.currentInnings === commentaryData.currentInnings
      );
      await notiConfigContentReplaceService(
        EventName.INNINGCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );
    }
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
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }
    let updatedData = await fastify.db.query(
      `CALL proc_inningchange(
      $1, $2, $3, $4, $5, $6
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
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
        modifyDate: new Date(),
        commentaryStatus: commentaryDetails.commentaryStatus,
        rmk: commentaryDetails.rmk
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        ...weatherAndPitchData,
      }
      if (
        previousCommentaryStatus != statusToUpdate &&
        commentaryData?.isPredictMarket == true
      ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update",
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
        const cData = await getMatchDataByCId(
          {
            commentaryId: commentaryId,
          },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData,
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
        };
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
      });
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          isPlay: player.isPlay,
          onStrike: player.onStrike
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
        {
          ...global.tblCommentaryPartnership[partnershipIndex],
          isActive: commentaryPartnership.isActive
        }
        response.commentaryPartnershipDetails =
          global.tblCommentaryPartnership[partnershipIndex];

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPlayers",
            type: "update",
            data: response.commentaryPlayers,
          });
        }
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
            commentaryId : commentaryData.commentaryId

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

    if (isEndInnings && isEndInnings == true && isCallPredict == true) {
      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          strike_team_id: strikeTeamForEndInnings.teamId,
        },
        "/api/v1/endinnings",
        fastify,
        request,
        pythonURI
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
    }
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response;
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    throw new Error(error.message)
  }
}
const getPitchAndSessionService = async (request, fastify) => {
  const { commentaryId } = request.body;

  const result = global.tblCommentaries.find(item =>
    item.commentaryId === commentaryId
  );
  if (!result) {
    throw new Error("Commentary with this id not found");
  }
  return {
    pitchAge: result.pitchAge,
    session: result.session
  };
};

const updatePitchAndSessionService = async (request, fastify) => {
  const { commentaryId, pitchAge, session } = request.body;
  const result = global.tblCommentaries.find(item =>
    item.commentaryId === commentaryId
  );
  if (!result) {
    throw new Error("Commentary with this id not found");
  }
  const data = {
    pitchAge: pitchAge ?? result.pitchAge,
    session: session ?? result.session,
    commentaryId: commentaryId,
  };
  await updatePitchageAndSessionQuery(data, fastify, request);
  const index = global.tblCommentaries.findIndex(elem => elem.commentaryId === commentaryId);
  if (index !== -1) {
    global.tblCommentaries[index] = {
      ...result,
      pitchAge: data.pitchAge,
      session: data.session,
    };
  }
  return "Commentary updated successfully";
};
const commentaryWicketService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comWicket";
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryOvers,
      commentaryBallByBall,
      commentaryWicket,
      commentaryPartnership,
      commentaryDetails,
      commentaryId,
      isCallPredict = false,
    } = request.body;
    let commentaryIndex,
      overIndex,
      ballByBallIndex,
      wicketIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI || null;
    }
    if (commentaryDetails) {
      commentaryIndex = global.tblCommentaries.findIndex(
        (item) => item?.commentaryId === commentaryDetails.commentaryId
      );
      if (commentaryIndex === -1) {
        throw new Error("Commentary with this id not Found");
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
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }
    let updatedData = await fastify.db.query(
      `CALL proc_set_wicket(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12,$13
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
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          null, // commentaryWicketDetails,
          null, // commentaryPartnershipDetails,
          null // commentaryDetailsDetails,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );


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
        updateTime: new Date(),
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        displayStatus: commentaryDetails.displayStatus,
        updateTime: new Date(),
        ...weatherAndPitchData,
      };
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
        };
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
      });
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player,
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }
    if (
      updatedData.commentaryBallByBallDetails &&
      commentaryData.isPredictMarket &&
      updatedData.commentaryBallByBallDetails.ballType != 0 &&
      updatedData.commentaryBallByBallDetails.ballType != 8 &&
      isCallPredict == true
    ) {
      let strikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 1
      );
      let nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) =>
          item?.commentaryId === commentaryBallByBall.commentaryId &&
          item.teamStatus === 2
      );

      let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
      let _wkt = commentaryBallByBall.ballIsWicket;
      let partnership = updatedData.commentaryPartnershipDetails;
      let boundary = partnership?.totalSix || 0 + partnership?.totalFour || 0;
      if (partnership)
        sendPartnership.push({
          partnership_no: partnership?.order || 0,
          partnership_boundaries: boundary
        })

      const predictionPayload = {
        playerpredictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          event_id: commentaryData.eventRefId,
          current_team_id: strikeTeam.teamId,
          total_score: strikeTeam.teamScore,
          current_ball: decimalOverCount || 0,
          player_details: _sendPrePlayers,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          partnership_details: sendPartnership,
        },
        predictscore: {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          ball: decimalOverCount,
          run: commentaryBallByBall.ballRun,
          total_score: strikeTeam.teamScore,
          strike_team_id: strikeTeam.teamId,
          wicket: _wkt === true ? 1 : 0,
          total_wicket: strikeTeam.teamWicket,
          ball_by_ball_id: updatedData.commentaryBallByBallDetails
            .commentaryBallByBallId
            ? parseInt(
              updatedData.commentaryBallByBallDetails.commentaryBallByBallId
            )
            : null,
          ballType: commentaryBallByBall?.ballType ?? null,
          target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
        },
        commentary_id: commentaryId,
      };
      let isNodePrediction =
        global.tblConfigs.find(
          (item) => item.key === configConstants.ISPREDICATIONFROMNODE
        )?.value || "false";
      if (isNodePrediction == "true")
        processPredictScoreMarket(predictionPayload, fastify)
      else
        callPredictorMarket(
          predictionPayload,
          "/api/v1/predictscore",
          fastify,
          request,
          pythonURI
        );
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
        global.tblOvers[overIndex] = {
          ...global.tblOvers[overIndex],
          ...commentaryOvers,
        }
        response.overdetails = global.tblOvers[overIndex];
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
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });

        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(
              commentaryId,
              updatedData.commentaryBallByBallDetails,
              fastify
            );
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create",
                });
              }
            }
          }
        }
      } else {
        global.tblCommentaryBallByBall[ballByBallIndex] = {
          ...global.tblCommentaryBallByBall[ballByBallIndex],
          ...commentaryBallByBall,
        };
        response.commentaryBallByBallDetails = global.tblCommentaryBallByBall[
          ballByBallIndex
        ];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
      }
      // call Third Party API
      if (response.commentaryBallByBallDetails.ballType > 0) {
        try {
          let _wkt = commentaryBallByBall.ballIsWicket;
          let _bory = commentaryBallByBall.ballIsBoundry;
          if (_bory == true) {
            let boundaryType;
            let ballRun = response.commentaryBallByBallDetails.ballRun;
            if (ballRun == 4) {
              boundaryType = ballRun;
            }
            if (ballRun == 6) {
              boundaryType = ballRun;
            }

            await notiConfigContentReplaceService(
              EventName.BOUNDARY,
              commentaryData.commentaryId,
              request,
              fastify,
              boundaryType
            );
          }
          const isFDS = global.tblConfigs.find(
            (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
          ).value;
          if (isFDS && isFDS == "true") {
            if (_wkt || _bory) {
              callfds(
                {
                  Id: 0,
                  EventId: parseInt(commentaryData.eventRefId),
                  BWDateTime: "",
                  Type: _bory === true ? "2" : _wkt === true ? "1" : "",
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
          console.log("error in console:", error);
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
        global.tblCommentaryWicket[wicketIndex] = {
          ...global.tblCommentaryWicket[wicketIndex],
          ...commentaryWicket,
        }
        response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryWicket",
          type: "update",
          data: response.commentaryWicketDetails,
        });
      }
      await notiConfigContentReplaceService(
        EventName.WICKET,
        commentaryData.commentaryId,
        request,
        fastify,
        response.commentaryWicketDetails?.commentaryWicketId,
      );
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });

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
      });
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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response;


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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
}
const commentarySetPlayerService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/comSetPlayer";
  try {
    let {
      commentaryPlayers,
      commentaryBallByBall,
      commentaryPartnership,
      commentaryId,
      isCallPredict = false,
    } = request.body;
    let commentaryIndex,
      ballByBallIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let sendPartnership = [];
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
    }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }
    let updatedData = await fastify.db.query(
      `CALL proc_set_player(
      $1, $2, $3, $4, $5, $6
    )`,
      {
        bind: [
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryId,
          null, // partnershipDetails,
          null // commentaryBallByBallDetails
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );


    updatedData = updatedData[0];
    const response = {};
    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];

    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player,
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
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
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });

        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(
              commentaryId,
              updatedData.commentaryBallByBallDetails,
              fastify
            );
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create",
                });
              }
            }
          }
        }
      } else {
        global.tblCommentaryBallByBall[ballByBallIndex] = {
          ...global.tblCommentaryBallByBall[ballByBallIndex],
          ...commentaryBallByBall,
        };
        response.commentaryBallByBallDetails = global.tblCommentaryBallByBall[
          ballByBallIndex
        ];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });

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
            commentaryId : commentaryData.commentaryId

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
      });
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
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response;


  } catch (error) {
    console.log("error in commentarySetPlayerService:", error);
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
}
const updatePythonAPIOnCommentaryService = async (request, fastify) => {
  const { commentaryId, pythonId, pythonURI } = request.body;
  const commentary = global.tblCommentaries.find(item => item.commentaryId == commentaryId);
  if (!commentary) {
    throw new Error(`Commentary with this Id not found`);
  }
  await updatePythonAPIOnCommentaryQuery(request, fastify);
  const index = global.tblCommentaries.findIndex(item => item.commentaryId == commentaryId);
  if (index != -1) {
    global.tblCommentaries[index] = {
      ...global.tblCommentaries[index],
      pythonId,
      pythonURI
    }
  }
  return `Python URI updated successfully`
}
const undoAPIService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/undo";
  try {
    let {
      commentaryId,
      isCallPredict,
      commentaryOvers,
      commentaryTeams,
      deleteCommentaryBallByBallId,
      commentaryPartnership,
      commentaryDetails,
      commentaryPlayers,
    } = request.body;
    let comI, overIndex, partnershipIndex;

    const commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not found");
    }

    if (commentaryPlayers.length > 0) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) => player.commentaryPlayerId != null
      );
      for (const player of commentaryPlayers) {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        if (index === -1) throw new Error("Commentary Player with this id not Found");
      }
    }

    if (commentaryTeams?.length > 0) {
      commentaryTeams = commentaryTeams.filter(
        (team) => team.commentaryTeamId != null
      );
      for (const team of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) throw new Error("Commentary Team with this id not Found");
      }
    }

    if (commentaryPartnership) {
      partnershipIndex = global.tblCommentaryPartnership.findIndex(
        (item) => item.commentaryPartnershipId == commentaryPartnership?.commentaryPartnershipId
      );
      if (partnershipIndex === -1) {
        throw new Error("Partnership with this id not Found");
      }
    }

    comI = global.tblCommentaries.findIndex(
      (item) => item.commentaryId == commentaryId
    );

    if (commentaryOvers) {
      overIndex = global.tblOvers.findIndex(
        (item) => item.overId === commentaryOvers.overId
      );
      if (overIndex === -1) {
        throw new Error("Over with this id not Found");
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_undo_commentary(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13
      )`,
      {
        bind: [
          commentaryId,
          deleteCommentaryBallByBallId,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryPlayers.length > 0 ? JSON.stringify(commentaryPlayers) : null,
          commentaryTeams?.length > 0 ? JSON.stringify(commentaryTeams) : null,
          request.userTokenInfo?.WrUserId ?? null,
          null, null, null, null, null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    updatedData = updatedData[0];

    const ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
      item => item.commentaryBallByBall === deleteCommentaryBallByBallId
    );
    if (ballByBallIndex !== -1) {
      global.tblCommentaryBallByBall.splice(ballByBallIndex, 1);
    }

    let response = {};
    let sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];

    if (commentaryDetails) {
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        displayStatus: commentaryDetails.displayStatus,
        rmk: commentaryDetails.rmk,
        commentaryStatus: commentaryDetails.commentaryStatus,
        currentInnings: commentaryDetails.currentInnings,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: { ...global.tblCommentaries[comI], ...weatherAndPitchData },
      });
      response.commentaryDetails = global.tblCommentaries[comI];
    }
    if (commentaryTeams.length > 0) {
      let teams = [];
      response.commentaryTeams = [];
      for (let t of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === t.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          teamWicket: t.teamWicket,
          teamScore: t.teamScore,
          crr: t.crr,
          teamOver: t.teamOver,
          rrr: t.rrr,
        };
        teams.push({
          ...global.tblCommentaryTeams[index],
          crr: parseFloat(global.tblCommentaryTeams[index].crr) || 0,
          rrr: parseFloat(global.tblCommentaryTeams[index].rrr) || 0,
        });
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: teams,
      });
    }
    if (commentaryPlayers.length > 0) {
      response.commentaryPlayers = [];
      for (let player of commentaryPlayers) {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }

    // check over
    if (commentaryOvers) {
      global.tblOvers[overIndex] = {
        ...global.tblOvers[overIndex],
        ballCount: commentaryOvers.ballCount,
        totalRun: commentaryOvers.totalRun,
        totalFour: commentaryOvers.totalFour,
        totalSix: commentaryOvers.totalSix,
        dotBall: commentaryOvers.dotBall,
        teamScore: commentaryOvers.teamScore,
        isMaiden: commentaryOvers.isMaiden,
        isComplete: commentaryOvers.isComplete,
        bowlerId: commentaryOvers.bowlerId,
      }
      response.overdetails = global.tblOvers[overIndex];
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryOvers",
        type: "update",
        data: response.overdetails,
      });
    }

    // check partnership
    if (commentaryPartnership) {
      global.tblCommentaryPartnership[partnershipIndex] = {
        ...global.tblCommentaryPartnership[partnershipIndex],
        totalRuns: commentaryPartnership.totalRuns,
        totalBalls: commentaryPartnership.totalBalls,
        batter1Balls: commentaryPartnership.batter1Balls,
        batter2Balls: commentaryPartnership.batter2Balls,
        batter1Runs: commentaryPartnership.batter1Runs,
        batter2Runs: commentaryPartnership.batter2Runs,
        totalFour: commentaryPartnership.totalFour,
        totalSix: commentaryPartnership.totalSix,
      };
      response.commentaryPartnershipDetails =
        global.tblCommentaryPartnership[partnershipIndex];

      // Find player 1 image
      const _player1 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === commentaryPartnership.batter1Id
      );
      if (_player1) {
        response.commentaryPartnershipDetails.player1image =
          _player1.playerimage;
        response.commentaryPartnershipDetails.player1jerseyandimage =
          _player1?.jerseyPlayerImage;
        response.commentaryPartnershipDetails.player1jerseyandimagepath =
          _player1?.jerseyPlayerImagePath;
      }
      const _player2 = commentaryPlayers.find(
        (item) => item.commentaryPlayerId === commentaryPartnership.batter2Id
      );
      if (_player2) {
        response.commentaryPartnershipDetails.player2image =
          _player2.playerimage;
        response.commentaryPartnershipDetails.player2jerseyandimage =
          _player2?.jerseyPlayerImage;
        response.commentaryPartnershipDetails.player2jerseyandimagepath =
          _player2?.jerseyPlayerImagePath;
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPartnership",
        type: "update",
        data: response.commentaryPartnershipDetails,
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
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/undoAPIService",
          request
        );
      });

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

      global.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(res));
        }
      });
    }
    commentaryLogger(
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    response.isCallPredict = isCallPredict;
    response.deleteCommentaryBallByBallId = deleteCommentaryBallByBallId;
    response.commentaryId = commentaryId;

    return response;
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const undoAPIService2 = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/undoAPI";
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryOvers,
      commentaryPartnership,
      commentaryDetails,
      deleteCommentaryBallByBallId,
      deleteOverId,
      commentaryId,
      isCallPredict = false,
      isEndInnings = false
    } = request.body;

    let commentaryIndex,
      overIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let _resFromPredictAPI;
    let callPredictions = [];
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
    }

    let previousCommentaryStatus, statusToUpdate, balltypeOfdeleteBall;
    let strikeTeamForEndInnings;
    // if (isEndInnings && isEndInnings == true) {
    //   strikeTeamForEndInnings = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryId &&
    //       item.teamStatus === 1 &&
    //       item.currentInnings === commentaryData.currentInnings
    //   );
    //   await notiConfigContentReplaceService(
    //     EventName.INNINGCOMPLETED,
    //     commentaryData.commentaryId,
    //     request,
    //     fastify
    //   );

    //   // let data = global.tblNotificationConfig.find((elem) =>
    //   //   elem.isActive === true && elem.eventName === EventName.INNINGCOMPLETED
    //   // )
    //   // if(data && commentaryData.isActive == true && commentaryData.eventName != null) {
    //   //   data.content = data.content.replace("{}", commentaryData.eventName);
    //   //   if(
    //   //     global?.clientSocketIo !== undefined &&
    //   //     global?.clientSocketIo.length > 0
    //   //   ){
    //   //     global.clientSocketIo.forEach((socket) => {
    //   //       socket.client.emit("notificationSend", data);
    //   //     });
    //   //     let notificationData = {
    //   //       title: commentaryData.eventName,
    //   //       description: data.content,
    //   //       commentaryId: commentaryData.commentaryId,
    //   //     }
    //   //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
    //   //   }
    //   // }
    // }
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
      balltypeOfdeleteBall =
        global.tblCommentaryBallByBall[deleteBallIndex].ballType;
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
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
    // if (commentaryBallByBall) {
    //   if (commentaryBallByBall.commentaryBallByBallId == 0) {
    //     ballByBallIndex = global.tblCommentaries.findIndex(
    //       (item) => item?.commentaryId === commentaryBallByBall.commentaryId
    //     );
    //     if (ballByBallIndex === -1) {
    //       throw new Error("Commentary with this id not Found");
    //     }
    //   } else {
    //     ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
    //       (item) =>
    //         item.commentaryBallByBallId ===
    //         commentaryBallByBall.commentaryBallByBallId
    //     );
    //     if (ballByBallIndex === -1) {
    //       throw new Error("BallByBall with this id not Found");
    //     }
    //   }
    // }
    //validate wicket
    // if (commentaryWicket) {
    //   if (commentaryWicket.commentaryWicketId == 0) {
    //     wicketIndex = global.tblCommentaries.findIndex(
    //       (item) => item?.commentaryId === commentaryWicket.commentaryId
    //     );
    //     if (wicketIndex === -1) {
    //       throw new Error("Commentary with this id not Found");
    //     }
    //   } else {
    //     wicketIndex = global.tblCommentaryWicket.findIndex(
    //       (item) =>
    //         item.commentaryWicketId === commentaryWicket.commentaryWicketId
    //     );
    //     if (wicketIndex === -1) {
    //       throw new Error("Wicket with this id not Found");
    //     }
    //   }
    // }
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_undo_com_v1(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ,$12 )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? commentaryOvers : null,
          // commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          // commentaryWicket ? JSON.stringify(commentaryWicket) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          deleteCommentaryBallByBallId ? deleteCommentaryBallByBallId : null,
          deleteOverId ? deleteOverId : null,
          commentaryId,
          null, // commentaryOverDetails,
          null, // commentaryBallByBallDetails,
          deleteCommentaryBallByBallId || deleteOverId ? true : false,
          deleteCommentaryBallByBallId || deleteOverId
            ? request.userTokenInfo.WrUserId
            : null,
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
    const setEventSnap = [];
    const teamPoint = [];

    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        ...commentaryDetails
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        ...weatherAndPitchData,
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
        };
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
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
        (item) => item?.commentaryBallByBallId !== deleteCommentaryBallByBallId
      );
      try {
        _deleteBallID = {};
        _deleteBallID.commentaryBallByBallId = deleteCommentaryBallByBallId;
        _deleteBallID.commentaryId = commentaryId;
        await deleteMarketOddsBallByBall(_deleteBallID, fastify, request);
      } catch (error) {
        console.log("delete market odds ball by ball console", error);
        errorLogger(
          fastify,
          error.message,
          "ERROR --> services/commentary.js/undoAPIService2",
          request
        );
      }

      // if (commentaryBallByBall) {
      //   ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
      //     (item) =>
      //       item.commentaryBallByBallId ==
      //       commentaryBallByBall.commentaryBallByBallId
      //   );
      // }
      if (commentaryPartnership) {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item?.commentaryPartnershipId ===
            commentaryPartnership.commentaryPartnershipId
        );
      }
      // if (commentaryWicket) {
      //   wicketIndex = global.tblCommentaryWicket.findIndex(
      //     (item) =>
      //       item.commentaryWicketId === commentaryWicket.commentaryWicketId
      //   );
      // }
      // call predictscore
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 1
      );
      const nonStrikeTeam = global.tblCommentaryTeams.find(
        (item) => item?.commentaryId === commentaryId && item.teamStatus === 2
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
        if (commentaryData.isPredictMarket && isCallPredict == true) {
          //_resFromPredictAPI = null;
          const decimalOverCount = parseFloat(previousBall.overCount);
          const _wkt = previousBall.ballIsWicket;
          // let pythonURI = commentaryData.pythonURI ?? false;
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
                : null,
              ballType: previousBall?.ballType ?? null,
              target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
            },
            "/api/v1/undoscore",
            fastify,
            request,
            pythonURI
          ).catch((err) => {
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/undoAPIService2",
              request
            );
          });
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
      // if (commentaryBallByBall) {
      //   ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
      //     (item) => item.overId == commentaryBallByBall.overId
      //   );
      // }
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }
    // if (
    //   updatedData.commentaryBallByBallDetails &&
    //   commentaryData.isPredictMarket &&
    //   updatedData.commentaryBallByBallDetails.ballType != 0 &&
    //   updatedData.commentaryBallByBallDetails.ballType != 8 &&
    //   isCallPredict == true
    // ) {
    //   let strikeTeam = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryBallByBall.commentaryId &&
    //       item.teamStatus === 1
    //   );
    //   let nonStrikeTeam = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryBallByBall.commentaryId &&
    //       item.teamStatus === 2
    //   );
    //   let target = commentaryData.target ?? null; 
    //   let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
    //   let _wkt = commentaryBallByBall.ballIsWicket;
    //   let partnership = updatedData.commentaryPartnershipDetails;
    //   // console.log("partnership", partnership.totalSix || 0, partnership.totalFour || 0);
    //   let boundary = (partnership?.totalSix || 0) + (partnership?.totalFour || 0);
    //   // console.log("boundary", boundary);
    //   if (partnership)
    //     sendPartnership.push({
    //       partnership_no: partnership?.order || 0,
    //       partnership_boundaries: boundary,
    //       total_balls : partnership?.totalBalls || 0,
    //       total_runs: partnership?.totalRuns || 0,
    //     })
    //   const predictionPayload = {
    //     playerpredictscore: {
    //       commentary_id: commentaryData.commentaryId,
    //       match_type_id: commentaryData.matchTypeId,
    //       event_id: commentaryData.eventRefId,
    //       current_team_id: strikeTeam.teamId,
    //       total_score: strikeTeam.teamScore,
    //       current_ball: decimalOverCount || 0,
    //       player_details: _sendPrePlayers,
    //       ball_by_ball_id: updatedData.commentaryBallByBallDetails
    //         .commentaryBallByBallId
    //         ? parseInt(
    //             updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //           )
    //         : null,
    //       partnership_details: sendPartnership,
    //     },
    //     predictscore: {
    //       commentary_id: commentaryData.commentaryId,
    //       match_type_id: commentaryData.matchTypeId,
    //       ball: decimalOverCount,
    //       run: commentaryBallByBall.ballRun,
    //       total_score: strikeTeam.teamScore,
    //       strike_team_id: strikeTeam.teamId,
    //       wicket: _wkt === true ? 1 : 0,
    //       total_wicket: strikeTeam.teamWicket,
    //       ball_by_ball_id: updatedData.commentaryBallByBallDetails
    //         .commentaryBallByBallId
    //         ? parseInt(
    //             updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //           )
    //         : null,
    //       ballType: commentaryBallByBall?.ballType ?? null,
    //       target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1  : null,
    //     },
    //     commentary_id: commentaryId,
    //     target: target
    //   };
    //   let isNodePrediction =
    //     global.tblConfigs.find(
    //       (item) => item.key === configConstants.ISPREDICATIONFROMNODE
    //     )?.value || "false";
    //   if (isNodePrediction == "true")
    //   {
    //     processPredictScoreMarket(predictionPayload, fastify)
    //   }
    //   else{
    //     //  let isVirtual = commentaryData.isVirtual || false;
    //     callPredictorMarket(
    //       predictionPayload,
    //       "/api/v1/predictscore",
    //       fastify,
    //       request,
    //       pythonURI
    //     );
    //   }

    // }
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
            global.tblOvers[overIndex] = {
              ...global.tblOvers[overIndex],
              ...commentaryOvers
            };
          }
        }
        if (deleteOverId && commentaryOvers.overId !== deleteOverId) {
          if (overIndex !== -1) {
            global.tblOvers[overIndex] = {
              ...global.tblOvers[overIndex],
              ...commentaryOvers
            };
          }
        }
        response.overdetails = global.tblOvers[overIndex];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    // if (commentaryBallByBall) {
    //   if (updatedData.commentaryBallByBallDetails) {
    //     global.tblCommentaryBallByBall.push(
    //       updatedData.commentaryBallByBallDetails
    //     );
    //     response.commentaryBallByBallDetails =
    //       updatedData.commentaryBallByBallDetails;

    //     sendDataForSocketUpdate.dataToUpdate.push({
    //       module: "commentaryBallByBall",
    //       type: "create",
    //       data: {
    //         ...response.commentaryBallByBallDetails,
    //         overCount:
    //           response.commentaryBallByBallDetails.overCount !== null
    //             ? response.commentaryBallByBallDetails.overCount.toString()
    //             : null,
    //       },
    //     });

    //     if (updatedData.commentaryBallByBallDetails.ballType > 0) {
    //       if (!global.isSignalRStopped) {
    //         let _results = [];
    //         let result = await addinMarketBallbyballOdds(
    //           commentaryId,
    //           updatedData.commentaryBallByBallDetails,
    //           fastify
    //         );
    //         if (result) {
    //           _results.push(result);
    //           if (_results && _results.length > 0) {
    //             sendDataForSocketUpdate.dataToUpdate.push({
    //               module: "marketOddsBallByBall",
    //               data: _results,
    //               type: "create",
    //             });
    //           }
    //         }
    //       }
    //     }
    //     // if (
    //     //   commentaryData.isPredictMarket &&
    //     //   updatedData.commentaryBallByBallDetails.ballType > 0
    //     // ) {
    //     //   let strikeTeam = global.tblCommentaryTeams.find(
    //     //     (item) =>
    //     //       item?.commentaryId === commentaryBallByBall.commentaryId &&
    //     //       item.teamStatus === 1
    //     //   );

    //     //   let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
    //     //   let _wkt = commentaryBallByBall.ballIsWicket;
    //     //   callPredictorMarket(
    //     //     {
    //     //       playerpredictscore :  {
    //     //         commentary_id: commentaryData.commentaryId,
    //     //         match_type_id: commentaryData.matchTypeId,
    //     //         event_id: commentaryData.eventRefId,
    //     //         current_team_id: strikeTeam.teamId,
    //     //         total_score: strikeTeam.teamScore,
    //     //         current_ball: decimalOverCount || 0,
    //     //         player_details: _sendPrePlayers,
    //     //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //     //         ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
    //     //         : null,
    //     //         partnership_details : sendPartnership
    //     //       },
    //     //       predictscore : {
    //     //         commentary_id: commentaryData.commentaryId,
    //     //         match_type_id: commentaryData.matchTypeId,
    //     //         ball: decimalOverCount,
    //     //         run: commentaryBallByBall.ballRun,
    //     //         total_score: strikeTeam.teamScore,
    //     //         strike_team_id: strikeTeam.teamId,
    //     //         wicket: _wkt === true ? 1 : 0,
    //     //         total_wicket: strikeTeam.teamWicket,
    //     //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //     //           ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
    //     //           : null
    //     //       }
    //     //     },
    //     //     "/api/v1/predictscore",
    //     //     fastify,
    //     //     request
    //     //   )
    //     // }
    //   } else {
    //     // if(ballByBallIndex !== -1){
    //     //   global.tblCommentaryBallByBall[ballByBallIndex] = commentaryBallByBall;
    //     // }
    //     if (!deleteCommentaryBallByBallId) {
    //       // ballByBallIndex !== -1
    //       //   ? (global.tblCommentaryBallByBall[ballByBallIndex] =
    //       //       commentaryBallByBall)
    //       //   : null;
    //       if (ballByBallIndex !== -1) {
    //         global.tblCommentaryBallByBall[ballByBallIndex] =
    //           commentaryBallByBall;
    //       }
    //     }
    //     if (
    //       deleteCommentaryBallByBallId &&
    //       commentaryBallByBall.commentaryBallByBallId !==
    //         deleteCommentaryBallByBallId
    //     ) {
    //       if (ballByBallIndex !== -1) {
    //         global.tblCommentaryBallByBall[ballByBallIndex] =
    //           commentaryBallByBall;
    //       }
    //     }
    //     response.commentaryBallByBallDetails = commentaryBallByBall;
    //     sendDataForSocketUpdate.dataToUpdate.push({
    //       module: "commentaryBallByBall",
    //       type: "update",
    //       data: {
    //         ...response.commentaryBallByBallDetails,
    //         overCount:
    //           response.commentaryBallByBallDetails.overCount !== null
    //             ? response.commentaryBallByBallDetails.overCount.toString()
    //             : null,
    //       },
    //     });
    //   }
    //   // call Third Party API
    //   if (response.commentaryBallByBallDetails.ballType > 0) {
    //     try {
    //       let _wkt = commentaryBallByBall.ballIsWicket;
    //       let _bory = commentaryBallByBall.ballIsBoundry;
    //       if (_bory == true) {
    //         let boundaryType;
    //         let ballRun = response.commentaryBallByBallDetails.ballRun;
    //         if (ballRun == 4) {
    //           boundaryType = ballRun;
    //         }
    //         if (ballRun == 6) {
    //           boundaryType = ballRun;
    //         }

    //         await notiConfigContentReplaceService(
    //           EventName.BOUNDARY,
    //           commentaryData.commentaryId,
    //           request,
    //           fastify,
    //           boundaryType
    //         );
    //         // let data = global.tblNotificationConfig.find((elem) =>
    //         //   elem.isActive === true && elem.eventName === EventName.BOUNDARY
    //         // )
    //         // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
    //         //   data.content = data.content.replace("{}", commentaryData.eventName);
    //         //   if(
    //         //     global?.clientSocketIo !== undefined &&
    //         //     global?.clientSocketIo.length > 0
    //         //   ){
    //         //     global.clientSocketIo.forEach((socket) => {
    //         //       socket.client.emit("notificationSend", data);
    //         //     });
    //         //     let notificationData = {
    //         //       title: commentaryData.eventName,
    //         //       description: data.content,
    //         //       commentaryId: commentaryData.commentaryId,
    //         //     }
    //         //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
    //         //   }
    //         // }
    //       }
    //       const isFDS = global.tblConfigs.find(
    //         (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
    //       ).value;
    //       if (isFDS && isFDS == "true") {
    //         if (_wkt || _bory) {
    //           callfds(
    //             {
    //               Id: 0,
    //               EventId: parseInt(commentaryData.eventRefId),
    //               BWDateTime: "",
    //               Type: _bory === true ? "2" : _wkt === true ? "1" : "",
    //             },
    //             "/api/transactions/SaveBoundryWicket",
    //             fastify,
    //             request
    //           ).catch((err) => {
    //             errorLogger(
    //               fastify,
    //               err.message,
    //               "ERROR --> services/commentary.js/undoAPIService2",
    //               request
    //             );
    //           });
    //         }
    //       }
    //     } catch (error) {
    //       console.log("error in console:", error);
    //       errorLogger(
    //         fastify,
    //         error.message,
    //         "ERROR --> services/commentary.js/undoAPIService2",
    //         request
    //       );
    //     }
    //   }
    // }
    // if (commentaryWicket) {
    //   if (commentaryWicket.commentaryWicketId == 0) {
    //     global.tblCommentaryWicket.push(updatedData.commentaryWicketDetails);
    //     response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
    //     sendDataForSocketUpdate.dataToUpdate.push({
    //       module: "commentaryWicket",
    //       type: "create",
    //       data: response.commentaryWicketDetails,
    //     });
    //   } else {
    //     // global.tblCommentaryWicket[wicketIndex] = commentaryWicket;
    //     // response.commentaryWicketDetails = commentaryWicket;
    //     // sendDataForSocketUpdate.dataToUpdate.push({
    //     //   module: "commentaryWicket",
    //     //   type: "update",
    //     //   data: response.commentaryWicketDetails,
    //     // });
    //     if (!deleteCommentaryBallByBallId) {
    //       if (wicketIndex !== -1) {
    //         global.tblCommentaryWicket[wicketIndex] =
    //           updatedData.commentaryWicketDetails;
    //       }
    //     }
    //     if (
    //       deleteCommentaryBallByBallId &&
    //       commentaryWicket.commentaryBallByBallId !==
    //         deleteCommentaryBallByBallId
    //     ) {
    //       if (wicketIndex !== -1) {
    //         global.tblCommentaryWicket[wicketIndex] =
    //           updatedData.commentaryWicketDetails;
    //       }
    //     }
    //     response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
    //     if (
    //       deleteCommentaryBallByBallId !=
    //       commentaryWicket.commentaryBallByBallId
    //     ) {
    //       sendDataForSocketUpdate.dataToUpdate.push({
    //         module: "commentaryWicket",
    //         type: "update",
    //         data: response.commentaryWicketDetails,
    //       });
    //     }
    //   }
    //   await notiConfigContentReplaceService(
    //     EventName.WICKET,
    //     commentaryData.commentaryId,
    //     request,
    //     fastify
    //   );

    //   // let data = global.tblNotificationConfig.find((elem) =>
    //   //   elem.isActive === true && elem.eventName === EventName.WICKET
    //   // )
    //   // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
    //   //   data.content = data.content.replace("{}", commentaryData.eventName);
    //   //   if(
    //   //     global?.clientSocketIo !== undefined &&
    //   //     global?.clientSocketIo.length > 0
    //   //   ){
    //   //     global.clientSocketIo.forEach((socket) => {
    //   //       socket.client.emit("notificationSend", data);
    //   //     });
    //   //     let notificationData = {
    //   //       title: commentaryData.eventName,
    //   //       description: data.content,
    //   //       commentaryId: commentaryData.commentaryId,
    //   //     }
    //   //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
    //   //   }
    //   // }
    // }
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        if (!deleteCommentaryBallByBallId) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] =
              updatedData.commentaryPartnershipDetails;
          }
        }
        if (
          deleteCommentaryBallByBallId &&
          commentaryPartnership.commentaryBallByBallId !==
          deleteCommentaryBallByBallId
        ) {
          if (partnershipIndex !== -1) {
            global.tblCommentaryPartnership[partnershipIndex] =
              updatedData.commentaryPartnershipDetails;
          }
        }
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        if (
          deleteCommentaryBallByBallId !=
          commentaryPartnership.commentaryBallByBallId
        ) {
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "commentaryPartnership",
            type: "update",
            data: response.commentaryPartnershipDetails,
          });
        }
      }
      // let boundary = response.commentaryPartnershipDetails.totalSix + response.commentaryPartnershipDetails.totalFour;
      // sendPartnership.push({
      //   partnership_no : response.commentaryPartnershipDetails.order,
      //   partnership_boundaries : boundary
      // })
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
    // if (
    //   commentaryDetails &&
    //   commentaryData.isPredictMarket == true &&
    //   previousCommentaryStatus == 1 &&
    //   statusToUpdate == 2
    // ) {
    //   handleMarketCloseService(
    //     {
    //       commentaryId: commentaryDetails.commentaryId,
    //       inningsId: commentaryDetails.currentInnings,
    //     },
    //     request,
    //     fastify
    //   ).catch((err) => {
    //     console.log("handle market closes services console", err);
    //     errorLogger(
    //       fastify,
    //       err.message,
    //       "ERROR --> services/commentary.js/undoAPIService2",
    //       request
    //     );
    //   });
    //   //_resFromPredictAPI = null;
    //   //_resFromPredictAPI = await
    //   if (isCallPredict == true) {
    //     let isNodePrediction = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICATIONFROMNODE)?.value || "false";
    //     if (isNodePrediction !== "true") {
    //       let key1 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTBALLFACED);
    //       let key2 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERBOUNDARIES);
    //       let key3 = global.tblConfigs.find((item) => item.key === configConstants.DEFAULTPLAYERRUNS);
    //       // let isVirtual = commentaryData.isVirtual || false;
    //       //_resFromPredictAPI = await
    //       callPredictorMarket(
    //         {
    //           commentary_id: commentaryDetails.commentaryId,
    //           match_type_id: commentaryDetails.matchTypeId,
    //           event_id: commentaryDetails.eventRefId,
    //           default_ball_faced: parseInt(key1?.value) || 0,
    //           default_player_boundaries: parseInt(key2?.value) || 0,
    //           default_player_runs: parseInt(key3?.value) || 0,
    //         },
    //         "/api/v1/loadcommentary",
    //         fastify,
    //         request,
    //         pythonURI
    //       ).catch((err) => {
    //         errorLogger(
    //           fastify,
    //           err.message,
    //           "ERROR --> services/commentary.js/undoAPIService2",
    //           request
    //         );
    //       });
    //     }

    //   }
    //   setLineRatioInComService(
    //     {
    //       commentaryId: commentaryDetails.commentaryId,
    //       matchTypeId: commentaryData.matchTypeId,
    //     },
    //     request,
    //     fastify
    //   ).catch((err) => {
    //     console.log("setLineRatioInComService console", err);
    //     errorLogger(
    //       fastify,
    //       err.message,
    //       "ERROR --> services/commentary.js/setLineRatioInComService",
    //       request
    //     );
    //   });
    // }

    // if (
    //   commentaryDetails &&
    //   commentaryData.isPredictMarket == true &&
    //   statusToUpdate == 4
    // ) {
    //   const eventMarket = await closeEventMarketByCIdQuery(
    //     {
    //       commentaryId: commentaryDetails.commentaryId,
    //     },
    //     fastify
    //   );
    //   if (eventMarket.length > 0) {
    //     // eventMarket.forEach((updatedItem) => {
    //     for (const updatedItem of eventMarket) {
    //       let index = global.tblEventMarketsV2.findIndex(
    //         (item) => item.eventMarketId === updatedItem.marketId
    //       );
    //       if (index !== -1) {
    //         global.tblEventMarketsV2[index] = {
    //           ...global.tblEventMarketsV2[index],
    //           ...updatedItem,
    //         };
    //       }
    //     }
    //     // });
    //   }

    //   global.tblMarketRunnerV2
    //     .filter((elem) =>
    //       eventMarket.some((e) => e.marketId === elem.eventMarketId)
    //     )
    //     .forEach((elem) => {
    //       elem.selectionStatus = EventMarketStatus.Close;
    //     });

    //   //_resFromPredictAPI = null;
    //   //_resFromPredictAPI = await
    //   if (isCallPredict == true) {
    //     callPredictorMarket(
    //       {
    //         commentary_id: commentaryDetails.commentaryId,
    //       },
    //       "/api/v1/endcommentary",
    //       fastify,
    //       request,
    //       pythonURI
    //     ).catch((err) => {
    //       errorLogger(
    //         fastify,
    //         err.message,
    //         "ERROR --> services/commentary.js/undoAPIService2",
    //         request
    //       );
    //     });
    //   }
    //   let competition = global.tblCompetitions.find(
    //     (item) => item.competitionId === commentaryDetails.competitionId
    //   );
    //   await notiConfigContentReplaceService(
    //     EventName.EVENTCOMPLETED,
    //     commentaryData.commentaryId,
    //     request,
    //     fastify
    //   );

    //   // let data = global.tblNotificationConfig.find((elem) =>
    //   //   elem.isActive === true && elem.eventName === EventName.EVENTCOMPLETED
    //   // )
    //   // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
    //   //   data.content = data.content.replace("{}", commentaryData.eventName);
    //   //   if(
    //   //     global?.clientSocketIo !== undefined &&
    //   //     global?.clientSocketIo.length > 0
    //   //   ){
    //   //     global.clientSocketIo.forEach((socket) => {
    //   //       socket.client.emit("notificationSend", data);
    //   //     });
    //   //     let notificationData = {
    //   //       title: commentaryData.eventName,
    //   //       description: data.content,
    //   //       commentaryId: commentaryData.commentaryId,
    //   //     }
    //   //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
    //   //   }
    //   // }
    //   if (competition.isEventSnap == true) {
    //     setCompEventSnapSerice(
    //       [
    //         {
    //           commentaryId: commentaryDetails.commentaryId,
    //           eventRefId: commentaryDetails.eventRefId,
    //           competitionId: commentaryDetails.competitionId,
    //           eventTypeId: commentaryDetails.eventTypeId,
    //         },
    //       ],
    //       request,
    //       fastify
    //     ).catch((err) => {
    //       console.log("setCompEventSnapSerice console", err);
    //       errorLogger(
    //         fastify,
    //         err.message,
    //         "ERROR --> services/commentary.js/undoAPIService2 - setCompEventSnapSerice",
    //         request
    //       );
    //     });
    //   }
    //   if (
    //     competition.isPointTable == true &&
    //     commentaryDetails.isTest == false
    //   ) {
    //     setTeamPointService(
    //       [
    //         {
    //           commentaryId: commentaryDetails.commentaryId,
    //           competitionId: commentaryDetails.competitionId,
    //           team1Id: commentaryDetails.team1Id,
    //           team2Id: commentaryDetails.team2Id,
    //           winnerId: commentaryDetails.winnerId,
    //         },
    //       ],
    //       request,
    //       fastify
    //     ).catch((err) => {
    //       console.log("setTeamPointService console", err);
    //       errorLogger(
    //         fastify,
    //         err.message,
    //         "ERROR --> services/commentary.js/setTeamPointServicundoAPIService2 - setTeamPointService",
    //         request
    //       );
    //     });
    //   }
    // }

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
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/undoAPIService2",
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
    if (deleteCommentaryBallByBallId || deleteOverId) {
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(
        `score-${commentaryId}`
      );
      if (clientInRoom?.size) {
        global.socketIo.to(`score-${commentaryId}`).emit("undoCalled", {
          commentaryId: commentaryId,
          message: "Undo called for this commentary.",
        });
      }
    }
    if (isEndInnings && isEndInnings == true && isCallPredict == true) {
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
        request,
        pythonURI
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/undoAPIService2",
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
    commentaryLogger(
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/undoAPIService2",
        request
      );
    });
    // response.callPredictions = callPredictions;
    return response;
  } catch (error) {
    console.log(error)
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const changeStrikerPlyService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/changeStriker"
  try {
    let {
      commentaryPlayers,
      commentaryBallByBall,
      commentaryDetails,
      commentaryId,
      isEndInnings = false,
      isCallPredict = false,
    } = request.body;

    let commentaryIndex,
      ballByBallIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let _resFromPredictAPI;
    let callPredictions = [];
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
    }

    let previousCommentaryStatus, statusToUpdate, balltypeOfdeleteBall;
    let strikeTeamForEndInnings;
    // if (isEndInnings && isEndInnings == true) {
    //   strikeTeamF  orEndInnings = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryId &&
    //       item.teamStatus === 1 &&
    //       item.currentInnings === commentaryData.currentInnings
    //   );
    //   await notiConfigContentReplaceService(
    //     EventName.INNINGCOMPLETED,
    //     commentaryData.commentaryId,
    //     request,
    //     fastify
    //   );

    //   // let data = global.tblNotificationConfig.find((elem) =>
    //   //   elem.isActive === true && elem.eventName === EventName.INNINGCOMPLETED
    //   // )
    //   // if(data && commentaryData.isActive == true && commentaryData.eventName != null) {
    //   //   data.content = data.content.replace("{}", commentaryData.eventName);
    //   //   if(
    //   //     global?.clientSocketIo !== undefined &&
    //   //     global?.clientSocketIo.length > 0
    //   //   ){
    //   //     global.clientSocketIo.forEach((socket) => {
    //   //       socket.client.emit("notificationSend", data);
    //   //     });
    //   //     let notificationData = {
    //   //       title: commentaryData.eventName,
    //   //       description: data.content,
    //   //       commentaryId: commentaryData.commentaryId,
    //   //     }
    //   //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
    //   //   }
    //   // }
    // }
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
    // if (deleteCommentaryBallByBallId) {
    //   let deleteBallIndex = global.tblCommentaryBallByBall.findIndex(
    //     (item) => item.commentaryBallByBallId == deleteCommentaryBallByBallId
    //   );
    //   if (deleteBallIndex === -1) {
    //     throw new Error("Delete BallByBall with this id not Found savedetails");
    //   }
    //   balltypeOfdeleteBall =
    //     global.tblCommentaryBallByBall[deleteBallIndex].ballType;
    // }
    // if (deleteOverId) {
    //   let deleteOverIndex = global.tblOvers.findIndex(
    //     (item) => item.overId === deleteOverId
    //   );
    //   if (deleteOverIndex === -1) {
    //     throw new Error("Delete Over with this id not Found");
    //   }
    // }
    // validate commentaryTeams
    // if (commentaryTeams) {
    //   commentaryTeams.forEach((team) => {
    //     const index = global.tblCommentaryTeams.findIndex(
    //       (item) =>
    //         item?.commentaryId === team.commentaryId &&
    //         item.commentaryTeamId === team.commentaryTeamId
    //     );
    //     if (index === -1) {
    //       throw new Error("Commentary Team with this id not Found");
    //     }
    //   });
    // }
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
    // if (commentaryOvers) {
    //   if (commentaryOvers.overId == 0) {
    //     overIndex = global.tblCommentaries.findIndex(
    //       (item) => item?.commentaryId === commentaryOvers.commentaryId
    //     );

    //     if (overIndex === -1) {
    //       throw new Error("Commentary with this id not Found");
    //     }
    //     const indexTeam = global.tblCommentaryTeams.findIndex(
    //       (item) =>
    //         item?.commentaryId === commentaryOvers.commentaryId &&
    //         item.teamId === commentaryOvers.teamId
    //     );

    //     if (indexTeam === -1) {
    //       throw new Error("Team with this id not Found");
    //     }
    //     const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
    //       return (
    //         item?.commentaryId === commentaryOvers.commentaryId &&
    //         item.teamId === commentaryOvers.teamId &&
    //         item.commentaryPlayerId === commentaryOvers.bowlerId
    //       );
    //     });

    //     if (indexBowler === -1) {
    //       throw new Error("Bowler with this id not Found");
    //     }
    //   } else {
    //     overIndex = global.tblOvers.findIndex(
    //       (item) => item.overId === commentaryOvers.overId
    //     );
    //     if (overIndex === -1) {
    //       throw new Error("Over with this id not Found");
    //     }
    //   }
    // }
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
    // if (commentaryWicket) {
    //   if (commentaryWicket.commentaryWicketId == 0) {
    //     wicketIndex = global.tblCommentaries.findIndex(
    //       (item) => item?.commentaryId === commentaryWicket.commentaryId
    //     );
    //     if (wicketIndex === -1) {
    //       throw new Error("Commentary with this id not Found");
    //     }
    //   } else {
    //     wicketIndex = global.tblCommentaryWicket.findIndex(
    //       (item) =>
    //         item.commentaryWicketId === commentaryWicket.commentaryWicketId
    //     );
    //     if (wicketIndex === -1) {
    //       throw new Error("Wicket with this id not Found");
    //     }
    //   }
    // }
    //validate partnership
    // if (commentaryPartnership) {
    //   if (commentaryPartnership.commentaryPartnershipId == 0) {
    //     partnershipIndex = global.tblCommentaries.findIndex(
    //       (item) => item?.commentaryId === commentaryPartnership.commentaryId
    //     );
    //     if (partnershipIndex === -1) {
    //       throw new Error("Commentary with this id not Found");
    //     }
    //   } else {
    //     partnershipIndex = global.tblCommentaryPartnership.findIndex(
    //       (item) =>
    //         item?.commentaryPartnershipId ==
    //         commentaryPartnership.commentaryPartnershipId
    //     );
    //     if (partnershipIndex === -1) {
    //       throw new Error("Partnership with this id not Found");
    //     }
    //   }
    // }

    let updatedData = await fastify.db.query(
      `CALL proc_change_striker(
        $1, $2, $3, $4, $5, $6
      )`,
      {
        bind: [
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null, // commentaryBallByBallDetails,
          null
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
    const setEventSnap = [];
    const teamPoint = [];

    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        ...commentaryDetails
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        ...weatherAndPitchData,
      };
      if (commentaryDetails.commentaryStatus == 2) {
        await notiConfigContentReplaceService(
          EventName.WINTOSS,
          commentaryDetails.commentaryId,
          request,
          fastify
        );
        // let data = global.tblNotificationConfig.find((elem) =>
        //   elem.isActive === true && elem.eventName === EventName.WINTOSS
        // )
        // if(data && commentaryDetails.isActive === true && commentaryDetails.eventName != null) {
        //   data.content = data.content.replace("{}", commentaryDetails.eventName);
        //   if(
        //     global?.clientSocketIo !== undefined &&
        //     global?.clientSocketIo.length > 0
        //   ){
        //     global.clientSocketIo.forEach((socket) => {
        //       socket.client.emit("notificationSend", data);
        //     });
        //     let notificationData = {
        //       title: commentaryDetails.eventName,
        //       description: data.content,
        //       commentaryId: commentaryDetails.commentaryId,
        //     }
        //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
        //   }
        // }
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
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
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });

        if (updatedData.commentaryBallByBallDetails.ballType > 0) {
          if (!global.isSignalRStopped) {
            let _results = [];
            let result = await addinMarketBallbyballOdds(
              commentaryId,
              updatedData.commentaryBallByBallDetails,
              fastify
            );
            if (result) {
              _results.push(result);
              if (_results && _results.length > 0) {
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "marketOddsBallByBall",
                  data: _results,
                  type: "create",
                });
              }
            }
          }
        }
        // if (
        //   commentaryData.isPredictMarket &&
        //   updatedData.commentaryBallByBallDetails.ballType > 0
        // ) {
        //   let strikeTeam = global.tblCommentaryTeams.find(
        //     (item) =>
        //       item?.commentaryId === commentaryBallByBall.commentaryId &&
        //       item.teamStatus === 1
        //   );

        //   let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
        //   let _wkt = commentaryBallByBall.ballIsWicket;
        //   callPredictorMarket(
        //     {
        //       playerpredictscore :  {
        //         commentary_id: commentaryData.commentaryId,
        //         match_type_id: commentaryData.matchTypeId,
        //         event_id: commentaryData.eventRefId,
        //         current_team_id: strikeTeam.teamId,
        //         total_score: strikeTeam.teamScore,
        //         current_ball: decimalOverCount || 0,
        //         player_details: _sendPrePlayers,
        //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
        //         ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
        //         : null,
        //         partnership_details : sendPartnership
        //       },
        //       predictscore : {
        //         commentary_id: commentaryData.commentaryId,
        //         match_type_id: commentaryData.matchTypeId,
        //         ball: decimalOverCount,
        //         run: commentaryBallByBall.ballRun,
        //         total_score: strikeTeam.teamScore,
        //         strike_team_id: strikeTeam.teamId,
        //         wicket: _wkt === true ? 1 : 0,
        //         total_wicket: strikeTeam.teamWicket,
        //         ball_by_ball_id: updatedData.commentaryBallByBallDetails.commentaryBallByBallId
        //           ? parseInt(updatedData.commentaryBallByBallDetails.commentaryBallByBallId)
        //           : null
        //       }
        //     },
        //     "/api/v1/predictscore",
        //     fastify,
        //     request
        //   )
        // }
      } else {
        global.tblCommentaryBallByBall[ballByBallIndex] = {
          ...global.tblCommentaryBallByBall[ballByBallIndex],
          ...commentaryBallByBall
        }
        response.commentaryBallByBallDetails = global.tblCommentaryBallByBall[ballByBallIndex];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryBallByBall",
          type: "update",
          data: {
            ...response.commentaryBallByBallDetails,
            overCount:
              response.commentaryBallByBallDetails.overCount !== null
                ? response.commentaryBallByBallDetails.overCount.toString()
                : null,
          },
        });
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
            commentaryId : commentaryData.commentaryId

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
    commentaryLogger(
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    // response.callPredictions = callPredictions;
    return response;
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    throw new Error(error)
  }
}
const changePlayerService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/changePly"
  try {
    let {
      commentaryPlayers,
      commentaryPartnership,
      commentaryDetails,
      commentaryId,
      isEndInnings = false,
      isCallPredict = false,
    } = request.body;

    let commentaryIndex,
      partnershipIndex;
    let _sendPrePlayers = [];
    let commentaryData;
    let _resFromPredictAPI;
    let callPredictions = [];
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
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
      await notiConfigContentReplaceService(
        EventName.INNINGCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );

      // let data = global.tblNotificationConfig.find((elem) =>
      //   elem.isActive === true && elem.eventName === EventName.INNINGCOMPLETED
      // )
      // if(data && commentaryData.isActive == true && commentaryData.eventName != null) {
      //   data.content = data.content.replace("{}", commentaryData.eventName);
      //   if(
      //     global?.clientSocketIo !== undefined &&
      //     global?.clientSocketIo.length > 0
      //   ){
      //     global.clientSocketIo.forEach((socket) => {
      //       socket.client.emit("notificationSend", data);
      //     });
      //     let notificationData = {
      //       title: commentaryData.eventName,
      //       description: data.content,
      //       commentaryId: commentaryData.commentaryId,
      //     }
      //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      //   }
      // }
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
    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
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
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_change_player(
      $1, $2, $3, $4, $5, $6
    )`,
      {
        bind: [
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null, // commentaryOverDetails,
          null // commentaryBallByBallDetails,
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
        ...commentaryDetails
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        ...weatherAndPitchData,
      }
      if (commentaryDetails.commentaryStatus == 2) {
        await notiConfigContentReplaceService(
          EventName.WINTOSS,
          commentaryDetails.commentaryId,
          request,
          fastify
        );
        // let data = global.tblNotificationConfig.find((elem) =>
        //   elem.isActive === true && elem.eventName === EventName.WINTOSS
        // )
        // if(data && commentaryDetails.isActive === true && commentaryDetails.eventName != null) {
        //   data.content = data.content.replace("{}", commentaryDetails.eventName);
        //   if(
        //     global?.clientSocketIo !== undefined &&
        //     global?.clientSocketIo.length > 0
        //   ){
        //     global.clientSocketIo.forEach((socket) => {
        //       socket.client.emit("notificationSend", data);
        //     });
        //     let notificationData = {
        //       title: commentaryDetails.eventName,
        //       description: data.content,
        //       commentaryId: commentaryDetails.commentaryId,
        //     }
        //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
        //   }
        // }
      }
      // if (
      //   previousCommentaryStatus != statusToUpdate &&
      //   commentaryData?.isPredictMarket == true
      // ) {
      //   callDataProvider(
      //     {
      //       commentaryId: commentaryId,
      //       serviceType: ServiceType.dataProviderAPI,
      //       moduleType: APIEndpointModuleType.commentaryUpdate,
      //       type: statusToUpdate == 4 ? "close" : "update",
      //     },
      //     fastify
      //   ).catch((err) => {
      //     console.log("call Data Provider console", err);
      //     errorLogger(
      //       fastify,
      //       err.message,
      //       "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //       request
      //     );
      //   });
      // }
      // if (previousCommentaryStatus != statusToUpdate) {
      //   const cData = await getMatchDataByCId(
      //     {
      //       commentaryId: commentaryId,
      //     },
      //     request,
      //     fastify
      //   );

      //   callClientAPI(
      //     {
      //       serviceType: ServiceType.clientAPI,
      //       moduleType: APIEndpointModuleType.commentaryUpdate,
      //       data: cData,
      //     },
      //     request,
      //     fastify
      //   ).catch((err) => {
      //     console.log("call client api console", err);
      //     errorLogger(
      //       fastify,
      //       err.message,
      //       "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
      //       request
      //     );
      //   });
      // }
      // if (previousCommentaryStatus != statusToUpdate && statusToUpdate == 4) {
      //   await notiConfigContentReplaceService(
      //     EventName.EVENTCOMPLETED,
      //     commentaryData.commentaryId,
      //     request,
      //     fastify
      //   );

      //   // let data = global.tblNotificationConfig.find((elem) =>
      //   //   elem.isActive === true && elem.eventName === EventName.EVENTCOMPLETED
      //   // )
      //   // if(data && commentaryData.isActive === true && commentaryData.eventName != null) {
      //   //   data.content = data.content.replace("{}", commentaryData.eventName);
      //   //   if(
      //   //     global?.clientSocketIo !== undefined &&
      //   //     global?.clientSocketIo.length > 0
      //   //   ){
      //   //     global.clientSocketIo.forEach((socket) => {
      //   //       socket.client.emit("notificationSend", data);
      //   //     });
      //   //     let notificationData = {
      //   //       title: commentaryData.eventName,
      //   //       description: data.content,
      //   //       commentaryId: commentaryData.commentaryId,
      //   //     }
      //   //     await insertNotificationViaNotiConfigQuery(notificationData, request, fastify);
      //   //   }
      //   // }
      //   let com = global.tblCompetitions.find(
      //     (item) => item.competitionId === commentaryData.competitionId
      //   );
      //   if (com && com.isEventSnap == true) {
      //     setEventSnap.push({
      //       commentaryId: commentaryId,
      //       eventRefId: commentaryData.eventRefId,
      //       competitionId: commentaryData.competitionId,
      //       eventTypeId: commentaryData.eventTypeId,
      //     });
      //   }
      //   if (
      //     com &&
      //     com.isPointTable == true &&
      //     commentaryData?.isTest == false
      //   ) {
      //     teamPoint.push({
      //       commentaryId: commentaryId,
      //       competitionId: commentaryData.competitionId,
      //       team1Id: commentaryData.team1Id,
      //       team2Id: commentaryData.team2Id,
      //       winnerId: commentaryDetails.winnerId,
      //     });
      //   }
      //   if (setEventSnap.length > 0) {
      //     setCompEventSnapSerice(setEventSnap, request, fastify).catch(
      //       (err) => {
      //         console.log("setCompEventSnapSerice console savedetails", err);
      //         errorLogger(
      //           fastify,
      //           err.message,
      //           "ERROR --> services/commentary.js/saveDetails - syncCommentaryStatsWithAPIAndSocket - setEventSnap",
      //           request
      //         );
      //       }
      //     );
      //   }
      //   if (teamPoint.length > 0) {
      //     setTeamPointService(teamPoint, request, fastify).catch((err) => {
      //       console.log("setTeamPointService console savedetails", err);
      //       errorLogger(
      //         fastify,
      //         err.message,
      //         "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setTeamPointService",
      //         request
      //       );
      //     });
      //   }
      //   // if (commentaryData && commentaryData?.isTest == false) {
      //   //   setPlayerHistoryService(
      //   //     {
      //   //       commentaryId: [commentaryId],
      //   //     },
      //   //     request,
      //   //     fastify
      //   //   ).catch((err) => {
      //   //     console.log("setPlayerHistoryService console savedetails", err);
      //   //     errorLogger(
      //   //       fastify,
      //   //       err.message,
      //   //       "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setPlayerHistoryService",
      //   //       request
      //   //     );
      //   //   });
      //   // }
      //   const tipsData = global.tblTips
      //     .filter(
      //       (item) =>
      //         item.commentaryId === commentaryDetails.commentaryId ||
      //         item.eventRefId === commentaryDetails.eventRefId
      //     )
      //     .map((elem) => elem.id);
      //   if (tipsData.length > 0) {
      //     global.tblTips = global.tblTips.filter(
      //       (item) => !tipsData.includes(item.id)
      //     );
      //     callClientAPI(
      //       {
      //         serviceType: ServiceType.clientAPI,
      //         moduleType: APIEndpointModuleType.updateSeoModule,
      //         data: {
      //           module: "tips",
      //           type: "delete",
      //           data: {
      //             id: tipsData,
      //           },
      //         },
      //       },
      //       request,
      //       fastify
      //     ).catch((err) => {
      //       errorLogger(
      //         fastify,
      //         err.message,
      //         "services/commentary.js/syncCommentaryStatsWithAPIAndSocket - callClientAPI",
      //         request
      //       );
      //     });
      //   }
      // }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: response.commentaryDetails,
      });
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player
        };
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
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
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] =
          updatedData.commentaryPartnershipDetails;
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;

        if (response.commentaryPartnershipDetails) {
          try {
            const partnership = response.commentaryPartnershipDetails;
            // Find player 1 image
            const _player1 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter1Id
            );
            if (_player1.length > 0) {
              response.commentaryPartnershipDetails.player1image =
                _player1[0].playerimage;
              response.commentaryPartnershipDetails.player1jerseyandimage =
                _player1[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player1jerseyandimagepath =
                _player1[0].jerseyPlayerImagePath;
            }

            // Find player 2 image
            const _player2 = commentaryPlayers.filter(
              (item) => item.commentaryPlayerId === partnership.batter2Id
            );
            if (_player2.length > 0) {
              response.commentaryPartnershipDetails.player2image =
                _player2[0].playerimage;
              response.commentaryPartnershipDetails.player2jerseyandimage =
                _player2[0].jerseyPlayerImage;
              response.commentaryPartnershipDetails.player2jerseyandimagepath =
                _player2[0].jerseyPlayerImagePath;
            }
          } catch (error) { }
        }

      }
      // let boundary = response.commentaryPartnershipDetails.totalSix + response.commentaryPartnershipDetails.totalFour;
      // sendPartnership.push({
      //   partnership_no : response.commentaryPartnershipDetails.order,
      //   partnership_boundaries : boundary
      // })
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
            commentaryId : commentaryData.commentaryId

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
      });
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
    // let strikeTeam;
    // strikeTeam = global.tblCommentaryTeams.find(
    //   (item) =>
    //     item?.commentaryId === commentaryData.commentaryId &&
    //     item.teamStatus === 1
    // );
    commentaryLogger(
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    return response;
  } catch (error) {
    await commentaryLogger(
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    )
    throw error;
  }
}
const changeOverService = async (request, fastify) => {
  const startTime = new Date();
  const apiName = "/changeOver";
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryOvers,
      commentaryDetails,
      commentaryId,
      isCallPredict = false,
    } = request.body;

    let commentaryIndex, overIndex;
    let _sendPrePlayers = [];
    let commentaryData;

    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
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
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );

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
      overIndex = global.tblOvers.findIndex(
        (item) => item.overId === commentaryOvers.overId
      );
      if (overIndex === -1) {
        throw new Error("Over with this id not Found");
      }
    }

    await fastify.db.query(
      `CALL proc_change_over($1, $2, $3, $4, $5)`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? commentaryOvers : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    // if got object then push in global obj else update the global
    const response = {};

    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];


    if (commentaryDetails) {
      global.tblCommentaries[commentaryIndex] = {
        ...global.tblCommentaries[commentaryIndex],
        ...commentaryDetails
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
      response.commentaryDetails = {
        ...global.tblCommentaries[commentaryIndex],
        ...weatherAndPitchData,
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

        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
        };
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      });

      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );

          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: response.commentaryTeams
      });
    }

    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );

        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = {
          ...global.tblCommentaryPlayers[index],
          ...player
        };

        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      });

      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }

    if (commentaryOvers) {
      global.tblOvers[overIndex] = {
        ...global.tblOvers[overIndex],
        ...commentaryOvers
      };
      response.overdetails = global.tblOvers[overIndex];
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryOvers",
        type: "update",
        data: response.overdetails,
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
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/undoAPIService2",
          request
        );
      });

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

    commentaryLogger(
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
        apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/undoAPIService2",
        request
      );
    });

    response.isCallPredict = isCallPredict;
    return response;
  } catch (error) {
    console.log(error)
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
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const updateEventTypeAndCompIdService = async (request, fastify) => {
  const { commentaryId, competitionId, eventTypeId } = request.body;

  const validate = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryId
  );

  if (validate === -1) {
    throw new Error("Commentary with this id not found");
  }

  const eventType = global.tblEventTypes.find(
    (item) => item.eventTypeId === eventTypeId
  );
  if (!eventType) {
    throw new Error("EventType with this id not found");
  }

  const competition = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );
  if (!competition) {
    throw new Error("Competition with this id not found");
  }

  const existingData = global.tblCommentaries[validate];

  const updateData = {
    commentaryId,
    competitionId: competitionId || existingData?.competitionId,
    eventTypeId: eventTypeId || existingData?.eventTypeId,
  };

  await updateEventTypeAndCompIdQuery(updateData, request, fastify);

  global.tblCommentaries[validate] = {
    ...existingData,
    ...updateData,
    competition: competition?.competition,
    eventType: eventType?.eventType,
  };

  return "Commentary updated successfully";
};

const getCommWicketByIdService = async (request, fastify) => {
  const { commentaryWicketId } = request.body;

  const wicketData = global.tblCommentaryWicket.find(
    item => item.commentaryWicketId == commentaryWicketId
  );
  if (!wicketData) {
    throw new Error("Commentary wicket with this id not found");
  }

  return wicketData
}

const updateCommWicketService = async (request, fastify) => {
  const index = global.tblCommentaryWicket.findIndex(
    item => item.commentaryWicketId == request.body?.commentaryWicketId
  );
  if (index === -1) {
    throw new Error("Commentary wicket with this id not found");
  }

  await updateCommentaryWicketQuery(request.body, fastify, request);

  global.tblCommentaryWicket[index] = {
    ...global.tblCommentaryWicket[index],
    ...request.body
  }

  return `Commentary wicket data updated successfully`
}

const scoringTypeCommentaryService = async (request, fastify) => {
  const { commentaryId, scoringType, tpId } = request.body;

  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  if(tpId) {
    const validate = global.tblCommentaries.find(item => 
      item.tpId === tpId && item.commentaryId !== commentaryId
    )
    if(validate) { 
      throw new Error("TPID is already existed");
    }
  }

  await scoringTypeCommentaryQuery({ commentaryId, scoringType, tpId }, fastify, request);

  global.tblCommentaries[commentary] = {
    ...global.tblCommentaries[commentary],
    scoringType,
    tpId
  }

  commActionLogger(
    {
      commentaryId: commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary scoring type updated successfully"
      },
      apiName: "/admin/commentary/scoringType",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("scoringType commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/scoringTypeCommentaryService - commActionLogger",
      request
    );
  });

  return "Commentary scoring type updated successfully";
};

const validatePasswordOnPredictionFalseService = async (request, fastify) => {
  const { password } = request.body;
  if (!password) {
    throw new Error(`Password have to pass on body`);
  }

  const configPassword = global.tblConfigs.find(
    (item) => item.key === configConstants.PREDICTIONFALSEPASSWORD
  )?.value;
  if(!configPassword) {
    throw new Error("PREDICTIONFALSEPASSWORD key is not found in config");
  }

  if (configPassword !== password) {
    throw new Error("Invalid Password");
  }

  return "Password validated successfully";
};
const updateMatchInfoService = async(request , fastify)=>{
  // check commentary
  let com = global.tblCommentaries.find((i)=> i.commentaryId == request.body.commentaryId)
  if(!com){
    throw new Error("Commentary with this id not found")
  }
  // check tpId
  if(com.tpId == null){
    throw new Error("TpId for this event not found")
  }
  const match = await exchangeMatchinfoAPI({
    mid : com.tpId
  }, request, fastify);
  if (!match || match?.status !== "ok") {
    throw new Error("Invalid response from Entit-Sport API");
  }
  let player11 = match.response["match-playing11"];
  if(!player11) {
    return true;
  }
  // check noOfInning
  let totalInning = global.tblMatchTypes.find((i)=> i.matchTypeId == com.historyMatchTypeId)?.noOfIningsPerSide;
  let teama = player11.teama;
  let teamb = player11.teamb;
  let tpTeams = [ match.response.match_info.teama , match.response.match_info.teamb]
  let teamDetail = [match.response["match-playing11"].teama ,match.response["match-playing11"].teamb]
  // check which player not in commentaryPlayer
  // get the teamId 
  let team1 = global.tblTeams.find((i)=>i.tpId == teama.team_id)
  let team2 = global.tblTeams.find((i)=>i.tpId == teamb.team_id)
  if(!team1 || !team2){
    throw new Error("One of the Team not found")
  }
  let comTeam = global.tblCommentaryTeams.filter((i)=> i.commentaryId == request.body.commentaryId 
  && i.currentInning == com.currentInning)
  
  let eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLocaleLowerCase());
  let players = match.response.players;
  
  let storComPlayer = []
  for (let player of players){
    const checkPlayer = global.tblPlayers.find(
    (item) =>
      item.playerName.trim().toLowerCase() === player.title.trim().toLowerCase() ||
      item.tpId == player.pid
    );
    if(!checkPlayer){
      const data = {
          eventTypeId: eventType?.eventTypeId || eventType['Cricket'],
          playerTypeId: PlayerType[player?.playing_role],
          playerName: player?.title,
          displayName: player?.short_name,
          country: player?.nationality,
          isActive: true,
          isKipper: player?.playing_role === 'wk' ? true : false,
          isLeftHandedBatting: !player.batting_style.includes('Right'),
          isLeftArmFielding: !player.bowling_style.includes('Right'),
          userId: -5,
          batsmanAverage: 0.0,
          batsmanStrikeRate: 0.0,
          bowlerAverage: 0.0,
          bowlerEconomy: 0.0,
          tpId: player?.pid || null,
          bowlingStyleId: 0,
          bowlingTypeId: 0,
          birthDate: player?.birthdate,
          birthPlace: player?.birthplace
      };

      const insertPlayer = await insertPlayerQuery(data, fastify, request);
      global.tblPlayers.push(insertPlayer)

      // check in which team we add
      const team = teamDetail.find(teamObj =>
        teamObj.squads.some(player => player.player_id === player.pid)
      );

      const teamId = team ? team.team_id : null; 
      if(teamId){
        // add in teamPlayer
        let teamIndb = global.tblTeams.find((i)=> i.tpId == teamId)
        if(!teamId){
          errorLogger(
            fastify,
            `Team Id not found : ${teamId}`,
            "Service Error ->> services/commentary.js/updateMatchInfoService",
            request
          )
          continue;
        }
        const teamPlayerData = await insertTeamPlayerQuery(
          {
            teamId: parseInt(teamIndb.teamId),
            refPlayerId: insertPlayer.playerId,
            tpId: insertPlayer?.tpId ?? null,
            userId: request.userTokenInfo.WrUserId,
          },
          fastify,
          request
        );
        // add commentaryTeamPlayer
        for (let i = 1; i <= totalInning; i++){
          let currentinning = i;
          // let commentaryTeam = comTeam.find((i)=> i.teamId == teamIndb.teamId)
          let playerData = await insertCommentaryPlayersEntity(
            {
              commentaryId : com.commentaryId,
              teamId : teamIndb.teamId,
              playerId : insertPlayer.playerId,
              matchTypeId: com.matchTypeId,
              tpId :insertPlayer.tpId
            },
            currentinning,
            fastify,
            request
          );
          global.tblCommentaryPlayers.push(playerData)
        }
      }
    }
    else if(checkPlayer?.tpId === null || !checkPlayer?.tpId){
      const data = {
        userId: -5,
        tpId: player?.pid || null,
        playerId: checkPlayer.playerId,
      };
      const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
      let pIndex = global.tblPlayers.findIndex((i)=> i.playerId == checkPlayer.playerId)
      if(pIndex != -1){
        global.tblPlayers[pIndex].tpId = player.pid;
      }
    }
    else {
      continue;
    }
  }
  return true;
}

async function getGroupId(teamId, request, fastify) {
    const where = `"wrIsDeleted" = false 
      AND "wrCompetitionId" = ${request.body.competitionId}
      AND "wrIsActive" = TRUE 
      AND "wrTeamId" = ${teamId}`;
    const result = await getTournamentPointsByGroupNameQuery(where, request, fastify);
    return result?.groupId || null;
}

const overTypeChangeOnOversService = async (request, fastify) => {
  const { overType, overTypeName, commentaryId, overId } = request.body
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  const overData = global.tblOvers.findIndex(item => 
    item.commentaryId == request.body.commentaryId && item.overId == request.body.overId
  );
  if (overData == -1) {
    throw new Error(`Over with this id not found`);
  }
  await overTypeChangeOnOversQuery({ overType, overTypeName, commentaryId, overId }, fastify, request);

  global.tblOvers[overData] = {
    ...global.tblOvers[overData],
    overType,
    overTypeName,
  }

  return "Commentary Updated successfully";
};

const bowlingTypeChangeService = async (request, fastify) => {
  const { commentaryId, commentaryPlayerId, bowlingType } = request.body
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }

  const playerData = global.tblCommentaryPlayers.findIndex(item => 
    item.commentaryPlayerId == commentaryPlayerId && item.commentaryId == commentaryId
  );
  if (playerData == -1) {
    throw new Error(`Player with this id not found`);
  }
  await bowlingTypeChangeQuery({ commentaryId, commentaryPlayerId, bowlingType }, fastify, request);

  global.tblCommentaryPlayers[playerData] = {
    ...global.tblCommentaryPlayers[playerData],
    bowlingType,
  }

  return "Commentary Updated successfully";
};

const updateStreamURLService = async (request, fastify) => {
  const { commentaryId, streamingUrl, streamingType } = request.body
  // validate commentary id
  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateStreamingURLQuery({ streamingUrl, streamingType, commentaryId }, fastify, request);

  global.tblCommentaries[index] = {
    ...global.tblCommentaries[index],
    streamingUrl,
    streamingType,
  }
  return "Commentary Updated successfully";
};

const syncEntitySportCommentaryService = async (data,fastify,request = null) => {
    const startTime = new Date();
    try {
        let {
            commentaryTeams,
            commentaryPlayers,
            commentaryOvers,
            commentaryBallByBall,
            commentaryWicket,
            commentaryPartnership,
            commentaryDetails,
            commentaryId,
            isEndInnings,
            deleteBallByBallIds,
            deleteOverIds,
        } = data;

        let commentaryIndex,
            overIndex,
            ballByBallIndex,
            wicketIndex,
            partnershipIndex;
        let _sendPrePlayers = [];
        let commentaryData;
        let pythonURI;
        if (commentaryId) {
            commentaryData = global.tblCommentaries.find(
                (item) => item?.commentaryId === commentaryId
            );
            if (!commentaryData) {
                throw new Error("Commentary with this id not Found");
            }
            pythonURI = commentaryData.pythonURI ?? null;
        }

        let previousCommentaryStatus, statusToUpdate;
        if (isEndInnings && isEndInnings == true) {
            strikeTeamForEndInnings = global.tblCommentaryTeams.find(
                (item) =>
                    item?.commentaryId === commentaryId &&
                    item.teamStatus === 1 &&
                    item.currentInnings === commentaryData.currentInnings
            );
            await notiConfigContentReplaceService(
                EventName.INNINGCOMPLETED,
                commentaryData.commentaryId,
                request,
                fastify
            );
        }

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
        // validate commentaryTeams
        if (commentaryTeams && commentaryTeams.length >0) {
            commentaryTeams.forEach((team) => {
                const index = global.tblCommentaryTeams.findIndex(
                    (item) =>
                        item?.commentaryId === commentaryId &&
                        item.commentaryTeamId === team.commentaryTeamId
                );
                if (index === -1) {
                    throw new Error("Commentary Team with this id not Found");
                }
            });
        }
        // validate commentaryPlayers
        if (commentaryPlayers && commentaryPlayers.length >0  ) {
            commentaryPlayers = commentaryPlayers.filter(
                (player) =>
                    player.commentaryPlayerId != null ||
                    player.commentaryPlayerId != undefined
            );
            commentaryPlayers.forEach((player) => {
                if (player.commentaryPlayerId) {
                    const index = global.tblCommentaryPlayers.findIndex(
                        (item) => item.commentaryPlayerId === player.commentaryPlayerId && item.commentaryId === commentaryId
                    );
                    if (index === -1) {
                        throw new Error("Commentary Player with this id not Found");
                    }
                }
            });
        }
        //validate over
        if (commentaryOvers && commentaryOvers.length >0) {
          for (const over of commentaryOvers) {
            if (over.overId == 0) {
                overIndex = global.tblCommentaries.findIndex(
                    (item) => item?.commentaryId === over.commentaryId
                );

                if (overIndex === -1) {
                    throw new Error("Commentary with this id not Found");
                }
                const indexTeam = global.tblCommentaryTeams.findIndex(
                    (item) =>
                        item?.commentaryId === over.commentaryId &&
                        item.teamId === over.teamId
                );

                if (indexTeam === -1) {
                    throw new Error("Team with this id not Found");
                }
            } else {
                overIndex = global.tblOvers.findIndex(
                    (item) => item.overId === over.overId
                );
                if (overIndex === -1) {
                    throw new Error("Over with this id not Found");
                }
            }
          }
        }
        //validate ballByBall
        if (commentaryBallByBall && commentaryBallByBall.length >0) {
          for (const ballByBall of commentaryBallByBall) {
            if (ballByBall.commentaryBallByBallId == 0) {
                ballByBallIndex = global.tblCommentaries.findIndex(
                    (item) => item?.commentaryId === ballByBall.commentaryId
                );
                if (ballByBallIndex === -1) {
                    throw new Error("Commentary with this id not Found");
                }
            } else {
                ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
                    (item) =>
                        item.commentaryBallByBallId === ballByBall.commentaryBallByBallId
                );
                if (ballByBallIndex === -1) {
                    throw new Error("BallByBall with this id not Found");
                }
            }
          }
        }
        //validate wicket
        if (commentaryWicket && commentaryWicket.length >0) {
          for (const wicket of commentaryWicket) {
            if (wicket.commentaryWicketId == 0) {
                wicketIndex = global.tblCommentaries.findIndex(
                    (item) => item?.commentaryId === wicket.commentaryId
                );
                if (wicketIndex === -1) {
                    throw new Error("Commentary with this id not Found");
                }
            } else {
                wicketIndex = global.tblCommentaryWicket.findIndex(
                    (item) =>
                        item.commentaryWicketId === wicket.commentaryWicketId
                );
                if (wicketIndex === -1) {
                    throw new Error("Wicket with this id not Found");
                }
            }
          }
        }

        //validate partnership
        if (commentaryPartnership && commentaryPartnership.length >0) {
          for (const partnerships of commentaryPartnership) {
            if (partnerships.commentaryPartnershipId == 0) {
              partnershipIndex = global.tblCommentaries.findIndex(
                (item) => item.commentaryId === partnerships.commentaryId
              );
              if (partnershipIndex === -1) {
                throw new Error("Commentary with this id not Found");
              }
            } else {
              partnershipIndex = global.tblCommentaryPartnership.findIndex(
                (item) =>
                  item.commentaryPartnershipId == partnerships.commentaryPartnershipId
              );
              if (partnershipIndex === -1) {
                throw new Error("Partnership with this id not Found");
              }
            }
          }
        }

        let updatedData = await fastify.db.query(
          `CALL proc_entitycom_v1($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          {
            bind: [
              commentaryTeams ? JSON.stringify(commentaryTeams) : null,
              commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
              commentaryOvers ? JSON.stringify(commentaryOvers) : null,
              commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
              commentaryWicket ? JSON.stringify(commentaryWicket) : null,
              commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
              commentaryDetails ? JSON.stringify(commentaryDetails) : null,
              commentaryId,
              null,
              null,
              null,
              null,
              null,
              deleteBallByBallIds || null,
              deleteOverIds || null,
              (deleteBallByBallIds?.length || deleteOverIds?.length) ? true : false,
              -2,
              // (deleteBallByBallIds?.length || deleteOverIds?.length)
              //   ? (request?.userTokenInfo?.WrUserId ?? null)
              //   : null,
            ],
            type: fastify.db.QueryTypes.SELECT,
          }
        );

        // let updatedData = await fastify.db.query(
        //     `CALL proc_entitycom_v1($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        //     {
        //         bind: [
        //           commentaryTeams ? JSON.stringify(commentaryTeams) : null,
        //           commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
        //           commentaryOvers ? JSON.stringify(commentaryOvers) : null,
        //           commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
        //           commentaryWicket ? JSON.stringify(commentaryWicket) : null,
        //           commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
        //           commentaryDetails ? JSON.stringify(commentaryDetails) : null,
        //           commentaryId,
        //           null, // commentaryWicketDetails,
        //           null, // commentaryOverDetails,
        //           null, // commentaryDetailsDetails,
        //           null, // commentaryBallByBallDetails,
        //           null, // commentaryPartnershipDetails,
        //         ],
        //         type: fastify.db.QueryTypes.SELECT,
        //     }
        // );
        // if got object then push in global obj else update the global
        updatedData = updatedData[0];
        const response = {};

        const sendDataForSocketUpdate = {};
        sendDataForSocketUpdate.commentaryId = commentaryId;
        sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
        sendDataForSocketUpdate.dataToUpdate = [];
        const setEventSnap = [];
        const teamPoint = [];

        if (commentaryDetails) {
            global.tblCommentaries[commentaryIndex] = {
                ...global.tblCommentaries[commentaryIndex],
                displayStatus: commentaryDetails.displayStatus,
                isClientShow: commentaryDetails?.isClientShow,
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
                rmk: commentaryDetails.rmk,
                winRmk: commentaryDetails.winRmk,
                tossRmk: commentaryDetails.tossRmk,
            };
            const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);
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
                isPredict: commentaryDetails.isPredictMarket,
                rmk: commentaryDetails.rmk,
                winRmk: commentaryDetails.winRmk,
                tossRmk: commentaryDetails.tossRmk,
                ...weatherAndPitchData
            };
            if (commentaryDetails.commentaryStatus == 2) {
                await notiConfigContentReplaceService(
                    EventName.WINTOSS,
                    commentaryDetails.commentaryId,
                    request,
                    fastify
                );
            }

            if (previousCommentaryStatus != statusToUpdate) {
                const cData = await getMatchDataByCId(
                    {
                        commentaryId: commentaryId,
                    },
                    request,
                    fastify
                );

                callClientAPI(
                    {
                        serviceType: ServiceType.clientAPI,
                        moduleType: APIEndpointModuleType.commentaryUpdate,
                        data: cData,
                    },
                    request,
                    fastify
                ).catch((err) => {
                    console.log("call client api console", err);
                    errorLogger(
                        fastify,
                        err.message,
                        "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                        request
                    );
                });
            }
            // if (previousCommentaryStatus != statusToUpdate && statusToUpdate == 4) {
            //     await notiConfigContentReplaceService(
            //         EventName.EVENTCOMPLETED,
            //         commentaryData.commentaryId,
            //         request,
            //         fastify
            //     );

            //     let com = global.tblCompetitions.find(
            //         (item) => item.competitionId === commentaryData.competitionId
            //     );
            //     if (com && com.isEventSnap == true) {
            //         setEventSnap.push({
            //             commentaryId: commentaryId,
            //             eventRefId: commentaryData.eventRefId,
            //             competitionId: commentaryData.competitionId,
            //             eventTypeId: commentaryData.eventTypeId,
            //         });
            //     }
            //     if (
            //         com &&
            //         com.isPointTable == true &&
            //         commentaryData?.isTest == false
            //     ) {
            //         teamPoint.push({
            //             commentaryId: commentaryId,
            //             competitionId: commentaryData.competitionId,
            //             team1Id: commentaryData.team1Id,
            //             team2Id: commentaryData.team2Id,
            //             winnerId: commentaryDetails.winnerId,
            //         });
            //     }

            //     const tipsData = global.tblTips
            //         .filter(
            //             (item) =>
            //                 item.commentaryId === commentaryDetails.commentaryId ||
            //                 item.eventRefId === commentaryDetails.eventRefId
            //         )
            //         .map((elem) => elem.id);
            //     if (tipsData.length > 0) {
            //         global.tblTips = global.tblTips.filter(
            //             (item) => !tipsData.includes(item.id)
            //         );
            //         callClientAPI(
            //             {
            //                 serviceType: ServiceType.clientAPI,
            //                 moduleType: APIEndpointModuleType.updateSeoModule,
            //                 data: {
            //                     module: "tips",
            //                     type: "delete",
            //                     data: {
            //                         id: tipsData,
            //                     },
            //                 },
            //             },
            //             request,
            //             fastify
            //         )
            //     }
            // }
            sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryDetails",
                type: "update",
                data: response.commentaryDetails,
            });
        }
        if (commentaryTeams &&  commentaryTeams.length >0 ) {
            response.commentaryTeams = [];
            commentaryTeams.forEach((team) => {
                const index = global.tblCommentaryTeams.findIndex(
                    (item) =>
                        item?.commentaryId === team.commentaryId &&
                        item.commentaryTeamId === team.commentaryTeamId
                );
                team.crr = parseFloat(team?.crr) || 0;
                team.rrr = parseFloat(team?.rrr) || 0;
                if (team.commentaryId !== commentaryId) {
                    errorLogger(
                        fastify,
                        `Commentary ID mismatch for team ${team.teamName}. Expected: ${commentaryId}, Found: ${team.commentaryId}`,
                        "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                        request
                    );
                }
                else {
                    global.tblCommentaryTeams[index] = {
                        ...team,
                        teamPredictionPercentage:
                            global.tblCommentaryTeams[index].teamPredictionPercentage,
                    };
                    response.commentaryTeams.push(global.tblCommentaryTeams[index]);
                }
            });
            try {
                response.commentaryTeams.forEach(async (team) => {
                    const _teamsC1 = global.tblTeams.filter(
                        (item) => item.teamId === team.teamId
                    );
                    if (_teamsC1.length > 0) {
                        team.image = _teamsC1[0].image;
                        team.jersey = _teamsC1[0].jersey;
                        team.nimage = _teamsC1[0].imagePath;
                        team.njersey = _teamsC1[0].jerseyPath;
                    }
                });
            } catch (error) { }
            sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryTeams",
                type: "update",
                // data: commentaryTeams,
                data: response.commentaryTeams.map((team) => ({
                    ...team,
                    crr: parseFloat(team?.crr) || 0,
                    rrr: parseFloat(team?.rrr) || 0,
                })),
            });
        }

        if (commentaryPlayers && commentaryPlayers.length >0 ) {
            response.commentaryPlayers = [];
            commentaryPlayers.forEach((player) => {
                const index = global.tblCommentaryPlayers.findIndex(
                    (item) => item.commentaryPlayerId === player.commentaryPlayerId
                );
                // get display name
                let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
                global.tblCommentaryPlayers[index] = player;
                if (player.commentaryId !== commentaryId) {
                    errorLogger(
                        fastify,
                        `Commentary ID mismatch for player ${player.playerName}. Expected: ${commentaryId}, Found: ${player.commentaryId}`,
                        "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                        request
                    );
                }
                else {
                    response.commentaryPlayers.push({
                        ...global.tblCommentaryPlayers[index],
                        displayName: ds?.displayName,
                    });
                }

            });
            let _plyers = commentaryPlayers.filter(
                (_fil) => _fil.isPlay === true && _fil.onStrike !== null
            );
            _plyers.forEach((player) => {
                let _sendPrePlayer = {};
                _sendPrePlayer.player_id = player.commentaryPlayerId;
                _sendPrePlayer.player_name = player.playerName;
                _sendPrePlayer.team_id = player.teamId;
                _sendPrePlayer.batRun = player.batRun || "0";
                _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
                _sendPrePlayer.current_boundaries =
                    (isNaN(parseInt(player.batFour ?? 0, 10))
                        ? 0
                        : parseInt(player.batFour ?? 0, 10)) +
                    (isNaN(parseInt(player.batSix ?? 0, 10))
                        ? 0
                        : parseInt(player.batSix ?? 0, 10));
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
                    const _player = global.tblPlayers.filter(
                        (item) => item.playerId === player.playerId
                    );
                    if (_player.length > 0) {
                        player.playerimage = _player[0].image;
                        player.playerType = _player[0].playerType;
                        player.isKipper = _player[0].isKipper;
                    }
                });
            } catch (error) { }

            sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryPlayers",
                type: "update",
                data: response.commentaryPlayers,
            });
        }
        if (commentaryOvers && commentaryOvers.length > 0  ) {
          for (const overDetails of updatedData.overDetails) {
            const ovIndex = global.tblOvers.findIndex(item => 
              item.overId === overDetails.overId
            )
            if (ovIndex === -1) {
              global.tblOvers.push(overDetails);
            } else {
              global.tblOvers[ovIndex] = overDetails
            }
          }
          // response.overdetails = updatedData.overDetails;
          // sendDataForSocketUpdate.dataToUpdate.push({
          //     module: "commentaryOvers",
          //     type: "create",
          //     data: response.overdetails,
          // });
          response.overdetails = commentaryOvers;
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "entityOvers",
            data: response.overdetails,
          });
        }
        if (commentaryBallByBall && commentaryBallByBall.length > 0) {
          response.commentaryBallByBallDetails = commentaryBallByBall;
          for (const ballDetails of updatedData.commentaryBallByBallDetails) {
            const findBallByBall = global.tblCommentaryBallByBall.findIndex(item => 
              item.commentaryBallByBallId == ballDetails.commentaryBallByBallId
            )
            if (findBallByBall === -1) {
                global.tblCommentaryBallByBall.push(ballDetails);
            } else {
                global.tblCommentaryBallByBall[findBallByBall] = ballDetails;
            }
            // // call Third Party API
            // if (ballDetails.ballType > 0) {

            //   let _wkt = ballDetails.ballIsWicket;
            //   let _bory = ballDetails.ballIsBoundry;
            //   if (_bory == true) {
            //       let boundaryType;
            //       let ballRun = ballDetails.ballRun;
            //       if (ballRun == 4) {
            //           boundaryType = ballRun;
            //       }
            //       if (ballRun == 6) {
            //           boundaryType = ballRun;
            //       }

            //       await notiConfigContentReplaceService(
            //           EventName.BOUNDARY,
            //           commentaryData.commentaryId,
            //           request,
            //           fastify,
            //           boundaryType
            //       );
            //   }
            // }
          }
          // sendDataForSocketUpdate.dataToUpdate.push({
          //   module: "commentaryBallByBall",
          //   type: "create",
          //   data: {
          //       ...response.commentaryBallByBallDetails
          //       // overCount: null
          //   },
          // });
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "entityBallByBalls",
            data: response.commentaryBallByBallDetails.map(item => {
              return {
                ...item,
                overCount: item.overCount !== null ? item.overCount.toString() : null
              };
            })
          });
        }
        if (commentaryWicket && commentaryWicket.length > 0) {
          for (const wicketDetails of updatedData.commentaryWicketDetails) {
            const wickIndex = global.tblCommentaryWicket.findIndex(item => 
              item.commentaryWicketId == wicketDetails.commentaryWicketId
            )
            if (wickIndex === -1) {
                global.tblCommentaryWicket.push(wicketDetails);
                await notiConfigContentReplaceService(
                    EventName.WICKET,
                    commentaryData.commentaryId,
                    request,
                    fastify
                );
            } else {
              global.tblCommentaryWicket[wickIndex] = wicketDetails;
            }
          }
          // response.commentaryWicketDetails = updatedData.commentaryWicketDetails;
          // sendDataForSocketUpdate.dataToUpdate.push({
          //     module: "commentaryWicket",
          //     type: "create",
          //     data: response.commentaryWicketDetails,
          // });
          response.commentaryWicketDetails = commentaryWicket;
          sendDataForSocketUpdate.dataToUpdate.push({
              module: "entityWickets",
              data: response.commentaryWicketDetails,
          });
        }

        if (commentaryPartnership && commentaryPartnership.length > 0) {
          for (const partners of updatedData.commentaryPartnershipDetails) {
            const partnerIndex = global.tblCommentaryPartnership.findIndex(item => 
              item.commentaryPartnershipId == partners.commentaryPartnershipId
            )
            if (partnerIndex === -1) {
              global.tblCommentaryPartnership.push(partners);
            } else {
              global.tblCommentaryPartnership[partnerIndex] = partners;
            }
          }
          // response.commentaryPartnershipDetails = updatedData.commentaryPartnershipDetails;

          // sendDataForSocketUpdate.dataToUpdate.push({
          //   module: "commentaryPartnership",
          //   type: "create",
          //   data: response.commentaryPartnershipDetails,
          // });
          response.commentaryPartnershipDetails = commentaryPartnership;

          sendDataForSocketUpdate.dataToUpdate.push({
            module: "entityPartnerships",
            data: response.commentaryPartnershipDetails.map(item => {
              // Find player 1
              const player1 = commentaryPlayers.find(p => p.commentaryPlayerId === item.batter1Id);
              if (player1) {
                item.player1image = player1.playerimage;
                item.player1jerseyandimage = player1.jerseyPlayerImage;
                item.player1jerseyandimagepath = player1.jerseyPlayerImagePath;
              }
              // Find player 2
              const player2 = commentaryPlayers.find(p => p.commentaryPlayerId === item.batter2Id);
              if (player2) {
                item.player2image = player2.playerimage;
                item.player2jerseyandimage = player2.jerseyPlayerImage;
                item.player2jerseyandimagepath = player2.jerseyPlayerImagePath;
              }
              return item;
            })
          });
        }

        if (deleteBallByBallIds && deleteBallByBallIds.length > 0) {
          global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
            (item) => !deleteBallByBallIds.includes(item?.commentaryBallByBallId)
          );
          global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
            (item) => !deleteBallByBallIds.includes(item?.commentaryBallByBallId)
          );
          global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
            (item) => !deleteBallByBallIds.includes(item?.commentaryBallByBallId)
          );
          response.deleteBallByBallIds = true;
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "deleteOverWicketParnerBallIds",
            data: { commentaryBallByBallId: deleteBallByBallIds },
          });
        }
        if (deleteOverIds && deleteOverIds.length > 0) {
          global.tblOvers = global.tblOvers.filter(
            (item) => !deleteOverIds.includes(item?.overId)
          );
          response.deleteOverIds = true;
          sendDataForSocketUpdate.dataToUpdate.push({
            module: "deleteOverIds",
            data: { overId: deleteOverIds },
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
                        commentaryId: commentaryData.commentaryId
                    },
                },
                fastify,
                "callFromSocket"
            ).catch((err) => {
                console.log("err in entity commentaryDetailsByEventIdService", err);
                errorLogger(
                    fastify,
                    err.message,
                    "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                    request
                );
            });
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
        await commentaryLogger(
            {
                commentaryId: data.commentaryId,
                requestBody: data,
                response: response,
                global: {
                    partnership: global.tblCommentaryPartnership.filter(
                        (item) => item?.commentaryId === data.commentaryId
                    ),
                },
                extra: {
                    ballByBall: global.tblCommentaryBallByBall.filter(
                        (item) => item?.commentaryId === data.commentaryId
                    ),
                },
                apiName: "/setEntityCom",
                reqStartTime: startTime,
            },
            null,
            fastify
        ).catch((err) => {
            console.log("commentary logger console", err);
            errorLogger(
                fastify,
                err.message,
                "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                null
            );
        });
        
        // response.callPredictions = callPredictions;
        return response;
    } catch (error) {
        await commentaryLogger(
            {
                commentaryId: data.commentaryId,
                requestBody: data,
                response: {
                    error: error.message,
                },
                global: {
                    partnership: global.tblCommentaryPartnership.filter(
                        (item) => item?.commentaryId === data.commentaryId
                    ),
                },
                extra: {
                    ballByBall: global.tblCommentaryBallByBall.filter(
                        (item) => item?.commentaryId === data.commentaryId
                    ),
                },
                apiName: "/setEntityCom",
                reqStartTime: startTime,
            },
            null,
            fastify
        ).catch((err) => {
            console.log("commentary logger console", err);
            errorLogger(
                fastify,
                err.message,
                "ERROR --> services/commentary.js/syncEntitySportCommentaryService",
                null
            );
        });
        console.log("errorroorroororor", error)
        throw new Error(error.message);
    }
};

const weatherAndPitchDataService = async (commentaryId) => {
  const commentaryData = global.tblCommentaries.find(item => item.commentaryId == commentaryId);
  const pitchData = global.tblPitchConditions.find(elem => elem.commentaryId == commentaryId);
  const weatherDetails = global.tblWeather.find(elem => elem.commentaryId == commentaryId);

  return {
    onfieldUmpires: commentaryData?.onfieldUmpires || "",
    matchReferee: commentaryData?.matchReferee || "",
    thirdUmpire: commentaryData?.thirdUmpire || "",
    difficulty: commentaryData?.difficulty || 0,
    pitchHardness: commentaryData?.pitchHardness || 0,
    pitchCracks: commentaryData?.pitchCracks || 0,
    pitchWareSpeed: commentaryData?.pitchWareSpeed || 0,
    pitchType: commentaryData?.pitchType || 0,
    lawnStriping: commentaryData?.lawnStriping || 0,
    pitchAge: commentaryData?.pitchAge || 0,
    session: commentaryData?.session || "",
    battingCondition: pitchData?.battingCondition || "",
    pitchCondition: pitchData?.pitchCondition || "",
    paceBowlingCondition: pitchData?.paceBowlingCondition || "",
    spineBowlingConniton: pitchData?.spineBowlingConniton || "",
    weatherCondition: weatherDetails?.weatherCondition || "",
    // description: weatherDetails?.description || "",
    temp: weatherDetails?.temp || null,
    humidity: weatherDetails?.humidity || null,
    visibility: weatherDetails?.visibility || null,
    windSpeed: weatherDetails?.windSpeed || null,
    clouds: weatherDetails?.clouds || null,
  }
} 

const insertCompetitionOnMatchImportService = async (cid, fastify, request) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getCompetitionDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    throw new Error(checkEntitySportAPIEndpoint.message);
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{cid}", cid);
  const entitySportCompetition = await callEntitySportAPI(url, request, fastify);

  let entitySportCompetitionResponse = entitySportCompetition?.data?.result;
  if (!entitySportCompetitionResponse) {
    throw new Error("Invalid response from Entit-Sport API");
  }

  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
  const matchType = global.tblMatchTypes.find(item => item.entityEnum === EntityEnums[entitySportCompetitionResponse?.game_format.toUpperCase()]);

  const pythonIdData = global.tblPythonAPI.find(item => item.isDefault === true && item.isActive === true);
  if (!pythonIdData) {
    console.error("Default Python API not found");
  }

  const checkCompetition = global.tblCompetitions.find(tc => [entitySportCompetitionResponse?.cid, cid].includes(tc.tpId));
  if (checkCompetition) {
    return checkCompetition;
  }

  let competitionData = {
    competition: entitySportCompetitionResponse?.title,
    eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
    refId: entitySportCompetitionResponse?.cid,
    isActive: true,
    isEventSnap: true,
    matchTypeId: matchType?.matchTypeId || null,
    drsCount: 2,
    isMen: entitySportCompetitionResponse?.teams[0]?.sex == 'male' ? true : false,
    type: CompetitionType[entitySportCompetitionResponse?.category.toUpperCase()],
    commStatus: compStatus[entitySportCompetitionResponse?.status], // 1: fixture, 2: live, 3: result
    startDate: entitySportCompetitionResponse?.datestart,
    endDate: entitySportCompetitionResponse?.dateend,
    tpId: entitySportCompetitionResponse?.cid,
    pythonId: pythonIdData?.id || null,
    isPointTable: entitySportCompetitionResponse?.table === "1"
  }

  if (competitionData.isPointTable) {
    competitionData = {
      ...competitionData,
      winPoint: 2,
      tiePoint: 0,
      lossPoint: 0,
      cancelPoint: 1
    }
  }

  const insertCompetition = await insertCompetitionQuery({
    ...request,
    body: competitionData
  }, fastify);
  global.tblCompetitions.push(insertCompetition);
  return insertCompetition;
}

const insertTeamAndPlayers = async (data, eventType, request, fastify) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getTeamDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/commentary.js/insertTeamAndPlayers - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{tid}", data.tid);
  const entitySportTeamPlayers = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = entitySportTeamPlayers?.data?.result?.items;
  }

  let entitySportTeamPlayersResponse = entitySportTeamPlayers?.data?.result?.items;
  if (!entitySportTeamPlayersResponse) {
    errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/commentary.js/insertTeamAndPlayers - entitySportTeamPlayersResponse", {
      ...request,
      originalUrl: url
    }, entitySportTeamPlayers?.data);
    return false;
  }

  const teamData = entitySportTeamPlayersResponse?.team;
  const isMen = teamData?.sex === "male";
  const teamPlayerData = Object.values(entitySportTeamPlayersResponse?.players).flat()
  const entitySocketData = global.tblEntitySockets[0];

  let checkTeam = global.tblTeams.find(item => item.tpId === teamData?.tid || item.teamName.toLowerCase() === teamData.title.replace(/'/g, "''").toLowerCase());
  if (!checkTeam) {
    let imageUrl = teamData?.logo_url;
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
        imageUrl = getImageDataFromUrl
      }
    }

    const newTeamData = {
      teamName: teamData?.title,
      teamShortName: teamData?.abbr,
      eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
      userId: -2,
      tpId: teamData?.tid || null,
      image: imageUrl.fullPath,
      imagePath: imageUrl.imagePath,
      jersey: entitySocketData?.defaultJerseyImage || null,
      jerseyPath: entitySocketData?.defaultJerseyImagePath || null,
      isMen
    }
    const insertTeam = await insertTeamQuery(newTeamData, fastify, request);
    global.tblTeams.push(insertTeam);
    checkTeam = insertTeam;
  } else if (checkTeam?.tpId === null || !checkTeam?.tpId) {
    const data = {
      userId: -2,
      tpId: teamData?.tid || null,
      teamId: checkTeam.teamId
    }
    const updateTeam = await updateExchangeTeamQuery(data, fastify, request);
    let index = global.tblTeams.findIndex((i) => i.teamId == checkTeam.teamId)
    if (index != -1) {
      global.tblTeams[index] = updateTeam[0]
    }
    checkTeam = global.tblTeams[index];
  }

  const upsertedPlayers = [];
  const uniquePlayers = [...new Map(teamPlayerData.map(player => [player.pid, player])).values()];
  for (const player of uniquePlayers) {
    let checkPlayer = global.tblPlayers.find(item => item.tpId === player.pid);
    if (!checkPlayer) {
      checkPlayer = global.tblPlayers.find((item) => item.tpId == null
        && item.playerName.toLowerCase() === player?.title.replace(/'/g, "''").toLowerCase() &&
        item.displayName.trim().replace(/'/g, "''").toLowerCase() == player?.short_name.toLowerCase());

      if (!checkPlayer) {
        let getCountry = null;
        if (player?.nationality) {
          getCountry = global.tblCountryCodes.find(item => item.countryName.toLowerCase() === player?.nationality.toLowerCase());
          if (!getCountry) {
            const insertCountryData = {
              countryName: player?.nationality || null,
              isActive: true,
            };
            const insertCountryCode = await insertCountryCodeQuery(insertCountryData, fastify, request);
            global.tblCountryCodes.push(insertCountryCode);
            getCountry = insertCountryCode;
          }
        }

        let insertPlayerData = {
          eventTypeId: EventType['Cricket'],
          playerTypeId: EntityPlayerType[player?.playing_role],
          playerName: player?.title,
          displayName: player?.short_name,
          countryId: getCountry?.id,
          isActive: true,
          isKipper: player?.playing_role === 'wk' ? true : false,
          isLeftHandedBatting: player.batting_style ? !player.batting_style.includes('Right') : false,
          isLeftArmFielding: player.bowling_style ? !player.bowling_style.includes('Right') : false,
          userId: -2,
          batsmanAverage: 0.0,
          batsmanStrikeRate: 0.0,
          bowlerAverage: 0.0,
          bowlerEconomy: 0.0,
          tpId: player?.pid || null,
          bowlingStyleId: player.bowling_type ? EntityBowlingStyleType[player.bowling_type.toLowerCase()] : null,
          bowlingTypeId: extractBowlingStyle(player.bowling_type, player.bowling_style),
          image: entitySocketData?.defaultPlayerImage || null,
          imagePath: entitySocketData?.defaultPlayerImagePath || null,
          isMen,
          birthDate: player?.birthdate || null,
          birthPlace: player?.birthplace ?? null
        };
        const insertPlayer = await insertPlayerQuery(insertPlayerData, fastify, request);
        global.tblPlayers.push(insertPlayer);
        checkPlayer = insertPlayer;

        await insertAutoImportDataService({
          ...request,
          body: {
            refId: insertPlayer?.playerId,
            refType: RefType.PlayerUpdate,
            sourceId: 3
          },
          userTokenInfo: {
            WrUserId: request?.userTokenInfo?.WrUserId ?? -2
          }
        }, fastify);
      }
      else if (checkPlayer?.tpId === null || !checkPlayer?.tpId) {
        const data = {
          userId: -2,
          tpId: player?.pid || null,
          playerId: checkPlayer.playerId,
        };
        const updatePlayer = await updateExchangePlayerQuery(data, fastify, request);
        let index = global.tblPlayers.findIndex((i) => i.playerId == checkPlayer.playerId)
        if (index != -1) {
          global.tblPlayers[index] = updatePlayer
        }
        checkPlayer = updatePlayer;
      }
    }
    upsertedPlayers.push(checkPlayer);
  }

  const teamPlayerByTeamId = await getAllPlayersByTeamIdQuery(checkTeam?.teamId, fastify, request);
  const uniqueUpsertedPlayers = [...new Map(upsertedPlayers.map(player => [player.playerId, player])).values()];
  if (uniqueUpsertedPlayers.length > 0 && checkTeam.teamId) {
    for (const player of uniqueUpsertedPlayers) {
      const checkPlayerExistsInTeam = teamPlayerByTeamId.find(item => item.playerId === player.playerId);
      if (!checkPlayerExistsInTeam) {
        await insertTeamPlayerQuery({
          teamId: checkTeam?.teamId,
          refPlayerId: player?.playerId,
          tpId: player?.tpId,
          userId: -2,
          jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage || null,
          jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath || null,
        }, fastify, request);
        await updateTeamPlayerHomeTeamQuery({
          refPlayerId: player?.playerId,
          teamId: checkTeam?.teamId
        }, fastify, request);
      }
    }
  }

  return checkTeam;
}

const matchImportService = async (data, fastify, request = null) => {
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getMatchDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/commentary.js/matchImportService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{mid}", data.mid);
  const entitySportMatch = await callEntitySportAPI(url, request, fastify);

  if (data?.autoImportId && data?.autoImportId === global?.autoImportData?.id) {
    global.autoImportData.esApiResponseData = {
      commentary: entitySportMatch?.data?.result
    }
  }

  let entitySportMatchResponse = entitySportMatch?.data?.result;
  if (!entitySportMatchResponse) {
    errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/commentary.js/matchImportService - entitySportMatchResponse", {
      ...request,
      originalUrl: url
    }, entitySportMatch?.data);
    return false;
  }

  const matchInfoResponse = entitySportMatchResponse?.match_info;
  let matchType = global.tblMatchTypes.find(item => item.entityEnum === matchInfoResponse.format);
  if (!matchType) {
    errorLogger(
      fastify,
      `Match Type not found for format ${matchInfoResponse.format} `,
      "ERROR --> services/commentry.js/matchImportService",
      request
    );
    return true;
  }

  let checkCompetition = global.tblCompetitions.find(item => item.tpId === matchInfoResponse?.competition?.cid);
  if (!checkCompetition) {
    checkCompetition = await insertCompetitionOnMatchImportService(matchInfoResponse?.competition?.cid, fastify, request);
  }

  const pythonIdData = global.tblPythonAPI.find(item => item.isDefault === true && item.isActive === true);
  if (!pythonIdData) {
    console.error("Default Python API not found");
  }
  const eventType = global.tblEventTypes.find((et) => et.eventType.toLowerCase() === 'Cricket'.toLowerCase());
  let checkCountry, checkVenue;
  if (matchInfoResponse?.venue?.country && matchInfoResponse?.venue?.country !== "") {
    checkCountry = global.tblCountryCodes.find(item => item.countryName === matchInfoResponse?.venue?.country);
    if (!checkCountry) {
      const countryData = {
        countryName: matchInfoResponse?.venue?.country || null,
        isActive: true,
      };
      const insertCountryCode = await insertCountryCodeQuery(countryData, fastify, request);
      global.tblCountryCodes.push(insertCountryCode);
      checkCountry = insertCountryCode;
    }

    checkVenue = global.tblVenues.find(item => item.countryId === checkCountry?.id && item.city === matchInfoResponse?.venue?.location && item.name === matchInfoResponse?.venue?.name);
    if (!checkVenue) {
      const venueData = {
        countryId: checkCountry?.id,
        city: matchInfoResponse?.venue?.location || null,
        name: matchInfoResponse?.venue?.name || null,
        tpId: matchInfoResponse?.venue?.venue_id || null,
        isActive: true,
        capacity: matchInfoResponse?.venue?.capacity || null,
      };

      checkVenue = await insertVenueQuery(venueData, fastify, request);
      global.tblVenues.push(checkVenue);
    } else if (checkVenue?.tpId === null || !checkVenue?.tpId) {
      const venueData = {
        tpId: matchInfoResponse?.venue?.venue_id || null,
        venueId: checkVenue.id,
      };

      checkVenue = await updateVenueQuery(venueData, fastify, request);
      const index = global.tblVenues.findIndex(item => item.id === checkVenue.id);
      global.tblVenues[index] = checkVenue;
    }
  }

  const teamA = matchInfoResponse?.teama?.team_id;
  const teamB = matchInfoResponse?.teamb?.team_id;
  let teamAData, teamBData;
  if (teamA && !nullTeamtpIds.includes(teamA)) {
    teamAData = await insertTeamAndPlayers({
      tid: teamA
    }, eventType, request, fastify);
  }
  if (teamB && !nullTeamtpIds.includes(teamB)) {
    teamBData = await insertTeamAndPlayers({
      tid: teamB
    }, eventType, request, fastify);
  }

  const isMen = !teamAData?.teamName?.toLowerCase().includes("women");

  let checkCommentary = null;
  if (teamAData && teamBData) {
    checkCommentary = global.tblCommentaries.find(item => item.tpId === data.mid);
    if (!checkCommentary) {
      let onfieldUmpires = null, thirdUmpire = null;
      if (matchInfoResponse?.umpires) {
        onfieldUmpires = parseUmpires(matchInfoResponse?.umpires).onFieldUmpires.join(', ') || null;
        thirdUmpire = parseUmpires(matchInfoResponse?.umpires).thirdUmpire || null;
      }

      let commentaryData = {
        eventTypeId: eventType?.eventTypeId || EventType['Cricket'],
        matchTypeId: matchType?.matchTypeId,
        competitionId: checkCompetition?.competitionId,
        eventDate: matchInfoResponse?.date_start,
        eventName: matchInfoResponse?.title,
        team1Id: teamAData?.teamId,
        team2Id: teamBData?.teamId,
        location: checkVenue?.name && checkVenue?.city ? `${checkVenue.name}, ${checkVenue.city}` : null,
        displayStatus: matchInfoResponse?.status_note,
        isClientShow: false,
        commentaryStatus: 1,
        tpId: entitySportMatchResponse?.match_id,
        createdBy: -2,
        CurrentInnings: -1,
        isPlayersShow: false,
        isPredictMarket: false,
        delay: 0,
        isActive: true,
        isTeamPredictionOn: true,
        isClientShow: true,
        eventNo: matchInfoResponse?.match_number,
        isVirtual: false,
        session: 1,
        pythonId: pythonIdData?.id,
        pythonURI: pythonIdData?.URI,
        isMatchDraw: false,
        isWheelShow: false,
        shotType: false,
        tossRmk: false,
        matchReferee: matchInfoResponse?.referee,
        onfieldUmpires,
        thirdUmpire,
        isTest: matchInfoResponse?.status_str.includes('test') ? true : false,
        isSignalROn: false,
        isEventStart: false,
        isCountInPoint: checkCompetition?.isPointTable,
        countryId: checkCountry?.id,
        venueId: checkVenue?.id,
        scoringType: ScoringTypes.Entity
      }
      const insertCommentary = await insertCommentaryQuery({
        ...request,
        body: commentaryData
      }, fastify);

      global.tblCommentaries.push(insertCommentary);
      checkCommentary = insertCommentary;
    }

    if (checkCommentary && checkCommentary?.commentaryId) {
      const upsertedCommentaryId = checkCommentary.commentaryId;

      const esStart = matchInfoResponse?.date_start
        ? new Date(matchInfoResponse?.date_start)
        : null;

      const localStart = checkCommentary?.eventDate
        ? new Date(checkCommentary?.eventDate)
        : null;

      if (esStart && (!localStart || esStart.getTime() !== localStart.getTime())) {
        const updated = await updateCommentaryDateByCommentaryIdQuery({
          ...request,
          body: {
            eventDate: esStart,
            commentaryId: checkCommentary?.commentaryId
          }
        }, fastify);
        const index = global.tblCommentaries.findIndex(tc => tc.commentaryId === upsertedCommentaryId);
        if (index !== -1) {
          global.tblCommentaries[index] = {
            ...global.tblCommentaries[index],
            ...updated
          };
          checkCommentary = global.tblCommentaries[index];
        }
      }

      if (matchInfoResponse?.weather && matchInfoResponse?.weather.length > 0) {
        const checkWeather = global.tblWeather.find(item => item.commentaryId === upsertedCommentaryId);
        if (checkWeather) {
          const matchWeather = matchInfoResponse?.weather[0];
          const weatherData = {
            weatherCondition: matchWeather?.weather ?? checkWeather?.weatherCondition,
            description: matchWeather?.weather_desc ?? checkWeather?.description,
            commentaryId: upsertedCommentaryId ?? checkWeather?.commentaryId,
            temp: matchWeather?.temp ?? checkWeather?.temp,
            humidity: matchWeather?.humidity ?? checkWeather?.humidity,
            visibility: matchWeather?.visibility ?? checkWeather?.visibility,
            windSpeed: matchWeather?.wind_speed ?? checkWeather?.windSpeed,
            clouds: matchWeather?.clouds ?? checkWeather?.clouds,
            id: checkWeather?.id
          };
          const updateWeather = await updateWeatherQuery(weatherData, fastify, request);
          const index = global.tblWeather.findIndex(item => item?.commentaryId === upsertedCommentaryId);
          if (index !== -1) {
            global.tblWeather[index] = updateWeather[0]
          } else {
            global.tblWeather.push(updateWeather[0]);
          }
        } else {
          const matchWeather = matchInfoResponse?.weather[0];
          const weatherData = {
            weatherCondition: matchWeather?.weather,
            description: matchWeather?.weather_desc,
            commentaryId: upsertedCommentaryId,
            temp: matchWeather?.temp,
            humidity: matchWeather?.humidity,
            visibility: matchWeather?.visibility,
            windSpeed: matchWeather?.wind_speed,
            clouds: matchWeather?.clouds
          };
          const insertWeather = await insertWeatherQuery(weatherData, fastify, request);
          global.tblWeather.push(insertWeather);
        }
      }

      if (matchInfoResponse?.pitch_details && (matchInfoResponse?.pitch_details?.pitch_condition != "" || matchInfoResponse?.pitch_details?.batting_condition != "" || matchInfoResponse?.pitch_details?.pace_bowling_condition != "" || matchInfoResponse?.pitch_details?.spine_bowling_condition != "")) {
        const checkPitchDetails = global.tblPitchConditions.find(item => item?.commentaryId === upsertedCommentaryId);
        if (checkPitchDetails) {
          const pitchConditionData = {
            pitchCondition: matchInfoResponse?.pitch_details?.pitch_condition ?? checkPitchDetails?.pitchCondition,
            battingCondition: matchInfoResponse?.pitch_details?.batting_condition ?? checkPitchDetails?.battingCondition,
            paceBowlingCondition: matchInfoResponse?.pitch_details?.pace_bowling_condition ?? checkPitchDetails?.paceBowlingCondition,
            spineBowlingConniton: matchInfoResponse?.pitch_details?.spine_bowling_condition ?? checkPitchDetails?.spineBowlingCondition,
            commentaryId: upsertedCommentaryId,
            id: checkPitchDetails?.id
          };
          const updatePitch = await updatePitchConditionQuery(pitchConditionData, fastify, request);
          const index = global.tblPitchConditions.findIndex(item => item?.commentaryId === request.body.commentaryId);
          if (index !== -1) {
            global.tblPitchConditions[index] = updatePitch[0]
          } else {
            global.tblPitchConditions.push(updatePitch[0]);
          }
        } else {
          const pitchConditionData = {
            pitchCondition: matchInfoResponse?.pitch_details?.pitch_condition,
            battingCondition: matchInfoResponse?.pitch_details?.batting_condition,
            paceBowlingCondition: matchInfoResponse?.pitch_details?.pace_bowling_condition,
            spineBowlingConniton: matchInfoResponse?.pitch_details?.spine_bowling_condition,
            commentaryId: upsertedCommentaryId
          };

          const insertPitchDetails = await insertPitchConditionQuery(pitchConditionData, fastify, request);
          global.tblPitchConditions.push(insertPitchDetails);
        }
      }

      let commentaryTeamPlayers = [];
      const noOfInning = matchType.noOfIningsPerSide;
      const maxOver = matchType.maxOversInFirstInings;
      const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
      let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
      let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

      if (teamASquad && teamASquad.length > 0) {
        commentaryTeamPlayers.push({
          commentaryId: upsertedCommentaryId,
          teamId: teamAData.teamId,
          players: teamASquad.map(item => Number(item.player_id))
        });
      }

      if (teamASquad.length === 0) {
        teamASquad = await getAllPlayersByTeamIdQuery(teamAData.teamId, fastify, request);
        teamASquad = teamASquad.filter(item => item.tpId != null);
        if (teamASquad.length === 0) {
          teamASquad = await insertTeamPlayersByTeamId(teamAData.teamId, teamAData.tpId, checkCompetition?.isMen, request, fastify);
          teamASquad = teamASquad.filter(item => item.tpId != null);
        }
        teamASquad = teamASquad?.map(item => ({
          player_id: `${item.tpId}`,
          playing11: `${true}`
        }))
      }

      if (teamBSquad && teamBSquad.length > 0) {
        commentaryTeamPlayers.push({
          commentaryId: upsertedCommentaryId,
          teamId: teamBData.teamId,
          players: teamBSquad.map(item => Number(item.player_id))
        });
      }

      if (teamBSquad.length === 0) {
        teamBSquad = await getAllPlayersByTeamIdQuery(teamBData.teamId, fastify, request);
        teamBSquad = teamBSquad.filter(item => item.tpId != null);
        if (teamBSquad.length === 0) {
          teamBSquad = await insertTeamPlayersByTeamId(teamBData.teamId, teamBData.tpId, checkCompetition?.isMen, request, fastify);
          teamBSquad = teamBSquad.filter(item => item.tpId != null);
        }
        teamBSquad = teamBSquad?.map(item => ({
          player_id: `${item.tpId}`,
          playing11: `${true}`
        }))
      }

      for (let i = 1; i <= noOfInning; i++) {
        let commentaryTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item.commentaryId === upsertedCommentaryId &&
            item.currentInnings === i
        );
        if (commentaryTeam === -1) {
          await insertCommentaryTeams({
            ...request,
            body: {
              commentaryId: upsertedCommentaryId,
              team1Id: teamAData?.teamId,
              team2Id: teamBData?.teamId,
              currentInnings: i,
              teamMaxOver: maxOver,
              team1TpId: teamAData?.tpId,
              team2TpId: teamBData?.tpId,
              drsCount: checkCompetition?.drsCount || 2
            },
          }, fastify);
          const teamACommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: upsertedCommentaryId,
            teamId: teamAData?.teamId,
            currentInnings: i
          }, fastify, request);
          const teamBCommentaryTeam = await getCommentaryTeamsQuery({
            commentaryId: upsertedCommentaryId,
            teamId: teamBData?.teamId,
            currentInnings: i
          }, fastify, request);
          global.tblCommentaryTeams.push(teamACommentaryTeam, teamBCommentaryTeam);
        }

        await insertCommentaryPlayersByTeam(i, upsertedCommentaryId, teamAData.teamId, teamASquad, entitySportMatchResponse?.players, matchType?.matchTypeId, isMen, fastify, request);
        await insertCommentaryPlayersByTeam(i, upsertedCommentaryId, teamBData.teamId, teamBSquad, entitySportMatchResponse?.players, matchType?.matchTypeId, isMen, fastify, request);
      }

      const upsertedTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => item.competitionId === checkCompetition?.competitionId);
      for (const teamPlayers of commentaryTeamPlayers) {
        const { commentaryId, teamId, players } = teamPlayers;
        const removedCommentaryPlayers = global.tblCommentaryPlayers.filter(item => item.commentaryId === commentaryId && item.teamId === teamId && !players.includes(item.tpId));
        if (removedCommentaryPlayers && removedCommentaryPlayers.length > 0) {
          const playerIds = removedCommentaryPlayers?.map(item => item.playerId);
          await deleteCommentaryPlayersByPlayerId({
            playerIds,
            commentaryId
          }, request, fastify);
          global.tblCommentaryPlayers = global.tblCommentaryPlayers.filter(item => !(item.commentaryId === commentaryId && item.teamId === teamId && playerIds.includes(item.playerId)));
        }

        const removedTournamentTeamPlayers = upsertedTournamentTeamPlayers.filter(item => item.teamId === teamId && !players.includes(item.tpId));
        if (removedTournamentTeamPlayers && removedTournamentTeamPlayers.length > 0) {
          const playerIds = removedTournamentTeamPlayers?.map(item => item.id);
          await deleteTournamentTeamPlayersQuery(playerIds, request, fastify);
          global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => !playerIds.includes(item.id));
        }
      }
    } else {
      errorLogger(
        fastify,
        `Commentary data not available of commentary TpId ${data.mid} - checkCommentary`,
        "ERROR --> services/commentary.js/matchImportService",
        request
      );
    }
  } else {
    errorLogger(
      fastify,
      `Team data not available of TpIds ${teamA} and ${teamB} in commentary TpId ${data.mid} - checkTeam`,
      "ERROR --> services/commentary.js/matchImportService",
      request
    );
  }
  if (checkCommentary?.isActive && checkCommentary?.isTest == false) {
    let cData = await getMatchDataByCId(
      {
        commentaryId: checkCommentary?.commentaryId,
      },
      request,
      fastify
    );

    callClientAPI(
      {
        serviceType: ServiceType.clientAPI,
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: cData,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("call client api console in matchImportService", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/matchImportService",
        request
      );
    });
  }

  const commentaryId = checkCommentary?.commentaryId;
  if (commentaryId) {
    const getAutoUpdateCommentary = await getAllAutoUpdateCommentaryDataQuery(
      `"wrCommentaryId" = '${commentaryId}'`,
      fastify
    );
    const isExists = getAutoUpdateCommentary && getAutoUpdateCommentary.length > 0;
    const insertDataInCommentaryUpdate = {
      commentaryId: commentaryId,
      offsetHour: null,
      status: isExists ? autoUpdateCommentaryDataStatus.noupdate : autoUpdateCommentaryDataStatus.added,
      message: `Commentary ${isExists ? "updated" : "added"}`,
      responseData: entitySportMatchResponse,
    };

    await insertAutoUpdateCommentaryDataQuery(insertDataInCommentaryUpdate, fastify);
  }

  return checkCommentary;
}
const clientSocketCountService = async (fastify) => {
  const clientScoketIo = global.clientSocketIo.filter(item => item.isUpdateView == true && 
    item.actionType == 1 && item.isActive == true
  );
  for (const socket of clientScoketIo) {
    const intervalMinutes = Number(socket.updateInterval) || 5;
    const cronExpression = `*/${intervalMinutes} * * * *`;
  
    cron.schedule(cronExpression, async () => {
      try {
        if (!global.clientSocketIo.includes(socket)) {
          if (socket.cronJob && typeof socket.cronJob.stop === 'function') {
            socket.cronJob.stop();
          }
          return;
        }
        socket.client.emit("updateRoomUserCount", { message: "Send me user counts" });
        socket.client.once("countData", async (data) => {
          for (const elem of data) {
            const currentCount = Number(elem.count) || 0;
            if(elem.commentaryId) {
              await updateCommentaryViewsQuery({
                views: currentCount,
                commentaryId: elem.commentaryId,
              }, fastify);
              const index = global.tblCommentaries.findIndex(item => item.commentaryId == elem.commentaryId);
              if (index !== -1) {
                const oldCount = Number(global.tblCommentaries[index].views) || 0;
                global.tblCommentaries[index].views = oldCount + currentCount;
              }
            }
          }

          socket.client.emit("updateCommentaryCounts", data);
        });
      } catch (error) {
        console.error(new Date(), "Error during scheduled task:", error);
      }
    });
  };
}

const undoCommentaryInningService = async (request, fastify) => {
  const startTime = new Date();
  const { commentaryId, undoInning } = request.body;

  const index = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === commentaryId && item?.currentInnings == undoInning
  );
  
  if (index == -1) {
    throw new Error("Commentary with this id not Found");
  }

  let result = await fastify.db.query(
    ` 
      CALL proc_undo_inning($1, $2, $3, $4, $5)
    `,
    {
      bind: [
        commentaryId,
        undoInning,
        request.userTokenInfo.WrUserId,
        null,
        null,
      ],
      type: fastify.db.QueryTypes.SELECT,
    }
  );
  let res = result[0];


  if (res) {
    global.tblCommentaries[index].commentaryStatus = 2;
    global.tblCommentaries[index].target = null;
    global.tblCommentaries[index].winnerId = null;
    global.tblCommentaries[index].winnerName = null;
    global.tblCommentaries[index].rmk = false;
    global.tblCommentaries[index].winRmk = null;
    global.tblCommentaries[index].updateTime = new Date();
    global.tblCommentaries[index].commentaryResult = null;
    global.tblCommentaries[index].commentaryCloseTime = null;

    const ct = global.tblCommentaryTeams.filter(
      (item) => item?.commentaryId === commentaryId && item.currentInnings == undoInning
    );
    const cp = global.tblCommentaryPlayers.filter(
      (item) => item?.commentaryId === commentaryId && item.currentInnings == undoInning
    );
    if (ct.length > 0) {
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

  // remvoe over for this commentary inning
  global.tblOvers = global.tblOvers.filter(
    (item) => !(item?.commentaryId === commentaryId && item?.currentInnings === undoInning)
  );
  // remove ball by ball for this commentary inning
  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => !(item?.commentaryId === commentaryId && item?.currentInnings === undoInning)
  );
  // remove partnership for this commentary inning
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
    (item) => !(item?.commentaryId === commentaryId && item?.currentInnings === undoInning)
  );
  // remove wicket for this commentary inning
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
    (item) => !(item?.commentaryId === commentaryId && item?.currentInnings === undoInning)
  );

  commentaryLogger(
    {
      commentaryId: commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Inning undo successfully",
      },
      global: null,
      extra: null,
      apiName: "/undoInning",
      reqStartTime: startTime,
    },
    request,
    fastify
  );

  return "Commentary inning undo successfully";
};

const undoCommentaryService = async (request, fastify) => {
  const startTime = new Date();
  try {
    let {
      commentaryTeams,
      commentaryPlayers,
      commentaryDetails,
      commentaryOvers,
      commentaryPartnership,
      deleteCommentaryBallByBallId,
      deleteOverId,
      deleteWicketId,
      deletePartnershipId,
      isEndInnings,
      updateTeamStatus,
      isCallPredict = false,
      commentaryId,
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
    let sendPartnership = [];
    let pythonURI;
    if (commentaryId) {
      commentaryData = global.tblCommentaries.find(
        (item) => item?.commentaryId === commentaryId
      );
      if (!commentaryData) {
        throw new Error("Commentary with this id not Found");
      }
      pythonURI = commentaryData.pythonURI ?? null;
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
      await notiConfigContentReplaceService(
        EventName.INNINGCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );
    }
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

    // validate commentaryTeams
    if (commentaryTeams) {
      commentaryTeams.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if (index === -1) {
          throw new Error("Commentary Team with this id not Found");
        }
      });
    }

    if(updateTeamStatus && updateTeamStatus.length > 0){
      for (let t of updateTeamStatus){
        let index = global.tblCommentaryTeams.findIndex((i)=>i.commentaryTeamId == t.commentaryTeamId)
        if(index == -1){
          throw new Error("Commentary Team with this id not found of updateTeamStatus")
        }
      }
    }

    // validate commentaryPlayers
    if (commentaryPlayers) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
      commentaryPlayers.forEach((player) => {
        if (player.commentaryPlayerId) {
          const index = global.tblCommentaryPlayers.findIndex(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId && item.commentaryId === commentaryId
          );
          if (index === -1) {
            throw new Error("Commentary Player with this id not Found");
          }
        }
      });
    }

    if (commentaryOvers) {
      overIndex = global.tblOvers.findIndex(
        (item) => item.overId === commentaryOvers.overId
      );
      if (overIndex === -1) {
        throw new Error("Over with this id not Found");
      }
    }

    if (commentaryPartnership) {
      partnershipIndex = global.tblCommentaryPartnership.findIndex(
        (item) =>
          item?.commentaryPartnershipId ==
          commentaryPartnership.commentaryPartnershipId
      );
      if (partnershipIndex === -1) {
        throw new Error("Partnership with this id not Found");
      }
    }

    let deleteKey =
      (deleteCommentaryBallByBallId?.length ?? 0) > 0 ||
      (deleteOverId?.length ?? 0) > 0 ||
      (deleteWicketId?.length ?? 0) > 0 ||
      (deletePartnershipId?.length ?? 0) > 0;

    let updatedData = await fastify.db.query(
      `CALL proc_undo_commentary_details($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      {
        bind: [
          commentaryId,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          deleteCommentaryBallByBallId?.length ? deleteCommentaryBallByBallId : null,
          deleteOverId?.length ? deleteOverId : null,
          deleteWicketId?.length ? deleteWicketId : null,
          deletePartnershipId?.length ? deletePartnershipId : null,
          deleteKey,
          deleteKey ? request.userTokenInfo.WrUserId : null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    updatedData = updatedData[0];
    const response = {};

    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    const setEventSnap = [];
    const teamPoint = [];

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
        rmk: commentaryDetails.rmk,
        winRmk: commentaryDetails.winRmk,
        tossRmk: commentaryDetails.tossRmk,
      };
      const weatherAndPitchData = await weatherAndPitchDataService(commentaryId);

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
        isPredict: commentaryDetails.isPredictMarket,
        rmk: commentaryDetails.rmk,
        winRmk: commentaryDetails.winRmk,
        tossRmk: commentaryDetails.tossRmk,
        ...weatherAndPitchData,
      };
      if (commentaryDetails.commentaryStatus == 2) {
        await notiConfigContentReplaceService(
          EventName.WINTOSS,
          commentaryDetails.commentaryId,
          request,
          fastify
        );
      }
      if (previousCommentaryStatus != statusToUpdate ) {
        callDataProvider(
          {
            commentaryId: commentaryId,
            serviceType: ServiceType.dataProviderAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            type: statusToUpdate == 4 ? "close" : "update",
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
        const cData = await getMatchDataByCId(
          {
            commentaryId: commentaryId,
          },
          request,
          fastify
        );

        callClientAPI(
          {
            serviceType: ServiceType.clientAPI,
            moduleType: APIEndpointModuleType.commentaryUpdate,
            data: cData,
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
      if (previousCommentaryStatus != statusToUpdate && statusToUpdate == 4) {
        await notiConfigContentReplaceService(
          EventName.EVENTCOMPLETED,
          commentaryData.commentaryId,
          request,
          fastify
        );
        let com = global.tblCompetitions.find(
          (item) => item.competitionId === commentaryData.competitionId
        );
        if (com && com.isEventSnap == true) {
          setEventSnap.push({
            commentaryId: commentaryId,
            eventRefId: commentaryData.eventRefId,
            competitionId: commentaryData.competitionId,
            eventTypeId: commentaryData.eventTypeId,
          });
        }
        if (
          com &&
          com.isPointTable == true &&
          commentaryData?.isTest == false
        ) {
          teamPoint.push({
            commentaryId: commentaryId,
            competitionId: commentaryData.competitionId,
            team1Id: commentaryData.team1Id,
            team2Id: commentaryData.team2Id,
            winnerId: commentaryDetails.winnerId,
          });
        }
        if (setEventSnap.length > 0) {
          setCompEventSnapSerice(setEventSnap, request, fastify).catch(
            (err) => {
              console.log("setCompEventSnapSerice console savedetails", err);
              errorLogger(
                fastify,
                err.message,
                "ERROR --> services/commentary.js/saveDetails - syncCommentaryStatsWithAPIAndSocket - setEventSnap",
                request
              );
            }
          );
        }
        if (teamPoint.length > 0) {
          setTeamPointService(teamPoint, request, fastify).catch((err) => {
            console.log("setTeamPointService console savedetails", err);
            errorLogger(
              fastify,
              err.message,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setTeamPointService",
              request
            );
          });
        }
        if (commentaryData && commentaryData?.isTest === false) {
          try {
            const result = await fastify.db.query(
              `SELECT * FROM fn_insert_auto_update_player_statistics_by_commentary(:commentaryId, :createdBy)`,
              {
                replacements: {
                  commentaryId,
                  createdBy: request?.userTokenInfo?.WrUserId || -3
                },
                type: fastify.db.QueryTypes.SELECT
              }
            );

            if (result && result.length > 0) {
              const notInsertedCPIds = result.map(r => r.status === "skipped")?.map(r => r.player_id);
              errorLogger(
                fastify,
                `CommentaryId: ${commentaryId} and PlayerId: ${notInsertedCPIds.join(", ")} skipped`,
                "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
                request
              );
            }
          } catch (error) {
            errorLogger(
              fastify,
              `Error in fn_insert_auto_update_player_statistics_by_commentary for CommentaryId: ${commentaryId} => ${error.message}`,
              "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - fn_insert_auto_update_player_statistics_by_commentary",
              request
            );
          }
          // setPlayerHistoryService(
          //   {
          //     commentaryId: [commentaryId],
          //   },
          //   request,
          //   fastify
          // ).catch((err) => {
          //   console.log("setPlayerHistoryService console savedetails", err);
          //   errorLogger(
          //     fastify,
          //     err.message,
          //     "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setPlayerHistoryService",
          //     request
          //   );
          // });
        }

        const tipsData = global.tblTips
          .filter(
            (item) =>
              item.commentaryId === commentaryDetails.commentaryId ||
              item.eventRefId === commentaryDetails.eventRefId
          )
          .map((elem) => elem.id);
        if (tipsData.length > 0) {
          global.tblTips = global.tblTips.filter(
            (item) => !tipsData.includes(item.id)
          );
          callClientAPI(
            {
              serviceType: ServiceType.clientAPI,
              moduleType: APIEndpointModuleType.updateSeoModule,
              data: {
                module: "tips",
                type: "delete",
                data: {
                  id: tipsData,
                },
              },
            },
            request,
            fastify
          )
        }
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
        team.crr = parseFloat(team?.crr) || 0;
        team.rrr = parseFloat(team?.rrr) || 0;
        if(team.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for team ${team.teamName}. Expected: ${commentaryId}, Found: ${team.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        } else {
           global.tblCommentaryTeams[index] = {
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
          };
          response.commentaryTeams.push(global.tblCommentaryTeams[index]);
        }
      });
      try {
        response.commentaryTeams.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: response.commentaryTeams.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
      });
    }
    if(updateTeamStatus && updateTeamStatus != null){
      response.updateTeamStatus = [];
      updateTeamStatus.forEach((team) => {
        const index = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === team.commentaryId &&
            item.commentaryTeamId === team.commentaryTeamId
        );
        if(team.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for team ${team.teamName}. Expected: ${commentaryId}, Found: ${team.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        else {
          global.tblCommentaryTeams[index] = {
            ...global.tblCommentaryTeams[index],
          ...team,
          teamPredictionPercentage:
            global.tblCommentaryTeams[index].teamPredictionPercentage,
          };
          response.updateTeamStatus.push(global.tblCommentaryTeams[index]);
        }
      });
      try {
        response.updateTeamStatus.forEach(async (team) => {
          const _teamsC1 = global.tblTeams.filter(
            (item) => item.teamId === team.teamId
          );
          if (_teamsC1.length > 0) {
            team.image = _teamsC1[0].image;
            team.jersey = _teamsC1[0].jersey;
            team.nimage = _teamsC1[0].imagePath;
            team.njersey = _teamsC1[0].jerseyPath;
          }
        });
      } catch (error) { }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        data: response.updateTeamStatus.map((team) => ({
          ...team,
          crr: parseFloat(team?.crr) || 0,
          rrr: parseFloat(team?.rrr) || 0,
        })),
      });
    }
    
    if (deleteCommentaryBallByBallId && deleteCommentaryBallByBallId.length > 0) {
      response.deleteCommentaryBallByBallId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deleteCommentaryBallByBallIds",
        data: { commentaryBallByBallId: deleteCommentaryBallByBallId },
      });
      for (const deleteBallByBallId of deleteCommentaryBallByBallId) {
        try {
          _deleteBallID = {};
          _deleteBallID.commentaryBallByBallId = deleteBallByBallId;
          _deleteBallID.commentaryId = commentaryId;
          await deleteMarketOddsBallByBall(_deleteBallID, fastify, request);
        } catch (error) {
          console.log(new Date(), "delete market odds ball by ball console", error);
          errorLogger(
            fastify,
            error.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        // call predictscore
        const strikeTeam = global.tblCommentaryTeams.find(
          (item) => item?.commentaryId === commentaryId && item.teamStatus === 1
        );
        const nonStrikeTeam = global.tblCommentaryTeams.find(
          (item) => item?.commentaryId === commentaryId && item.teamStatus === 2
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
          const deleteBallByBallIndex = global.tblCommentaryBallByBall.findIndex(item => item.commentaryBallByBallId == deleteBallByBallId)
          if(deleteBallByBallIndex !== -1) {
            balltypeOfdeleteBall =
              global.tblCommentaryBallByBall[deleteBallByBallIndex].ballType;
          }
          if (balltypeOfdeleteBall > 0 && previousBall) {
          if (commentaryData.isPredictMarket && isCallPredict == true) {
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
                wicket: _wkt === true ? 1 : 0,
                total_wicket: strikeTeam.teamWicket,
                ball_by_ball_id: deleteBallByBallId
                  ? parseInt(deleteBallByBallId)
                  : null,
                ballType: previousBall?.ballType ?? null,
                target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
              },
              "/api/v1/undoscore",
              fastify,
              request,
              pythonURI
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
      }
      global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
        (item) => !deleteCommentaryBallByBallId.includes(item?.commentaryBallByBallId)
      );
    }
    if (deleteOverId && deleteOverId.length > 0) {
      response.deleteOverId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deleteOverIds",
        data: { overId: deleteOverId },
      });
      global.tblOvers = global.tblOvers.filter(
        (item) => !deleteOverId.includes(item?.overId)
      );
    }
    if (deleteWicketId && deleteWicketId.length > 0) {
      response.deleteWicketId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deleteWicketIds",
        data: { commentaryWicketId: deleteWicketId },
      });
      global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
        (item) => !deleteWicketId.includes(item?.commentaryWicketId)
      );
    }
    if (deletePartnershipId && deletePartnershipId.length > 0) {
      response.deletePartnershipId = true;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "deletePartnershipIds",
        data: { commentaryPartnershipId: deletePartnershipId },
      });
      global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
        (item) => !deletePartnershipId.includes(item?.commentaryPartnershipId)
      );
    }
    if (commentaryPlayers) {
      response.commentaryPlayers = [];
      commentaryPlayers.forEach((player) => {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        if( player.commentaryId !== commentaryId) {
          errorLogger(
            fastify,
            `Commentary ID mismatch for player ${player.playerName}. Expected: ${commentaryId}, Found: ${player.commentaryId}`,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        }
        else {
           response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds?.displayName,
        });
        }
       
      });
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
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
          const _player = global.tblPlayers.filter(
            (item) => item.playerId === player.playerId
          );
          if (_player.length > 0) {
            player.playerimage = _player[0].image;
            player.playerType = _player[0].playerType;
            player.isKipper = _player[0].isKipper;
          }
        });
      } catch (error) { }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }

    if (commentaryOvers) {
      if (overIndex !== -1) {
        global.tblOvers[overIndex] = commentaryOvers;
      }
      response.overdetails = commentaryOvers;
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryOvers",
        type: "update",
        data: response.overdetails,
      });
    }

    if (commentaryPartnership) {
      global.tblCommentaryPartnership[partnershipIndex] = commentaryPartnership
      response.commentaryPartnershipDetails = commentaryPartnership;

      if (response.commentaryPartnershipDetails) {
        try {
          const partnership = response.commentaryPartnershipDetails;
          const _player1 = commentaryPlayers.filter(
            (item) => item.commentaryPlayerId === partnership.batter1Id
          );
          if (_player1.length > 0) {
            response.commentaryPartnershipDetails.player1image =
              _player1[0].playerimage;
            response.commentaryPartnershipDetails.player1jerseyandimage =
              _player1[0].jerseyPlayerImage;
            response.commentaryPartnershipDetails.player1jerseyandimagepath =
              _player1[0].jerseyPlayerImagePath;
          }

          // Find player 2 image
          const _player2 = commentaryPlayers.filter(
            (item) => item.commentaryPlayerId === partnership.batter2Id
          );
          if (_player2.length > 0) {
            response.commentaryPartnershipDetails.player2image =
              _player2[0].playerimage;
            response.commentaryPartnershipDetails.player2jerseyandimage =
              _player2[0].jerseyPlayerImage;
            response.commentaryPartnershipDetails.player2jerseyandimagepath =
              _player2[0].jerseyPlayerImagePath;
          }
        } catch (error) { }
      }

      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPartnership",
        type: "update",
        data: response.commentaryPartnershipDetails,
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
        console.log(new Date(), "handle market closes services console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
      if (isCallPredict == true) {
        let isNodePrediction = global.tblConfigs.find((item) => item.key === configConstants.ISPREDICATIONFROMNODE)?.value || "false";
        if (isNodePrediction !== "true") {
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
            request,
            pythonURI
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
      setLineRatioInComService(
        {
          commentaryId: commentaryDetails.commentaryId,
          matchTypeId: commentaryData.matchTypeId,
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
      const eventMarket = await closeEventMarketByCIdQuery(
        {
          commentaryId: commentaryDetails.commentaryId,
        },
        fastify
      );
      if (eventMarket.length > 0) {
        for (const updatedItem of eventMarket) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.marketId
          );
          if (index !== -1) {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        }
      }

      global.tblMarketRunnerV2
        .filter((elem) =>
          eventMarket.some((e) => e.marketId === elem.eventMarketId)
        )
        .forEach((elem) => {
          elem.selectionStatus = EventMarketStatus.Close;
        });

      if (isCallPredict == true) {
        callPredictorMarket(
          {
            commentary_id: commentaryDetails.commentaryId,
          },
          "/api/v1/endcommentary",
          fastify,
          request,
          pythonURI
        ).catch((err) => {
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
            request
          );
        });
      }
      let competition = global.tblCompetitions.find(
        (item) => item.competitionId === commentaryDetails.competitionId
      );
      await notiConfigContentReplaceService(
        EventName.EVENTCOMPLETED,
        commentaryData.commentaryId,
        request,
        fastify
      );
      if (competition.isEventSnap == true) {
        setCompEventSnapSerice(
          [
            {
              commentaryId: commentaryDetails.commentaryId,
              eventRefId: commentaryDetails.eventRefId,
              competitionId: commentaryDetails.competitionId,
              eventTypeId: commentaryDetails.eventTypeId,
            },
          ],
          request,
          fastify
        ).catch((err) => {
          console.log("setCompEventSnapSerice console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket - setCompEventSnapSerice",
            request
          );
        });
      }
      if (
        competition.isPointTable == true &&
        commentaryDetails.isTest == false
      ) {
        setTeamPointService(
          [
            {
              commentaryId: commentaryDetails.commentaryId,
              competitionId: commentaryDetails.competitionId,
              team1Id: commentaryDetails.team1Id,
              team2Id: commentaryDetails.team2Id,
              winnerId: commentaryDetails.winnerId,
            },
          ],
          request,
          fastify
        ).catch((err) => {
          console.log("setTeamPointService console", err);
          errorLogger(
            fastify,
            err.message,
            "ERROR --> services/commentary.js/setTeamPointServicsyncCommentaryStatsWithAPIAndSocket - setTeamPointService",
            request
          );
        });
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
            commentaryId : commentaryData.commentaryId
          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log(new Date(), "err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
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
    if (deleteCommentaryBallByBallId || deleteOverId) {
      const clientInRoom = global.socketIo.sockets.adapter.rooms.get(
        `score-${commentaryId}`
      );
      if (clientInRoom?.size) {
        global.socketIo.to(`score-${commentaryId}`).emit("undoCalled", {
          commentaryId: commentaryId,
          message: "Undo called for this commentary.",
        });
      }
    }
    if (isEndInnings && isEndInnings == true && isCallPredict == true) {
      callPredictorMarket(
        {
          commentary_id: commentaryData.commentaryId,
          match_type_id: commentaryData.matchTypeId,
          strike_team_id: strikeTeamForEndInnings.teamId,
        },
        "/api/v1/endinnings",
        fastify,
        request,
        pythonURI
      ).catch((err) => {
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
          request
        );
      });
    }
    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: request.body,
        response: response,
        global: {
            partnership: global.tblCommentaryPartnership.filter(
              (item) => item?.commentaryId === commentaryId
            ),
          },
        extra: null,
        apiName: "/undoDetails",
        reqStartTime: startTime,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/undoCommentaryService",
        request
      );
    });
    response.callPredictions = callPredictions;
    return response;
  } catch (error) {
    console.log(new Date(), "console value undo details", error);
    errorLogger(
      fastify,
      error.message,
      "ERROR --> services/commentary.js/undoCommentaryService-error",
      request
    );
    try {
      await commentaryLogger(
        {
          commentaryId: request.body.commentaryId,
          requestBody: request.body,
          response: {
            error: error.message,
          },
          global: {
            partnership: global.tblCommentaryPartnership.filter(
              (item) => item?.commentaryId === commentaryId
            ),
          },
          extra: null,
          apiName: "/undoDetails",
          reqStartTime: startTime,
        },
        request,
        fastify
      )
    } catch (err) {
      console.log(new Date(), "commentary logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/undoCommentaryService-",
        request
      );
    }
    throw error;
  }
};

const commentaryViewsReportService = async (request, fastify) => {
  const {
    commentaryStatus,
    eventTypeId,
    competitionId,
    isVirtual,
    startDate,
    endDate,
    pythonId,
  } = request.body || {};

  const result = await fastify.db.query(
    `CALL proc_commentary_views_list($1, $2, $3, $4, $5, $6, $7, $8)`,
    {
      bind: [
        commentaryStatus ?? null,
        eventTypeId ?? null,
        competitionId ?? null,
        isVirtual ?? null,
        startDate ?? null,
        endDate ?? null,
        pythonId ?? null,
        null,
      ],
      type: fastify.db.QueryTypes.SELECT
    }
  );

  return result[0]?.commentary_list ?? [];
};
const checkSUpdatePasswordService = async(request,fastify) =>{
  let com = global.tblCommentaries.find((i)=> i.commentaryId == request.body.commentaryId);
  if(!com){
    throw new Error("Commentary with this id not found")
  }
  let pass = global.tblConfigs.find((i)=>i.key == configConstants.SUPDATEPASS)?.value || null
  if(!pass){
    throw new Error("Password not found in config")
  }
  if(pass != request.body.password){
    throw new Error("Invalid password")
  }
  return true;

}

const updateCommentaryPlayersFromEntityService = async (request, fastify) => {
  const { response } = request.body;
  const checkEntitySportAPIEndpoint = checkEntitySportAPIEndpointIsActive(APIEndpointModuleType.getMatchDataByIdFromEntity);
  if (!checkEntitySportAPIEndpoint.data) {
    errorLogger(fastify, checkEntitySportAPIEndpoint.message, "/services/commentary.js/matchImportService - checkEntitySportAPIEndpoint", request);
    return false;
  }

  const url = checkEntitySportAPIEndpoint.data.replace("{mid}", response?.match_id);
  const entitySportMatch = await callEntitySportAPI(url, request, fastify);

  let entitySportMatchResponse = entitySportMatch?.data?.result;
  if (!entitySportMatchResponse) {
    errorLogger(fastify, "Invalid response from Entit-Sport API", "/services/commentary.js/matchImportService - entitySportMatchResponse", {
      ...request,
      originalUrl: url
    }, entitySportMatch?.data);
    return false;
  }

  let checkCommentary = global.tblCommentaries.find(item => item.tpId == response?.match_id);
  if (!checkCommentary) {
    return;
  }
  const commentaryId = checkCommentary?.commentaryId
  const matchInfoResponse = entitySportMatchResponse?.match_info;
  const currentInnings = matchInfoResponse?.latest_inning_number
  const playerList = entitySportMatchResponse?.players;
  const teamA = matchInfoResponse?.teama?.team_id;
  const teamB = matchInfoResponse?.teamb?.team_id;
  const matchPlaying11Squad = entitySportMatchResponse?.["match-playing11"];
  let teamASquad = matchPlaying11Squad?.teama?.squads?.length > 0 ? matchPlaying11Squad?.teama?.squads : [];
  let teamBSquad = matchPlaying11Squad?.teamb?.squads?.length > 0 ? matchPlaying11Squad?.teamb?.squads : [];

  await processTeamSquadInsertAndUpdate({
    squad: teamASquad,
    teamTpId: teamA,
    entitySportMatchResponse,
    fastify,
    request
  });
  await processTeamSquadInsertAndUpdate({
    squad: teamBSquad,
    teamTpId: teamB,
    entitySportMatchResponse,
    fastify,
    request
  });

  return true;
}

const processTeamSquadInsertAndUpdate = async ({
  squad,
  teamTpId,
  entitySportMatchResponse,
  fastify,
  request
}) => {
  try {
    if (!Array.isArray(squad) || !teamTpId || !entitySportMatchResponse) return;

    const matchInfoResponse = entitySportMatchResponse?.match_info;
    const playerList = entitySportMatchResponse?.players;
    const commentaryDetails = global.tblCommentaries.find(item => item.tpId == matchInfoResponse?.match_id);
    if (!commentaryDetails) return;
    const commentaryId = commentaryDetails?.commentaryId

    const teamObj = global.tblTeams.find(t => t.tpId == teamTpId);
    if (!teamObj) return;

    const matchType = global.tblMatchTypes.find(
      item => item.entityEnum === matchInfoResponse?.format
    );

    if (!matchType) {
      errorLogger(
        fastify,
        `Match Type not found for format ${matchInfoResponse?.format}`,
        "ERROR --> services/commentary.js/processTeamSquadInsertAndUpdate",
        request
      );
      return;
    }

    const currentInnings = matchInfoResponse?.latest_inning_number

    const compTpId = matchInfoResponse?.competition?.cid;
    const compData = global.tblCompetitions.find(c => c.tpId == compTpId);

    const teamPlayersCache = await getAllPlayersByTeamIdQuery(
      teamObj.teamId, fastify, request
    );

    for (const player of squad) {

      if (!player?.player_id) continue;

      const entitySocketData = global.tblEntitySockets[0];

      // FIND PLAYER IN GLOBAL LIST
      const ply = playerList.find(p => p.pid == player.player_id);

      let checkPlayer =
        global.tblPlayers.find(p => p.tpId == player.player_id) ||
        global.tblPlayers.find(p =>
          (p.tpId === null || p.tpId === undefined) &&
          p.playerName?.trim()?.toLowerCase() ===
          player?.name?.replace(/'/g, "").trim()?.toLowerCase()
        );

      // PLAYER DOES NOT EXIST
      if (!checkPlayer) {
        let countryObj = null;

        if (ply?.nationality) {
          const normalizedNationality = ply.nationality.trim().toLowerCase();

          countryObj = global.tblCountryCodes.find(
            c => c.countryName?.trim()?.toLowerCase() === normalizedNationality
          );

          if (!countryObj) {
            const newCountry = await insertCountryCodeQuery(
              {
                countryName: ply.nationality,
                isActive: true
              },
              fastify,
              request
            );

            global.tblCountryCodes.push(newCountry);
            countryObj = newCountry;
          }
        }
        const insertData = {
          eventTypeId: EventType.Cricket,
          playerTypeId: EntityPlayerType[ply?.playing_role],
          playerName: ply?.title,
          displayName: ply?.short_name || ply?.title,
          countryId: countryObj?.id,
          isActive: true,
          isKipper: ply?.playing_role === "wk",
          isLeftHandedBatting: ply?.batting_style ? !ply.batting_style.includes("Right") : false,
          isLeftArmFielding: ply?.bowling_style ? !ply.bowling_style.includes("Right") : false,
          userId: -2,
          batsmanAverage: 0,
          batsmanStrikeRate: 0,
          bowlerAverage: 0,
          bowlerEconomy: 0,
          tpId: player.player_id,
          bowlingStyleId: ply?.bowling_type
            ? EntityBowlingStyleType[ply.bowling_type.toLowerCase()]
            : null,
          bowlingTypeId: extractBowlingStyle(ply?.bowling_type, ply?.bowling_style),
          image: entitySocketData?.defaultPlayerImage || null,
          imagePath: entitySocketData?.defaultPlayerImagePath || null,
          isMen: compData?.isMen,
          birthDate: ply?.birthdate || null,
          birthPlace: ply?.birthplace ?? null
        };

        const newPlayer = await insertPlayerQuery(insertData, fastify, request);

        global.tblPlayers.push(newPlayer);
        checkPlayer = newPlayer;
      }

      //PLAYER EXISTS BUT tpId MISSING
      if (checkPlayer?.tpId == null) {
        const updated = await updateExchangePlayerQuery(
          {
            userId: -2,
            tpId: player.player_id,
            playerId: checkPlayer.playerId
          },
          fastify,
          request
        );

        const idx = global.tblPlayers.findIndex(p => p.playerId == updated.playerId);
        if (idx !== -1) global.tblPlayers[idx] = updated;

        checkPlayer = updated;
      }

      // TEAM PLAYER
      const existsInTeam = teamPlayersCache.some(
        t => t.playerId === checkPlayer.playerId
      );

      let teamPlayerRecord = null;

      if (!existsInTeam) {
        teamPlayerRecord = await insertTeamPlayerQuery(
          {
            teamId: teamObj.teamId,
            refPlayerId: checkPlayer?.playerId,
            tpId: player.player_id,
            userId: -2,
            jerseyPlayerImage: entitySocketData?.defaultPlayerJerseyImage || null,
            jerseyPlayerImagePath: entitySocketData?.defaultPlayerJerseyImagePath || null
          },
          fastify,
          request
        );

        await updateTeamPlayerHomeTeamQuery(
          {
            refPlayerId: checkPlayer.playerId,
            teamId: teamObj.teamId
          },
          fastify,
          request
        );
      }
      //COMMENTARY PLAYER UPDATE/INSERT
      const isPlaying11 = player?.playing11 === "true";

      const commIndex = global.tblCommentaryPlayers.findIndex(
        item =>
          item.commentaryId == commentaryId &&
          item.playerId == checkPlayer.playerId &&
          item.teamId == teamObj.teamId
      );
      if (commIndex === -1) {
        const newComm = await insertCommentaryPlayers(
          {
            commentaryId,
            teamId: teamObj.teamId,
            playerId: checkPlayer.playerId,
            displayOrder: teamPlayerRecord?.playerOrder || 0,
            matchTypeId: matchType.matchTypeId,
            tpId: checkPlayer.tpId,
            jerseyPlayerImage: teamPlayerRecord?.jerseyPlayerImage || null,
            jerseyPlayerImagePath: teamPlayerRecord?.jerseyPlayerImagePath || null,
            isInPlayingEleven: isPlaying11
          },
          currentInnings,
          fastify,
          request
        );
 
        global.tblCommentaryPlayers.push(newComm[0]);
      } else {
        await playingElevenChangeOnCommPlayersQuery(
          {
            isInPlayingEleven: isPlaying11,
            commentaryPlayerId:
              global.tblCommentaryPlayers[commIndex].commentaryPlayerId,
            playerId: checkPlayer?.playerId
          },
          fastify,
          request
        );

        global.tblCommentaryPlayers[commIndex].isInPlayingEleven = isPlaying11;
      }

      //TOURNAMENT TEAM PLAYER
      const existsTournament = global.tblTournamentTeamPlayers.some(
        elem =>
          elem.competitionId === compData?.competitionId &&
          elem.teamId === teamObj.teamId &&
          elem.playerId === checkPlayer.playerId
      );

      if (!existsTournament) {
        const tournamentInsert = await insertTournamentTeamPlayersQuery(
          {
            competitionId: compData?.competitionId,
            teamId: teamObj.teamId,
            playerId: checkPlayer.playerId,
            playerName: checkPlayer.playerName,
            userId: -2,
            tpId: checkPlayer.tpId
          },
          request,
          fastify
        );

        global.tblTournamentTeamPlayers.push(tournamentInsert[0]);
      }
    }

    return true;
  } catch (err) {
    console.log("processTeamSquadInsertAndUpdate ERROR:", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/processTeamSquadInsertAndUpdate",
      request
    );
  }
};

const getHeadToHeadCommentaryService = async (request, fastify) => {
  const { team1Id, team2Id, matchTypeId } = request.body;

  const matchTypeData = global.tblMatchTypes.find(tmt => tmt.matchTypeId === matchTypeId);
  if (!matchTypeData) {
    throw new Error(`Match type id ${matchTypeId} not found`);
  }

  const team1Data = global.tblTeams.find(team => team.teamId === team1Id);
  if (!team1Data) {
    throw new Error(`team1Id ${team1Id} not found`);
  }

  const team2Data = global.tblTeams.find(team => team.teamId === team2Id);
  if (!team2Data) {
    throw new Error(`team2Id ${team2Id} not found`);
  }

  return getHeadToHeadCommentaryQuery(
    { team1Id, team2Id, matchTypeId },
    request,
    fastify
  );
};

const getCommentaryStatisticsService = async (request, fastify) => {
  const competitionId = request.body.competitionId;
  const result = await getCommentaryStatisticsQuery(competitionId, request, fastify);
  const filterResult = result?.map(r => r.matchTypeId);
  const hasDuplicates = new Set(filterResult).size !== filterResult.length;
  if(hasDuplicates) {
    throw new Error(`This competition id ${competitionId} has not valid statistics`);
  }
  return result || [];
};

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
  revertCommentaryService,
  getGlobalDataService,
  getTemplateByComIdService,
  saveComTemplatesService,
  getCommentaryBallByBallService,
  saveWagonWheelPositionService,
  updateShotTypeService,
  updateIsWheelShowService,
  getTeamAndPlayerListServiceV1,
  cancelCommentaryService,
  deleteEventResultService,
  isCountInPointCommentaryService,
  multiIsCountInPointCommentaryService,
  getRunnerOfMarketService,
  getEventMarketAndRunnersService,
  commentaryHistoryService,
  deleteCommentaryHistoryService,
  getAllCompletedCommentaryService,
  upDLSDetailsService,
  updateMergeImageOnCommentaryPlayersService,
  changeIsTestComService,
  changeisEventStartService,
  getAllDifficultyService,
  commentaryStatusService,
  notiConfigContentReplaceService,
  saveComVirtual,
  commentaryStartService,
  commentaryTossService,
  commentaryScoreService,
  commentaryOverStartService,
  commentarySwapPlayerService,
  commentaryInningChangeService,
  getPitchAndSessionService,
  updatePitchAndSessionService,
  commentaryWicketService,
  commentarySetPlayerService,
  updatePythonAPIOnCommentaryService,
  undoAPIService,
  undoAPIService2,
  changeStrikerPlyService,
  changePlayerService,
  changeOverService,
  updateEventTypeAndCompIdService,
  getCommWicketByIdService,
  updateCommWicketService,
  scoringTypeCommentaryService,
  validatePasswordOnPredictionFalseService,
  updateMatchInfoService,
  getGroupId,
  overTypeChangeOnOversService,
  updateStreamURLService,
  syncEntitySportCommentaryService,
  weatherAndPitchDataService,
  bowlingTypeChangeService,
  matchImportService,
  insertTeamAndPlayers,
  clientSocketCountService,
  undoCommentaryInningService,
  undoCommentaryService,
  commentaryViewsReportService,
  checkSUpdatePasswordService,
  updateCommentaryPlayersFromEntityService,
  getHeadToHeadCommentaryService,
  getCommentaryStatisticsService
};
