const { clientSocketStatus } = require("../utilities");
const { errorLogger } = require("../utilities/logger");

const getAllEntitySocketsQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "entitySocketId",
                "wrServerName" as "serverName",
                "wrUrl" as "url",
                "wrStatus" as "status",
                "wrIsActive" as "isActive",
                "wrReconnectDelay" as "reconnectDelay",
                "wrReconnectAttempts" as "reconnectAttempts",
                "wrReconnectMaxDelay" as "reconnectMaxDelay",
                "wrReconnectCount" as "reconnectCount",
                "wrActionType" as "actionType",
                "wrConnectCount" as "connectCount"
            FROM "tblEntitySockets"
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableEntitySockets.js/getAllEntitySocketsQuery",
            null
        );
        throw new Error(err.message);
    }
};
const updateEntitySocketStatusQuery = async(data, fastify) =>{
   try {
    let additionalQuery = '';
    if(data.status == clientSocketStatus.disconnected){
        additionalQuery = `, "wrReconnectCount" = 0`
    }
    if(data.status == clientSocketStatus.connected){
        additionalQuery = `, "wrConnectCount" = "wrConnectCount" + 1`
    }
    let result = await fastify.db.query(` 
        UPDATE "tblEntitySockets"
        SET
            "wrStatus" = $1
            ${additionalQuery}
        WHERE "wrId" = ANY($2) AND "wrIsDeleted" = false
    `,
    {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
            data.status,
            data.entitySocketId
        ]
    })

    for (id of data.entitySocketId) {
        let index = global.tblEntitySockets.findIndex((c) => c.entitySocketId === id);
        global.tblEntitySockets[index].status = data.status;
        if(data.status == clientSocketStatus.disconnected){
            global.tblEntitySockets[index].reconnectCount = 0;
        }
        if(data.status == clientSocketStatus.connected){
            global.tblEntitySockets[index].connectCount = global.tblEntitySockets[index].connectCount + 1;
        }
    }
    return result;
   } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableClientSocket/updateClientSocketStatusQuery",
            null
        )
        throw new Error(error.message); 
   }
}
const updateReconnectCountQuery = async(data,fastify) =>{
    let result = await fastify.db.query(`
        UPDATE "tblEntitySockets"
        SET
            "wrReconnectCount" = $1
        WHERE "wrId" = $2 AND "wrIsDeleted" = false
    `,
    {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.reconnectCount,
            data.entitySocketId
        ]
    })

    let index = global.tblEntitySockets.findIndex((c) => c.entitySocketId === data.entitySocketId);
    global.tblEntitySockets[index].reconnectCount = data.reconnectCount;
    return result;
}
const disConnectEntitySocketQuery = async (fastify) => {
    try {
      const result = await fastify.db.query(`
        UPDATE "tblEntitySockets"
        SET
          "wrStatus" = $1,
          "wrReconnectCount" = $2
        WHERE "wrStatus" = $3 AND "wrIsActive" = $4 AND "wrIsDeleted" = false
        RETURNING "wrId" as "entitySocketId";
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientSocketStatus.disconnected, 0 , clientSocketStatus.connected, true]
      });
      for(let entitySocket of result){
        let index = global.tblEntitySockets.findIndex((c) => c.entitySocketId === entitySocket.entitySocketId);
        global.tblEntitySockets[index].status = clientSocketStatus.disconnected;
        global.tblEntitySockets[index].reconnectCount = 0;
     }

      return result;
    } catch (error) {
      throw error;
    }
};

module.exports = {
    getAllEntitySocketsQuery,
    updateEntitySocketStatusQuery,
    updateReconnectCountQuery,
    disConnectEntitySocketQuery,
};