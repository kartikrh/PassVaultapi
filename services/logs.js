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

const allResponseLogs = async (request) => {
    return applyFiltersAndPagination(global.responseLogs, request.body || {});
};

const allThirdPartyApiLogs = async (request) => {
    return applyFiltersAndPagination(global.thirdPartyAPILogs, request.body || {});
};

const allPredictorAPILogs = async (request) => {
    return applyFiltersAndPagination(global.predictorAPILogs, request.body || {});
};

const allCommentaryLogs = async (request) => {
    return applyFiltersAndPagination(global.commentaryLogs, request.body || {});
};

const allErrorLogs = async (request) => {
    return applyFiltersAndPagination(global.errorLogs, request.body || {});
};

module.exports = {
    allResponseLogs,
    allThirdPartyApiLogs,
    allPredictorAPILogs,
    allCommentaryLogs,
    allErrorLogs
};