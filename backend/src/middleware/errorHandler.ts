import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/index.js';

export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    message: string = 'Internal Server Error'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message || err);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  } else if (err.message) {
    if (err.message.includes('Conversation not found')) {
      statusCode = 404;
      message = err.message;
    } else if (err.message.includes('required')) {
      statusCode = 400;
      message = err.message;
    } else if (err.message.includes('empty')) {
      statusCode = 400;
      message = err.message;
    } else if (err.message.includes('too long')) {
      statusCode = 400;
      message = err.message;
    } else if (err.message.includes('API key')) {
      statusCode = 500;
      message = 'LLM service not properly configured';
    } else {
      message = err.message;
    }
  }

  const response = {
    error: message,
    statusCode
  };

  res.status(statusCode).json(response);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
