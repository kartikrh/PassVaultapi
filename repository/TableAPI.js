const getAllAPI = async (fastify) => {
    return await fastify.db.query(
        `select 
                "wrId" as "apiId",
                "wrType" as "type",
                "wrApi" as "api",
                "wrIsActive" as "isActive"
            from "tblAPIs"
            `,
        {
          type: fastify.db.QueryTypes.SELECT,
        }
      );
}
module.exports = {
    getAllAPI
}