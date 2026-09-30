"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`Unhandled error [${req.method} ${req.url}]:`, err.message || err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const code = err.code || 'INTERNAL_ERROR';
    return (0, response_1.sendError)(res, message, code, statusCode, process.env.NODE_ENV !== 'production' ? err.stack : undefined);
};
exports.errorHandler = errorHandler;
