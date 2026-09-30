import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Unhandled error [${req.method} ${req.url}]:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  return sendError(res, message, code, statusCode, process.env.NODE_ENV !== 'production' ? err.stack : undefined);
};
