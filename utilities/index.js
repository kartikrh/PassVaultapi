const ERROR_CODES = {
    INVALID_INPUT: "INVALID_INPUT",
    SERVER_ERROR: "SERVER_ERROR",
    AUTH_ERROR: "AUTH_ERROR",
};

// Function to generate an error response object
const error=(message, errorCode, status) =>{
    return {
        success: false,
        status: status,
        error: {
            code: errorCode,
            message: message
        }
    };
}

// Function to generate a success response object
const success=(result, status)=> {
    return {
        success: true,
        status: status,
        result: result
    };
}

module.exports={
    ERROR_CODES,
    error,
    success
}