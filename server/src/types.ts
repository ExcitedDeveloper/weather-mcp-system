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

export type AlertSeverity = 'Minor' | 'Moderate' | 'Severe' | 'Extreme'
export type AlertUrgency = 'Immediate' | 'Expected' | 'Future' | 'Past'
export type AlertCertainty = 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown'

export interface WeatherAlert {
  id: string
  title: string
  description: string
  event: string
  severity: AlertSeverity
  urgency: AlertUrgency
  certainty: AlertCertainty
  headline?: string
  areaDesc: string
  effective: string
  expires: string
  sent: string
  instruction?: string
  response?: string
  category: string
  senderName?: string
}

export interface NWSAlertFeature {
  id: string
  type: 'Feature'
  geometry: {
    type: string
    coordinates?: number[][][]
  } | null
  properties: {
    '@id': string
    '@type': string
    id: string
    areaDesc: string
    geocode: {
      SAME: string[]
      UGC: string[]
    }
    affectedZones: string[]
    references: Array<{
      '@id': string
      identifier: string
      sender: string
      sent: string
    }>
    sent: string
    effective: string
    onset: string
    expires: string
    ends: string
    status: string
    messageType: string
    category: string
    severity: AlertSeverity
    certainty: AlertCertainty
    urgency: AlertUrgency
    event: string
    sender: string
    senderName: string
    headline: string
    description: string
    instruction: string
    response: string
    parameters: Record<string, any>
  }
}

export interface NWSAlertsResponse {
  '@context': any
  type: 'FeatureCollection'
  features: NWSAlertFeature[]
  title: string
  updated: string
}