const { errorLogger } = require("../utilities/logger");

const createDataQuery = async (data  , fastify)=>{
    try {
        console.log("entiy data log data", data)
        let result = await fastify.db.query(`
                INSERT INTO public."tblEntityDataLogs"(
                 "wrData", "wrMatchId")
                VALUES ($1,$2);
            `,{
                 type: fastify.db.QueryTypes.SELECT,
                 bind : [
                    data.data,
                    data.matchId
                 ]
            })
        return result;
    } catch (err) {
         errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableEntotyData.js/createDataQuery",
            null
        );
        throw new Error(err.message);
    }
}

module.exports = {
    createDataQuery
}