// ============================================================================
// API ERROR TYPES
// ============================================================================

// Standard API error response structure
export interface ApiErrorResponse {
  statusCode: number
  statusMessage: string
  message?: string
  data?: any
  timestamp?: string
}

// Standard success response structure
export interface ApiSuccessResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// Generic API response type
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// ERROR CLASSES
// ============================================================================

// Base API error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public statusMessage: string,
    public originalError?: any,
    message?: string
  ) {
    super(message || statusMessage)
    this.name = 'ApiError'
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
  
  // Check if error is retryable (for retry logic)
  isRetryable(): boolean {
    // Retry on 5xx errors, 429 (rate limit), and network errors
    return this.statusCode >= 500 || this.statusCode === 429
  }
  
  // Get user-friendly error message
  getUserMessage(): string {
    return this.message || this.statusMessage || 'An error occurred'
  }
}

// Network/connectivity errors
export class NetworkError extends ApiError {
  constructor(message = 'Network error. Please check your connection.', originalError?: any) {
    super(0, 'Network Error', originalError, message)
    this.name = 'NetworkError'
  }
  
  isRetryable(): boolean {
    return true // Network errors are always retryable
  }
}

// 400 Bad Request - Validation errors
export class ValidationError extends ApiError {
  public validationErrors?: Record<string, string[]>
  
  constructor(
    statusMessage: string,
    validationErrors?: Record<string, string[]>,
    originalError?: any
  ) {
    super(400, statusMessage, originalError, 'Validation failed')
    this.name = 'ValidationError'
    this.validationErrors = validationErrors
  }
  
  getUserMessage(): string {
    if (this.validationErrors) {
      const errors = Object.values(this.validationErrors).flat()
      return errors.join(', ') || 'Please check your input and try again.'
    }
    return 'Invalid request. Please check your input and try again.'
  }
}

// 401 Unauthorized - Authentication required
export class UnauthorizedError extends ApiError {
  constructor(statusMessage = 'Unauthorized', originalError?: any) {
    super(401, statusMessage, originalError, 'You must be logged in to perform this action.')
    this.name = 'UnauthorizedError'
  }
  
  getUserMessage(): string {
    return 'Your session has expired. Please log in again.'
  }
}

// 403 Forbidden - Insufficient permissions
export class ForbiddenError extends ApiError {
  constructor(statusMessage = 'Forbidden', originalError?: any) {
    super(403, statusMessage, originalError, 'You do not have permission to perform this action.')
    this.name = 'ForbiddenError'
  }
  
  getUserMessage(): string {
    return 'You do not have permission to perform this action.'
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(statusMessage = 'Not Found', originalError?: any) {
    super(404, statusMessage, originalError, 'The requested resource was not found.')
    this.name = 'NotFoundError'
  }
  
  getUserMessage(): string {
    return 'The requested resource was not found.'
  }
}

// 429 Rate Limit Exceeded
export class RateLimitError extends ApiError {
  public retryAfter?: number
  
  constructor(statusMessage = 'Rate Limit Exceeded', retryAfter?: number, originalError?: any) {
    super(429, statusMessage, originalError, 'Too many requests. Please try again later.')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
  
  getUserMessage(): string {
    if (this.retryAfter) {
      return `Too many requests. Please try again in ${Math.ceil(this.retryAfter)} seconds.`
    }
    return 'Too many requests. Please try again later.'
  }
  
  isRetryable(): boolean {
    return true
  }
}

// 500+ Server errors
export class ServerError extends ApiError {
  constructor(statusCode: number, statusMessage: string, originalError?: any) {
    super(statusCode, statusMessage, originalError, 'A server error occurred. Please try again later.')
    this.name = 'ServerError'
  }
  
  getUserMessage(): string {
    return 'A server error occurred. Our team has been notified. Please try again later.'
  }
  
  isRetryable(): boolean {
    return true
  }
}

// Error transformation function
export function transformError(error: any): ApiError {
  // Network errors (no response)
  if (!error.response && (error.message?.includes('fetch') || error.message?.includes('network'))) {
    return new NetworkError(error.message, error)
  }
  
  // HTTP errors with status codes
  const statusCode = error.statusCode || error.status || 500
  const statusMessage = error.statusMessage || error.message || 'Unknown Error'
  
  switch (statusCode) {
    case 400:
      return new ValidationError(statusMessage, error.data?.errors, error)
    case 401:
      return new UnauthorizedError(statusMessage, error)
    case 403:
      return new ForbiddenError(statusMessage, error)
    case 404:
      return new NotFoundError(statusMessage, error)
    case 429:
      return new RateLimitError(statusMessage, error.retryAfter, error)
    default:
      if (statusCode >= 500) {
        return new ServerError(statusCode, statusMessage, error)
      }
      return new ApiError(statusCode, statusMessage, error)
  }
}
