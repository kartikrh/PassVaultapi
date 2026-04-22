const { matchTypesEntity, matchStatusEntity, entityCompetition, commentaryStatus } = require("../utilities")
const { getUserListQuery } = require("../repository/TableUser");

const matchStatusDataService = async (request) =>{
    let matchType = matchStatusEntity;
    return matchType;
}
const matchTypeDataService = async (request) =>{
    let matchType = matchTypesEntity;
    return matchType; 
}
const compStatusDataService = async (request)=>{
    let comp = entityCompetition;
    return comp;
}
const getUserListService = async (request, fastify)=>{
    let result = await getUserListQuery(request, fastify);
    return result;
}
const getCommentaryListService = async (request, fastify) => {
    let result = global.tblCommentaries.filter(item =>
        ![commentaryStatus.COMPLETED, commentaryStatus.CANCELLED, commentaryStatus.ABANDONED].includes(item.commentaryStatus)
    ).map(item => {
        return {
            commentaryId: item.commentaryId,
            eventName: item.eventName,
            eventRefId: item.eventRefId,
            eventDate: item.eventDate,
        };
    });
    return result;
}
module.exports = {
    matchStatusDataService,
    matchTypeDataService,
    compStatusDataService,
    getUserListService,
    getCommentaryListService,
}