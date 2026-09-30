"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const issues = err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                }));
                return (0, response_1.sendError)(res, 'Validation error in request payload', 'VALIDATION_ERROR', 400, issues);
            }
            return (0, response_1.sendError)(res, 'Invalid request payload', 'VALIDATION_ERROR', 400);
        }
    };
};
exports.validate = validate;
