const {  getPagination, pageLimit } = require("../utilities");
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
            "wrModifyBy" as "modifyBy",
            "wrIsSend" as "isSend"
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
            "wrUrl",
            "wrIsSend"
        )
        VALUES(
        $1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10
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
        "wrUrl" as "url",
        "wrIsSend" as "isSend"
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
            data.url || null,
            data.isSend || false
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
                "wrUrl" = $9,
                "wrIsSend" = $10
            WHERE "wrId" = $11
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
            "wrUrl" as "url",
            "wrIsSend" as "isSend"
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
                data.isSend,
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
        const {skip , take} = getPagination(data.page , pageLimit.notifcationLog.limit);
        const query = `   
            SELECT 
                tn."wrId" as "notificationId",
                tn."wrId" as "notificationId",
                tn."wrTitle" as "title",
                tn."wrDescription" as "description",
                tn."wrSendType" as "sendType",
                tn."wrCommentaryId" as "commentaryId",
                tn."wrUrl" as "url",
                tn."wrImage" as "image",
                tn."wrIcon" as "icon",
                CASE 
                    WHEN tnl."wrNotificationId" IS NOT NULL THEN true 
                    ELSE false 
                END as "isRead",
                COUNT(CASE WHEN tnl."wrNotificationId" IS NULL THEN 1 END) OVER () as "unreadCount"
            FROM 
                "tblNotifications" tn 
            LEFT JOIN 
                "tblNotificationLogs" tnl 
            ON 
                tnl."wrNotificationId" = tn."wrId"
                AND tnl."wrClientId" = $1
            WHERE 
                tn."wrIsSend" = true
            ORDER BY 
                tn."wrCreatedAt" DESC
            offset $2 limit $3	
        `;

        const result = await fastify.db.query(query,{
            bind : [data.clientId, skip , take],
            type : fastify.db.QueryTypes.SELECT
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
const updateNotificationLogByClientQuery = async (data,request,fastify) =>{
    try {
        // const query = `
        //     INSERT MANY INTO "tblNotificationLogs" ("wrNotificationId", "wrClientId", "wrIsRead")
        //     VALUES ($1 , $2 , $3)
        // `;
        // const result = await fastify.db.query(query,{
        //     bind : [
        //         data.clientId,
        //         data.notificationId
        //     ],
        //     type : fastify.db.QueryTypes.UPDATE
        // });
        // return result;
        //notification id is arr of ids add entries for all ids against this client
        const query = `INSERT INTO "tblNotificationLogs" ("wrNotificationId", "wrClientId", "wrIsRead")
        SELECT "wrNotificationId", $1, $2
        FROM unnest($3::int[]) as "wrNotificationId";`

        const result = fastify.db.query(query,{
            bind : [
                data.clientId,
                true,
                data.notificationId
            ]
        });

        return result;

    } catch (error) {
        errorLogger(
            fastify ,
            error.message,
            "repository/TableNotification/updateNotificationLogByClientQuery",
            request
        )
        throw new Error(error.message);
    }
}
const updateIsSendNotQuery = async (data,request,fastify) =>{
    try {
        const query = `
            UPDATE "tblNotifications"
            SET
                "wrIsSend" = $1
            WHERE "wrId" = $2
        `;

        const result = fastify.db.query(query,{
            bind : [
                data.isSend,
                data.notificationId
            ],
            type : fastify.db.QueryTypes.UPDATE
        });
        return result;
    }catch(err){
        errorLogger(
            fastify,
            err.message,
            "repository/TableNotification/updateIsSendNotQuery",
            request
        )
        throw new Error(err.message);
    }	
}
module.exports = {
    getAllNotificationQuery,
    updateNotificationQuery,
    insertNotificationQuery,
    deleteNotificationQuery,
    saveNotificationLogsQuery,
    getNotificationLogByClientQuery,
    updateNotificationLogByClientQuery,
    updateIsSendNotQuery
}