import { type WeatherApiResponse, type GeocodingApiResponse } from '../../src/types.js'

export const mockWeatherResponse: WeatherApiResponse = {
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
  current: {
    time: '2024-01-15T12:00:00Z',
    temperature_2m: 20.5,
    relative_humidity_2m: 65,
    apparent_temperature: 18.2,
    weather_code: 1,
    wind_speed_10m: 15.5,
    wind_direction_10m: 225,
    precipitation: 0.0,
  },
  current_units: {
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    wind_speed_10m: 'km/h',
    precipitation: 'mm',
  },
  daily: {
    time: ['2024-01-15', '2024-01-16', '2024-01-17'],
    weather_code: [1, 3, 61],
    temperature_2m_max: [22.0, 18.5, 15.2],
    temperature_2m_min: [18.0, 12.3, 8.7],
    precipitation_sum: [0.0, 0.2, 5.8],
  },
  daily_units: {
    temperature_2m_max: '°C',
    temperature_2m_min: '°C',
    precipitation_sum: 'mm',
  },
}

export const mockGeocodingResponse: GeocodingApiResponse = {
  results: [
    {
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.006,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      admin2: 'New York County',
      timezone: 'America/New_York',
      population: 8175133,
      elevation: 10,
      feature_code: 'PPLC',
    },
    {
      name: 'New York Mills',
      latitude: 43.1051,
      longitude: -75.2913,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      admin2: 'Oneida County',
      population: 3327,
    },
  ],
  generationtime_ms: 2.5,
}

export const mockMiamiGeocodingResponse: GeocodingApiResponse = {
  results: [
    {
      name: 'Miami',
      latitude: 25.7617,
      longitude: -80.1918,
      country: 'United States',
      country_code: 'US',
      admin1: 'Florida',
      admin2: 'Miami-Dade County',
      timezone: 'America/New_York',
      population: 442241,
      feature_code: 'PPL',
    },
  ],
  generationtime_ms: 1.8,
}

export const mockEmptyGeocodingResponse: GeocodingApiResponse = {
  results: [],
  generationtime_ms: 1.2,
}