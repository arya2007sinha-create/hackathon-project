"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const response_1 = require("../utils/response");
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'User session not found', 'UNAUTHORIZED', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 'Access denied: You do not have permissions for this resource', 'FORBIDDEN', 403);
        }
        return next();
    };
};
exports.requireRoles = requireRoles;
