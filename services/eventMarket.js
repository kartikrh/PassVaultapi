const { updateEventMarketQuery, getAllEventMarketsQuery, createManyEventMarketQuery, deleteEventMarketQuery, changeIsActiveEventMarketQuery, changeIsAllowEventMarketQuery } = require("../repository/TableEventMarkets");
const {EventMarketStatus} = require("../utilities/index")
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
    const eventMarket = global.tblEventMarkets.filter(
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
    if(status){
        eventMarket = eventMarket.filter((item) => item.status === status);
    }
    if(isActive){
        eventMarket = eventMarket.filter((item) => item.isActive === isActive);
    }
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
            let commentary = global.tblCommentaries.find((item) => item.commentaryId === item.commentaryId);
            if (!commentary) {
                throw new Error("Commentary with this id not Found");
            }
            arrayForCreate.push(item);
        }
        else{
            // validate the eventMarketId
            let eventMarket = global.tblEventMarkets.find((item) => item.eventMarketId === item.eventMarketId);
            if (!eventMarket) {
                throw new Error("EventMarket with this id not Found");
            } 
            // validate the commentaryId
            let commentary = global.tblCommentaries.find((item) => item.commentaryId === item.commentaryId);
            if (!commentary) {
                throw new Error("Commentary with this id not Found");
            }
            arrayForUpdate.push(item);
        }
    }

    // create the eventMarket
    if(arrayForCreate.length > 0){
        await createManyEventMarketQuery(arrayForCreate,request,fastify);
    }
    // update the eventMarket
    if(arrayForUpdate.length > 0){
        for (let item of arrayForUpdate) {
            await updateEventMarketQuery(item,request,fastify);
        }
    }

    global.tblEventMarkets = await getAllEventMarketsQuery(fastify);

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

module.exports = {
    getDetailsByCIdService,
    getAllEventMarketsService,
    createEventMarketsService,
    deleteEventMarketsService,
    activeInactiveMarketsService,
    updateAllowMarketsService
};
