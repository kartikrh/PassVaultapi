const { createMarketTemplateRunnerQuery, updateMarketTemplateRunnerQuery, deleteMarketTemplateRunnerQuery } = require("../repository/TableMarketTemplateRunner");

const getAllMarketTemplateRunnerService = async (fastify) => {
    return global.tblMarketTemplateRunners || [];
}
const getRunnerByTemplateIdService = async (request, fastify) => {
    const {marketTemplateId} = request.body;
    const result = global.tblMarketTemplateRunners.filter(
        (item) => item.marketTemplateId === marketTemplateId
    ).sort((a, b) => a.marketTemplateRunnerId - b.marketTemplateRunnerId);    
    return result || [];
}
const getRunnerByIdService = async (request, fastify) => {
    const {marketTemplateRunnerId} = request.body;
    const result = global.tblMarketTemplateRunners.find(
        (item) => item.marketTemplateRunnerId === marketTemplateRunnerId
    );
    return result || {};
}
const saveMarketTemplateRunnerService = async (request, fastify) => {
    const {marketTemplateRunnerId} = request.body;
    if(marketTemplateRunnerId == 0){
        return await createMarketTemplateRunnerService(request, fastify);
    }
    else{
        return await updateMarketTemplateRunnerService(request, fastify);
    }
}
const createMarketTemplateRunnerService = async (request, fastify) => {
    const {marketTemplateId} = request.body;
    // validate marketTemplateId
    const index = global.tblMarketTemplate.findIndex(
        (item) => item.marketTemplateId === marketTemplateId
    );
    if(index === -1){
        throw new Error("MarketTemplate with this id not found");
    }

    const result = await createMarketTemplateRunnerQuery(request, fastify);
    global.tblMarketTemplateRunners.push(result);

    return result;
}
const updateMarketTemplateRunnerService = async (request, fastify) => {
    //validate marketTemplateRunnerId
    const {marketTemplateRunnerId,marketTemplateId} = request.body;
    const index = global.tblMarketTemplateRunners.findIndex(
        (item) => item.marketTemplateRunnerId === marketTemplateRunnerId
    );
    if(index === -1){
        throw new Error("MarketTemplateRunner with this id not found");
    }
    //validate marketTemplateId
    const marketTemplate = global.tblMarketTemplate.findIndex(
        (item) => item.marketTemplateId === marketTemplateId
    );
    if(marketTemplate === -1){
        throw new Error("MarketTemplate with this id not found");
    }

    const result = await updateMarketTemplateRunnerQuery(request, fastify);
    global.tblMarketTemplateRunners[index] = result;

    return result;
}
const deleteMarketTemplateRunnerService = async (request, fastify) => {
    const {marketTemplateRunnerId} = request.body;

    await deleteMarketTemplateRunnerQuery(request, fastify);
    global.tblMarketTemplateRunners = global.tblMarketTemplateRunners.filter(
        (item) => !marketTemplateRunnerId.includes(item.marketTemplateRunnerId)
    );


    return `MarketTemplate Runner(s) deleted successfully`;
}
module.exports = {
    saveMarketTemplateRunnerService,
    getAllMarketTemplateRunnerService,
    getRunnerByTemplateIdService,
    getRunnerByIdService,
    deleteMarketTemplateRunnerService
}