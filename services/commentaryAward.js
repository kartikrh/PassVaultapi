const {  
    addCommentaryAwardQuery,
    updateCommentaryAwardQuery,
    deleteCommentaryAwardQuery,
    assignAwardQuery,
    deleteAwardsQuery
 } = require("../repository/TableCommentaryAward");

const getAllComAwardService = async (fastify) => {
    return global.tblCommentaryAwards || [];
}
const getComAwardByIdService = async (request, fastify) => {
    const {id} = request.body;
    return global.tblCommentaryAwards.find((item) => item.id === id) || null;
}
const saveComAwardService = async (request, fastify) => {
    const {id} = request.body;
    if(id === 0){
        return await createComAwardService(request, fastify);
    }else{
        return await updateComAwardService(request, fastify);
    }
}
const createComAwardService = async (request, fastify) => {
    const data = await addCommentaryAwardQuery({
        ...request.body
    }, request, fastify);
    global.tblCommentaryAwards.push(data);
    return data;
}
const updateComAwardService = async (request, fastify) => {
    const validateComAwardId = global.tblCommentaryAwards.find((item) => item.id === request.body.id);
    if(!validateComAwardId){
        throw new Error("CommentaryAward with this Id not found");
    }
    const body = {
        id: request.body.id,
        commentaryId: request.body.commentaryId || validateComAwardId.commentaryId,
        awardId: request.body.awardId || validateComAwardId.awardId,
        teamId: request.body.teamId || validateComAwardId.teamId,
        playerId: request.body.playerId || validateComAwardId.playerId
    }
    const data = await updateCommentaryAwardQuery(body, request, fastify);

    let index = global.tblCommentaryAwards.findIndex((item) => item.id === request.body.id);
    global.tblCommentaryAwards[index] = data;

    return data;
}
const deleteComAwardService = async (request, fastify) => {
    const {id} = request.body;
    await deleteCommentaryAwardQuery(request, fastify);
    global.tblCommentaryAwards = global.tblCommentaryAwards.filter((item) => !id.includes(item.id));
    return `CommentaryAward deleted successfully`;
}
const getCommentariesService = async (request, fastify) => {
    let result = global.tblCommentaries;
    const {eventTypeId , competitionId,status} = request.body;
    if(status) {
        result = global.tblCommentaries.filter((item) => item.commentaryStatus == status);
    }
    if(eventTypeId){
        result = global.tblCommentaries.filter((item) => item.eventTypeId === eventTypeId);
    }
    if(competitionId){
        result = global.tblCommentaries.filter((item) => item.competitionId === competitionId);
    }
    result.sort((a,b) => new Date(b.eventDate) - new Date(a.eventDate));
    result = result.map((item) => {
        return {
            commentaryId : item.commentaryId,
            eventDate : item.eventDate,
            eventTypeId : item.eventTypeId,
            competitionId : item.competitionId,
            eventName : item.eventName,
            commentaryStatus : item.commentaryStatus
        }
    })

    return result;
}
const getCommentaryTeamService = async (request, fastify) => {
    const {commentaryId} = request.body;
    let result = global.tblCommentaryTeams.filter((item) => item.commentaryId === commentaryId);
    result = result.map((item) => {
        return {
            commentaryId : item.commentaryId,
            teamId : item.teamId,
            teamName : item.teamName,
        }
    })

    return result;
}
const getCommentaryPlayerByComService = async (request, fastify) => {
    let {commentaryId , teamId} = request.body;
    let result = global.tblCommentaryPlayers.filter((item) => item.commentaryId === commentaryId);
    if(teamId){
        result = result.filter((item) => item.teamId === teamId);
    }
    result = result.map((item) => {
        return {
            commentaryId : item.commentaryId,
            teamId : item.teamId,
            playerId : item.playerId,
            playerName : item.playerName,
        }
    })
    return result;
}
const assignAwardService = async (request, fastify) => {
    const {comAwards} = request.body;
    for (let a of comAwards) {
        let comI = global.tblCommentaries.findIndex((item) => item.commentaryId === a.commentaryId);
        if(comI === -1){
            throw new Error("Commentary with this Id not found");
        }
        if(a.teamId){
            let teamI = global.tblTeams.findIndex((item) => item.teamId === a.teamId);
            if(teamI === -1){
                throw new Error("Team with this Id not found");
            }
        }
        if(a.playerId){
            let playerI = global.tblPlayers.findIndex((item) => item.playerId === a.playerId);
            if(playerI === -1){
                throw new Error("Player with this Id not found");
            }
        }
        const existingAwards = global.tblCommentaryAwards.filter(
            (elem) =>
              elem.commentaryId === a.commentaryId && elem.awardId === a.awardId
          );
        const awardIds = existingAwards.map((del) => del.id);
    
        if (awardIds.length > 0) {
          await deleteAwardsQuery(awardIds,request,fastify);
          global.tblCommentaryAwards = global.tblCommentaryAwards.filter(
            (el) => !awardIds.includes(el.id)
          );
        }
        }

    let addAward = await assignAwardQuery(comAwards, request, fastify);
    global.tblCommentaryAwards.push(...addAward); 
    return addAward;
}
const getAssignAwardService = async (request, fastify) => {
    let result = global.tblCommentaryAwards.filter((item) => item.commentaryId === request.body.commentaryId);
    return result;
}
module.exports = {
    getAllComAwardService,
    getComAwardByIdService,
    saveComAwardService,
    deleteComAwardService,
    getCommentariesService,
    getCommentaryTeamService,
    getCommentaryPlayerByComService,
    assignAwardService,
    getAssignAwardService
}