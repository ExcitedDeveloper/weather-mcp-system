import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCurrentWeather,
  getWeatherForecast,
  getCurrentWeatherByLocation,
  getWeatherForecastByLocation,
} from '../../src/weather.js'
import { mockWeatherResponse } from '../__mocks__/api-responses.js'
import { createMockFetch } from '../utils/test-helpers.js'

// Mock the apiClient module
vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

// Mock the geocoding module
vi.mock('../../src/geocoding.js', () => ({
  parseLocationInput: vi.fn(),
}))

import { apiClient } from '../../src/api-client.js'
import { parseLocationInput } from '../../src/geocoding.js'

const mockApiClient = vi.mocked(apiClient)
const mockParseLocationInput = vi.mocked(parseLocationInput)

describe('weather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCurrentWeather', () => {
    it('fetches and formats current weather data', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getCurrentWeather(40.7128, -74.006, 'fahrenheit')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('api.open-meteo.com/v1/forecast')
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/latitude=40\.7128/)
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/longitude=-74\.006/)
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.not.stringMatching(/daily=/)
      )

      expect(result).toContain('Current Weather Report')
      expect(result).toContain('69°F') // Converted from 20.5°C
    })

    it('defaults to fahrenheit when unit not specified', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getCurrentWeather(40.7128, -74.006)

      expect(result).toContain('°F')
    })

    it('formats temperature in celsius when requested', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getCurrentWeather(40.7128, -74.006, 'celsius')

      expect(result).toContain('20.5°C')
    })
  })

  describe('getWeatherForecast', () => {
    it('fetches and formats forecast data', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getWeatherForecast(40.7128, -74.006, 'fahrenheit')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/daily=weather_code%2Ctemperature_2m_max%2Ctemperature_2m_min%2Cprecipitation_sum/)
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/forecast_days=3/)
      )

      expect(result).toContain('3-Day Weather Forecast')
      expect(result).toContain('📅 Today')
      expect(result).toContain('📅 Tomorrow')
    })

    it('includes current temperature in forecast', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getWeatherForecast(40.7128, -74.006, 'celsius')

      expect(result).toContain('Current: 20.5°C')
    })
  })

  describe('getCurrentWeatherByLocation', () => {
    it('resolves location and fetches weather data', async () => {
      mockParseLocationInput.mockResolvedValueOnce({
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York, NY, US',
      })
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getCurrentWeatherByLocation('New York, NY', 'fahrenheit')

      expect(mockParseLocationInput).toHaveBeenCalledWith('New York, NY')
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/latitude=40\.7128/)
      )
      expect(result).toContain('📍 Location: New York, NY, US')
      expect(result).toContain('📐 Coordinates: 40.7128°, -74.006°')
    })

    it('handles coordinate input directly', async () => {
      mockParseLocationInput.mockResolvedValueOnce({
        latitude: 40.7128,
        longitude: -74.006,
      })
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getCurrentWeatherByLocation('40.7128,-74.006')

      expect(result).toContain('📍 Location: 40.7128°, -74.006°')
      expect(result).not.toContain('📐 Coordinates:')
    })
  })

  describe('getWeatherForecastByLocation', () => {
    it('resolves location and fetches forecast data', async () => {
      mockParseLocationInput.mockResolvedValueOnce({
        latitude: 25.7617,
        longitude: -80.1918,
        locationName: 'Miami, FL, US',
      })
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await getWeatherForecastByLocation('Miami, FL', 'celsius')

      expect(mockParseLocationInput).toHaveBeenCalledWith('Miami, FL')
      expect(result).toContain('📍 Location: Miami, FL, US')
      expect(result).toContain('3-Day Weather Forecast')
    })

    it('passes through API errors', async () => {
      mockParseLocationInput.mockResolvedValueOnce({
        latitude: 40.7128,
        longitude: -74.006,
      })
      mockApiClient.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(getWeatherForecastByLocation('New York'))
        .rejects.toThrow('API Error')
    })

    it('passes through geocoding errors', async () => {
      mockParseLocationInput.mockRejectedValueOnce(new Error('Location not found'))

      await expect(getCurrentWeatherByLocation('Invalid Location'))
        .rejects.toThrow('Location not found')
    })
  })

  describe('URL building', () => {
    it('builds correct URLs for current weather', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      await getCurrentWeather(40.7128, -74.006)

      const calledUrl = mockApiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('latitude=40.7128')
      expect(calledUrl).toContain('longitude=-74.006')
      expect(calledUrl).toContain('current=temperature_2m%2Crelative_humidity_2m%2Capparent_temperature%2Cweather_code%2Cwind_speed_10m%2Cwind_direction_10m%2Cprecipitation')
      expect(calledUrl).toContain('timezone=auto')
      expect(calledUrl).not.toContain('daily=')
    })

    it('builds correct URLs for forecast', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      await getWeatherForecast(40.7128, -74.006)

      const calledUrl = mockApiClient.get.mock.calls[0][0]
      expect(calledUrl).toContain('daily=weather_code%2Ctemperature_2m_max%2Ctemperature_2m_min%2Cprecipitation_sum')
      expect(calledUrl).toContain('forecast_days=3')
    })
  })
})