import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Route not found'
  });
};
