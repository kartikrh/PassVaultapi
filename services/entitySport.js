const { getPlyByIdQuery } = require("../repository/TablePlayer")
const { getTeamsByIds } = require("../repository/TableTeams")
const { getCompetitionByIdsQuery } = require("../repository/TableCompitition")
const { getComEntityQuery } = require("../repository/TableCommentary")
const { getAllTournamentTeamPlayerByIdsQuery } = require("../repository/TableTournamentsTeamPlayers")
const { getMatchDataByCId } = require("../services/commentry");
const {
    callClientAPI,
    ServiceType,
    APIEndpointModuleType,
} = require("../utilities/index");


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
module.exports = {
    saveTeamsService,
    savePlayersService,
    saveCompetitionsService,
    saveCommentariesService
}