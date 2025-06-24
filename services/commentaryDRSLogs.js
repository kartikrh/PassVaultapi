const {
    commentaryDRSLogByIdQuery,
    insertCommentaryDRSLogsQuery,
    updateCommentaryDRSLogsQuery,
    commentaryDRSLogByCommQuery,
} = require("../repository/TableCommentaryDRSLogs");
const {
    updateCommentaryTeamDrsAttemptsAndFailQuery,
    updateCommentaryTeamDrsAttemptsQuery,
    getCommentaryTeamsDRSQuery,
} = require("../repository/TableCommentary");

const createCommDrsLogService = async(request, fastify) => {
    const body = request.body
    let isCount = body.isCount || false;
    const commentaryTeamData = await getCommentaryTeamsDRSQuery(body, fastify);
    if( commentaryTeamData && 
        commentaryTeamData.drsCount > 0
    ) {
        await insertCommentaryDRSLogsQuery(body, fastify, request);
        if(request.body.result !== undefined){
            if(request.body.result === true){
                let drsCount = commentaryTeamData.drsCount;
                if(isCount == true){
                    drsCount = (commentaryTeamData.drsCount || 0) - 1;
                }
                const attemptData = await updateCommentaryTeamDrsAttemptsQuery({
                    drsAttempt: commentaryTeamData.drsAttempt + 1,
                    drsCount: drsCount,
                    commentaryTeamId: body.commentaryTeamId,
                    teamId: body.teamId,
                    commentaryId: body.commentaryId
                }, fastify);
                const index = global.tblCommentaryTeams.findIndex(
                    (item) => item.commentaryTeamId === attemptData.commentaryTeamId
                )
                if(index !== -1){
                    global.tblCommentaryTeams[index] = {
                        ...global.tblCommentaryTeams[index],
                        ...attemptData
                    }
                }
            } else {
                let drsCount = commentaryTeamData.drsCount;
                if(isCount == true){
                    drsCount = (commentaryTeamData.drsCount || 0) - 1;
                }
                const drsData = await updateCommentaryTeamDrsAttemptsAndFailQuery({
                    drsAttempt: commentaryTeamData.drsAttempt + 1,
                    drsFail: commentaryTeamData.drsFail + 1,
                    drsCount: drsCount,
                    commentaryTeamId: body.commentaryTeamId,
                    teamId: body.teamId,
                    commentaryId: body.commentaryId
                }, fastify);
                const index2 = global.tblCommentaryTeams.findIndex(
                    (item) => item.commentaryTeamId === drsData.commentaryTeamId
                )
                if(index2 !== -1){
                    global.tblCommentaryTeams[index2] = {
                        ...global.tblCommentaryTeams[index2],
                        ...drsData
                    }
                }
            }
        }
    } else {
        return "Team Used all DRS"
    }
    
    return "DRS Created successfully";
}

const updateCommDrsLogService = async(request, fastify) => {
    const drsData = await commentaryDRSLogByIdQuery(request.body.id, request, fastify);
    if(!drsData){
        throw new Error("DRS log id not found");
    }
    const updateData = {
        commentaryId: request.body.commentaryId ?? drsData.commentaryId,
        commentaryTeamId: request.body.commentaryTeamId ?? drsData.commentaryTeamId,
        teamId: request.body.teamId ?? drsData.teamId,
        result: Boolean(request.body.result) ?? drsData.result,
        id: parseInt(request.body.id, 10),
        isCount: request.body.isCount ?? drsData.isCount,
    };
    const commentaryTeamData = await getCommentaryTeamsDRSQuery(updateData, fastify);
    if(commentaryTeamData && request.body.result !== undefined){
        await updateCommentaryDRSLogsQuery(updateData, fastify, request);
        if(drsData.result === false && request.body.result === true){
            const drsData = await updateCommentaryTeamDrsAttemptsAndFailQuery({
                drsAttempt: commentaryTeamData.drsAttempt + 1,
                drsFail: commentaryTeamData.drsFail - 1,
                commentaryTeamId: updateData.commentaryTeamId,
                teamId: updateData.teamId,
                commentaryId: updateData.commentaryId
            }, fastify);

            const index = global.tblCommentaryTeams.findIndex(
                (item) => item.commentaryTeamId === drsData.commentaryTeamId
            )
            if(index !== -1){
                global.tblCommentaryTeams[index] = {
                    ...global.tblCommentaryTeams[index],
                    ...drsData
                }
            }
        } 
        if(drsData.result === true && request.body.result === false) {
            const drsData = await updateCommentaryTeamDrsAttemptsAndFailQuery({
                drsAttempt: commentaryTeamData.drsAttempt - 1,
                drsFail: commentaryTeamData.drsFail + 1,
                commentaryTeamId: updateData.commentaryTeamId,
                teamId: updateData.teamId,
                commentaryId: updateData.commentaryId
            }, fastify);

            const index2 = global.tblCommentaryTeams.findIndex(
                (item) => item.commentaryTeamId === drsData.commentaryTeamId
            )
            if(index2 !== -1){
                global.tblCommentaryTeams[index2] = {
                    ...global.tblCommentaryTeams[index2],
                    ...drsData
                }
            }
        }
    }
    return "DRS updated successfully";
}

const saveCommDrsLogService = async(request, fastify) => {
    if(request.body.id === 0){
        return await createCommDrsLogService(request, fastify);
    } else {
        return await updateCommDrsLogService(request, fastify);
    }
}

const getCommDRSLogByIdService = async(request, fastify) => {
    const drsData = await commentaryDRSLogByIdQuery(request.body.id, request, fastify);
    // if(!drsData){
    //     throw new Error("DRS log with this Id not found");
    // }
    return drsData || null
}

const getCommDRSLogByCommIdService = async(request, fastify) => {
    const { commentaryId, commentaryTeamId } = request.body;
    let whereCondition = `logs."wrCommentaryId" = ${commentaryId}`

    if(commentaryTeamId) {
        whereCondition += ` AND logs."wrCommentaryTeamId" = ${commentaryTeamId}`
    }
    const drsData = await commentaryDRSLogByCommQuery(whereCondition, request, fastify);
    return drsData || []
}

module.exports = {
    saveCommDrsLogService,
    getCommDRSLogByIdService,
    getCommDRSLogByCommIdService,
}