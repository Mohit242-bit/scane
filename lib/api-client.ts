/**
 * API Client Utility
 * Provides type-safe HTTP client with automatic retry, error handling, and logging
 */

import { logger } from "./logger";
import { getErrorMessage } from "./errors";

interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  headers?: HeadersInit
}

/**
 * HTTP API Client with retry logic and error handling
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultHeaders: HeadersInit;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || "";
    this.defaultTimeout = config.timeout || 30000; // 30 seconds
    this.defaultRetries = config.retries || 3;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * Delays execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a timeout promise that rejects after specified milliseconds
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms)
    );
  }

  /**
   * Performs HTTP request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    config: RequestConfig = {},
    attempt = 1
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
      ...fetchConfig
    } = config;

    try {
      logger.debug("Making API request", {
        url,
        method: config.method || "GET",
        attempt,
        maxRetries: retries,
      });

      const response = await Promise.race([
        fetch(url, {
          ...fetchConfig,
          headers: {
            ...this.defaultHeaders,
            ...fetchConfig.headers,
          },
        }),
        this.timeoutPromise(timeout),
      ]);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        logger.warn("API request failed", {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        throw new Error(
          errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      logger.debug("API request successful", {
        url,
        method: config.method || "GET",
      });

      return data;
    } catch (error) {
      const isLastAttempt = attempt >= retries;
      const shouldRetry = !isLastAttempt && this.isRetryableError(error);

      if (shouldRetry) {
        logger.warn("Retrying API request", {
          url,
          attempt,
          maxRetries: retries,
          error: getErrorMessage(error),
        });

        await this.delay(retryDelay * attempt); // Exponential backoff
        return this.fetchWithRetry<T>(url, config, attempt + 1);
      }

      logger.error("API request failed", error, {
        url,
        method: config.method || "GET",
        attempts: attempt,
      });

      throw error;
    }
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    const message = getErrorMessage(error);
    
    // Retry on network errors and timeouts
    return (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("ECONNRESET") ||
      message.includes("ETIMEDOUT")
    );
  }

  /**
   * Builds full URL from relative path
   */
  private buildURL(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${this.baseURL}${path}`;
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.fetchWithRetry<T>(this.buildURL(path), {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.fetchWithRetry<T>(this.buildURL(path), {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.fetchWithRetry<T>(this.buildURL(path), {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.fetchWithRetry<T>(this.buildURL(path), {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.fetchWithRetry<T>(this.buildURL(path), {
      ...config,
      method: "DELETE",
    });
  }
}

// Export singleton instance for internal API calls
export const apiClient = new ApiClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});

// Export class for creating custom clients
export { ApiClient };
