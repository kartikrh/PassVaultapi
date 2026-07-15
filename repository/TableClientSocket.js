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
            "wrIsUpdateView" as "isUpdateView",
            "wrUpdateInterval" as "updateInterval",
            "wrConnectCount" as "connectCount"
        FROM "tblClientSockets"
        WHERE "wrIsDeleted" = false
    `,
    {
        type: fastify.db.QueryTypes.SELECT, 
    }) 
}
const updateClientSocketStatusQuery = async(data,fastify) =>{
    // if status is disconnected then set reconnect count to 0
   try {
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
        WHERE "wrId" = ANY($2) AND "wrIsDeleted" = false
    `,
    {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
            data.status,
            data.clientSocketId
        ]
    })

    for (const id of data.clientSocketId) {
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === id);
        if (index !== -1) {
            global.tblClientSocket[index].status = data.status;
            if(data.status == clientSocketStatus.disconnected){
                global.tblClientSocket[index].reconnectCount = 0;
            }
            if(data.status == clientSocketStatus.connected){
                global.tblClientSocket[index].connectCount = (global.tblClientSocket[index].connectCount || 0) + 1;
            }
        } else {
            console.log(`Warning: Client socket ${id} not found in global.tblClientSocket when updating status`);
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

const updateReconnectCountQuery = async (data, fastify) => {
    try {
        let result = await fastify.db.query(`
                UPDATE "tblClientSockets"
                SET
                    "wrReconnectCount" = $1
                WHERE "wrId" = $2 AND "wrIsDeleted" = false
            `,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.reconnectCount,
                    data.clientSocketId
                ]
            })

        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === data.clientSocketId);
        if (index !== -1) {
            global.tblClientSocket[index].reconnectCount = data.reconnectCount;
        } else {
            console.log(`Warning: Client socket ${data.clientSocketId} not found in global.tblClientSocket when updating reconnect count`);
        }
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableClientSockets.js/updateReconnectCountQuery",
            null
        );
        throw new Error(error.message);
    }
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
                "wrReconnectMaxDelay",
                "wrIsUpdateView",
                "wrUpdateInterval"
            )
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8)
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
            "wrConnectCount" as "connectCount",
            "wrIsUpdateView" as "isUpdateView",
            "wrUpdateInterval" as "updateInterval"
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
                    data.reconnectMaxDelay,
                    data.isUpdateView ?? false,
                    data.hasOwnProperty('updateInterval') ? data.updateInterval : false,
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
                "wrReconnectMaxDelay" = $5,
                "wrIsUpdateView" = $7,
                "wrUpdateInterval" = $8
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
            "wrConnectCount" as "connectCount",
            "wrIsUpdateView" as "isUpdateView",
            "wrUpdateInterval" as "updateInterval"
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
                    data.clientSocketId,
                    data.isUpdateView,
                    data.updateInterval,
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
            UPDATE "tblClientSockets" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrId" = ANY($3)
        `;
        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    true, 
                    request.userTokenInfo.WrUserId, 
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
const changeIsUpdateViewClientSocketQuery = async(data, request, fastify) => {
    try {
        const query = `
            UPDATE "tblClientSockets"
            SET
                "wrIsUpdateView" = $1
            WHERE "wrId" = $2
        `;
        const result = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.isUpdateView,
                    data.clientSocketId
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSocket/changeIsUpdateViewClientSocketQuery",
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
        WHERE "wrStatus" = $3 AND "wrIsActive" = $4 AND "wrIsDeleted" = false
        RETURNING "wrId" as "clientSocketId";
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [clientSocketStatus.disconnected, 0 , clientSocketStatus.connected, true]
      });
      for(let clientSocketId of result){
        let index = global.tblClientSocket.findIndex((c) => c.clientSocketId === clientSocketId.clientSocketId);
        global.tblClientSocket[index].status = clientSocketStatus.disconnected;
        global.tblClientSocket[index].reconnectCount = 0;
     }

      return result;
    } catch (error) {
      throw error; // Re-throw the error to handle it at a higher level if needed
    }
};

const resetAllClientSocketReconnectCountQuery = async (request, fastify) => {
    try {
        const result = await fastify.db.query(`
            UPDATE "tblClientSockets"
            SET
              "wrReconnectCount" = $1
            WHERE "wrIsActive" = $2 AND "wrIsDeleted" = $3
            RETURNING "wrId" as "clientSocketId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [0, true, false]
            });
        return result;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableClientSockets.js/resetClientSocketReconnectCountQuery",
            request
        )
        throw new Error(err.message);
    }
}

const disconnectAllClientSocketQuery = async (request, fastify) => {
    try {
        const result = await fastify.db.query(`
            UPDATE "tblClientSockets"
            SET
              "wrStatus" = $1
            WHERE "wrIsActive" = $2 AND "wrIsDeleted" = $3
            RETURNING "wrId" as "clientSocketId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [clientSocketStatus.disconnected, true, false]
            });
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableClientSockets.js/disconnectAllClientSocketQuery",
            request
        )
        throw new Error(error.message);
    }
}
  
module.exports = {
    getAllClientSocketQuery,
    createClientSocketQuery,
    updateClientSocketQuery,
    deleteClientSocketQuery,
    updateActionTypeQuery,
    updateActiveInactiveClientSocketQuery,
    updateClientSocketStatusQuery,
    updateReconnectCountQuery,
    disConnectClientSocketQuery,
    changeIsUpdateViewClientSocketQuery,
    resetAllClientSocketReconnectCountQuery,
    disconnectAllClientSocketQuery
}
