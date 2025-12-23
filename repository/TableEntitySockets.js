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
                "wrConnectCount" as "connectCount",
                "wrIsAutoUpdateCommentary" as "isAutoUpdateCommentary",
                "wrDefaultPlayerImage" as "defaultPlayerImage",
                "wrDefaultPlayerImagePath" as "defaultPlayerImagePath",
                "wrDefaultTeamImage" as "defaultTeamImage",
                "wrDefaultTeamImagePath" as "defaultTeamImagePath",
                "wrDefaultJerseyImage" as "defaultJerseyImage",
                "wrDefaultJerseyImagePath" as "defaultJerseyImagePath",
                "wrDefaultPlayerJerseyImage" as "defaultPlayerJerseyImage",
                "wrDefaultPlayerJerseyImagePath" as "defaultPlayerJerseyImagePath",
                "wrIsAutoScoreUpdate" as "isAutoScoreUpdate"
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
        if (index !== -1) {
            global.tblEntitySockets[index].status = data.status;
            if(data.status == clientSocketStatus.disconnected){
                global.tblEntitySockets[index].reconnectCount = 0;
            }
            if(data.status == clientSocketStatus.connected){
                global.tblEntitySockets[index].connectCount = (global.tblEntitySockets[index].connectCount || 0) + 1;
            }
        } else {
            console.log(`Warning: Entity socket ${id} not found in global.tblEntitySockets when updating status`);
        }
    }
    return result;
   } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB Error --> repository/TableEntitySockets/updateClientSocketStatusQuery",
            null
        )
        throw new Error(error.message); 
   }
}
const updateReconnectCountQuery = async(data, fastify) =>{
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

const createEntitySocketQuery =async (data, request, fastify) =>{
    try {
        const query = `
            INSERT INTO "tblEntitySockets"(
                "wrServerName",
                "wrUrl",
                "wrIsActive",
                "wrReconnectDelay",
                "wrReconnectAttempts",
                "wrReconnectMaxDelay",
                "wrIsAutoUpdateCommentary",
                "wrDefaultPlayerImage",
                "wrDefaultPlayerImagePath",
                "wrDefaultTeamImage",
                "wrDefaultTeamImagePath",
                "wrDefaultJerseyImage",
                "wrDefaultJerseyImagePath",
                "wrIsAutoScoreUpdate",
                "wrDefaultPlayerJerseyImage",
                "wrDefaultPlayerJerseyImagePath"
            )
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING 
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
                "wrConnectCount" as "connectCount",
                "wrIsAutoUpdateCommentary" as "isAutoUpdateCommentary",
                "wrDefaultPlayerImage" as "defaultPlayerImage",
                "wrDefaultPlayerImagePath" as "defaultPlayerImagePath",
                "wrDefaultTeamImage" as "defaultTeamImage",
                "wrDefaultTeamImagePath" as "defaultTeamImagePath",
                "wrDefaultJerseyImage" as "defaultJerseyImage",
                "wrDefaultJerseyImagePath" as "defaultJerseyImagePath",
                "wrDefaultPlayerJerseyImage" as "defaultPlayerJerseyImage",
                "wrDefaultPlayerJerseyImagePath" as "defaultPlayerJerseyImagePath",
                "wrIsAutoScoreUpdate" as "isAutoScoreUpdate"
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
                    data.isAutoUpdateCommentary ?? false,
                    data.defaultPlayerImage ?? null,
                    data.defaultPlayerImagePath ?? null,
                    data.defaultTeamImage ?? null,
                    data.defaultTeamImagePath ?? null,
                    data.defaultJerseyImage ?? null,
                    data.defaultJerseyImagePath ?? null,
                    data.isAutoScoreUpdate ?? false,
                    data.defaultPlayerJerseyImage ?? null,
                    data.defaultPlayerJerseyImagePath ?? null,
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/createEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const updateEntitySocketQuery = async(data, request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets"
            SET
                "wrServerName" = $1,
                "wrUrl" = $2,
                "wrIsActive" = $3,
                "wrReconnectDelay" = $4,
                "wrReconnectAttempts" = $5,
                "wrReconnectMaxDelay" = $6,
                "wrIsAutoUpdateCommentary" = $7,
                "wrDefaultPlayerImage" = $8,
                "wrDefaultPlayerImagePath" = $9,
                "wrDefaultTeamImage" = $10,
                "wrDefaultTeamImagePath" = $11,
                "wrDefaultJerseyImage" = $12,
                "wrDefaultJerseyImagePath" = $13,
                "wrIsAutoScoreUpdate" = $14,
                "wrDefaultPlayerJerseyImage" = $16,
                "wrDefaultPlayerJerseyImagePath" = $17
            WHERE "wrId" = $15
            RETURNING 
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
                "wrConnectCount" as "connectCount",
                "wrIsAutoUpdateCommentary" as "isAutoUpdateCommentary",
                "wrDefaultPlayerImage" as "defaultPlayerImage",
                "wrDefaultPlayerImagePath" as "defaultPlayerImagePath",
                "wrDefaultTeamImage" as "defaultTeamImage",
                "wrDefaultTeamImagePath" as "defaultTeamImagePath",
                "wrDefaultJerseyImage" as "defaultJerseyImage",
                "wrDefaultJerseyImagePath" as "defaultJerseyImagePath",
                "wrDefaultPlayerJerseyImage" as "defaultPlayerJerseyImage",
                "wrDefaultPlayerJerseyImagePath" as "defaultPlayerJerseyImagePath",
                "wrIsAutoScoreUpdate" as "isAutoScoreUpdate"
        `;
        const result = await  fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.serverName,
                    data.url,
                    data.isActive,
                    data.reconnectDelay,
                    data.reconnectAttempts,
                    data.reconnectMaxDelay,
                    data.isAutoUpdateCommentary,
                    data.defaultPlayerImage,
                    data.defaultPlayerImagePath,
                    data.defaultTeamImage,
                    data.defaultTeamImagePath,
                    data.defaultJerseyImage,
                    data.defaultJerseyImagePath,
                    data.isAutoScoreUpdate,
                    data.entitySocketId,
                    data.defaultPlayerJerseyImage,
                    data.defaultPlayerJerseyImagePath,
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/updateEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const deleteEntitySocketQuery  = async(entitySocketId, request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets" SET
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
                    entitySocketId
                ]
            }
        )
        return data[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/deleteEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const updateEntityActionTypeQuery = async(data, request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets"
            SET
                "wrActionType" = $1
            WHERE "wrId" = ANY($2)
        `;
        const result = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.actionType,
                    data.entitySocketId
                ]
            }
        )
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/updateEntityActionTypeQuery",
            request
        )
        throw new Error(err.message);
    }
}
const updateActiveInactiveEntitySocketQuery = async(request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets"
            SET
                "wrIsActive" = $1
            WHERE "wrId" = $2
        `;
        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.body.isActive,
                    request.body.entitySocketId
                ]
            }
        )
        return data[0];
        
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/updateActiveInactiveEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const isAutoScoreUpdateEntitySocketQuery = async(request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets" SET
                "wrIsAutoScoreUpdate" = $1
            WHERE "wrId" = $2`;

        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.body.isAutoScoreUpdate,
                    request.body.entitySocketId
                ]
            }
        )
        return data[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/isAutoScoreUpdateEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

const isAutoUpdateCommentaryEntitySocketQuery = async(request, fastify) =>{
    try {
        const query = `
            UPDATE "tblEntitySockets" SET
                "wrIsAutoUpdateCommentary" = $1
            WHERE "wrId" = $2`;

        const data = await fastify.db.query(query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.body.isAutoUpdateCommentary,
                    request.body.entitySocketId
                ]
            }
        )
        return data[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB Error --> repository/TableEntitySockets/isAutoUpdateCommentaryEntitySocketQuery",
            request
        )
        throw new Error(err.message);
    }
}

module.exports = {
    getAllEntitySocketsQuery,
    updateEntitySocketStatusQuery,
    updateReconnectCountQuery,
    disConnectEntitySocketQuery,
    createEntitySocketQuery,
    updateEntitySocketQuery,
    deleteEntitySocketQuery,
    updateEntityActionTypeQuery,
    updateActiveInactiveEntitySocketQuery,
    isAutoScoreUpdateEntitySocketQuery,
    isAutoUpdateCommentaryEntitySocketQuery,
};