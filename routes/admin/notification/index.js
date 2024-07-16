const { authorize, checkPermission } = require("../../../controller/middleware");
const { getAllNotification, getNotificationById, saveNotification, deleteNotification, getEventList } = require("../../../controller/users/admin/notification");
const { Notification } = require("../../../swaggerSchema/groupTags/schema");

module.exports = async (fastify,opts) =>{
    fastify.post("/all",{
        schema : Notification.getAll.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply,done) => 
                checkPermission(request,reply,fastify,{
                    tabName : "Notification",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getAllNotification(request,reply,fastify)
    })
    fastify.post("/eventList",{
        schema : Notification.getAll.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply,done) => 
                checkPermission(request,reply,fastify,{
                    tabName : "Notification",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getEventList(request,reply,fastify)
    })

    fastify.post("/byId", {
        schema : Notification.getById.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply,done) => 
                checkPermission(request,reply,fastify,{
                    tabName : "Notification",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getNotificationById(request,reply,fastify)
    })

    fastify.post("/save",{
        schema : Notification.save.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply,done) => 
                checkPermission(request,reply,fastify,{
                    tabName : "Notification",
                    mode : request.body.notificationId == 0 ? "add" : "edit"
                })
        ],
        handler : (request,reply) => saveNotification(request,reply,fastify)
    })
    fastify.post("/delete", {
        schema : Notification.delete.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply,done) => 
                checkPermission(request,reply,fastify,{
                    tabName : "Notification",
                    mode : "delete"
                })
        ],
        handler : (request,reply) => deleteNotification(request,reply,fastify)
    })
}