const jwt = require("jsonwebtoken");
const { HTTP_STATUS } = require("../config/constants");
const { JWT_SECRET } = require("../config/config");

module.exports = async (request, response, next) => {
  let token = request.cookies?.token;

  // Mobile
  if (!token) {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return response.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    request.user = decoded;

    next();
  } catch (error) {
    return response.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};