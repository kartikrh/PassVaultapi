const { getPlyByIdQuery } = require("../repository/TablePlayer")
const { getTeamsByIds } = require("../repository/TableTeams")

const saveTeamsService = async (request , fastify)=>{
    // get the team by id
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
module.exports = {
    saveTeamsService,
    savePlayersService
}