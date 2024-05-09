const getAllAPIEndPoint = async (fastify) =>{
    return await fastify.db.query(
        `select 
                "wrId" as "apiEndPointId",
                "wrServiceType" as "serviceType",
                "wrEndpoint" as "endPoint",
                "wrModuleType" as "moduleType",
                "wrTimeOut" as "timeOut",
                "wrIsActive" as "isActive"
            from "tblAPIEndpoints"
            `,
        {
          type: fastify.db.QueryTypes.SELECT,
        }
      );
}

module.exports = {
    getAllAPIEndPoint
}