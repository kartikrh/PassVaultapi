const {
    allResponseLogsQuery,
    allThirdPartyApiLogsQuery,
    allPredictorAPILogsQuery,
    allCommentaryLogsQuery,
    allErrorLogsQuery,
    allUndoLogsQuery
} = require("../repository/TableLogs");

const applyFiltersAndPagination = (logs, filters) => {
    const { startDate, endDate, page = 1, limit = 20, commentaryId } = filters;

    let result = logs;

    if (startDate && endDate) {
        result = result.filter(item => {
            const date = new Date(item.requestStartTime || item.createdDate);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });
    }

    if (commentaryId) {
        result = result.filter(item => item.commentaryId === commentaryId);
    }

    result.sort((a, b) => new Date(b.requestStartTime || b.createdDate) - new Date(a.requestStartTime || a.createdDate));

    const startIndex = (page - 1) * limit;
    const paginatedResult = result.slice(startIndex, startIndex + limit);

    return {
        totalRecords: result.length,
        currentPage: page,
        totalPages: Math.ceil(result.length / limit),
        data: paginatedResult,
    };
};

const allResponseLogs = async (request, fastify) => {
    return await allResponseLogsQuery(request.body || {},request, fastify);
};

const allThirdPartyApiLogs = async (request, fastify) => {
    return await allThirdPartyApiLogsQuery(request.body || {}, request, fastify);
};

const allPredictorAPILogs = async (request, fastify) => {
    return await allPredictorAPILogsQuery(request.body || {},request, fastify);
};

const allCommentaryLogs = async (request, fastify) => {
    return await allCommentaryLogsQuery(request.body || {},request, fastify);
};

const allErrorLogs = async (request, fastify) => {
    return await allErrorLogsQuery(request.body || {},request, fastify);
};
const allEventByCompetition = async(request) =>{
    const {competitionId} = request.body;
    let result = global.tblEvents.filter((item)=>
        item.competitionId === competitionId
    ).map((item)=>{
        return {
            eventId: item.eventId,
            eventName: item.eventName
        }
    });
    return result;
}
const getComByEventId = async(request) =>{
    const {competitionId} = request.body;
    let result = global.tblCommentaries.filter((item)=>
        item.competitionId === competitionId
    ).map((item)=>{
        return {
            commentaryId: item.commentaryId,
            eventName: item.eventName,
            eventRefId : item.eventRefId,
            eventDate : item.eventDate
        }
    });
    return result;
}
const allUndoLogs = async(request, fastify) => {
    return await allUndoLogsQuery(request.body || {},request, fastify);
};  
module.exports = {
    allResponseLogs,
    allThirdPartyApiLogs,
    allPredictorAPILogs,
    allCommentaryLogs,
    allErrorLogs,
    allEventByCompetition,
    getComByEventId,
    allUndoLogs
};