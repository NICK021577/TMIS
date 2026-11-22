const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

function generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn
    });
}

module.exports = {
    generateToken,
};