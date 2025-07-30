const { matchTypesEntity, matchStatusEntity, entityCompetition } = require("../utilities")

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
module.exports = {
    matchStatusDataService,
    matchTypeDataService,
    compStatusDataService
}