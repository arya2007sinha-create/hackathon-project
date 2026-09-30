import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validation error in request payload', 'VALIDATION_ERROR', 400, issues);
      }
      return sendError(res, 'Invalid request payload', 'VALIDATION_ERROR', 400);
    }
  };
};
