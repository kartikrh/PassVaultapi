const setCompEventSnapSerice = async (data , request , fastify) =>{
    try {
        // console.log(data)
        let result = await fastify.db.query(
            `CALL set_compEventSnap_proc($1,$2)`,
            {
                type : fastify.db.QueryTypes.SELECT,
                bind : [
                    data , null
                ]
            }
        )
        // console.log(result[0].compeventsnap_array)
        return result[0].compeventsnap_array;
    } catch (error) {
        throw new Error(error)
        console.log(error)
    }
}
module.exports = {
    setCompEventSnapSerice
}