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
} = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const {
  EventMarketStatus,
  MarketActionType,
  ActionTypeForMarketCancel,
  callPredictorMarket,
  MarketUpdateType,
} = require("../utilities/index");
const { marketLogger, marketDataLogger, errorLogger } = require("../utilities/logger");
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
    (item) => item.matchTypeID === commentary.matchTypeId
  );
  // let eventMarket = global.tblEventMarkets.filter(
  //     (item) => item.commentaryId === commentaryId
  //     && item.status !== EventMarketStatus.Cancel
  //     && item.status !== EventMarketStatus.Close
  //     && item.status !== EventMarketStatus.Settled
  // );
  let eventMarket, LDOMARKETSIDS;
  LDOMARKETSIDS = global.tblConfigs.find(config => config.key === "LDOMARKET")?.value ?? "0";
  let whereCondition = `tem."wrCommentaryId" = ${commentaryId} AND tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel}) AND tem."wrMarketTypeCategoryId" NOT IN (${LDOMARKETSIDS})`;
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
  let createWhereStatus = `tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel})`;

  if (status !== undefined && status != 0) {
    createWhereStatus = `tem."wrStatus" = ${status}`;
  }
  if (status != undefined && status == 0) {
    createWhereStatus = null;
  }
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  console.log("createWhereStatus", createWhereStatus);

  let eventMarket = await getAllEventMarketsQuery(fastify, createWhereStatus);
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
  // if (status !== undefined) {
  //   eventMarket = eventMarket.filter((item) => item.status === status);
  // }
  // if (isActive !== undefined) {
  //   eventMarket = eventMarket.filter((item) => item.isActive === isActive);
  // }
  eventMarket = eventMarket.sort((a, b) => b.eventMarketId - a.eventMarketId);
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
  } = request.body;
  // let eventMarket = global.tblEventMarkets.filter((item) => {
  //   return (
  //     item.isResult === false &&
  //     item.result !== null &&
  //     item.status == EventMarketStatus.Settled
  //   );
  // });
  let eventMarket = await getAllEventMarketsQuery(
    fastify,
    `tem."wrIsResult" = false AND tem."wrResult" IS NOT NULL AND tem."wrStatus" = ${EventMarketStatus.Settled}`
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

  return {
    marketList,
    teams,
    categories,
  };
};
const updateMarketRateService = async (request, fastify) => {
  // i got array of eventMarket i want to update this data
  const { eventMarket, isSend, isSave } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.eventMarket[0].commentaryId
  );
  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }
  let updatedOvers = [];
  for (let item of eventMarket) {
    let eventMarket = await getEventMarketByIdsQuery(
      {
        eventMarketIds: [item.marketId],
      },
      request,
      fastify
    );
    eventMarket = eventMarket[0];

    let data = await updateEventMarketRateQuery(item, request, fastify);
    // console.log(data);
    let diff = data.line - eventMarket.line;
    let is_onlyover = 0;
    let category = global.tblMarketTypeCategories.find(
      (item) => item.marketTypeCategoryId == data.marketTypeCategoryId
    );
    if (category && category.categoryName === "Only Over") {
      is_onlyover = 1;
    }
    updatedOvers.push({
      over: item.over,
      value: diff,
      line_ratio: data.lineRatio,
      is_onlyover: is_onlyover,
      is_allow: item.isAllow,
      is_active: item.isActive,
      is_senddata: item.isSendData,
      data: data.data,
      market_type_category_id: parseInt(data.marketTypeCategoryId),
    });
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
  let callPrediction = {};
  if (teamOnStrike && !isSend && isSave) {
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
  }

  //return "Event Market updated successfully";
  // return marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify)
  let data = await marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify);
  data.callPrediction = callPrediction;
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
  // let commentary = global.tblCommentaries.find(
  //   (item) => item.commentaryId === commentaryId
  // );
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
  // const currentStatus = global.tblEventMarkets[eventMarket].status;
  // const currentResult = global.tblEventMarkets[eventMarket].result;
  const currentStatus = eventMarket[0].status;
  const currentResult = eventMarket[0].result;
  if (currentStatus === EventMarketStatus.Close && currentResult == null) {
    await changeMarketResultQuery(request.body, request, fastify);
    // global.tblEventMarkets[eventMarket].result = result;
    return "Market result updated successfully";
  } else {
    throw new Error(
      "Market is not closed or result is already set, so it cannot be updated"
    );
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

  const updateData = await closeEventMarketByTeamIdQuery(
    {
      commentaryId: data.commentaryId,
      teamId: bowlingTeam.teamId,
      inningsId: data.inningsId,
    },
    request,
    fastify
  );

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
  const cancelMarket = await cancelEventMarketByTeamIdQuery(
    {
      commentaryId: data.commentaryId,
      teamId: bowlingTeam.teamId,
      inningsId: data.inningsId,
      actionType: ActionTypeForMarketCancel.winCloseCancel,
    },
    request,
    fastify
  );

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
  await setLineRatioService(data, request, fastify);

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
};
