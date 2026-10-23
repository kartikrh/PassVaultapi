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
            "wrIsSend" as "isSend",
            "wrImagePath" as "imagePath",
            "wrIconPath" as "iconPath"
        FROM "tblNotifications"
        WHERE "wrIsDeleted" = false
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
            "wrIsSend",
            "wrImagePath",
            "wrIconPath"
        )
        VALUES(
        $1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10, $11, $12
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
        "wrIsSend" as "isSend",
        "wrImagePath" as "imagePath",
        "wrIconPath" as "iconPath"
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
            data.isSend || false,
            data.imagePath || null,
            data.iconPath || null,
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
                "wrIsSend" = $10,
                "wrImagePath" = $12,
                "wrIconPath" = $13
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
            "wrIsSend" as "isSend",
            "wrImagePath" as "imagePath",
            "wrIconPath" as "iconPath"
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
                data.notificationId,
                data.imagePath || null,
                data.iconPath || null,
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
            UPDATE "tblNotifications" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now() 
            WHERE "wrId" = ANY($3)
        `;
        const result = fastify.db.query(query,{
            bind : [true, request.userTokenInfo.WrUserId, request.body.notificationId]
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
  updateIsSendNotQuery,
}