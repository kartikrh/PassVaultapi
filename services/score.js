const { getMarketsByCIdQuery,getMarketByGraphByRefIdQuery, getMarketsByCIdV1Query } = require("../repository/TableEventMarkets");
const configConstants = require("../utilities/configConstants");
const { getNotificationLogByClientQuery, updateNotificationLogByClientQuery } = require("../repository/TableNotification");
const { getAllMarketOddsBallByBallByCommentaryId, getAllMarketOddsBallByBallByCommentaryIdV1 } = require("../repository/TableMarketOddsBallByBall");
const {
    getCommentariesDataQuery,
    getAllCommentaryTeamsDataQuery,
    getAllCommentaryPlayerDataQuery,
    getAllCommentaryBallByBallDataQuery,
    getAllOversDataQuery,
    getAllCommentaryWicketDataQuery,
    getAllCommentaryPartnershipDataQuery,
    getCommentariesDataQueryV1,
    getAllCommentaryTeamsDataQueryV1,
    getAllCommentaryPlayerDataQueryV1,
    getAllOversDataQueryV1,
    getAllCommentaryBallByBallDataQueryV1,
    getAllCommentaryWicketDataQueryV1,
    getAllCommentaryPartnershipDataQueryV1,
} = require("../repository/TableCommentary");
const { dltDeviceQuery, saveDeviceQuery } = require("../repository/TableDevice");

// const getAllCommentariesDataService = async (request,fastify) => {
//     try {
//         let commentaries = {};
//         let where = null
//         if(request.body.eventId){
//             where = `tc."wrEventRefId" = '${request.body.eventId}'`;
//         }
//         else if(request.body.commentaryId){
//             where = `tc."wrCommentaryId" = ${request.body.commentaryId}`;
//         }
//         else{
//          where = `tc."wrCommentaryStatus" != 4`;
//         }
//         let commentaryData = await getCommentariesDataQuery(fastify, where);
//         let com = commentaryData.filter((c) => {
//             if (request.body.eventId) {
//                 return c.eventRefId == request.body.eventId;
//             } else if (request.body.commentaryId){
//                 return c.commentaryId == request.body.commentaryId;
//             } else {
//                 return c.commentaryStatus != 4;
//             }
//         })
//         for (c of com) {
//             let whereCondition = `"wrIsDelete" = false AND "wrCommentaryId" = ${c.commentaryId}`
//                 let teams = await getAllCommentaryTeamsDataQuery(whereCondition, fastify);
//                 try {
//                     // teams?.forEach(async (team) => {
//                     for (let team of teams){
//                         const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
//                         if (_teamsC1.length > 0) {
//                             team.image = _teamsC1[0].image;
//                             team.jersey = _teamsC1[0].jersey;
//                             team.nimage = _teamsC1[0].imagePath;
//                             team.njersey =  _teamsC1[0].jerseyPath;
//                         }
//                     }
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let condi = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${c.commentaryId}`
//                 let players = await getAllCommentaryPlayerDataQuery(condi, fastify);
//                 try {
//                     // players?.forEach(async (player) => {
//                     for (let player of players){
//                         if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
//                             player.bowlerOver = player.bowlerOver.toString();
//                         }
//                         if (player.bowlerEconomy === "NaN") {
//                             player.bowlerEconomy = null;
//                         }
//                         const _player = global.tblPlayers.filter((item) => item.playerId === player.playerId);
//                         if (_player.length > 0) {
//                             player.playerimage = _player[0].image;
//                             player.playerType = _player[0].playerType;
//                             player.isKipper = _player[0].isKipper;
//                         }
//                     }
                
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let overs = await getAllOversDataQuery(whereCondition, fastify);

//                 let whereCond = `"wrIsDeletedStatus" = false AND "wrCommentaryId" = ${c.commentaryId}`

//                 let ballByBall = await getAllCommentaryBallByBallDataQuery(whereCond, fastify);
//                 ballByBall?.forEach(async (ball) => {
//                     if (ball.overCount !== null && ball.overCount !== undefined) {
//                         ball.overCount = ball.overCount.toString();
//                     }
//                 });
                
//                 let wickets = await getAllCommentaryWicketDataQuery(whereCond, fastify);

//                 let partnerships = await getAllCommentaryPartnershipDataQuery(whereCondition, fastify);
//                 try {
//                     // partnerships?.forEach(async (partnership) => {
//                     for (let partnership of partnerships){
//                         const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
//                         if (_player1.length > 0) {
//                             partnership.player1image = _player1[0].playerimage;
//                             partnership.player1jerseyandimage = _player1[0].jerseyPlayerImage;
//                             partnership.player1jerseyandimagepath = _player1[0].jerseyPlayerImagePath;
//                         }
//                         const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
//                         if (_player2.length > 0) {
//                             partnership.player2image = _player2[0].playerimage;
//                             partnership.player2jerseyandimage = _player2[0].jerseyPlayerImage;
//                             partnership.player2jerseyandimagepath = _player2[0].jerseyPlayerImagePath;
//                         }
//                     }
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({
//                     commentaryId: c.commentaryId
//                 },fastify) || [];

//                 commentaries[c.eventRefId] = {
//                     commentaryId : c.commentaryId,
//                     eventrefId : c.eventRefId,
//                     commentaryStatus : c.commentaryStatus,
//                     commentaryDetails: c,
//                     commentaryTeams: teams,
//                     commentaryPlayers: players,
//                     commentaryOver: overs,
//                     commentaryBallByBall: ballByBall,
//                     commentaryWicket: wickets,
//                     commentaryPartnership: partnerships,
//                     marketOddsBallByBall : marketOddsBallByBall,
//                 };
//         }
    
//         return commentaries;
//     } catch (error) {
//         throw new Error(error);
//     }
// }
const getAllCommentariesDataService = async (request,fastify) => {
    try {
        let commentaries = {};
        let commentaryData;
        let commData = [];
        if(request.body.eventId){
            commData = global.tblCommentaries.filter(item => item.eventRefId == request.body.eventId) || [];
            if(commData.length == 0) {
                let where = `tc."wrEventRefId" = '${request.body.eventId}'`;
                commentaryData = await getCommentariesDataQuery(fastify, where);
            } else {
                commentaryData = commData
            }
        }
        else if(request.body.commentaryId){
            commData = global.tblCommentaries.filter(item => item.commentaryId == request.body.commentaryId) || [];
            if(commData.length == 0) {
                let where = `tc."wrCommentaryId" = ${request.body.commentaryId}`;
                commentaryData = await getCommentariesDataQuery(fastify, where);
            } else {
                commentaryData = commData
            }
        }
        else {
            commentaryData = global.tblCommentaries.filter(item => item.commentaryStatus != 4) || [];
        }

        let com = commentaryData.filter((c) => {
            if (request.body.eventId) {
                return c.eventRefId == request.body.eventId;
            } else if (request.body.commentaryId){
                return c.commentaryId == request.body.commentaryId;
            } else {
                return c.commentaryStatus != 4;
            }
        })
        for (c of com) {
            let teams, players, overs, ballByBall, wickets, partnerships, marketOddsBallByBall;
            
            // Queries custom where condition
            let whereCondition = `"wrIsDelete" = false AND "wrCommentaryId" = ${c.commentaryId}`;
            let condi = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${c.commentaryId}`;
            let whereCond = `"wrIsDeletedStatus" = false AND "wrCommentaryId" = ${c.commentaryId}`

            if (commData.length == 0) {
                teams = await getAllCommentaryTeamsDataQuery(whereCondition, fastify);
                players = await getAllCommentaryPlayerDataQuery(condi, fastify);
                overs = await getAllOversDataQuery(whereCondition, fastify);
                ballByBall = await getAllCommentaryBallByBallDataQuery(whereCond, fastify);
                wickets = await getAllCommentaryWicketDataQuery(whereCond, fastify);
                partnerships = await getAllCommentaryPartnershipDataQuery(whereCondition, fastify);
                marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({commentaryId: c.commentaryId},fastify) || [];
            } else {
                teams = global.tblCommentaryTeams.filter(item => item.commentaryId == c.commentaryId);
                players = global.tblCommentaryPlayers.filter(item => item.commentaryId == c.commentaryId);
                overs = global.tblOvers.filter(item => item.commentaryId == c.commentaryId);
                ballByBall = global.tblCommentaryBallByBall.filter(item => item.commentaryId == c.commentaryId);
                wickets = global.tblCommentaryWicket.filter(item => item.commentaryId == c.commentaryId);
                partnerships = global.tblCommentaryPartnership.filter(item => item.commentaryId == c.commentaryId);
                marketOddsBallByBall = global.tblMarketOddsBallByBall.filter(item => item.commentaryId == c.commentaryId) || [];
            }
                try {
                    for (let team of teams){
                        const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
                        if (_teamsC1.length > 0) {
                            team.image = _teamsC1[0].image;
                            team.jersey = _teamsC1[0].jersey;
                            team.nimage = _teamsC1[0].imagePath;
                            team.njersey =  _teamsC1[0].jerseyPath;
                        }
                    }

                    for (let player of players){
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
                    }

                    for (let ball of ballByBall) {
                        if (ball.overCount != null && ball.overCount !== undefined) {
                            ball.overCount = String(ball.overCount);
                        }
                    }

                    for (let partnership of partnerships){
                        const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
                        if (_player1.length > 0) {
                            partnership.player1image = _player1[0].playerimage;
                            partnership.player1jerseyandimage = _player1[0].jerseyPlayerImage;
                            partnership.player1jerseyandimagepath = _player1[0].jerseyPlayerImagePath;
                        }
                        const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
                        if (_player2.length > 0) {
                            partnership.player2image = _player2[0].playerimage;
                            partnership.player2jerseyandimage = _player2[0].jerseyPlayerImage;
                            partnership.player2jerseyandimagepath = _player2[0].jerseyPlayerImagePath;
                        }
                    }
                } catch (error) {
                    
                }

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
                };
        }
    
        return commentaries;
    } catch (error) {
        throw new Error(error);
    }
}
// const getAllCommentariesDataV2Service = async (request,fastify) => {
//     try {
//         let commentaries = {};
//         let where = null
//         if(request.body.eventId){
//             where = `tc."wrEventRefId" = '${request.body.eventId}'`;
//         }
//         else if(request.body.commentaryId){
//             where = `tc."wrCommentaryId" = ${request.body.commentaryId}`;
//         }
//         else{
//          where = `tc."wrCommentaryStatus" != 4`;
//         }
//         let commentaryData = await getCommentariesDataQuery(fastify, where);
//         let com = commentaryData.filter((c) => {
//             if (request.body.eventId) {
//                 return c.eventRefId == request.body.eventId;
//             } else if (request.body.commentaryId){
//                 return c.commentaryId == request.body.commentaryId;
//             } else {
//                 return c.commentaryStatus != 4;
//             }
//         })
//         for (c of com) {
//             let whereCondition = `"wrIsDelete" = false AND "wrCommentaryId" = ${c.commentaryId}`
//                 let teams = await getAllCommentaryTeamsDataQuery(whereCondition, fastify);
//                 try {
//                     // teams?.forEach(async (team) => {
//                     for (let team of teams){
//                         const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
//                         if (_teamsC1.length > 0) {
//                             team.image = _teamsC1[0].image;
//                             team.jersey = _teamsC1[0].jersey;
//                             team.nimage = _teamsC1[0].imagePath;
//                             team.njersey =  _teamsC1[0].jerseyPath;
//                         }
//                     }
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let condi = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${c.commentaryId}`
//                 let players = await getAllCommentaryPlayerDataQuery(condi, fastify);
//                 try {
//                     // players?.forEach(async (player) => {
//                     for (let player of players){
//                         if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
//                             player.bowlerOver = player.bowlerOver.toString();
//                         }
//                         if (player.bowlerEconomy === "NaN") {
//                             player.bowlerEconomy = null;
//                         }
//                         const _player = global.tblPlayers.filter((item) => item.playerId === player.playerId);
//                         if (_player.length > 0) {
//                             player.playerimage = _player[0].image;
//                             player.playerType = _player[0].playerType;
//                             player.isKipper = _player[0].isKipper;
//                         }
//                     }
                
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let overs = await getAllOversDataQuery(whereCondition, fastify);

//                 let whereCond = `"wrIsDeletedStatus" = false AND "wrCommentaryId" = ${c.commentaryId}`

//                 let ballByBall = await getAllCommentaryBallByBallDataQuery(whereCond, fastify);
//                 ballByBall?.forEach(async (ball) => {
//                     if (ball.overCount !== null && ball.overCount !== undefined) {
//                         ball.overCount = ball.overCount.toString();
//                     }
//                 });
                
//                 let wickets = await getAllCommentaryWicketDataQuery(whereCond, fastify);

//                 let partnerships = await getAllCommentaryPartnershipDataQuery(whereCondition, fastify);
//                 try {
//                     // partnerships?.forEach(async (partnership) => {
//                     for (let partnership of partnerships){
//                         const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
//                         if (_player1.length > 0) {
//                             partnership.player1image = _player1[0].playerimage;
//                             partnership.player1jerseyandimage = _player1[0].jerseyPlayerImage;
//                             partnership.player1jerseyandimagepath = _player1[0].jerseyPlayerImagePath;
//                         }
//                         const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
//                         if (_player2.length > 0) {
//                             partnership.player2image = _player2[0].playerimage;
//                             partnership.player2jerseyandimage = _player2[0].jerseyPlayerImage;
//                             partnership.player2jerseyandimagepath = _player2[0].jerseyPlayerImagePath;
//                         }
//                     }
//                     // });   
//                 } catch (error) {
                    
//                 }
//                 let marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({
//                     commentaryId: c.commentaryId
//                 },fastify) || [];

//                 commentaries[c.commentaryId] = {
//                     commentaryId : c.commentaryId,
//                     eventRefId : c.eventRefId,
//                     commentaryStatus : c.commentaryStatus,
//                     commentaryDetails: c,
//                     commentaryTeams: teams,
//                     commentaryPlayers: players,
//                     commentaryOver: overs,
//                     commentaryBallByBall: ballByBall,
//                     commentaryWicket: wickets,
//                     commentaryPartnership: partnerships,
//                     marketOddsBallByBall : marketOddsBallByBall,
//                 };
//         }
    
//         return commentaries;
//     } catch (error) {
//         throw new Error(error);
//     }
// }
const getAllCommentariesDataV2Service = async (request,fastify) => {
    try {
        let commentaries = {};
        let commentaryData
        let commData = [];
        if(request.body.eventId){
            commData = global.tblCommentaries.filter(item => item.eventRefId == request.body.eventId) || [];
            if(commData.length == 0) {
                let where = `tc."wrEventRefId" = '${request.body.eventId}'`;
                commentaryData = await getCommentariesDataQuery(fastify, where);
            } else {
                commentaryData = commData
            }
        }
        else if(request.body.commentaryId){
            commData = global.tblCommentaries.filter(item => item.commentaryId == request.body.commentaryId) || [];
            if(commData.length == 0) {
                let where = `tc."wrCommentaryId" = ${request.body.commentaryId}`;
                commentaryData = await getCommentariesDataQuery(fastify, where);
            } else {
                commentaryData = commData
            }
        }
        else {
            commentaryData = global.tblCommentaries.filter(item => item.commentaryStatus != 4) || [];
        }
        let com = commentaryData.filter((c) => {
            if (request.body.eventId) {
                return c.eventRefId == request.body.eventId;
            } else if (request.body.commentaryId){
                return c.commentaryId == request.body.commentaryId;
            } else {
                return c.commentaryStatus != 4;
            }
        })
        for (c of com) {
            let teams, players, overs, ballByBall, wickets, partnerships, marketOddsBallByBall;
            
            // Queries custom where condition
            let whereCondition = `"wrIsDelete" = false AND "wrCommentaryId" = ${c.commentaryId}`;
            let condi = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${c.commentaryId}`;
            let whereCond = `"wrIsDeletedStatus" = false AND "wrCommentaryId" = ${c.commentaryId}`

            if (commData.length == 0) {
                teams = await getAllCommentaryTeamsDataQuery(whereCondition, fastify);
                players = await getAllCommentaryPlayerDataQuery(condi, fastify);
                overs = await getAllOversDataQuery(whereCondition, fastify);
                ballByBall = await getAllCommentaryBallByBallDataQuery(whereCond, fastify);
                wickets = await getAllCommentaryWicketDataQuery(whereCond, fastify);
                partnerships = await getAllCommentaryPartnershipDataQuery(whereCondition, fastify);
                marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({commentaryId: c.commentaryId},fastify) || [];
            } else {
                teams = global.tblCommentaryTeams.filter(item => item.commentaryId == c.commentaryId);
                players = global.tblCommentaryPlayers.filter(item => item.commentaryId == c.commentaryId);
                overs = global.tblOvers.filter(item => item?.commentaryId == c.commentaryId);
                ballByBall = global.tblCommentaryBallByBall.filter(item => item?.commentaryId == c.commentaryId);
                wickets = global.tblCommentaryWicket.filter(item => item?.commentaryId == c.commentaryId);
                partnerships = global.tblCommentaryPartnership.filter(item => item?.commentaryId == c.commentaryId);
                marketOddsBallByBall = global.tblMarketOddsBallByBall.filter(item => item?.commentaryId == c.commentaryId) || [];
            }

                try {
                    for (let team of teams) {
                        const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
                        if (_teamsC1.length > 0) {
                            team.image = _teamsC1[0].image;
                            team.jersey = _teamsC1[0].jersey;
                            team.nimage = _teamsC1[0].imagePath;
                            team.njersey =  _teamsC1[0].jerseyPath;
                        }
                    }

                    for (let player of players){
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
                    }

                    for (let ball of ballByBall) {
                        if (ball.overCount != null && ball.overCount !== undefined) {
                            ball.overCount = String(ball.overCount);
                        }
                    }

                    for (let partnership of partnerships){
                        const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
                        if (_player1.length > 0) {
                            partnership.player1image = _player1[0].playerimage;
                            partnership.player1jerseyandimage = _player1[0].jerseyPlayerImage;
                            partnership.player1jerseyandimagepath = _player1[0].jerseyPlayerImagePath;
                        }
                        const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
                        if (_player2.length > 0) {
                            partnership.player2image = _player2[0].playerimage;
                            partnership.player2jerseyandimage = _player2[0].jerseyPlayerImage;
                            partnership.player2jerseyandimagepath = _player2[0].jerseyPlayerImagePath;
                        }
                    }
                } catch (error) {
                    console.log("error on getAllCommentariesDataV2Service: ", error.message);
                }

                commentaries[c.commentaryId] = {
                    commentaryId : c.commentaryId,
                    eventRefId : c.eventRefId,
                    commentaryStatus : c.commentaryStatus,
                    commentaryDetails: c,
                    commentaryTeams: teams,
                    commentaryPlayers: players,
                    commentaryOver: overs,
                    commentaryBallByBall: ballByBall,
                    commentaryWicket: wickets,
                    commentaryPartnership: partnerships,
                    marketOddsBallByBall : marketOddsBallByBall,
                };
        }
    
        return commentaries;
    } catch (error) {
        throw new Error(error);
    }
}
// const getAllCommentariesDataService = async (request,fastify) => {
//     try {
//         let commentaries = {};
//         let com = global.tblCommentaries.filter((c) => {
//             if (request.body.eventId) {
//                 // If eventId is present, filter by both conditions
//                 return c.eventRefId == request.body.eventId;
//             } else {
//                 // If eventId is not present, filter by commentaryStatus only
//                 return c.commentaryStatus != 4;
//             }
//         })
//         for (c of com) {
//                 let teams = global.tblCommentaryTeams.filter((t) => {
//                     return t.commentaryId === c.commentaryId;
//                 });
//                 try {
//                     teams?.forEach(async (team) => {
//                         const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.teamId);
//                         if (_teamsC1.length > 0) {
//                             team.image = _teamsC1[0].image;
//                             team.jersey = _teamsC1[0].jersey;
//                         }
//                     });   
//                 } catch (error) {
                    
//                 }
//                 let players = global.tblCommentaryPlayers.filter((p) => {
//                     return p.commentaryId === c.commentaryId;
//                 });
//                 try {
//                     players?.forEach(async (player) => {
//                         if (player.bowlerOver !== null && player.bowlerOver !== undefined) {
//                             player.bowlerOver = player.bowlerOver.toString();
//                         }
//                         if (player.bowlerEconomy === "NaN") {
//                             player.bowlerEconomy = null;
//                         }
//                         const _player = global.tblPlayers.filter((item) => item.playerId === player.playerId);
//                         if (_player.length > 0) {
//                             player.playerimage = _player[0].image;
//                             player.playerType = _player[0].playerType;
//                             player.isKipper = _player[0].isKipper;
//                         }
//                     });   
//                 } catch (error) {
                    
//                 }
//                 let overs = global.tblOvers.filter((o) => {
//                     return o.commentaryId === c.commentaryId;
//                 });
//                 let ballByBall = global.tblCommentaryBallByBall.filter((b) => {
//                     return b.commentaryId === c.commentaryId;
//                 });
//                 ballByBall?.forEach(async (ball) => {
//                     if (ball.overCount !== null && ball.overCount !== undefined) {
//                         ball.overCount = ball.overCount.toString();
//                     }
//                 });
//                 let wickets = global.tblCommentaryWicket.filter((w) => {
//                     return w.commentaryId === c.commentaryId;
//                 });
//                 let partnerships = global.tblCommentaryPartnership.filter((p) => {
//                     return p.commentaryId === c.commentaryId;
//                 });
//                 try {
//                     partnerships?.forEach(async (partnership) => {
//                         const _player1 = players.filter((item) => item.commentaryPlayerId === partnership.batter1Id);
            
//                         if (_player1.length > 0) {
//                             partnership.player1image = _player1[0].playerimage;
//                         }
//                         const _player2 = players.filter((item) => item.commentaryPlayerId === partnership.batter2Id);
//                         if (_player2.length > 0) {
//                             partnership.player2image = _player2[0].playerimage;
//                         }
//                     });   
//                 } catch (error) {
                    
//                 }
//                 // let marketOddsBallByBall = global.tblMarketOddsBallByBall.filter((m) => {
//                 //     return m.commentaryId === c.commentaryId;
//                 // });
//                 let marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryId({
//                     commentaryId: c.commentaryId
//                 },fastify) || [];

//                 // let marketRunner = global.tblEventMarkets.filter((m) => {
//                 //     return m.commentaryId === c.commentaryId && m.rateSource === 2
//                 // });
                
//                 // marketRunner = marketRunner.map((item) => {
//                 //     let teamNameData
//                 //     if(item.teamId){
//                 //     teamNameData = global.tblCommentaryTeams.find((elem) => elem.teamId === item.teamId)
//                 //     }
//                 //     if(!item.teamId){
//                 //         teamNameData = global.tblCommentaryTeams.find((t) => 
//                 //             t.teamName.toLowerCase() == item.runner?.toLowerCase())
//                 //     }
//                 //     return {
//                 //         runnerId: item.runnerId,
//                 //         runner: item.runner,
//                 //         selectionId: item.selectionId,
//                 //         backSize: item.backSize,
//                 //         laySize: item.laySize,
//                 //         backPrice: item.backPrice,
//                 //         layPrice: item.layPrice,
//                 //         teamId: item.teamId,
//                 //         teamName: teamNameData?.teamName || null
//                 //     }
//                 // });
        
//                 commentaries[c.eventRefId] = {
//                     commentaryId : c.commentaryId,
//                     eventrefId : c.eventRefId,
//                     commentaryStatus : c.commentaryStatus,
//                     commentaryDetails: c,
//                     commentaryTeams: teams,
//                     commentaryPlayers: players,
//                     commentaryOver: overs,
//                     commentaryBallByBall: ballByBall,
//                     commentaryWicket: wickets,
//                     commentaryPartnership: partnerships,
//                     marketOddsBallByBall : marketOddsBallByBall,
//                     // marketRunner: marketRunner
//                 };
//         }
    
//         return commentaries;
//     } catch (error) {
//         throw new Error(error);
//     }
// }
const getMarketsByCommentaryIdService =async (request , fastify) => {
    // vlaidate commentry id
    // console.log("called getMarketsByCommentaryIdService")
    let where = null;
    let commentaryData = []; 
    if(request.body.commentaryId && request.body.commentaryId != null){
        commentaryData = global.tblCommentaries.filter((i)=> i.commentaryId == request.body.commentaryId)
    }
    else if(request.body.eventId && request.body.eventId != null){
        commentaryData = global.tblCommentaries.filter((i)=> i.eventRefId == request.body.eventId)
    }
    if(commentaryData.length == 0){
        if(request.body.commentaryId){
            where = `tc."wrCommentaryId" = ${request.body.commentaryId}`
        }
        else if(request.body.eventId){
            where = `tc."wrEventRefId" = '${request.body.eventId}'`
        }
        else {
            where = `tc."wrEventRefId" = '${request.body.eventId}'`
        }
        commentaryData = await getCommentariesDataQuery(fastify , where);
    }
    const commentary = commentaryData[0];
    // if (!commentary && request.body.status === undefined) {
    //     return null;
    // }
    // if (!commentary && request.body.status === 1) {
    //     throw new Error("Commentary with this id not found");
    // }
    if (!commentary) {
        throw new Error("Commentary with this id not found");
    }
    // check if isPredicted is true
    if (!commentary.isPredictMarket) {
        return null;
    }
    let LDOMARKETSIDS = global.tblConfigs.find(config => config.key === configConstants.LDOMARKET)?.value ?? "0";
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

const getAllCommentariesDataServiceV1 = async (request,fastify) => {
    try {
        let commentaries = {};
        let commentaryData = await getCommentariesDataQueryV1(fastify);
        let com = commentaryData.filter((c) => {
            if (request.body.eventId) {
                return c.erefid == request.body.eventId;
            } else if (request.body.commentaryId) {
                return c.cid == request.body.commentaryId;
            } else {
                return c.cs != 4;
            }
        })

        for (c of com) {
            let whereCondition = `"wrIsDelete" = false AND "wrCommentaryId" = ${c.cid}`
                let teams = await getAllCommentaryTeamsDataQueryV1(whereCondition, fastify);
                try {
                    teams?.forEach(async (team) => {
                        const _teamsC1 = global.tblTeams.filter((item) => item.teamId === team.tid);
                        if (_teamsC1.length > 0) {
                            team.img = _teamsC1[0].image;
                            team.jersy = _teamsC1[0].jersey;
                        }
                    });   
                } catch (error) {
                    
                }
                let condi = `tcp."wrIsDelete" = false AND tcp."wrCommentaryId" = ${c.cid}`
                let players = await getAllCommentaryPlayerDataQueryV1(condi, fastify);
                try {
                    players?.forEach(async (player) => {
                        if (player.bowlovr !== null && player.bowlovr !== undefined) {
                            player.bowlovr = player.bowlovr.toString();
                        }
                        if (player.bowleco === "NaN") {
                            player.bowleco = null;
                        }
                        const _player = global.tblPlayers.filter((item) => item.playerId === player.plid);
                        if (_player.length > 0) {
                            player.plimg = _player[0].image;
                            player.pltyp = _player[0].playerType;
                            player.iskip = _player[0].isKipper;
                        }
                    });   
                } catch (error) {
                    
                }
                let overs = await getAllOversDataQueryV1(whereCondition, fastify);

                let whereCond = `"wrIsDeletedStatus" = false AND "wrCommentaryId" = ${c.cid}`

                let ballByBall = await getAllCommentaryBallByBallDataQueryV1(whereCond, fastify);
                ballByBall?.forEach(async (ball) => {
                    if (ball.ovrcnt !== null && ball.ovrcnt !== undefined) {
                        ball.ovrcnt = ball.ovrcnt.toString();
                    }
                });
                
                let wickets = await getAllCommentaryWicketDataQueryV1(whereCond, fastify);

                let partnerships = await getAllCommentaryPartnershipDataQueryV1(whereCondition, fastify);
                try {
                    partnerships?.forEach(async (partnership) => {
                        const _player1 = players.filter((item) => item.cplid === partnership.bat1id);
            
                        if (_player1.length > 0) {
                            partnership.pl1img = _player1[0].plimg;
                            partnership.pl1jryimg = _player1[0].jryPlyImg;
                        }
                        const _player2 = players.filter((item) => item.cplid === partnership.bat2id);
                        if (_player2.length > 0) {
                            partnership.pl2img = _player2[0].plimg;
                            partnership.pl2jryimg = _player2[0].jryPlyImg;
                        }
                    });   
                } catch (error) {
                    
                }
                let marketOddsBallByBall = await getAllMarketOddsBallByBallByCommentaryIdV1({
                    commentaryId: c.cid
                },fastify) || [];

                commentaries[c.erefid] = {
                    cid : c.cid,
                    erefid : c.erefid,
                    cs : c.cs,
                    commentaryDetails: c,
                    commentaryTeams: teams,
                    commentaryPlayers: players,
                    commentaryOver: overs,
                    commentaryBallByBall: ballByBall,
                    commentaryWicket: wickets,
                    commentaryPartnership: partnerships,
                    marketOddsBallByBall : marketOddsBallByBall,
                };
        }
    
        return commentaries;
    } catch (error) {
        throw new Error(error);
    }
}

const getMarketsByCommentaryIdServiceV1 =async (request , fastify) => {
    // vlaidate commentry id
    let commentaryData = await getCommentariesDataQuery(fastify);
    const commentary = commentaryData.find((c) => {
        return c.eventRefId === request.body.eventId;
    });    
    if (!commentary) {
        throw new Error("Commentary with this id not found");
    }
    // check if isPredicted is true
    if (!commentary.isPredictMarket) {
        return null;
    }
    let LDOMARKETSIDS = global.tblConfigs.find(config => config.key === configConstants.LDOMARKET)?.value ?? "0";
    let whereCondition = ` AND "wrMarketTypeCategoryId" NOT IN (${LDOMARKETSIDS})`;
    
    const getCommentaries = await getMarketsByCIdV1Query(request, whereCondition, fastify);
    
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
const saveDeviceDataService = async (request, fastify) => {
    const devices = global.tblDevices || [];
    // go accroding to device type and then userId at the time only one data will be saved with one device type and userId or devictype and tempCId if not logged in
    const { deviceType, userId, tempCId } = request.body;
    let deviceData = devices.filter((d) => d.deviceType === deviceType && (d.userId === userId || d.tempCId === tempCId));
    if(deviceData.length > 0){
        // delete the old device data
        let ids = deviceData.map((d) => d.id);
        await dltDeviceQuery(
            ids,
            fastify,
            request
        );
        global.tblDevices = global.tblDevices.filter((d) => !ids.includes(d.deviceId));
        // save the new device data
        let dData = await saveDeviceQuery(
            request.body,
            fastify,
            request
        );
        global.tblDevices.push(dData);
        return dData;
    }
    else {
        // save the new device data
        let dData = await saveDeviceQuery(
            request.body,
            fastify,
            request
        );
        global.tblDevices.push(dData);
        return dData;
    }
    return true;
}
module.exports = { 
    getAllCommentariesDataService,
    getMarketsByCommentaryIdService,
    getNotificationByClientService,
    markReadNotificationService,
    getMarketByGraphByRefIdService,
    getAllCommentariesDataServiceV1,
    getMarketsByCommentaryIdServiceV1,
    saveDeviceDataService,
    getAllCommentariesDataV2Service
 };
