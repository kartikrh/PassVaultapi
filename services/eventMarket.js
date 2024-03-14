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
    

}

const createEventMarketsService = async (request ,fastify) => { 
    // array of eventMarkets

    // const {
    //     eventMarket
    // } = request.body;
    // // diffrent two array on eventMarket Id
    // let arrayForCreate = [];
    // let arrayForUpdate = [];

    // for (let item of eventMarket) {
    //     if(item.eventMarketId == 0){
    //         arrayForCreate.push(item);
    //     }
    //     else{
    //         // validate the eventMarketId
    //         let eventMarket = global.tblEventMarkets.find((item) => item.eventMarketId === item.eventMarketId);
    //         if (!eventMarket) {
    //             throw new Error("EventMarket with this id not Found");
    //         }
    //         arrayForUpdate.push(item);
    //     }
    // }

    // create the eventMarket
    
}
module.exports = {
    getDetailsByCIdService,
    getAllEventMarketsService,
    createEventMarketsService
};