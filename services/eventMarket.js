const { updateAverageOfPlayerQuery, getCommentariesDataByDifferentIdsQuery, updateBoundaryOfPlayerQuery, updatePbfOfPlayerQuery } = require("../repository/TableCommentary");
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
  closeEventMarketsQuery,
  cancelEventMarketsQuery,
  getOpenMarketByCIdQuery,
  suspendMarketQuery,
  updatePredefinedQuery,
  playerMarketQuery,
  boundaryMarketQuery,
  pbfMarketQuery,
  getManualMarketDataQuery,
  saveManualMarketQuery,
  getExtraMarketQuery,
  upManualMarketQuery,
  getMarketByIdQuery,
  upIsInningRunMarketQuery,
  getTargetQyery,
  getAllEventMarketsV2ByIdQuery,
  closeMarketByATQuery1,
  cancelMarketByATQuery1,
  getRsMarketQuery,
  upSendMarketDataQuery,
  upSusTimeQuery,
  upCloseTimeQuery,
  getCommentaryDetailsQuery,
} = require("../repository/TableEventMarkets");
const { getRunnerByIdQuery, setResultInRunnerMarketQuery, getRunnerByMarketQuery } = require("../repository/TableMarketRunner");
const configConstants = require("../utilities/configConstants");
const { getCommMatchTypeTemplatesQuery } = require("../repository/TableMarketTemplate");
const {
  EventMarketStatus,
  MarketActionType,
  ActionTypeForMarketCancel,
  callPredictorMarket,
  MarketUpdateType,
  commentaryStatus,
  MarketTypeId,
  MarketTypeCategories,
} = require("../utilities/index");
const { getAllMarketRunnersV2ByIdQuery } = require("../repository/TableMarketRunner");
const { marketLogger, marketDataLogger, errorLogger, eventMarketLogger, marektResultLogger } = require("../utilities/logger");
const { validateUser } = require("../repository/TableUser");
const { encrypt } = require("../utilities/index");

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
    commentaryId,
    eventId,
    status,
    startDate,
    endDate,
    marketTypeId,
    marketTypeCategoryId,
    rateSourceRefId
  } = request.body;
  // let createWhereStatus = `tem."wrStatus" NOT IN (${EventMarketStatus.Close},${EventMarketStatus.Settled},${EventMarketStatus.Cancel}) AND tc."wrIsDelete" = false AND tcom."wrIsDeleted" = false`;
  let createWhereStatus = `tem."wrStatus" NOT IN (${EventMarketStatus.Settled},${EventMarketStatus.Cancel}) AND tc."wrIsDelete" = false`;

  if (status !== undefined && status != -1) {
    createWhereStatus = `tc."wrIsDelete" = false AND tem."wrStatus" = ${status}`;
  }
  if (status != undefined && status == -1) {
    // createWhereStatus = null;
    createWhereStatus = `tc."wrIsDelete" = false`;
  }
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  if(commentaryId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrCommentaryId" = ${commentaryId}` : `tem."wrCommentaryId" = ${commentaryId}`;
  }

  if(marketTypeId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" = ${marketTypeId}` : `tem."wrMarketTypeId" = ${marketTypeId}`;
  }

  if(marketTypeCategoryId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}` : `tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}`;
  }
 
  let eventMarket = await getEventMarketsQuery(fastify, createWhereStatus);
  let whereCondition = `tc."wrIsDelete" = false AND co."wrIsDeleted" = false`
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventTypeId" = ${eventTypeId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventTypeId === eventTypeId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrCompetitionId" = ${competitionId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.competitionId === competitionId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventId" = ${eventId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);    
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventId === eventId)
    //   .map((item) => item.commentaryId);
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
  if(!eventMarket){
    let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tcom."wrIsDeleted" = false AND tem."wrID" = ${eventMarketId}`
    const eventMarketData = await getAllEventMarketsQuery(fastify, whereCondition);
    eventMarket = eventMarketData[0];
  }
  return eventMarket || null;
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

  if(result?.eventMarketIds) {
    let whereCondition = ` tem."wrID" IN(${result.eventMarketIds})`
    const eventMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition);
    for (let event of eventMarketData){
      let eventMarket = global.tblEventMarketsV2.findIndex((elem) => elem.eventMarketId === event.eventMarketId);
      if(eventMarket === -1){
        global.tblEventMarketsV2.push(event);
      } else {
        global.tblEventMarketsV2[index] = {
          ...global.tblEventMarketsV2[index],
          ...event
        }
      }
    }

    let whereClause = ` tmr."wrEventMarketId" IN(${result.eventMarketIds})`;
    const runnerData = await getAllMarketRunnersV2ByIdQuery(fastify, whereClause);
    for (let runner of runnerData) {
      let runnerIndex = global.tblMarketRunnerV2.findIndex((elem) => elem.eventMarketId === runner.eventMarketId);
      if(runnerIndex !== -1){
        global.tblMarketRunnerV2.push(runner)
      } else {
        global.tblMarketRunnerV2[runnerIndex] = {
          ...global.tblMarketRunnerV2[runnerIndex],
          ...runner
        }
      }
    }
  }
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
  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );
  
  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
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
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if(index !== -1){
    global.tblEventMarketsV2[index].isActive = isActive;
  }
  if (eventMarket === -1) {
    let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tcom."wrIsDeleted" = false AND tem."wrID" = ${eventMarketId}`
    const eventMarketData = await getAllEventMarketsQuery(fastify, whereCondition);
    if(!eventMarketData || eventMarketData.length === 0) {
      throw new Error("EventMarket with this id not Found");
    }
    eventMarket = eventMarketData[0];
    await changeIsActiveEventMarketQuery(request.body, request, fastify);
    global.tblEventMarkets.push({ ...eventMarket, isActive });
    return "Event Market updated successfully";
  } else {
    await changeIsActiveEventMarketQuery(request.body, request, fastify);
    global.tblEventMarkets[eventMarket].isActive = isActive;
    return "Event Market updated successfully";
  }
};
const updateAllowMarketsService = async (request, fastify) => {
  const { eventMarketId, isAllow } = request.body;
  let eventMarket = global.tblEventMarkets.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if(index !== -1){
    global.tblEventMarketsV2[index].isAllow = isAllow;
  }
  if (eventMarket === -1) {
    let whereCondition = `tc."wrIsDelete" = false AND tem."wrIsDeleted" = false AND tcom."wrIsDeleted" = false AND tem."wrID" = ${eventMarketId}`
    const eventMarketData = await getAllEventMarketsQuery(fastify, whereCondition);
    if(!eventMarketData || eventMarketData.length === 0) {
      throw new Error("EventMarket with this id not Found");
    }
    eventMarket = eventMarketData[0];
    await changeIsAllowEventMarketQuery(request.body, request, fastify);
    global.tblEventMarkets.push({ ...eventMarket, isAllow });
    return "Event Market updated successfully";
  } else {
    await changeIsAllowEventMarketQuery(request.body, request, fastify);
    global.tblEventMarkets[eventMarket].isAllow = isAllow;
    return "Event Market updated successfully";
  }
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

const getCommentaryListByCompetitionIdService = async (request, fastify) => {
  // validate competitionId
  const { competitionId } = request.body;
  let competition = global.tblCompetitions.find(
    (item) => item.competitionId === competitionId
  );
  if (!competition) {
    throw new Error("Competition with this id not Found");
  }
  // get the commentaryList by competitionId
  // let whereCondition = `tc."wrIsDelete" = false AND co."wrIsDeleted" = false AND tc."wrCompetitionId" = ${competitionId}`
  // let commentaries = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
  
  // let commentaryList = commentaries.map((item) => ({
  //     eventId: item.eventId,
  //     eventName: item.eventName,
  //     eventDate: item.eventDate,
  //   }));
  let commentaryList = global.tblCommentaries.filter((item)=> item.competitionId === competitionId).map((item) => ({
    commentaryId: item.commentaryId,
    eventName: item.eventName,
    eventDate: item.eventDate,
  })).sort((a, b) => b.eventDate - a.eventDate);
  return commentaryList;
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
    marketTypeId,
    marketTypeCategoryId,
    rateSourceRefId,
    commentaryId
  } = request.body;
  
  let createWhereStatus = `tem."wrIsResult" = false AND tem."wrResult" IS NOT NULL AND tem."wrStatus" = ${EventMarketStatus.Settled} AND tc."wrIsDelete" = false AND tcom."wrIsDeleted" = false`;
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  // let mt = global.tblMarketTypes.filter((item) => item.marketTypeName.toLowerCase() === "line market" || item.marketTypeName.toLowerCase() === "fancy").map(item => item.marketTypeId);
  // if(mt.length > 0){
    createWhereStatus += ` AND tem."wrMarketTypeId" IN (${MarketTypeId.LineMarket},${MarketTypeId.Fancy})`;
  // }

  if(commentaryId && commentaryId != undefined){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrCommentaryId" = ${commentaryId}` : `tem."wrCommentaryId" = ${commentaryId}`;
  }
  if(marketTypeId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" = ${marketTypeId}` : `tem."wrMarketTypeId" = ${marketTypeId}`;
  }

  if(marketTypeCategoryId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}` : `tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}`;
  }
  let eventMarket = await getAllEventMarketsQuery(
    fastify,
    createWhereStatus
  );

  let whereCondition = `tc."wrIsDelete" = false AND co."wrIsDeleted" = false`
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventTypeId" = ${eventTypeId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventTypeId === eventTypeId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrCompetitionId" = ${competitionId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.competitionId === competitionId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventId" = ${eventId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);   
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventId === eventId)
    //   .map((item) => item.commentaryId);
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
  eventMarket.sort((a, b) => b.eventMarketId - a.eventMarketId);

  return eventMarket;
};
const changeResultOfMarketService = async (request, fastify) => {
  const { eventMarketId, isResult } = request.body;
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

  if (eventMarket[0].isResult) {
    throw new Error("Result of this market is already set");
  }
  const result = await changeIsResultEventMarketQuery(request.body, request, fastify);
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if(index !== -1){
    if (result.status === EventMarketStatus.Settled && result.isResult === true){
      global.tblEventMarketsV2.splice(index, 1);
    } else {
      global.tblEventMarketsV2[index] = {
        ...global.tblEventMarketsV2[index],
        ...result
      };
    }
  }
  
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
  // const teams = global.tblCommentaryTeams
  //   .filter((item) => item.commentaryId === commentaryId)
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
  // // 
  // let categories = global.tblMarketTypeCategories.filter(
  //   (item) => item.marketTypeCategoryId > 0
  // ).map(item => ({
  //   marketTypeCategoryId: item.marketTypeCategoryId,
  //   categoryName: item.categoryName,
  //   displayOrder: item.displayOrder
  // }));

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
    // teams,
    // categories,
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
  // let playerMarket = [];
  // let boundaryMarket = [];
  // let pbfMarket = [];
  // let otherMarket = [];

  let catP = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() === "player"
  );
  let catB = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() === "player boundaries"
  );
  let catPB = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() === "player balls faced"
  );
  let catW = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() === "wicket"
  );

  const marketList = await Promise.all([
    playerMarketQuery(
      { commentaryId : commentaryId, marketTypeCategoryId: catP.marketTypeCategoryId },
      request,
      fastify
    ),
    boundaryMarketQuery(
      { commentaryId : commentaryId, marketTypeCategoryId: catB.marketTypeCategoryId },
      request,
      fastify
    ),
    pbfMarketQuery(
      { commentaryId : commentaryId, marketTypeCategoryId: catPB.marketTypeCategoryId },
      request,
      fastify
    ),
    getMarketListByCIdQueryV1(
      { commentaryId : commentaryId, 
        playerCategory : catP.marketTypeCategoryId,
        boundaryCategory : catB.marketTypeCategoryId,
        pbfCategory : catPB.marketTypeCategoryId,
        wicket :catW.marketTypeCategoryId
      },
      request,
      fastify
    )
  ]);

  const target = await getTargetQyery({commentaryId }, request, fastify);


  // const marketList = await getMarketListByCIdQueryV1(
  //   request.body,
  //   request,
  //   fastify
  // );

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
        teamStatus : item.teamStatus
      };
    });
  // 
  let configData = global.tblConfigs.find((item) => item.key.toLowerCase() == configConstants.IGNOREMARKETS.toLowerCase()).value || ""
  let ignoreMarkets = configData ? configData.split(",").map(Number) : [];
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0 && !ignoreMarkets.includes(item.marketTypeCategoryId)
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
    marketList : marketList.flat(),
    teams,
    categories,
    target : target
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
      const index = global.tblEventMarketsV2.findIndex((elem) => 
        elem.eventMarketId === eventMarket.eventMarketId && 
        (elem.status === EventMarketStatus.Cancel || (elem.status === EventMarketStatus.Settled && elem.isResult === true))
      );
      
      if (index !== -1) {
        global.tblEventMarketsV2.splice(index, 1);

        global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
          (item) => !eventMarket.eventMarketId.includes(item.eventMarketId)
        );
      }

      continue;
    }

    let data = await updateEventMarketRateQuery(item, request, fastify);
    const eventMarketIndex = global.tblEventMarketsV2.findIndex((elem) => elem.eventMarketId === item.eventMarketId);
    if(eventMarketIndex !== -1){
      global.tblEventMarketsV2[eventMarketIndex] = {
        ...global.tblEventMarketsV2[eventMarketIndex],
        ...data
      };
    }
    for(runner of item.runner){
      const index = global.tblMarketRunnerV2.findIndex((elem) => 
        elem.runnerId === runner.runnerId
      )
      if(index !== -1){
        global.tblMarketRunnerV2[index] = {
          ...global.tblMarketRunnerV2[index],
          ...runner
        };
      }
    }
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
          market_id : item.marketId,
          team_id : item.teamId,
          over: item.over,
          line_diff: diff != null ? parseFloat(diff.toFixed(2)) : null,  // Ensure float or null if undefined
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
        is_open_market:isOpenMarket ,
        player_id : null
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
const upSendMarketDataService = async (request, fastify) => {
  const {eventMarketId,isSendData} = request.body;
  const result = await upSendMarketDataQuery({
    eventMarketId,
    isSendData
  }, request, fastify);
  for(let item of result){
    let index = global.tblEventMarketsV2.findIndex(
      (elem) => elem.eventMarketId === item.eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2[index].isSendData = item.isSendData;
      global.tblEventMarketsV2[index].lastUpdate = item.lastUpdate;
    }
    marketDataLogger(
      {
        eventMarketId: item.eventMarketId,
        commentaryId: item.commentaryId,
        dataTosave: item.data ? JSON.parse(item.data) : null,
        updateType: MarketUpdateType.isSendDataUpdate,
        lineDiff: 0,
        isSendData: isSendData
      },
      request,
      fastify
    )
  }
  return "Event Market updated successfully";

}
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
      createdBy: request?.userTokenInfo?.WrUserId || null
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

      let index2 = global.tblEventMarketsV2.findIndex(
        (e) => e.eventMarketId === item.eventMarketId
      );
      if (index2 === -1) {
        global.tblEventMarketsV2.push(item);
      } else {
          global.tblEventMarketsV2[index2] = item;
      }
      let runnerData = {
        runnerId: item.runnerId,
        eventMarketId: item.eventMarketId,
        runner: item.runner,
        line: item.line,
        overRate: item.overRate,
        underRate: item.underRate,
        backPrice: item.backPrice,
        layPrice: item.layPrice,
        backSize: item.backSize,
        laySize: item.laySize,
        lastUpdate: item.runnerLastUpdate,
        selectionId: item.selectionId,
        selectionStatus: item.selectionStatus,
        order: item.order,
        teamId: item.teamId,
      };
      let runnerIndex = global.tblMarketRunnerV2.findIndex(
        (elem) => elem.runnerId === item.runnerId
      );
      if (runnerIndex === -1) {
          global.tblMarketRunnerV2.push(runnerData);
      } else {
          global.tblMarketRunnerV2[runnerIndex] = runnerData;
      }

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
  // if(!commentary){
  //   throw new Error("Commentary with this id not Found");
  // }
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
    const result = await changeMarketCancelQuery(request.body, request, fastify);
    const eventMarketIds = result.map((r) => r.eventMarketId);
    global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
      (item) => !eventMarketIds.includes(item.eventMarketId)
    );
    global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
      (item) => !eventMarketIds.includes(item.eventMarketId)
    );
    // global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
    if(commentary?.commentaryStatus == commentaryStatus.INPROGRESS || commentary?.commentaryStatus ==commentaryStatus.COMPLETED){
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
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.marketCancel,
        commentaryId,
        value: `eventMarketStatus:${EventMarketStatus.Cancel}`,
      },
      request,
      fastify
    );
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
  // if (!commentary) {
  //   throw new Error("Commentary with this id not Found");
  // }
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
      const resultData = await changeMarketResultQuery(request.body, request, fastify);
      if (resultData.length > 0){
        // resultData.forEach((updatedItem) => {
        for (const updatedItem of resultData) {
          let index = global.tblEventMarketsV2.findIndex(
            (item) => item.eventMarketId === updatedItem.eventMarketId
          );
          if(index !== -1 && updatedItem.status === EventMarketStatus.Settled && updatedItem.isResult === true){
            global.tblEventMarketsV2.splice(index, 1);

            global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
              (item) => item.eventMarketId !== updatedItem.eventMarketId
            );
          } else {
            global.tblEventMarketsV2[index] = {
              ...global.tblEventMarketsV2[index],
              ...updatedItem,
            };
          }
        };
        // });
      }
      // global.tblMarketRunnerV2
      // .filter(elem => elem.eventMarketId === eventMarketId
      // ).forEach(elem => {
      //   elem.selectionStatus = EventMarketStatus.Settled;
      // });
      for (const elem of global.tblMarketRunnerV2) {
        if (elem.eventMarketId === eventMarketId) {
          elem.selectionStatus = EventMarketStatus.Settled;
        }
      }
      // global.tblEventMarkets[eventMarket].result = result;
      if(commentary?.commentaryStatus === commentaryStatus.INPROGRESS || commentary?.commentaryStatus === commentaryStatus.COMPLETED){
        const strikeTeam = global.tblCommentaryTeams.find(
          (item) => item.commentaryId === commentaryId && item.teamStatus === 1
        );
        // await callPredictorMarket(
        //   {
        //     commentary_id: parseInt(commentaryId),
        //     status: parseInt(EventMarketStatus.Settled),
        //     match_type_id: parseInt(commentary.matchTypeId),
        //     event_market_id: parseInt(eventMarketId),
        //     strike_team: strikeTeam.teamId,
        //   },
        //   "/api/v1/marketmanualclose",
        //   fastify,
        //   request
        // );
        await callPredictorMarket(
          {
            commentary_id: parseInt(commentaryId),
            status: parseInt(EventMarketStatus.Settled),
            event_market_id: parseInt(eventMarketId),
            strike_team: strikeTeam.teamId,
            result: parseInt(result)
          },
          "/api/v1/marketmanualsettle",
          fastify,
          request
        );
        marektResultLogger(
          {
            result: result,
            marketId : eventMarketId,
          },
          request,
          fastify
        )
        marketLogger(
          {
            eventMarketId,
            actionType: MarketActionType.setResult,
            commentaryId,
            value: `eventMarketStatus:${EventMarketStatus.Settled},result:${result}`,
            result : result
          },
          request,
          fastify
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
    let data = await getRunnerByIdQuery(fastify, request , `"wrIsDeleted" = false AND "wrEventMarketId" = ${eventMarketId} ${result ? `AND "wrRunnerId" = ${Number(result)}` : ""}`);
     if(!data){
      throw new Error("Runner with this id not Found");
    }
    const result1 = await setResultInRunnerMarketQuery(request.body, request, fastify);
    // remove this market from global 
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2.splice(index, 1);
    }
    let runners = global.tblMarketRunnerV2.filter(
      (item) => item.eventMarketId === eventMarketId
    );
    for (let runner of runners){
      let index = global.tblMarketRunnerV2.findIndex(
        (item) => item.runnerId === runner.runnerId
      );
      if(index !== -1){
        global.tblMarketRunnerV2.splice(index, 1);
      }
    }
    // update code properly
    // let index = global.tblEventMarketsV2.findIndex(
    //   (item) => item.eventMarketId === eventMarketId
    // );
    // if(index !== -1){
    //   global.tblEventMarketsV2[index] = {
    //     ...global.tblEventMarketsV2[index],
    //     ...result1
    //   };
    // }
    // let runnerIndex1 = global.tblMarketRunnerV2.findIndex(
    //   (item) => item.runnerId === result
    // );
    // if(runnerIndex1 != -1){
    //   global.tblMarketRunnerV2[runnerIndex1].selectionStatus = EventMarketStatus.WIN
    // }
    // let otherRunner = global.tblMarketRunnerV2.filter(
    //   (item) => item.runnerId !== result && item.eventMarketId === eventMarketId
    // );
    // if(otherRunner.length > 0){
    //   for (let runner of otherRunner){
    //     let index = global.tblMarketRunnerV2.findIndex(
    //       (item) => item.runnerId === runner.runnerId
    //     );
    //     if(index !== -1){
    //       global.tblMarketRunnerV2[index].selectionStatus = EventMarketStatus.LOSE
    //     }
    //   }
    // }
    // global.tblMarketRunnerV2[runnerIndex2].selectionStatus = EventMarketStatus.LOSE

    if(commentary?.commentaryStatus === commentaryStatus.INPROGRESS || commentary?.commentaryStatus === commentaryStatus.COMPLETED){
      const strikeTeam = global.tblCommentaryTeams.find(
        (item) => item.commentaryId === commentaryId && item.teamStatus === 1
      );
      // await callPredictorMarket(
      //   {
      //     commentary_id: parseInt(commentaryId),
      //     status: parseInt(EventMarketStatus.Settled),
      //     match_type_id: parseInt(commentary.matchTypeId),
      //     event_market_id: parseInt(eventMarketId),
      //     strike_team: strikeTeam.teamId,
      //   },
      //   "/api/v1/marketmanualclose",
      //   fastify,
      //   request
      // );
      await callPredictorMarket(
        {
          commentary_id: parseInt(commentaryId),
          status: parseInt(EventMarketStatus.Settled),
          event_market_id: parseInt(eventMarketId),
          strike_team: strikeTeam.teamId,
          result: parseInt(result)
        },
        "/api/v1/marketmanualsettle",
        fastify,
        request
      );
      marektResultLogger(
        {
          result: result,
          marketId : eventMarketId,
        },
        request,
        fastify
      )
      marketLogger(
        {
          eventMarketId,
          actionType: MarketActionType.setResult,
          commentaryId,
          value: `eventMarketStatus:${EventMarketStatus.Settled},result:${result}`,
          result:result
        },
        request,
        fastify
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
  // if (!commentary) {
  //   throw new Error("Commentary with this id not Found");
  // }
  const currentStatus = checkMarketInDb[0].status;
  if (
    ![
      EventMarketStatus.Settled,
      EventMarketStatus.Cancel,
      EventMarketStatus.Close,
    ].includes(currentStatus)
  ) {
    let result = await changeMarketCloseQuery(request.body, request, fastify);
    result = result[0]
    // update properly
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2[index] = {
        ...global.tblEventMarketsV2[index],
        ...result
      };
    }
    // global.tblMarketRunnerV2
    // .filter(elem => elem.eventMarketId === eventMarketId
    // ).forEach(elem => {
    //   elem.selectionStatus = EventMarketStatus.Close;
    // });
    for (const elem of global.tblMarketRunnerV2) {
      if (elem.eventMarketId === eventMarketId) {
        elem.selectionStatus = EventMarketStatus.Close;
      }
    }
    let _resFromPredictAPI;
    let callPrediction = {};
    // global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;
    // global.tblEventMarkets[eventMarket].data = updatedData;
    // console.log("updatedData", updatedData);
    if(commentary.commentaryStatus === commentaryStatus.INPROGRESS || commentary.commentaryStatus === commentaryStatus.COMPLETED){
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

    marketLogger(
      {
        eventMarketId,
        actionType : MarketActionType.closeMarket,
        commentaryId,
        value: `eventMarketStatus:${EventMarketStatus.Close}`,
      },
      request,
      fastify
    )
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
  // global.tblMarketRunnerV2
  // .filter(elem => updateMarket.includes(elem.eventMarketId)
  // ).forEach(elem => {
  //   elem.selectionStatus = EventMarketStatus.Suspend;
  // });
  for (const elem of global.tblMarketRunnerV2) {
    if (updateMarket.includes(elem.eventMarketId)) {
      elem.selectionStatus = EventMarketStatus.Suspend;
    }
  }
  for (let item of updateMarket) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    global.tblEventMarkets[eventMarket].status = EventMarketStatus.Suspend;
  }
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === item.eventMarketId
  );
  if(index !== -1){
    global.tblEventMarketsV2[index].status = EventMarketStatus.Suspend;
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
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === i.eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2[index].delay = request.body.delay;
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
  const eventMarketIds = updateData.map((r) => r.eventMarketId);
  if(eventMarketIds?.length > 0){
    let whereCondition = ` tem."wrID" IN(${eventMarketIds})`
    const eventMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition)
    for (let event of eventMarketData) {
      let index = global.tblEventMarketsV2.findIndex(
        (item) => item.eventMarketId === event.eventMarketId
      );
      if(index !== -1){
        global.tblEventMarketsV2[index] = event;
      }
    }
  }

  for (let item of updateData) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;
      // global.tblEventMarkets[eventMarket].data = item.data;
    }
    let runnerIndex = global.tblMarketRunnerV2.findIndex((elem) =>
      elem.eventMarketId === item.eventMarketId
    )
    if(runnerIndex !== -1){
      global.tblMarketRunnerV2[runnerIndex].selectionStatus = EventMarketStatus.Close;
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

  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !cancelMarket.includes(item.eventMarketId)
  );
  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (item) => !cancelMarket.includes(item.eventMarketId)
  );
  for (let item of cancelMarket) {
    let eventMarket = global.tblEventMarkets.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    if (eventMarket !== -1) {
      global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
      // global.tblEventMarkets[eventMarket].data = item.data;
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
const handleMarketByDLSService = async (data, request, fastify) => {
  // check the eventMarket close log for this commentaryId
  // const checkLog = await getMarketLogsByCIdQuery(
  //   {
  //     commentaryId: data.commentaryId,
  //     actionType: MarketActionType.closeMarketOnDLSChange,
  //   },
  //   request,
  //   fastify
  // );
  // if (checkLog[0].count > 0) {
  //   return "Market already closed";
  // }
  const updateData = await closeMarketByATQuery1({
    commentaryId : data.commentaryId,
    closeAT : ActionTypeForMarketCancel.dlsCloseMarket,
    cnAT : ActionTypeForMarketCancel.dlsCloseCancelMarket,
    teamId : data.teamId,
    inningsId : data.inningsId
  }, request, fastify);
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
        actionType: MarketActionType.dlsMarketClose,
        value: `eventMarketStatus : ${EventMarketStatus.Close}`,
      },
      request,
      fastify
    )
  }
  // cancel the market as per actionType
  let cancelMarket = await cancelMarketByATQuery1(
    {
      commentaryId: data.commentaryId,
      actionType: ActionTypeForMarketCancel.dlsCloseCancelMarket,
      teamId : data.teamId,
      inningsId : data.inningsId
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
        actionType: MarketActionType.dlsMarketCloseCancel,
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
  marketLogger(
    {
      commentaryId: data.commentaryId,
      actionType: MarketActionType.closeMarketOnDLSChange,
      value: `eventMarketStatus : ${EventMarketStatus.Close}`,
    },
    request,
    fastify
  )

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
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );
  if(index !== -1){
    if(isResult){
      if(isResult === true && global.tblEventMarketsV2[index].status === EventMarketStatus.Settled) {
        global.tblEventMarketsV2.splice(index, 1);

        global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
          (item) => !eventMarketId.includes(item.eventMarketId)
        );
      }
      global.tblEventMarketsV2[index].isResult = isResult;
      global.tblEventMarketsV2[index].result = result;
    }
    if(!isResult){
      global.tblEventMarketsV2[index].result = result;
    }
  }
  if (isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setAndFinalizeResult,
        value: `isResult:${isResult},result:${result}`,
        result : result
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
        actionType: MarketActionType.setResultAndIsResultFalse,
        value: `isResult:${isResult},result:${result}`,
        result : result
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
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === item.eventMarketId
    );
    if(index !== -1){
        global.tblEventMarketsV2[index].commentaryId = data.commentaryId;
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
  const result = await closeMarketQuery(request, fastify);
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
    };
    // });
  }

  // global.tblMarketRunnerV2.forEach(elem => {
  //   if (![EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close].includes(elem.selectionStatus)) {
  //     elem.selectionStatus = EventMarketStatus.Close;
  //   }
  // });
  for (const elem of global.tblMarketRunnerV2) {
    if (![EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close].includes(elem.selectionStatus)) {
      elem.selectionStatus = EventMarketStatus.Close;
    }
  }

  marketLogger(
    {
      actionType : MarketActionType.allMarketClose,
      value : "/allMarketClose"
    },
    request,
    fastify
  )

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
  const result = await cancelMarketQuery(request, fastify);
  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !result.includes(item.eventMarketId)
  );

  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (item) => !result.includes(item.eventMarketId)
  );

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
  const result = await cancelSettledMarketQuery(request.body, request, fastify);
  const eventMarketIds = result.map((r) => r.eventMarketId);
  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !eventMarketIds.includes(item.eventMarketId)
  );
  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (item) => !eventMarketIds.includes(item.eventMarketId)
  );
  let eventIndex = global.tblEventMarkets.findIndex(
    (e) => e.eventMarketId === eventMarketId
  );
  if (eventIndex !== -1) {
    global.tblEventMarkets[eventIndex].status = EventMarketStatus.Cancel;
  }
  marketLogger(
    {
      eventMarketId,
      actionType: MarketActionType.marketCancel,
      value: `eventMarketStatus:${EventMarketStatus.Cancel}`,
      commentaryId : checkMarketInDb[0].commentaryId
    },
    request,
    fastify
  );
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

  let configData = global.tblConfigs.find((item) => item.key.toLowerCase() == configConstants.IGNOREMARKETS.toLowerCase()).value || ""
  const totalInnings = matchType.noOfIningsPerSide;

  const teamAndPlayers = [];
  for (let i = 1; i <= totalInnings; i++) {
    let commentaryTeam;
      commentaryTeam = global.tblCommentaryTeams.filter(
        (item) =>
          item.commentaryId === commentaryId &&
          item.currentInnings === i 
          // &&item.teamStatus === 1
      );
    // } 
    // else {
    //   commentaryTeam = global.tblCommentaryTeams.filter(
    //     (item) =>
    //       item.commentaryId === commentaryId && item.currentInnings === i
    //   );
    // }
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

  let marketTemplate;
  // if(commentary.commentaryStatus == commentaryStatus.OPEN){
  //   marketTemplate = global.tblMarketTemplate.filter(
  //     (item) => item.matchTypeID === commentary.matchTypeId  && item.isShowInAdvanceMarket === true && item.isActive === true
  //   );
  // }
  // else {
  //   marketTemplate = global.tblMarketTemplate.filter(
  //     (item) => item.matchTypeID === commentary.matchTypeId && item.isActive === true && item.isShowInAdvanceMarket === true
  //     && item.isPerEvent === false
  //   );
  // }
  let ignoreMarkets = configData ? configData.split(",").map(Number) : [];
  if(commentary.commentaryStatus == commentaryStatus.OPEN){
    marketTemplate = await getCommMatchTypeTemplatesQuery(commentaryId, null, request, fastify);
    marketTemplate = marketTemplate.filter((item) => !ignoreMarkets.includes(item.marketTypeCategoryId));
    marketTemplate.sort((a, b) => a.templateName.localeCompare(b.templateName));
  }
  else {
    let whereCondition = `AND tmt."wrIsPerEvent" = FALSE`
    marketTemplate = await getCommMatchTypeTemplatesQuery(commentaryId, whereCondition, request, fastify);
    marketTemplate = marketTemplate.filter((item) => !ignoreMarkets.includes(item.marketTypeCategoryId));
    marketTemplate.sort((a, b) => a.templateName.localeCompare(b.templateName));
  }


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
  AND tem."wrRateSource" = 1 AND tr."wrIsDeleted" = false`;
  if (commentary.commentaryStatus != 1) {
    let battingTeam = global.tblCommentaryTeams.find(
      (item) =>
        item.commentaryId === commentaryId &&
        item.currentInnings === 1 &&
        item.teamStatus === 1
    );
    whereCondition += ` AND tem."wrTeamID" = ${battingTeam.teamId}`;
    eventMarket = await getAllEventMarketsQueryV1(fastify, whereCondition);
    eventMarket = eventMarket.filter((item) => !ignoreMarkets.includes(item.marketTypeCategoryId));
    eventMarket.sort((a, b) => a.marketName.localeCompare(b.marketName));
  } else {
    eventMarket = await getAllEventMarketsQueryV1(fastify, whereCondition);
    eventMarket = eventMarket.filter((item) => !ignoreMarkets.includes(item.marketTypeCategoryId));
    eventMarket.sort((a, b) => a.marketName.localeCompare(b.marketName));
  }
  //
  let categories = global.tblMarketTypeCategories.filter(
    (item) => item.marketTypeCategoryId > 0
  ).map(item => ({
    marketTypeCategoryId: item.marketTypeCategoryId,
    categoryName: item.categoryName,
    displayOrder: item.displayOrder
  })).sort((a, b) => a.marketTypeCategoryId - b.marketTypeCategoryId);
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
  // if(commentary.commentaryStatus != commentaryStatus.OPEN && commentary.commentaryStatus != commentaryStatus.COMPLETED){
  //   // check if in eventMarket batting team market not to create
  //   let bowling = global.tblCommentaryTeams.find(
  //     (item) =>
  //       item.commentaryId === commentary.commentaryId &&
  //       item.currentInnings === commentary.currentInnings &&
  //       item.teamStatus !== 1 
  //   );
  //   if(bowling){
  //     let market = eventMarket.find(
  //       (item) => item.teamId === bowling.teamId
  //     );
  //     if(market){
  //       throw new Error(`${bowling.teamName}'s market not created because this team is not on Strike`);
  //     }
  //   }
  // }
  let multiRunnerMarket = [];
  let singleRunnerMarket = [];
  let marketNameNullMarket = [];
  // check if matchtype is limited
  const mt = global.tblMatchTypes.find((m)=>m.matchTypeId == commentary.matchTypeId)
  
  for (let item of eventMarket){
    if(mt.isLimitedOvers){
      if(item.eventMarketId == 0 && item.marketTypeId == MarketTypeId.Fancy && item.marketTypeCategoryId == MarketTypeCategories.SESSION ){
        // get the teamMaxOver 
        let comT = global.tblCommentaryTeams.find((c)=> c.commentaryId == commentary.commentaryId && c.teamId == item.teamId)
        if(comT && comT.teamMaxOver == item.over){
          item.isInningRun = true;
        }
      }
    }
    if(item.marketTypeId == MarketTypeId.Fancy || item.marketTypeId == MarketTypeId.LineMarket){
      // singleRunnerMarket.push(item); 
      item.createdBy = request?.userTokenInfo?.WrUserId || null
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
        item.createdBy = request?.userTokenInfo?.WrUserId || null
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

  let ids = [];
  for (let item of result){
    let index = global.tblEventMarketsV1.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    index === -1
      ? global.tblEventMarketsV1.push(item)
      : (global.tblEventMarketsV1[index] = item);
    ids.push(item.eventMarketId)

    const { runners, ...filteredItem } = item; // Remove `runners`
    let index2 = global.tblEventMarketsV2.findIndex(
      (market) => market.eventMarketId === item.eventMarketId
    );

    index2 === -1
      ? global.tblEventMarketsV2.push(filteredItem)
      : (global.tblEventMarketsV2[index2] = filteredItem);
      // let index4 = global.tblEventMarketsV2.findIndex(
      //   (market) => market.eventMarketId === item.eventMarketId
      // );
    for(let runner of runners){
      let runnerIndex = global.tblMarketRunnerV2.findIndex(
        (market) => market.runnerId === runner.runnerId
      );
      runnerIndex === -1
        ? global.tblMarketRunnerV2.push({ ...runner, eventMarketId: item.eventMarketId, lastUpdate: new Date() })
        : (global.tblMarketRunnerV2[runnerIndex] = { ...runner, eventMarketId: item.eventMarketId, lastUpdate: new Date() });
        // let runnerIndex2 = global.tblMarketRunnerV2.findIndex(
        //   (market) => market.runnerId === runner.runnerId
        // );
    }  
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
  sendMarketToSocket({
    eventMarketId : ids
  },request,fastify)
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
const sendMarketToSocket = async(data,request,fastify)=>{
  try {
    const markets = await getMarketByIdQuery(data,request,fastify);
    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(markets[0].commentaryId);
    if (clientInRoom?.size && markets.length >0) {
      global.socketIo.to(markets[0].commentaryId).emit("updateMarket", markets);
    }

    //emitting inningRun true data
    const inningRunData = markets.filter((item) => item?.isInningRun === true);
    const roomName = `market-${inningRunData[0]?.commentaryId}`;
    const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(roomName);
    if (clientsInRoom?.size && inningRunData.length > 0) {
        global.socketIo.to(roomName).emit("inningsRunData", inningRunData);
    }
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "Error --> services/eventMarket.js/sendMarketToSocket",
      request
    )
    console.log(error)
  }
}
const updateMarketRateServiceV1 = async (request, fastify) => {
  let requestTime = new Date();
  let responseTime;
 try {
  // i got array of eventMarket i want to update this data
  let { eventMarket } = request.body;
  const commentary = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.eventMarket[0].commentaryId
  );
  if (!commentary) {
    //here
    throw new Error("Commentary with this id not Found");
  }
  // let eventMarkets = await getEventMarketByIdsQueryV1(
  //   {
  //     eventMarketIds: eventMarket.map((item) => item.marketId),
  //   },
  //   request,
  //   fastify
  // );


  const eventMarkets = global.tblEventMarketsV2
  .filter((item) => eventMarket.some((market) => item.eventMarketId === market.marketId))
  .map((item) => {
    const commentary = global.tblCommentaries.find(c => c.commentaryId === item.commentaryId);
    return {
      ...item,
      teamName: global.tblTeams.find(tm => tm.teamId === item.teamId)?.teamName || null,
      eventName: commentary?.eventName || null,
      eventDate: commentary?.eventDate || null,
      runners: global.tblMarketRunnerV2.filter((elem) => elem.eventMarketId === item.eventMarketId),
    };
  });

  if(eventMarkets.length == 0){
    throw new Error("EventMarket with this id not Found");
  }
  
  // return true;
  // remove the market which is already closed , settled,cancel11
  let signleRunMarket = [];
  let multiRunMarket = [];
  for (let item of eventMarket){
    let market = eventMarkets.find(
      (e) => e.eventMarketId === parseInt(item.marketId)
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

  const allMarkets = [...signleRunMarket, ...multiRunMarket];
  const updatedData = await updateEventMarketRateQueryV1({
    singleRunnerMarket : signleRunMarket.length > 0 ? signleRunMarket : null,
    multiRunnerMarket : multiRunMarket.length > 0 ? multiRunMarket : null
  }, request, fastify);

  // return updatedData;
  const updatedOvers = [];
  const updatePlayerLine = [];
  const fallOfWicket = [];
  const pbMarket = [];
  const wlbMarket = [];
  // const response = [];
  for (let item of updatedData) {
    let index = global.tblEventMarketsV1.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    index === -1
      ? global.tblEventMarketsV1.push(item)
      : (global.tblEventMarketsV1[index] = item);
    index = global.tblEventMarketsV1.findIndex(
      (e) => e.eventMarketId === item.eventMarketId
    );
    const { runners, ...filteredItem } = item; // Remove `runners`

    let index2 = global.tblEventMarketsV2.findIndex(
      (market) => market.eventMarketId === item.eventMarketId
    );
    index2 === -1
      ? global.tblEventMarketsV2.push(filteredItem)
      : (global.tblEventMarketsV2[index2] = {
        ...global.tblEventMarketsV2[index2],
        ...filteredItem
      });
      // let index4 = global.tblEventMarketsV2.findIndex(
      //   (market) => market.eventMarketId === item.eventMarketId
      // );
    for(let runner of runners){
    let runnerIndex = global.tblMarketRunnerV2.findIndex(
      (market) => market.runnerId === runner.runnerId
    );
    runnerIndex === -1
      ? global.tblMarketRunnerV2.push({ ...runner, eventMarketId: item.eventMarketId, lastUpdate: new Date()})
      : (global.tblMarketRunnerV2[runnerIndex] = { ...runner, eventMarketId: item.eventMarketId, lastUpdate: new Date() });
      // let runnerIndex2 = global.tblMarketRunnerV2.findIndex(
      //   (market) => market.runnerId === runner.runnerId
      // );
    }  
    let category = global.tblMarketTypeCategories.find(
      (cat) => cat.marketTypeCategoryId === item.marketTypeCategoryId
    );
    if(item.marketTypeId == MarketTypeId.Fancy || item.marketTypeId == MarketTypeId.LineMarket){
      let is_onlyover = 0;
      let lineDiff = allMarkets.find(
        (e) => e.marketId === item.eventMarketId
      )?.lineDiff || 0;
      if(category && 
        category.categoryName.toLowerCase() == "session" || 
        category.categoryName.toLowerCase() == "only over" || 
        category.categoryName.toLowerCase() == "over session" ||
        category.categoryName.toLowerCase() == "totaleventrun"
      ){
        if(category.categoryName == "Only Over"){
          is_onlyover = 1;
        }
        updatedOvers.push({
          market_id : item.eventMarketId,
          team_id : item.teamId,
          over : item.over,
          line_diff: lineDiff != null ? parseFloat(lineDiff.toFixed(2)) : null,  // Ensure float or null if undefined
          line_ratio : item.lineRatio,
          is_onlyover : is_onlyover,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          market_type_category_id : parseInt(item.marketTypeCategoryId),
          lay_size : item.runners[0].laySize,
          back_size : item.runners[0].backSize,
          rate_diff : item.rateDiff 
        })
      }
      if( category &&	
        category.categoryName.toLowerCase() == "player" || 
        category.categoryName.toLowerCase() == "wicket" || 
        category.categoryName.toLowerCase() == "player boundaries" ||
        category.categoryName.toLowerCase() == "player balls faced"
      ) {
        let line_diff = allMarkets.find(
          (e) => e.marketId === item.eventMarketId
        )?.lineDiff || 0;
        lineDiff = line_diff;
        
        updatePlayerLine.push({
          commentary_player_id : item.playerId,
          market_type_category_id : item.marketTypeCategoryId,
          line : item.runners[0].line,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          lay_size : item.runners[0].laySize,
          back_size : item.runners[0].backSize,
          rate_diff : item.rateDiff,
          line_diff : line_diff.toFixed(2) || 0
        });
      }
      if(category && category.categoryName.toLowerCase() == "fall of wicket"){
        let line_diff_wick = allMarkets.find(
          (e) => e.marketId === item.eventMarketId
        )?.lineDiff || 0; 
        lineDiff = line_diff_wick;
        fallOfWicket.push({
          market_id : item.eventMarketId,
          market_type_category_id : item.marketTypeCategoryId,
          line : item.runners[0].line,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          lay_size : item.runners[0].laySize,
          back_size : item.runners[0].backSize,
          rate_diff : item.rateDiff,
          line_diff : line_diff_wick.toFixed(2) || 0
        });
      }
      if(category && category.categoryName.toLowerCase() == "partnership boundaries"){
        let line_diff_boun = allMarkets.find(
          (e) => e.marketId === item.eventMarketId
        )?.lineDiff || 0; 
        lineDiff = line_diff_boun;
        pbMarket.push({
          market_id : item.eventMarketId,
          market_type_category_id : item.marketTypeCategoryId,
          line : item.runners[0].line,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          lay_size : item.runners[0].laySize,
          back_size : item.runners[0].backSize,
          rate_diff : item.rateDiff,
          line_diff : line_diff_boun.toFixed(2) || 0
        });
      }
      if(category && category.categoryName.toLowerCase() == "wicket lost balls"){
        let line_diff_wick_ball = allMarkets.find(
          (e) => e.marketId === item.eventMarketId
        )?.lineDiff || 0;
        lineDiff = line_diff_wick_ball;
        wlbMarket.push({
          market_id : item.eventMarketId,
          market_type_category_id : item.marketTypeCategoryId,
          line : item.runners[0].line,
          is_allow : item.isAllow,
          is_active : item.isActive,
          is_senddata : item.isSendData,
          data : item.data,
          lay_size : item.runners[0].laySize,
          back_size : item.runners[0].backSize,
          rate_diff : item.rateDiff,
          line_diff : line_diff_wick_ball.toFixed(2) || 0
        })
      }
      marketDataLogger(
        {
          eventMarketId: item.eventMarketId,
          commentaryId: item.commentaryId,
          dataTosave: typeof (item.data) === "string" ? JSON.parse(item.data) : item.data,
          updateType: MarketUpdateType.marketUpdateRate,
          lineDiff: lineDiff || 0,
          isSendData: true
        },
        request,
        fastify
      )
    }
  }
  const teamOnStrike = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId && 
      item.currentInnings === commentary.currentInnings &&
      item.teamStatus === 1
  );
  // let _resFromPredictAPI;
  // let callPredictions = [];
  if (teamOnStrike && request.body.action && (request.body.action.toUpperCase() === "SAVE_ALL")) {
    
    if(updatedOvers.length > 0){
      callPredictorMarket(
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
    }
    // let callPrediction = {}
    // // Check for error_msg in the response
    // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
    //   callPrediction.predictioncallSuccess = false;
    //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
    //   callPrediction.endPoint = '/api/v1/updateline';
    // } else {
    //   callPrediction.predictioncallSuccess = true;
    //   callPrediction.predictionMessage = 'Prediction call successful';
    //   callPrediction.endPoint = '/api/v1/updateline';
    // }
    // callPredictions.push(callPrediction);
    
    if(updatePlayerLine.length > 0 || fallOfWicket.length > 0 || pbMarket.length > 0 || wlbMarket.length > 0){
      callPredictorMarket(
        {
          commentary_id: commentary.commentaryId,
          match_type_id: commentary.matchTypeId,
          strike_team_id : teamOnStrike.teamId,
          players: updatePlayerLine,
          fallOfWicket : fallOfWicket,
          partnershipBoundaries : pbMarket,
          wicketLostBalls : wlbMarket
        },
        "/api/v1/updateplayerline",
        fastify,
        request
      );
      // let callPrediction = {}
      // // Check for error_msg in the response
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/updateplayerline';
      // } else {
      //   callPrediction.predictioncallSuccess = true;
      //   callPrediction.predictionMessage = 'Prediction call successful';
      //   callPrediction.endPoint = '/api/v1/updateplayerline';
      // }
      // callPredictions.push(callPrediction);
    }
  }
  if(commentary.isPredictMarket && request.body.action && (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH"))
    {
      // _resFromPredictAPI = null;
      let isOpenMarket = (request.body.action.toUpperCase() === "SUSPEND" || request.body.action.toUpperCase() === "PUBLISH");
      callPredictorMarket(
        {
          commentary_id: commentary.commentaryId,
          status: request.body.eventMarket[0].status,
          match_type_id: commentary.matchTypeId,
          is_open_market:isOpenMarket,
          player_id : null 
        },
        "/api/v1/updatemarketstatus",
        fastify,
        request
      );
      // let callPrediction = {}
      // // Check for error_msg in the response
      // if (_resFromPredictAPI.data && _resFromPredictAPI.data.error_msg) {
      //   callPrediction.predictioncallSuccess = false;
      //   callPrediction.predictionMessage = _resFromPredictAPI.data.error_msg;
      //   callPrediction.endPoint = '/api/v1/updatemarketstatus';
      // } else {
      //   callPrediction.predictioncallSuccess = true;
      //   callPrediction.predictionMessage = 'Prediction call successful';
      //   callPrediction.endPoint = '/api/v1/updatemarketstatus';
      // }
      // callPredictions.push(callPrediction);
  }
  let data = await marketListByCIdService({ body: { commentaryId: commentary.commentaryId } }, fastify);
  sendToSocket({
    markets : data.marketList,
    allMarkets : allMarkets
  },request,fastify)
  // data.callPrediction = callPredictions;
  responseTime = new Date();
  eventMarketLogger(
    {
      commentaryId: request.body.eventMarket[0].commentaryId,
      requestBody : request.body,
      response : data,
      requestTime: requestTime,
      responseTime: responseTime
    },
    request,
    fastify
  )
 return data;
 } catch (error) {
  responseTime = new Date();
  eventMarketLogger(
    {
      commentaryId: request.body.eventMarket[0].commentaryId,
      requestBody : request.body,
      error : {
        message : error.message,
      },
      requestTime: requestTime,
      responseTime: responseTime
    },
    request,
    fastify
  )
  throw new Error(error.message);
 }
};
const sendToSocket = (data,request,fastify)=>{
  try {
    const {markets , allMarkets} = data;
    const am = new Set(allMarkets.map(m => m.marketId));
    const dataToSocket = markets?.filter(d => am.has(d.marketId));
    const clientInRoom = global.socketIo.sockets.adapter.rooms.get(allMarkets[0].commentaryId);
    if (clientInRoom?.size && dataToSocket.length >0) {
      global.socketIo.to(allMarkets[0].commentaryId).emit("updateMarket", dataToSocket);
    }

    // emitting inningRun true data
    let inningsRunData = dataToSocket.filter((item) => item?.isInningRun === true);
    const roomName = `mnMarket-${inningsRunData[0]?.commentaryId}`;
    const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(roomName);
  
    if (clientsInRoom?.size && inningsRunData.length > 0) {
        global.socketIo.to(roomName).emit("upMnMarket", inningsRunData);
    }
    return true;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "Error --> services/eventMarket.js/sendToSocket",
      request
    )
    console.log(error)
  }
}
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
    marketTypeId,
    marketTypeCategoryId,
    rateSourceRefId,
    commentaryId
  } = request.body;

  // let mt = global.tblMarketTypes.filter(
  //   (item) => item.marketTypeName.toLowerCase() === "fancy" || item.marketTypeName.toLowerCase() === "linemarket"
  // ).map((item) => item.marketTypeId);
  
  
  let createWhereStatus = `tem."wrIsResult" = false AND tem."wrResult" IS NOT NULL AND tem."wrStatus" = ${EventMarketStatus.Settled} AND tc."wrIsDelete" = false AND tcom."wrIsDeleted" = false`;
  // if(mt.length > 0){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" NOT IN (${MarketTypeId.Fancy}, ${MarketTypeId.LineMarket})` : `tem."wrMarketTypeId" NOT IN (${MarketTypeId.Fancy}, ${MarketTypeId.LineMarket})`;
  // }
  if (rateSourceRefId && rateSourceRefId != 0) {
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrRateSource" = ${rateSourceRefId}` : `tem."wrRateSource" = ${rateSourceRefId}`;
  }
  if(commentaryId && commentaryId != undefined){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrCommentaryId" = ${commentaryId}` : `tem."wrCommentaryId" = ${commentaryId}`;
  }
  // if(mt.length > 0){
  //   createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" NOT IN (${mt.join(",")})` : `tem."wrMarketTypeId" NOT IN (${mt.join(",")})`;
  // }
  if(marketTypeId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeId" = ${marketTypeId}` : `tem."wrMarketTypeId" = ${marketTypeId}`;
  }
  if(marketTypeCategoryId){
    createWhereStatus = createWhereStatus ? createWhereStatus + ` AND tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}` : `tem."wrMarketTypeCategoryId" = ${marketTypeCategoryId}`;
  }
  let eventMarket = await getMarketWithRunnerQuery(
    fastify,
    createWhereStatus
  );

  let whereCondition = `tc."wrIsDelete" = false AND co."wrIsDeleted" = false`
  if (eventTypeId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventTypeId" = ${eventTypeId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventTypeId === eventTypeId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (competitionId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrCompetitionId" = ${competitionId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.competitionId === competitionId)
    //   .map((item) => item.commentaryId);
    eventMarket = eventMarket.filter((item) =>
      commentaryId.includes(item.commentaryId)
    );
  }
  if (eventId) {
    // get the commentaryId from tblCommentaries
    whereCondition += ` AND tc."wrEventId" = ${eventId}`
    let commentaryId = await getCommentariesDataByDifferentIdsQuery(whereCondition, request, fastify);
    commentaryId = commentaryId.map((item) => item.commentaryId);   
    // let commentaryId = global.tblCommentaries
    //   .filter((item) => item.eventId === eventId)
    //   .map((item) => item.commentaryId);
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
  eventMarket.sort((a, b) => b.eventMarketId - a.eventMarketId);
  return eventMarket;
};
const updateMarketResultService = async (request, fastify) => {
  const { eventMarketId, isResult, result } = request.body;

  let run = await getRunnerByIdQuery(
    fastify,
    request,
    `"wrIsDeleted" = false AND "wrRunnerId" = ${result} AND "wrEventMarketId" = ${eventMarketId}`
  );
  if(!run){
    throw new Error("Runner with this id not Found");
  }
  await updateResultMultiMarketQuery(request.body, request, fastify);
  let index = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === eventMarketId
  );

  if(index !== -1){
    if(isResult){
      if(isResult === true && global.tblEventMarketsV2[index].status === EventMarketStatus.Settled) {
        global.tblEventMarketsV2.splice(index, 1);

        global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
          (item) => !eventMarketId.includes(item.eventMarketId)
        );
      }
      // global.tblEventMarketsV2[index].isResult = isResult;
      // global.tblEventMarketsV2[index].result = result;
    }
    if(!isResult){
      global.tblEventMarketsV2[index].result = result;
      global.tblEventMarketsV2[index].isResult = isResult;
    }
  }

  // if(index !== -1){
  //   if(isResult){
  //     global.tblEventMarketsV2[index].isResult = isResult;
  //     global.tblEventMarketsV2[index].result = result;
  //   }
  //   if(!isResult){
  //     global.tblEventMarketsV2[index].result = result;
  //   }
  // }
  let runnerIndex1 = global.tblMarketRunnerV2.findIndex(
    (item) => item.runnerId === result
  );
  if(runnerIndex1 !== -1){
    global.tblMarketRunnerV2[runnerIndex1].selectionStatus = EventMarketStatus.WIN
  }
  let runnerIndex2 = global.tblMarketRunnerV2.findIndex(
    (item) => item.runnerId !== result && item.eventMarketId === eventMarketId
  );
  if(runnerIndex2 !== -1){
    global.tblMarketRunnerV2[runnerIndex2].selectionStatus = EventMarketStatus.LOSE
  }
  
  if (isResult && result) {
    marketLogger(
      {
        eventMarketId,
        actionType: MarketActionType.setAndFinalizeResult,
        value: `isResult:${isResult},result:${result}`,
        result :result
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
        actionType: MarketActionType.setResultAndIsResultFalse,
        value: `isResult:${isResult},result:${result}`,
        result : result
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
  let index2 = global.tblEventMarketsV2.findIndex(
    (item) => item.eventMarketId === request.body.eventMarketId
  );
  if (index2 !== -1) {
    global.tblEventMarketsV2[index2] = {
      ...global.tblEventMarketsV2[index2],
      ...result
    };
  }

  return `Close and Suspend EventMarket time updated successfully`;
}

const closeEventMarketsByIdsService = async (request, fastify) => {
  let { eventMarketId } = request.body;
  const result = await closeEventMarketsQuery(eventMarketId, request, fastify);
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
    };
    // });
  }

  // global.tblMarketRunnerV2
  // .filter(elem => 
  //   eventMarketId.includes(elem.eventMarketId) && 
  //   ![EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close].includes(elem.selectionStatus)
  // )
  // .forEach(elem => {
  //   elem.selectionStatus = EventMarketStatus.Close;
  // });

  for (const elem of global.tblMarketRunnerV2) {
    if (
      eventMarketId.includes(elem.eventMarketId) &&
      ![EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close].includes(elem?.selectionStatus)
    ) {
      elem.selectionStatus = EventMarketStatus.Close;
    }
  }


  
  for (let e of eventMarketId){
    marketLogger(
      {
        actionType : MarketActionType.closeMarket,
        eventMarketId : e,
        commentaryId : null,
        value : `eventMarketStatus:${EventMarketStatus.Close},api:"/closeMarkets"`
      },
      request,
      fastify
    )
  }
  return "Market(s) closed successfully";
};

const cancelEventMarketsByIdsService = async (request, fastify) => {
  let { eventMarketId, password } = request.body;

  const configPassword = global.tblConfigs.find(
    (item) => item.key == configConstants.ALLMARKETCANCELPASS
  )?.value;
  
  if (!configPassword) {
    throw new Error("Password not found in config");
  }
  if(password !== configPassword){
    throw new Error("Password is incorrect");
  }

  const eventMarket = await cancelEventMarketsQuery(eventMarketId, request, fastify);

  global.tblEventMarketsV2 = global.tblEventMarketsV2.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );

  global.tblMarketRunnerV2 = global.tblMarketRunnerV2.filter(
    (item) => !eventMarketId.includes(item.eventMarketId)
  );
  
  if(eventMarketId.length > 0){
    for (let item of eventMarketId){
     // add log
      marketLogger(
        {
          eventMarketId: item,
          actionType: MarketActionType.marketCancel,
          value:`EventMarketStatus:${EventMarketStatus.Cancel}`,
          commentaryId : null
        },
        request,
        fastify
      ).catch((err) => {
        console.log("market data logger console", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/cancelEventMarketsByIdsService",
          request
        );
      });
    }
  }

  return "Market(s) canceled successfully";
};

const suspendMarketService = async (data,request, fastify) => {
  const { commentaryId } = data;
  let category = global.tblConfigs.find(
    (item) => item.key == configConstants.DONTSUSPENTMARKETTYPECATEGORY
  )?.value.split(",").map(Number);
  if(!category){
    errorLogger(
      fastify,
      `Suspend Market Category not found in config`,
      "ERROR --> services/commentary.js/suspendMarketService",
      request
    );
    return true;
  }

  let eventMarket = await getOpenMarketByCIdQuery(
    {
      commentaryId: commentaryId ,
      categoryId : category
    },
    request,
    fastify
  );
  if(eventMarket.length === 0){
    return true;
  }
  let market = eventMarket.map((item) => item.eventMarketId);
  const result = await suspendMarketQuery({
    eventMarketIds: market,
  }, request, fastify);

  if(market?.length > 0){
    let whereCondition = ` tem."wrID" IN(${market})`
    const eventMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition)
    if (eventMarketData?.length > 0) {
      for (const updatedItem of eventMarketData) {
        let index = global.tblEventMarketsV2.findIndex(
          (item) => item.eventMarketId === updatedItem.eventMarketId
        );
        if (index !== -1) {
          global.tblEventMarketsV2[index] = updatedItem
        }
      };
    }
  }

  // global.tblMarketRunnerV2
  // .filter(elem => 
  //   market.includes(elem.eventMarketId) && 
  //   ![EventMarketStatus.Close, EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Suspend].includes(elem.selectionStatus)
  // ).forEach(elem => {
  //   elem.selectionStatus = EventMarketStatus.Suspend;
  // });
  for (const elem of global.tblMarketRunnerV2) {
    if (
      market.includes(elem.eventMarketId) &&
      ![EventMarketStatus.Close, EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Suspend].includes(elem.selectionStatus)
    ) {
      elem.selectionStatus = EventMarketStatus.Suspend;
    }
  }

  
  const clientInRoom = global.socketIo.sockets.adapter.rooms.get(commentaryId);
  if (clientInRoom?.size) {
    global.socketIo.to(commentaryId).emit("updateMarketData", result);
  }
  return true;
}
const getManualMarketDataService = async (request, fastify) => {
  const { commentaryId } = request.body;
  let com = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
  if(!com){
    throw new Error("Commentary with this id not Found");
  }
  let marCat = global.tblMarketTypeCategories.find(
    (item) => item.categoryName.toLowerCase() === "manualodds"
  );
  let market = await getManualMarketDataQuery({
    commentaryId: commentaryId,
    marketTypeId : MarketTypeId.ManualOdds,
    marketTypeCategoryId : marCat.marketTypeCategoryId
  },request, fastify);

  let market1 = await getExtraMarketQuery({
    eventRefId: com.eventRefId,
  },request, fastify);

  const rsMarket = await getRsMarketQuery({commentaryId: commentaryId}, request, fastify)


  let comTeam = global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === commentaryId
  ).reduce((acc, current) => {
    if (!acc.some(item => item.teamId === current.teamId)) {
      acc.push(current);
    }
    return acc;
  }, []).map((item) => {
    return {
      teamId: item.teamId,
      teamName: item.teamName,
    };
  }
  );

  let data = {
    comDetails : {
      commentaryId: com.commentaryId,
      eventName: com.eventName,
      eventDate: com.eventDate,
      eventRefId: com.eventRefId
    },
    teams: comTeam,
    market: market,
    tpMarkets : market1,
    rsMarket : rsMarket || null
  }
  return data;
}
const saveManualMarketDataService = async (request, fastify) => {
  let com = global.tblCommentaries.find((item) => item.commentaryId === request.body.commentaryId);
  if(!com){
    throw new Error("Commentary with this id not Found");
  }
  if(!request.body.eventRefId || request.body.eventRefId == "" ){
    throw new Error("EventRefId is required.")
  }
  const eventMarket = await saveManualMarketQuery(request.body, request, fastify);
  if(eventMarket){
    let whereCondition = ` tem."wrID" = ${eventMarket}`
    const manualMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition)
    global.tblEventMarketsV2.push(manualMarketData[0]);

    let whereClause = ` tmr."wrEventMarketId" = ${eventMarket}`;
    const runnerData = await getAllMarketRunnersV2ByIdQuery(fastify, whereClause);
    global.tblMarketRunnerV2.push(...runnerData);
  }

  return "Market saved successfully";
}
const upManualMarketDataService = async (request, fastify) => {

  // for (let mar of request.body.market){
  const result = await upManualMarketQuery(request.body.eventMarket, request, fastify);
  for (const item of result.updated_row) {
    let index = global.tblEventMarketsV2.findIndex(
      (elem) => elem.eventMarketId === item.marketId
    );
    if (index !== -1) {
      global.tblEventMarketsV2[index] = {
        ...global.tblEventMarketsV2[index],
        status: item.status,
        isAllow: item.isAllow,
        isActive: item.isActive
      };
    }
    for(let runner of item.runner){
      let runnerIndex = global.tblMarketRunnerV2.findIndex(
        (elem) => elem.runnerId === runner.runnerId
      );
  
      if (runnerIndex !== -1) {
        global.tblMarketRunnerV2[runnerIndex] = {
          ...global.tblMarketRunnerV2[runnerIndex],
          ...runner
        };
      }
    }
  }
  // }
  return "Market updated successfully";
}
const upIsInningRunApiService = async (request, fastify) => {

  // for (let mar of request.body.market){
  const result = await upIsInningRunMarketQuery(request.body, request, fastify);
  let index = global.tblEventMarketsV2.findIndex(
    (elem) => elem.eventMarketId === request.body.eventMarketId
  );
  if (index !== -1) {
    global.tblEventMarketsV2[index] = {
      ...global.tblEventMarketsV2[index],
      ...result
    };
  }
  // }
  return "Market updated successfully";
}

const globalEventMarketDataWithCommIdService = async (request, fastify) => {
  const { commentaryId } = request.body;
  const eventMarketData = global.tblEventMarketsV2
  .filter((item) => item.commentaryId === commentaryId)
  .map((item) => {
    const runnersData = global.tblMarketRunnerV2
      .filter((runner) => runner.eventMarketId === item.eventMarketId);

    return {
      ...item,
      runner: runnersData,
    };
  });
  return eventMarketData;
}

const globalEventMarketDataWithMarketIdsService = async (request, fastify) => {
  const { marketIds } = request.body;
  const eventMarketData = global.tblEventMarketsV2
  .filter((item) => marketIds.includes(item.eventMarketId))
  .map((item) => {
    const runnersData = global.tblMarketRunnerV2
      .filter((runner) => runner.eventMarketId === item.eventMarketId);

    return {
      ...item,
      runner: runnersData,
    };
  });
  return eventMarketData;
}
const upSusTimeDataService = async (request, fastify) => {
  const markets = await upSusTimeQuery(request.body, request, fastify);
  for (const item of markets) {
    let index = global.tblEventMarketsV2.findIndex(
      (elem) => elem.eventMarketId === item.eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2[index].afterSuspendTime = item.afterSuspendTime;
      global.tblEventMarketsV2[index].lastUpdate = item.lastUpdate;
    }
  }
  return "Market updated successfully";
}
const upCloseTimeDataService = async (request, fastify) => {
  const markets = await upCloseTimeQuery(request.body, request, fastify);
  for (const item of markets) {
    let index = global.tblEventMarketsV2.findIndex(
      (elem) => elem.eventMarketId === item.eventMarketId
    );
    if(index !== -1){
      global.tblEventMarketsV2[index].afterCloseTime = item.afterCloseTime;
      global.tblEventMarketsV2[index].lastUpdate = item.lastUpdate;
    }
  }
  return "Market updated successfully";
}

const changeMultiMarketsSessionIsResultService = async (request, fastify) => {
  const { eventMarketId, isResult } = request.body;
  const encryptedPassword = encrypt(request.body.password);
  const user = await validateUser({ password: encryptedPassword }, request, fastify);

  if (!user) {
    throw new Error("Incorrect password");
  }
  let eventMarket = await getEventMarketByIdsQuery(
    {
      eventMarketIds: eventMarketId,
    },
    request,
    fastify
  );
  if(eventMarket.length === 0){
    throw new Error(
      "EventMarketId not found"
    );
  }
  for(markets of eventMarket){
    if (markets.isResult) {
      continue;
    }
    const result = await changeIsResultEventMarketQuery(
      {
        isResult: isResult,
        eventMarketId: markets.eventMarketId
      },
      request, fastify
    );
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === markets.eventMarketId
    );
    if(index !== -1) {
      if (result.status === EventMarketStatus.Settled && result.isResult === true){
        global.tblEventMarketsV2.splice(index, 1);
      } else {
        global.tblEventMarketsV2[index] = {
          ...global.tblEventMarketsV2[index],
          ...result
        };
      }
    }
    
    marketLogger(
      {
        eventMarketId: markets.eventMarketId,
        actionType: MarketActionType.isresultSet,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeMultiMarketsSessionIsResultService",
        request
      );
    });
  }

  return "Event Market updated successfully";
}

const changeMultiMarketsIsResultService = async (request, fastify) => {
  const { eventMarketId, isResult } = request.body;
  const encryptedPassword = encrypt(request.body.password);
  const user = await validateUser({ password: encryptedPassword }, request, fastify);

  if (!user) {
    throw new Error("Incorrect password");
  }
  let eventMarket = await getEventMarketByIdsQuery(
    {
      eventMarketIds: eventMarketId,
    },
    request,
    fastify
  );
  if(eventMarket.length === 0){
    throw new Error(
      "EventMarketId not found"
    );
  }
  for(markets of eventMarket){
    if (markets.isResult) {
      continue;
    }
    const result = await changeIsResultEventMarketQuery(
      {
        isResult: isResult,
        eventMarketId: markets.eventMarketId
      },
      request, fastify
    );
    let index = global.tblEventMarketsV2.findIndex(
      (item) => item.eventMarketId === markets.eventMarketId
    );
    if(index !== -1) {
      if (result.status === EventMarketStatus.Settled && result.isResult === true){
        global.tblEventMarketsV2.splice(index, 1);
      } else {
        global.tblEventMarketsV2[index] = {
          ...global.tblEventMarketsV2[index],
          ...result
        };
      }
    }
    
    marketLogger(
      {
        eventMarketId: markets.eventMarketId,
        actionType: MarketActionType.isresultSet,
        value: isResult,
      },
      request,
      fastify
    ).catch((err) => {
      errorLogger(
        fastify,
        err.message,
        "ERROR --> services/commentary.js/changeMultiMarketsIsResultService",
        request
      );
    });
  }

  return "Event Market updated successfully";
}

const getCommentaryDetailsService = async (request, fastify) => {
  let commentaryDetails = await getCommentaryDetailsQuery(request, fastify);
  return commentaryDetails;
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
  updateEventMarketCloseSuspendTimeService,
  closeEventMarketsByIdsService,
  cancelEventMarketsByIdsService,
  suspendMarketService,
  getManualMarketDataService,
  saveManualMarketDataService,
  upManualMarketDataService,
  getCommentaryListByCompetitionIdService,
  upIsInningRunApiService,
  globalEventMarketDataWithCommIdService,
  globalEventMarketDataWithMarketIdsService,
  handleMarketByDLSService,
  upSendMarketDataService,
  upSusTimeDataService,
  upCloseTimeDataService,
  changeMultiMarketsIsResultService,
  changeMultiMarketsSessionIsResultService,
  getCommentaryDetailsService,
};