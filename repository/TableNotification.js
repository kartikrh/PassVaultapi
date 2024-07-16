const { errorLogger } = require("../utilities/logger");

const getAllNotificationQuery = (fastify) =>{
    const query = `
        SELECT
            "wrId" as "notificationId",
            "wrTitle" as "title",
            "wrDescription" as "description",
            "wrSendType" as "sendType",
            "wrCommentaryId" as "commentaryId",
            "wrUrl" as "url",
            "wrImage" as "image",
            "wrIcon" as "icon",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifyAt" as "modifyAt",
            "wrModifyBy" as "modifyBy"
        FROM "tblNotifications"
    `;

    const result = fastify.db.query(query,{
        type : fastify.db.QueryTypes.SELECT
    });

    return result;
}
const insertNotificationQuery =async (data,request , fastify) =>{
   try {
        let query  = `
        INSERT INTO "tblNotifications"(
            "wrTitle",
            "wrDescription",
            "wrCommentaryId",
            "wrSendType",
            "wrCreatedBy",
            "wrCreatedAt",
            "wrImage",
            "wrIcon",
            "wrUrl"
        )
        VALUES(
        $1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9
        )
        RETURNING "wrId" as "notificationId",
        "wrTitle" as "title",
        "wrDescription" as "description",
        "wrSendType" as "sendType",
        "wrCommentaryId" as "commentaryId",
        "wrCreatedAt" as "createdAt",
        "wrCreatedBy" as "createdBy",
        "wrModifyAt" as "modifyAt",
        "wrModifyBy" as "modifyBy",
        "wrImage" as "image",
        "wrIcon" as "icon",
        "wrUrl" as "url"
    `;

    const result =await fastify.db.query(query,{
        bind : [
            data.title,
            data.description,
            data.commentaryId,
            data.sendType,
            data.userId,
            new Date(),
            data.image || null,
            data.icon || null,
            data.url || null
        ]
    });

    return result[0];
   } catch (error) {
    errorLogger(
        fastify,
        error.message,
        "repository/TableNotification/insertNotificationQuery",
        request
    )
    throw new Error(error.message);
   }
}
const updateNotificationQuery =async (data,request , fastify) =>{
    try {
        const query = `
            UPDATE "tblNotifications"
            SET
                "wrTitle" = $1,
                "wrDescription" = $2,
                "wrCommentaryId" = $3,
                "wrSendType" = $4,
                "wrModifyBy" = $5,
                "wrModifyAt" = $6,
                "wrImage" = $7,
                "wrIcon" = $8,
                "wrUrl" = $9
            WHERE "wrId" = $10
            RETURNING "wrId" as "notificationId",
            "wrTitle" as "title",
            "wrDescription" as "description",
            "wrSendType" as "sendType",
            "wrCommentaryId" as "commentaryId",
            "wrCreatedAt" as "createdAt",
            "wrCreatedBy" as "createdBy",
            "wrModifyAt" as "modifyAt",
            "wrModifyBy" as "modifyBy",
            "wrImage" as "image",
            "wrIcon" as "icon",
            "wrUrl" as "url"
        `;

        const result = await fastify.db.query(query,{
            bind : [
                data.title,
                data.description,
                data.commentaryId,
                data.sendType,
                data.userId,
                new Date(),
                data.image || null,
                data.icon || null,
                data.url || null,
                data.notificationId
            ]
        });
        return result[0]

    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "repository/TableNotification/updateNotificationQuery",
            request
        )
        throw new Error(error.message);
    }
}
const deleteNotificationQuery = (request , fastify) =>{
    try {
        let query = `
            DELETE FROM "tblNotifications"
            WHERE "wrId" = ANY($1)
        `;
        const result = fastify.db.query(query,{
            bind : [request.body.notificationId]
        });
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "repository/TableNotification/deleteNotificationQuery",
            request
        )
        throw new Error(error.message);
    }
}  
const saveNotificationLogsQuery = (data,request,fastify) =>{
    try {
        const query = `INSERT INTO "tblNotificationLogs" ("wrNotificationId", "wrClientId", "wrIsRead")
        SELECT $1, "wrClientID", $2 
        FROM "tblClient";`

        const result = fastify.db.query(query,{
            bind : [
                data.notificationId,
                false
            ]
        });

        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "repository/TableNotification/saveNotificationLogsQuery",
            request
        )
        throw new Error(error.message);
    }
}
const getNotificationLogByClientQuery = async (data , request , fastify)=>{
    try {
        const query = `
            SELECT
                "wrNotificationId" as "notificationId",
                "wrClientId" as "clientId",
                "wrIsRead" as "isRead",
                tn."wrId" as "notificationId",
                tn."wrTitle" as "title",
                tn."wrDescription" as "description",
                tn."wrSendType" as "sendType",
                tn."wrCommentaryId" as "commentaryId",
                tn."wrUrl" as "url",
                tn."wrImage" as "image",
                tn."wrIcon" as "icon"
            FROM "tblNotificationLogs"
            LEFT JOIN "tblNotifications" tn ON tn."wrId" = "tblNotificationLogs"."wrNotificationId"
            WHERE "tblNotificationLogs"."wrClientId" = $1;
        `;

        const result = await fastify.db.query(query,{
            bind : [data.clientId]
        });

        return result;

    } catch (error) {
        errorLogger(
            fastify ,
            error.message,
            "repository/TableNotification/getNotificationLogByClientQuery",
            request
        )
        throw new Error(error.message);
    }
}
module.exports = {
    getAllNotificationQuery,
    updateNotificationQuery,
    insertNotificationQuery,
    deleteNotificationQuery,
    saveNotificationLogsQuery,
    getNotificationLogByClientQuery
}