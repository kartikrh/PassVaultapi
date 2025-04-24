// pythonToNodeUtils.js
/**
 * Utility functions to help with conversion from Python to Node.js data structures
 * This helps bridge the gap between the Pandas-based Python code and JavaScript objects
 */

/**
 * Convert Python-like string/numeric statuses to Node.js constants
 * @param {Object} constants - The EventMarketStatus constants
 * @param {string|number} status - Status value to convert
 * @returns {number} - Converted status code
 */
function convertStatus(constants, status) {
    // Convert string statuses to numbers
    if (typeof status === 'string') {
        switch (status.toUpperCase()) {
            case 'NOTCREATED': return constants.NotCreated;
            case 'INACTIVE': return constants.Inactive;
            case 'OPEN': return constants.Open;
            case 'SUSPEND': return constants.Suspend;
            case 'CLOSE': return constants.Close;
            case 'SETTLED': return constants.Settled;
            case 'CANCEL': return constants.Cancel;
            case 'WIN': return constants.Win;
            case 'LOSE': return constants.Lose;
            default: return parseInt(status) || constants.NotCreated;
        }
    }

    // If it's already a number, return it
    return status;
}

/**
 * Calculate balls from over number
 * @param {number} over - Over number (e.g., 5.3 for 5 overs and 3 balls)
 * @param {number} matchTypeId - Match type ID
 * @returns {number} - Total balls
 */
function oversToBalls(over, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over

    // Parse the over value to get full overs and balls parts
    const fullOvers = Math.floor(over);
    const balls = Math.round((over - fullOvers) * 10); // Convert decimal to number of balls

    return fullOvers * BALLS_PER_OVER + balls;
}

/**
 * Calculate over number from total balls
 * @param {number} balls - Total number of balls
 * @param {number} matchTypeId - Match type ID
 * @returns {number} - Over in decimal format (e.g., 5.3 for 5 overs and 3 balls)
 */
function ballsToOvers(balls, matchTypeId) {
    const BALLS_PER_OVER = matchTypeId === 2 ? 6 : 6; // Default to 6 balls per over

    if (parseInt(balls) === 0) return 0.0;

    const fullOvers = Math.floor(balls / BALLS_PER_OVER);
    const remainingBalls = balls % BALLS_PER_OVER;

    return parseFloat(fullOvers + remainingBalls / 10);
}

/**
 * Calculate over info from ball number
 * @param {number} ball - Ball number (e.g. 5.3)
 * @returns {Object} - Over and ball information
 */
function getOverInfo(ball) {
    const overNumber = Math.floor(ball);
    const ballInOver = Math.round((ball - overNumber) * 10);

    return {
        over: overNumber,
        ball: ballInOver,
        display: `${overNumber}.${ballInOver}`
    };
}

/**
 * Formats a date object to ISO string similar to Python's datetime.now().isoformat()
 * @returns {string} - ISO formatted date string
 */
function nowIsoformat() {
    return new Date().toISOString();
}

/**
 * Convert a Python-like data structure (that might use DataFrame concepts)
 * to a JavaScript object with consistent properties
 * @param {Object} pythonStyleObject - The object to convert
 * @returns {Object} - Normalized JavaScript object
 */
function normalizeObject(pythonStyleObject) {
    // If it's already a standard JS object, just return it
    if (!pythonStyleObject || typeof pythonStyleObject !== 'object') {
        return pythonStyleObject;
    }

    // Create a new object with camelCase properties
    const normalized = {};

    // Convert snake_case and other Python-style naming to camelCase
    Object.keys(pythonStyleObject).forEach(key => {
        // Convert wrProperty to standard camelCase
        let newKey = key;
        if (key.startsWith('wr') && key.length > 2) {
            newKey = key[2].toLowerCase() + key.slice(3);
        }

        // Convert snake_case to camelCase
        newKey = newKey.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

        // Handle nested objects including arrays
        if (Array.isArray(pythonStyleObject[key])) {
            normalized[newKey] = pythonStyleObject[key].map(item =>
                typeof item === 'object' ? normalizeObject(item) : item
            );
        } else if (typeof pythonStyleObject[key] === 'object' && pythonStyleObject[key] !== null) {
            normalized[newKey] = normalizeObject(pythonStyleObject[key]);
        } else {
            normalized[newKey] = pythonStyleObject[key];
        }
    });

    return normalized;
}

module.exports = {
    convertStatus,
    oversToBalls,
    ballsToOvers,
    getOverInfo,
    nowIsoformat,
    normalizeObject
};