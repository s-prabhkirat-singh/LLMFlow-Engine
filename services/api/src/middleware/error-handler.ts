import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { ApiError } from '../errors/api-error.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation failed',
      details: err.flatten()
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error'
  });
};
