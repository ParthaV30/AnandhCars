/**
 * Production-ready error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: Record<string, unknown>): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Forbidden', details?: Record<string, unknown>): AppError {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message: string = 'Not found', details?: Record<string, unknown>): AppError {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  static conflict(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static validationError(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests', details?: Record<string, unknown>): AppError {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS', details);
  }

  static internal(message: string = 'Internal server error', details?: Record<string, unknown>): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }

  static serviceUnavailable(message: string = 'Service unavailable', details?: Record<string, unknown>): AppError {
    return new AppError(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: Error): { error: string; code: string; details?: Record<string, unknown>; statusCode: number } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: (error as { errors?: Record<string, unknown> }).errors,
      statusCode: 422,
    };
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as { code?: string; meta?: Record<string, unknown> };
    if (prismaError.code === 'P2002') {
      return {
        error: 'A record with this value already exists',
        code: 'CONFLICT',
        details: prismaError.meta,
        statusCode: 409,
      };
    }
    if (prismaError.code === 'P2025') {
      return {
        error: 'Record not found',
        code: 'NOT_FOUND',
        details: prismaError.meta,
        statusCode: 404,
      };
    }
  }

  // Handle Prisma validation errors
  if (error.name === 'PrismaClientValidationError') {
    return {
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    };
  }

  // Default error
  return {
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error;
    }
  }) as T;
}

/**
 * Format validation errors for response
 */
export function formatValidationErrors(errors: Array<{ path: (string | number)[]; message: string }>): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const error of errors) {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  }

  return formatted;
}

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  data: T | null,
  error: string | null = null,
  code: string | null = null,
  meta?: Record<string, unknown>
): {
  success: boolean;
  data: T | null;
  error: string | null;
  code: string | null;
  meta?: Record<string, unknown>;
} {
  return {
    success: !error,
    data,
    error,
    code,
    meta,
  };
}