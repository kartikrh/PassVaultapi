const filtering = async (dataSource, request) => {
    const { startDate, endDate, page = 1, limit = 10, requestbody = {} } = request.body || {};
    let result = dataSource;

    if (startDate && endDate) {
        result = result?.filter((item) => {
            return (
                new Date(item.requestStartTime) >= new Date(startDate) &&
                new Date(item.requestStartTime) <= new Date(endDate)
            );
        });
    }

    if (requestbody && Object.keys(requestbody).length > 0) {
        result = result?.filter((item) => {
            return Object.entries(requestbody).every(([key, value]) => {
                const requestBodyItem = item.requestBody ? item.requestBody[key] : null;
                if (Array.isArray(requestBodyItem)) {
                    return requestBodyItem.some((subItem) =>
                        Object.entries(value).every(([subKey, subValue]) =>
                            subItem[subKey] === subValue
                        )
                    );
                } else if (typeof requestBodyItem === 'object' && requestBodyItem !== null) {
                    return Object.entries(value).every(([subKey, subValue]) => {
                        if (Array.isArray(requestBodyItem[subKey])) {
                            return requestBodyItem[subKey].some((nestedItem) =>
                                Object.entries(subValue).every(([nestedKey, nestedValue]) =>
                                    nestedItem[nestedKey] === nestedValue
                                )
                            );
                        }
                        return requestBodyItem[subKey] === subValue;
                    });
                }
                return requestBodyItem === value;
            });
        });
    }

    result.sort((a, b) => new Date(b.requestStartTime) - new Date(a.requestStartTime));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResult = result.slice(startIndex, endIndex);

    return {
        totalRecords: result.length,
        currentPage: page,
        totalPages: Math.ceil(result.length / limit),
        data: paginatedResult,
    };
}

const allResponseLogs = async (request) => {
    return await filtering(global.responseLogs, request);
};

const allThirdPartyApiLogs = async (request) => {
    return await filtering(global.thirdPartyAPILogs, request);
};

const allPredictorAPILogs = async (request) => {
    return await filtering(global.predictorAPILogs, request);
};

module.exports = {
    allResponseLogs,
    allThirdPartyApiLogs,
    allPredictorAPILogs
};