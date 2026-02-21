import type { RequestOptions } from '../../types/api.types';
import {
  APIError,
  NetworkError,
  AuthenticationError,
  RateLimitError,
} from '../../core/errors/index';

/**
 * Base HTTP client for external APIs
 * Provides common functionality: authentication, error handling, request/response formatting
 */
export abstract class HttpClientBase {
  protected baseUrl: string;
  protected token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Make an HTTP request to the API
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - Request options
   * @returns Parsed JSON response
   */
  protected async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Build query string from params
    const params = options.params || {};
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);

      // Handle error responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Network errors (fetch failed)
      if (error instanceof TypeError) {
        throw new NetworkError(`Network request failed: ${error.message}`);
      }
      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }
      // Unknown errors
      throw new APIError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        0,
        false,
      );
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorMessage: string;

    try {
      const errorBody = await response.text();
      errorMessage = errorBody || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    // Authentication errors (401, 403)
    if (statusCode === 401 || statusCode === 403) {
      throw new AuthenticationError(
        `Authentication failed: ${errorMessage}`,
        statusCode,
      );
    }

    // Rate limit errors (429)
    if (statusCode === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        `Rate limit exceeded: ${errorMessage}`,
        retryAfter ? parseInt(retryAfter, 10) : undefined,
      );
    }

    // Generic API errors
    throw new APIError(
      `API error (${statusCode}): ${errorMessage}`,
      statusCode,
      statusCode >= 500, // Server errors are retryable
    );
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(
    params: Record<string, string | number | boolean | undefined>,
  ): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }

    return searchParams.toString();
  }
}
