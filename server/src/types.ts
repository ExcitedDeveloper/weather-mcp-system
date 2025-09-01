export type TemperatureUnit = 'fahrenheit' | 'celsius'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationResult {
  latitude: number
  longitude: number
  locationName?: string
}

export interface WeatherApiResponse {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    precipitation: number
  }
  current_units: {
    temperature_2m: string
    relative_humidity_2m: string
    apparent_temperature: string
    wind_speed_10m: string
    precipitation: string
  }
  daily?: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
  daily_units?: {
    temperature_2m_max: string
    temperature_2m_min: string
    precipitation_sum: string
  }
}

export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
  timezone?: string
  population?: number
  elevation?: number
  feature_code?: string
}

export interface GeocodingApiResponse {
  results?: GeocodingResult[]
  generationtime_ms: number
}

export interface ToolInput {
  latitude?: number
  longitude?: number
  location?: string
  temperature_unit?: TemperatureUnit
  query?: string
}

export interface ValidationError extends Error {
  field?: string
  value?: unknown
}

export interface ApiRequestOptions {
  headers?: Record<string, string>
  timeout?: number
}