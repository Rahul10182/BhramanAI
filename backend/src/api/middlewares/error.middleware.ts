import { Request, Response, NextFunction } from 'express';

/**
 * Custom Application Error class with HTTP status codes.
 * Use this in controllers: throw new AppError('Trip not found', 404);
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error — for request body / params validation failures.
 */
export class ValidationError extends AppError {
  public fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400);
    this.fields = fields;
  }
}

/**
 * 404 handler — catches any request that didn't match a route.
 * Must be placed AFTER all route definitions.
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    statusCode: 404,
  });
};

/**
 * Global error handler — catches all errors thrown/passed via next(err).
 * Must be the LAST middleware registered on the app.
 */
export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let fields: Record<string, string> | undefined;

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    fields = err.fields;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((err as any).code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    message = 'Duplicate entry — this resource already exists';
  }

  // Log server errors (not client errors)
  if (statusCode >= 500) {
    console.error(`[ERROR ${statusCode}]`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(fields && { fields }),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 && { stack: err.stack }),
  });
};
