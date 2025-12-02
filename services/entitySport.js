const { getPlyByIdQuery } = require("../repository/TablePlayer")
const { getTeamsByIds } = require("../repository/TableTeams")
const { getCompetitionByIdsQuery } = require("../repository/TableCompitition")
const { getComEntityQuery, updateVirtualPartnershipQuery, updateCommentaryStatusQuery } = require("../repository/TableCommentary")
const { getAllTournamentTeamPlayerByIdsQuery } = require("../repository/TableTournamentsTeamPlayers")
const { getMatchDataByCId, syncEntitySportCommentaryService } = require("../services/commentry");
const {
    callClientAPI,
    ServiceType,
    APIEndpointModuleType,
    BALL_TYPE,
    EntityCommentaryStatus,
    wicketTypeObj,
    GAME_STATUS,
} = require("../utilities/index");
const { getCountryByIds } = require("../repository/TableCountryCodes")
const { getVenueByIds } = require("../repository/TableVenue")
const { compStatus, commentaryStatus } = require("../utilities")
const { buildOverData, buildPartnershipData, buildComPlayers, genEtPartnership, generateOverEt, generateBallET, generateDisplayStatus, getBowlerOnlyRuns, generateWicket, generateRemainingRuns } = require("../utilities/comFunction")
const { virtualOverQuery, virtualBallByBallQuery, virtualPartnershipQuery } = require("../repository/TableVirtual")
const { default: fastify } = require("fastify")
const { commentaryLogger, errorLogger } = require("../utilities/logger")
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
  // }
}

const saveTournamentTeamPlayerService = async (request, fastify) => {
    const { tournamentTeamPlayerIds } = request.body;
    let ply = await getAllTournamentTeamPlayerByIdsQuery({
        tournamentTeamPlayers: tournamentTeamPlayerIds
    }, request, fastify);

    for (let p of ply) {
        let index = global.tblTournamentTeamPlayers.findIndex((tp) => tp.id == p.id);
        if (index == -1) {
            global.tblTournamentTeamPlayers.push(p)
        }
        else {
            global.tblTournamentTeamPlayers[index] = p
        }
    }

    const objectIds = ply.map(obj => obj.id);
    const missingIds = tournamentTeamPlayerIds.filter(id => !objectIds.includes(id));
    global.tblTournamentTeamPlayers = global.tblTournamentTeamPlayers.filter(item => !missingIds.includes(item.id));

    return "Tournament Team Players Data Updated successfully."
}
const setEntityCom2Service = async (request , fastify) =>{
  let matchID = request.body?.response?.match_id
  try {
        const {response} = request.body
    // await new Promise((r) => setTimeout(r, 5000));
    let comDetails = global.tblCommentaries.find((c)=> c.tpId == response?.match_id)
    if(!comDetails){
        // throw new Error("Commentary with this tp id not found.")
        return true;
    }
    if(comDetails.scoringType != 2 || comDetails.scoringType == null ){
      // console.log("scoring not auto")
      return true;
    }
    let tpId = comDetails.tpId;
    if(!tpId){
        // throw new Error("This commentary not associated with any tpId.")
        return true;
    }

    const scoreResponse = {};
    const sendDataForSocketUpdate = {};
    sendDataForSocketUpdate.commentaryId = comDetails?.commentaryId;
    sendDataForSocketUpdate.eventRefId = comDetails?.eventRefId;
    sendDataForSocketUpdate.dataToUpdate = [];
    // check the status
    if(response.live.game_state == commentaryStatus.TOSSDONE){
      if(comDetails.commentaryStatus == commentaryStatus.OPEN){
      // set the toss
      const tossInfo = response.match_info.toss;

      // get in comteam
      let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
      if(!team1){
          throw new Error("Team1 not found in commentary teams.")
      }
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
      let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
      let upComData = {
          ...comDetails,
          commentaryStatus : commentaryStatus.TOSSDONE,
          tossWonBy : team1.teamId,
          choseTo : tossInfo.decision,
          tossRmk : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
          displayStatus : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
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
                  displayStatus: upComData.displayStatus,
              };
              scoreResponse.commentaryDetails = global.tblCommentaries[comI]
              sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryDetails",
                type: "update",
                data: scoreResponse.commentaryDetails,
              });
          }
          if(comTeams && comTeams.length > 0){
            scoreResponse.commentaryTeams = [];
              for (let ct of comTeams){
                  let comTI = global.tblCommentaryTeams.findIndex((c)=> c.commentaryTeamId == ct.commentaryTeamId)
                  global.tblCommentaryTeams[comTI] = {
                      ...global.tblCommentaryTeams[comTI],
                      teamStatus: ct.teamStatus,
                      teamBattingOrder: ct.teamBattingOrder,
                      subInning: ct.subInning,
                  };
                  scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
              }
              scoreResponse.commentaryTeams.forEach(async (team) => {
                const _teamsC1 = global.tblTeams.filter(
                  (item) => item.teamId === team.teamId
                );
                if (_teamsC1.length > 0) {
                  team.image = _teamsC1[0].image;
                  team.jersey = _teamsC1[0].jersey;
                  team.nimage = _teamsC1[0].imagePath;
                  team.njersey = _teamsC1[0].jerseyPath;
                }
              });
              sendDataForSocketUpdate.dataToUpdate.push({
                module: "commentaryTeams",
                type: "update",
                data: scoreResponse.commentaryTeams.map((team) => ({
                  ...team,
                  crr: parseFloat(team?.crr) || 0,
                  rrr: parseFloat(team?.rrr) || 0,
                })),
              });
          }
          global.clientSocketIo.forEach((socket) => {
            socket.client.emit("updateFullscore", sendDataForSocketUpdate);
          });
      }
      return true;
    }
    // set the players
    if(response.live.game_state == EntityCommentaryStatus.INPROGRESS){
        if(comDetails.commentaryStatus == commentaryStatus.OPEN){
            // set the toss
            const tossInfo = response.match_info.toss;
            // get in comteam
            // console.log("tossInfo", tossInfo)
            let team1 = global.tblCommentaryTeams.find((ct)=> ct.commentaryId == comDetails.commentaryId && ct.tpId == tossInfo.winner && ct.currentInnings == comDetails.currentInnings)
            // console.log("team1", team1)
            if(!team1){
                throw new Error("Team1 not found in commentary teams.")
            }
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
            let teamChoseTo = tossInfo?.decision === 1 ? "Bat" : "Bowl"
            let upComData = {
                ...comDetails,
                commentaryStatus : commentaryStatus.TOSSDONE,
                tossWonBy : team1.teamId,
                choseTo : tossInfo.decision,
                tossRmk : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
                displayStatus : `Toss won by ${team1.teamName} and chose to ${teamChoseTo}.`,
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
                    displayStatus: upComData.displayStatus,
                };
                scoreResponse.commentaryDetails = global.tblCommentaries[comI]
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "commentaryDetails",
                  type: "update",
                  data: scoreResponse.commentaryDetails,
                });
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
                    scoreResponse.commentaryTeams.push(global.tblCommentaryTeams[comTI]);
                }
                scoreResponse.commentaryTeams.forEach(async (team) => {
                  const _teamsC1 = global.tblTeams.filter(
                    (item) => item.teamId === team.teamId
                  );
                  if (_teamsC1.length > 0) {
                    team.image = _teamsC1[0].image;
                    team.jersey = _teamsC1[0].jersey;
                    team.nimage = _teamsC1[0].imagePath;
                    team.njersey = _teamsC1[0].jerseyPath;
                  }
                });
                sendDataForSocketUpdate.dataToUpdate.push({
                  module: "commentaryTeams",
                  type: "update",
                  data: scoreResponse.commentaryTeams.map((team) => ({
                    ...team,
                    crr: parseFloat(team?.crr) || 0,
                    rrr: parseFloat(team?.rrr) || 0,
                  })),
                });
            }
            global.clientSocketIo.forEach((socket) => {
              socket.client.emit("updateFullscore", sendDataForSocketUpdate);
            });
        }
        comDetails = global.tblCommentaries.find((i) => i.commentaryId == comDetails.commentaryId)
        if(comDetails.commentaryStatus == commentaryStatus.TOSSDONE){
            const entityInning = response?.scorecard?.innings || [];
            const bTeam = entityInning.find(inn => inn.number === comDetails.currentInnings);
            // set player
            let batTeam = global.tblCommentaryTeams.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings 
            && (i.tpId == response.live?.live_inning?.batting_team_id || i.tpId == bTeam?.batting_team_id))
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
            let tpBatsMan = response.live.batsmen || [];
            let tpBowler = response.live.bowlers || [];
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
            let part = response.live.live_inning?.current_partnership;
            if(!part){
              errorLogger(
                fastify,
                "Current Partnership is not in Data",
                "services/entitySport.js/setEntityCom2Service",
                null,
                request.body
              )
              return true;
            }
            // let batters = part?.batsmen?.map((i)=>i.batsman_id)
            let batters = part?.batsmen?.map(i => i.batsman_id) || [];
            let partnership = {}
            if (batters?.length > 0) {
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
              } else {
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

    const ALLOWED_GAME_STATES = [
      GAME_STATUS["Default"],
      GAME_STATUS["Toss"],
      GAME_STATUS["Play Ongoing"]
    ];
    const currentState = response?.live?.game_state;
    if (!ALLOWED_GAME_STATES.includes(currentState)) {
      const commDisplayStatus = Object.keys(GAME_STATUS).find(
        key => GAME_STATUS[key] === currentState
      ) || "Unknown";
      await updateCommentaryStatusQuery(
        {
          displayStatus: commDisplayStatus,
          commentaryId: comDetails?.commentaryId
        },
        fastify,
        request
      );
    
      const index = global.tblCommentaries.findIndex(
        item => item.commentaryId == comDetails?.commentaryId
      );
    
      if (index !== -1) {
        global.tblCommentaries[index].displayStatus = commDisplayStatus;
      }
      scoreResponse.commentaryDetails = global.tblCommentaries[index]
      sendDataForSocketUpdate.dataToUpdate.push({
        module: "commentaryDetails",
        type: "update",
        data: scoreResponse.commentaryDetails,
      });
    }
    return true;
  } catch (error) {
    console.log("error", error);
    errorLogger(
      fastify,
      `${error.message}-${matchID}`,
      // error.message,
      "Error --> services/entitySport.js/setEntityCom2servie",
      null,
      request.body
    )
    return true;
  }
}
const handleComArr = async (data , request , fastify , comDetails) =>{
    const {response} = data;
    const commentaries = response.live.commentaries;
    const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
    i.currentInnings == comDetails.currentInnings)  
    let battingTeam = teams.find((i) => i.teamStatus ==1)
    let bowlingTeam = teams.find((i)=> i.teamStatus == 2)
    let matchType = global.tblMatchTypes.find((i)=> i.matchTypeId == comDetails.matchTypeId)
    let part = response.live?.live_inning?.current_partnership;
    let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
    let isChangeStrike = false;
    const prtship = [];
    let live_score_data = response?.live?.live_score;
    let liveTeamScore = response?.live?.live_score?.runs;
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
    if (commentaries?.length > 0) {
      let res =await handleStoreBall({
          response,
          battingTeam,
          matchType
      }, fastify, comDetails, request)
    }
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
          const validate = prtship.findIndex(item => item.commentaryPartnershipId == par[0]?.commentaryPartnershipId);
          if(validate == -1) {
            par[0].type = "update";
            prtship.push(par[0]) 
          } else {
            prtship[validate].type = "update";
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
              updateBattingTeam : battingTeam
          })
          partnership = await virtualPartnershipQuery(
              partnership,
              request,
              fastify
          );
          global.tblCommentaryPartnership.push(partnership);
          partnership.type = "create";
          prtship.push(partnership)
      }
    }
    
    let ballbyball = [];
    let upPlayers =[];
    let upOvers = [];
    let upTeams = [];
    const playersMap = {}; // key: commentaryPlayerId
    let ltSetOrder = 0;
    // Find the current max batter order from global data
    let currentPlayers = []
    const existingBatters = global.tblCommentaryPlayers.filter(i =>
      i.commentaryId === comDetails.commentaryId &&
      i.currentInnings === comDetails.currentInnings &&
      i.teamId === battingTeam.teamId &&
      i.batterOrder != null
    ) || []

    ltSetOrder = existingBatters.length
      ? Math.max(...existingBatters?.map(i => i.batterOrder))
      : 0;
    if (response.live?.batsmen) {
      for (let p of response.live.batsmen) {
        let comP = playerTpIdObj[p.batsman_id];
        let batterData = response?.scorecard?.innings
          ?.find(i => i?.number === response?.live?.live_inning_number)?.batsmen
          ?.find(i1 => i1?.batsman_id == p?.batsman_id && i1?.batting == "true");
        let onStrikeData = batterData?.position === "striker";
        let isPlayData = true
        if (comP) {
          let batterOrder = comP.batterOrder;

          if (batterOrder == null) {
            ltSetOrder += 1;
            batterOrder = ltSetOrder;
          }

          if(comP?.isBatterOut == true) {
            isPlayData = null;
            onStrikeData = null; // or false
          }

          playersMap[p.batsman_id] = {
            ...comP,
            isPlay: isPlayData,
            onStrike: onStrikeData,
            batRun: p.runs,
            batBall: p.balls_faced,
            batFour: p.fours,
            batSix: p.sixes,
            batterOrder,
          };
          currentPlayers.push(comP.commentaryPlayerId);
        }
      }
    }
    let ltSetBowlerOrder = 0;
    // find the latest bowler order already stored for this innings/team
    const existingBowlers = global.tblCommentaryPlayers.filter(i =>
      i.commentaryId === comDetails.commentaryId &&
      i.currentInnings === comDetails.currentInnings &&
      i.teamId === bowlingTeam.teamId &&
      i.bowlerOrder != null
    ) ||[]

    ltSetBowlerOrder = existingBowlers.length
      ? Math.max(...existingBowlers?.map(i => i.bowlerOrder))
      : 0;

    // if (response.live?.bowlers) {
    //   for (let p of response.live.bowlers) {
    //     let comP = playerTpIdObj[p.bowler_id];
    //     if (comP) {
    //       let bowlerOrder = comP.bowlerOrder;

    //       // assign order only if not set yet
    //       if (bowlerOrder == null) {
    //         ltSetBowlerOrder += 1;
    //         bowlerOrder = ltSetBowlerOrder;
    //       }

    //       playersMap[p.bowler_id] = {
    //         ...comP,
    //         isPlay: true,
    //         onStrike: false,
    //         bowlerOver: p.overs,
    //         bowlerRun: p.runs_conceded,
    //         bowlerWicket: p.wickets,
    //         bowlerOrder,
    //       };
    //     }
    //     // set isPlay false for previous bowler
    //   }
    // }
    if(response.scorecard && response.scorecard?.innings?.length > 0){
      let inningNo = response?.live?.live_inning_number
      let cInning = response.scorecard.innings.find((i) => i.number == inningNo)
      let bowlers = cInning.bowlers;
      let currentBowler  = bowlers.filter((i)=> i.bowling == "true")
      for (let b of currentBowler){
        let comP = playerTpIdObj[b.bowler_id];
        if(comP){
          let bowlerOrder = comP.bowlerOrder;
          if (bowlerOrder == null) {
            ltSetBowlerOrder += 1;
            bowlerOrder = ltSetBowlerOrder;
          }
          playersMap[b.bowler_id] = {
            ...comP,
            isPlay: true,
            onStrike: false,
            bowlerOver: b.overs,
            bowlerRun: b.runs_conceded,
            bowlerWicket: b.wickets,
            bowlerEconomy: parseFloat(b.econ) ?? "0",
            bowlerOrder,
          };
          currentPlayers.push(comP.commentaryPlayerId);
        }
       
      }
    }
    // find nonplaying player and set isPlay null
    let nonPlayingPlayers = comPlayers.filter((i)=> i.isPlay == true && !currentPlayers.includes(i.commentaryPlayerId));
    for (let npp of nonPlayingPlayers){
      playersMap[npp.tpId] = {
        ...npp,
        isPlay : null,
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
    if(commentaries?.length > 0){
      if(comDetails.commentaryStatus == commentaryStatus.INNINGCHANGE){
        upComDetails.commentaryStatus = commentaryStatus.INPROGRESS
      }
      // get last 5 elem of update
      // let storeBall = commentaries.filter((i)=> i.event == "ball" && i.score != "w")
      // let res =await handleStoreBall({
      //   response,
      //   battingTeam
      // },fastify,comDetails, request)
      // return res;

      for (let c of commentaries){
        let updateBall = {}
        let ball = 1;
        
        let tpId = c.event_id;
        let event = c.event;
        if(String(c.score) == "w" ){
          event = "wicket"
        }
        if(event == "ball"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
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
              // const runToUpdate = +matchType.valueOfWideBall || 0;
              const runToUpdate = +(c?.run ?? 0);
              if(!over) {
                over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
                  && i.over == c.over
                  && i.teamId == battingTeam.teamId);
                if (over) {
                  over.type = "update";
                }
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
                  over.type = "create";
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
                  oball.type = "create";
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
              // battingTeam["teamScore"] = (battingTeam.teamScore || 0) + runToUpdate;
              battingTeam["teamScore"] = liveTeamScore;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
              battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
              battingTeam.teamWideRuns = (battingTeam.teamWideRuns || 0) + runToUpdate;       
              // over.ballCount += 1;
              over.totalRun += c.run;
              over.teamScore = `${liveTeamScore || 0}/${battingTeam?.teamWicket || 0}`;
              // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
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
                if (over) {
                  over.type = "update";
                }
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
                    over.type = "create";
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
                    oball.type = "create";
                    ballbyball.push(oball)

                }
                oversMap[overKey] = over; // store reference
              }
              let ball_Type = BALL_TYPE.REGULAR;
              if (Number(c?.legbye_run) > 0) {
                ball_Type = BALL_TYPE.LEG_BYE;
              } else if (Number(c?.noball_run) > 0) {
                ball_Type = BALL_TYPE.NO_BALL;
              }
              updateBall = {
                  ballIsCount : true,
                  // ballType : BALL_TYPE.REGULAR,
                  ballType : ball_Type,
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
              // battingTeam["teamScore"] = (battingTeam.teamScore || 0) + run;
              battingTeam["teamScore"] = liveTeamScore;
              battingTeam.teamOver = `${c.over}.${c.ball}`;
              battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
              battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
              battingTeam.teamLegByRuns =( battingTeam.teamLegByRuns || 0) + parseInt(c.legbye_run)
              battingTeam.teamNoBallRuns =( battingTeam.teamNoBallRuns || 0) + parseInt(c.noball_run)
              battingTeam.teamByRuns =( battingTeam.teamByRuns || 0) + parseInt(c.bye_run)

              over.ballCount += 1;
              over.totalRun += c.run;
              // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
              over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
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
                  over.totalFour = over.totalFour + 1;
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
            const oball = await virtualBallByBallQuery(
                ballByBallUp,
                request,
                fastify
            );
            global.tblCommentaryBallByBall.push(oball)
            oball.type = "create";
            ballbyball.push(oball)
            // ballbyball.push(ballByBallUp)
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
                // isPlay : true
              }
            }
          }
          for(let p of c.bowls){
            if(playersMap[p.bowler_id]){
              playersMap[p.bowler_id].bowlerOver = p.overs;
              playersMap[p.bowler_id].bowlerRun = p.runs_conceded;
              playersMap[p.bowler_id].isPlay = null;
            }
            else {
              playersMap[p.bowler_id] = {
                ...playerTpIdObj[p.bowler_id],
                bowlerOver : p.overs,
                bowlerRun : p.runs_conceded,
                isPlay: null 
              }
            }
          }
        }
        if(event == "wicket"){
          let index = global.tblCommentaryBallByBall.findIndex((i)=>i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId)
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
            // playersMap[c.bowler_id].bowlerOver = ((playersMap[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1) 
            playersMap[c.bowler_id].bowlerTotalWicket = (playersMap[c.bowler_id].bowlerTotalWicket || 0) + 1
            playersMap[c.bowler_id].bowlerTotalBall = (playersMap[c.bowler_id].bowlerTotalBall || 0) + 1
            playersMap[c.bowler_id].bowlerDotBall = (playersMap[c.bowler_id].bowlerDotBall || 0) + 1
          }
          else {
            playersMap[c.bowler_id] = {
              ...playerTpIdObj[c.bowler_id],
              // bowlerOver :((playerTpIdObj[c.bowler_id].bowlerOver || 0) + 0.1).toFixed(1),
              isPlay : true,
              bowlerTotalWicket : playerTpIdObj[c.bowler_id].bowlerTotalWicket ? playerTpIdObj[c.bowler_id].bowlerTotalWicket + 1 : 1,
              bowlerTotalBall : playerTpIdObj[c.bowler_id].bowlerTotalBall ? playerTpIdObj[c.bowler_id].bowlerTotalBall + 1 : 1,  
              bowlerDotBall : playerTpIdObj[c.bowler_id].bowlerDotBall ? playerTpIdObj[c.bowler_id].bowlerDotBall + 1 : 1,  
            }
          }
          // let wicketBatsMan = playerTpIdObj[c.wicket_batsman_id];
          let wicketData = {
            wicketType: wicketTypeObj.BOLD,
            batterId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            batterName : playerTpIdObj[c.batsman_id]?.playerName,
            runs: c?.run ?? 0,
            fieldPlayerId : playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fieldPlayerName : playerTpIdObj[c.bowler_id]?.playerName,
            fielder1: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            fielder2: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerId: playerTpIdObj[c.bowler_id]?.commentaryPlayerId,
            bowlerName : playerTpIdObj[c.bowler_id]?.playerName,
          };
          battingTeam.teamOver = `${c.over}.${c.ball}`;
          // battingTeam["teamScore"] = (battingTeam.teamScore || 0) + c?.run ?? 0;
          battingTeam["teamScore"] = liveTeamScore;
          battingTeam.teamWicket = (battingTeam.teamWicket || 0) + 1;
          battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
          battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
          if(!over) {
            over = global.tblOvers.find((i)=> i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings
              && i.over == c.over
              && i.teamId == battingTeam.teamId);
            if (over) {
              over.type = "update";
            }
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
                over.type = "create";
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
                    ballRun: c?.run ?? 0,
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
          over.totalRun += c?.run ?? 0;
          over.ballCount += 1;
          over.dotBall += 1;
          // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
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
              // batBall: (playersMap[c.batsman_id]?.batBall || 0) + 1,
              batDotBall: (playersMap[c.batsman_id]?.batDotBall || 0) + 1,
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
              // batBall: (playerTpIdObj[c.batsman_id].batBall || 0) + 1,
              batDotBall: (playerTpIdObj[c.batsman_id].batDotBall || 0) + 1,
              // batBall: 1,
              // batDotBall: 1,
            }
          }
          let updateBall = {
            ballIsWicket: true,
            ballWicketType: wicketTypeObj.BOLD,
            ballFielderId1: wicketData.fielder1,
            ballFielderId2: wicketData.fielder2,
            batStrikeId: playerTpIdObj[c.batsman_id]?.commentaryPlayerId,
            // batNonStrikeId: ,
            batNonStrikeId: nonStrikePId,
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
          oball.type = "create";
          ballbyball.push(oball)
          const generateWicket1 = generateWicket({
            commentaryDetails : comDetails,
            currentWicket: wicketData,
            currentOver: over,
            battingTeam: battingTeam,
            currentBall: oball,
          });
          generateWicket1.type = "create";
          wickets.push(generateWicket1);
          if(batters.length == 2) {
            let [b1, b2] = batters;
            let oldPart = global.tblCommentaryPartnership.find((i)=>
              i.commentaryId == comDetails.commentaryId &&
              i.currentInnings == comDetails.currentInnings &&
              (
                  (i.batter1Id == playerTpIdObj[b1].commentaryPlayerId && i.batter2Id == playerTpIdObj[b2].commentaryPlayerId) ||
                  (i.batter1Id == playerTpIdObj[b2].commentaryPlayerId && i.batter2Id == playerTpIdObj[b1].commentaryPlayerId)
              )
            );

            const partData = {
              ...oldPart,
              isActive: false,
            };

            await upActivePartQuery(partData, fastify);
            let partIndex = global.tblCommentaryPartnership.findIndex(
              (item) => item.commentaryPartnershipId == partData.commentaryPartnershipId
            );
            if(partIndex != -1){
              global.tblCommentaryPartnership[partIndex].isActive = partData.isActive
            }
          }
        }
        upTeams = [battingTeam, bowlingTeam]
        // upComDetails.displayStatus = c.commentary;
      }
    }
    // console.log(oversMap)
    let plyArr = Object.values(playersMap);
    let overArr = Object.values(oversMap)
    if (commentaries?.length > 0) {
      let displayData = {}
      let latestBall = commentaries.filter(c => c.event != "overend").at(-1);
      const currentBall = global.tblCommentaryBallByBall.find(item => 
        item.tpId == latestBall?.event_id
      );
      if(currentBall) {
        displayData.currentBall = currentBall
      }
      if (latestBall && String(latestBall?.score) == "w") {
        // // onStrike player code
        // const currentInning = response?.scorecard?.innings?.find(
        //   i => i.number == response?.live?.live_inning_number
        // );
        // const batter = currentInning?.batsmen?.find(
        //   b => b.position == "striker" && b.batting == "true"
        // );
        
        if (latestBall?.wicket_batsman_id) {
          const onStrike = plyArr.find(item => item.tpId == latestBall?.wicket_batsman_id);
          if (onStrike) {
            displayData.playerSwitch = null;
            displayData.onStrikePlayer = onStrike;
          }
        }
      }
      if (Object.keys(displayData).length > 0) {
        const commDisplayStatus = await generateDisplayStatus(displayData);
        upComDetails.displayStatus = commDisplayStatus;
      }
      let overEndBall = commentaries.at(-1)?.event === "overend"
      if (overEndBall) {
        upTeams = upTeams.map(item => {
          if(item.teamId == battingTeam.teamId) {
            const newOver = Math.ceil(Number(item.teamOver || 0));
            return {
              ...item,
              teamOver: `${newOver}`
            };
          }
          return item;
        })
      }
    }

    await syncEntitySportCommentaryService({
      commentaryId : comDetails.commentaryId,
      commentaryDetails : {
        ...comDetails,
        ...upComDetails
      },
      commentaryPlayers : plyArr,
      commentaryPartnership: prtship,
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

const onInningChangeService = async (data, fastify, comDetails) => {
  const {response} = data;
  const teams = global.tblCommentaryTeams.filter((i) =>i.commentaryId == comDetails.commentaryId &&
  i.currentInnings == comDetails.currentInnings)  
  // chekc if one of the team bat is completed
  let oneTeamWon = teams.find((i)=>i.isBattingComplete == true);
  if(oneTeamWon){
    errorLogger(
      fastify,          
      "Inning already Changed again got inning break status",
      "services/entitySport.js/onInningChangeService",
      null,
      data
    )
    return true;
  } 
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
      // displayStatus: response.live.status_note,
      displayStatus: "Innings Break",
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
const handleStoreBall = async (data, fastify, comDetails, request) => {
  const { response, battingTeam ,matchType } = data;
  let com = response.live.commentaries;
  let storedCom = com.slice(-5) 
  // console.log("storedCom" ,storedCom)
  storedCom = storedCom.filter((i)=> i.event != "overend").sort((i1 , i2)=> i2.event_id - i1.event_id)
  // console.log("storedCom" ,storedCom)
  let tpIds = storedCom.map((i) => i.event_id)
  let playerTpIdObj = {};
  let comPlayers = global.tblCommentaryPlayers.filter((cp) => cp.commentaryId == comDetails.commentaryId && cp.currentInnings == comDetails.currentInnings)
  for (let cp of comPlayers) {
    playerTpIdObj[cp.tpId] = {
      ...cp,
      playerName: cp.playerName,
      playerId: cp.playerId,
    };
  }
  let playersMap = {};
  let upOvers = [];
  let deleteBallByBallIds = [];
  let deleteOverIds = []
  let oversMap = {};
  let partnershipMap = {};
  let upTeams = []
  for (let c of storedCom) {
    let updateBall = {}
    let ball = 1;
    let tpId = c.event_id;
    let event = c.event;
    String(c.score) == "w" ? event = "wicket" : event ="ball";
    c.score && String(c.score).includes('wd') ?event = "wide" : event = "ball"
    let isBoundary = c.run == 4 || c.run == 6 ? true : false
    let live_score_data = response?.live?.live_score;
    let liveTeamScore = response?.live?.live_score?.runs;
    if (String(c.score) == "w") {
      event = "wicket"
      // wicket code
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id);
      if (index == -1) continue; // skip not created ball
      let BallByBall = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id);
      if (BallByBall.ballIsWicket == true) {
        continue;
      }
      let afterBalls = global.tblCommentaryBallByBall.filter(
        (i) =>
          i.commentaryBallByBallId >= BallByBall.commentaryBallByBallId &&
          i.commentaryId == comDetails.commentaryId &&
          i.currentInnings == comDetails.currentInnings
      );
      for (let b1 of afterBalls) {
        deleteBallByBallIds.push(b1.commentaryBallByBallId);
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        let tpBall = com.find((i) => i.event_id == b1.tpId);
        if (!tpBall) continue;
        // if (String(tpBall.score) == "w") {
        if (b1.ballIsWicket == true) {
          event = "wicket"

          // Update batting team
          battingTeam.teamWicket = Math.max(0, battingTeam.teamWicket - 1);
          const prevBall = Math.max(0, c.ball - 1);
          battingTeam.teamOver = `${c.over}.${prevBall}`;
          // Update overs
          if (over) {
            over.totalWicket = Math.max(0, (over.totalWicket || 0) - 1);
            over.ballCount = Math.max(0, (over.ballCount || 0) - 1);

            // if after undo, no balls left → delete over
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            } else {
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              // over.teamScore = `${battingTeam.teamScore || 0}/${battingTeam.teamWicket || 0}`;
              over.teamScore = `${liveTeamScore}/${battingTeam.teamWicket || 0}`;
              if (over) {
                over.type = "update"
              }
              oversMap[overKey] = over;
            }
          }

          // Update Batter and Bowler stats
          if (!playersMap[tpBall.bowler_id]) {
            playersMap[tpBall.bowler_id] = {
              ...playerTpIdObj[tpBall.bowler_id]
            }
          }
          if (!playersMap[tpBall.batsman_id]) {
            playersMap[tpBall.batsman_id] = {
              ...playerTpIdObj[tpBall.batsman_id]
            }
          }

          playersMap[tpBall.bowler_id].bowlerTotalWicket = playersMap[tpBall.bowler_id].bowlerTotalWicket > 0 ? playersMap[tpBall.bowler_id].bowlerTotalWicket - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          let o = parseFloat(playersMap[tpBall.bowler_id].bowlerOver || 0);
          let overs = Math.floor(o);
          let balls = Math.round((o % 1) * 10);
          let val = parseFloat(`${balls ? overs : overs - 1}.${balls ? balls - 1 : 5}`);
          playersMap[tpBall.bowler_id].bowlerOver = Math.max(0, val);

          playersMap[tpBall.batsman_id].isBatterOut = null;
          playersMap[tpBall.batsman_id].wicketType = 0;
          playersMap[tpBall.batsman_id].bowlerId = 0;
          playersMap[tpBall.batsman_id].fielderId1 = 0;
          playersMap[tpBall.batsman_id].fielderId2 = 0;
          playersMap[tpBall.batsman_id].isPlay = true;
          playersMap[tpBall.batsman_id].onStrike = true;
          
          let part = response.live?.live_inning?.current_partnership;
          let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
          let partnership = {}
          if(batters.length == 2){
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
                }
                let par = await updateVirtualPartnershipQuery(partnership,fastify, null)
                //update partnersip in db
                let pI = global.tblCommentaryPartnership.findIndex((i)=> i.commentaryPartnershipId == partnership.commentaryPartnershipId)
                global.tblCommentaryPartnership[pI] = par[0]; 
            } else {
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

          // if (c.run == 0) {
          //   over.dotBall = over.dotBall - 1;
          //   playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
          //   playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          // }

          // Update bowler stats
          // const bowlerId = b1.bowlerId;
          // const bowlerData = global.tblCommentaryPlayers.find(
          //   (item) => item.commentaryPlayerId == bowlerId
          // );

          // if (bowlerData) {
          //   const currentWickets = bowlerData?.bowlerTotalWicket || 0;
          //   const tBalls = bowlerData?.bowlerTotalBall || 0;

          //   playersMap[bowlerId] = {
          //     ...playerTpIdObj[bowlerId],
          //     ...bowlerData,
          //     bowlerTotalWicket: currentWickets > 0 ? currentWickets - 1 : 0,
          //     bowlerTotalBall: tBalls > 0 ? tBalls - 1 : 0
          //   };
          //   if (c?.run == 0) {
          //     playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playersMap[bowlerId].bowlerDotBall - 1 : 0;
          //   }
          // }

          // // Reset the batter who was out
          // const partnershipData = global.tblCommentaryPartnership
          //   .filter(item =>
          //     item.commentaryId === comDetails?.commentaryId &&
          //     item.currentInnings === comDetails?.currentInnings &&
          //     item.teamId === battingTeam?.teamId
          //   )
          //   .sort((a, b) => b.order - a.order)
          //   .slice(0, 2);

          // const [currentPartnership, prevPartnership] = partnershipData;

          // let newBatterId = null;
          // let replacedBatterId = null;
          // // let commonBatterId = null;

          // if (currentPartnership && prevPartnership) {
          //   const currBatters = [currentPartnership.batter1Id, currentPartnership.batter2Id].filter(Boolean);
          //   const prevBatters = [prevPartnership.batter1Id, prevPartnership.batter2Id].filter(Boolean);

          //   // commonBatterId = currBatters.find(id => prevBatters.includes(id)) || null;
          //   newBatterId = currBatters.find(id => !prevBatters.includes(id)) || null;
          //   replacedBatterId = prevBatters.find(id => !currBatters.includes(id)) || null;
          // }
          // const onStrikeValue = global.tblCommentaryPlayers.find(item => item.commentaryPlayerId == newBatterId)?.onStrike ?? false;
          // if (newBatterId && replacedBatterId) {
          //   const batters = global.tblCommentaryPlayers.filter(
          //     (item) => [newBatterId, replacedBatterId].includes(item.commentaryPlayerId)
          //   );

          //   for (const bat of batters) {
          //     const isNewBatter = bat.commentaryPlayerId === newBatterId;
          //     const isReplacedBatter = bat.commentaryPlayerId === replacedBatterId;
          //     if (bat?.onStrike == true && b1?.run == 0) {
          //       playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playerTpIdObj[bowlerId].bowlerDotBall - 1 : 0;
          //     }

          //     let batterUpdate = {
          //       ...bat,
          //       isBatterOut: null,
          //       wicketType: null,
          //       bowlerId: 0,
          //       fielderId1: 0,
          //       fielderId2: 0,
          //     };

          //     if (isNewBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: false, onStrike: false };
          //     } else if (isReplacedBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: true, onStrike: onStrikeValue };
          //     }

          //     playersMap[batterUpdate.commentaryPlayerId] = batterUpdate;
          //   }
          // }

          // //Set old partnership active true        
          // const oldPartnership = partnershipData[1];
          // if (oldPartnership) {
          //   const key = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}`;
          //   partnershipMap[key] = { ...oldPartnership, isActive: true };
          // }
        }

        // if (tpBall.event == "ball") {
        if ((b1.ballType == BALL_TYPE.REGULAR  || b1.ballType == BALL_TYPE.LEG_BYE || b1.ballType == BALL_TYPE.NO_BALL) && b1.ballIsWicket == false) {
            let run = b1.ballRun
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = liveTeamScore;
            // reducse teamOver
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamLegByRuns = battingTeam.teamLegByRuns > 0 ? (battingTeam.teamLegByRuns || 0) - parseInt(b1.teamLegByRuns) : 0;
            battingTeam.teamNoBallRuns = battingTeam.teamNoBallRuns > 0 ? (battingTeam.teamNoBallRuns || 0) - parseInt(b1.teamNoBallRuns) : 0;
            battingTeam.teamByRuns = battingTeam.teamByRuns > 0 ? (battingTeam.teamByRuns || 0) - parseInt(b1.teamByRuns) : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - 1 : 0;
            // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - 1 : 0;
            playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
            // playersMap[tpBall.batsman_id].batDotBall =playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
            // playersMap[tpBall.batsman_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0;
            let isBoundary = run == 4 || run == 6 ? true : false;
            if (run == 0) {
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
              playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
              // playersMap[tpBall.batsman_id] = {
              //   ...playerTpIdObj[tpBall.batsman_id],
              //   batDotBall : playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0,
              //   bowlerDotBall: playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0
              // }
            }
            else if (isBoundary) {
              if (run == 4) {
                over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
                playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
              }
              if (run == 6) {
                over.totalSix -= 1;
                playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
              }
            }
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
        }
          if (b1.ballType == BALL_TYPE.WIDE  && b1.ballIsWicket == false) {
            isWide = true;
            // let run = +matchType.valueOfWideBall || 0;
            // let run = +(c?.run ?? 0);
            let run = b1?.ballExtraRun ?? 0;
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - run : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
            over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;

            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
          }
      }
    }
    if (event == "ball") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
       if (index == -1) continue; // skip not created ball
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      // if (ball.ballRun == c.run) {
      //   continue;
      // }  

      if (!ball.ballIsWicket && ball.ballRun === c.run && (ball.ballType == BALL_TYPE.REGULAR ||
         ball.ballType == BALL_TYPE.LEG_BYE || ball.ballType == BALL_TYPE.NO_BALL)
      ) {
        continue;
      }
      
      // delete this ball and other ball
      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      // let ballIds = ballAfterThis.map((i)=> i.commentaryBallByBallId)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        let tpId = tpBall.event_id;
        // let event = c.event;
        // if (String(tpBall.score) == "w") {
        if (b1.ballIsWicket == true) {
          event = "wicket"
          // Update batting team
          battingTeam.teamWicket = Math.max(0, battingTeam.teamWicket - 1);
          const prevBall = Math.max(0, c.ball - 1);
          battingTeam.teamOver = `${c.over}.${prevBall}`;
          // Update overs
          if (over) {
            over.totalWicket = Math.max(0, (over.totalWicket || 0) - 1);
            over.ballCount = Math.max(0, (over.ballCount || 0) - 1);

            // if after undo, no balls left → delete over
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            } else {
              // over.teamScore = `${battingTeam.teamScore || 0}/${battingTeam.teamWicket || 0}`;
              over.teamScore = `${liveTeamScore}/${battingTeam.teamWicket || 0}`;
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              if (over) {
                over.type = "update"
              }
              oversMap[overKey] = over;
            }
          }

          // Update Batter and Bowler stats
          if (!playersMap[tpBall.bowler_id]) {
            playersMap[tpBall.bowler_id] = {
              ...playerTpIdObj[tpBall.bowler_id]
            }
          }
          if (!playersMap[tpBall.batsman_id]) {
            playersMap[tpBall.batsman_id] = {
              ...playerTpIdObj[tpBall.batsman_id]
            }
          }

          playersMap[tpBall.bowler_id].bowlerTotalWicket = playersMap[tpBall.bowler_id].bowlerTotalWicket > 0 ? playersMap[tpBall.bowler_id].bowlerTotalWicket - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          let o = parseFloat(playersMap[tpBall.bowler_id].bowlerOver || 0);
          let overs = Math.floor(o);
          let balls = Math.round((o % 1) * 10);
          let val = parseFloat(`${balls ? overs : overs - 1}.${balls ? balls - 1 : 5}`);
          playersMap[tpBall.bowler_id].bowlerOver = Math.max(0, val);
          
          playersMap[tpBall.batsman_id].isBatterOut = null;
          playersMap[tpBall.batsman_id].isBatterOut = false;
          playersMap[tpBall.batsman_id].wicketType = 0;
          playersMap[tpBall.batsman_id].bowlerId = 0;
          playersMap[tpBall.batsman_id].fielderId1 = 0;
          playersMap[tpBall.batsman_id].fielderId2 = 0;
          playersMap[tpBall.batsman_id].isPlay = true;
          playersMap[tpBall.batsman_id].onStrike = true;
          
          let part = response.live?.live_inning?.current_partnership;
          let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
          let partnership = {}
          if(batters.length == 2){
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
                global.tblCommentaryPartnership[pI] = par[0]; 
            } else {
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

          // if (c.run == 0) {
          //   over.dotBall = over.dotBall - 1;
          //   playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
          //   playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          // }

          // Update bowler stats
          // const bowlerId = b1.bowlerId;
          // const bowlerData = global.tblCommentaryPlayers.find(
          //   (item) => item.commentaryPlayerId == bowlerId
          // );

          // if (bowlerData) {
          //   const currentWickets = bowlerData?.bowlerTotalWicket || 0;
          //   const tBalls = bowlerData?.bowlerTotalBall || 0;

          //   playersMap[bowlerId] = {
          //     ...playerTpIdObj[bowlerId],
          //     ...bowlerData,
          //     bowlerTotalWicket: currentWickets > 0 ? currentWickets - 1 : 0,
          //     bowlerTotalBall: tBalls > 0 ? tBalls - 1 : 0
          //   };
          //   if (c?.run == 0) {
          //     playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playersMap[bowlerId].bowlerDotBall - 1 : 0;
          //   }
          // }

          // // Reset the batter who was out
          // const partnershipData = global.tblCommentaryPartnership
          //   .filter(item =>
          //     item.commentaryId === comDetails?.commentaryId &&
          //     item.currentInnings === comDetails?.currentInnings &&
          //     item.teamId === battingTeam?.teamId
          //   )
          //   .sort((a, b) => b.order - a.order)
          //   .slice(0, 2);

          // const [currentPartnership, prevPartnership] = partnershipData;

          // let newBatterId = null;
          // let replacedBatterId = null;
          // // let commonBatterId = null;

          // if (currentPartnership && prevPartnership) {
          //   const currBatters = [currentPartnership.batter1Id, currentPartnership.batter2Id].filter(Boolean);
          //   const prevBatters = [prevPartnership.batter1Id, prevPartnership.batter2Id].filter(Boolean);

          //   // commonBatterId = currBatters.find(id => prevBatters.includes(id)) || null;
          //   newBatterId = currBatters.find(id => !prevBatters.includes(id)) || null;
          //   replacedBatterId = prevBatters.find(id => !currBatters.includes(id)) || null;
          // }
          // const onStrikeValue = global.tblCommentaryPlayers.find(item => item.commentaryPlayerId == newBatterId)?.onStrike ?? false;
          // if (newBatterId && replacedBatterId) {
          //   const batters = global.tblCommentaryPlayers.filter(
          //     (item) => [newBatterId, replacedBatterId].includes(item.commentaryPlayerId)
          //   );

          //   for (const bat of batters) {
          //     const isNewBatter = bat.commentaryPlayerId === newBatterId;
          //     const isReplacedBatter = bat.commentaryPlayerId === replacedBatterId;
          //     if (bat?.onStrike == true && b1?.run == 0) {
          //       playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playerTpIdObj[bowlerId].bowlerDotBall - 1 : 0;
          //     }

          //     let batterUpdate = {
          //       ...bat,
          //       isBatterOut: null,
          //       wicketType: null,
          //       bowlerId: 0,
          //       fielderId1: 0,
          //       fielderId2: 0,
          //     };

          //     if (isNewBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: false, onStrike: false };
          //     } else if (isReplacedBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: true, onStrike: onStrikeValue };
          //     }

          //     playersMap[batterUpdate.commentaryPlayerId] = batterUpdate;
          //   }
          // }

          // //Set old partnership active true        
          // const oldPartnership = partnershipData[1];
          // if (oldPartnership) {
          //   const key = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}`;
          //   partnershipMap[key] = { ...oldPartnership, isActive: true };
          // }
        }
        // if (tpBall.event == "ball") {
        if (b1.ballType == BALL_TYPE.REGULAR || b1.ballType == BALL_TYPE.LEG_BYE || b1.ballType == BALL_TYPE.NO_BALL) {
          // if (tpBall.score && String(tpBall.score).includes('wd')) {
          //   isWide = true;
          //   let run = +matchType.valueOfWideBall || 0;
          //   battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
          //   let previousBall = c.ball - 1;
          //   battingTeam.teamOver = `${c.over}.${previousBall}`
          //   battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - 1 : 0;
          //   over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
          //   over.totalRun = over.totalRun > 0 ? over.totalRun - 1 : 0;
          //   over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          //   over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
          //   over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
          //   if (!playersMap[tpBall.bowler_id]) {
          //     playersMap[tpBall.bowler_id] = {
          //       ...playerTpIdObj[tpBall.bowler_id]
          //     }
          //   }
          //   if (!playersMap[tpBall.batsman_id]) {
          //     playersMap[tpBall.batsman_id] = {
          //       ...playerTpIdObj[tpBall.batsman_id]
          //     }
          //   }
          //   playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
          //   playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
          //   playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
          //   playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - run : 0;
          // }
          // else {
            let run = b1.ballRun
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = liveTeamScore;
            // reducse teamOver
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamLegByRuns = battingTeam.teamLegByRuns > 0 ? (battingTeam.teamLegByRuns || 0) - parseInt(b1.teamLegByRuns) : 0;
            battingTeam.teamNoBallRuns = battingTeam.teamNoBallRuns > 0 ? (battingTeam.teamNoBallRuns || 0) - parseInt(b1.teamNoBallRuns) : 0;
            battingTeam.teamByRuns = battingTeam.teamByRuns > 0 ? (battingTeam.teamByRuns || 0) - parseInt(b1.teamByRuns) : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - 1 : 0;
            // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - 1 : 0;
            playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
            // playersMap[tpBall.batsman_id].batDotBall =playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
            // playersMap[tpBall.batsman_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0;
            let isBoundary = run == 4 || run == 6 ? true : false;
            if (run == 0) {
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
              playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
              // playersMap[tpBall.batsman_id] = {
              //   ...playerTpIdObj[tpBall.batsman_id],
              //   batDotBall : playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0,
              //   bowlerDotBall: playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0
              // }
            }
            else if (isBoundary) {
              if (run == 4) {
                playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
                over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
              }
              if (run == 6) {
                over.totalSix = over.totalSix > 0 ? over.totalSix - 1 : 0;
                playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
              }
            }
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
          // }
        }
        if (b1.ballType == BALL_TYPE.WIDE) {
            isWide = true;
            // let run = +(c?.run ?? 0);
            let run = b1?.ballExtraRun ?? 0;
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = liveTeamScore;
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - run : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
            // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
            over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
            
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
          }
      }      
    }
    if (event == "wide") {
      let index = global.tblCommentaryBallByBall.findIndex((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      if (index == -1) continue; // skip not created ball
      let ball = global.tblCommentaryBallByBall.find((i) => i.tpId == c.event_id && i.commentaryId == comDetails.commentaryId);
      // if (!ball.ballIsWicket && ball.ballType == BALL_TYPE.WIDE && ball.ballRun == c.run) {
      //   continue;
      // }
      if (!ball.ballIsWicket && ball.ballType == BALL_TYPE.WIDE && ball.ballExtraRun == c.run) {
        continue;
      }
      let ballAfterThis = global.tblCommentaryBallByBall.filter((i) => i.commentaryBallByBallId >= ball.commentaryBallByBallId &&
        i.commentaryId == comDetails.commentaryId && i.currentInnings == comDetails.currentInnings)
      // let ballIds = ballAfterThis.map((i)=> i.commentaryBallByBallId)
      for (let b1 of ballAfterThis) {
        const overNumber = Number(c.over);
        const overKey = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}-${overNumber}`;
        let over = oversMap[overKey];
        over = global.tblOvers.find((i) => i.overId == b1.overId)
        oversMap[overKey] = over
        deleteBallByBallIds.push(b1.commentaryBallByBallId)
        let tpBall = com.find((i) => i.event_id == b1.tpId)
        let tpId = tpBall.event_id;
        // let event = c.event;
        // if (String(tpBall.score) == "w") {
        if (b1.ballIsWicket == true) {
          event = "wicket"
          // Update batting team
          battingTeam.teamWicket = Math.max(0, battingTeam.teamWicket - 1);
          const prevBall = Math.max(0, c.ball - 1);
          battingTeam.teamOver = `${c.over}.${prevBall}`;
          // Update overs
          if (over) {
            over.totalWicket = Math.max(0, (over.totalWicket || 0) - 1);
            over.ballCount = Math.max(0, (over.ballCount || 0) - 1);

            // if after undo, no balls left → delete over
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            } else {
              // over.teamScore = `${battingTeam.teamScore || 0}/${battingTeam.teamWicket || 0}`;
              over.teamScore = `${liveTeamScore}/${battingTeam.teamWicket || 0}`;
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              if (over) {
                over.type = "update"
              }
              oversMap[overKey] = over;
            }
          }

          // Update Batter and Bowler stats
          if (!playersMap[tpBall.bowler_id]) {
            playersMap[tpBall.bowler_id] = {
              ...playerTpIdObj[tpBall.bowler_id]
            }
          }
          if (!playersMap[tpBall.batsman_id]) {
            playersMap[tpBall.batsman_id] = {
              ...playerTpIdObj[tpBall.batsman_id]
            }
          }

          playersMap[tpBall.bowler_id].bowlerTotalWicket = playersMap[tpBall.bowler_id].bowlerTotalWicket > 0 ? playersMap[tpBall.bowler_id].bowlerTotalWicket - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
          playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playersMap[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          let o = parseFloat(playersMap[tpBall.bowler_id].bowlerOver || 0);
          let overs = Math.floor(o);
          let balls = Math.round((o % 1) * 10);
          let val = parseFloat(`${balls ? overs : overs - 1}.${balls ? balls - 1 : 5}`);
          playersMap[tpBall.bowler_id].bowlerOver = Math.max(0, val);

          playersMap[tpBall.batsman_id].isBatterOut = null;
          playersMap[tpBall.batsman_id].wicketType = 0;
          playersMap[tpBall.batsman_id].isBatterOut = false;
          playersMap[tpBall.batsman_id].bowlerId = 0;
          playersMap[tpBall.batsman_id].fielderId1 = 0;
          playersMap[tpBall.batsman_id].fielderId2 = 0;
          playersMap[tpBall.batsman_id].isPlay = true;
          playersMap[tpBall.batsman_id].onStrike = true;
          

          if (c.run == 0) {
            over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
            playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
          }

          let part = response.live?.live_inning?.current_partnership;
          let batters = part?.batsmen?.map((i)=>i.batsman_id) || []
          let partnership = {}
          if(batters.length == 2){
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
                global.tblCommentaryPartnership[pI] = par[0]; 
            } else {
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
          // Update bowler stats
          // const bowlerId = b1.bowlerId;
          // const bowlerData = global.tblCommentaryPlayers.find(
          //   (item) => item.commentaryPlayerId == bowlerId
          // );

          // if (bowlerData) {
          //   const currentWickets = bowlerData?.bowlerTotalWicket || 0;
          //   const tBalls = bowlerData?.bowlerTotalBall || 0;

          //   playersMap[bowlerId] = {
          //     ...playerTpIdObj[bowlerId],
          //     ...bowlerData,
          //     bowlerTotalWicket: currentWickets > 0 ? currentWickets - 1 : 0,
          //     bowlerTotalBall: tBalls > 0 ? tBalls - 1 : 0
          //   };
          //   if (c?.run == 0) {
          //     playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playersMap[bowlerId].bowlerDotBall - 1 : 0;
          //   }
          // }

          // // // Reset the batter who was out
          // const partnershipData = global.tblCommentaryPartnership
          //   .filter(item =>
          //     item.commentaryId === comDetails?.commentaryId &&
          //     item.currentInnings === comDetails?.currentInnings &&
          //     item.teamId === battingTeam?.teamId
          //   )
          //   .sort((a, b) => b.order - a.order)
          //   .slice(0, 2);

          // const [currentPartnership, prevPartnership] = partnershipData;

          // let newBatterId = null;
          // let replacedBatterId = null;
          // // let commonBatterId = null;

          // if (currentPartnership && prevPartnership) {
          //   const currBatters = [currentPartnership.batter1Id, currentPartnership.batter2Id].filter(Boolean);
          //   const prevBatters = [prevPartnership.batter1Id, prevPartnership.batter2Id].filter(Boolean);

          //   // commonBatterId = currBatters.find(id => prevBatters.includes(id)) || null;
          //   newBatterId = currBatters.find(id => !prevBatters.includes(id)) || null;
          //   replacedBatterId = prevBatters.find(id => !currBatters.includes(id)) || null;
          // }
          // const onStrikeValue = global.tblCommentaryPlayers.find(item => item.commentaryPlayerId == newBatterId)?.onStrike ?? false;
          // if (newBatterId && replacedBatterId) {
          //   const batters = global.tblCommentaryPlayers.filter(
          //     (item) => [newBatterId, replacedBatterId].includes(item.commentaryPlayerId)
          //   );

          //   for (const bat of batters) {
          //     const isNewBatter = bat.commentaryPlayerId === newBatterId;
          //     const isReplacedBatter = bat.commentaryPlayerId === replacedBatterId;
          //     if (bat?.onStrike == true && b1?.run == 0) {
          //       playersMap[bowlerId].bowlerDotBall = playersMap[bowlerId].bowlerDotBall > 0 ? playerTpIdObj[bowlerId].bowlerDotBall - 1 : 0;
          //     }

          //     let batterUpdate = {
          //       ...bat,
          //       isBatterOut: null,
          //       wicketType: null,
          //       bowlerId: 0,
          //       fielderId1: 0,
          //       fielderId2: 0,
          //     };

          //     if (isNewBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: false, onStrike: false };
          //     } else if (isReplacedBatter) {
          //       batterUpdate = { ...batterUpdate, isPlay: true, onStrike: onStrikeValue };
          //     }

          //     playersMap[batterUpdate.commentaryPlayerId] = batterUpdate;
          //   }
          // }

          // //Set old partnership active true        
          // const oldPartnership = partnershipData[1];
          // if (oldPartnership) {
          //   const key = `${comDetails.commentaryId}-${comDetails.currentInnings}-${battingTeam.teamId}`;
          //   partnershipMap[key] = { ...oldPartnership, isActive: true };
          // }
        }
        // if (tpBall.event == "ball") {
        if ((b1.ballType == BALL_TYPE.REGULAR  || b1.ballType == BALL_TYPE.LEG_BYE || b1.ballType == BALL_TYPE.NO_BALL) && b1.ballIsWicket == false) {
          // if (tpBall.score && String(tpBall.score).includes('wd')) {
          //   isWide = true;
          //   let run = +matchType.valueOfWideBall || 0;
          //   battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
          //   let previousBall = c.ball - 1;
          //   battingTeam.teamOver = `${c.over}.${previousBall}`
          //   battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - 1 : 0;
          //   over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
          //   over.totalRun = over.totalRun > 0 ? over.totalRun - 1 : 0;
          //   over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
          //   over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
          //   over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
          //   if (!playersMap[tpBall.bowler_id]) {
          //     playersMap[tpBall.bowler_id] = {
          //       ...playerTpIdObj[tpBall.bowler_id]
          //     }
          //   }
          //   if (!playersMap[tpBall.batsman_id]) {
          //     playersMap[tpBall.batsman_id] = {
          //       ...playerTpIdObj[tpBall.batsman_id]
          //     }
          //   }
          //   playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
          //   playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
          //   playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
          //   playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - run : 0;
          // }
          // else {
            let run = b1.ballRun
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = liveTeamScore;
            // reducse teamOver
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamLegByRuns = battingTeam.teamLegByRuns > 0 ? (battingTeam.teamLegByRuns || 0) - parseInt(b1.teamLegByRuns) : 0;
            battingTeam.teamNoBallRuns = battingTeam.teamNoBallRuns > 0 ? (battingTeam.teamNoBallRuns || 0) - parseInt(b1.teamNoBallRuns) : 0;
            battingTeam.teamByRuns = battingTeam.teamByRuns > 0 ? (battingTeam.teamByRuns || 0) - parseInt(b1.teamByRuns) : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - 1 : 0;
            // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.batsman_id].runs = playersMap[tpBall.batsman_id].runs > 0 ? playersMap[tpBall.batsman_id].runs - 1 : 0;
            playersMap[tpBall.batsman_id].batBall = playersMap[tpBall.batsman_id].batBall > 0 ? playersMap[tpBall.batsman_id].batBall - 1 : 0;
            // playersMap[tpBall.batsman_id].batDotBall =playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
            // playersMap[tpBall.batsman_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0;
            let isBoundary = run == 4 || run == 6 ? true : false;
            if (run == 0) {
              over.dotBall = over.dotBall > 0 ? over.dotBall - 1 : 0
              playersMap[tpBall.batsman_id].batDotBall = playersMap[tpBall.batsman_id].batDotBall > 0 ? playersMap[tpBall.batsman_id].batDotBall - 1 : 0;
              playersMap[tpBall.bowler_id].bowlerDotBall = playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 : 0;
              // playersMap[tpBall.batsman_id] = {
              //   ...playerTpIdObj[tpBall.batsman_id],
              //   batDotBall : playersMap[tpBall.batsman_id].batDotBall > 0 ?playersMap[tpBall.batsman_id].batDotBall - 1 : 0,
              //   bowlerDotBall: playersMap[tpBall.bowler_id].bowlerDotBall > 0 ? playerTpIdObj[tpBall.bowler_id].bowlerDotBall - 1 :0
              // }
            }
            else if (isBoundary) {
              if (run == 4) {
                over.totalFour = over.totalFour > 0 ? over.totalFour - 1 : 0
                playersMap[tpBall.bowler_id].bowlerFour = playersMap[tpBall.bowler_id].bowlerFour > 0 ? playersMap[tpBall.bowler_id].bowlerFour - 1 : 0
              }
              if (run == 6) {
                over.totalSix -= 1;
                playersMap[tpBall.bowler_id].bowlerSix = playersMap[tpBall.bowler_id].bowlerSix > 0 ? playersMap[tpBall.bowler_id].bowlerSix - 1 : 0
              }
            }
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
          // }
        }
        if (b1.ballType == BALL_TYPE.WIDE && b1.ballIsWicket == false) {
            isWide = true;
            // let run = +matchType.valueOfWideBall || 0;
            // let run = +(c?.run ?? 0);
            let run = b1?.ballExtraRun ?? 0;
            // battingTeam["teamScore"] = (battingTeam.teamScore || 0) - run;
            battingTeam["teamScore"] = liveTeamScore;
            let previousBall = c.ball - 1;
            battingTeam.teamOver = `${c.over}.${previousBall}`
            battingTeam.crr = parseFloat(live_score_data?.runrate) ?? 0;
            battingTeam.rrr = parseFloat(live_score_data?.required_runrate) ?? 0;
            battingTeam.teamWideRuns = battingTeam.teamWideRuns > 0 ? battingTeam.teamWideRuns - run : 0;
            over.ballCount = over.ballCount > 0 ? over.ballCount - 1 : 0;
            over.totalRun = over.totalRun > 0 ? over.totalRun - run : 0;
            // over.teamScore = `${battingTeam?.teamScore || 0}/${battingTeam?.teamWicket || 0}`;
            over.teamScore = `${liveTeamScore}/${battingTeam?.teamWicket || 0}`;
            over.totalWideBall = over.totalWideBall > 0 ? over.totalWideBall - 1 : 0;
            over.totalWideRun = over.totalWideRun > 0 ? over.totalWideRun - run : 0;
            if (!playersMap[tpBall.bowler_id]) {
              playersMap[tpBall.bowler_id] = {
                ...playerTpIdObj[tpBall.bowler_id]
              }
            }
            if (!playersMap[tpBall.batsman_id]) {
              playersMap[tpBall.batsman_id] = {
                ...playerTpIdObj[tpBall.batsman_id]
              }
            }
            playersMap[tpBall.bowler_id].bowlerWideBall = playersMap[tpBall.bowler_id].bowlerWideBall > 0 ? playersMap[tpBall.bowler_id].bowlerWideBall - 1 : 0;
            playersMap[tpBall.bowler_id].bowlerWideBallRun = playersMap[tpBall.bowler_id].bowlerWideBallRun > 0 ? playersMap[tpBall.bowler_id].bowlerWideBallRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerRun = playersMap[tpBall.bowler_id].bowlerRun > 0 ? playersMap[tpBall.bowler_id].bowlerRun - run : 0;
            playersMap[tpBall.bowler_id].bowlerTotalBall = playersMap[tpBall.bowler_id].bowlerTotalBall > 0 ? playersMap[tpBall.bowler_id].bowlerTotalBall - 1 : 0;
            
            if (over.ballCount === 0) {
              deleteOverIds.push(over.overId);
            }
          }
      } 
       
    }
  }
  let plyArr = Object.values(playersMap);
  let overArr = Object.values(oversMap)
  let partnershipArr = Object.values(partnershipMap)
  if (deleteOverIds?.length > 0) {
    const remainingBallIds = global.tblCommentaryBallByBall
      .filter(item => deleteOverIds.includes(item.overId))
      .map(item => item.commentaryBallByBallId);
    for (const id of remainingBallIds) {
      if (!deleteBallByBallIds.includes(id)) {
        deleteBallByBallIds.push(id);
      }
    }
  }
  // const result = {
  //   commentaryId: comDetails.commentaryId,
  //   commentaryPlayers: plyArr,
  //   deleteBallByBallIds: deleteBallByBallIds,
  //   commentaryOvers: overArr,
  //   commentaryPartnership: partnershipArr,
  //   deleteOverIds: deleteOverIds,
  //   commentaryTeams: [battingTeam]
  // }
  // console.log("result", result)
  if(deleteBallByBallIds.length > 0 || deleteOverIds.length > 0){
    await syncEntitySportCommentaryService({
    commentaryId : comDetails.commentaryId,
    commentaryPlayers : plyArr,
    deleteBallByBallIds : deleteBallByBallIds,
    commentaryOvers : overArr,
    commentaryPartnership: partnershipArr,
    commentaryTeams : [battingTeam],
    deleteOverIds: deleteOverIds
    },fastify,request)
  
  }
  
  return true;
}
module.exports = {
    saveTeamsService,
    savePlayersService,
    saveCompetitionsService,
    saveCommentariesService,
    saveCountryCodesService,
    saveVenueService,
    setEntityComService,
    setEntityCom2Service,
    saveTournamentTeamPlayerService,
    handleStoreBall
}