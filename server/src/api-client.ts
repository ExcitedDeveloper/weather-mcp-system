import { REQUEST_CONFIG } from './config.js'
import { type ApiRequestOptions } from './types.js'
import { WeatherMcpError, createError, wrapError, isRetryableError } from './errors.js'

export class ApiError extends Error {
  public readonly status?: number
  public readonly statusText?: string
  public readonly url: string

  constructor(message: string, url: string, status?: number, statusText?: string) {
    super(message)
    this.name = 'ApiError'
    this.url = url
    this.status = status
    this.statusText = statusText
  }
}

export class NetworkError extends Error {
  public readonly url: string
  public readonly cause?: Error

  constructor(message: string, url: string, cause?: Error) {
    super(message)
    this.name = 'NetworkError'
    this.url = url
    this.cause = cause
  }
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryableStatus: Set<number>
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatus: new Set([408, 429, 500, 502, 503, 504])
}

export interface ApiClient {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>
}

export class HttpApiClient implements ApiClient {
  private readonly defaultOptions: ApiRequestOptions
  private readonly retryConfig: RetryConfig

  constructor(options: ApiRequestOptions = {}, retryConfig: Partial<RetryConfig> = {}) {
    this.defaultOptions = {
      headers: { ...REQUEST_CONFIG.DEFAULT_HEADERS },
      timeout: REQUEST_CONFIG.DEFAULT_TIMEOUT,
      ...options,
    }
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  }

  async get<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await this.makeRequest<T>(url, mergedOptions)
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Don't retry on the last attempt or if error is not retryable
        if (attempt === this.retryConfig.maxRetries || !this.shouldRetry(error)) {
          break
        }

        // Wait before retrying with exponential backoff
        const delay = this.calculateDelay(attempt)
        await this.delay(delay)
      }
    }

    // Convert to structured error
    throw this.convertToStructuredError(lastError!, url)
  }

  private async makeRequest<T>(url: string, options: ApiRequestOptions): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, options.timeout)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await this.safeGetResponseText(response)
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
          url,
          response.status,
          response.statusText
        )
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on specific HTTP status codes
      return error.status ? this.retryConfig.retryableStatus.has(error.status) : false
    }

    if (error instanceof NetworkError || (error instanceof Error && error.name === 'AbortError')) {
      // Retry on network errors and timeouts
      return true
    }

    return false
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.retryConfig.baseDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 0.1 * baseDelay // Add up to 10% jitter
    return Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private convertToStructuredError(error: Error, url: string): WeatherMcpError {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return createError('API_RATE_LIMIT', { url, status: error.status }, error)
      } else if (error.status && error.status >= 500) {
        return createError('API_SERVICE_ERROR', { url, status: error.status }, error)
      } else {
        return createError('API_SERVICE_ERROR', { url, status: error.status }, error)
      }
    }

    if (error instanceof NetworkError || error.name === 'AbortError') {
      if (error.message.includes('timeout')) {
        return createError('NETWORK_TIMEOUT', { url }, error)
      } else {
        return createError('NETWORK_UNAVAILABLE', { url }, error)
      }
    }

    return wrapError(error, 'SYSTEM_ERROR')
  }

  private async safeGetResponseText(response: Response): Promise<string | null> {
    try {
      return await response.text()
    } catch {
      return null
    }
  }
}

export const apiClient = new HttpApiClient()