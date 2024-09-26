const { getMarketsByCIdQuery,getMarketByGraphByRefIdQuery } = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const { getNotificationLogByClientQuery, updateNotificationLogByClientQuery } = require("../repository/TableNotification");
const { getAllMarketOddsBallByBallByCommentaryId } = require("../repository/TableMarketOddsBallByBall");

const getAllCommentariesDataService = async (request,fastify) => {
    try {
        let commentaries = {};
        let com = global.tblCommentaries.filter((c) => {
            if (request.body.eventId) {
                // If eventId is present, filter by both conditions
                return c.eventRefId == request.body.eventId;
            } else {
                // If eventId is not present, filter by commentaryStatus only
                return c.commentaryStatus != 4;
            }
        })
        for (c of com) {
                let teams = global.tblCommentaryTeams.filter((t) => {
                    return t.commentaryId === c.commentaryId;
                });
                try {
                    teams?.forEach(async (team) => {
                        const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
                        if (_teamsC1.length > 0) {
                            team.image = _teamsC1[0].image;
                            team.jersey = _teamsC1[0].jersey;
                        }
                    });   
                } catch (error) {
                    
                }
                let players = global.tblCommentaryPlayers.filter((p) => {
                    return p.commentaryId === c.commentaryId;
                });
                try {
                    players?.forEach(async (player) => {
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
                let overs = global.tblOvers.filter((o) => {
                    return o.commentaryId === c.commentaryId;
                });
                let ballByBall = global.tblCommentaryBallByBall.filter((b) => {
                    return b.commentaryId === c.commentaryId;
                });
                ballByBall?.forEach(async (ball) => {
                    if (ball.overCount !== null && ball.overCount !== undefined) {
                        ball.overCount = ball.overCount.toString();
                    }
                });
                let wickets = global.tblCommentaryWicket.filter((w) => {
                    return w.commentaryId === c.commentaryId;
                });
                let partnerships = global.tblCommentaryPartnership.filter((p) => {
                    return p.commentaryId === c.commentaryId;
                });
                try {
                    partnerships?.forEach(async (partnership) => {
                        const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
                        if (_player1.length > 0) {
                            partnership.player1image = _player1[0].playerimage;
                        }
                        const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
                        if (_player2.length > 0) {
                            partnership.player2image = _player2[0].playerimage;
                        }
                    });   
                } catch (error) {
                    
                }
                // let marketOddsBallByBall = global.tblMarketOddsBallByBall.filter((m) => {
                //     return m.commentaryId === c.commentaryId;
                // });
                let marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({
                    commentaryId: c.commentaryId
                },fastify) || [];

                // let marketRunner = global.tblEventMarkets.filter((m) => {
                //     return m.commentaryId === c.commentaryId && m.rateSource === 2
                // });
                
                // marketRunner = marketRunner.map((item) => {
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
        
                commentaries[c.eventRefId] = {
                    commentaryId : c.commentaryId,
                    eventrefId : c.eventRefId,
                    commentaryStatus : c.commentaryStatus,
                    commentaryDetails: c,
                    commentaryTeams: teams,
                    commentaryPlayers: players,
                    commentaryOver: overs,
                    commentaryBallByBall: ballByBall,
                    commentaryWicket: wickets,
                    commentaryPartnership: partnerships,
                    marketOddsBallByBall : marketOddsBallByBall,
                    // marketRunner: marketRunner
                };
        }
    
        return commentaries;
    } catch (error) {
        throw new Error(error);
    }
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
    let LDOMARKETSIDS = global.tblConfigs.find(config => config.key === "LDOMARKET")?.value ?? "0";
    let whereCondition = ` AND "wrMarketTypeCategoryId" NOT IN (${LDOMARKETSIDS})`;
    
    const getCommentaries = await getMarketsByCIdQuery(request, whereCondition, fastify);
    
    const datProviderUrl = global.tblConfigs.find((c) => c.key == configConstants.DATAPROVIDERURL);
    if(!datProviderUrl){
        throw new Error("Data provider url not found");
    }

    if(!getCommentaries.settledMarkets && !getCommentaries.openMarkets){
        return null;
    }
    return {
        ...getCommentaries,
        dataProviderUrl: datProviderUrl.value
    };
}
const getNotificationByClientService = async (request , fastify)=>{
    let data = await getNotificationLogByClientQuery(request.body,request ,fastify);
    if(data.length == 0){
       return null
    }
    return {
        notData : data,
        unreadNot : data[0].unreadCount ? parseInt(data[0].unreadCount) : 0,
        totalNot : data.length
    };
}
const markReadNotificationService = async (request , fastify) => {
    const updateData = await updateNotificationLogByClientQuery(request.body,request ,fastify);
    return true;
}

const getMarketByGraphByRefIdService =async (request , fastify) => {
    const commentary = global.tblCommentaries.find((c) => {
        return c.eventRefId === request.body.eventId;
    });
    if (!commentary) {
        throw new Error("Commentary with this id not found");
    }
    const getGraphsData = await getMarketByGraphByRefIdQuery( {
        commentaryId: parseInt(commentary.commentaryId)
      },request , fastify);

    return getGraphsData;
}
module.exports = { getAllCommentariesDataService ,getMarketsByCommentaryIdService , getNotificationByClientService,
    markReadNotificationService,
    getMarketByGraphByRefIdService
 };
