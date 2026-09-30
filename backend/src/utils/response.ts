import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  message: string = 'An unexpected error occurred',
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: any
) => {
  const errorObj: any = {
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
