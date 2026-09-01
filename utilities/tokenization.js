const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    const options = {
        expiresIn: process.env.TOKEN_EXPIRY_TIME,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY_TOKEN, options);
    return token;
};

// Short-lived, single-purpose JWT for the panel's pending-2FA challenge
// (services/user.js signInUserServices/verifyOtpUserServices) -- same
// "purpose" claim pattern the vault client already uses for its
// verify-email/reset-password/2FA links (services/vaultAuth.js
// generatePurposeToken/verifyPurposeToken), generalized here so the panel
// can reuse it instead of duplicating the jwt.sign/verify boilerplate.
const generatePurposeToken = (payload, purpose, expiresIn) => {
    return jwt.sign({ ...payload, purpose }, process.env.SECRET_KEY_TOKEN, { expiresIn });
};

const verifyPurposeToken = (token, purpose) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    } catch (err) {
        throw new Error("This code has expired, please sign in again");
    }
    if (decoded.purpose !== purpose) {
        throw new Error("Invalid token");
    }
    return decoded;
};

module.exports = { generateToken, generatePurposeToken, verifyPurposeToken };