const { matchTypesEntity, matchStatusEntity } = require("../utilities")

const matchStatusDataService = async (request) =>{
    let matchType = matchStatusEntity;
    return matchType;
}
const matchTypeDataService = async (request) =>{
    let matchType = matchTypesEntity;
    return matchType; 
}
module.exports = {
    matchStatusDataService,
    matchTypeDataService
}