export const API_CONFIG = {
  WEATHER: {
    BASE_URL: 'https://api.open-meteo.com/v1',
    ENDPOINTS: {
      FORECAST: '/forecast',
    },
  },
  GEOCODING: {
    BASE_URL: 'https://geocoding-api.open-meteo.com/v1',
    ENDPOINTS: {
      SEARCH: '/search',
    },
  },
} as const

export const REQUEST_CONFIG = {
  USER_AGENT: 'weather-mcp-server/1.0',
  DEFAULT_TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'User-Agent': 'weather-mcp-server/1.0',
    'Accept': 'application/json',
  },
} as const

export const VALIDATION_CONFIG = {
  COORDINATES: {
    LATITUDE: { MIN: -90, MAX: 90 },
    LONGITUDE: { MIN: -180, MAX: 180 },
  },
  LOCATION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  FORECAST_DAYS: 3,
} as const

export const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
} as const