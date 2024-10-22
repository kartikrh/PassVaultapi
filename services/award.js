const { addAwardQuery, updateAwardQuery, deleteAwardQuery, activeInactiveAwardQuery, updateDisplayOrder } = require("../repository/TableAward");

const getAllAwardService = async (request, fastify) => {
    const {isActive} = request.body;
    if(isActive == undefined){
        return global.tblAwards;
    }
    return global.tblAwards.filter((item) => item.isActive === isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
const getAwardByIdService = async (request, fastify) => {
    const {id} = request.body;
    return global.tblAwards.find((item) => item.id === id) || null;
}
const saveAwardService = async (request, fastify) => {
    const {id} = request.body;
    if(id === 0){
        return await createAwardService(request, fastify);
    }else{
        return await updateAwardService(request, fastify);
    }
}
const createAwardService = async (request, fastify) => {
    const data = await addAwardQuery({
        ...request.body
    }, request, fastify);
    global.tblAwards.push(data);
    return data;
}
const updateAwardService = async (request, fastify) => {
    const validateAwardId = global.tblAwards.find((item) => item.id === request.body.id);
    if(!validateAwardId){
        throw new Error("Award with this Id not found");
    }
    const body = {
        id: request.body.id,
        name: request.body.name || validateAwardId.name,
        isShowOnSummary: request.body.isShowOnSummary || validateAwardId.isShowOnSummary,
        isActive: request.body.isActive || validateAwardId.isActive
    }
    const data = await updateAwardQuery(body, request, fastify);

    let index = global.tblAwards.findIndex((item) => item.id === request.body.id);
    global.tblAwards[index] = data;

    return data;
}

const deleteAwardService = async (request, fastify) => {
    const {id} = request.body;
    await deleteAwardQuery(request, fastify);
    global.tblAwards = global.tblAwards.filter((item) => !id.includes(item.id));
    return `Award deleted successfully`;
}
const activeInactiveAwardService = async (request, fastify) => {
    const {id, isActive} = request.body;
    let index = global.tblAwards.findIndex((item) => item.id === id);
    if(index === -1){
        throw new Error("Award with this Id not found");
    }
    await activeInactiveAwardQuery(request, fastify);
    global.tblAwards[index].isActive = isActive;
    return `Award Updated successfully`;
}
const updateDisplayOrderService = async (request, fastify) => {
    let {award} = request.body;
    for (let aw of award) {
        let index = global.tblAwards.findIndex((item) => item.id === aw.id);
        if(index === -1){
            throw new Error("Award with this Id not found");
        }
        await updateDisplayOrder(aw,request, fastify);
        global.tblAwards[index].displayOrder = aw.displayOrder;
    }
    return `Display order updated successfully`;
}
module.exports = {
    getAllAwardService,
    getAwardByIdService,
    saveAwardService,
    deleteAwardService,
    activeInactiveAwardService,
    updateDisplayOrderService
}