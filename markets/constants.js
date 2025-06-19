// market/constants.js
/**
 * Market-related constants for cricket prediction system
 */

// Market status constants
const MARKET_STATUS = {
    NOTCREATED: 0,
    INACTIVE: 1,
    OPEN: 2,
    SUSPEND: 3,
    CLOSE: 4,
    SETTLED: 5,
    CANCEL: 6,
    WIN: 7,
    LOSE: 8,
};

// Market category IDs
const MARKET_CATEGORY = {
    FANCYLDO: 26,        // L.D.O (Last Digit Over) markets
    LASTDIGITNUMBER: 27,
    ODDEVEN: 28,         // Lottery markets
    TOTALBOUNDARY: 29,
    PLAYERBALL: 30,
    FALLOFWICKET: 31,
    PARTNERSHIPBOUND: 32,
    WICKET_LOST_BALLS: 33,
    LOTTERY: 35,         // Odd/Even markets
    TOPBOWLER: 37,
    TOPBAT: 38,
    INNINGS: 39,
};

// Market creation type
const CREATION_TYPE = {
    AUTO: 1,
    MANUAL: 2,
};

// Market types
const MARKET_TYPE = {
    NORMAL: 1,
    SPECIAL: 2,
    FANCY: 3,
    HANDICAP: 4,
    MATCHWINNERS: 5,
};

// Match type ID to balls per over mapping
const BALLS_PER_OVER = {
    1: 6, // Test match
    2: 6, // ODI
    3: 6, // T20
    4: 6, // T10
    5: 6, // 100-ball
    6: 6, // Custom format (default to 6)
};

// Runner status
const RUNNER_STATUS = {
    NOT_ACTIVE: 0,
    ACTIVE: 1,
    SUSPENDED: 2,
    CLOSED: 3,
    SETTLED_WIN: 7,
    SETTLED_LOSE: 8,
    REFUND: 9,
};

// Market runner constants for odd/even market
const ODD_EVEN_RUNNERS = {
    ODD: {
        id: 7,
        name: "Odd",
    },
    EVEN: {
        id: 8,
        name: "Even",
    },
};

// L.D.O market runner types (examples - customize based on your needs)
const LDO_RUNNER_TYPES = {
    OVER: "over",
    UNDER: "under",
    ODD: "odd",
    EVEN: "even",
    CUSTOM: "custom"
};

// // Market processing priorities (for ball-to-action mapping)
// const MARKET_PROCESSING_PRIORITY = {
//     26: 1, // L.D.O markets - highest priority
//     35: 2, // Odd-Even markets
//     28: 3, // Lottery markets
//     DEFAULT: 99
// };
const OIGINAL_MARKET_CATEGORY = {
    TOTALBOUNDARY: 29,     // Player boundaries  
    PLAYERRUNS: 12,        // Player runs and balls faced
    FALLOFWICKET: 31,
    PLAYERBALL: 30,        // Player runs and balls faced
}
module.exports = {
    OIGINAL_MARKET_CATEGORY,
    MARKET_STATUS,
    MARKET_CATEGORY,
    CREATION_TYPE,
    MARKET_TYPE,
    BALLS_PER_OVER,
    RUNNER_STATUS,
    ODD_EVEN_RUNNERS,
    LDO_RUNNER_TYPES,
};