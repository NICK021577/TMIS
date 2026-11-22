const { HTTP_STATUS } = require("../config/constants");

module.exports = (...roles) => {
    return async (request, response, next) => {
        try {
            if (!roles.includes(request.user.role)) {
                return response.status(HTTP_STATUS.FORBIDDEN).json({
                    message: "Access denied",
                });
            }
            next();
        } catch (error) {
            response.status(HTTP_STATUS.FORBIDDEN).json({
                message: "Access denied",
            });
        }
    };
};