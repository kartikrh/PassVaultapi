const { authorize, checkPermission } = require("../../../controller/middleware")
const { 
    getAllCommentaryAward,
    getCommentaryAwardById,
    saveCommentaryAward,
    deleteCommentaryAward,
    getCommentaries,
    getCommentaryTeam,
    getCommentaryPlayerByCom
 } = require("../../../controller/users/admin/commentaryAward")
const { CommentaryAward } = require("../../../swaggerSchema/groupTags/schema")

module.exports = async(fastify,opts) =>{
    fastify.post("/all",{
        schema : CommentaryAward.getAll.schema,
        preHandler : [
            (request , reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getAllCommentaryAward(request,reply,fastify)
    }),
    fastify.post("/byId",{
        schema : CommentaryAward.getById.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getCommentaryAwardById(request,reply,fastify)
    }),
    fastify.post("/save" , {
        schema : CommentaryAward.save.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : request.body.id === 0 ? "add" : "edit"
                })
        ],
        handler : (request,reply) => saveCommentaryAward(request,reply,fastify)
    }),
    fastify.post("/delete",{
        schema : CommentaryAward.delete.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "delete"
                })
        ],
        handler : (request,reply) => deleteCommentaryAward(request,reply,fastify)
    })
    fastify.post("/commentaryList", {
        schema : CommentaryAward.commentaryList.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getCommentaries(request,reply,fastify)
    })
    fastify.post("/comTeamList",{
        schema : CommentaryAward.comTeamList.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getCommentaryTeam(request,reply,fastify)
    })
    fastify.post("/comPlayerList",{
        schema : CommentaryAward.comPlayerList.schema,
        preHandler : [
            (request,reply) => authorize(request,reply,fastify),
            (request,reply) => 
                checkPermission(request,reply,fastify,{
                    tabName : "CommentaryAward",
                    mode : "view"
                })
        ],
        handler : (request,reply) => getCommentaryPlayerByCom(request,reply,fastify)
    })
}