import { REQUEST_CONFIG } from './config.js'
import { type ApiRequestOptions } from './types.js'

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

export interface ApiClient {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>
}

export class HttpApiClient implements ApiClient {
  private readonly defaultOptions: ApiRequestOptions

  constructor(options: ApiRequestOptions = {}) {
    this.defaultOptions = {
      headers: { ...REQUEST_CONFIG.DEFAULT_HEADERS },
      timeout: REQUEST_CONFIG.DEFAULT_TIMEOUT,
      ...options,
    }
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

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, mergedOptions.timeout)

      const response = await fetch(url, {
        method: 'GET',
        headers: mergedOptions.headers,
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
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError(`Request timeout after ${mergedOptions.timeout}ms`, url, error)
        }
        
        throw new NetworkError(
          `Network request failed: ${error.message}`,
          url,
          error
        )
      }

      throw new NetworkError('Unknown network error occurred', url)
    }
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