import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: 'Internal Server Error',
      status: 'error',
      ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
  }

  return res.status(500).json({ message: 'Internal Server Error', status: 'error' });
};
