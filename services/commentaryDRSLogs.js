const {
    commentaryDRSLogByIdQuery,
    insertCommentaryDRSLogsQuery,
    updateCommentaryDRSLogsQuery,
    commentaryDRSLogByCommQuery,
    getDrsByIdQuery,
    upDrsLogQuery,
    dltDrsQuery,
} = require("../repository/TableCommentaryDRSLogs");
const {
    updateCommentaryTeamDrsAttemptsAndFailQuery,
    updateCommentaryTeamDrsAttemptsQuery,
    getCommentaryTeamsDRSQuery,
    updateDrsQuery,
} = require("../repository/TableCommentary");

const createCommDrsLogService = async(request, fastify) => {
    const body = request.body
    let isCount = body.isCount || false;
    if(body.commentaryId){
        let cData = global.tblCommentaries.find(
            (item) => item.commentaryId == body.commentaryId
        );
        if(!cData){
            throw new Error("Commentary not found");
        }
    }
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

const dltDrsService = async (request,fastify) =>{
    let dataToDlt = await getDrsByIdQuery(request.body , request,fastify);
    if(dataToDlt.length == 0){
        throw new Error("Drs log with this id not found")
    }
    let teamId = dataToDlt[0].commentaryTeamId;
    let comId = dataToDlt[0].commentaryId;

    let index = global.tblCommentaryTeams.findIndex((i)=> i.commentaryTeamId == teamId)
    let teamData = global.tblCommentaryTeams[index]
    let upData = {}
    upData.commentaryTeamId = teamData.commentaryTeamId;
    if(dataToDlt.length > 0){
        for (d of dataToDlt){
            upData.drsAttempt = (teamData.drsAttempt || 0) - 1;
            if(d.isCount == true){
                upData.drsCount = (teamData.drsCount || 0) + 1
            } 
            else {
                upData.drsCount = teamData.drsCount
            }
            if(d.result == false){
                upData.drsFail = teamData.drsFail - 1
            }
            else {
                upData.drsFail= teamData.drsFail
            }
        }
        await updateDrsQuery(upData,fastify)
        global.tblCommentaryTeams[index] = {
            ...global.tblCommentaryTeams[index],
            ...upData
        }
        await dltDrsQuery(request.body , request,fastify)
        return "Drs Data Deleted."
    }
    else {
        return "No data found for delete."
    }

}
const takeDrsDataService = async (request , fastify)=>{
 const body = request.body
    // let isCount = body.isCount || false;
    if(body.commentaryId){
        let cData = global.tblCommentaries.find(
            (item) => item.commentaryId == body.commentaryId
        );
        if(!cData){
            throw new Error("Commentary not found");
        }
    }
    const commentaryTeamData = await getCommentaryTeamsDRSQuery(body, fastify);
    if( commentaryTeamData && 
        commentaryTeamData.drsCount > 0
    ) {
        await insertCommentaryDRSLogsQuery(body, fastify, request);
        return "Drs saved successfully."
    } else {
        return "Team Used all DRS"
    }
}
const upDrsDataService = async (request , fastify)=>{
    const {id , result,isCount} = request.body;
     const drsData = await commentaryDRSLogByIdQuery(request.body.id, request, fastify);
    if(!drsData){
        throw new Error("DRS log id not found");
    }
    const updateData = {
        result: Boolean(request.body.result),
        id: parseInt(request.body.id),
        isCount: request.body.isCount
    };
    const index = global.tblCommentaryTeams.findIndex((i)=> i.commentaryTeamId == drsData.commentaryTeamId);
    const commentaryTeamData = await getCommentaryTeamsDRSQuery({
        commentaryTeamId : drsData.commentaryTeamId
    }, fastify);
    let drsCount = commentaryTeamData.drsCount;
    let drsFail = commentaryTeamData.drsFail
    if(isCount == true){
        drsCount = (commentaryTeamData.drsCount || 0) - 1;
    }
    if(result == false){
        drsFail = (commentaryTeamData.drsFail || 0) + 1
    }
    const attemptData = await updateDrsQuery({
                    drsAttempt: commentaryTeamData.drsAttempt + 1,
                    drsCount: drsCount,
                    drsFail : drsFail,
                    commentaryTeamId: drsData.commentaryTeamId,
                    teamId: drsData.teamId,
                    commentaryId: drsData.commentaryId,
                    id : drsData.id
    }, fastify);
    global.tblCommentaryTeams[index]  = {
        ...global.tblCommentaryTeams[index],
        ...attemptData
    }
    // update DrsLog
    await upDrsLogQuery({
        id : id,
        result : result,
        isCount : isCount
    },request,fastify)

    return "Drs Updated successFully."
  
}
module.exports = {
    saveCommDrsLogService,
    getCommDRSLogByIdService,
    getCommDRSLogByCommIdService,
    dltDrsService,
    takeDrsDataService,
    upDrsDataService
}