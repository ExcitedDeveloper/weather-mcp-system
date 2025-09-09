/**
 * Comprehensive error handling system for the weather MCP server
 * Provides structured error types, user-friendly messages, and actionable guidance
 */

export enum ErrorSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  API = 'api',
  SYSTEM = 'system',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  LOCATION = 'location',
  WEATHER = 'weather'
}

export interface ErrorContext {
  severity: ErrorSeverity
  category: ErrorCategory
  userMessage: string
  technicalMessage: string
  suggestions: string[]
  retryable: boolean
  errorCode?: string
  details?: Record<string, unknown>
}

export class WeatherMcpError extends Error {
  public readonly context: ErrorContext
  public readonly timestamp: Date
  public readonly originalError?: Error

  constructor(context: ErrorContext, originalError?: Error) {
    super(context.technicalMessage)
    this.name = 'WeatherMcpError'
    this.context = context
    this.timestamp = new Date()
    this.originalError = originalError
    
    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WeatherMcpError)
    }
  }

  /**
   * Get user-friendly error message with suggestions
   */
  getUserMessage(): string {
    const suggestions = this.context.suggestions.length > 0 
      ? `\n\nSuggestions:\n• ${this.context.suggestions.join('\n• ')}`
      : ''
    
    return `${this.context.userMessage}${suggestions}`
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.context.retryable
  }

  /**
   * Get structured error data for logging
   */
  toLogData(): Record<string, unknown> {
    return {
      timestamp: this.timestamp.toISOString(),
      severity: this.context.severity,
      category: this.context.category,
      errorCode: this.context.errorCode,
      userMessage: this.context.userMessage,
      technicalMessage: this.context.technicalMessage,
      retryable: this.context.retryable,
      suggestions: this.context.suggestions,
      details: this.context.details,
      originalError: this.originalError?.message,
      stack: this.stack
    }
  }
}

/**
 * Predefined error contexts for common scenarios
 */
export const ERROR_CONTEXTS = {
  // Network Errors
  NETWORK_TIMEOUT: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.NETWORK,
    userMessage: "The weather service is taking longer than expected to respond.",
    technicalMessage: "Request timeout",
    suggestions: [
      "Check your internet connection",
      "Try again in a few moments",
      "The weather service may be experiencing high load"
    ],
    retryable: true,
    errorCode: "NETWORK_TIMEOUT"
  } as ErrorContext,

  NETWORK_UNAVAILABLE: {
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.NETWORK,
    userMessage: "Unable to connect to the weather service.",
    technicalMessage: "Network request failed",
    suggestions: [
      "Check your internet connection",
      "Verify that you can access other websites",
      "Try again later as the service may be temporarily unavailable"
    ],
    retryable: true,
    errorCode: "NETWORK_UNAVAILABLE"
  } as ErrorContext,

  // API Errors
  API_RATE_LIMIT: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.RATE_LIMIT,
    userMessage: "You've made too many requests. Please wait a moment before trying again.",
    technicalMessage: "API rate limit exceeded",
    suggestions: [
      "Wait 60 seconds before making another request",
      "Consider reducing the frequency of your requests"
    ],
    retryable: true,
    errorCode: "API_RATE_LIMIT"
  } as ErrorContext,

  API_SERVICE_ERROR: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.API,
    userMessage: "The weather service is experiencing technical difficulties.",
    technicalMessage: "API service error",
    suggestions: [
      "Try again in a few minutes",
      "The service should be restored shortly"
    ],
    retryable: true,
    errorCode: "API_SERVICE_ERROR"
  } as ErrorContext,

  // Location Errors
  LOCATION_NOT_FOUND: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.LOCATION,
    userMessage: "We couldn't find a location matching your search.",
    technicalMessage: "Location not found",
    suggestions: [
      "Check the spelling of the location name",
      "Try including the state or country (e.g., 'Paris, France' or 'Paris, TX')",
      "Use coordinates if you know them (e.g., '40.7128,-74.0060')",
      "Use the search_locations tool to see available options"
    ],
    retryable: false,
    errorCode: "LOCATION_NOT_FOUND"
  } as ErrorContext,

  LOCATION_AMBIGUOUS: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.LOCATION,
    userMessage: "Multiple locations match your search. Please be more specific.",
    technicalMessage: "Ambiguous location query",
    suggestions: [
      "Include the state or country in your search",
      "Use the search_locations tool to see all matching locations",
      "Choose the most specific location name"
    ],
    retryable: false,
    errorCode: "LOCATION_AMBIGUOUS"
  } as ErrorContext,

  // Validation Errors
  INVALID_COORDINATES: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.VALIDATION,
    userMessage: "The coordinates you provided are not valid.",
    technicalMessage: "Invalid coordinate values",
    suggestions: [
      "Latitude must be between -90 and 90",
      "Longitude must be between -180 and 180",
      "Use decimal format (e.g., '40.7128,-74.0060')",
      "Double-check your coordinate values"
    ],
    retryable: false,
    errorCode: "INVALID_COORDINATES"
  } as ErrorContext,

  INVALID_LOCATION_FORMAT: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.VALIDATION,
    userMessage: "The location format is not recognized.",
    technicalMessage: "Invalid location format",
    suggestions: [
      "Use city names (e.g., 'New York')",
      "Include state for US cities (e.g., 'Miami, FL')",
      "Include country for international cities (e.g., 'London, UK')",
      "Use coordinates in 'latitude,longitude' format if needed"
    ],
    retryable: false,
    errorCode: "INVALID_LOCATION_FORMAT"
  } as ErrorContext,

  INVALID_TEMPERATURE_UNIT: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.VALIDATION,
    userMessage: "The temperature unit you specified is not supported.",
    technicalMessage: "Invalid temperature unit",
    suggestions: [
      "Use 'fahrenheit' or 'celsius'",
      "Leave blank to use Fahrenheit (default)"
    ],
    retryable: false,
    errorCode: "INVALID_TEMPERATURE_UNIT"
  } as ErrorContext,

  // Weather Service Errors
  WEATHER_DATA_UNAVAILABLE: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.WEATHER,
    userMessage: "Weather data is temporarily unavailable for this location.",
    technicalMessage: "Weather service returned no data",
    suggestions: [
      "Try again in a few minutes",
      "Verify the location exists and has weather coverage",
      "Try a nearby major city"
    ],
    retryable: true,
    errorCode: "WEATHER_DATA_UNAVAILABLE"
  } as ErrorContext,

  // System Errors
  SYSTEM_ERROR: {
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.SYSTEM,
    userMessage: "An unexpected error occurred. Please try again.",
    technicalMessage: "Internal system error",
    suggestions: [
      "Try your request again",
      "If the problem persists, the issue has been logged for investigation"
    ],
    retryable: true,
    errorCode: "SYSTEM_ERROR"
  } as ErrorContext
} as const

/**
 * Create a WeatherMcpError from a predefined context
 */
export function createError(contextKey: keyof typeof ERROR_CONTEXTS, details?: Record<string, unknown>, originalError?: Error): WeatherMcpError {
  const context = { ...ERROR_CONTEXTS[contextKey] }
  if (details) {
    context.details = details
  }
  return new WeatherMcpError(context, originalError)
}

/**
 * Create a custom error with full context
 */
export function createCustomError(context: ErrorContext, originalError?: Error): WeatherMcpError {
  return new WeatherMcpError(context, originalError)
}

/**
 * Wrap an unknown error into our structured error system
 */
export function wrapError(error: unknown, contextKey?: keyof typeof ERROR_CONTEXTS): WeatherMcpError {
  if (error instanceof WeatherMcpError) {
    return error
  }

  const originalError = error instanceof Error ? error : new Error(String(error))
  const context = contextKey ? ERROR_CONTEXTS[contextKey] : ERROR_CONTEXTS.SYSTEM_ERROR

  return new WeatherMcpError({
    ...context,
    technicalMessage: originalError.message
  }, originalError)
}

/**
 * Check if an error indicates a network/API issue that might be retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof WeatherMcpError) {
    return error.isRetryable()
  }

  // Check for common retryable error indicators
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('timeout') ||
           message.includes('network') ||
           message.includes('connection') ||
           message.includes('fetch')
  }

  return false
}