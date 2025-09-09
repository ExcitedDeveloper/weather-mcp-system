import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import {
  handleGetCurrentWeather,
  handleGetWeatherForecast,
  handleGetCurrentWeatherByLocation,
  handleGetWeatherForecastByLocation,
  handleSearchLocations,
  handleGetWeatherAlerts,
} from '../../src/tools/index.js'
import {
  mockWeatherResponse,
  mockGeocodingResponse,
  mockEmptyGeocodingResponse,
  mockNWSAlertsWithWarnings,
  mockNWSAlertsEmpty,
} from '../__mocks__/api-responses.js'

// Mock the apiClient module
vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '../../src/api-client.js'
const mockApiClient = vi.mocked(apiClient)

describe('tools integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('weather tools with coordinates', () => {
    describe('handleGetCurrentWeather', () => {
      it('handles valid coordinate input and returns formatted weather', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetCurrentWeather({
          latitude: 40.7128,
          longitude: -74.006,
          temperature_unit: 'fahrenheit',
        })

        expect(result.content).toHaveLength(1)
        expect(result.content[0].type).toBe('text')
        expect(result.content[0].text).toContain('Current Weather Report')
        expect(result.content[0].text).toContain('69°F')
      })

      it('handles string coordinate input', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetCurrentWeather({
          latitude: '40.7128',
          longitude: '-74.006',
        })

        expect(result.content[0].text).toContain('Current Weather Report')
      })

      it('throws validation error for invalid coordinates', async () => {
        await expect(handleGetCurrentWeather({
          latitude: 'invalid',
          longitude: -74.006,
        })).rejects.toThrow('Invalid latitude')
      })

      it('throws validation error for out-of-bounds coordinates', async () => {
        await expect(handleGetCurrentWeather({
          latitude: 91,
          longitude: -74.006,
        })).rejects.toThrow('Latitude must be between -90 and 90')
      })
    })

    describe('handleGetWeatherForecast', () => {
      it('handles valid input and returns formatted forecast', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetWeatherForecast({
          latitude: 40.7128,
          longitude: -74.006,
          temperature_unit: 'celsius',
        })

        expect(result.content[0].text).toContain('3-Day Weather Forecast')
        expect(result.content[0].text).toContain('20.5°C')
      })
    })
  })

  describe('weather tools with location names', () => {
    describe('handleGetCurrentWeatherByLocation', () => {
      it('handles location name and returns weather with location info', async () => {
        // First call for geocoding
        mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)
        // Second call for weather data
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetCurrentWeatherByLocation({
          location: 'New York',
          temperature_unit: 'fahrenheit',
        })

        expect(result.content[0].text).toContain('New York, United States')
        expect(result.content[0].text).toContain('📐 Coordinates: 40.7128°, -74.006°')
      })

      it('handles coordinate string input', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetCurrentWeatherByLocation({
          location: '40.7128,-74.006',
        })

        expect(result.content[0].text).toContain('40.7128°, -74.006°')
        expect(result.content[0].text).not.toContain('📐 Coordinates:')
      })

      it('handles US city/state format', async () => {
        const miamiResponse = {
          results: [{
            name: 'Miami',
            latitude: 25.7617,
            longitude: -80.1918,
            country: 'United States',
            country_code: 'US',
            admin1: 'Florida',
          }],
          generationtime_ms: 1.5,
        }

        mockApiClient.get.mockResolvedValueOnce(miamiResponse)
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetCurrentWeatherByLocation({
          location: 'Miami, FL',
        })

        expect(result.content[0].text).toContain('Miami, Florida, United States')
      })

      it('throws error for invalid location', async () => {
        await expect(handleGetCurrentWeatherByLocation({
          location: '',
        })).rejects.toThrow('Location must be a non-empty string')
      })

      it('throws error when location not found', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockEmptyGeocodingResponse)

        await expect(handleGetCurrentWeatherByLocation({
          location: 'Nonexistent Location',
        })).rejects.toThrow('No locations found')
      })
    })

    describe('handleGetWeatherForecastByLocation', () => {
      it('handles location name and returns forecast', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)
        mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

        const result = await handleGetWeatherForecastByLocation({
          location: 'New York',
        })

        expect(result.content[0].text).toContain('3-Day Weather Forecast')
        expect(result.content[0].text).toContain('New York, United States')
      })
    })
  })

  describe('search tools', () => {
    describe('handleSearchLocations', () => {
      it('searches for locations and returns formatted results', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockGeocodingResponse)

        const result = await handleSearchLocations({
          query: 'New York',
        })

        expect(result.content[0].text).toContain('Location Search Results')
        expect(result.content[0].text).toContain('Found 2 location(s):')
        expect(result.content[0].text).toContain('1. 📍 New York, United States')
      })

      it('throws error for empty query', async () => {
        await expect(handleSearchLocations({
          query: '',
        })).rejects.toThrow('Location must be a non-empty string')
      })

      it('throws error when no results found', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockEmptyGeocodingResponse)

        await expect(handleSearchLocations({
          query: 'Nonexistent',
        })).rejects.toThrow('No locations found')
      })
    })
  })

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('API request failed'))

      await expect(handleGetCurrentWeather({
        latitude: 40.7128,
        longitude: -74.006,
      })).rejects.toThrow('API request failed')
    })

    it('handles network timeouts', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(handleSearchLocations({
        query: 'Test Location',
      })).rejects.toThrow('Request timeout')
    })
  })

  describe('temperature unit handling', () => {
    it('defaults to fahrenheit when temperature_unit not provided', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await handleGetCurrentWeather({
        latitude: 40.7128,
        longitude: -74.006,
      })

      expect(result.content[0].text).toContain('°F')
    })

    it('validates temperature units', async () => {
      await expect(handleGetCurrentWeather({
        latitude: 40.7128,
        longitude: -74.006,
        temperature_unit: 'kelvin' as any,
      })).rejects.toThrow("Temperature unit must be 'fahrenheit' or 'celsius'")
    })
  })

  describe('coordinate edge cases', () => {
    it('handles boundary coordinates', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await handleGetCurrentWeather({
        latitude: 90,
        longitude: 180,
      })

      expect(result.content[0].text).toContain('Current Weather Report')
    })

    it('handles negative coordinates', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockWeatherResponse)

      const result = await handleGetCurrentWeather({
        latitude: -90,
        longitude: -180,
      })

      expect(result.content[0].text).toContain('Current Weather Report')
    })
  })

  describe('weather alerts integration', () => {
    // Mock geocoding for alerts tests
    vi.mock('../../src/geocoding.js', () => ({
      parseLocationInput: vi.fn(),
    }))

    beforeEach(async () => {
      const { parseLocationInput } = await import('../../src/geocoding.js')
      const mockParseLocationInput = vi.mocked(parseLocationInput)
      mockParseLocationInput.mockResolvedValue({
        latitude: 25.7617,
        longitude: -80.1918,
        locationName: 'Miami, FL'
      })
    })

    describe('handleGetWeatherAlerts', () => {
      it('handles active alerts and returns formatted output', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockNWSAlertsWithWarnings)

        const result = await handleGetWeatherAlerts({
          location: 'Miami, FL',
        })

        expect(result.content).toHaveLength(1)
        expect(result.content[0].type).toBe('text')
        expect(result.content[0].text).toContain('🚨 **ACTIVE WEATHER ALERTS**')
        expect(result.content[0].text).toContain('📍 Location: Miami, FL')
        expect(result.content[0].text).toContain('📊 Active Alerts: 2')
        expect(result.content[0].text).toContain('SEVERE THUNDERSTORM WARNING')
        expect(result.content[0].text).toContain('RIP CURRENT STATEMENT')
      })

      it('handles no active alerts', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockNWSAlertsEmpty)

        const result = await handleGetWeatherAlerts({
          location: 'New York, NY',
        })

        expect(result.content[0].text).toContain('✅ **No Active Weather Alerts**')
        expect(result.content[0].text).toContain('No weather alerts, warnings, or advisories are currently in effect')
      })

      it('handles coordinate input format', async () => {
        mockApiClient.get.mockResolvedValueOnce(mockNWSAlertsEmpty)

        const result = await handleGetWeatherAlerts({
          location: '25.7617,-80.1918',
        })

        expect(result.content[0].type).toBe('text')
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('point=25.7617,-80.1918'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Accept': 'application/ld+json'
            })
          })
        )
      })
    })
  })
})