// playerConfig.js - Configuration for Player Module
/**
 * Configuration constants for the dynamic player module
 * These values can be modified based on business requirements
 */

const PLAYER_CONFIG = {
    // Line buffer values (added to player stats for betting lines)
    LINE_BUFFERS: {
        RUN_BUFFER: 5,           // Add 5 to player runs for line calculation
        BOUNDARY_BUFFER: 5,      // Add 5 to player boundaries for line calculation  
        BALLS_FACED_BUFFER: 5,   // Add 5 to player balls faced for line calculation
    },

    // Ball type configuration
    BALL_TYPES: {
        DEFAULT: 1,              // Default ball type if not found in payload
        EXCLUDED: [0, 8, 9, 10], // Ball types to exclude from ball counting
    },

    // Market categories for player markets
    MARKET_CATEGORIES: {
        PLAYER_RUN: 12,          // Player run market category
        PLAYER_BOUNDARY: 29,     // Player boundary market category
        PLAYER_BALL_FACED: 30,   // Player ball faced market category
    },

    // Market status values
    MARKET_STATUS: {
        NOT_CREATED: 0,
        INACTIVE: 1,
        OPEN: 2,
        SUSPEND: 3,
        CLOSE: 4,
        SETTLED: 5,
        CANCEL: 6,
        WIN: 7,
        LOSE: 8,
    },

    // Default market values
    DEFAULTS: {
        BACK_PRICE: 1.9,
        LAY_PRICE: 1.9,
        OVER_RATE: 1.9,
        UNDER_RATE: 1.9,
        BACK_SIZE: 90,
        LAY_SIZE: 110,
        MARGIN: 5.0,
    },

    // Player tracking settings
    TRACKING: {
        MIN_BALLS_FOR_CREATE: 3,    // Minimum balls before creating market (from template)
        MIN_BALLS_FOR_OPEN: 4,      // Minimum balls before opening market (from template)
        AUTO_SETTLE_DELAY: 0,       // Balls to wait after player dismissal before settlement
    },

    // Template placeholder
    TEMPLATE: {
        PLAYER_PLACEHOLDER: "{player}", // Placeholder in template names to replace with player name
    },

    // Logging configuration
    LOGGING: {
        ENABLED: true,
        DETAILED_TRACKING: true,
        MARKET_UPDATES: true,
    },

    // Feature flags
    FEATURES: {
        AUTO_CANCEL_ON_REMOVAL: true,    // Cancel markets when player suddenly removed
        AUTO_SETTLE_ON_DISMISSAL: true,  // Settle markets when player is dismissed
        DYNAMIC_LINE_UPDATES: true,      // Update lines based on current player stats
        VALIDATE_BALL_TYPES: true,       // Validate ball types before counting
    }
};

module.exports = PLAYER_CONFIG;