const { updateAverageOfPlayerQuery } = require("../repository/TableCommentary");
const {
  getAllEventMarketsQuery,
  deleteEventMarketQuery,
  changeIsActiveEventMarketQuery,
  changeIsAllowEventMarketQuery,
  changeIsResultEventMarketQuery,
  getMarketListByCIdQuery,
  updateEventMarketRateQuery,
  changeMarketCancelQuery,
  changeMarketResultQuery,
  changeMarketCloseQuery,
  suspendEventMarketQuery,
  closeEventMarketByTeamIdQuery,
  getMarketLogsByCIdQuery,
  cancelEventMarketByTeamIdQuery,
  upsertEventMarketSPQuery,
  getEventMarketByIdsQuery,
  setDelayEventMarketQuery,
  getDataLogsByMarketQuery,
  getStatusLogsByMarketQuery,
  setLineRatioEventMarketQuery,
  getMarketDataByCIdQuery,
  UpdateResulOrApproveEventMarketQuery,
  updateComInMarketQuery,
  getMarketListWithCategoryNameByCIdQuery,
  closeMarketQuery,
  cancelMarketQuery,
  getAllEventMarketsAndRunnersQuery,
  getAllRateSourceEventMarketQuery,
  getEventMarketsQuery,
  cancelSettledMarketQuery,
  getAllEventMarketsQueryV1,
  upsertEventMarketSPQueryV1,
  updateEventMarketRateQueryV1,
  getEventMarketByIdsQueryV1,
  getMarketListByCIdQueryV1,
  getMarketWithRunnerQuery,
  updateResultMultiMarketQuery,
  closeMarketByATQuery,
  cancelMarketByATQuery,
  updateEventMarketCloseSuspendTimeQuery,
} = require("../repository/TableEventMarkets");
const { getRunnerByIdQuery, setResultInRunnerMarketQuery, getRunnerByMarketQuery } = require("../repository/TableMarketRunner");
const configConstants = require("../utilities/configConstants");
const {
  EventMarketStatus,
  MarketActionType,
  ActionTypeForMarketCancel,
  callPredictorMarket,
  MarketUpdateType,
  commentaryStatus,
  MarketTypeId,
} = require("../utilities/index");
const { marketLogger, marketDataLogger, errorLogger, eventMarketLogger } = require("../utilities/logger");
const getDetailsByCIdService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // i want this structure as per innings
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === commentary.matchTypeId
  );

  // i want to set the commentaryTeam and playerTeam as per innings
  const totalInnings = matchType.noOfIningsPerSide;
  // add extra one where if commentary already toss then i want to set the team as per toss

  const teamAndPlayers = [];
  for (let i = 1; i <= totalInnings; i++) {
    // get team for this innings
    let commentaryTeam;
    if (commentary.commentaryStatus !== 1) {
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === i &&
          item.teamStatus === 1
      );
    } else {
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId && item.currentInnings === i
      );
    }
    // get players for this innings and commentaryTeam.teamId
    let teamObj = {};
    for (team of commentaryTeam) {
      commentaryPlayers = global.tblCommentaryPlayers.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.teamId === team.teamId &&
          item.currentInnings === i
      );
      teamObj = {
        ...team,
        players: commentaryPlayers,
      };
      teamAndPlayers.push(teamObj);
    }
  }

  // get marketTemplate where matchType is commentary.matchTypeId
  const marketTemplate = global.tblMarketTemplate.filter(
    (item) => item.matchTypeID === commentary.matchTypeId  && item.isShowInAdvanceMarket === true && item.isActive === true
  );
  // let eventMarket = global.tblEventMarkets.filter(
  //     (item) => item.commentaryId === commentaryId
  //     && item.status !== EventMarketStatus.Cancel
  //     && item.status !== EventMarketStatus.Close
  //     && item.status !== EventMarketStatus.Settled
  // );
  let eventMarket, LDOMARKETSIDS;
  LDOMARKETSIDS = global.tblConfigs.find(config => config.key === "LDOMARKET")?.value ?? "0";
  let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tem."wrCommentaryId" = ${commentaryId} AND tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel}) AND tem."wrMarketTypeCategoryId" NOT IN (${LDOMARKETSIDS})`;
  if (commentary.commentaryStatus != 1) {
    let battingTeam = global.tblCommentaryTeams.find(
      (item) =>
        item.commentaryId === commentaryId &&
        item.currentInnings === 1 &&
        item.teamStatus === 1
    );
    whereCondition += ` AND tem."wrTeamID" = ${battingTeam.teamId}`;
    eventMarket = await getAllEventMarketsQuery(fastify, whereCondition);
  } else {
    eventMarket = await getAllEventMarketsQuery(fastify, whereCondition);
  }
  //
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName
  }));
  return {
    commentary,
    matchType,
    teamAndPlayers,
    marketTemplate,
    eventMarket,
    categories,
  };
};
const getAllEventMarketsService = async (request, fastify) => {
  const {
    isActive,
    eventTypeId,
    competitionId,
    eventId,
    status,
    startDate,
    endDate,
    rateSourceRefId
  } = request.body;
  let createWhereStatus = `tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel}) AND tc."wrIsDelete" = false`;

  if (status !== undefined && status != -1) {
    createWhereStatus = `tc."wrIsDelete" = false AND tem."wrStatus" = ${status}`;
  }
  if (status != undefined && status == -1) {
    createWhereStatus = null;
  }
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
 
  let eventMarket = await getEventMarketsQuery(fastify, createWhereStatus);
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventTypeId === eventTypeId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.competitionId === competitionId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventId === eventId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  // add dateFilter if provided
  if (startDate && endDate) {
    eventMarket = eventMarket?.filter((item) => {
      return (
        new Date(item.eventDate) >= new Date(startDate) &&
        new Date(item.eventDate) <= new Date(endDate)
      );
    });
  }
  return eventMarket;
};
const getEventMarketByIdService = async (request, fastify) => {
  const { eventMarketId } = request.body;
  let eventMarket = global.tblEventMarkets.find(
    (item) => item.eventMarketId === eventMarketId
  );
  return eventMarket;
};
const createEventMarketsService = async (request, fastify) => {
  const { eventMarket } = request.body;
  // check the commentaryId
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === eventMarket[0].commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // check if toss done
  if(commentary.commentaryStatus != commentaryStatus.OPEN && commentary.commentaryStatus != commentaryStatus.COMPLETED){
    // check if in eventMarket batting team market not to create
    let bowling = global.tblCommentaryTeams.find(
      (item) =>
        item.commentaryId === commentary.commentaryId &&
        item.currentInnings === commentary.currentInnings &&
        item.teamStatus !== 1 
    );
    if(bowling){
      let market = eventMarket.find(
        (item) => item.teamId === bowling.teamId
      );
      if(market){
        throw new Error(`${bowling.teamName}'s market not created because this team is not on Strike`);
      }
    }
  }
  const result = await upsertEventMarketSPQuery(eventMarket, request, fastify);

  const dataOfmarkets = await getEventMarketByIdsQuery(
    {
      eventMarketIds: result.eventMarketIds,
    },
    request,
    fastify
  );

  for (let item of dataOfmarkets) {
    let index = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (index === -1) {
      global.tblEventMarkets.push(item);
      marketDataLogger(
        {
          eventMarketId: item.eventMarketId,
          commentaryId: item.commentaryId,
          dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
          updateType: MarketUpdateType.marketInitilization,
          isSendData: true
        },
        request,
        fastify
      ).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/createEventMarketsService",
          request
        );
      });
    } else {
      let previousLine = global.tblEventMarkets[index].line;
      global.tblEventMarkets[index] = item;
      marketDataLogger(
        {
          eventMarketId: item.eventMarketId,
          commentaryId: item.commentaryId,
          dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
          updateType: MarketUpdateType.marketInitilization,
          lineDiff: item.line - previousLine,
          isSendData: true
        },
        request,
        fastify
      ).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/createEventMarketsService",
          request
        );
      });;
    }
  }
  return "Event Market saved successfully";
};

const deleteEventMarketsService = async (request, fastify) => {
  // get the eventMarketId from request
  const { eventMarketId } = request.body;
  await deleteEventMarketQuery(eventMarketId, request, fastify);

  global.tblEventMarkets = global.tblEventMarkets.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );

  return "Event Market deleted successfully";
};
const activeInactiveMarketsService = async (request, fastify) => {
  // validate eventMarketId
  const { eventMarketId, isActive } = request.body;
  let eventMarket = global.tblEventMarkets.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if (eventMarket === -1) {
    throw new Error("EventMarket with this id not Found");
  }
  // update the eventMarket
  await changeIsActiveEventMarketQuery(request.body, request, fastify);

  global.tblEventMarkets[eventMarket].isActive = isActive;

  return "Event Market updated successfully";
};
const updateAllowMarketsService = async (request, fastify) => {
  const { eventMarketId, isAllow } = request.body;
  let eventMarket = global.tblEventMarkets.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if (eventMarket === -1) {
    throw new Error("EventMarket with this id not Found");
  }

  await changeIsAllowEventMarketQuery(request.body, request, fastify);
  global.tblEventMarkets[eventMarket].isAllow = isAllow;
  return "Event Market updated successfully";
};
const getEventListByCompetitionIdsService = async (request, fastify) => {
  // validate competitionId
  const { competitionId } = request.body;
  let competition = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );
  if (!competition) {
    throw new Error("Competition with this id not Found");
  }
  // get the eventlist by competitionId
  let eventList = global.tblEvents
    .filter((item) => item.competitionId === competitionId)
    .map((item) => ({
      eventId: item.eventId,
      eventName: item.eventName,
      eventDate: item.eventDate,
    }));
  return eventList;
};
const marketListResultFalseService = async (request, fastify) => {
  const {
    isActive,
    eventTypeId,
    competitionId,
    eventId,
    status,
    startDate,
    endDate,
    rateSourceRefId
  } = request.body;
  
  let createWhereStatus = `tem."wrIsResult" = false AND tem."wrResult" IS NOT NULL AND tem."wrStatus" = ${EventMarketStatus.Settled} AND tc."wrIsDelete" = false`;
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  // let mt = global.tblMarketTypes.filter((item) => item.marketTypeName.toLowerCase() === "line market" || item.marketTypeName.toLowerCase() === "fancy").map(item => item.marketTypeId);
  // if(mt.length > 0){
    createWhereStatus += ` AND tem."wrMarketTypeId" IN (${MarketTypeId.LineMarket},${MarketTypeId.Fancy})`;
  // }
  let eventMarket = await getAllEventMarketsQuery(
    fastify,
    createWhereStatus
  );

  
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventTypeId === eventTypeId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.competitionId === competitionId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventId === eventId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  // add dateFilter if provided
  if (startDate && endDate) {
    eventMarket = eventMarket?.filter((item) => {
      return (
        new Date(item.eventDate) >= new Date(startDate) &&
        new Date(item.eventDate) <= new Date(endDate)
      );
    });
  }
  if (status !== undefined) {
    eventMarket = eventMarket.filter((item) => item.status === status);
  }
  // if (isActive !== undefined) {
  //   eventMarket = eventMarket.filter((item) => item.isActive === isActive);
  // }

  return eventMarket;
};
const changeResultOfMarketService = async (request, fastify) => {
  const { eventMarketId, isResult } = request.body;
  // let eventMarket = global.tblEventMarkets.findIndex(
  //   (item) => item.eventMarketId === eventMarketId
  // );
  // if (eventMarket === -1) {
  //   throw new Error("EventMarket with this id not Found");
  // }
  // if isresult is true then dont allow to change the result
  // if (global.tblEventMarkets[eventMarket].isResult) {
  //   throw new Error("Result of this market is already set");
  // }          
  await changeIsResultEventMarketQuery(request.body, request, fastify);
  // global.tblEventMarkets[eventMarket].isResult = isResult;

  marketLogger(
    {
      eventMarketId,
      actionType: MarketActionType.isresultSet,
      value: isResult,
    },
    request,
    fastify
  ).catch((err) => {
    console.log("market data logger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/changeResultOfMarketService",
      request
    );
  });

  return "Event Market updated successfully";
};
const marketListByCIdService = async (request, fastify) => {
  const { commentaryId } = request.body;
  // validate the commentaryId
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const marketList = await getMarketListByCIdQuery(
    request.body,
    request,
    fastify
  );

  // get the team and teamName by commentaryId
  const teams = global.tblCommentaryTeams
    .filter((item) => item.commentaryId === commentaryId)
    .reduce((acc, current) => {
      if (!acc.some(item => item.teamId === current.teamId)) {
        acc.push(current);
      }
      return acc;
    }, [])
    .map((item) => {
      return {
        teamId: item.teamId,
        teamName: item.teamName,
      };
    });
  // 
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName,
    displayOrder: item.displayOrder
  }));

  // let players = global.tblCommentaryPlayers
  // .filter((item) => item.commentaryId === commentaryId)
  // .map((player) => ({
  //   teamId: player.teamId,
  //   playerId: player.playerId,
  //   commentaryPlayerId: player.commentaryPlayerId,
  //   playerName: player.playerName,
  //   batsmanAverage: player.batsmanAverage,
  //   batsmanStrikeRate: player.batsmanStrikeRate,
  //   bowlerEconomy: player.bowlerEconomy,
  //   bowlerAverage: player.bowlerAverage,
  // }));
  return {
    marketList,
    teams,
    categories,
    //players,
  };
};
const marketListByCIdServiceV1 = async (request, fastify) => {
  const { commentaryId } = request.body;
  // validate the commentaryId
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const marketList = await getMarketListByCIdQueryV1(
    request.body,
    request,
    fastify
  );

  // get the team and teamName by commentaryId
  const teams = global.tblCommentaryTeams
    .filter((item) => item.commentaryId === commentaryId)
    .reduce((acc, current) => {
      if (!acc.some(item => item.teamId === current.teamId)) {
        acc.push(current);
      }
      return acc;
    }, [])
    .map((item) => {
      return {
        teamId: item.teamId,
        teamName: item.teamName,
      };
    });
  // 
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName,
    displayOrder: item.displayOrder
  }));

  // let players = global.tblCommentaryPlayers
  // .filter((item) => item.commentaryId === commentaryId)
  // .map((player) => ({
  //   teamId: player.teamId,
  //   playerId: player.playerId,
  //   commentaryPlayerId: player.commentaryPlayerId,
  //   playerName: player.playerName,
  //   batsmanAverage: player.batsmanAverage,
  //   batsmanStrikeRate: player.batsmanStrikeRate,
  //   bowlerEconomy: player.bowlerEconomy,
  //   bowlerAverage: player.bowlerAverage,
  // }));
  return {
    marketList,
    teams,
    categories,
    //players,
  };
};
const updateMarketRateService = async (request, fastify) => {
  // i got array of eventMarket i want to update this data
  const { eventMarket } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.eventMarket[0].commentaryId
  );
  if (!commentary) {
    //here
    throw new Error("Commentary with this id not Found");
  }
  let updatedOvers = [];
  let playerMarket = [];
  for (let item of eventMarket) {
    let eventMarket = await getEventMarketByIdsQuery(
      {
        eventMarketIds: [item.marketId],
      },
      request,
      fastify
    );
    eventMarket = eventMarket[0];
    if(
      eventMarket.status === EventMarketStatus.Close ||
      eventMarket.status === EventMarketStatus.Settled ||
      eventMarket.status === EventMarketStatus.Cancel
    ){
      // continue the loop and dont update the market
      continue;
    }

    let data = await updateEventMarketRateQuery(item, request, fastify);
    if(data.isPlayer){
      playerMarket.push(data);
    }
    // console.log(data);
    let diff = data.line - eventMarket.line;
    let is_onlyover = 0;
    let category = global.tblMarketTypeCategories.find(
      (cat) => cat.marketTypeCategoryId == data.marketTypeCategoryId
    );
    if(category){
      if(category.categoryName.toLowerCase() != "player" && category.categoryName.toLowerCase() != "wicket"){
        if (category.categoryName === "Only Over") {
          is_onlyover = 1;
        }
        updatedOvers.push({
          over: item.over,
          value: diff.toFixed(2),
          line_ratio: data.lineRatio,
          is_onlyover: is_onlyover,
          is_allow: item.isAllow,
          is_active: item.isActive,
          is_senddata: item.isSendData,
          data: data.data,
          market_type_category_id: parseInt(data.marketTypeCategoryId),
        });
      }
    }
   
   
    let index = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.marketId
    );
    if (index !== -1) {
      global.tblEventMarkets[index] = data;
    } else {
      global.tblEventMarkets.push(data);
    }

    marketDataLogger(
      {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
        dataTosave: typeof (data.data) === "string" ? JSON.parse(data.data) : data.data,
        updateType: MarketUpdateType.marketInitilization,
        lineDiff: diff,
        isSendData: true
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateMarketRateService",
        request
      );
    });
    
  }

  const teamOnStrike = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.currentInnings === commentary.currentInnings &&
      item.teamStatus === 1
  );
  let _resFromPredictAPI;
  let callPredictions = [];
  if (teamOnStrike && request.body.action && (request.body.action.toUpperCase() === "SAVE_ALL")) {
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        match_type_id: commentary.matchTypeId,
        strike_team_id: teamOnStrike.teamId,
        current_score: teamOnStrike.teamScore || 0,
        current_over: parseFloat(teamOnStrike.teamOver) || 0.0,
        overs: updatedOvers,
      },
      "/api/v1/updateline",
      fastify,
      request
    );
    let callPrediction = {}
    // Check for error_msg in the response
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/updateline';
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = 'Prediction call successful';
      callPrediction.endPoint = '/api/v1/updateline';
    }
    callPredictions.push(callPrediction);
  }
  if(commentary.isPredictMarket && request.body.action && (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH"))
  {
    _resFromPredictAPI = null;
    let isOpenMarket = (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH");
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        status: request.body.eventMarket[0].status,
        match_type_id: commentary.matchTypeId,
        is_open_market:isOpenMarket  
      },
      "/api/v1/updatemarketstatus",
      fastify,
      request
    );
    let callPrediction = {}
    // Check for error_msg in the response
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/updatemarketstatus';
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = 'Prediction call successful';
      callPrediction.endPoint = '/api/v1/updatemarketstatus';
    }
    callPredictions.push(callPrediction);
  }

  if(playerMarket.length > 0){
    for (let p of playerMarket){
      let comPlayer = global.tblCommentaryPlayers.findIndex(
        (item) => item.commentaryPlayerId === p.playerId
      );
      if (comPlayer === -1) {
        errorLogger(
          fastify,
          "Player with this id not Found",
          "ERROR --> services/commentary.js/updateMarketRateService",
          request
        );
        continue;
      }
      let avg = p.line - global.tblCommentaryPlayers[comPlayer].batRun;
      await updateAverageOfPlayerQuery({
        commentaryPlayerId: p.playerId,
        batsmanAverage: avg,
      }, request, fastify);	
      global.tblCommentaryPlayers[comPlayer].batsmanAverage = avg;
    }
  }

  //return "Event Market updated successfully";
  // return marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify)
  let data = await marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify);
  data.callPrediction = callPredictions;
  return data;
};
const saveEventMarketService = async (request, fastify) => {
  const { eventMarketId, commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  let body = {
    ...request.body,
    status: EventMarketStatus.Inactive,
  };
  if (eventMarketId !== 0) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (item) => item.eventMarketId === eventMarketId
    );
    if (eventMarket === -1) {
      throw new Error("EventMarket with this id not Found");
    }
    body = {
      ...request.body,
      status: global.tblEventMarkets[eventMarket].status,
    };
  }
  let result = await upsertEventMarketSPQuery([body], request, fastify);

  const dataOfmarkets = await getEventMarketByIdsQuery(
    {
      eventMarketIds: result.eventMarketIds,
    },
    request,
    fastify
  );

  for (let item of dataOfmarkets) {
    let index = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    index === -1
      ? global.tblEventMarkets.push(item)
      : (global.tblEventMarkets[index] = item);

    marketDataLogger(
      {
        eventMarketId: item.eventMarketId,
        commentaryId: item.commentaryId,
        dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
        updateType: MarketUpdateType.marketInitilization,
        isSendData: true
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/saveEventMarketService",
        request
      );
    });
  }
  return dataOfmarkets[0];
};

const changeMarketCancelService = async (request, fastify) => {
  const { eventMarketId, commentaryId, password } = request.body;
  // let eventMarket = global.tblEventMarkets.findIndex(
  //   (item) => item.eventMarketId === eventMarketId
  // );
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if(!commentary){
    throw new Error("Commentary with this id not Found");
  }
  // if (eventMarket === -1) {
  // throw new Error("EventMarket with this id not Found");
  let checkMarketInDb = await getEventMarketByIdsQuery(
    {
      eventMarketIds: [eventMarketId],
    },
    request,
    fastify
  );
  // if (checkMarketInDb.length == 0) {
  //   throw new Error("EventMarket with this id not Found");
  // } else {
  //   global.tblEventMarkets.push(checkMarketInDb[0]);
  //   eventMarket = global.tblEventMarkets.findIndex(
  //     (item) => item.eventMarketId === eventMarketId
  //   );
  // }
  // }
  // if (!commentary) {
  //   throw new Error("Commentary with this id not Found");
  // }
  // get password from config
  const configPassword = global.tblConfigs.find(
    (item) => item.key === configConstants.PASSWORD
  ).value;
  if (configPassword !== password) {
    throw new Error("Password is incorrect");
  }
  const currentStatus = checkMarketInDb[0].status;
  if (currentStatus === EventMarketStatus.Close) {
    await changeMarketCancelQuery(request.body, request, fastify);
    // global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
    if(commentary.commentaryStatus == commentaryStatus.INPROGRESS || commentary.commentaryStatus ==commentaryStatus.COMPLETED){
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item.commentaryId === commentaryId && item.teamStatus === 1
      );
      await callPredictorMarket(
        {
          commentary_id: parseInt(commentaryId),
          status: parseInt(EventMarketStatus.Cancel),
          match_type_id: parseInt(commentary.matchTypeId),
          event_market_id: parseInt(eventMarketId),
          strike_team: strikeTeam.teamId,
        },
        "/api/v1/marketmanualclose",
        fastify,
        request
      );
    }
    return "Market Cancel updated successfully";
  } else {
    throw new Error("Market is not currently closed, so it cannot be canceled");
  }
};
const changeMarketResultService = async (request, fastify) => {
  const { eventMarketId, commentaryId, result } = request.body;
  // let eventMarket = global.tblEventMarkets.findIndex(
  //   (item) => item.eventMarketId === eventMarketId
  // );
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  // if (eventMarket === -1) {
  //   throw new Error("EventMarket with this id not Found");
  // }
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  let eventMarket = await getEventMarketByIdsQuery(
    {
      eventMarketIds: [eventMarketId],
    },
    request,
    fastify
  );
  if(eventMarket.length === 0){
    throw new Error(
      "EventMarketId not found"
    );
  }
  
  // check marketType 
  let marketType = global.tblMarketTypes.find(
    (item) => item.marketTypeId === eventMarket[0].marketTypeId
  );
  if (marketType && (eventMarket[0].marketTypeId === MarketTypeId.Fancy || eventMarket[0].marketTypeId === MarketTypeId.LineMarket)) {
    const currentStatus = eventMarket[0].status;
    const currentResult = eventMarket[0].result;
    if (currentStatus === EventMarketStatus.Close && currentResult == null) {
      await changeMarketResultQuery(request.body, request, fastify);
      // global.tblEventMarkets[eventMarket].result = result;
      if(commentary.commentaryStatus === commentaryStatus.INPROGRESS || commentary.commentaryStatus === commentaryStatus.COMPLETED){
        const strikeTeam = global.tblCommentaryTeams.find(
          (item) => item.commentaryId === commentaryId && item.teamStatus === 1
        );
        await callPredictorMarket(
          {
            commentary_id: parseInt(commentaryId),
            status: parseInt(EventMarketStatus.Settled),
            match_type_id: parseInt(commentary.matchTypeId),
            event_market_id: parseInt(eventMarketId),
            strike_team: strikeTeam.teamId,
          },
          "/api/v1/marketmanualclose",
          fastify,
          request
        );
      }
      return "Market result updated successfully";
    } else {
      throw new Error(
        "Market is not closed or result is already set, so it cannot be updated"
      );
    }
  }
  else {
    // check the runnerId in request
    let data = await getRunnerByIdQuery(fastify, request , `"wrEventMarketId" = ${eventMarketId} AND "wrRunnerId" = ${result}`);
     if(!data){
      throw new Error("Runner with this id not Found");
    }
    await setResultInRunnerMarketQuery(request.body, request, fastify);
    if(commentary.commentaryStatus === commentaryStatus.INPROGRESS || commentary.commentaryStatus === commentaryStatus.COMPLETED){
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item.commentaryId === commentaryId && item.teamStatus === 1
      );
      await callPredictorMarket(
        {
          commentary_id: parseInt(commentaryId),
          status: parseInt(EventMarketStatus.Settled),
          match_type_id: parseInt(commentary.matchTypeId),
          event_market_id: parseInt(eventMarketId),
          strike_team: strikeTeam.teamId,
        },
        "/api/v1/marketmanualclose",
        fastify,
        request
      );
    }
    return "Market result updated successfully";
  }
};
const changeMarketCloseService = async (request, fastify) => {
  const { eventMarketId, commentaryId } = request.body;
  // let eventMarket = global.tblEventMarkets.findIndex(
  //   (item) => item.eventMarketId === eventMarketId
  // );
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  let checkMarketInDb;
  // if (eventMarket === -1) {
  // throw new Error("EventMarket with this id not Found");
  checkMarketInDb = await getEventMarketByIdsQuery(
    {
      eventMarketIds: [eventMarketId],
    },
    request,
    fastify
  );
  // if(checkMarketInDb.length == 0){
  //   throw new Error("EventMarket with this id not Found");
  // }
  // else {
  //   global.tblEventMarkets.push(checkMarketInDb[0]);
  //   eventMarket = global.tblEventMarkets.findIndex(
  //     (item) => item.eventMarketId === eventMarketId
  //   );
  // }
  // }

  if (checkMarketInDb.length === 0) {
    throw new Error("EventMarketId not Found");
  }
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const currentStatus = checkMarketInDb[0].status;
  if (
    ![
      EventMarketStatus.Settled,
      EventMarketStatus.Cancel,
      EventMarketStatus.Close,
    ].includes(currentStatus)
  ) {
    await changeMarketCloseQuery(request.body, request, fastify);
    let _resFromPredictAPI;
    let callPrediction = {};
    // global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;
    // global.tblEventMarkets[eventMarket].data = updatedData;
    // console.log("updatedData", updatedData);
    if(commentary.commentaruStatus === commentaryStatus.INPROGRESS || commentary.commentaryStatus === commentaryStatus.COMPLETED){
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item.commentaryId === commentaryId && item.teamStatus === 1
      );
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: parseInt(commentaryId),
          status: parseInt(EventMarketStatus.Close),
          match_type_id: parseInt(commentary.matchTypeId),
          event_market_id: parseInt(eventMarketId),
          strike_team: strikeTeam.teamId,
        },
        "/api/v1/marketmanualclose",
        fastify,
        request
      );
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = '/api/v1/marketmanualclose';
      } else {
        callPrediction.predictioncallSuccess = true;
        callPrediction.predictionMessage = 'Prediction call successful';
        callPrediction.endPoint = '/api/v1/marketmanualclose';
      }
    }

    return {
      message: "Market close updated successfully",
      callPrediction: callPrediction,
    };
  } else {
    return {
      message: "Market is already settled, canceled, or closed, so it cannot be updated to close.",
      callPrediction: {},
    };
  }
};
const suspendMarketByCIdService = async (request, fastify) => {
  let { commentaryId } = request.body;
  // i have array of commentaryId i want to get the eventMarketId
  // array of commentaryId not one value
  let eventMarkets = global.tblEventMarkets.filter((item) =>
    commentaryId.includes(item.commentaryId)
  );
  if (eventMarkets.length == 0) {
    throw new Error("No market found for this commentary");
  }

  const updateMarket = await suspendEventMarketQuery(
    request.body,
    request,
    fastify
  );
  for (let item of updateMarket) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    global.tblEventMarkets[eventMarket].status = EventMarketStatus.Suspend;
  }

  let commentaryArr = global.tblCommentaries
    .filter((item) => commentaryId.includes(item.commentaryId))
    .map((item) => {
      return {
        commentary_id: item.commentaryId,
        match_type_id: item.matchTypeId,
      };
    });
  let _resFromPredictAPI;
  let callPrediction = {};
  _resFromPredictAPI = await callPredictorMarket(
    commentaryArr,
    "/api/v1/suspendallmarkets",
    fastify,
    request
  );
  if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
    callPrediction.predictioncallSuccess = false;
    callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
    callPrediction.endPoint = '/api/v1/suspendallmarkets';
  } else {
    callPrediction.predictioncallSuccess = true;
    callPrediction.predictionMessage = 'Prediction call successful';
    callPrediction.endPoint = '/api/v1/suspendallmarkets';
  }
  return {
    message: 'Market suspended successfully',
    callPrediction: callPrediction,
  };
  //return "Market suspended successfully";
};
const commentaryTypeService = async (request, fastify) => {
  let result = global.tblCommentaries.filter(
    (item) => item.commentaryStatus === 1 || item.commentaryStatus === 2
  );

  // get commentary Teams for this commentary
  for (let item of result) {
    // unique teamid for this commentary
    const teams = global.tblCommentaryTeams
      .filter((team) => team.commentaryId === item.commentaryId)
      .map((team) => {
        return {
          teamId: team.teamId,
          teamName: team.teamName,
          shortName: team.shortName,
        };
      })
      .filter(
        (value, index, self) =>
          self.findIndex((t) => t.teamId === value.teamId) === index
      );

    item.teams = teams;

    const totalInnings = global.tblMatchTypes.find(
      (match) => match.matchTypeId === item.matchTypeId
    );

    if (!totalInnings) {
      throw new Error("Match Type not found");
    }
    item.totalInnings = totalInnings.noOfIningsPerSide;
  }

  return result || null;
};
const marketTemplateTypeService = async (request, fastify) => {
  const { commentaryId } = request.body;
  return null;
};
const setDelayEventMarketService = async (request, fastify) => {
  // get the eventMarketId from request
  const updatedId = await setDelayEventMarketQuery(
    request.body,
    request,
    fastify
  );
  for (let i of updatedId) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (item) => item.eventMarketId === i.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].delay = request.body.delay;
    }
  }
  return "Event Market delay value added successfully";
};
const setLineRatioService = async (data, request, fastify) => {
  let matchTypeOfCommentary = global.tblCommentaries.find(
    (item) => item.commentaryId === data.commentaryId
  ).matchTypeId;

  if (!matchTypeOfCommentary) {
    throw new Error("Match Type not found");
  }

  const updateLineRatio = await setLineRatioEventMarketQuery(
    {
      commentaryId: data.commentaryId,
      matchTypeId: matchTypeOfCommentary,
      status: [
        EventMarketStatus.Close,
        EventMarketStatus.Settled,
        EventMarketStatus.Cancel,
      ],
    },
    request,
    fastify
  );

  return updateLineRatio;
};
const handleMarketCloseService = async (data, request, fastify) => {
  // check the eventMarket close log for this commentaryId
  const checkLog = await getMarketLogsByCIdQuery(
    {
      commentaryId: data.commentaryId,
      actionType: MarketActionType.closeMarketOnTossWin,
    },
    request,
    fastify
  );
  if (checkLog[0].count > 0) {
    return "Market already closed";
  }
  // close the market for bowling team for this commentary
  let bowlingTeam = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId == data.commentaryId &&
      item.currentInnings === data.inningsId &&
      item.teamStatus == 2
  );

  let closeMar1 = await closeEventMarketByTeamIdQuery(
    {
      commentaryId: data.commentaryId,
      teamId: bowlingTeam.teamId,
      inningsId: data.inningsId,
    },
    request,
    fastify
  );
  // close market Directly
  let closeMar2 = await closeMarketByATQuery({
    commentaryId : data.commentaryId
  },request,fastify)

  const updateData = [...closeMar1, ...closeMar2];

  for (let item of updateData) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;
      global.tblEventMarkets[eventMarket].data = item.data;
    }
    marketLogger(
      {
        eventMarketId: item.eventMarketId,
        actionType: MarketActionType.closeMarket,
        value: `eventMarketStatus : ${EventMarketStatus.Close}`,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/handleMarketCloseService",
        request
      );
    });
  }

  // cancel the market as per actionType
  let cancelMarket1 = await cancelEventMarketByTeamIdQuery(
    {
      commentaryId: data.commentaryId,
      teamId: bowlingTeam.teamId,
      inningsId: data.inningsId,
      actionType: ActionTypeForMarketCancel.winCloseCancel,
    },
    request,
    fastify
  );
  let cancelMarket2 = await cancelMarketByATQuery({
    commentaryId : data.commentaryId
  }, request, fastify);
  const cancelMarket = [...cancelMarket1, ...cancelMarket2];

  for (let item of cancelMarket) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
      global.tblEventMarkets[eventMarket].data = item.data;
    }
    marketLogger(
      {
        eventMarketId: item.eventMarketId,
        actionType: MarketActionType.marketCancel,
        value: `eventMarketStatus : ${EventMarketStatus.Cancel}`,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/handleMarketCloseService",
        request
      );
    });
  }
  // settle the lineration as per requirement
  // await setLineRatioService(data, request, fastify);

  marketLogger(
    {
      commentaryId: data.commentaryId,
      actionType: MarketActionType.closeMarketOnTossWin,
      value: `eventMarketStatus : ${EventMarketStatus.Close}`,
    },
    request,
    fastify
  ).catch((err) => {
    console.log("market data logger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/commentary.js/handleMarketCloseService",
      request
    );
  });

  return "Market closed successfully";
};
const getDSReportEventMarketService = async (request, fastify) => {
  // get data logs for this eventMarketId'
  const result = await getDataLogsByMarketQuery(request, fastify);

  return result;
};
const getSLReportEventMarketService = async (request, fastify) => {
  // get data logs for this eventMarketId'
  const result = await getStatusLogsByMarketQuery(request, fastify);

  return result;
};
const getMarketDataByCIdService = async (request, fastify) => {
  const { commentaryId } = request.body;
  // validate the commentaryId
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId == commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const marketList = await getMarketDataByCIdQuery(request, fastify);

  let dataToreturn = marketList.map((item) => {
    return {
      teamName: item.teamName,
      ...JSON.parse(item.data),
    };
  });

  return dataToreturn;
};

const UpdateResulOrApproveEventMarketService = async (request, fastify) => {
  const { eventMarketId, isResult, result } = request.body;

  await UpdateResulOrApproveEventMarketQuery(request.body, request, fastify);
  if (isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setAndFinalizeResult,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateResulOrApproveEventMarketService",
        request
      );
    });;
  }
  if (!isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setResult,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/UpdateResulOrApproveEventMarketService",
        request
      );
    });
  }

  return "Event Market updated successfully";
};
const updateComInMarketService = async (data, request, fastify) => {
  let updateData = await updateComInMarketQuery(data, request, fastify);
  for (let item of updateData) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].commentaryId = data.commentaryId;
    }
  }
  return "Event Market updated successfully";
};

const marketListcategoryNameByCIdService = async (request, fastify) => {
  const { commentaryId } = request.body;
  // validate the commentaryId
  let commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

  const marketList = await getMarketListWithCategoryNameByCIdQuery(
    request.body,
    request,
    fastify
  );

  // get the team and teamName by commentaryId
  const teams = global.tblCommentaryTeams
    .filter((item) => item.commentaryId === commentaryId)
    .reduce((acc, current) => {
      if (!acc.some(item => item.teamId === current.teamId)) {
        acc.push(current);
      }
      return acc;
    }, [])
    .map((item) => {
      return {
        teamId: item.teamId,
        teamName: item.teamName,
      };
    });
  //
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName
  }));
  return {
    marketList,
    teams,
    categories,
  };
};
const setAllMarketCloseService = async (request, fastify) => {
  let { password } = request.body;
  // get password from config
  const configPassword = global.tblConfigs.find(
    (item) => item.key == configConstants.ALLMARKETCLOSEPASS
  )?.value;
  if (!configPassword) {
    throw new Error("Password not found in config");
  }
  if(password !== configPassword){
    throw new Error("Password is incorrect");
  }

  // close market which is open
  await closeMarketQuery(request, fastify);

  return "All Market closed successfully";

};
const setCloseMarketCancelService = async (request, fastify) => {
  let { password } = request.body;
  // get password from config
  const configPassword = global.tblConfigs.find(
    (item) => item.key == configConstants.ALLMARKETCANCELPASS
  )?.value;
  if (!configPassword) {
    throw new Error("Password not found in config");
  }
  if(password !== configPassword){
    throw new Error("Password is incorrect");
  }

  // close market which is open
  await cancelMarketQuery(request, fastify);

  return "All Market canceled successfully";
}

const getAllEventMarketsAndRunnersService = async (fastify, request) => {
  let eventMarkets = await getAllRateSourceEventMarketQuery(fastify, request.body);
  
  eventMarkets = await Promise.all(eventMarkets.map(async (runner) => {
    let marketRunnerData = await getAllEventMarketsAndRunnersQuery(fastify, runner);

    marketRunnerData = marketRunnerData.map((item) => {
      let teamNameData;
      
      if (item.teamId) {
        teamNameData = global.tblCommentaryTeams.find(
          (elem) => elem?.teamId === item?.teamId
        );
      } 
      if(!item.teamId) {
        teamNameData = global.tblCommentaryTeams.find(
          (t) => t.teamName?.toLowerCase() === item?.runner?.toLowerCase()
        );
      }
      return {
        runnerId: item.runnerId,
        runner: item.runner,
        selectionId: item.selectionId,
        backSize: item.backSize,
        laySize: item.laySize,
        backPrice: item.backPrice,
        layPrice: item.layPrice,
        teamId: item.teamId,
        teamName: teamNameData?.teamName || null,
      };
    });

    return {
      eventMarketId: runner.eventMarketId,
      eventRefId: runner.eventRefId,
      runners: marketRunnerData,
    };
  }));

  return eventMarkets;
};
const cancelSettleMarketService = async (request, fastify) => {
  let { eventMarketId, password } = request.body;
  // get password from config
  const configPassword = global.tblConfigs.find(
    (item) => item.key === configConstants.PASSWORD
  ).value;
  if (configPassword !== password) {
    throw new Error("Password is incorrect");
  }
  let checkMarketInDb = await getEventMarketByIdsQuery(
    {
      eventMarketIds: [eventMarketId],
    },
    request,
    fastify
  );
  if (checkMarketInDb.length == 0) {
    throw new Error("EventMarket with this id not Found");
  }
  await cancelSettledMarketQuery(request.body, request, fastify);
  let eventIndex = global.tblEventMarkets.findIndex(
    (e) => e.eventMarketId === eventMarketId
  );
  if (eventIndex !== -1) {
    global.tblEventMarkets[eventIndex].status = EventMarketStatus.Cancel;
  }
  return "Market Cancel updated successfully";

}
const getMarketTypeCategoryService = async (request, fastify) => {
  let data = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId == request.body.marketTypeCategoryId
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName,
    displayOrder: item.displayOrder,
    displayName : item.displayName
  }));
  return data;
}

const getDetailsByCIdV1Service = async (request, fastify) => {
  const { commentaryId } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  const matchType = global.tblMatchTypes.find(
    (item) => item.matchTypeId === commentary.matchTypeId
  );

  const totalInnings = matchType.noOfIningsPerSide;

  const teamAndPlayers = [];
  for (let i = 1; i <= totalInnings; i++) {
    let commentaryTeam;
    if (commentary.commentaryStatus !== 1) {
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === i &&
          item.teamStatus === 1
      );
    } else {
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId && item.currentInnings === i
      );
    }
    let teamObj = {};
    for (team of commentaryTeam) {
      commentaryPlayers = global.tblCommentaryPlayers.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.teamId === team.teamId &&
          item.currentInnings === i
      );
      teamObj = {
        ...team,
        players: commentaryPlayers,
      };
      teamAndPlayers.push(teamObj);
    }
  }

  const marketTemplate = global.tblMarketTemplate.filter(
    (item) => item.matchTypeID === commentary.matchTypeId  && item.isShowInAdvanceMarket === true && item.isActive === true
  );

  for (temp of marketTemplate) {
    if(temp.isPredefineRunnerValue == true){
      // find the runner value
      let runners = global.tblMarketTemplateRunners.filter(
        (item) => item.marketTemplateId === temp.marketTemplateId
      );
      // sort the runner by runnerId asc
      temp.runners = runners.sort((a, b) => a.marketTemplateRunnerId - b.marketTemplateRunnerId);
    }
    else {
      temp.runners = [];
    }
  }
  let eventMarket;
  // LDOMARKETSIDS = global.tblConfigs.find(config => config.key === "LDOMARKET")?.value ?? "0";
  let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tem."wrCommentaryId" = ${commentaryId} AND 
  tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel})
  AND tem."wrRateSource" = 1`;
  if (commentary.commentaryStatus != 1) {
    let battingTeam = global.tblCommentaryTeams.find(
      (item) =>
        item.commentaryId === commentaryId &&
        item.currentInnings === 1 &&
        item.teamStatus === 1
    );
    whereCondition += ` AND tem."wrTeamID" = ${battingTeam.teamId}`;
    eventMarket = await getAllEventMarketsQueryV1(fastify, whereCondition);
  } else {
    eventMarket = await getAllEventMarketsQueryV1(fastify, whereCondition);
  }
  //
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName,
    displayOrder: item.displayOrder
  }));
  let marketTypes = global.tblMarketTypes.filter(
    (elem) => elem.isActive === true
  ).map(item => ({
    marketTypeId: item.marketTypeId,
    marketTypeName: item.marketTypeName,
    displayOrder: item.displayOrder
  }));

  return {
    commentary,
    matchType,
    teamAndPlayers,
    marketTemplate,
    eventMarket,
    categories,
    marketTypes
  };
};
const createEventMarketsServiceV1 = async (request, fastify) => {
  try {
    const { eventMarket } = request.body;
  // check the commentaryId
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === eventMarket[0].commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  // check if toss done
  if(commentary.commentaryStatus != commentaryStatus.OPEN && commentary.commentaryStatus != commentaryStatus.COMPLETED){
    // check if in eventMarket batting team market not to create
    let bowling = global.tblCommentaryTeams.find(
      (item) =>
        item.commentaryId === commentary.commentaryId &&
        item.currentInnings === commentary.currentInnings &&
        item.teamStatus !== 1 
    );
    if(bowling){
      let market = eventMarket.find(
        (item) => item.teamId === bowling.teamId
      );
      if(market){
        throw new Error(`${bowling.teamName}'s market not created because this team is not on Strike`);
      }
    }
  }
  let multiRunnerMarket = [];
  let singleRunnerMarket = [];
  let marketNameNullMarket = [];
  for (let item of eventMarket){
    // let mt = global.tblMarketTypes.find(
    //   (e) => e.marketTypeId === item.marketTypeId
    // );
    // if(mt.marketTypeName.toLowerCase() === "fancy" || mt.marketTypeName.toLowerCase() === "linemarket"){
    //   singleRunnerMarket.push(item); 
    // }
    // else {
    //   if(item.marketName){
    //     multiRunnerMarket.push(item);
    //   }
    //   else {
    //     marketNameNullMarket.push(item);
    //   }
    // }
    if(item.marketTypeId == MarketTypeId.Fancy || item.marketTypeId == MarketTypeId.LineMarket){
      // singleRunnerMarket.push(item); 
      if(item.eventMarketId == 0) {
        if(item?.beforeSuspendMin && item.beforeSuspendMin > 0){
          let minTominus = item.beforeSuspendMin;
          let date = new Date(commentary.eventDate); 
          date.setMinutes(date.getMinutes() - minTominus); // Subtract the minutes
          let formattedDate = date.toISOString().replace('T', ' ').replace('Z', '+00');
          item.afterSuspendTime = formattedDate;
        }
        else {
          item.afterSuspendTime = null;
        }
        if(item?.beforeCloseMin && item.beforeCloseMin > 0){
          let minTominus = item.beforeCloseMin;
          let date = new Date(commentary.eventDate); 
          date.setMinutes(date.getMinutes() - minTominus); // Subtract the minutes
          let formattedDate = date.toISOString().replace('T', ' ').replace('Z', '+00');
          item.afterCloseTime = formattedDate;
        }
        else {
          item.afterCloseTime = null;
        }
        singleRunnerMarket.push(item);
      }
      else {
        singleRunnerMarket.push(item);
      }
    }
    else {
      if(item.marketName){
        if(item.eventMarketId == 0) {
          if(item?.beforeSuspendMin && item.beforeSuspendMin > 0){
            let minTominus = item.beforeSuspendMin;
            let date = new Date(commentary.eventDate); 
            date.setMinutes(date.getMinutes() - minTominus); // Subtract the minutes
            let formattedDate = date.toISOString().replace('T', ' ').replace('Z', '+00');
            item.afterSuspendTime = formattedDate;
          }
          else {
            item.afterSuspendTime = null;
          }
          if(item?.beforeCloseMin && item.beforeCloseMin > 0){
            let minTominus = item.beforeCloseMin;
            let date = new Date(commentary.eventDate); 
            date.setMinutes(date.getMinutes() - minTominus); // Subtract the minutes
            let formattedDate = date.toISOString().replace('T', ' ').replace('Z', '+00');
            item.afterCloseTime = formattedDate;
          }
          else {
            item.afterCloseTime = null;
          }
        }
        multiRunnerMarket.push(item);
      }
      else {
        marketNameNullMarket.push(item);
      }
    }
  }
  if(marketNameNullMarket.length > 0){
    errorLogger(
      fastify,
      `Market Name is null for marketTypeIds ${marketNameNullMarket.map(e => e.marketTypeId).join(",")}`,
      "ERROR --> services/commentary.js/createEventMarketsServiceV1",
      request
    );
  }
  const result = await upsertEventMarketSPQueryV1({
    singleRunnerMarket : singleRunnerMarket.length > 0 ? singleRunnerMarket : null,
    multiRunnerMarket : multiRunnerMarket.length > 0 ? multiRunnerMarket : null
  }, request, fastify);
  for (let item of result){
    let index = global.tblEventMarketsV1.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    index === -1
      ? global.tblEventMarketsV1.push(item)
      : (global.tblEventMarketsV1[index] = item);
    
    marketDataLogger(
      {
        eventMarketId: item.eventMarketId,
        commentaryId: item.commentaryId,
        dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
        updateType: MarketUpdateType.marketInitilization,
        isSendData: true
      },
      request,
      fastify
    )
  }
  eventMarketLogger(
    {
      commentaryId: eventMarket[0].commentaryId,
      requestBody : request.body,
      response : result
    },
    request,
    fastify
  )
  return "Event Market updated successfully";

  } catch (error) {
    eventMarketLogger(
      {
        commentaryId: request.body.eventMarket[0].commentaryId,
        requestBody : request.body,
        error : {
          message : error.message,
        }
      },
      request,
      fastify
    )
    throw new Error(error.message);
  }
};
const updateMarketRateServiceV1 = async (request, fastify) => {
  // i got array of eventMarket i want to update this data
  let { eventMarket } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.eventMarket[0].commentaryId
  );
  if (!commentary) {
    //here
    throw new Error("Commentary with this id not Found");
  }
  let eventMarkets = await getEventMarketByIdsQueryV1(
    {
      eventMarketIds: eventMarket.map((item) => item.marketId),
    },
    request,
    fastify
  );
  if(eventMarkets.length == 0){
    throw new Error("EventMarket with this id not Found");
  }
  
  // return true;
  // remove the market which is already closed , settled,cancel11
  let signleRunMarket = [];
  let multiRunMarket = [];
  for (let item of eventMarket){
    let market = eventMarkets.find(
      (e) => e.eventMarketId === item.marketId
    );
    if (
      market.status === EventMarketStatus.Close ||
      market.status === EventMarketStatus.Settled ||
      market.status === EventMarketStatus.Cancel
    ) {
      continue;
    }
    if(market.marketTypeId == MarketTypeId.Fancy || market.marketTypeId == MarketTypeId.LineMarket){
      signleRunMarket.push(item);
    }
    else {
      multiRunMarket.push(item);
    }
    // let marketType = global.tblMarketTypes.find(
    //   (e) => e.marketTypeId === market.marketTypeId
    // );
    // if(marketType.marketTypeName.toLowerCase() === "fancy" || marketType.marketTypeName.toLowerCase() === "linemarket"){
    //   signleRunMarket.push(item);
    // }
    // else {
    //   multiRunMarket.push(item);
    // }
  }

  const updatedData = await updateEventMarketRateQueryV1({
    singleRunnerMarket : signleRunMarket.length > 0 ? signleRunMarket : null,
    multiRunnerMarket : multiRunMarket.length > 0 ? multiRunMarket : null
  }, request, fastify);
  
  // return updatedData;
  const playerMarket = [];
  const updatedOvers = [];
  // const response = [];
  for (let item of updatedData) {
    let index = global.tblEventMarketsV1.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    index === -1
      ? global.tblEventMarketsV1.push(item)
      : (global.tblEventMarketsV1[index] = item);

 
    if(item.isPlayer){
      playerMarket.push(item);
    }
    // let marketType = global.tblMarketTypes.find(
    //   (e) => e.marketTypeId === item.marketTypeId
    // );
    // if(marketType.marketTypeName.toLowerCase() === "fancy" || marketType.marketTypeName.toLowerCase() === "linemarket"){
    if(item.marketTypeId == MarketTypeId.Fancy || item.marketTypeId == MarketTypeId.LineMarket){
      let is_onlyover = 0;
      let category = global.tblMarketTypeCategories.find(
        (cat) => cat.marketTypeCategoryId === item.marketTypeCategoryId
      );
      let lineDiff = 0;
      if(category && category.categoryName.toLowerCase() != "player" && category.categoryName.toLowerCase() != "wicket"){
        if(category.categoryName == "Only Over"){
          is_onlyover = 1;
        }
        let runOld = eventMarkets.find(
          (e) => e.eventMarketId === item.eventMarketId
        ).runners;
        lineDiff =  item.runners[0].line - runOld[0].line;
        updatedOvers.push({
          over : item.over,
          value : lineDiff.toFixed(2),
          line_ratio : item.lineRatio,
          is_onlyover : is_onlyover,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          market_type_category_id : parseInt(item.marketTypeCategoryId),
        })
      }
      marketDataLogger(
        {
          eventMarketId: item.eventMarketId,
          commentaryId: item.commentaryId,
          dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
          updateType: MarketUpdateType.marketUpdateRate,
          lineDiff: lineDiff,
          isSendData: true
        },
        request,
        fastify
      )
    
    }
    marketDataLogger(
      {
        eventMarketId: item.eventMarketId,
        commentaryId: item.commentaryId,
        dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
        updateType: MarketUpdateType.marketUpdateRate,
        isSendData: true
      },
      request,
      fastify
    );
    // response.push({
    //   marketId : item.eventMarketId,
    //   commentaryId : item.commentaryId,
    //   eventRefId : item.eventRefId,
    //   teamId : item.teamId,
    //   marketTypeCategoryId : item.marketTypeCategoryId,
    //   // categoryName : global.tblMarketTypeCategories.find(
    //   //   (e) => e.marketTypeCategoryId === item.marketTypeCategoryId
    //   // ).categoryName,
    //   marketName : item.marketName,
    //   margin : item.margin,
    //   status : item.status,
    //   over : item.over,
    //   isActive : item.isActive,
    //   isAllow : item.isAllow,
    //   isSendData : item.isSendData,
    //   lineRatio : item.lineRatio,
    //   lineType : item.lineType,
    //   runner : item.runners.map((e) => {
    //     let {selectionStatus,...rest } = e;
    //     return {
    //       ...rest,
    //       status : selectionStatus
    //     }
    //   })
    // })

  }
  const teamOnStrike = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId && 
      item.currentInnings === commentary.currentInnings &&
      item.teamStatus === 1
  );
  let _resFromPredictAPI;
  let callPredictions = [];
  if (teamOnStrike && request.body.action && (request.body.action.toUpperCase() === "SAVE_ALL")) {
    _resFromPredictAPI = await callPredictorMarket(
      {
        commentary_id: commentary.commentaryId,
        match_type_id: commentary.matchTypeId,
        strike_team_id: teamOnStrike.teamId,
        current_score: teamOnStrike.teamScore || 0,
        current_over: parseFloat(teamOnStrike.teamOver) || 0.0,
        overs: updatedOvers,
      },
      "/api/v1/updateline",
      fastify,
      request
    );
    let callPrediction = {}
    // Check for error_msg in the response
    if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      callPrediction.predictioncallSuccess = false;
      callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      callPrediction.endPoint = '/api/v1/updateline';
    } else {
      callPrediction.predictioncallSuccess = true;
      callPrediction.predictionMessage = 'Prediction call successful';
      callPrediction.endPoint = '/api/v1/updateline';
    }
    callPredictions.push(callPrediction);
  }
  if(commentary.isPredictMarket && request.body.action && (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH"))
    {
      _resFromPredictAPI = null;
      let isOpenMarket = (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH");
      _resFromPredictAPI = await callPredictorMarket(
        {
          commentary_id: commentary.commentaryId,
          status: request.body.eventMarket[0].status,
          match_type_id: commentary.matchTypeId,
          is_open_market:isOpenMarket  
        },
        "/api/v1/updatemarketstatus",
        fastify,
        request
      );
      let callPrediction = {}
      // Check for error_msg in the response
      if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
        callPrediction.predictioncallSuccess = false;
        callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
        callPrediction.endPoint = '/api/v1/updatemarketstatus';
      } else {
        callPrediction.predictioncallSuccess = true;
        callPrediction.predictionMessage = 'Prediction call successful';
        callPrediction.endPoint = '/api/v1/updatemarketstatus';
      }
      callPredictions.push(callPrediction);
  }
  if(playerMarket.length > 0){
    for (let p of playerMarket){
      let comPlayer = global.tblCommentaryPlayers.findIndex(
        (item) => item.commentaryPlayerId === p.playerId
      );
      if (comPlayer === -1) {
        errorLogger(
          fastify,
          "Player with this id not Found",
          "ERROR --> services/eventMarket.js/updateMarketRateServiceV1",
          request
        );
        continue;
      }
      let avg = p.runners[0].line - global.tblCommentaryPlayers[comPlayer].batRun;
      await updateAverageOfPlayerQuery({
        commentaryPlayerId: p.playerId,
        batsmanAverage: avg,
      }, request, fastify);	
      global.tblCommentaryPlayers[comPlayer].batsmanAverage = avg;
    }
  }
  //   // get the team and teamName by commentaryId
  //   const teams = global.tblCommentaryTeams
  //   .filter((item) => item.commentaryId === eventMarket[0].commentaryId)
  //   .reduce((acc, current) => {
  //     if (!acc.some(item => item.teamId === current.teamId)) {
  //       acc.push(current);
  //     }
  //     return acc;
  //   }, [])
  //   .map((item) => {
  //     return {
  //       teamId: item.teamId,
  //       teamName: item.teamName,
  //     };
  //   });
  // let categories = global.tblMarketTypeCategories.filter(
  //   (item) => item.marketTypeCategoryId > 0
  // ).map(item => ({
  //   marketTypeCategoryId: item.marketTypeCategoryId,
  //   categoryName: item.categoryName,
  //   displayOrder: item.displayOrder
  // }));
  let data = await marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify);
  data.callPrediction = callPredictions;

 return data;

};
const getRunnerByMarketService = async (request, fastify) => {
  let data = await getRunnerByMarketQuery(request, fastify);
  return data;
}
const pendingMultiRunnerMarketsService = async (request, fastify) => {
  const {
    isActive,
    eventTypeId,
    competitionId,
    eventId,
    status,
    startDate,
    endDate,
    rateSourceRefId
  } = request.body;

  // let mt = global.tblMarketTypes.filter(
  //   (item) => item.marketTypeName.toLowerCase() === "fancy" || item.marketTypeName.toLowerCase() === "linemarket"
  // ).map((item) => item.marketTypeId);
  
  
  let createWhereStatus = `tem."wrIsResult" = false AND tem."wrResult" IS NOT NULL AND tem."wrStatus" = ${EventMarketStatus.Settled} AND tc."wrIsDelete" = false`;
  // if(mt.length > 0){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" NOT IN (${MarketTypeId.Fancy}, ${MarketTypeId.LineMarket})` : `tem."wrMarketTypeId" NOT IN (${MarketTypeId.Fancy}, ${MarketTypeId.LineMarket})`;
  // }
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  // if(mt.length > 0){
  //   createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" NOT IN (${mt.join(",")})` : `tem."wrMarketTypeId" NOT IN (${mt.join(",")})`;
  // }
  let eventMarket = await getMarketWithRunnerQuery(
    fastify,
    createWhereStatus
  );

  
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventTypeId === eventTypeId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.competitionId === competitionId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    let commentaryId = global.tblCommentaries
      .filter((item) => item.eventId === eventId)
      .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  // add dateFilter if provided
  if (startDate && endDate) {
    eventMarket = eventMarket?.filter((item) => {
      return (
        new Date(item.eventDate) >= new Date(startDate) &&
        new Date(item.eventDate) <= new Date(endDate)
      );
    });
  }
  if (status !== undefined) {
    eventMarket = eventMarket.filter((item) => item.status === status);
  }
  // if (isActive !== undefined) {
  //   eventMarket = eventMarket.filter((item) => item.isActive === isActive);
  // }

  return eventMarket;
};
const updateMarketResultService = async (request, fastify) => {
  const { eventMarketId, isResult, result } = request.body;

  let run = await getRunnerByIdQuery(
    fastify,
    request,
    `"wrRunnerId" = ${result} AND "wrEventMarketId" = ${eventMarketId}`
  );
  if(!run){
    throw new Error("Runner with this id not Found");
  }
  await updateResultMultiMarketQuery(request.body, request, fastify);
  if (isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setAndFinalizeResult,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateMarketResultService",
        request
      );
    });;
  }
  if (!isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setResult,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      console.log("market data logger console", err);
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/updateMarketResultService",
        request
      );
    });
  }

  return "Event Market updated successfully";
};
const getComByCompIdService = async (request, fastify) => {
  let commentaryList = global.tblCommentaries.filter(
    (item) => item.competitionId === request.body.competitionId 
  ).map((item) => {
    return {
      commentaryId: item.commentaryId,
      eventName: item.eventName,
      eventDate: item.eventDate,
      eventRefId: item.eventRefId,
    }
  })

  return commentaryList;
}

const updateEventMarketCloseSuspendTimeService = async (request, fastify) => {
  let eventMarket = await getEventMarketByIdsQuery(    {
    eventMarketIds: [parseInt(request.body.eventMarketId)],
  }, request, fastify);
  
  if(eventMarket.length === 0){
    throw new Error('EventMarketId not found');
  }

  let result = await updateEventMarketCloseSuspendTimeQuery(request, fastify);
  result = result[0]
  let index = global.tblEventMarkets.findIndex(
    (item) => item.eventMarketId === request.body.eventMarketId
  );
  if (index !== -1) {
    global.tblEventMarkets[index] = {
      ...global.tblEventMarkets[index],
      ...result
    };
  }

  return `Close and Suspend EventMarket time updated successfully`;
}
module.exports = {
  getDetailsByCIdService,
  getAllEventMarketsService,
  createEventMarketsService,
  deleteEventMarketsService,
  activeInactiveMarketsService,
  updateAllowMarketsService,
  getEventListByCompetitionIdsService,
  marketListResultFalseService,
  changeResultOfMarketService,
  marketListByCIdService,
  updateMarketRateService,
  saveEventMarketService,
  changeMarketCancelService,
  changeMarketResultService,
  changeMarketCloseService,
  suspendMarketByCIdService,
  handleMarketCloseService,
  getEventMarketByIdService,
  commentaryTypeService,
  marketTemplateTypeService,
  setDelayEventMarketService,
  getDSReportEventMarketService,
  getSLReportEventMarketService,
  getMarketDataByCIdService,
  UpdateResulOrApproveEventMarketService,
  updateComInMarketService,
  marketListcategoryNameByCIdService,
  setAllMarketCloseService,
  setCloseMarketCancelService,
  getAllEventMarketsAndRunnersService,
  cancelSettleMarketService,
  getMarketTypeCategoryService,
  getDetailsByCIdV1Service,
  createEventMarketsServiceV1,
  updateMarketRateServiceV1,
  marketListByCIdServiceV1,
  getRunnerByMarketService,
  pendingMultiRunnerMarketsService,
  updateMarketResultService,
  getComByCompIdService,
  updateEventMarketCloseSuspendTimeService
};
