const { setEventSnapQuery } = require("../repository/TableCompetitionEventSnap")

const setCompEventSnapSerice = async (data , request , fastify) =>{
    let setSnap = await setEventSnapQuery(data,request,fastify);
    return setSnap;
}
module.exports = {
    setCompEventSnapSerice
}