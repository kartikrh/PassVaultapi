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
module.exports = {
    setCompEventSnapSerice,
    getEventSnapByComService
}