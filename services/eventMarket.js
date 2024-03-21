const { updateEventMarketQuery, getAllEventMarketsQuery, createManyEventMarketQuery, deleteEventMarketQuery, changeIsActiveEventMarketQuery, changeIsAllowEventMarketQuery, changeIsResultEventMarketQuery, createEventMarketQuery, getMarketListByCIdQuery, updateEventMarketRateQuery, createEventMarketInDBQuery,changeMarketCancelQuery, changeMarketResultQuery, changeMarketCloseQuery, suspendEventMarketQuery, closeEventMarketByTeamIdQuery, getMarketLogsByCIdQuery, cancelEventMarketByTeamIdQuery } = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const {EventMarketStatus, MarketActionType, ActionTypeForMarketCancel} = require("../utilities/index");
const { marketLogger } = require("../utilities/logger");
const getDetailsByCIdService = async (request, fastify) => {
    const {commentaryId} = request.body;
    const commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    // i want this structure as per innings
    const matchType = global.tblMatchTypes.find((item) => item.matchTypeId === commentary.matchTypeId);

    // i want to set the commentaryTeam and playerTeam as per innings
    const totalInnings = matchType.noOfIningsPerSide;
    const teamAndPlayers = [];
    for (let i = 1; i <= totalInnings; i++) {
        // get team for this innings
        let commentaryTeam = global.tblCommentaryTeams.filter((item) => item.commentaryId === commentaryId && item.currentInnings === i);
        // get players for this innings and commentaryTeam.teamId
        let teamObj = {};
        for (team of commentaryTeam) {  
            commentaryPlayers = global.tblCommentaryPlayers.filter((item) => 
                item.commentaryId === commentaryId && 
                item.teamId === team.teamId &&
                item.currentInnings === i
            );
            teamObj = {
                ...team,
                players: commentaryPlayers
            };
            teamAndPlayers.push(teamObj);
        }
    }

    // get marketTemplate where matchType is commentary.matchTypeId
    const marketTemplate = global.tblMarketTemplate.filter((item) => item.matchTypeID === commentary.matchTypeId);
    // let eventMarket = global.tblEventMarkets.filter(
    //     (item) => item.commentaryId === commentaryId
    //     && item.status !== EventMarketStatus.Cancel 
    //     && item.status !== EventMarketStatus.Close 
    //     && item.status !== EventMarketStatus.Settled
    // );
    let eventMarket = await getAllEventMarketsQuery(fastify);
    eventMarket = eventMarket.filter(
        (item) => item.commentaryId === commentaryId
        && item.status !== EventMarketStatus.Cancel 
        && item.status !== EventMarketStatus.Close 
        && item.status !== EventMarketStatus.Settled
    );
    return {
        commentary,
        matchType,
        teamAndPlayers,
        marketTemplate,
        eventMarket
    };
}
const getAllEventMarketsService = async (request ,fastify) => {
    const {isActive , eventTypeId , competitionId, eventId , status} = request.body;
    let eventMarket = global.tblEventMarkets;
    if(eventTypeId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.eventTypeId === eventTypeId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(competitionId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.competitionId === competitionId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(eventId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.eventId === eventId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(status !== undefined){
        eventMarket = eventMarket.filter((item) => item.status === status);
    }
    if(isActive !== undefined){
        eventMarket = eventMarket.filter((item) => item.isActive === isActive);
    }
    return eventMarket;

}
const getEventMarketByIdService = async (request ,fastify) => {
    const {eventMarketId} = request.body;
    let eventMarket = global.tblEventMarkets.find((item) => item.eventMarketId === eventMarketId);
    return eventMarket;

}
const createEventMarketsService = async (request ,fastify) => { 
    const {
        eventMarket
    } = request.body;
    // diffrent two array on eventMarket Id
    let arrayForCreate = [];
    let arrayForUpdate = [];

    for (let item of eventMarket) {
        if(item.eventMarketId == 0){
            // validate the commentaryId
            let commentary = global.tblCommentaries.find((c) => c.commentaryId === item.commentaryId);
            if (!commentary) {
                throw new Error("Commentary with this id not Found");
            }
            arrayForCreate.push(item);
        }
        else{
            // validate the eventMarketId
            let eventMarket = global.tblEventMarkets.find((e) => e.eventMarketId === item.eventMarketId);
            if (!eventMarket) {
                throw new Error("EventMarket with this id not Found");
            } 
            // validate the commentaryId
            let commentary = global.tblCommentaries.find((c) => c.commentaryId === item.commentaryId);
            if (!commentary) {
                throw new Error("Commentary with this id not Found");
            }
            arrayForUpdate.push(item);
        }
    }

    let createdData = [];
    let updatedData = [];
    // create the eventMarket
    if(arrayForCreate.length > 0){
        for (let item of arrayForCreate) {
            let createEvent = await createEventMarketQuery(item,request,fastify);
            createdData.push(createEvent);
        }
    }
    // update the eventMarket
    if(arrayForUpdate.length > 0){
        for (let item of arrayForUpdate) {
            let updateEvent =  await updateEventMarketQuery(item,request,fastify);
            updatedData.push(updateEvent);
        }
    }

   global.tblEventMarkets.push(...createdData);
   // update the eventMarket
    for(let item of updatedData){
        let eventMarket = global.tblEventMarkets.findIndex((e) => e.eventMarketId === item.eventMarketId);
        global.tblEventMarkets[eventMarket] = item;
    }

    return "Event Market saved successfully";
}

const deleteEventMarketsService = async (request ,fastify) => {
    // get the eventMarketId from request
    const {eventMarketId} = request.body;
    await deleteEventMarketQuery(eventMarketId,request,fastify);

    global.tblEventMarkets = global.tblEventMarkets.filter(
        (item) => !eventMarketId.includes(item.eventMarketId)
    )

    return "Event Market deleted successfully";
}
const activeInactiveMarketsService = async (request ,fastify) => {
    // validate eventMarketId
    const {eventMarketId,isActive} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }
    // update the eventMarket
    await changeIsActiveEventMarketQuery(request.body,request,fastify);

    global.tblEventMarkets[eventMarket].isActive = isActive;

    return "Event Market updated successfully";
}
const updateAllowMarketsService = async (request ,fastify) => {
    const {eventMarketId,isAllow} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }

    await changeIsAllowEventMarketQuery(request.body,request,fastify);
    global.tblEventMarkets[eventMarket].isAllow = isAllow;
    return "Event Market updated successfully";
}
const getEventListByCompetitionIdsService = async (request ,fastify) => {
    // validate competitionId
    const {competitionId} = request.body;
    let competition = global.tblCompetitions.find((item) => item.competitionId === competitionId);
    if (!competition) {
        throw new Error("Competition with this id not Found");
    }
    // get the eventlist by competitionId
    let eventList = global.tblEvents.filter((item) => item.competitionId === competitionId)
                    .map((item) => ({
                        eventId: item.eventId,
                        eventName: item.eventName
                    }));
    return eventList;

}
const marketListResultFalseService = async (request ,fastify) => {
    const {isActive , eventTypeId , competitionId, eventId , status} = request.body;
    let eventMarket = global.tblEventMarkets.filter((item)=>{
        return item.isResult === false && item.result !== null
        && item.status == EventMarketStatus.Settled
    })
    if(eventTypeId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.eventTypeId === eventTypeId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(competitionId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.competitionId === competitionId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(eventId){
        // get the commentaryId from tblCommentaries
        let commentaryId = global.tblCommentaries.filter((item) => item.eventId === eventId).map((item) => item.commentaryId);
        eventMarket = eventMarket.filter((item) => commentaryId.includes(item.commentaryId));
    }
    if(status !== undefined){
        eventMarket = eventMarket.filter((item) => item.status === status);
    }
    if(isActive !== undefined){
        eventMarket = eventMarket.filter((item) => item.isActive === isActive);
    }

    return eventMarket;
}
const changeResultOfMarketService = async (request ,fastify) => {
    const {eventMarketId,isResult} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }
    // if isresult is true then dont allow to change the result
    if(global.tblEventMarkets[eventMarket].isResult){
        throw new Error("Result of this market is already set");
    }
    await changeIsResultEventMarketQuery(request.body,request,fastify);
    global.tblEventMarkets[eventMarket].isResult = isResult;

    marketLogger({
        eventMarketId,
        actionType: MarketActionType.isresultSet,
        value: isResult
    }, request, fastify);

    return "Event Market updated successfully";
}
const marketListByCIdService = async (request ,fastify) => {
    const {commentaryId} = request.body;
    // validate the commentaryId
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }

    const marketList = await getMarketListByCIdQuery(request.body,request,fastify);
    return marketList;

}
const updateMarketRateService = async (request ,fastify) => {
    // i got array of eventMarket i want to update this data
    const {eventMarket} = request.body;

    let updatedData = [];
    for (let item of eventMarket) {
        // update the eventMarket
        let data = await updateEventMarketRateQuery(item,request,fastify);
        updatedData.push(data);
    }

    for(let item of updatedData){
        let eventMarket = global.tblEventMarkets.findIndex((e) => e.eventMarketId === item.eventMarketId);
        global.tblEventMarkets[eventMarket] = item;
    }

    return "Event Market updated successfully";
}
const saveEventMarketService = async (request ,fastify) => {
    if(request.body.eventMarketId == 0){
        return await createEventMarketService(request,fastify);
    }else{
        return await updateEventMarketService(request,fastify);
    }
}
const createEventMarketService = async (request ,fastify) => {
    const { commentaryId} = request.body;
    // validate the commentaryId
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    // create the eventMarket
    const eventMarket = await createEventMarketInDBQuery(request.body,request,fastify);

    global.tblEventMarkets.push(eventMarket);

    return eventMarket;

}
const updateEventMarketService = async (request ,fastify) => {
    const {eventMarketId , commentaryId} = request.body;
    // validate the eventMarketId
    let eventMarketIndex = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    if (eventMarketIndex == -1) {
        throw new Error("EventMarket with this id not Found");
    }
    // validate the commentaryId
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    // update the eventMarket
    const updateData = await updateEventMarketQuery(request.body,request,fastify);

    global.tblEventMarkets[eventMarketIndex] = updateData;

    return updateData;

}
const changeMarketCancelService = async (request ,fastify) => {
    const {eventMarketId, commentaryId, password} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    // get password from config
    const configPassword = global.tblConfigs.find((item) => item.key ===configConstants.PASSWORD).value;
    if(configPassword !== password){
        throw new Error("Password is incorrect");
    }
    const currentStatus = global.tblEventMarkets[eventMarket].status;
    if (currentStatus === EventMarketStatus.Close) {
        await changeMarketCancelQuery(request.body, request, fastify);
        global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
        return "Market Cancel updated successfully";
    } else {
        throw new Error("Market is not currently closed, so it cannot be canceled");
    }
}
const changeMarketResultService = async (request ,fastify) => {
    const {eventMarketId, commentaryId, result} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    const currentStatus = global.tblEventMarkets[eventMarket].status;
    const currentResult = global.tblEventMarkets[eventMarket].result;
    if (currentStatus === EventMarketStatus.Close && currentResult === null) {
        await changeMarketResultQuery(request.body, request, fastify);
        global.tblEventMarkets[eventMarket].result = result;
        return "Market result updated successfully";
    } else {
        throw new Error("Market is not closed or result is already set, so it cannot be updated");
    }
}
const changeMarketCloseService = async (request ,fastify) => {
    const {eventMarketId, commentaryId} = request.body;
    let eventMarket = global.tblEventMarkets.findIndex((item) => item.eventMarketId === eventMarketId);
    let commentary = global.tblCommentaries.find((item) => item.commentaryId === commentaryId);
    if (eventMarket === -1) {
        throw new Error("EventMarket with this id not Found");
    }
    if (!commentary) {
        throw new Error("Commentary with this id not Found");
    }
    const currentStatus = global.tblEventMarkets[eventMarket].status;
    if (![EventMarketStatus.Settled, EventMarketStatus.Cancel, EventMarketStatus.Close].includes(currentStatus)) {
        await changeMarketCloseQuery(request.body, request, fastify);

        global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;

        return "Market close updated successfully";
    } else {
        return "Market is already settled, canceled, or closed, so it cannot be updated to close.";
    }
}
const suspendMarketByCIdService = async (request ,fastify) => {
    let { commentaryId} = request.body;
    // i have array of commentaryId i want to get the eventMarketId
    // array of commentaryId not one value
    let eventMarkets = global.tblEventMarkets.filter(item => commentaryId.includes(item.commentaryId));
    if(eventMarkets.length == 0){
        throw new Error("No market found for this commentary");
    }

    const updateMarket = await suspendEventMarketQuery(request.body, request, fastify);
    for(let item of updateMarket){
        let eventMarket = global.tblEventMarkets.findIndex((e) => e.eventMarketId === item.eventMarketId);
        global.tblEventMarkets[eventMarket].status = EventMarketStatus.Suspend;
    }
    return "Market suspended successfully";

}

const handleMarketCloseService = async (data,request ,fastify) => {
    // check the eventMarket close log for this commentaryId
    const checkLog = await getMarketLogsByCIdQuery({
        commentaryId: data.commentaryId,
        actionType: MarketActionType.closeMarketOnTossWin
    }, request, fastify);
    if(checkLog[0].count > 0){
        return "Market already closed";
    }
    // close the market for bowling team for this commentary
    let bowlingTeam = global.tblCommentaryTeams.find((item) => item.commentaryId == data.commentaryId 
                && item.currentInnings === data.inningsId 
                && item.teamStatus == 2);

    const updateData = await closeEventMarketByTeamIdQuery({
        commentaryId: data.commentaryId,
        teamId: bowlingTeam.teamId,
        inningsId: data.inningsId
    }, request, fastify);

    for(let item of updateData){
        let eventMarket = global.tblEventMarkets.findIndex((e) => e.eventMarketId === item.eventMarketId);
        if(eventMarket){
            global.tblEventMarkets[eventMarket].status = EventMarketStatus.Close;
        }
    }

    // cancel the market as per actionType
    const cancelMarket = await cancelEventMarketByTeamIdQuery({
        commentaryId: data.commentaryId,
        teamId: bowlingTeam.teamId,
        inningsId: data.inningsId,
        actionType : ActionTypeForMarketCancel.winCloseCancel
    }, request, fastify);

    for(let item of cancelMarket){
        let eventMarket = global.tblEventMarkets.findIndex((e) => e.eventMarketId === item.eventMarketId);
        if(eventMarket){
            global.tblEventMarkets[eventMarket].status = EventMarketStatus.Cancel;
        }
    }

    marketLogger({
        commentaryId: data.commentaryId,
        actionType: MarketActionType.closeMarketOnTossWin,
        value: `eventMarketStatus : ${EventMarketStatus.Close}`
    }, request, fastify);

    return "Market closed successfully";
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
    getEventMarketByIdService
    
};
