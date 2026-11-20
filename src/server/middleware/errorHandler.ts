import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Bad Request',
      code: 'VALIDATION_FAILED',
      message: 'Les données transmises sont invalides.',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur interne est survenue sur le serveur de la bibliothèque.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[Server Error] ${code} (${statusCode}):`, err);

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    code,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}
