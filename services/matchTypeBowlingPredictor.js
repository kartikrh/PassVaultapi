const { getByMatchTypeQuery, saveQuery, updateQuery } = require("../repository/TableMatchTypeBowlingPredictor");

const getByMatchTypeService = async (request, fastify) => {
    const data = await getByMatchTypeQuery({
        matchTypeId: request.body.matchTypeId
    },request, fastify); 

    return data;
}
const saveMatchTypeDataService = async (request, fastify) => {
    const {matchTypeData} = request.body;
    const validateMt = global.tblMatchTypes.find((t)=> t.matchTypeId == matchTypeData[0].matchTypeId);
    if(!validateMt){
        throw new Error("Match Type with this id not found")
    }
    let cD = matchTypeData.filter((c)=>c.id == 0)
    let uD = matchTypeData.filter((c)=>c.id != 0)
    let upData1;
    let upData2;
    if(cD.length > 0){
        upData1 =await saveQuery(cD, request,fastify)
        global.tblMatchTypeBowlingTypePredictor.push(...upData1)
    }
    if(uD.length > 0){
        upData2 = await updateQuery(uD,request,fastify)
        for(let u of upData2){
            const index =  global.tblMatchTypeBowlingTypePredictor.findIndex((i)=> i.id == u.id)
            if(index != -1){
                global.tblMatchTypeBowlingTypePredictor[index] ={
                    ...global.tblMatchTypeBowlingTypePredictor[index],
                    ...u
                }
            }
        }
    }

   
    console.log(global.tblMatchTypeBowlingTypePredictor)
    return  "Match Type Data saved successfully."

}
module.exports = {
    getByMatchTypeService,
    saveMatchTypeDataService
};