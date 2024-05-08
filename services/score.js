const getAllCommentariesDataService = (request, fastify) => {
    let commentaries = {};
    global.tblCommentaries.filter((c) => {
        return c.commentaryStatus !== 4;
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
            commentaryDetails: c,
            commentaryTeams: teams,
            commentaryPlayers: players,
            commentaryOvers: overs,
            commentaryBallByBall: ballByBall,
            commentaryWicket: wickets,
            commentaryPartnership: partnerships
        };
    });

    return commentaries;
}

module.exports = { getAllCommentariesDataService };
