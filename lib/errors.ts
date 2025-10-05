/**
 * Custom Error Classes and Error Handling Utilities
 * Provides consistent error handling across the application
 */

import { logger } from './logger'

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, 502, 'EXTERNAL_SERVICE_ERROR')
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(public retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMIT_ERROR')
  }
}

/**
 * Error response formatter for API routes
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.fields && { fields: error.fields }),
      },
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        issues: error.issues,
      },
    }
  }

  // Generic error
  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  }
}

/**
 * Async error handler wrapper for route handlers
 * Catches errors and returns proper error responses
 */
export function asyncHandler<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): (...args: Parameters<T>) => Promise<Response> {
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      logger.error('Request handler error', error)

      const errorResponse = formatErrorResponse(error)
      const statusCode = errorResponse.error.statusCode || 500

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Safe error message extractor
 * Returns user-friendly message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}
