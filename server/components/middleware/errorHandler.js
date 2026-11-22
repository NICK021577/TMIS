const { HTTP_STATUS } = require("../config/constants");
const { NODE_ENV } = require("../config/config");

// APPLICATION ERROR HANDLER MIDDLEWARE
class AppError extends Error {
    constructor(
        message, 
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        details = null
    ) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// NOT FOUND ERROR HANDLER MIDDLEWARE
const notFoundHandler = (request, response, next) => {
    const error = new AppError(
        `Route not found: ${request.method} ${request.originalUrl}`,
        HTTP_STATUS.NOT_FOUND
    );

    next(error);
}

const errorHandler = (error, request, response, next) => {
    if(response.headersSent){
        return next(error);
    }

    // Default Error Handler
    let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = error.message || "Internal Server Error";
    let details = error.details;

    // Model Validation Error Handler (from Schema.js)
    if (error.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        details = error.errors;
    }

    // Unknown Field Error Handler (filter on a field the model doesn't have)
    if (error.message && error.message.startsWith('Unknown field')) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
    }

    // Database (Postgres) Error Handler
    if (error.code === '23505') {
        statusCode = HTTP_STATUS.CONFLICT;
        message = "Record already exists";
        details = error.detail;
    }
    if (error.code === '23503') {
        statusCode = HTTP_STATUS.CONFLICT;
        message = "A related record does not exist, or this record is still used by other records";
        details = error.detail;
    }
    if (['22P02', '22007', '22008', '22001', '23502', '23514'].includes(error.code)) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
    }

    // CORS Error Handler
    if (error.message === 'Not allowed by CORS') {
        statusCode = HTTP_STATUS.FORBIDDEN;
        message = "Origin is not allowed";
    }

    // JSON Body Parser Error Handler
    if(error instanceof SyntaxError && error.status === HTTP_STATUS.BAD_REQUEST && 'body' in error) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = "Invalid JSON payload";
    }

    // Request Payload Too Large Error Handler
    if (error.type === "entity.too.large") {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = "Request Payload is too large";
    }

    // Rate Limiter Error Handler
    if(error.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
        message = "Too many requests, please try again later.";
    }

    const isProduction = NODE_ENV === 'production';

    if(isProduction && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        message = "An unexpected error occurred. Please try again later.";
    }

    // Error Logging
    if(statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        console.error("Internal Server Error:", error);
    }

    // Response
    const res = {
        success: false,
        message
    }

    if(details) {
        res.details = details;
    }

    if(!isProduction && error.stack) {
        res.stack = error.stack;
    }

    return response.status(statusCode).json(res);
}

module.exports = {
    AppError,
    notFoundHandler,
    errorHandler
};