import { BaseError } from './base-error';

/**
 * API-related errors
 */
export class APIError extends BaseError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean = false,
  ) {
    super(message, 'API_ERROR');
  }
}

/**
 * Network-related errors (fetch failed)
 */
export class NetworkError extends APIError {
  constructor(message: string) {
    super(message, 0, true);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication errors (401/403)
 */
export class AuthenticationError extends APIError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, false);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends APIError {
  constructor(message: string, retryAfter?: number) {
    super(message, 429, true);
    this.name = 'RateLimitError';
    if (retryAfter) {
      this.message = `${message} (retry after ${retryAfter}s)`;
    }
  }
}
