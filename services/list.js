const { matchTypesEntity, matchStatusEntity, entityCompetition } = require("../utilities")
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
module.exports = {
    matchStatusDataService,
    matchTypeDataService,
    compStatusDataService,
    getUserListService,
}