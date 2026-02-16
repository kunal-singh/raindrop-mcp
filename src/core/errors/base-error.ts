/**
 * Base error class for all application errors
 */
export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends BaseError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}
