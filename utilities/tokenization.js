const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    const options = {
        expiresIn: process.env.TOKEN_EXPIRY_TIME,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY_TOKEN, options);
    return token;
};

module.exports = { generateToken };