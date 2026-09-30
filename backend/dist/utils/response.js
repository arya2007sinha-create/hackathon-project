"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'An unexpected error occurred', code = 'INTERNAL_ERROR', statusCode = 500, details) => {
    const errorObj = {
        code,
        message,
    };
    if (process.env.NODE_ENV !== 'production' && details) {
        errorObj.details = details;
    }
    return res.status(statusCode).json({
        success: false,
        error: errorObj,
    });
};
exports.sendError = sendError;
