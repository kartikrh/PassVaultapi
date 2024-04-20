const { clientSocketStatus } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const getAllClientSocketQuery =async (fastify) =>{
    return await fastify.db.query(`
        SELECT 
            "wrId" as "clientSocketId",
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
        FROM "tblClientSockets"
    `,
    {
        type: fastify.db.QueryTypes.SELECT, 
    }) 
}
const updateClientSocketStatusQuery = async(data,fastify) =>{
    // if status is disconnected then set reconnect count to 0
    let additionalQuery = '';
    if(data.status == clientSocketStatus.disconnected){
        additionalQuery = `, "wrReconnectCount" = 0`
    }
    if(data.status == clientSocketStatus.connected){
        additionalQuery = `, "wrConnectCount" = "wrConnectCount" + 1`
    }
    let result = await fastify.db.query(` 
        UPDATE "tblClientSockets"
        SET
            "wrStatus" = $1
            ${additionalQuery}
        WHERE "wrId" = ANY($2)
    `,
    {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.status,
            data.clientSocketId
        ]
    })

    let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === data.clientSocketId[0]);
    global.tblClientSocket[index].status = data.status;
    data.status == clientSocketStatus.connected ? global.tblClientSocket[index].connectCount += 1 : null;
    data.status == clientSocketStatus.disconnected ? global.tblClientSocket[index].reconnectCount = 0 : null;
    return result;
}
const updateReconnectCountQuery = async(data,fastify) =>{
    let result = await fastify.db.query(`
        UPDATE "tblClientSockets"
        SET
            "wrReconnectCount" = $1
        WHERE "wrId" = $2
    `,
    {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.reconnectCount,
            data.clientSocketId
        ]
    })

    let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === data.clientSocketId);
    global.tblClientSocket[index].reconnectCount = data.reconnectCount;
    return result;
}
const createClientSocketQuery =async (data,request,fastify) =>{
    try {
        const query = `
            INSERT INTO "tblClientSockets"(
                "wrServerName",
                "wrUrl",
                "wrIsActive",
                "wrReconnectDelay",
                "wrReconnectAttempts",
                "wrReconnectMaxDelay"
            )
            VALUES( $1, $2, $3, $4, $5, $6)
            RETURNING 
            "wrId" as "clientSocketId"  , 
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
        `;
        const result = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.serverName,
                    data.url,
                    data.hasOwnProperty('isActive') ? data.isActive : false,
                    data.reconnectDelay,
                    data.reconnectAttempts,
                    data.reconnectMaxDelay
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/createClientSocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const updateClientSocketQuery = async(data,request,fastify) =>{
    try {
        const query = `
            UPDATE "tblClientSockets"
            SET
                "wrServerName" = $1,
                "wrIsActive" = $2,
                "wrReconnectDelay" = $3,
                "wrReconnectAttempts" = $4,
                "wrReconnectMaxDelay" = $5
            WHERE "wrId" = $6
            RETURNING "wrId" as "clientSocketId",
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
        `;
        const result = await  fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.serverName,
                    data.isActive,
                    data.reconnectDelay,
                    data.reconnectAttempts,
                    data.reconnectMaxDelay,
                    data.clientSocketId
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/updateClientSocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const deleteClientSocketQuery  = async(clientSocketId,request,fastify) =>{
    try {
        const query = `
            DELETE FROM "tblClientSockets"
            WHERE "wrId" = ANY($1)
        `;
        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    clientSocketId
                ]
            }
        )
        return data[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/deleteClientSocketQuery",
            request
        )
        throw new Error(err.message);
    }
}
const updateActionTypeQuery = async(data,request,fastify) =>{
    try {
        const query = `
            UPDATE "tblClientSockets"
            SET
                "wrActionType" = $1
            WHERE "wrId" = ANY($2)
        `;
        const result = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.actionType,
                    data.clientSocketId
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/updateActionTypeQuery",
            request
        )
        throw new Error(err.message);
    }
}
const updateActiveInactiveClientSocketQuery = async(request,fastify) =>{
    try {
        const query = `
            UPDATE "tblClientSockets"
            SET
                "wrIsActive" = $1
            WHERE "wrId" = $2
        `;
        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.body.isActive,
                    request.body.clientSocketId
                ]
            }
        )
        return data[0];
        
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/updateActiveInactiveClientSocketQuery",
            request
        )
        throw new Error(err.message);
    }
}
const disConnectClientSocketQuery = async (fastify) => {
    try {
      const result = await fastify.db.query(`
        UPDATE "tblClientSockets"
        SET
          "wrStatus" = $1,
          "wrReconnectCount" = $2
        WHERE "wrStatus" = $3 AND "wrIsActive" = $4
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientSocketStatus.disconnected, 0 , clientSocketStatus.connected, true]
      });
      return result;
    } catch (error) {
      throw error; // Re-throw the error to handle it at a higher level if needed
    }
};
  
module.exports = {
    getAllClientSocketQuery,
    createClientSocketQuery,
    updateClientSocketQuery,
    deleteClientSocketQuery,
    updateActionTypeQuery,
    updateActiveInactiveClientSocketQuery,
    updateClientSocketStatusQuery,
    updateReconnectCountQuery,
    disConnectClientSocketQuery
}
