const { setEventSnapQuery, getEventSnapByComQuery } = require("../repository/TableCompetitionEventSnap")

const setCompEventSnapSerice = async (data , request , fastify) =>{
    let setSnap = await setEventSnapQuery(data,request,fastify);
    return setSnap;
}
const getEventSnapByComService = async (request , fastify) =>{
    let getSnap = await getEventSnapByComQuery({
        commentaryId : request.body.commentaryId
    }, request,fastify);
    // console.log(getSnap)
    return getSnap || {};
}

const updateEventSnapByComService = async (request , fastify) =>{
    let com = global.tblCommentaries.find((com) => com.commentaryId === request.body.commentaryId);
    if(!com){
        throw new Error("Commentary with this id not found");
    }
    let data = [{
        commentaryId : request.body.commentaryId,
        eventRefId : com.eventRefId,
        competitionId :com.competitionId,
        eventTypeId : com.eventTypeId,
    }]
    let setSnap = await setEventSnapQuery(data,request,fastify);
    return "Eventsnap Updated successfully";
}
module.exports = {
    setCompEventSnapSerice,
    getEventSnapByComService,
    updateEventSnapByComService
}