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
            "wrActionType" as "actionType"
        FROM "tblClientSockets"
    `,
    {
        type: fastify.db.QueryTypes.SELECT, 
    }) 
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
            "wrActionType" as "actionType"
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
            "wrActionType" as "actionType"
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
const updateActionTypeQuery = async(request,fastify) =>{
    try {
        const query = `
            UPDATE "tblClientSockets"
            SET
                "wrActionType" = $1
            WHERE "wrId" = ANY($2)
        `;
        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.actionType,
                    request.clientSocketId
                ]
            }
        )
        return data[0];
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
module.exports = {
    getAllClientSocketQuery,
    createClientSocketQuery,
    updateClientSocketQuery,
    deleteClientSocketQuery,
    updateActionTypeQuery,
    updateActiveInactiveClientSocketQuery
}
