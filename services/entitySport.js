const { getPlyByIdQuery } = require("../repository/TablePlayer")
const { getTeamsByIds } = require("../repository/TableTeams")
const { getCompetitionByIdsQuery } = require("../repository/TableCompitition")
const { getComEntityQuery, updateVirtualPartnershipQuery } = require("../repository/TableCommentary")
const { getAllTournamentTeamPlayerByIdsQuery } = require("../repository/TableTournamentsTeamPlayers")
const { getMatchDataByCId, syncEntitySportCommentaryService } = require("../services/commentry");
const {
    callClientAPI,
    ServiceType,
    APIEndpointModuleType,
    BALL_TYPE,
    EntityCommentaryStatus,
    wicketTypeObj,
} = require("../utilities/index");
const { getCountryByIds } = require("../repository/TableCountryCodes")
const { getVenueByIds } = require("../repository/TableVenue")
const { compStatus, commentaryStatus } = require("../utilities")
const { buildOverData, buildPartnershipData, buildComPlayers, genEtPartnership, generateOverEt, generateBallET, generateDisplayStatus, getBowlerOnlyRuns, generateWicket, generateRemainingRuns } = require("../utilities/comFunction")
const { virtualOverQuery, virtualBallByBallQuery, virtualPartnershipQuery } = require("../repository/TableVirtual")
const { default: fastify } = require("fastify")
const { commentaryLogger } = require("../utilities/logger")
const { playerMarketQuery } = require("../repository/TableEventMarkets")
const { playerBattingHistSummarycalculationService } = require("./playerHistory")
const commentary = require("../routes/admin/commentary")
const { upActivePartQuery } = require("../repository/entitySportCom")


const saveTeamsService = async (request , fastify)=>{
    // get the team by id
    // console.log("request.body", request.body)
    let team = await getTeamsByIds(request.body , request,fastify)
    // check in global and store
    for (let t of team){
        let index = global.tblTeams.findIndex((i)=> i.teamId == t.teamId)
        if(index == -1){
            global.tblTeams.push(t)
        }
        else {
            global.tblTeams[index] = t;
        }
    }
    return "Team Updated successfully."
}
const savePlayersService = async (request , fastify)=>{
    // get the team by id
    // console.log("request.body", request.body)

    let ply = await getPlyByIdQuery(request.body , request,fastify)
    // check in global and store
    for (let p of ply){
        let index = global.tblPlayers.findIndex((i)=> i.playerId == p.playerId)
        if(index == -1){
            global.tblPlayers.push(p)
        }
        else {
            global.tblPlayers[index] = p;
        }
    }
    return "Player Updated successfully."
}
const saveCompetitionsService = async (request , fastify) =>{
    let {competitionIds, tournamentTeamPlayers,tournamentTeamPoint} =request.body;
    // console.log("request.body", request.body)

    let comp = await getCompetitionByIdsQuery({
        competitionIds : competitionIds
    },request,fastify)
   
    for (c of comp){
        let index = global.tblCompetitions.findIndex((ca)=>ca.competitionId == c.competitionId);
        if(index == -1){
            global.tblCompetitions.push(c)
        }
        else{
            global.tblCompetitions[index] = c  
        }
    }
    // save tournament teamplayer
    if(tournamentTeamPlayers.length > 0){
        let ply = await getAllTournamentTeamPlayerByIdsQuery({
            tournamentTeamPlayers : tournamentTeamPlayers
        },request,fastify)

        for (let p of ply){
            let index = global.tblTournamentTeamPlayers.findIndex((tp)=> tp.id == p.id);
            if(index == -1){
                global.tblTournamentTeamPlayers.push(p)
            }
            else {
                global.tblTournamentTeamPlayers[index] = p
            }
        }
    }
    return true;
}
const saveCommentariesService = async (request , fastify) =>{
    let { commentaryIds} =request.body;
    // console.log("request.body", request.body)

    let comp = await getComEntityQuery({
        commentaryIds : commentaryIds
    },request,fastify)
   
    if(comp.com?.length > 0){
        for (c of comp.com){
            let index = global.tblCommentaries.findIndex((ca)=>ca.commentaryId == c.commentaryId);
            if(index == -1){
                global.tblCommentaries.push(c)
            }
            else{
                global.tblCommentaries[index] = c  
            }
        }
        for (let ct of comp.comTeams){
            let index = global.tblCommentaryTeams.findIndex((tp)=> tp.commentaryTeamId == ct.commentaryTeamId);
            if(index == -1){
                global.tblCommentaryTeams.push(ct)
            }
            else {
                global.tblCommentaryTeams[index] = ct
            }
        }
        for (let cp of comp.comPlayers){
            let index = global.tblCommentaryPlayers.findIndex((tp)=> tp.commentaryPlayerId == cp.commentaryPlayerId);
            if(index == -1){
                global.tblCommentaryPlayers.push(cp)
            }
            else {
                global.tblCommentaryPlayers[index] = cp
            }
        }
        for (addCommentry of comp.com) {
            if (addCommentry.isActive == true && addCommentry.isTest == false) {
              let cData = await getMatchDataByCId(
                {
                  commentaryId: addCommentry.commentaryId,
                },
                request,
                fastify
              );
              callClientAPI(
                {
                  serviceType: ServiceType.clientAPI,
                  moduleType: APIEndpointModuleType.commentaryUpdate,
                  data: {
                    ...cData,
                    type: cData?.cst == 1 ? "scheduled" 
                        : (cData?.cst === 4 || cData?.cst === 10) ? "completed" : "live"
                  },
                },
                request,
                fastify
              ).catch((err) => {
                console.log("call client api console on entitySport", err);
                errorLogger(
                  fastify,
                  err.message,
                  "ERROR --> services/entitySport.js/saveCommentariesService",
                  request
                );
              });
            }
        }
    }
    else {
        return "No commentaries found to update."
    }
}

const saveCountryCodesService = async (request, fastify) => {
    let countryCodes = await getCountryByIds(request.body, request, fastify)
    for (let cc of countryCodes) {
        let index = global.tblCountryCodes.findIndex((i) => i.id == cc.id)
        if (index == -1) {
            global.tblCountryCodes.push(cc)
        }
        else {
            global.tblCountryCodes[index] = cc;
        }
    }
    return "Country Code Updated successfully."
}

const saveVenueService = async (request, fastify) => {
    let venue = await getVenueByIds(request.body, request, fastify)
    for (let v of venue) {
        let index = global.tblVenues.findIndex((i) => i.id == v.id)
        if (index == -1) {
            global.tblVenues.push(v)
        }
        else {
            global.tblVenues[index] = v;
        }
    }
    return "Venue Updated successfully."
}
const setEntityComService = async (request , fastify) =>{
    let comDetails =global.tblCommentaries.find((c)=> c.commentaryId == request.body.commentaryId)
    if(!comDetails){
        throw new Error("Commentary with this id not found.")
    }
    let tpId = comDetails.tpId;
    if(!tpId){
        throw new Error("This commentary not associated with any tpId.")
    }
    // set batting and bowling team
    // if(comDetails.commentaryStatus == commentaryStatus.OPEN){
    //     // set toss first
    //     let firstInning = request.body.inning1.inning;
    //     let batTeamId = firstInning.batting_team_id;
    //     let bowlTeamId = firstInning.fielding_team_id;
    //     // get in comteam
    //     let batTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == batTeamId && ct.currentInnings == comDetails.currentInnings)
    //     let bowlTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == bowlTeamId && ct.currentInnings == comDetails.currentInnings)
    //     if(!batTeam || !bowlTeam){
    //         throw new Error("Batting or Bowling team not found in commentary teams.")
    //     }
    //     // set in comTeam update
    //     let comTeams = [
    //         {
    //             ...batTeam,
    //             teamStatus : 1,
    //             teamBattingOrder : 1,
    //             subInning : 1
    //         },
    //         {
    //             ...bowlTeam,
    //             teamStatus : 2,
    //             teamBattingOrder :2,
    //             subInning : 2
    //         }
    //     ]
    //     let upComData = {
    //         ...comDetails,
    //         commentaryStatus : commentaryStatus.INPROGRESS,
    //         tossWonBy : batTeam.teamId,
    //         choseTo : 1,
    //         tossRmk : `Toss won by ${batTeam.teamName} and chose to Bat.`,
    //     }
    //     let commentaryId = comDetails.commentaryId;
    //     let updatedData = await fastify.db.query(
    //         `CALL proc_commentary_toss(
    //         $1, $2, $3
    //             )`,
    //         {
    //             bind: [
    //                 comTeams ? JSON.stringify(comTeams) : null,
    //                 upComData ? JSON.stringify(upComData) : null,
    //                 commentaryId,
    //             ],
    //             type: fastify.db.QueryTypes.SELECT,
    //         }
    //     );
    //     updatedData = updatedData[0];
    //     if (upComData) {
    //         let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
    //         global.tblCommentaries[comI] = {
    //             ...global.tblCommentaries[comI],
    //             modifyDate: upComData.modifyDate,
    //             commentaryStatus: upComData.commentaryStatus,
    //             tossWonBy: upComData.tossWonBy,
    //             choseTo: upComData.choseTo,
    //             tossRmk: upComData.tossRmk,
    //         };
    //     }
    //     if(comTeams && comTeams.length > 0){
    //         for (let ct of comTeams){
    //             let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
    //             global.tblCommentaryTeams[comTI] = {
    //                 ...global.tblCommentaryTeams[comTI],
    //                 teamStatus: ct.teamStatus,
    //                 teamBattingOrder: ct.teamBattingOrder,
    //                 subInning: ct.subInning,
    //             };
    //         }
    //     }
    // }

    // let battingTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.teamStatus == 2 && ct.currentInnings == comDetails.currentInnings);
    // let bowlingTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.teamStatus == 1 && ct.currentInnings == comDetails.currentInnings);
    // if(!bowlingTeam || !battingTeam){
    //     throw new Error("Bowling or Batting team not found.")
    // }
    //total Inning
    let totalInning = request.body.totalInning;
    let result;    
    for (let i=1; i<= totalInning; i++){
        let inningData = request.body[`inning${i}`];
        if(!inningData){
            throw new Error(`Inning${i} data not found in request.`)
        }
        //get first inning data first inning team
        let firstSubInning = inningData.find((i) => i.inning.number == 1);
        if(!firstSubInning){
            throw new Error("First sub inning data not found.")
        }
        let matchInning = firstSubInning.inning;
        let batTeam = matchInning.batting_team_id;
        let bowlTeam = matchInning.fielding_team_id;
        let battingTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == batTeam && ct.currentInnings == i);
        let bowlingTeam = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == bowlTeam && ct.currentInnings == i);
        if(!bowlingTeam || !battingTeam){
            throw new Error("Bowling or Batting team not found.")
        }
        let comTeams = [
            {
                ...battingTeam,
                teamStatus : 1,
                teamBattingOrder : 1,
                subInning : 1,
                teamScore : matchInning.score,
                teamOver : matchInning.overs,
                teamWicket : matchInning.wickets,
            },
            {
                ...bowlingTeam,
                teamStatus : 2,
                teamBattingOrder :2,
                subInning : 2,
                teamScore : null,
                teamOver : null,
                teamWicket : null,
            }
        ]
        let playerTpIdObj = {};
        let comPlayers = global.tblCommentaryPlayers.filter((cp)=> cp.commentaryId == comDetails.commentaryId && cp.currentInnings == i)
        for (let cp of comPlayers){
            playerTpIdObj[cp.tpId] = {
                commentaryPlayerId : cp.commentaryPlayerId,
                playerName : cp.playerName,
                playerId : cp.playerId,
            };
        }
        // create partnership
        let tpPartnerships = firstSubInning.partnerships;
        
        let  overs =await buildOverData({
            entityData : firstSubInning.commentaries,
            commentaryDetails : comDetails,
            teams :{
                battingTeam : battingTeam,
                bowlingTeam : bowlingTeam
            },
            playerTpIdObj
           
        })
        let partnerships = await buildPartnershipData(
            {
                tpPartnerships,
                playerTpIdObj, 
                commentaryDetails :comDetails,
                teams :{
                    battingTeam : battingTeam,
                    bowlingTeam : bowlingTeam
                },
            })
        let commentaryPlayers = await buildComPlayers({
            playerTpIdObj ,
            tpPlayers : {
                batsmen :firstSubInning.batsmen,
                bowlers :firstSubInning.bowlers,
                fielder :firstSubInning.fielder
            },
            commentaryDetails : comDetails,
        })
        // return overs;
        // create fall of wicket
        // const tpWickets = firstSubInning.fows;
        // let wickets = await buildWicketData(
        //     {
        //         tpWickets,
        //         playerTpIdObj, 
        //         commentaryDetails :comDetails,
        //         teams :{
        //             battingTeam : battingTeam,
        //             bowlingTeam : bowlingTeam
        //         },
        //     })

        
        let dbStore = {
            commentaryTeams : comTeams,
            overs : overs,    
            partnerships
        }
        
        return dbStore;
        let ballByBall = await fastify.db.query(
            `CALL proc_ballbyball_entity(
            $1
                )`,
            {
                bind: [
                    dbStore ? JSON.stringify(dbStore) : null,
                    // comDetails.commentaryId,
                ],
                type: fastify.db.QueryTypes.SELECT,
            }
        );
        result = ballByBall;
        let teamData = inningData.teamData;
        for (let t of teamData){
            if(t.tpId == battingTeam.tpId){
            }
        }



        return "Commentary data updated successfully."
    }
    return result;

}
const setEntityCom2Service = async (request , fastify) =>{
    const {response} = request.body
    let comDetails =global.tblCommentaries.find((c)=> c.tpId == response?.match_id)
    if(!comDetails){
        throw new Error("Commentary with this tp id not found.")
    }
    if(comDetails.scoringType != 2){
        return true;
    }
    let tpId = comDetails.tpId;
    if(!tpId){
        throw new Error("This commentary not associated with any tpId.")
    }
    // check the status
    if(response.live.game_state == commentaryStatus.TOSSDONE){
        if(comDetails.commentaryStatus == commentaryStatus.OPEN){
        // set the toss
        const tossInfo = response.match_info.toss;

        // get in comteam
        let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
        let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
        if(!team1 || !team2){
            throw new Error("Batting or Bowling team not found in commentary teams.")
        }
        let comTeams;
        if(tossInfo.decision == 1){
            comTeams = [
                {
                    ...team1,
                    teamStatus : 1,
                    teamBattingOrder : 1,
                    subInning : 1
                },
                {
                    ...team2,
                    teamStatus : 2,
                    teamBattingOrder :2,
                    subInning : 2
                }
            ]
        }
        if(tossInfo.decision == 2){
            comTeams = [
                {
                    ...team1,
                    teamStatus : 2,
                    teamBattingOrder : 2,
                    subInning : 2
                },
                {
                    ...team2,
                    teamStatus : 1,
                    teamBattingOrder :1,
                    subInning : 1
                }
            ]
        }
        let upComData = {
            ...comDetails,
            commentaryStatus : commentaryStatus.TOSSDONE,
            tossWonBy : team1.teamId,
            choseTo : tossInfo.decision,
            tossRmk : `Toss won by ${team1.teamName} and chose to Bat.`,
        }
        let commentaryId = comDetails.commentaryId;
        // return {
        //     comTeams,
        //     upComData
        // }
            let updatedData = await fastify.db.query(
                `CALL proc_commentary_toss(
                $1, $2, $3
                    )`,
                {
                    bind: [
                        comTeams ? JSON.stringify(comTeams) : null,
                        upComData ? JSON.stringify(upComData) : null,
                        commentaryId,
                    ],
                    type: fastify.db.QueryTypes.SELECT,
                }
            );
            updatedData = updatedData[0];
            if (upComData) {
                let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
                global.tblCommentaries[comI] = {
                    ...global.tblCommentaries[comI],
                    modifyDate: upComData.modifyDate,
                    commentaryStatus: upComData.commentaryStatus,
                    tossWonBy: upComData.tossWonBy,
                    choseTo: upComData.choseTo,
                    tossRmk: upComData.tossRmk,
                };
            }
            if(comTeams && comTeams.length > 0){
                for (let ct of comTeams){
                    let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
                    global.tblCommentaryTeams[comTI] = {
                        ...global.tblCommentaryTeams[comTI],
                        teamStatus: ct.teamStatus,
                        teamBattingOrder: ct.teamBattingOrder,
                        subInning: ct.subInning,
                    };
                }
            }
        }
        return true;
    }
    // set the players
    if(response.live.game_state == EntityCommentaryStatus.INPROGRESS){
        if(comDetails.commentaryStatus == commentaryStatus.OPEN){
            // set the toss
            const tossInfo = response.match_info.toss;
            // get in comteam
            let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
            let team2 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.commentaryTeamId != team1.commentaryTeamId && ct.currentInnings == comDetails.currentInnings)
            if(!team1 || !team2){
                throw new Error("Batting or Bowling team not found in commentary teams.")
            }
            let comTeams;
            if(tossInfo.decision == 1){
                comTeams = [
                    {
                        ...team1,
                        teamStatus : 1,
                        teamBattingOrder : 1,
                        subInning : 1
                    },
                    {
                        ...team2,
                        teamStatus : 2,
                        teamBattingOrder :2,
                        subInning : 2
                    }
                ]
            }
            if(tossInfo.decision == 2){
                comTeams = [
                    {
                        ...team1,
                        teamStatus : 2,
                        teamBattingOrder : 2,
                        subInning : 2
                    },
                    {
                        ...team2,
                        teamStatus : 1,
                        teamBattingOrder :1,
                        subInning : 1
                    }
                ]
            }
            let upComData = {
                ...comDetails,
                commentaryStatus : commentaryStatus.TOSSDONE,
                tossWonBy : team1.teamId,
                choseTo : tossInfo.decision,
                tossRmk : `Toss won by ${team1.teamName} and chose to Bat.`,
            }
            let commentaryId = comDetails.commentaryId;
            let updatedData = await fastify.db.query(
                `CALL proc_commentary_toss(
                $1, $2, $3
                    )`,
                {
                    bind: [
                        comTeams ? JSON.stringify(comTeams) : null,
                        upComData ? JSON.stringify(upComData) : null,
                        commentaryId,
                    ],
                    type: fastify.db.QueryTypes.SELECT,
                }
            );
            updatedData = updatedData[0];
            if (upComData) {
                let comI = global.tblCommentaries.findIndex((c)=> c.commentaryId == upComData.commentaryId)
                global.tblCommentaries[comI] = {
                    ...global.tblCommentaries[comI],
                    modifyDate: upComData.modifyDate,
                    commentaryStatus: upComData.commentaryStatus,
                    tossWonBy: upComData.tossWonBy,
                    choseTo: upComData.choseTo,
                    tossRmk: upComData.tossRmk,
                };
            }
            if(comTeams && comTeams.length > 0){
                for (let ct of comTeams){
                    let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
                    global.tblCommentaryTeams[comTI] = {
                        ...global.tblCommentaryTeams[comTI],
                        teamStatus: ct.teamStatus,
                        teamBattingOrder: ct.teamBattingOrder,
                        subInning: ct.subInning,
                    };
                }
            }
        }
        comDetails = global.tblCommentaries.find((i) => i.commentaryId == comDetails.commentaryId)
        if(comDetails.commentaryStatus == commentaryStatus.TOSSDONE){
            // set player
            let batTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings 
            && i.tpId == response.live.live_inning.batting_team_id)
            if(!batTeam){
                throw new Error("Bat Team not found")
            }
            // set players
            let playerTpIdObj = {};
            let comPlayers = global.tblCommentaryPlayers.filter((cp)=> cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)
            for (let cp of comPlayers){
                playerTpIdObj[cp.tpId] = {
                    ...cp,
                    playerName : cp.playerName,
                    playerId : cp.playerId,
                };
            }
            let tpBatsMan = response.live.batsmen;
            let tpBowler = response.live.bowlers;
            let bowler;
            let strikePlayer;
            let nonStrikePlayer;
            let comPlayerUpdate = []
            for (let p of tpBatsMan){
                let comP = playerTpIdObj[p.batsman_id]
                let batter = response.scorecard.innings.find((i) => i.number == response.live.live_inning_number).batsmen
                .find((i1) => i1.batsman_id == p.batsman_id)
                let onStrike = batter.position == "striker" ? true : false
                let batterOrder;
                if(onStrike){
                    strikePlayer = comP;
                    batterOrder = 1
                }
                else {
                    nonStrikePlayer = comP;
                    batterOrder = 2
                }
                comPlayerUpdate.push({
                    ...comP,
                    isPlay : true,
                    isBatterOut : false,
                    onStrike,
                    batRun : p.runs,
                    // batBall : p.balls_faced,
                    // batDotBall,
                    // batFour : p.fours,
                    // batSix : p.sixes,
                    // battingOrder
                    batterOrder 
                })
            }
            for (let b of tpBowler){
                let comP = playerTpIdObj[b.bowler_id]
                bowler = comP;

                comPlayerUpdate.push({
                    ...comP,
                    isPlay : true,
                    // bowlerRun : b.runs_conceded,
                    // bowlerTotalBall,
                    // bowlerOver : b.overs,
                    bowlerOrder : 1
                    // bowlerDotBall,
                    // bowlerFour,
                    // bowlerSix
                })
            }
            // create partnership
            let part = response.live.live_inning.current_partnership;
            let batters = part.batsmen.map((i)=>i.batsman_id)
            let [b1, b2] = batters;
            let partExist = global.tblCommentaryPartnership.find((i)=>
                i.commentaryId == comDetails.commentaryId &&
                i.currentInnings == comDetails.currentInnings &&
                (
                    (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
                    (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId) // order doesn’t matter
                )
            );
            let partnership = {}
            if(partExist){
                let comPlayerId1 = global.tblCommentaryPlayers.find((i)=> i.commentaryPlayerId == partExist.batter1Id)
                let comPlayerId2 = global.tblCommentaryPlayers.find((i)=> i.commentaryPlayerId == partExist.batter2Id)
                let cp1 = part.batsmen.find((i)=> i.batsman_id == comPlayerId1.tpId)
                let cp2 = part.batsmen.find((i)=> i.batsman_id == comPlayerId2.tpId)
                partnership = {
                    ...partExist,
                    totalRuns : part.runs,
                    totalBalls : part.balls,
                    batter1Runs : cp1.runs,
                    batter2Runs :cp2.runs,
                    batter1Balls : cp1.balls,
                    batter2Balls : cp2.balls
                    // totalFour,
                    // totalSix
                }
            }
            else {
                let cp1 = playerTpIdObj[part.batsmen[0].batsman_id]
                let cp2 = playerTpIdObj[part.batsmen[1].batsman_id]
                partnership = genEtPartnership({
                    currentPartnership :{
                        batter1Id : cp1.commentaryPlayerId,
                        batter1Name : cp1.playerName,
                        batter2Id : cp2.commentaryPlayerId,
                        batter2Name : cp2.playerName,
                        totalRuns : part.runs,
                        totalBalls : part.balls,
                        // totalSix ,
                        // totalFour,
                        batter1Runs : part.batsmen[0].runs,
                        batter2Runs :  part.batsmen[1].runs,
                        batter1Balls : part.batsmen[0].balls,
                        batter2Balls :part.batsmen[1].balls,
                        order : response.live.live_inning.equations.wickets + 1,
                        isActive : true
                    },
                    commentaryDetails : comDetails,
                    updateBattingTeam : batTeam
                })
            }    
            // generate over
            const battingTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId 
            && i.currentInnings == comDetails.currentInnings && i.teamStatus ==1)
            const bowlingTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId 
            && i.currentInnings == comDetails.currentInnings && i.teamStatus ==2)
             // create over
            const commentaryOvers = {
                overId: 0,
                commentaryId: comDetails?.commentaryId,
                teamId: battingTeam.teamId,
                over: 0,
                ballCount: 0,
                bowlerId: bowler?.commentaryPlayerId,
                totalRun: 0,
                totalFour: 0,
                totalSix: 0,
                totalWideBall: 0,
                totalWideRun: 0,
                totalNoball: 0,
                totalNoBallRun: 0,
                totalByesRun: 0,
                totalLegByesRun: 0,
                totalPanelty: 0,
                totalWicket: 0,
                dotBall: 0,
                isComplete: false,
                powerplay: false,
                isOverInPowerplay: false,
                powerplayType: 1,
                isMaiden: false,
                isDelete: false,
                currentInnings: comDetails.currentInnings,
                teamScore: 0,
                powerPlayName: null,
                isPowerPlay: false,
            };
            let over = await virtualOverQuery(commentaryOvers, request, fastify);
            // add over to global variable
            global.tblOvers.push(over);
            const commentaryBallByBall = {
                commentaryBallByBallId: 0,
                commentaryId: comDetails?.commentaryId,
                teamId: battingTeam.teamId,
                overId: over?.overId,
                overCount: 0,
                currentOverBalls: 0,
                bowlerId: bowler?.commentaryPlayerId,
                batStrikeId: strikePlayer.commentaryPlayerId,
                batNonStrikeId: nonStrikePlayer.commentaryPlayerId,
                ballIsCount: true,
                ballType: 0,
                ballIsDot: false,
                ballRun: 0,
                ballExtraRun: 0,
                ballIsBoundry: false,
                ballFour: 0,
                ballSix: 0,
                ballIsWicket: false,
                ballWicketType: 0,
                ballPlayerId: 0,
                ballBowlerId: 0,
                ballFielderId1: 0,
                devOver: null,
                devCurrentOverBall: null,
                ballFielderId2: 0,
                overIsMaiden: false,
                nextBatStrikeId:  strikePlayer.commentaryPlayerId,
                nextBatNonStrikeId: nonStrikePlayer.commentaryPlayerId,
                currentInnings: comDetails.currentInnings
            };
            const ball = await virtualBallByBallQuery(
                commentaryBallByBall,
                request,
                fastify
            );
            // add ball to global variable
            global.tblCommentaryBallByBall.push(ball);
            let result1 =  {
                over,
                ball,
                partnership,
                comPlayerUpdate
            }
            let upCom = {
              ...comDetails,
              commentaryStatus: commentaryStatus.INPROGRESS,
              displayStatus:  response.live.status_note
            }
            let res = await syncEntitySportCommentaryService({
                commentaryId : comDetails.commentaryId,
                commentaryDetails : upCom,
                commentaryPlayers : comPlayerUpdate,
                commentaryPartnership: [partnership]
            },fastify)
            // return res;
            // handle commentaries arr
            // if(response.live.commentaries.length > 0){
            //     let result2 = await handleComArr(request.body , request,fastify , comDetails)
            //     return {result2,result1};
            // }
        }   
        comDetails = global.tblCommentaries.find((i) => i.commentaryId == comDetails.commentaryId)
        if(comDetails.commentaryStatus == commentaryStatus.INPROGRESS || comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
          let res =await handleComArr(request.body, request,fastify,comDetails)
          return res;
        }
    }

    if(response.live.game_state == EntityCommentaryStatus.INNINGCHANGE){
      if(comDetails.commentaryStatus != commentaryStatus.INNINGCHANGE){
        await onInningChangeService(request.body, fastify, comDetails);

      }
      else {
        return true;
      }
    }
    if(response.live.game_state == EntityCommentaryStatus.DEFAULT && comDetails.commentaryStatus != commentaryStatus.COMPLETED){
      await matchCompleteService(request.body , fastify , comDetails)
    }
    
    return true;

}
const handleComArr = async (data , request , fastify , comDetails) =>{
    const {response} = data;
    const commentaries = response.live.commentaries;
    const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
    i.currentInnings == comDetails.currentInnings)  
    let battingTeam = teams.find((i) => i.teamStatus ==1)
    let bowlingTeam = teams.find((i)=> i.teamStatus == 2)
    let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
    let part = response.live.live_inning.current_partnership;
    let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
    let isChangeStrike = false;
    // let onStrikePlayer = global.tblCommentaryPlayers.find(
    //     (item) =>
    //     item.commentaryId == comDetails.commentaryId &&
    //     item.isPlay == true &&
    //     item.onStrike == true &&
    //     item.currentInnings == comDetails.currentInnings &&
    //     item.teamId == battingTeam.teamId
    // );
    // let nonStrikePlayer = global.tblCommentaryPlayers.find(
    //     (item) =>
    //     item.commentaryId == comDetails.commentaryId &&
    //     item.isPlay == true &&
    //     item.onStrike == false &&
    //     item.currentInnings == comDetails.currentInnings &&
    //     item.teamId == battingTeam.teamId
    // );
    // store ballbyball
    let playerTpIdObj = {};
    let comPlayers = global.tblCommentaryPlayers.filter((cp)=> cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)

    for (let cp of comPlayers){
        playerTpIdObj[cp.tpId] = {
            ...cp,
            playerName : cp.playerName,
            playerId : cp.playerId,
        };
    }
    let partnership = {}
    if(batters.length > 0){
      let [b1, b2] = batters;
      let partExist = global.tblCommentaryPartnership.find((i)=>
          i.commentaryId == comDetails.commentaryId &&
          i.currentInnings == comDetails.currentInnings &&
          (
              (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
              (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId) // order doesn’t matter
          )
      );
      if(partExist){
          let comPlayerId1 = global.tblCommentaryPlayers.find((i)=> i.commentaryPlayerId == partExist.batter1Id)
          let comPlayerId2 = global.tblCommentaryPlayers.find((i)=> i.commentaryPlayerId == partExist.batter2Id)
          let cp1 = part.batsmen.find((i)=> i.batsman_id == comPlayerId1.tpId)
          let cp2 = part.batsmen.find((i)=> i.batsman_id == comPlayerId2.tpId)
          partnership = {
              ...partExist,
              totalRuns : part.runs,
              totalBalls : part.balls,
              batter1Runs : cp1.runs,
              batter2Runs :cp2.runs,
              batter1Balls : cp1.balls,
              batter2Balls : cp2.balls
              // totalFour,
              // totalSix
          }
          let par = await updateVirtualPartnershipQuery(partnership,fastify, null)
          //update partnersip in db
          let pI = global.tblCommentaryPartnership.findIndex((i)=> i.commentaryPartnershipId == partnership.commentaryPartnershipId)
          global.tblCommentaryPartnership[pI] =par[0]; 
      }
      else {
          let cp1 = playerTpIdObj[part.batsmen[0].batsman_id]
          let cp2 = playerTpIdObj[part.batsmen[1].batsman_id]
          partnership = genEtPartnership({
              currentPartnership :{
                  batter1Id : cp1.commentaryPlayerId,
                  batter1Name : cp1.playerName,
                  batter2Id : cp2.commentaryPlayerId,
                  batter2Name : cp2.playerName,
                  totalRuns : part.runs,
                  totalBalls : part.balls,
                  // totalSix ,
                  // totalFour,
                  batter1Runs : part.batsmen[0].runs,
                  batter2Runs :  part.batsmen[1].runs,
                  batter1Balls : part.batsmen[0].balls,
                  batter2Balls :part.batsmen[1].balls,
                  order : response.live.live_inning.equations.wickets + 1,
                  isActive : true
              },
              commentaryDetails : comDetails,
              updateBattingTeam : battingTeam
          })
          partnership = await virtualPartnershipQuery(
              partnership,
              request,
              fastify
          );
          global.tblCommentaryPartnership.push(partnership);
      }
    }
    
    let ballbyball = [];
    let upPlayers =[];
    let upOvers = [];
    let upTeams = [];
    const playersMap = {}; // key: commentaryPlayerId

    let boIncrease = false;
    let ltSetOrder = 0;
    if(response.live.batsmen){
      for(let p of response.live?.batsmen){
        let comP = playerTpIdObj[p.batsman_id]
        if(comP){
          let batterOrder = comP.batterOrder;
          if(comP.batterOrder == undefined || comP.batterOrder == null ){
              // get latest batter order 
              if(ltSetOrder != 0){
                batterOrder =ltSetOrder + 1
              }
              else {
                 let bO = global.tblCommentaryPlayers.filter((i)=> i.commentaryId == comDetails.commentaryId &&
                  i.currentInnings == comDetails.currentInnings &&
                  i.teamId == battingTeam.teamId &&
                  i.batterOrder != null
                )
                .sort((a,b)=> b.batterOrder - a.batterOrder)[0]?.batterOrder || 0
                batterOrder = bO + 1
                ltSetOrder = batterOrder
              }
          }
          playersMap[p.batsman_id] = {
              ...comP,
              isPlay : true,
              batRun : p.runs,
              batBall : p.balls_faced,
              // batDotBall,
              batFour : p.fours,
              batSix : p.sixes,
              batterOrder,
          }
        }
      }
    }
    if(response.live?.bowlers){
      for (let b of response.live?.bowlers){
        let comP = playerTpIdObj[b.bowler_id] 
        if(comP){
          let bowlerOrder = comP.bowlerOrder;
          if(comP.bowlerOrder == undefined || comP.bowlerOrder == null ){
              // get latest bowler order
              let bO = global.tblCommentaryPlayers.filter((i)=> i.commentaryId == comDetails.commentaryId &&
                  i.currentInnings == comDetails.currentInnings &&
                  i.teamId == bowlingTeam.teamId &&
                  i.bowlerOrder != null
              ).sort((a,b)=> b.bowlerOrder - a.bowlerOrder)[0]?.bowlerOrder || 0
              bowlerOrder = bO + 1
          }
          playersMap[b.bowler_id] = {
              ...comP,
              bowlerRun : b.runs_conceded,
              bowlerOver : b.overs,  
              // bowlerTotalBall,
              isPlay : true,
              onStrike : null,
              bowlerOrder
              // bowlerDotBall,
              // bowlerFour,
              // bowlerSix
          }
        }
      }
    }
  
   
    const oversMap = {}; // key: `${teamId}_${overNumber}`
    const ballByBall = [];
    const batsmanDotMap = {}; // key: batsman_id, value: dot balls
    const bowlerDotMap = {};  // key: bowler_id, value: dot balls
    const wickets = []; // optional: cache to avoid re-checking db

    let upComDetails;
    upComDetails = {
      rmk : response.live.status_note
    }
    if(commentaries.length > 0){
      if(comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
        upComDetails.commentaryStatus = commentaryStatus.INPROGRESS
      }
      for (let c of commentaries){
        let updateBall = {}
        let ball = 1;
        let tpId = c.event_id;
        let event = c.event;
        if(String(c.score) == "w" ){
          event = "wicket"
        }
        if(event == "ball"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id)
          if(index != -1) continue; // skip already processed ball
          const overNumber = Number(c.over);
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
          let run = c.run || 0;
          let isBoundary = c.run == 4 || c.run ==6 ? true : false
          let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          let bowlerPId = playerTpIdObj[c.bowler_id]?.commentaryPlayerId
          let nonStrike = response.live.batsmen.find((i)=> i.batsman_id != c.batsman_id).batsman_id
          let nonStrikePId = playerTpIdObj[nonStrike]?.commentaryPlayerId;
          if(index == -1){
            let isWide = false;
            if(!playersMap[c.batsman_id]){
              playersMap[c.batsman_id] = {
                ...playerTpIdObj[c.batsman_id],
              }
            }
            if(!playersMap[c.bowler_id]){
              playersMap[c.bowler_id] = {
                ...playerTpIdObj[c.bowler_id],
              }
            }

            if (c.score && String(c.score).includes('wd')) {
              // it's a wide ball
              isWide = true;
              const runToUpdate = +matchType.valueOfWideBall || 0;
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if(!over){
                  // generate new over
                  let newOver = generateOverEt({
                          commentaryDetails :comDetails,
                          teams: {
                              battingTeam: battingTeam,
                              bowlingTeam,
                          },
                          bowler: playerTpIdObj[c.bowler_id],
                          overNumber : c.over,
                  })
                  over = await virtualOverQuery(newOver, request, fastify);
                  // add over to global variable
                  global.tblOvers.push(over);
                  const commentaryBallByBall = {
                      commentaryBallByBallId: 0,
                      commentaryId: comDetails?.commentaryId,
                      teamId: battingTeam.teamId,
                      overId: over?.overId,
                      overCount: `${c.over}.0`,
                      currentOverBalls: 0,
                      bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                      batNonStrikeId: nonStrike.commentaryPlayerId,
                      ballIsCount: true,
                      ballType: 0,
                      ballIsDot: false,
                      ballRun: 0,
                      ballExtraRun: 0,
                      ballIsBoundry: false,
                      ballFour: 0,
                      ballSix: 0,
                      ballIsWicket: false,
                      ballWicketType: 0,
                      ballPlayerId: 0,
                      ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                      ballFielderId1: 0,
                      devOver: null,
                      devCurrentOverBall: null,
                      ballFielderId2: 0,
                      overIsMaiden: false,
                      nextBatStrikeId: strikePId,
                      nextBatNonStrikeId: nonStrikePId,
                      currentInnings: comDetails.currentInnings,
                      commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                      teamScore: battingTeam?.teamScore || 0,
                      teamWicket: battingTeam?.teamWicket || 0,
                      // tpId : c.event_id
                  };
                  const oball = await virtualBallByBallQuery(
                      commentaryBallByBall,
                      request,
                      fastify
                  );
                  // add ball to global variable
                  global.tblCommentaryBallByBall.push(oball);
                  ballbyball.push(oball)
                }
                oversMap[overKey] = over; // store reference
              }
              updateBall = {
                ballIsCount : false,
                ballType : BALL_TYPE.WIDE,
                ballRun : 0,
                batStrikeId : playerTpIdObj[c.batsman_id].commentaryPlayerId,
                batNonStrikeId : nonStrikePId,
                teamId : battingTeam.teamId,
                overId : over.overId,
                nextBatStrikeId : strikePId,
                nextBatNonStrikeId : nonStrikePId,
                ballExtraRun : runToUpdate,
                tpId : c.event_id
              }
              battingTeam["teamScore"] = (battingTeam.teamScore || 0) + runToUpdate;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.teamWideRuns = (battingTeam.teamWideRuns || 0) + runToUpdate;       
              over.ballCount += 1;
              over.totalRun += c.run;
              over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              over.totalWideBall += 1;
              over.totalWideRun += runToUpdate;
              updateBall.overCount = battingTeam.teamOver;
              updateBall.currentOverBalls = over.ballCount;
              if(!playersMap[c.bowler_id]){
                playersMap[c.bowler_id] = {
                  ...playerTpIdObj[c.bowler_id],
                }
              }
              playersMap[c.bowler_id].bowlerWideBall = (playersMap[c.bowler_id].bowlerWideBall || 0) + 1;
              playersMap[c.bowler_id].bowlerWideBallRun = (playersMap[c.bowler_id].bowlerWideBallRun || 0) + runToUpdate;
              playersMap[c.bowler_id].bowlerRun = (playersMap[c.bowler_id].bowlerRun || 0) + runToUpdate;
              updateBall.bowlerId = playersMap[c.bowler_id].commentaryPlayerId;
              playersMap[c.bowler_id].bowlerTotalBall =  (playersMap[c.bowler_id]?.bowlerTotalBall || 0) + 1;

            }
            else {
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if(!over){
                    // generate new over
                    let newOver = generateOverEt({
                            commentaryDetails :comDetails,
                            teams: {
                                battingTeam: battingTeam,
                                bowlingTeam,
                            },
                            bowler: playerTpIdObj[c.bowler_id],
                            overNumber : c.over,
                    })
                    over = await virtualOverQuery(newOver, request, fastify);
                    // add over to global variable
                    global.tblOvers.push(over);
                    const commentaryBallByBall = {
                        commentaryBallByBallId: 0,
                        commentaryId: comDetails?.commentaryId,
                        teamId: battingTeam.teamId,
                        overId: over?.overId,
                        overCount: `${c.over}.0`,
                        currentOverBalls: 0,
                        bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                        batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                        batNonStrikeId: nonStrike.commentaryPlayerId,
                        ballIsCount: true,
                        ballType: 0,
                        ballIsDot: false,
                        ballRun: 0,
                        ballExtraRun: 0,
                        ballIsBoundry: false,
                        ballFour: 0,
                        ballSix: 0,
                        ballIsWicket: false,
                        ballWicketType: 0,
                        ballPlayerId: 0,
                        ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                        ballFielderId1: 0,
                        devOver: null,
                        devCurrentOverBall: null,
                        ballFielderId2: 0,
                        overIsMaiden: false,
                        nextBatStrikeId: strikePId,
                        nextBatNonStrikeId: nonStrikePId,
                        currentInnings: comDetails.currentInnings,
                        commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                        teamScore: battingTeam?.teamScore || 0,
                        teamWicket: battingTeam?.teamWicket || 0,
                        tpId : null
                    };
                    const oball = await virtualBallByBallQuery(
                        commentaryBallByBall,
                        request,
                        fastify
                    );
                    // add ball to global variable
                    global.tblCommentaryBallByBall.push(oball);
                    ballbyball.push(oball)

                }
                oversMap[overKey] = over; // store reference
              }
              updateBall = {
                  ballIsCount : true,
                  ballType : BALL_TYPE.REGULAR,
                  ballRun : c.run,
                  batStrikeId : playerTpIdObj[c.batsman_id].commentaryPlayerId,
                  batNonStrikeId : nonStrikePId,
                  teamId : battingTeam.teamId,
                  overId : over.overId,
                  nextBatStrikeId : strikePId,
                  nextBatNonStrikeId : nonStrikePId,
                  tpId : c.event_id
                  // autoStrikeBallCount
              }
              battingTeam["teamScore"] = (battingTeam.teamScore || 0) + run;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.teamLegByRuns =( battingTeam.teamLegByRuns || 0) + parseInt(c.legbye_run)
              battingTeam.teamNoBallRuns =( battingTeam.teamNoBallRuns || 0) + parseInt(c.noball_run)
              battingTeam.teamByRuns =( battingTeam.teamByRuns || 0) + parseInt(c.bye_run)

              over.ballCount += 1;
              over.totalRun += c.run;
              over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              updateBall.overCount = battingTeam.teamOver;
              updateBall.currentOverBalls = over.ballCount;
              updateBall.bowlerId = playerTpIdObj[c.bowler_id].commentaryPlayerId;
              playersMap[c.bowler_id].bowlerTotalBall =  (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
            }
            if (run === 0) { 
              updateBall.ballIsDot = true;
              over.dotBall = over.dotBall + ball;
              playersMap[c.batsman_id].batDotBall = (playersMap[c.batsman_id].batDotBall || 0) + 1
              playersMap[c.bowler_id].bowlerDotBall = (playersMap[c.bowler_id].bowlerDotBall || 0) + 1
            }
            else if(isBoundary){
                if(c.run == 4){
                  updateBall.ballIsBoundry = true;
                  updateBall.ballFour = 1;
                  // strikerPly.batFour = strikerPly.batFour + 1;
                  // bowler.bowlerFour = bowler.bowlerFour + 1;
                  playersMap[c.bowler_id].bowlerFour = (playersMap[c.bowler_id].bowlerFour || 0) + 1
                  // partnership.totalFour = partnership.totalFour + 1;
                }
                if(c.run == 6){
                    updateBall.ballIsBoundry = true;
                    updateBall.ballSix = 1;
                    // strikerPly.batSix = strikerPly.batSix + 1;
                    // bowler.bowlerSix = bowler.bowlerSix + 1;
                    over.totalSix = over.totalSix + 1;
                    // partnership.totalSix = partnership.totalSix + 1
                    playersMap[c.bowler_id].bowlerSix = (playersMap[c.bowler_id].bowlerSix || 0) + 1
                }
            }
            else if(c.run % 2 != 0){
                isChangeStrike = true;
                updateBall.nextBatStrikeId = nonStrikePId;
                updateBall.nextBatNonStrikeId = strikePId;
            }
            const ballByBallUp = generateBallET(
                {
                    updateBall,
                    commentaryBallByBallId: 0,
                    updateBattingTeam : battingTeam,
                    updateOver : over,
                    updateBatter : playerTpIdObj[c.batsman_id],
                    updateBowler : playerTpIdObj[c.bowler_id],
                    nonStrikeBatter : null,
                    updatePartnership : partnership,
                    commentaryDetails:comDetails,
                },
                request
            );
            ballbyball.push(ballByBallUp)
            // upOver = over;
            // update partnership
            // const newPart = genEtPartnership(
            //     {
            //         updateBattingTeam : battingTeam,
            //         currentPartnership: partnership,
            //         commentaryDetails : comDetails,
            //     },
            //     request
            // );
            // db call
          } 
        }
        if(event =="overend"){
          const overEndNumber = c.over - 1;

          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overEndNumber}`;
          let over = oversMap[overKey];
          if(over){
            const gOver = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if(gOver && gOver.isComplete) {
              delete oversMap[overKey];
              continue; // already marked complete
            }
            // mark over as
            //  complete
            over.isComplete = true;
            over.isMaiden = getBowlerOnlyRuns(over) < 1;
            over.teamScore = c.score;
          }
          else {
            const overET = global.tblOvers.find(i =>
              i.commentaryId === comDetails.commentaryId &&
              i.currentInnings === comDetails.currentInnings &&
              i.teamId === battingTeam.teamId &&
              i.over === overEndNumber
            );
            if (overET) {
              if(overET.isComplete) {
                delete oversMap[overKey];
                continue; // already marked complete
              }
              overET.isComplete = true;
              overET.isMaiden = getBowlerOnlyRuns(overET) < 1;
              overET.teamScore = c.score;
              oversMap[overKey] = overET; // store reference
            }
          }
          for(let p of c.bats){
            if(playersMap[p.batsman_id]){
              playersMap[p.batsman_id].runs = p.runs;
              playersMap[p.batsman_id].batBall = p.balls_faced;
              playersMap[p.batsman_id].batFour = p.fours;
              playersMap[p.batsman_id].batSix = p.sixes;
            }
            else {
              playersMap[p.batsman_id] = {
                ...playerTpIdObj[p.batsman_id],
                runs : p.runs,
                batBall : p.balls_faced,
                batFour : p.fours,
                batSix : p.sixes,
                isPlay : true
              }
            }
          }
          for(let p of c.bowls){
            if(playersMap[p.bowler_id]){
              playersMap[p.bowler_id].bowlerOver = p.overs;
              playersMap[p.bowler_id].bowlerRun = p.runs_conceded;
            }
            else {
              playersMap[p.bowler_id] = {
                ...playerTpIdObj[p.bowler_id],
                bowlerOver : p.overs,
                bowlerRun : p.runs_conceded,
                isPlay : true
              }
            }
          }
        }
        if(event == "wicket"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id)
          if(index != -1) continue;
          const overNumber = Number(c.over);
          if(!playersMap[c.batsman_id]){
            playersMap[c.batsman_id] = {
              ...playerTpIdObj[c.batsman_id],
            }
          }
          if(!playersMap[c.bowler_id]){
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
            }
          }
          const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
          let over = oversMap[overKey];
           let strikePId = playerTpIdObj[c.batsman_id]?.commentaryPlayerId
          let bowlerPId = playerTpIdObj[c.bowler_id]?.commentaryPlayerId
          let nonStrike = response.live.batsmen.find((i)=> i.batsman_id != c.batsman_id).batsman_id
          let nonStrikePId = playerTpIdObj[nonStrike]?.commentaryPlayerId;
          if(playersMap[c.bowler_id]){
            playersMap[c.bowler_id].bowlerOver = ((playersMap[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1) 
            playersMap[c.bowler_id].bowlerTotalWicket = (playersMap[c.bowler_id].bowlerTotalWicket || 0) + 1
            playersMap[c.bowler_id].bowlerTotalBall = (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
          }
          else {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
              bowlerOver :((playerTpIdObj[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1),
              isPlay : true,
              bowlerTotalWicket : playerTpIdObj[c.bowler_id].bowlerTotalWicket ? playerTpIdObj[c.bowler_id].bowlerTotalWicket + 1 : 1,
              bowlerTotalBall : playerTpIdObj[c.bowler_id].bowlerTotalBall ? playerTpIdObj[c.bowler_id].bowlerTotalBall + 1 : 1,  
            }
          }
          let wicketData = {
            wicketType: wicketTypeObj.BOLD,
            batterId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            batterName : playerTpIdObj[c.batsman_id]?.playerName,
            runs: 0,
            fieldPlayerId : playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fieldPlayerName : playerTpIdObj[c.bowler_id]?.playerName,
            fielder1: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fielder2: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerName : playerTpIdObj[c.bowler_id]?.playerName,
          };
          battingTeam.teamOver = `${c.over}.${c.ball}`;
          battingTeam.teamWicket = (battingTeam.teamWicket || 0) + 1;
          if(!over) {
            over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
              && i.over == c.over
              && i.teamId == battingTeam.teamId);
            if(!over){
                // generate new over
                let newOver = generateOverEt({
                        commentaryDetails :comDetails,
                        teams: {
                            battingTeam: battingTeam,
                            bowlingTeam,
                        },
                        bowler: playerTpIdObj[c.bowler_id],
                        overNumber : c.over,
                })
                over = await virtualOverQuery(newOver, request, fastify);
                // add over to global variable
                global.tblOvers.push(over);
                const commentaryBallByBall = {
                    commentaryBallByBallId: 0,
                    commentaryId: comDetails?.commentaryId,
                    teamId: battingTeam.teamId,
                    overId: over?.overId,
                    overCount: `${c.over}.0`,
                    currentOverBalls: 0,
                    bowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                    batStrikeId: playerTpIdObj[c.batsman_id].commentaryPlayerId,
                    batNonStrikeId: nonStrikePId,
                    ballIsCount: true,
                    ballType: 0,
                    ballIsDot: false,
                    ballRun: 0,
                    ballExtraRun: 0,
                    ballIsBoundry: false,
                    ballFour: 0,
                    ballSix: 0,
                    ballIsWicket: false,
                    ballWicketType: 0,
                    ballPlayerId: 0,
                    ballBowlerId: playerTpIdObj[c.bowler_id].commentaryPlayerId,
                    ballFielderId1: 0,
                    devOver: null,
                    devCurrentOverBall: null,
                    ballFielderId2: 0,
                    overIsMaiden: false,
                    nextBatStrikeId: strikePId,
                    nextBatNonStrikeId: nonStrikePId,
                    currentInnings: comDetails.currentInnings,
                    commentaryPartnershipId: partnership.commentaryPartnershipId || 0,
                    teamScore: battingTeam?.teamScore || 0,
                    teamWicket: battingTeam?.teamWicket || 0,
                    // tpId : c.event_id
                };
                const oball = await virtualBallByBallQuery(
                    commentaryBallByBall,
                    request,
                    fastify
                );
                // add ball to global variable
                global.tblCommentaryBallByBall.push(oball);
            }
            oversMap[overKey] = over; // store reference
          }
          over.totalWicket = (over.totalWicket || 0) + 1;
          over.ballCount += 1;
          over.dotBall += 1;
          over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          if(playersMap[c.batsman_id]){
            playersMap[c.batsman_id] = {
              ...playersMap[c.batsman_id],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicketData.wicketType,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fielder1,
              fielderId2: wicketData.fielder2,
              isPlay: null,
              onStrike: null,
              batBall: (playersMap[c.batsman]?.batBall || 0) + 1,
              batDotBall: (playersMap[c.batsman] || 0) + 1,
            }
          }
          else {
            playersMap[c.batsman_id] = {
              ...playerTpIdObj[c.batsman_id],
              isBatterOut: true,
              isBatterRetir: false,
              wicketType: wicketData.wicketType,
              bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
              fielderId1: wicketData.fielder1,
              fielderId2: wicketData.fielder2,
              isPlay: null,
              onStrike: null,
              batBall: 1,
              batDotBall: 1,
            }
          }
          let updateBall = {
            ballIsWicket: true,
            ballWicketType: wicketTypeObj.BOLD,
            ballFielderId1: wicketData.fielder1,
            ballFielderId2: wicketData.fielder2,
            batStrikeId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            // batNonStrikeId: ,
            ballPlayerId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            ballIsCount: true,
            ballType: BALL_TYPE.REGULAR,
            ballRun: wicketData.runs,
            ballIsDot: true,
            tpId : c.event_id,
            currentOverBalls : c.ball,
          };
          const ballByBallUp = generateBallET(
            {
                updateBall,
                commentaryBallByBallId: 0,
                updateBattingTeam : battingTeam,
                updateOver : over,
                updateBatter : playersMap[c.batsman_id],
                updateBowler : playersMap[c.bowler_id],
                nonStrikeBatter : null,
                updatePartnership : partnership,
                commentaryDetails:comDetails,
                tpId : c.event_id
            },
            request
          );
          const oball = await virtualBallByBallQuery(
              ballByBallUp,
              request,
              fastify
          );
          // add ball to global variable
          global.tblCommentaryBallByBall.push(oball)
          ballbyball.push(oball)
          const generateWicket1 = generateWicket({
            commentaryDetails : comDetails,
            currentWicket: wicketData,
            currentOver: over,
            battingTeam: battingTeam,
            currentBall: oball,
          });
          wickets.push(generateWicket1);
        }
        upTeams = [battingTeam, bowlingTeam]
        upComDetails.displayStatus = c.commentary;
      }
    }
   
    // console.log(oversMap)
    let plyArr = Object.values(playersMap);
    let overArr = Object.values(oversMap)
   

    await syncEntitySportCommentaryService({
      commentaryId : comDetails.commentaryId,
      commentaryDetails : {
        ...comDetails,
        ...upComDetails
      },
      commentaryPlayers : plyArr,
      // commentaryPartnership: partnership,
      commentaryBallByBall : ballbyball,
      commentaryOvers : overArr,
      commentaryTeams : upTeams,
      commentaryWicket : wickets
    },fastify,request)


    return {
      comWickets : wickets,
      ballbyball,
      upOver :  Object.values(oversMap),
      upPlayers : Object.values(playersMap),
      upComDetails,
      upTeams,
    } 
    
    return res;
}
const generateOverServiceET = async (data, request, fastify) => {
  const { commentaryDetails, commentaryId, overdetails, matchType } = data;
  const teams = global.tblCommentaryTeams.filter(
    (item) =>
      item?.commentaryId === commentaryId &&
      item.currentInnings == commentaryDetails.currentInnings
  );
  let battingTeam = teams.find((item) => item.teamStatus == 1);
  let bowlingTeam = teams.find((item) => item.teamStatus == 2);
  let currentBowler = global.tblCommentaryPlayers.find(
    (item) =>
      item.commentaryId == commentaryId &&
      item.isPlay == true &&
      item.teamId == bowlingTeam.teamId
  );
  let updateTeam = {
    ...battingTeam,
    teamOver: Math.ceil(+battingTeam.teamOver || 0),
  };
  let updateBowler = {
    ...currentBowler,
    isPlay: null,
    bowlerOver: Math.ceil(currentBowler.bowlerOver || 0),
    bowlerMaidenOver: overdetails.totalRun < 1 ? 1 : 0,
  };
  const updatedOver = {
    ...overdetails,
    teamScore: `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`,
    isComplete: true,
  };

  
};

const onInningChangeService = async (data, fastify, comDetails) => {
  const {response} = data;
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)  
  let batTeam = teams.find((i) => i.teamStatus ==1)
  let bowlTeam = teams.find((i)=> i.teamStatus == 2)
  let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
  const runDifference =
    (batTeam.teamScore || 0) +
    (batTeam.teamLeadRuns || 0) -
    (batTeam.teamTrialRuns || 0);
  const leadRuns = Math.max(runDifference * -1, 0);
  const trialRuns = Math.max(runDifference, 0);
  const partnership = global.tblCommentaryPartnership
    .filter(
      (item) =>
        item?.commentaryId === comDetails.commentaryId &&
        item.currentInnings == comDetails.currentInnings
    )
    .sort(
      (a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId
    )[0];

   let teamUpdates = [
      { ...batTeam, isBattingComplete: true, teamStatus: 2, subInning: 2 },
      {
        ...bowlTeam,
        isBattingComplete: false,
        teamStatus: 1,
        teamLeadRuns: leadRuns,
        teamTrialRuns: trialRuns,
        subInning: 1,
      },
    ];
   let commentaryUpdates = {
      commentaryStatus : commentaryStatus.INNINGCHANGE,
      displayStatus: response.live.status_note,
      rmk : generateRemainingRuns({
        team: { ...bowlTeam, teamTrialRuns: trialRuns},
        ballsPerOver: matchType.ballsPerOver || 6,
      })
    };
  const part = {
    ...partnership,
    isActive: false,
  };
  await upActivePartQuery(part, fastify);
  let partIndex = global.tblCommentaryPartnership.findIndex(
    (item) => item.commentaryPartnershipId == part.commentaryPartnershipId
  );
  if(partIndex != -1){
    global.tblCommentaryPartnership[partIndex].isActive = part.isActive
  }
  let playerToUpdate = global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId == comDetails.commentaryId &&
      item.currentInnings == comDetails.currentInnings &&
      (item.onStrike == true || item.isPlay == true)
  );
   playerToUpdate = playerToUpdate.map((item) => {
    return {
      ...item,
      isPlay: null,
      onStrike: null,
    };
  });
  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails: {
      ...comDetails,
      ...commentaryUpdates
    },
    commentaryTeams: teamUpdates,
    commentaryPlayers: playerToUpdate,
    isCallPredict: false,
    commentaryPartnership : [part]
  },fastify)

  return true;

}
const matchCompleteService = async (data , fastify,comDetails) =>{
  const {response} = data;
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)  
  let batTeam = teams.find((i) => i.teamStatus ==1)
  let bowlTeam = teams.find((i)=> i.teamStatus == 2)
  let winTeam = teams.find((i) => i.tpId == response.match_info.winning_team_id)
  let isBatTeamWon= false;
  if(winTeam){
    isBatTeamWon = winTeam.commentaryTeamId == batTeam.commentaryTeamId ? true : false;
  }
  else {
    return true;
  }
  let upComDetails = {
    ...comDetails,
    commentaryStatus : commentaryStatus.COMPLETED,
    winnerId : winTeam.teamId,
    winnerName : winTeam.teamName,
    displayStatus : "",
    result : response.match_info.status_note,
    rmk : ""
  }

  let upBatTeam = {
    ...batTeam,
    isBattingComplete : true,
    isWin : isBatTeamWon  
  }
  let upBowlTeam = {
    ...bowlTeam,
    isWin : !isBatTeamWon
  }

  await syncEntitySportCommentaryService({
    commentaryId: comDetails.commentaryId,
    commentaryDetails:upComDetails,
    commentaryTeams: [
      upBatTeam,
      upBowlTeam
    ],
    isCallPredict: false,
  },fastify)

  return true

}
module.exports = {
    saveTeamsService,
    savePlayersService,
    saveCompetitionsService,
    saveCommentariesService,
    saveCountryCodesService,
    saveVenueService,
    setEntityComService,
    setEntityCom2Service
}
const saveEntityService = async (data ,request, fastify) => {
  const startTime = new Date();
  const apiName = "/entityCom";
  try {
    let {
      commentaryId,
      commentaryDetails,
      commentaryTeams,
      commentaryPartnership,
      commentaryPlayers,
      commentaryBallByBall,
      commentaryOvers,
      isCallPredict = false,
    } = data;
    let comI,
      overIndex,
      ballByBallIndex,
      partnershipIndex;
    let previousCommentaryStatus, statusToUpdate;
    let sendPartnership = [];
    let _sendPrePlayers = [];
    let pythonURI;
    let commentaryData = global.tblCommentaries.find(
      (item) => item?.commentaryId === commentaryId
    );
    if (!commentaryData) {
      throw new Error("Commentary with this id not Found");
    } else {
      previousCommentaryStatus = commentaryData?.commentaryStatus;
      statusToUpdate = commentaryDetails?.commentaryStatus;
      comI = global.tblCommentaries.findIndex(
        (item) => item.commentaryId == commentaryId
      );
      pythonURI = commentaryData?.pythonURI || null;
    }
    if (commentaryPlayers && commentaryPlayers.length > 0) {
      commentaryPlayers = commentaryPlayers.filter(
        (player) =>
          player.commentaryPlayerId != null ||
          player.commentaryPlayerId != undefined
      );
      commentaryPlayers.forEach((player) => {
        if (player.commentaryPlayerId) {
          const index = global.tblCommentaryPlayers.findIndex(
            (item) => item.commentaryPlayerId === player.commentaryPlayerId
          );
          if (index === -1) {
            throw new Error("Commentary Player with this id not Found");
          }
        }
      });
    }
    //validate partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        partnershipIndex = global.tblCommentaries.findIndex(
          (item) => item?.commentaryId === commentaryPartnership.commentaryId
        );
        if (partnershipIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        partnershipIndex = global.tblCommentaryPartnership.findIndex(
          (item) =>
            item?.commentaryPartnershipId ==
            commentaryPartnership.commentaryPartnershipId
        );
        if (partnershipIndex === -1) {
          throw new Error("Partnership with this id not Found");
        }
      }
    }
    //validate ballByBall
    if (commentaryBallByBall) {
      if (commentaryBallByBall.commentaryBallByBallId == 0) {
        ballByBallIndex = global.tblCommentaries.findIndex(
          (item) => item?.commentaryId === commentaryBallByBall.commentaryId
        );
        if (ballByBallIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
      } else {
        ballByBallIndex = global.tblCommentaryBallByBall.findIndex(
          (item) =>
            item.commentaryBallByBallId ===
            commentaryBallByBall.commentaryBallByBallId
        );
        if (ballByBallIndex === -1) {
          throw new Error("BallByBall with this id not Found");
        }
      }
    }
    //validate over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        overIndex = global.tblCommentaries.findIndex(
          (item) => item?.commentaryId === commentaryOvers.commentaryId
        );

        if (overIndex === -1) {
          throw new Error("Commentary with this id not Found");
        }
        const indexTeam = global.tblCommentaryTeams.findIndex(
          (item) =>
            item?.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId
        );

        if (indexTeam === -1) {
          throw new Error("Team with this id not Found");
        }
        const indexBowler = global.tblCommentaryPlayers.findIndex((item) => {
          return (
            item?.commentaryId === commentaryOvers.commentaryId &&
            item.teamId === commentaryOvers.teamId &&
            item.commentaryPlayerId === commentaryOvers.bowlerId
          );
        });

        if (indexBowler === -1) {
          throw new Error("Bowler with this id not Found");
        }
      } else {
        overIndex = global.tblOvers.findIndex(
          (item) => item.overId === commentaryOvers.overId
        );
        if (overIndex === -1) {
          throw new Error("Over with this id not Found");
        }
      }
    }

    let updatedData = await fastify.db.query(
      `CALL proc_commentary_scoring_et_v1(
      $1, $2, $3, $4,$5,$6,$7,$8,$9,$10
    )`,
      {
        bind: [
          commentaryTeams ? JSON.stringify(commentaryTeams) : null,
          commentaryPlayers ? JSON.stringify(commentaryPlayers) : null,
          commentaryOvers ? JSON.stringify(commentaryOvers) : null,
          commentaryBallByBall ? JSON.stringify(commentaryBallByBall) : null,
          commentaryPartnership ? JSON.stringify(commentaryPartnership) : null,
          commentaryDetails ? JSON.stringify(commentaryDetails) : null,
          commentaryId,
          null,
          null,
          null,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    updatedData = updatedData[0];
    let response = {};
    let sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = commentaryId;
    sendDataForSocketUpdate.eventRefId = commentaryData.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];

    if (commentaryDetails) {
      global.tblCommentaries[comI] = {
        ...global.tblCommentaries[comI],
        commentaryStatus: commentaryDetails.commentaryStatus,
        displayStatus: commentaryDetails.displayStatus,
        rmk: commentaryDetails.rmk,
      };
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: global.tblCommentaries[comI],
      });
    }
    if (commentaryTeams?.length > 0) {
      let teams = [];
      response.commentaryTeams = [];
      for (let t of commentaryTeams) {
        const index = global.tblCommentaryTeams.findIndex(
          (item) => item.commentaryTeamId === t.commentaryTeamId
        );
        global.tblCommentaryTeams[index] = {
          ...global.tblCommentaryTeams[index],
          teamWicket: t.teamWicket,
          teamScore: t.teamScore,
          crr: t.crr,
          teamOver: t.teamOver,
          rrr: t.rrr,
        };
        teams.push({
          ...global.tblCommentaryTeams[index],
          crr: parseFloat(global.tblCommentaryTeams[index].crr) || 0,
          rrr: parseFloat(global.tblCommentaryTeams[index].rrr) || 0,
        });
        response.commentaryTeams.push(global.tblCommentaryTeams[index]);
      }
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryTeams",
        type: "update",
        // data: commentaryTeams,
        data: teams,
      });
    }
    if (commentaryPlayers.length > 0) {
      response.commentaryPlayers = [];
      for (let player of commentaryPlayers) {
        const index = global.tblCommentaryPlayers.findIndex(
          (item) => item.commentaryPlayerId === player.commentaryPlayerId
        );
        // get display name
        let ds = global.tblPlayers.find((i) => i.playerId == player.playerId);
        global.tblCommentaryPlayers[index] = player;
        response.commentaryPlayers.push({
          ...global.tblCommentaryPlayers[index],
          displayName: ds.displayName,
        });
      }
      let _plyers = commentaryPlayers.filter(
        (_fil) => _fil.isPlay === true && _fil.onStrike !== null
      );
      _plyers.forEach((player) => {
        let _sendPrePlayer = {};
        _sendPrePlayer.player_id = player.commentaryPlayerId;
        _sendPrePlayer.player_name = player.playerName;
        _sendPrePlayer.team_id = player.teamId;
        _sendPrePlayer.batRun = player.batRun || "0";
        _sendPrePlayer.isWicket = player.isBatterOut === false ? 0 : 1;
        _sendPrePlayer.current_boundaries =
          (isNaN(parseInt(player.batFour ?? 0, 10))
            ? 0
            : parseInt(player.batFour ?? 0, 10)) +
          (isNaN(parseInt(player.batSix ?? 0, 10))
            ? 0
            : parseInt(player.batSix ?? 0, 10));
        _sendPrePlayer.balls_faced = player.batBall || 0;
        _sendPrePlayers.push(_sendPrePlayer);
      });
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryPlayers",
        type: "update",
        data: response.commentaryPlayers,
      });
    }
    // if (
    //   updatedData.commentaryBallByBallDetails &&
    //   commentaryData.isPredictMarket &&
    //   updatedData.commentaryBallByBallDetails.ballType != 0 &&
    //   updatedData.commentaryBallByBallDetails.ballType != 8 &&
    //   isCallPredict == true
    // ) {
    //   let strikeTeam = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryBallByBall.commentaryId &&
    //       item.teamStatus === 1
    //   );
    //   let nonStrikeTeam = global.tblCommentaryTeams.find(
    //     (item) =>
    //       item?.commentaryId === commentaryBallByBall.commentaryId &&
    //       item.teamStatus === 2
    //   );
    //   let decimalOverCount = parseFloat(commentaryBallByBall.overCount);
    //   let _wkt = commentaryBallByBall.ballIsWicket;
    //   let partnership = commentaryPartnership;
    //   let boundary = partnership?.totalSix + partnership?.totalFour;
    //   sendPartnership.push({
    //     partnership_no: global.tblCommentaryPartnership[partnershipIndex]?.order || 0,
    //     partnership_boundaries: boundary,
    //   });

    //   const predictionPayload = {
    //     playerpredictscore: {
    //       commentary_id: commentaryData.commentaryId,
    //       match_type_id: commentaryData.matchTypeId,
    //       event_id: commentaryData.eventRefId,
    //       current_team_id: strikeTeam.teamId,
    //       total_score: strikeTeam.teamScore,
    //       current_ball: decimalOverCount || 0,
    //       player_details: _sendPrePlayers,
    //       ball_by_ball_id: updatedData.commentaryBallByBallDetails
    //         .commentaryBallByBallId
    //         ? parseInt(
    //           updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //         )
    //         : null,
    //       partnership_details: sendPartnership,
    //     },
    //     predictscore: {
    //       commentary_id: commentaryData.commentaryId,
    //       match_type_id: commentaryData.matchTypeId,
    //       ball: decimalOverCount,
    //       run: commentaryBallByBall.ballRun,
    //       total_score: strikeTeam.teamScore,
    //       strike_team_id: strikeTeam.teamId,
    //       wicket: _wkt === true ? 1 : 0,
    //       total_wicket: strikeTeam.teamWicket,
    //       ball_by_ball_id: updatedData.commentaryBallByBallDetails
    //         .commentaryBallByBallId
    //         ? parseInt(
    //           updatedData.commentaryBallByBallDetails.commentaryBallByBallId
    //         )
    //         : null,
    //       ballType: commentaryBallByBall?.ballType ?? null,
    //       target: nonStrikeTeam?.teamScore != null ? parseInt(nonStrikeTeam.teamScore, 10) + 1 : null,
    //     },
    //     commentary_id: commentaryId,
    //   };
    //   let isNodePrediction =
    //     global.tblConfigs.find(
    //       (item) => item.key === configConstants.ISPREDICATIONFROMNODE
    //     )?.value || "false";
    //   if (isNodePrediction == "true")
    //     processPredictScoreMarket(predictionPayload);
    //   else
    //     callPredictorMarket(
    //       predictionPayload,
    //       "/api/v1/predictscore",
    //       fastify,
    //       request,
    //       pythonURI
    //     );
    // }
    // check over
    if (commentaryOvers) {
      if (commentaryOvers.overId == 0) {
        global.tblOvers.push(updatedData.overDetails);
        response.overdetails = updatedData.overDetails;
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "create",
          data: response.overdetails,
        });
      } else {
        global.tblOvers[overIndex] = {
          ...global.tblOvers[overIndex],
          ballCount: commentaryOvers.ballCount,
          totalRun: commentaryOvers.totalRun,
          totalFour: commentaryOvers.totalFour,
          totalSix: commentaryOvers.totalSix,
          dotBall: commentaryOvers.dotBall,
        };
        response.overdetails = global.tblOvers[overIndex];
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryOvers",
          type: "update",
          data: response.overdetails,
        });
      }
    }
    // check ballbyball
    // if (commentaryBallByBall) {
    //   if (commentaryBallByBall.commentaryBallByBallId == 0) {
    //     global.tblCommentaryBallByBall.push(
    //       updatedData.commentaryBallByBallDetails
    //     );
    //     response.commentaryBallByBallDetails =
    //       updatedData.commentaryBallByBallDetails;
    //     sendDataForSocketUpdate.dataToUpdate.push({
    //       module: "commentaryBallByBall",
    //       type: "create",
    //       data: {
    //         ...response.commentaryBallByBallDetails,
    //         overCount:
    //           response.commentaryBallByBallDetails.overCount !== null
    //             ? response.commentaryBallByBallDetails.overCount.toString()
    //             : null,
    //       },
    //     });
    //     // if (updatedData.commentaryBallByBallDetails.ballType > 0) {
    //     //   if (!global.isSignalRStopped) {
    //     //     let _results = [];
    //     //     let result = await addinMarketBallbyballOdds(
    //     //       commentaryId,
    //     //       updatedData.commentaryBallByBallDetails,
    //     //       fastify
    //     //     );
    //     //     if (result) {
    //     //       _results.push(result);
    //     //       if (_results && _results.length > 0) {
    //     //         sendDataForSocketUpdate.dataToUpdate.push({
    //     //           module: "marketOddsBallByBall",
    //     //           data: _results,
    //     //           type: "create",
    //     //         });
    //     //       }
    //     //     }
    //     //   }
    //     // }
    //   } else {
    //     global.tblCommentaryBallByBall[ballByBallIndex] = {
    //       ...global.tblCommentaryBallByBall[ballByBallIndex],
    //       batStrikeId: commentaryBallByBall.batStrikeId,
    //       batNonStrikeId: commentaryBallByBall.batNonStrikeId,
    //       ballIsCount: commentaryBallByBall.ballIsCount,
    //       ballType: commentaryBallByBall.ballType,
    //       ballIsDot: commentaryBallByBall.ballIsDot,
    //       ballRun: commentaryBallByBall.ballRun,
    //       ballIsBoundry: commentaryBallByBall.ballIsBoundry,
    //       ballFour: commentaryBallByBall.ballFour,
    //       ballSix: commentaryBallByBall.ballSix,
    //     };
    //     response.commentaryBallByBallDetails =
    //       global.tblCommentaryBallByBall[ballByBallIndex];

    //     sendDataForSocketUpdate.dataToUpdate.push({
    //       module: "commentaryBallByBall",
    //       type: "update",
    //       data: {
    //         ...response.commentaryBallByBallDetails,
    //         overCount:
    //           response.commentaryBallByBallDetails.overCount !== null
    //             ? response.commentaryBallByBallDetails.overCount.toString()
    //             : null,
    //       },
    //     });
    //     // if (response.commentaryBallByBallDetails.ballType > 0) {
    //     //   let _bory = commentaryBallByBall.ballIsBoundry;
    //     //   if (_bory == true) {
    //     //     let boundaryType;
    //     //     let ballRun = response.commentaryBallByBallDetails.ballRun;
    //     //     if (ballRun == 4) {
    //     //       boundaryType = ballRun;
    //     //     }
    //     //     if (ballRun == 6) {
    //     //       boundaryType = ballRun;
    //     //     }
    //     //     await notiConfigContentReplaceService(
    //     //       EventName.BOUNDARY,
    //     //       commentaryData.commentaryId,
    //     //       request,
    //     //       fastify,
    //     //       boundaryType
    //     //     );
    //     //   }
    //     //   const isFDS = global.tblConfigs.find(
    //     //     (item) => item.key === configConstants.ISFRAUDDET_DECTIONAPI
    //     //   ).value;
    //     //   if (isFDS && isFDS == "true") {
    //     //     if (_bory) {
    //     //       callfds(
    //     //         {
    //     //           Id: 0,
    //     //           EventId: parseInt(commentaryData.eventRefId),
    //     //           BWDateTime: "",
    //     //           Type: _bory === true ? "2" : "",
    //     //         },
    //     //         "/api/transactions/SaveBoundryWicket",
    //     //         fastify,
    //     //         request
    //     //       ).catch((err) => {
    //     //         errorLogger(
    //     //           fastify,
    //     //           err.message,
    //     //           "ERROR --> services/commentary.js/syncCommentaryStatsWithAPIAndSocket",
    //     //           request
    //     //         );
    //     //       });
    //     //     }
    //     //   }
    //     // }
    //   }
    // }
    if (updatedData && updatedData.commentaryBallByBallDetails?.length > 0) {
      for (let ball of updatedData.commentaryBallByBallDetails) {
        let ballIndex = global.tblCommentaryBallByBall.findIndex(
          (item) => item.commentaryBallByBallId == ball.commentaryBallByBallId
        );
        if (ballIndex === -1) {
          global.tblCommentaryBallByBall.push(ball);
        } else {
          global.tblCommentaryBallByBall[ballIndex] = ball;
        }
      }
    }
    // check partnership
    if (commentaryPartnership) {
      if (commentaryPartnership.commentaryPartnershipId == 0) {
        global.tblCommentaryPartnership.push(
          updatedData.commentaryPartnershipDetails
        );
        response.commentaryPartnershipDetails =
          updatedData.commentaryPartnershipDetails;
        const partnership = response.commentaryPartnershipDetails;
        // Find player 1 image
        const _player1 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === partnership.batter1Id
        );
        if (_player1) {
          response.commentaryPartnershipDetails.player1image =
            _player1.playerimage;
          response.commentaryPartnershipDetails.player1jerseyandimage =
            _player1?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player1jerseyandimagepath =
            _player1?.jerseyPlayerImagePath;
        }
        const _player2 = commentaryPlayers.find(
          (item) => item.commentaryPlayerId === partnership.batter2Id
        );
        if (_player2) {
          response.commentaryPartnershipDetails.player2image =
            _player2.playerimage;
          response.commentaryPartnershipDetails.player2jerseyandimage =
            _player2?.jerseyPlayerImage;
          response.commentaryPartnershipDetails.player2jerseyandimagepath =
            _player2?.jerseyPlayerImagePath;
        }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "create",
          data: response.commentaryPartnershipDetails,
        });
      } else {
        global.tblCommentaryPartnership[partnershipIndex] = {
          ...global.tblCommentaryPartnership[partnershipIndex],
            ...commentaryPartnership
        };
        response.commentaryPartnershipDetails =
          global.tblCommentaryPartnership[partnershipIndex];

        // Find player 1 image
        // const _player1 = commentaryPlayers.find(
        //   (item) => item.commentaryPlayerId === commentaryPartnership.batter1Id
        // );
        // if (_player1) {
        //   response.commentaryPartnershipDetails.player1image =
        //     _player1.playerimage;
        //   response.commentaryPartnershipDetails.player1jerseyandimage =
        //     _player1?.jerseyPlayerImage;
        //   response.commentaryPartnershipDetails.player1jerseyandimagepath =
        //     _player1?.jerseyPlayerImagePath;
        // }
        // const _player2 = commentaryPlayers.find(
        //   (item) => item.commentaryPlayerId === commentaryPartnership.batter2Id
        // );
        // if (_player2) {
        //   response.commentaryPartnershipDetails.player2image =
        //     _player2.playerimage;
        //   response.commentaryPartnershipDetails.player2jerseyandimage =
        //     _player2?.jerseyPlayerImage;
        //   response.commentaryPartnershipDetails.player2jerseyandimagepath =
        //     _player2?.jerseyPlayerImagePath;
        // }
        sendDataForSocketUpdate.dataToUpdate.push({
          module: "commentaryPartnership",
          type: "update",
          data: response.commentaryPartnershipDetails,
        });
      }
    }
    // call the getscore and emit the event data
    if (
      global?.clientSocketIo !== undefined &&
      global?.clientSocketIo.length > 0
    ) {
      commentaryDetailsByEventIdService(
        {
          ...request,
          body: {
            eventId: commentaryData.eventRefId,
            commentaryId : commentaryData.commentaryId

          },
        },
        fastify,
        "callFromSocket"
      ).catch((err) => {
        console.log("err in commentaryDetailsByEventIdService", err);
        errorLogger(
          fastify,
          err.message,
          "ERROR --> services/commentary.js/commentaryTossService",
          request
        );
      });

      global.clientSocketIo.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }
    if (global.wss) {
      let res = {};
      res.eventname = "ShortScore";
      res.connectionID = "";
      let _ShortCommentry = setShortCommenrty(commentaryData.eventRefId);
      _ShortCommentry = JSON.stringify(_ShortCommentry);
      res.data = _ShortCommentry;
      // Iterate over all connected clients and send the update
      global.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(res));
        }
      });
    }
    commentaryLogger(
      {
        commentaryId: commentaryId,
        requestBody: data,
        response: response,
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === commentaryId
          ),
        },
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    return response
  } catch (error) {
    console.log("wrrr", error);
    commentaryLogger(
      {
        commentaryId: data.commentaryId,
        requestBody: data,
        response: {
          error: error.message,
        },
        global: {
          partnership: global.tblCommentaryPartnership.filter(
            (item) => item?.commentaryId === data.commentaryId
          ),
        },
        extra: {
          ballByBall: global.tblCommentaryBallByBall.filter(
            (item) => item?.commentaryId === data.commentaryId
          ),
        },
        apiName: apiName,
        reqStartTime: startTime,
      },
      request,
      fastify
    );
    throw new Error(error.message);
  }
};
const dumpFun = async () =>{
      for (let c of commentaries){
        let updateBall = {}
        let ball = 1;
        let tpId = c.event_id;
        let event = c.event;
        let over;
        let bowler = playerTpIdObj[c.bowler_id];
        let strikerPly = playerTpIdObj[c.batsman_id]
        if(event == "ball"){
            let run = c.run || 0;
            let isBoundary = c.run == 4 || c.run ==6 ? true : false
            let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id)
            if(index == -1){
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                    && i.over == c.over
                    && i.teamId == battingTeam.teamId);
                if(!over){
                    // generate new over
                    let newOver = generateOverEt({
                            commentaryDetails :comDetails,
                            teams: {
                                battingTeam: battingTeam,
                                bowlingTeam,
                            },
                            bowler: player,
                    })
                    over = await virtualOverQuery(newOver, request, fastify);
                    // add over to global variable
                    global.tblOvers.push(over);
                    const commentaryBallByBall = {
                        commentaryBallByBallId: 0,
                        commentaryId: comDetails?.commentaryId,
                        teamId: battingTeam.teamId,
                        overId: over?.overId,
                        overCount: 0,
                        currentOverBalls: 0,
                        bowlerId: bowler?.commentaryPlayerId,
                        batStrikeId: onStrikePlayer.commentaryPlayerId,
                        batNonStrikeId: nonStrikePlayer.commentaryPlayerId,
                        ballIsCount: true,
                        ballType: 0,
                        ballIsDot: false,
                        ballRun: 0,
                        ballExtraRun: 0,
                        ballIsBoundry: false,
                        ballFour: 0,
                        ballSix: 0,
                        ballIsWicket: false,
                        ballWicketType: 0,
                        ballPlayerId: 0,
                        ballBowlerId: bowler.commentaryPlayerId,
                        ballFielderId1: 0,
                        devOver: null,
                        devCurrentOverBall: null,
                        ballFielderId2: 0,
                        overIsMaiden: false,
                        nextBatStrikeId: onStrikePlayer.commentaryPlayerId,
                        nextBatNonStrikeId: nonStrikePlayer.commentaryPlayerId,
                        currentInnings: comDetails.currentInnings,
                        commentaryPartnershipId: updatePartnership.commentaryPartnershipId || 0,
                        teamScore: battingTeam?.teamScore || 0,
                        teamWicket: battingTeam?.teamWicket || 0,
                        tpId : c.event_id
                    };
                    const oball = await virtualBallByBallQuery(
                        commentaryBallByBall,
                        request,
                        fastify
                    );
                    // add ball to global variable
                    global.tblCommentaryBallByBall.push(oball);
                }
                let bowlerOver =  (parseFloat(bowler.bowlerOver || 0) + 0.1).toFixed(1)
                updateBall = {
                    ballIsCount : true,
                    ballType : BALL_TYPE.REGULAR,
                    ballRun : c.run,
                    batStrikeId : strikerPly.commentaryPlayerId,
                    batNonStrikeId : nonStrikePlayer.commentaryPlayerId,
                    teamId : battingTeam.teamId,
                    overId : over.overId,
                    nextBatStrikeId : strikerPly.commentaryPlayerId,
                    nextBatNonStrikeId : nonStrikePlayer.commentaryPlayerId
                    // autoStrikeBallCount
                    
                }
                strikerPly = {
                    ...strikerPly,
                    batRun :  strikerPly.batRun + c.run,
                    batBall : strikerPly.batBall + ball,
                }
                bowler = {
                    ...bowler,
                    bowlerRun : bowler.bowlerRun + c.run,
                    bowlerTotalBall : bowler.bowlerTotalBall  + ball,
                    bowlerOver :bowlerOver
                }
                // partnership = {
                //     ...partnership,
                //     batter1Runs : playerTpIdObj[c.batsman_id].commentaryPlayerId == partnership.batter1Id
                //             ? partnership.batter1Runs + c.run
                //             : partnership.batter1Runs,
                //     batter2Runs : playerTpIdObj[c.batsman_id].commentaryPlayerId == partnership.batter2Id
                //             ? partnership.batter2Runs + c.run
                //             : partnership.batter2Runs,
                //     batter1Balls : playerTpIdObj[c.batsman_id].commentaryPlayerId == partnership.batter1Id
                //             ? partnership.batter1Balls + ball
                //             : partnership.batter1Balls,
                //     batter2Balls : playerTpIdObj[c.batsman_id].commentaryPlayerId == partnership.batter2Id
                //             ? partnership.batter2Balls + ball
                //             : partnership.batter2Balls
                // }
                over = {
                    ...over,
                    ballCount : over.ballCount + ball,
                    totalRun : over.totalRun + c.run
                }
                battingTeam = {
                    ...battingTeam,
                    teamOver :  ball > 0
                        ? (parseFloat(battingTeam.teamOver || 0) + 0.1).toFixed(1)
                        : battingTeam.teamOver,
                    teamScore :  `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`
                }
                updateBall.overCount = battingTeam.teamOver;
                updateBall.currentOverBalls = over.ballCount;
                updateBall.bowlerId = bowler.commentaryPlayerId;
                if (run === 0) {
                    updateBall.ballIsDot = true;
                    strikerPly.batDotBall = strikerPly.batDotBall + ball;
                    over.dotBall = over.dotBall + ball;
                    bowler.bowlerDotBall = bowler.bowlerDotBall + ball;
                }
                else if(isBoundary){
                    if(c.run == 4){
                    updateBall.ballIsBoundry = true;
                    updateBall.ballFour = 1;
                    strikerPly.batFour = strikerPly.batFour + 1;
                    bowler.bowlerFour = bowler.bowlerFour + 1;
                    over.totalFour = over.totalFour + 1;
                    partnership.totalFour = partnership.totalFour + 1
                    }
                    if(c.run == 6){
                        updateBall.ballIsBoundry = true;
                        updateBall.ballSix = 1;
                        strikerPly.batSix = strikerPly.batSix + 1;
                        bowler.bowlerSix = bowler.bowlerSix + 1;
                        over.totalSix = over.totalSix + 1;
                        partnership.totalSix = partnership.totalSix + 1
                    }
                }
                else if(c.run % 2 != 0){
                    isChangeStrike = true;
                    updateBall.nextBatStrikeId = nonStrikePlayer.commentaryPlayerId;
                    updateBall.nextBatNonStrikeId = strikerPly.commentaryPlayerId
                }
                let isOverComplete = over.ballCount >= (matchType?.ballsPerOver || 6) ? true : false;
                strikerPly.onStrike = isChangeStrike ? false : true
                nonStrikePlayer.onStrike = isChangeStrike ?true : false
                const ballByBallUp = generateBallET(
                    {
                        updateBall,
                        commentaryBallByBallId: 0,
                        updateBattingTeam : battingTeam,
                        updateOver : over,
                        updateBatter : strikerPly,
                        updateBowler : bowler,
                        nonStrikeBatter : nonStrikePlayer,
                        updatePartnership : partnership,
                        commentaryDetails:comDetails,
                    },
                    request
                );
                ballbyball.push(ballByBallUp)
                upOver = over;
                upPlayers.push(strikerPly);
                upPlayers.push(nonStrikePlayer);
                upPlayers.push(bowler);
                upTeams = [battingTeam, bowlingTeam]
                // update partnership
                // const newPart = genEtPartnership(
                //     {
                //         updateBattingTeam : battingTeam,
                //         currentPartnership: partnership,
                //         commentaryDetails : comDetails,
                //     },
                //     request
                // );
                comDetails = {
                    ...comDetails,
                    displayStatus: response.live.status_note
                };
                upComDetails = comDetails;
                // db call
            }
        }
        else if(event == "overEnd"){
            let overET = global.tblOver.find((i)=>i.commentaryId == comDetails.commentaryId 
            && i.currentInnings == comDetails.currentInnings 
            && i.teamId == battingTeam.teamId  
            && i.over == c.over - 1)
            if(overET){
                // complte this over
              const overEndNumber = c.over - 1;
              const overET = global.tblOvers.find(i =>
                i.commentaryId === comDetails.commentaryId &&
                i.currentInnings === comDetails.currentInnings &&
                i.teamId === battingTeam.teamId &&
                i.over === overEndNumber
              );
              if (overET) {
                  overET.isComplete = true;
                  overET.teamScore = battingTeam.teamScore + "/" + (battingTeam.teamWicket || 0);
              }

            }
        }   
    } 
}

