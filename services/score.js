const { getMarketsByCIdQuery } = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");

const getAllCommentariesDataService = (request) => {
    let commentaries = {};
    global.tblCommentaries.filter((c) => {
        if (request.body.eventId) {
            // If eventId is present, filter by both conditions
            return c.commentaryStatus != 4 && c.eventRefId == request.body.eventId;
        } else {
            // If eventId is not present, filter by commentaryStatus only
            return c.commentaryStatus != 4;
        }
    }).forEach((c) => {
        let teams = global.tblCommentaryTeams.filter((t) => {
            return t.commentaryId === c.commentaryId;
        });
        let players = global.tblCommentaryPlayers.filter((p) => {
            return p.commentaryId === c.commentaryId;
        });
        let overs = global.tblOvers.filter((o) => {
            return o.commentaryId === c.commentaryId;
        });
        let ballByBall = global.tblCommentaryBallByBall.filter((b) => {
            return b.commentaryId === c.commentaryId;
        });
        let wickets = global.tblCommentaryWicket.filter((w) => {
            return w.commentaryId === c.commentaryId;
        });
        let partnerships = global.tblCommentaryPartnership.filter((p) => {
            return p.commentaryId === c.commentaryId;
        });
        commentaries[c.eventRefId] = {
            commentaryId : c.commentaryId,
            eventrefId : c.eventRefId,
            commentaryDetails: c,
            commentaryTeams: teams,
            commentaryPlayers: players,
            commentaryOver: overs,
            commentaryBallByBall: ballByBall,
            commentaryWicket: wickets,
            commentaryPartnership: partnerships
        };
    });

    return commentaries;
}
const getMarketsByCommentaryIdService =async (request , fastify) => {
    // vlaidate commentry id
    // console.log("called getMarketsByCommentaryIdService")
    const commentary = global.tblCommentaries.find((c) => {
        return c.eventRefId === request.body.eventId;
    });
    if (!commentary) {
        throw new Error("Commentary with this id not found");
    }
    // check if isPredicted is true
    if (!commentary.isPredictMarket) {
        return null;
    }
    const getCommentaries = await getMarketsByCIdQuery(request , fastify);
    const datProviderUrl = global.tblConfigs.find((c) => c.key == configConstants.DATAPROVIDERURL);
    if(!datProviderUrl){
        throw new Error("Data provider url not found");
    }

    if(!getCommentaries.settledMarket && !getCommentaries.openMarkets){
        return null;
    }
    return {
        ...getCommentaries,
        dataProviderUrl: datProviderUrl.value
    };
}
module.exports = { getAllCommentariesDataService ,getMarketsByCommentaryIdService };
