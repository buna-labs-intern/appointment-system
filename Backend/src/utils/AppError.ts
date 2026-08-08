// src/utils/AppError.ts

/**
 * Custom error class for application errors
 * Constructor accepts: (statusCode, message)
 */
class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public errors?: any[];

  /**
   * Create a new AppError
   * @param statusCode - HTTP status code (default: 500)
   * @param message - Error message
   * @param errors - Additional error details (optional)
   */
  constructor(statusCode: number = 500, message: string, errors?: any[]) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a new AppError for bad requests (400)
 */
export const createBadRequestError = (message: string, errors?: any[]) => {
  return new AppError(400, message, errors);
};

/**
 * Create a new AppError for unauthorized access (401)
 */
export const createUnauthorizedError = (message: string = 'Unauthorized access') => {
  return new AppError(401, message);
};

/**
 * Create a new AppError for forbidden access (403)
 */
export const createForbiddenError = (message: string = 'Forbidden access') => {
  return new AppError(403, message);
};

/**
 * Create a new AppError for not found (404)
 */
export const createNotFoundError = (message: string = 'Resource not found') => {
  return new AppError(404, message);
};

/**
 * Create a new AppError for conflict (409)
 */
export const createConflictError = (message: string = 'Resource already exists') => {
  return new AppError(409, message);
};

/**
 * Create a new AppError for validation errors (422)
 */
export const createValidationError = (message: string = 'Validation failed', errors?: any[]) => {
  return new AppError(422, message, errors);
};

/**
 * Create a new AppError for internal server errors (500)
 */
export const createInternalServerError = (message: string = 'Internal server error') => {
  return new AppError(500, message);
};

export default AppError;